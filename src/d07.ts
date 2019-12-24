import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {runIntcode, startIntcode, wakeIntcode} from "./intcode";

export function runAmplifiers(
  p: number[], input: number, phases: number[],
): number {
  for (const ph of phases) {
    input = runIntcode([...p], [ph, input])[0];
  }

  return input;
}

export function runAmplifiers2(
  p: number[], input: number, phases: number[],
): number {
  const q = phases.map((ph) => startIntcode([...p], [ph]));
  let lastThrust = -1;

  while (true) {
    for (let i = 0; i < phases.length; i++) {
      if (q[i].done) {
        throw new Error("Amplifier halted early");
      }

      q[i].input.push(input);
      wakeIntcode(q[i]);

      const o = q[i].output.shift();
      if (o === undefined) {
        throw new Error("Empty output");
      }

      input = o;
    }

    lastThrust = input;

    if (q[q.length - 1].done) {
      return lastThrust;
    }
  }
}

function enumeratePhases(
  phaseStart: number, phaseEnd: number, callback: (phases: number[]) => void,
  phases: number[] = [],
) {
  if (phases.length >= phaseEnd - phaseStart + 1) {
    callback(phases);
    return;
  }

  for (let ph = phaseStart; ph <= phaseEnd; ph++) {
    if (phases.indexOf(ph) >= 0) {
      continue;
    }

    phases.push(ph);
    enumeratePhases(phaseStart, phaseEnd, callback, phases);
    phases.pop();
  }
}

class ChallengeD07 extends ChallengeFromFile {
  private input: number[] | null = null;

  constructor() {
    super("d07");
  }

  public solveFirstStar(): string {
    const input = this.getInput();
    let maxThrust = -Infinity;

    enumeratePhases(0, 4, (phases) => {
      const thrust = runAmplifiers(input, 0, phases);
      maxThrust = Math.max(maxThrust, thrust);
    });

    return maxThrust.toString();
  }

  public solveSecondStar(): string {
    const input = this.getInput();
    let maxThrust = -Infinity;

    enumeratePhases(5, 9, (phases) => {
      const thrust = runAmplifiers2(input, 0, phases);
      maxThrust = Math.max(maxThrust, thrust);
    });

    return maxThrust.toString();
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

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD07());
