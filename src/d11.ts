import {Array2} from "./array2";
import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {startIntcode, wakeIntcode} from "./intcode";

const MAX_HULL_SIZE = 200;

function runPaintingRobot(
  program: number[], startColor: number,
): Array2<Uint8Array> {
  const hull = new Array2(MAX_HULL_SIZE, MAX_HULL_SIZE, Uint8Array);
  const state = startIntcode(program, []);
  let dx = 0;
  let dy = -1;
  let x = Math.trunc(MAX_HULL_SIZE / 2);
  let y = Math.trunc(MAX_HULL_SIZE / 2);

  hull.write(x, y, startColor & 1);

  while (!state.done) {
    if (x < 0 || y < 0 || x >= MAX_HULL_SIZE || y >= MAX_HULL_SIZE) {
      throw new Error(`Robot left hull: ${x}, ${y}`);
    }

    const input = hull.read(x, y) & 1;
    state.input.push(input);
    wakeIntcode(state);

    const color = state.output.shift();
    if (color !== undefined) {
      hull.modify(x, y, (v) => (v & (~1)) | 2 | (color & 1));
    }

    const turn = state.output.shift();
    if (turn !== undefined) {
      if (turn) {
        const temp = -dy;
        dy = dx;
        dx = temp;
      } else {
        const temp = -dx;
        dx = dy;
        dy = temp;
      }
    }

    x += dx;
    y += dy;
  }

  return hull;
}

function renderHull(hull: Array2<Uint8Array>): string[] {
  return hull.rows().map(
    (r) => Array.from(r).map((v) => [" ", "█"][v & 1]).join(""),
  );
}

function trimImage(img: string[]): string[] {
  let startRow = 0;
  let endRow = img.length;
  let startCol = Infinity;
  let endCol = 0;

  while (startRow < img.length && img[startRow].match(/^\s*$/)) {
    startRow++;
  }

  while (endRow > startRow && img[endRow - 1].match(/^\s*$/)) {
    endRow--;
  }

  img = img.slice(startRow, endRow);

  for (const row of img) {
    const m = row.match(/^(\s*).*(\s*)$/);
    if (m == null) {
      continue;
    }

    startCol = Math.min(startCol, m[1].length);
    endCol = Math.max(endCol, row.length - m[2].length);
  }

  return img.map((row) => row.slice(startCol, endCol));
}

class ChallengeD11 extends ChallengeFromFile {
  private input: number[] | null = null;

  constructor() {
    super("d11");
  }

  public async solveFirstStar(): Promise<string> {
    const input = this.getInput();
    const hull = runPaintingRobot([...input], 0);

    let count = 0;
    hull.forEach((v) => {
      if (v & 2) { count++; }
    });

    // console.log(trimImage(renderHull(hull)).join("\n"));

    return count.toString();
  }

  public async solveSecondStar(): Promise<string> {
    const input = this.getInput();
    const hull = runPaintingRobot([...input], 1);

    return "\n" + trimImage(renderHull(hull)).join("\n");
  }

  private getInput(): number[] {
    if (this.input === null) {
      this.input = this.loadInputFile(1)
        .split(",")
        .filter((m) => m)
        .map((m) => parseInt(m, 10));
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD11());
