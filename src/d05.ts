import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {runIntcode} from "./intcode";


class ChallengeD05 extends ChallengeFromFile {
  private input: number[] | null = null;

  constructor() {
    super("d05");
  }

  public solveFirstStar(): string {
    let input = this.getInput();

    let output = runIntcode(input, [1]);

    return output.toString();
  }

  public solveSecondStar(): string {
    let input = this.getInput();

    let output = runIntcode(input, [5]);

    return output.toString();
  }

  private getInput(): number[] {
    if (this.input === null) {
      this.input = this.loadInputFile(1)
        .split(',')
        .filter((m) => m)
        .map((m) => parseInt(m, 10));
    }

    return [...this.input];
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD05());