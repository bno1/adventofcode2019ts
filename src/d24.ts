import {Array2} from "./array2";
import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";

type Coord = [number, number];
type Coords = Coord[];

type Area = Array2<Uint8Array>;
type Population = Array2<Uint8Array>;

function buildNeighnourLists(
  width: number, height: number,
): Array<[Coords, Coords, Coords]> {
  const neighbourMasks: Array<[Coords, Coords, Coords]> = [];
  const cx = Math.trunc(width / 2);
  const cy = Math.trunc(height / 2);

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const upper: Coords = [];
      const middle: Coords = [];
      const lower: Coords = [];

      if (j === cx && i === cy) {
        neighbourMasks.push([[], [], []]);
        continue;
      }

      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const x = j + dx;
        const y = i + dy;

        if (x < 0) {
          upper.push([cx - 1, cy]);
        } else if (x >= width) {
          upper.push([cx + 1, cy]);
        } else if (y < 0) {
          upper.push([cx, cy - 1]);
        } else if (y >= height) {
          upper.push([cx, cy + 1]);
        } else if (x === cx && y === cy) {
          if (j < cx) {
            for (let k = 0; k < height; k++) {
              lower.push([0, k]);
            }
          } else if (j > cx) {
            for (let k = 0; k < height; k++) {
              lower.push([width - 1, k]);
            }
          } else if (i < cy) {
            for (let k = 0; k < width; k++) {
              lower.push([k, 0]);
            }
          } else if (i > cy) {
            for (let k = 0; k < width; k++) {
              lower.push([k, height - 1]);
            }
          }
        } else {
          middle.push([x, y]);
        }
      }

      neighbourMasks.push([upper, middle, lower]);
    }
  }

  return neighbourMasks;
}

function parseArea(input: string): Area {
  const cells = input.split("\n").filter((l) => l).map((l) => l.split(""));
  const area = new Array2(cells[0].length, cells.length, Uint8Array);
  area.fill(0);

  for (let i = 0; i < area.height; i++) {
    for (let j = 0; j < area.width; j++) {
      switch (cells[i][j]) {
        case ".":
          area.write(j, i, 0);
          break;

        case "#":
          area.write(j, i, 1);
          break;

        default:
          throw new Error(`Invalid cell: ${cells[i][j]}`);
      }
    }
  }

  return area;
}

function* iterArea(start: Area) {
  const area = start.clone();
  const pop = new Array2(area.width, area.height, Uint8Array);

  for (;;) {
    yield area;

    pop.fill(0);
    for (let i = 0; i < area.height; i++) {
      for (let j = 0; j < area.width; j++) {
        if (!area.read(j, i)) {
          continue;
        }

        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const x = j + dx;
          const y = i + dy;

          if (!pop.boundCheck(x, y)) {
            continue;
          }

          pop.modify(x, y, (v) => v + 1);
        }
      }
    }

    for (let i = 0; i < area.height; i++) {
      for (let j = 0; j < area.width; j++) {
        const p = pop.read(j, i);

        area.modify(j, i, (v) => (p === 1 || (!v && p === 2)) ? 1 : 0);
      }
    }
  }
}

function areaToString(area: Area): string[] {
  const s = [];

  for (let i = 0; i < area.height; i++) {
    const row = [];

    for (let j = 0; j < area.width; j++) {
      row.push(area.read(j, i) ? "#" : ".");
    }

    s.push(row.join(""));
  }

  return s;
}

function biodiversity(area: Area): number {
  let sum = 0;
  let b = 1;

  for (let i = 0; i < area.height; i++) {
    for (let j = 0; j < area.width; j++) {
      if (area.read(j, i)) {
        sum += b;
      }

      b *= 2;
    }
  }

  return sum;
}

function recursiveIter(start: Area, cnt: number): number {
  const levels: Array<[Area, Population]> = [
    [start.clone(), new Array2(start.width, start.height, Uint8Array)],
  ];
  const neighbours = buildNeighnourLists(start.width, start.height);
  const cx = Math.trunc(start.width / 2);
  const cy = Math.trunc(start.height / 2);

  function newLevel(): [Area, Population] {
    const area = new Array2(start.width, start.height, Uint8Array);
    const pop = new Array2(start.width, start.height, Uint8Array);
    return [area, pop];
  }

  while (cnt > 0) {
    cnt--;

    if (levels[0][0].find((v) => v !== 0)) {
      levels.unshift(newLevel());
    }

    if (levels[levels.length - 1][0].find((v) => v !== 0)) {
      levels.push(newLevel());
    }

    for (let lvl = 0; lvl < levels.length; lvl++) {
      const [area, pop] = levels[lvl];

      for (let i = 0; i < start.height; i++) {
        for (let j = 0; j < start.width; j++) {
          if (j === cx && i === cy) {
            continue;
          }

          let p = 0;
          const [lwr, mid, upr] = neighbours[j + i * start.width];
          for (const [x, y] of mid) {
            p += area.read(x, y) ? 1 : 0;
          }

          if (lvl > 0) {
            const larea = levels[lvl - 1][0];
            for (const [x, y] of lwr) {
              p += larea.read(x, y) ? 1 : 0;
            }
          }

          if (lvl < levels.length - 1) {
            const uarea = levels[lvl + 1][0];
            for (const [x, y] of upr) {
              p += uarea.read(x, y) ? 1 : 0;
            }
          }

          pop.write(j, i, p);
        }
      }
    }

    for (const [area, pop] of levels) {
      for (let i = 0; i < start.height; i++) {
        for (let j = 0; j < start.width; j++) {
          if (j === cx && i === cy) {
            continue;
          }

          const p = pop.read(j, i);

          area.modify(j, i, (v) => (p === 1 || (!v && p === 2)) ? 1 : 0);
        }
      }
    }
  }

  let totalPop = 0;
  for (const [area] of levels) {
    for (let i = 0; i < start.height; i++) {
      for (let j = 0; j < start.width; j++) {
        if (j === cx && i === cy) {
          continue;
        }

        totalPop += area.read(j, i) ? 1 : 0;
      }
    }
  }

  return totalPop;
}

class ChallengeD24 extends ChallengeFromFile {
  private input: string | null = null;

  constructor() {
    super("d24");
  }

  public async solveFirstStar(): Promise<string> {
    const input = this.getInput();
    const memory: Set<string> = new Set();

    const start = parseArea(input);
    let firstRepeat: Area | null = null;

    for (const state of iterArea(start)) {
      const str = areaToString(state).join("\n");
      if (memory.has(str)) {
        firstRepeat = state;
        break;
      }

      memory.add(str);
    }

    if (firstRepeat === null) {
      throw new Error("Unexpected state");
    }

    return biodiversity(firstRepeat).toString();
  }

  public async solveSecondStar(): Promise<string> {
    const input = this.getInput();

    const start = parseArea(input);

    return recursiveIter(start, 200).toString();
  }

  private getInput(): string {
    if (this.input === null) {
      this.input = this.loadInputFile(1);
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD24());
