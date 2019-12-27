import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {lcm} from "./common";

export type Vec3 = [number, number, number];

export interface IMoon {
  p: Vec3;
  v: Vec3;
}

export function createMoons(positions: Vec3[]): IMoon[] {
  return positions.map((p) => {
    return {
      p: [p[0], p[1], p[2]],
      v: [0, 0, 0],
    };
  });
}

export function runNBody(moons: IMoon[]) {
  for (let i = 0; i < moons.length; i++) {
    for (let j = i + 1; j < moons.length; j++) {
      for (let k = 0; k < 3; k++) {
        const pi = moons[i].p[k];
        const pj = moons[j].p[k];

        if (pi > pj) {
          moons[i].v[k] -= 1;
          moons[j].v[k] += 1;
        } else if (pi < pj) {
          moons[i].v[k] += 1;
          moons[j].v[k] -= 1;
        }
      }
    }
  }

  for (const moon of moons) {
    for (let k = 0; k < 3; k++) {
      moon.p[k] += moon.v[k];
    }
  }
}

export function computeEnergy(moons: IMoon[]): number {
  let eng = 0;

  for (const moon of moons) {
    const potEng = moon.p.reduce((s, p) => s + Math.abs(p), 0);
    const kinEng = moon.v.reduce((s, v) => s + Math.abs(v), 0);

    eng += potEng * kinEng;
  }

  return eng;
}

export function findCycle(moons: IMoon[]): number {
  // Detect the cycle for each axis individually

  // Holds the iteration number each state appears at, per axis.
  const configs: Array<{[key: string]: number}> = [
    {},
    {},
    {},
  ];

  // Holds the cycle length and delay, per axis.
  // Delay = the first iteration at which the cycle begins.
  const cycles: [[number, number], [number, number], [number, number]] = [
    [-1, -1], [-1, -1], [-1, -1],
  ];

  let axesLeft = 3;

  let i = 0;
  while (axesLeft > 0) {
    // For each axis that we don't know the cycle yet.
    for (let k = 0; k < 3; k++) {
      if (cycles[k][0] >= 0) {
        continue;
      }

      // Generate state key.
      const key = moons.map((m) => [m.p[k], m.v[k]]).toString();

      // If state has been seen before save cycle and decrement axesLeft.
      // Else save state in configs.
      if (key in configs[k]) {
        cycles[k] = [i - configs[k][key], configs[k][key]];
        axesLeft--;
      } else {
        configs[k][key] = i;
      }
    }

    runNBody(moons);

    i++;
  }

  // Cycle of the entire system = least common multiple of cycles of axes.
  const cycle = lcm(cycles[0][0], lcm(cycles[1][0], cycles[2][0]));

  // Delay of the entire system = max delay of axes.
  const delay = Math.max(cycles[0][1], cycles[1][1], cycles[2][1]);

  return cycle + delay;
}

class ChallengeD12 extends ChallengeFromFile {
  private input: Vec3[] | null = null;

  constructor() {
    super("d12");
  }

  public async solveFirstStar(): Promise<string> {
    const input = this.getInput();
    const moons = createMoons(input);

    for (let i = 0; i < 1000; i++) {
      runNBody(moons);
    }

    return computeEnergy(moons).toString();
  }

  public async solveSecondStar(): Promise<string> {
    const input = this.getInput();
    const moons = createMoons(input);

    return findCycle(moons).toString();
  }

  private getInput(): Vec3[] {
    if (this.input === null) {
      this.input = this.loadInputFile(1)
        .split("\n")
        .filter((v) => v)
        .map((v) => {
          const m = v.match(/<x=(\S+), y=(\S+), z=(\S+)>/);
          if (m === null || m.length < 4) {
            throw new Error(`Invalid line: ${v}`);
          }
          return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
        });
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD12());
