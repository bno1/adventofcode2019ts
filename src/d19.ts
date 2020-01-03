import {Array2} from "./array2";
import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {findMin} from "./common";
import {runIntcode} from "./intcode";

const RENDER_WIDTH = 50;
const RENDER_HEIGHT = 50;

interface IBlockCache {
  cache: Map<string, Array2<Uint8Array>>;
  program: number[];
}

function renderTractorBeam(program: number[]): Array2<Uint8Array> {
  const image = new Array2(RENDER_WIDTH, RENDER_HEIGHT, Uint8Array);

  image.fill(0);

  for (let i = 0; i < image.height; i++) {
    for (let j = 0; j < image.width; j++) {
      const output = runIntcode([...program], [j, i]);

      const pixel = output.shift();

      if (pixel === undefined) {
        throw new Error(`Empty output`);
      }

      image.write(j, i, pixel);
    }
  }

  return image;
}

const BLOCK_BITS = 8;
const BLOCK_SIZE = 1 << BLOCK_BITS;
const BLOCK_MASK = BLOCK_SIZE - 1;

function lookupBlockCache(cache: IBlockCache, x: number, y: number): number {
  const blockX = x >> BLOCK_BITS;
  const blockY = y >> BLOCK_BITS;
  const blockKey = [blockX, blockY].toString();

  let block = cache.cache.get(blockKey);
  if (block === undefined) {
    block = new Array2(BLOCK_SIZE, BLOCK_SIZE, Uint8Array);

    block.fill(0);

    cache.cache.set(blockKey, block);
  }

  const bx = x & BLOCK_MASK;
  const by = y & BLOCK_MASK;

  let v = block.read(bx, by);
  if (v === 0) {
    const output = runIntcode([...cache.program], [x, y]);
    v = 2 | (output[0] === 0 ? 0 : 1);
    block.write(bx, by, v);
  }

  return v & 1;
}

// I tried to be smart and implement a kind of newton's method or gradient
// descend to find the closest [x, y] that fits the ship, but that failed and I
// just did a greedy algorithm that steps in the direction that maximizez the
// number of tractore beam cells in the 100x100 space.
function findSpaceInTractorBeam(
  program: number[], width: number, height: number,
): [number, number] {
  const cache: IBlockCache = {
    cache: new Map(),
    program,
  };

  const buffer = new Array2(width + 2, height + 2, Uint8Array);
  const dirs: Array<[number, number]> = [
    [1, 1],
    [1, 0],
    [0, 1],
    [0, -1],
    [-1, 0],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  function evaluate(x: number, y: number): [number, number[]] {
    buffer.fill(0);

    let cnt = 0;
    const deltas = new Array(dirs.length);
    deltas.fill(0);

    for (let i = 0; i < height + 2; i++) {
      if (y + i - 1 < 0) {
        continue;
      }

      for (let j = 0; j < width + 2; j++) {
        if (x + j - 1 < 0) {
          continue;
        }

        buffer.write(j, i, lookupBlockCache(cache, x + j - 1, y + i - 1));
      }
    }

    for (let i = 1; i < height + 1; i++) {
      for (let j = 1; j < width + 1; j++) {
        cnt += buffer.read(j, i);
      }
    }

    for (let k = 0; k < dirs.length; k++) {
      const [dx, dy] = dirs[k];

      let s = -cnt;
      for (let i = 1; i < height + 1; i++) {
        for (let j = 1; j < width + 1; j++) {
          s += buffer.read(dx + j, dy + i);
        }
      }

      deltas[k] = s;
    }

    return [cnt, deltas];
  }

  const sum = width * height;

  function search(x: number, y: number): [number, number] {
    while (true) {
      const [cnt, deltas] = evaluate(x, y);

      if (cnt === sum) {
        let found = false;
        for (let k = 0; k < dirs.length; k++) {
          const [dx, dy] = dirs[k];

          if (deltas[k] === 0 && (dx <= 0 && dy <= 0)) {
            x += dx;
            y += dy;
            found = true;
            break;
          }
        }

        if (!found) {
          return [x, y];
        }
      } else {
        const [[dx, dy]] = findMin(dirs, (_, i) => -deltas[i]);
        x += dx;
        y += dy;
      }

      x = Math.max(0, x);
      y = Math.max(0, y);
    }
  }

  return search(0, 0);
}

class ChallengeD19 extends ChallengeFromFile {
  private input: number[] | null = null;

  constructor() {
    super("d19");
  }

  public async solveFirstStar(): Promise<string> {
    const input = this.getInput();
    const image = renderTractorBeam(input);

    let cnt = 0;
    image.forEach((v) => cnt += v > 0 ? 1 : 0);

    return cnt.toString();
  }

  public async solveSecondStar(): Promise<string> {
    const input = this.getInput();
    const [x, y] = findSpaceInTractorBeam(input, 100, 100);

    return (x * 10000 + y).toString();
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

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD19());
