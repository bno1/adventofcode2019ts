import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";

export function computeFuelNeeded(mass: number): number {
  return Math.floor(mass / 3) - 2;
}

export function computeFuelNeeded2(mass: number): number {
  const f = computeFuelNeeded(mass);

  if (f > 0) {
    return f + computeFuelNeeded2(f);
  } else {
    return 0;
  }
}

class ChallengeD01 extends ChallengeFromFile {
  private input: number[] | null = null;

  constructor() {
    super("d01");
  }

  public solveFirstStar(): string {
    const totalFuel = this.getInput().map(computeFuelNeeded)
                                     .reduce((sum, f) => sum + f, 0);

    return totalFuel.toString();
  }

  public solveSecondStar(): string {
    const totalFuel = this.getInput().map(computeFuelNeeded2)
                                     .reduce((sum, f) => sum + f, 0);

    return totalFuel.toString();
  }

  private getInput(): number[] {
    if (this.input === null) {
      this.input = this.loadInputFile(1)
        .split(/\s+/)
        .filter((m) => m)
        .map((m) => parseInt(m, 10));
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD01());
