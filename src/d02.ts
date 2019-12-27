import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {runIntcode} from "./intcode";

const STAR2_TARGET = 19690720;

class ChallengeD02 extends ChallengeFromFile {
  private input: number[] | null = null;

  constructor() {
    super("d02");
  }

  public async solveFirstStar(): Promise<string> {
    const input = this.getInput();

    input[1] = 12;
    input[2] = 2;

    runIntcode(input);

    return input[0].toString();
  }

  public async solveSecondStar(): Promise<string> {
    const baseInput = this.getInput();

    for (let noun = 0; noun < 100; noun++) {
      for (let verb = 0; verb < 100; verb++) {
        const input = [...baseInput];
        input[1] = noun;
        input[2] = verb;

        runIntcode(input);

        if (input[0] === STAR2_TARGET) {
          return (100 * noun + verb).toString();
        }
      }
    }

    return "Not Found";
  }

  private getInput(): number[] {
    if (this.input === null) {
      this.input = this.loadInputFile(1)
        .split(",")
        .filter((m) => m)
        .map((m) => parseInt(m, 10));
    }

    return [...this.input];
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD02());
