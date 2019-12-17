import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";


function iterate_passwords(
  state: number[], end: number, next: (n: number[]) => void,
  has_double: boolean = false, restart: boolean = false, p: number = 0): boolean
{
  if (p == state.length) {
    const n = state.reduce((n, x) => n * 10 + x, 0);

    if (n <= end) {
      next(state);
      return true;
    } else {
      return false;
    }
  }

  let k = -1;
  let i = restart ? 0 : state[p];

  if (p > 0) {
    k = state[p - 1];

    if (k > i) {
      i = k;
      restart = true;
    }
  }

  if (p == state.length - 1 && !has_double) {
    state[p] = k;
    return iterate_passwords(state, end, next, true, restart, p + 1);
  }

  while (i < 10) {
    state[p] = i;

    if (!iterate_passwords(state, end, next, has_double || k == i, restart, p + 1)) {
      return false;
    }

    i++;
    restart = true;
  }

  return true;
}

function composition(seq: number[]): number[] {
  let comp = [];

  for (let x of seq) {
    if (x in comp) {
      comp[x] += 1;
    } else {
      comp[x] = 1;
    }
  }

  return comp;
}

class ChallengeD04 extends ChallengeFromFile {
  private input_start: number[] | null = null;
  private input_end: number | null = null;

  constructor() {
    super("d04");
  }

  public solveFirstStar(): string {
    let [start, end] = this.getInput();

    let count = 0;

    iterate_passwords(start, end, (_) => {
      count += 1;
    });

    return count.toString();
  }

  public solveSecondStar(): string {
    let [start, end] = this.getInput();

    let count = 0;

    iterate_passwords(start, end, (n) => {
      const comp = composition(n);
      if (comp.indexOf(2) >= 0) {
        count += 1;
      }
    });

    return count.toString();
  }

  private getInput(): [number[], number] {
    if (this.input_start === null || this.input_end === null) {
      const match = this.loadInputFile(1).match(/(\d+)-(\d+)/);

      if (match === null) {
        throw new Error("Invalid input");
      }

      this.input_start = match[1].split('').map((v) => parseInt(v, 10));
      this.input_end = parseInt(match[2], 10);
    }

    return [[...this.input_start], this.input_end];
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD04());
