import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";

interface IPatternGeneratorState {
  basePattern: number[];
  first: boolean;
  i: number;
  idx: number;
}

function startPattern(
  idx: number, basePattern = [0, 1, 0, -1],
): IPatternGeneratorState {
  return {
    basePattern,
    first: true,
    i: 0,
    idx,
  };
}

function nextPatternChunk(state: IPatternGeneratorState): [number, number] {
  const n = state.basePattern[state.i];
  let cnt = state.idx + 1;

  if (state.first) {
    cnt--;
    state.first = false;
  }

  state.i = (state.i + 1) % state.basePattern.length;

  return [n, cnt];
}

export function fft(input: Uint8Array, offset: number = 0): Uint8Array {
  const len = input.length;

  const output = new Uint8Array(len);

  // This is an optimization for the second star. It caches the sum of the
  // inputs for the first sequence of non-zero elements in the pattern.
  let prefixSum = 0;
  let prefixSumStart = -1;
  let prefixSumEnd = -1;

  for (let i = offset; i < len; i++) {
    let s = 0;

    let j = 0;
    const patternGen = startPattern(i);
    let atPrefix = true;

    while (j < len) {
      const [n, cnt] = nextPatternChunk(patternGen);

      if (n === 0) {
        j += cnt;
        continue;
      }

      const lim = Math.min(len, j + cnt);

      // First sequence of non-zeros
      if (atPrefix && prefixSumStart >= 0) {
        // Update the sum.
        while (prefixSumStart < j) {
          prefixSum -= n * input[prefixSumStart];
          prefixSumStart++;
        }

        while (prefixSumEnd < lim) {
          prefixSum += n * input[prefixSumEnd];
          prefixSumEnd++;
        }

        s += prefixSum;
        j = lim;

        atPrefix = false;
        continue;
      }

      const initialJ = j;

      while (j < lim) {
        s += n * input[j];
        j++;
      }

      if (atPrefix && prefixSumStart === -1) {
        prefixSum = s;
        prefixSumStart = initialJ;
        prefixSumEnd = lim;
      }

      atPrefix = false;
    }

    output[i] = Math.abs(s % 10);
  }

  return output;
}

export function expandInput(input: number[], factor: number): Uint8Array {
  const len = input.length * factor;
  const output = new Uint8Array(len);

  for (let i = 0; i < len; i += input.length) {
    for (let j = 0; j < input.length; j++) {
      output[i + j] = input[j];
    }
  }

  return output;
}

class ChallengeD16 extends ChallengeFromFile {
  private input: number[] | null = null;

  constructor() {
    super("d16");
  }

  public async solveFirstStar(): Promise<string> {
    let input = Uint8Array.from(this.getInput());

    for (let i = 0; i < 100; i++) {
      input = fft(input);
    }

    return input.slice(0, 8).join("");
  }

  public async solveSecondStar(): Promise<string> {
    const input = this.getInput();
    let state = expandInput(input, 10000);
    const offset = input.slice(0, 7).reduce((s, v) => s * 10 + v, 0);

    for (let i = 0; i < 100; i++) {
      state = fft(state, offset);
    }

    return state.slice(offset, offset + 8).join("");
  }

  private getInput(): number[] {
    if (this.input === null) {
      this.input = this.loadInputFile(1)
        .split("")
        .filter((m) => m >= "0" && m <= "9")
        .map((m) => parseInt(m, 10));
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD16());
