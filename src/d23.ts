import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {IIntcodeState, startIntcode, wakeIntcode} from "./intcode";

type Packet = [number, number, number, number];
type Listener = (packet: Packet) => boolean;

function runNICs(program: number[], count: number, listener: Listener) {
  const nics: IIntcodeState[] = [];
  const natMem: [number, number] = [0, 0];

  for (let i = 0; i < count; i++) {
    nics.push(startIntcode([...program], [i]));
  }

  function send(src: number, dst: number, x: number, y: number): boolean {
    if (!listener([src, dst, x, y])) {
      return false;
    }

    if (dst === 255) {
      natMem[0] = x;
      natMem[1] = y;
      return true;
    }

    if (dst < 0 || dst >= count) {
      throw new Error(`nvalid destination: ${dst}`);
    }

    nics[dst].input.push(x, y);

    return true;
  }

  while (true) {
    let idle = true;

    for (let i = 0; i < count; i++) {
      const n = nics[i];
      if (n.done) {
        throw new Error(`NIC ${i} stopped`);
      }

      if (n.input.length === 0) {
        n.input.push(-1);
      } else {
        idle = false;
      }

      wakeIntcode(n);

      if (n.done) {
        throw new Error(`NIC ${i} stopped`);
      }

      while (n.output.length >= 3) {
        const p = n.output.splice(0, 3);
        if (!send(i, p[0], p[1], p[2])) {
          return;
        }

        idle = false;
      }
    }

    if (idle) {
      if (!send(255, 0, natMem[0], natMem[1])) {
        return;
      }
    }
  }
}

class ChallengeD23 extends ChallengeFromFile {
  private input: number[] | null = null;

  constructor() {
    super("d23");
  }

  public async solveFirstStar(): Promise<string> {
    const input = this.getInput();

    let result = -1;

    runNICs(input, 50, ([, dst, , y]) => {
      if (dst === 255) {
        result = y;
        return false;
      }

      return true;
    });

    return result.toString();
  }

  public async solveSecondStar(): Promise<string> {
    const input = this.getInput();

    const ys: number[] = [];
    let result = -1;

    runNICs(input, 50, ([src, dst, , y]) => {
      if (src === 255 && dst === 0) {
        if (ys.indexOf(y) >= 0) {
          result = y;
          return false;
        }

        ys.push(y);
      }

      return true;
    });

    return result.toString();
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

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD23());
