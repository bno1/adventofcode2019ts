import {Array2} from "./array2";
import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {runIntcode, startIntcode, wakeIntcode} from "./intcode";

type Screen = Array2<Uint8Array>;
const SCREEN_WIDTH = 37;
const SCREEN_HEIGHT = 26;

// Set to true to watch the game being played in the terminal
const RENDER = false;

function renderScreen(screen: Screen): string[] {
  return screen.rows().map((row) =>
    Array.from(row).map((c) => [" ", "█", "#", "_", "o"][c]).join(""),
  );
}

function timeout(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runGame(prog: number[]): Screen {
  const screen = new Array2(SCREEN_WIDTH, SCREEN_HEIGHT, Uint8Array);
  screen.fill(0);

  const commands = runIntcode(prog);

  while (commands.length > 0) {
    const x = commands.shift() as number;
    const y = commands.shift() as number;
    const tileid = commands.shift() as number;

    if (x < 0 || y < 0 || x >= screen.width || y >= screen.height) {
      throw new Error(`Invalid coords: ${x}, ${y}`);
    }

    screen.write(x, y, tileid);
  }

  if (RENDER) {
    const render = renderScreen(screen);
    console.log(`\n\n${render.join("\n")}`);
  }

  return screen;
}

async function playGame(prog: number[]): Promise<number> {
  let score = 0;
  let ballX = 0;
  let paddleX = 0;
  const screen = new Array2(SCREEN_WIDTH, SCREEN_HEIGHT, Uint8Array);
  screen.fill(0);

  const state = startIntcode(prog);

  while (!state.done) {
    wakeIntcode(state);

    while (state.output.length > 0) {
      const x = state.output.shift() as number;
      const y = state.output.shift() as number;
      const tileid = state.output.shift() as number;

      if (x === -1) {
        score = tileid;
        continue;
      }

      if (x < 0 || y < 0 || x >= screen.width || y >= screen.height) {
        throw new Error(`Invalid coords: ${x}, ${y}`);
      }

      screen.write(x, y, tileid);

      // Save position of paddle and ball.
      if (tileid === 3) {
        paddleX = x;
      } else if (tileid === 4) {
        ballX = x;
      }
    }

    if (RENDER) {
      const render = renderScreen(screen);
      console.log(`\n\n${score}\n${render.join("\n")}`);

      await timeout(10);
    }

    // Make sure the paddle is always below the ball.
    if (ballX < paddleX) {
      state.input.push(-1);
    } else if (ballX === paddleX) {
      state.input.push(0);
    } else {
      state.input.push(1);
    }
  }

  return score;
}

class ChallengeD13 extends ChallengeFromFile {
  private input: number[] | null = null;

  constructor() {
    super("d13");
  }

  public async solveFirstStar(): Promise<string> {
    const input = this.getInput();
    let blocks = 0;

    runGame([...input]).forEach((c) => blocks += c === 2 ? 1 : 0);

    return blocks.toString();
  }

  public async solveSecondStar(): Promise<string> {
    const input = [...this.getInput()];
    input[0] = 2;

    return (await playGame(input)).toString();
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

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD13());
