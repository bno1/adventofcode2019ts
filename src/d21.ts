import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {runIntcode} from "./intcode";

class ChallengeD21 extends ChallengeFromFile {
  private input: number[] | null = null;

  constructor() {
    super("d21");
  }

  public async solveFirstStar(): Promise<string> {
    const input = this.getInput();
    const program =
      "NOT A J\n" +
      "NOT B T\n" +
      "OR T J\n" +
      "NOT C T\n" +
      "OR T J\n" +
      "AND D J\n" +
      "WALK\n";

    const output = runIntcode([...input],
                              program.split("").map((c) => c.charCodeAt(0)));

    if (output.length > 34) {
      return output.map((c) => String.fromCharCode(c)).join("");
    } else {
      return output[output.length - 1].toString();
    }
  }

  public async solveSecondStar(): Promise<string> {
    const input = this.getInput();
    const program =
      "NOT A J\n" +
      "NOT B T\n" +
      "OR T J\n" +
      "NOT C T\n" +
      "OR T J\n" +
      "AND D J\n" +
      "OR E T\n" +
      "AND E T\n" +
      "OR H T\n" +
      "AND T J\n" +
      "RUN\n";

    const output = runIntcode([...input],
                              program.split("").map((c) => c.charCodeAt(0)));

    if (output.length > 34) {
      return output.map((c) => String.fromCharCode(c)).join("");
    } else {
      return output[output.length - 1].toString();
    }
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

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD21());
