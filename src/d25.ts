import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {startIntcode, wakeIntcode} from "./intcode";
import readline = require("readline");

async function runInteractive(program: number[]) {
  const state = startIntcode(program);
  const rl = readline.createInterface(process.stdin);

  function runState(input: string): string {
    state.input.push(...input.split("").map((c) => c.charCodeAt(0)));

    wakeIntcode(state);

    const output = state.output.map((c) => String.fromCharCode(c)).join("");
    state.output = [];

    return output;
  }

  console.log(runState(""));

  return new Promise((res) => {
    rl.on('line', (line) => {
      console.log(runState(line.trim() + "\n"));
      if (state.done) {
        rl.close();
      }
    }).on('close', () => {
      console.log("Program terminated.");
      res()
    });
  });
}

class ChallengeD25 extends ChallengeFromFile {
  private input: number[] | null = null;

  constructor() {
    super("d25");
  }

  public async solveFirstStar(): Promise<string> {
    const input = this.getInput();

    await runInteractive([...input]);

    return "";
  }

  public async solveSecondStar(): Promise<string> {
    return "Congratulations!";
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

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD25());
