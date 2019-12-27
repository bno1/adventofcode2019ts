import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";

interface IPoint {
  x: number;
  y: number;
}

interface ILine {
  p1: IPoint;
  p2: IPoint;
}

function linesIntersect(a: ILine, b: ILine): IPoint | null {
  const ixmin = Math.max(Math.min(a.p1.x, a.p2.x), Math.min(b.p1.x, b.p2.x));
  const ixmax = Math.min(Math.max(a.p1.x, a.p2.x), Math.max(b.p1.x, b.p2.x));
  const iymin = Math.max(Math.min(a.p1.y, a.p2.y), Math.min(b.p1.y, b.p2.y));
  const iymax = Math.min(Math.max(a.p1.y, a.p2.y), Math.max(b.p1.y, b.p2.y));

  if (ixmin <= ixmax && iymin <= iymax) {
    const p: IPoint = {x: 0, y: 0};

    if (Math.abs(ixmin) < Math.abs(ixmax)) {
      p.x = ixmin;
    } else {
      p.x = ixmax;
    }

    if (Math.abs(iymin) < Math.abs(iymax)) {
      p.y = iymin;
    } else {
      p.y = iymax;
    }

    return p;
  }

  return null;
}

function instructionToLines(instructions: string[]): ILine[] {
  let p: IPoint = {x: 0, y: 0};
  let q: IPoint;
  const lines: ILine[] = [];

  for (const instr of instructions) {
    const d = instr[0];
    const n = parseInt(instr.slice(1), 10);

    switch (d) {
    case "U":
      q = {x: p.x, y: p.y + n};
      break;

    case "D":
      q = {x: p.x, y: p.y - n};
      break;

    case "R":
      q = {x: p.x + n, y: p.y};
      break;

    case "L":
      q = {x: p.x - n, y: p.y};
      break;

    default:
      throw new Error(`Invalid instruction: ${instr}`);
    }

    lines.push({p1: p, p2: q});
    p = q;
  }

  return lines;
}

function manhattenDistance(p1: IPoint, p2: IPoint) {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

export function intersectionDistance(instr1: string[], instr2: string[]): number {
  const lines1 = instructionToLines(instr1);
  let md = Infinity;

  for (const line of instructionToLines(instr2)) {
    for (const testLine of lines1) {
      const q = linesIntersect(line, testLine);

      if (q !== null) {
        const qMD = manhattenDistance({x: 0, y: 0}, q);

        if (qMD < md && qMD > 0) {
          md = qMD;
        }
      }
    }
  }

  return md;
}

export function intersectionDelay(instr1: string[], instr2: string[]): number {
  const lines1 = instructionToLines(instr1);
  let delay = Infinity;

  let steps2 = 0;
  for (const line of instructionToLines(instr2)) {
    let steps1 = 0;

    for (const testLine of lines1) {
      const q = linesIntersect(line, testLine);

      if (q != null) {
        const qDelay = steps1 + steps2 + manhattenDistance(line.p1, q)
                       + manhattenDistance(testLine.p1, q);

        if (qDelay < delay && qDelay > 0) {
          delay = qDelay;
        }
      }

      steps1 += manhattenDistance(testLine.p1, testLine.p2);
    }

    steps2 += manhattenDistance(line.p1, line.p2);
  }

  return delay;
}

class ChallengeD03 extends ChallengeFromFile {
  private input: string[][] | null = null;

  constructor() {
    super("d03");
  }

  public async solveFirstStar(): Promise<string> {
    const input = this.getInput();
    const md = intersectionDistance(input[0], input[1]);

    return md.toString();
  }

  public async solveSecondStar(): Promise<string> {
    const input = this.getInput();
    const delay = intersectionDelay(input[0], input[1]);

    return delay.toString();
  }

  private getInput(): string[][] {
    if (this.input === null) {
      this.input = this.loadInputFile(1)
        .split("\n")
        .filter((m) => m)
        .map((instr) => instr
          .split(",")
          .filter((m) => m),
        );
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD03());
