import {Array2} from "./array2";
import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {findMin} from "./common";
import {startIntcode, wakeIntcode} from "./intcode";

type Coord = [number, number];
type Map = Array2<Uint8Array>;

const MAX_WIDTH = 100;
const MAX_HEIGHT = 100;
const INITIAL_DROID_POS: Coord = [
  Math.trunc(MAX_WIDTH / 2), Math.trunc(MAX_HEIGHT / 2),
];

const MOVEMENTS: Coord[] = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];

enum Cell {
  Unknown = 0,
  Wall = 1,
  Space = 2,
  OxigenSystem = 3,
}

function addCoord(a: Coord, b: Coord): Coord {
  return [a[0] + b[0], a[1] + b[1]];
}

function eqCoord(a: Coord, b: Coord): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

function manhattenDist(a: Coord, b: Coord): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function astar(map: Map, start: Coord, goal: Coord): number[] {
  const openSet = new Map<string, Coord>();
  const cameFrom = new Array2(map.width, map.height, Uint8Array);
  const gScore = new Array2(map.width, map.height, Uint32Array);
  const fScore = new Array2(map.width, map.height, Uint32Array);

  gScore.fill(1 << 31);
  fScore.fill(1 << 31);

  openSet.set(start.toString(), start);
  gScore.write(start[0], start[1], 0);
  fScore.write(start[0], start[1], manhattenDist(start, goal));

  while (openSet.size > 0) {
    const [c] = findMin(openSet.values(), (p) => fScore.read(p[0], p[1]));

    if (eqCoord(c, goal)) {
      const path = [];
      const current = c;

      while (!eqCoord(current, start)) {
        const dir = cameFrom.read(current[0], current[1]);
        path.unshift(dir);

        const [dx, dy] = MOVEMENTS[dir];
        current[0] -= dx;
        current[1] -= dy;
      }

      return path;
    }

    openSet.delete(c.toString());

    for (let i = 0; i < MOVEMENTS.length; i++) {
      const ngb = addCoord(c, MOVEMENTS[i]);

      // Respect map edges
      if (ngb[0] < 0 || ngb[0] >= map.width
          || ngb[1] < 0 || ngb[1] >= map.height) {
        continue;
      }

      // Avoid Unknown cells except for the goal cell.
      const cell = map.read(ngb[0], ngb[1]);
      if (cell === Cell.Wall
          || (cell === Cell.Unknown && !eqCoord(ngb, goal))) {
        continue;
      }

      const ngbScore = gScore.read(c[0], c[1]) + 1;
      if (ngbScore < gScore.read(ngb[0], ngb[1])) {
        cameFrom.write(ngb[0], ngb[1], i);
        gScore.write(ngb[0], ngb[1], ngbScore);
        fScore.write(ngb[0], ngb[1], ngbScore + manhattenDist(ngb, goal));
        openSet.set(ngb.toString(), ngb);
      }
    }
  }

  throw new Error("Failed to reach goal");
}

function explore(program: number[], start: Coord): [Map, Coord] {
  const state = startIntcode(program);
  const map = new Array2(MAX_WIDTH, MAX_HEIGHT, Uint8Array);
  const unkSet = new Map<string, Coord>();
  let droidPos = start;
  let oxygenSystemPos: Coord | null = null;

  map.fill(Cell.Unknown);
  map.write(droidPos[0], droidPos[1], Cell.Space);

  function addUnkNeighbours(c: Coord) {
    for (const movement of MOVEMENTS) {
      const n = addCoord(c, movement);

      if (map.read(n[0], n[1]) === Cell.Unknown) {
        unkSet.set(n.toString(), n);
      }
    }
  }

  addUnkNeighbours(droidPos);

  while (unkSet.size > 0) {
    // Find closest reachable Unknown cell
    const [target] = findMin(unkSet.values(), (p) => manhattenDist(p, droidPos));

    // Build path to it
    const path = astar(map, droidPos, target);

    let done = false;
    for (const dir of path) {
      if (done) {
        break;
      }

      state.input.push(dir + 1);
      wakeIntcode(state);

      if (state.done) {
        throw new Error("Droid halted");
      }

      if (state.output.length !== 1) {
        throw new Error(`Droid outputed ${state.output.length} numbers`);
      }

      const newPos = addCoord(droidPos, MOVEMENTS[dir]);
      switch (state.output.shift() as number) {
        case 0:
          // Hit wall. Update map and finish loop.
          map.write(newPos[0], newPos[1], Cell.Wall);
          unkSet.delete(newPos.toString());
          done = true;
          break;

        case 1:
          // Found free space. Update map and continue.
          map.write(newPos[0], newPos[1], Cell.Space);
          unkSet.delete(newPos.toString());
          droidPos = newPos;
          addUnkNeighbours(droidPos);
          break;

        case 2:
          // Found oxygen. Update map and continue.
          map.write(newPos[0], newPos[1], Cell.OxigenSystem);
          unkSet.delete(newPos.toString());
          droidPos = newPos;
          oxygenSystemPos = newPos;
          addUnkNeighbours(droidPos);
          break;

        default:
          throw new Error(`Unexpected droid output`);
      }
    }
  }

  if (oxygenSystemPos === null) {
    throw new Error("Failed to find oxygen");
  }

  return [map, oxygenSystemPos];
}

function computeMapRadius(map: Map, start: Coord): number {
  // Do a BFS on the map and record the maximum distance found.

  const queue: Coord[] = [];
  const distance = new Array2(map.width, map.height, Int32Array);
  let maxDist = 0;

  distance.fill(-1);

  queue.push(start);
  distance.write(start[0], start[1], 0);

  while (queue.length > 0) {
    const p = queue.shift() as Coord;

    const d = distance.read(p[0], p[1]);
    maxDist = Math.max(maxDist, d);

    for (const movement of MOVEMENTS) {
      const q = addCoord(p, movement);

      if (q[0] < 0 || q[0] >= map.width || q[1] < 0 || q[1] >= map.height) {
        continue;
      }

      if (distance.read(q[0], q[1]) >= 0) {
        continue;
      }

      const cell = map.read(q[0], q[1]);
      if (cell === Cell.Wall) {
        continue;
      }

      if (cell === Cell.Unknown) {
        throw new Error(`Found unexplored cell at ${q}`);
      }

      distance.write(q[0], q[1], d + 1);
      queue.push(q);
    }
  }

  return maxDist;
}

class ChallengeD15 extends ChallengeFromFile {
  private input: number[] | null = null;

  constructor() {
    super("d15");
  }

  public async solveFirstStar(): Promise<string> {
    const input = [...this.getInput()];

    const [map, oxygenSystemPos] =
      explore(input, [INITIAL_DROID_POS[0], INITIAL_DROID_POS[1]]);

    return astar(map, INITIAL_DROID_POS, oxygenSystemPos).length.toString();
  }

  public async solveSecondStar(): Promise<string> {
    const input = [...this.getInput()];

    const [map, oxygenSystemPos] =
      explore(input, [INITIAL_DROID_POS[0], INITIAL_DROID_POS[1]]);

    return computeMapRadius(map, oxygenSystemPos).toString();
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

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD15());
