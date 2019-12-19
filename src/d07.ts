import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {runIntcode, startIntcode, wakeIntcode} from "./intcode";


export function runAmplifiers(
  p: number[], input: number, phases: number[]): number
{
  for (let ph of phases) {
    input = runIntcode([...p], [ph, input])[0];
  }

  return input;
}

export function runAmplifiers2(
  p: number[], input: number, phases: number[]): number
{
  let q = phases.map((ph) => startIntcode([...p], [ph]));
  let last_thrust = -1;

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

    last_thrust = input;

    if (q[q.length - 1].done) {
      return last_thrust;
    }
  }
}

function enumeratePhases(
  phase_start: number, phase_end: number, callback: (phases: number[]) => void,
  phases: number[] = [])
{
  if (phases.length >= phase_end - phase_start + 1) {
    callback(phases);
    return;
  }

  for (let ph = phase_start; ph <= phase_end; ph++) {
    if (phases.indexOf(ph) >= 0) {
      continue;
    }

    phases.push(ph);
    enumeratePhases(phase_start, phase_end, callback, phases);
    phases.pop();
  }
}

class ChallengeD07 extends ChallengeFromFile {
  private input: number[] | null = null;

  constructor() {
    super("d07");
  }

  public solveFirstStar(): string {
    let input = this.getInput();
    let max_thrust = -Infinity;

    enumeratePhases(0, 4, (phases) => {
      let thrust = runAmplifiers(input, 0, phases);
      max_thrust = Math.max(max_thrust, thrust);
    });

    return max_thrust.toString();
  }

  public solveSecondStar(): string {
    let input = this.getInput();
    let max_thrust = -Infinity;

    enumeratePhases(5, 9, (phases) => {
      let thrust = runAmplifiers2(input, 0, phases);
      max_thrust = Math.max(max_thrust, thrust);
    });

    return max_thrust.toString();
  }

  private getInput(): number[] {
    if (this.input === null) {
      this.input = this.loadInputFile(1)
        .split(',')
        .filter((m) => m)
        .map((m) => parseInt(m, 10));
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD07());
