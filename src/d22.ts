import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {BI_ONE, BI_ZERO, extendedEulerBig} from "./common";

const STAR1_CARDS = BigInt(10007);
const STAR2_CARDS = BigInt(119315717514047);
const STAR2_COUNT = BigInt(101741582076661);

type IShuffle = [bigint, bigint];

export class Ring {
  private N: bigint;

  constructor(n: bigint) {
    this.N = n;
  }

  public makeReverse(): IShuffle {
    return [this.N - BI_ONE, this.N - BI_ONE];
  }

  public makeCut(n: bigint): IShuffle {
    while (n < BI_ZERO) {
      n = n + this.N;
    }
    n = n % this.N;

    return [BI_ONE, this.N - n];
  }

  public makeDealWithIncr(n: bigint): IShuffle {
    return [n, BI_ZERO];
  }

  public composeShuffles(shuffles: IShuffle[]): IShuffle {
    let a = BI_ONE;
    let b = BI_ZERO;

    for (const [sa, sb] of shuffles) {
      b = (sa * b + sb) % this.N;
      a = (sa * a) % this.N;
    }

    return [a, b];
  }

  public inverseShuffle(shuffle: IShuffle): IShuffle {
    let [, mi] = extendedEulerBig(shuffle[0], this.N);
    mi = (this.N + mi) % this.N;

    return [mi, this.N - ((shuffle[1] * mi) % this.N)];
  }

  public parseShuffle(line: string): IShuffle {
    if (line === "deal into new stack") {
      return this.makeReverse();
    }

    let m = line.match(/cut (-?\d+)/);
    if (m !== null) {
      return this.makeCut(BigInt(m[1]));
    }

    m = line.match(/deal with increment (\d+)/);
    if (m !== null) {
      return this.makeDealWithIncr(BigInt(m[1]));
    }

    throw new Error(`Failed to parse line ${line}`);
  }

  public applyShuffle(shuffle: IShuffle, p: bigint): bigint {
    return ((shuffle[0] * p) + shuffle[1]) % this.N;
  }

  public powShuffle(shuffle: IShuffle, cnt: bigint): IShuffle {
    let [a, b] = [BI_ONE, BI_ZERO];
    let [x, y] = shuffle;

    while (cnt > 0) {
      if (cnt & BI_ONE) {
        b = (x * b + y) % this.N;
        a = (a * x) % this.N;
      }

      y = (x * y + y) % this.N;
      x = (x * x) % this.N;

      cnt = cnt >> BI_ONE;
    }

    return [a, b];
  }
}

class ChallengeD22 extends ChallengeFromFile {
  private input: string[] | null = null;

  constructor() {
    super("d22");
  }

  public async solveFirstStar(): Promise<string> {
    const ring = new Ring(STAR1_CARDS);
    const input = this.getInput().map((l) => ring.parseShuffle(l));

    return ring.applyShuffle(
      ring.composeShuffles(input), BigInt(2019),
    ).toString();
  }

  public async solveSecondStar(): Promise<string> {
    const ring = new Ring(STAR2_CARDS);
    const input = this.getInput().map((l) => ring.parseShuffle(l));

    const shuffle = ring.powShuffle(
      ring.inverseShuffle(ring.composeShuffles(input)), STAR2_COUNT,
    );

    return ring.applyShuffle(shuffle, BigInt(2020)).toString();
  }

  private getInput(): string[] {
    if (this.input === null) {
      this.input = this.loadInputFile(1)
        .split("\n")
        .filter((l) => l);
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD22());
