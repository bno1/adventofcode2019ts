import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";

interface Point {
  x: number;
  y: number;
}

interface Line {
  p1: Point;
  p2: Point;
}

function linesIntersect(a: Line, b: Line): Point | null {
  let ixmin = Math.max(Math.min(a.p1.x, a.p2.x), Math.min(b.p1.x, b.p2.x));
  let ixmax = Math.min(Math.max(a.p1.x, a.p2.x), Math.max(b.p1.x, b.p2.x));
  let iymin = Math.max(Math.min(a.p1.y, a.p2.y), Math.min(b.p1.y, b.p2.y));
  let iymax = Math.min(Math.max(a.p1.y, a.p2.y), Math.max(b.p1.y, b.p2.y));

  if (ixmin <= ixmax && iymin <= iymax) {
    let p: Point = {x: 0, y: 0};

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

function instructionToLines(instructions: string[]): Line[] {
  let p: Point = {x: 0, y: 0};
  let q: Point;
  let lines: Line[] = [];

  for (let instr of instructions) {
    let d = instr[0];
    let n = parseInt(instr.slice(1), 10);

    switch (d) {
    case 'U':
      q = {x: p.x, y: p.y + n};
      break;

    case 'D':
      q = {x: p.x, y: p.y - n};
      break;

    case 'R':
      q = {x: p.x + n, y: p.y};
      break;

    case 'L':
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

function manhattenDistance(p1: Point, p2: Point) {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

export function intersectionDistance(instr1: string[], instr2: string[]): number {
  let lines1 = instructionToLines(instr1);
  let md = Infinity;

  for (let line of instructionToLines(instr2)) {
    for (let testLine of lines1) {
      let q = linesIntersect(line, testLine);

      if (q !== null) {
        let q_md = manhattenDistance({x: 0, y: 0}, q);

        if (q_md < md && q_md > 0) {
          md = q_md;
        }
      }
    }
  }

  return md;
}

export function intersectionDelay(instr1: string[], instr2: string[]): number {
  let lines1 = instructionToLines(instr1);
  let delay = Infinity;

  let steps2 = 0;
  for (let line of instructionToLines(instr2)) {
    let steps1 = 0;

    for (let testLine of lines1) {
      let q = linesIntersect(line, testLine);

      if (q != null) {
        let q_delay = steps1 + steps2 + manhattenDistance(line.p1, q)
                      + manhattenDistance(testLine.p1, q);

        if (q_delay < delay && q_delay > 0) {
          delay = q_delay;
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

  public solveFirstStar(): string {
    let input = this.getInput();
    let md = intersectionDistance(input[0], input[1]);

    return md.toString();
  }

  public solveSecondStar(): string {
    let input = this.getInput();
    let delay = intersectionDelay(input[0], input[1]);

    return delay.toString();
  }

  private getInput(): string[][] {
    if (this.input === null) {
      this.input = this.loadInputFile(1)
        .split('\n')
        .filter((m) => m)
        .map((instr) => instr
          .split(',')
          .filter((m) => m)
        );
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD03());
