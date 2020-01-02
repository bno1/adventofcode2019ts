import {Array2} from "./array2";
import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {findMin, popCountU32} from "./common";

type Coord = [number, number];

interface IMaze {
  map: Array2<Uint8Array>;
  starts: Coord[];          // Start positions of robots
  pois: Coord[];            // Positions of keys, gates and starts
  keys: number[];           // Key names (ASCII code)
  gates: number[];          // Gate names (ASCII code)
  keysMask: number;         // Bit mask for keys
                            // (bit i is set if key i + MIN_KEY exists)
}

const MOVEMENTS: Coord[] = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];

enum Cell {
  Space = ".".charCodeAt(0),
  Wall = "#".charCodeAt(0),
  Start = "@".charCodeAt(0),
}

const MIN_KEY = "a".charCodeAt(0);
const MAX_KEY = "z".charCodeAt(0);
const MIN_GATE = "A".charCodeAt(0);
const MAX_GATE = "Z".charCodeAt(0);
const START_MIN = 1;

function isGate(n: number): boolean {
  return n >= MIN_GATE && n <= MAX_GATE;
}

function isKey(n: number): boolean {
  return n >= MIN_KEY && n <= MAX_KEY;
}

export function parseMap(input: string, secondStar: boolean = false): IMaze {
  const cells = input.split("\n").filter((l) => l).map((l) => l.split(""));
  const maze: IMaze = {
    gates: [],
    keys: [],
    keysMask: 0,
    map: new Array2(cells[0].length, cells.length, Uint8Array),
    pois: new Array(256),
    starts: [],
  };

  maze.pois.fill([-1, -1]);

  if (secondStar) {
    outerLoop:
    for (let i = 0; i < maze.map.height; i++) {
      for (let j = 0; j < maze.map.width; j++) {
        if (cells[i][j] === "@") {
          cells[i][j] = "#";
          cells[i][j - 1] = "#";
          cells[i][j + 1] = "#";
          cells[i - 1][j] = "#";
          cells[i + 1][j] = "#";
          cells[i - 1][j - 1] = "@";
          cells[i - 1][j + 1] = "@";
          cells[i + 1][j - 1] = "@";
          cells[i + 1][j + 1] = "@";
          break outerLoop;
        }
      }
    }
  }

  for (let i = 0; i < maze.map.height; i++) {
    for (let j = 0; j < maze.map.width; j++) {
      const c = cells[i][j].charCodeAt(0);
      switch (c) {
        case Cell.Space:
        case Cell.Wall:
          maze.map.write(j, i, c);
          break;

        case Cell.Start:
          maze.pois[START_MIN + maze.starts.length] = [j, i];
          maze.starts.push([j, i]);
          maze.map.write(j, i, Cell.Space);
          break;

        default:
          if (isGate(c)) {
            maze.gates.push(c);
            maze.pois[c] = [j, i];
          } else if (isKey(c)) {
            maze.keys.push(c);
            maze.keysMask |= 1 << (c - MIN_KEY);
            maze.pois[c] = [j, i];
          } else {
            throw new Error(`Unknown cell type: ${cells[i][j]}`);
          }

          maze.map.write(j, i, c);
          break;
      }
    }
  }

  return maze;
}

function manhattenDist(a: Coord, b: Coord): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

// Compute distance from start to goal without going through any gates or keys.
function astar(maze: IMaze, start: Coord, goal: Coord): number {
  const openSet: Map<string, Coord> = new Map();
  const gScore = new Array2(maze.map.width, maze.map.height, Uint32Array);
  const fScore = new Array2(maze.map.width, maze.map.height, Uint32Array);

  gScore.fill(2 ** 31);
  fScore.fill(2 ** 31);

  openSet.set(start.toString(), start);
  gScore.write(start[0], start[1], 0);
  fScore.write(start[0], start[1], manhattenDist(start, goal));

  while (openSet.size > 0) {
    const [[x, y]] = findMin(openSet.values(), (p) => fScore.read(p[0], p[1]));

    if (x === goal[0] && y === goal[1]) {
      return gScore.read(x, y);
    }

    openSet.delete([x, y].toString());

    for (const [dx, dy] of MOVEMENTS) {
      const nx = x + dx;
      const ny = y + dy;

      if (!maze.map.boundCheck(nx, ny)) {
        continue;
      }

      const ncell = maze.map.read(nx, ny);
      if (!(nx === goal[0] && ny === goal[1])
          && ncell !== Cell.Space) {
        continue;
      }

      const dist = gScore.read(x, y) + 1;
      if (dist < gScore.read(nx, ny)) {
        gScore.write(nx, ny, dist);
        fScore.write(nx, ny, dist + manhattenDist([nx, ny], goal));
        openSet.set([nx, ny].toString(), [nx, ny]);
      }
    }
  }

  return -1;
}

// Compute distances between keys, gates and starting positions.
function computeDistances(maze: IMaze): Array2<Int16Array> {
  const pois: Array<[number, Coord]> = [
    ...maze.starts.map((s, idx) => [START_MIN + idx, s] as [number, Coord]),
    ...maze.gates.map((g) => [g, maze.pois[g]] as [number, Coord]),
    ...maze.keys.map((g) => [g, maze.pois[g]] as [number, Coord]),
  ];
  const dists = new Array2(256, 256, Int16Array);
  dists.fill(-1);

  for (let i = 0; i < pois.length; i++) {
    const [a, acoord] = pois[i];
    for (let j = i + 1; j < pois.length; j++) {
      const [b, bcoord] = pois[j];
      const d = astar(maze, acoord, bcoord);
      if (d >= 0) {
        dists.write(a, b, d);
        dists.write(b, a, d);
      }
    }
  }

  return dists;
}

// Use A* to find a route from a start position to a key considering the gates
// that are open and avoiding keys that are not collected yet.
function findRouteToKey(
  maze: IMaze, dists: Array2<Int16Array>, start: number, goal: number,
  keys: number, maxDist: number,
): number {
  const openSet: Set<number> = new Set();
  const gScore = new Uint16Array(256);
  const fScore = new Uint16Array(256);
  const goalCoord = maze.pois[goal];

  gScore.fill(1 << 15);
  fScore.fill(1 << 15);

  openSet.add(start);
  gScore[start] = 0;
  fScore[start] = manhattenDist(maze.pois[start], goalCoord);

  while (openSet.size > 0) {
    const [pos] = findMin(openSet.values(), (p) => fScore[p]);

    if (pos === goal) {
      return gScore[pos];
    }

    openSet.delete(pos);

    for (const ngb of [...maze.keys, ...maze.gates]) {
      const d = dists.read(pos, ngb);
      if (d < 0) {
        continue;
      }

      // Skip gates that are not accesible.
      if (isGate(ngb) && (keys & (1 << (ngb - MIN_GATE))) === 0) {
        continue;
      }

      // Skip keys that we didn't collect yet.
      if (isKey(ngb) && ngb !== goal && (keys & (1 << (ngb - MIN_KEY))) === 0) {
        continue;
      }

      const dist = gScore[pos] + d;

      // Avoid gates/keys outside of maxDist.
      if (dist >= maxDist) {
        continue;
      }

      if (dist < gScore[ngb]) {
        gScore[ngb] = dist;
        fScore[ngb] = dist + manhattenDist(maze.pois[pos], goalCoord);
        openSet.add(ngb);
      }

    }
  }

  return Infinity;
}

// Use A* to find the min route that collects all the keys.
// Uses neededKeysCont * 1000000 + stepsTaken as a heuristic.
export function findMinRoute(maze: IMaze): number {
  const dists = computeDistances(maze);

  // Set<[robotPositions, neededKeysBitSet]>
  const openSet: Map<string, [number[], number]> = new Map();
  const gScore: Map<string, number> = new Map();
  const fScore: Map<string, number> = new Map();
  let bestDist = Infinity;

  // Getter for gScore and fScore that returns Infinity by default.
  function getScore(k: string, score: Map<string, number>): number {
    const s = score.get(k);
    return s === undefined ? Infinity : s;
  }

  function relax(v: [number[], number], d: number, h: number) {
    const key = v.toString();
    if (d < getScore(key, gScore)) {
      openSet.set(key, v);
      gScore.set(key, d);
      fScore.set(key, d + h);
    }
  }

  relax([maze.starts.map((_, i) => START_MIN + i), maze.keysMask],
        0, popCountU32(maze.keysMask) * 1000000);

  while (openSet.size > 0) {
    const [idx] = findMin(openSet.keys(), (k) => getScore(k, fScore));
    const [pos, needed] = openSet.get(idx) as [number[], number];

    openSet.delete(idx);

    const idxDist = getScore(idx, gScore);

    if (needed === 0) {
      bestDist = Math.min(bestDist, idxDist);
      continue;
    } else if (idxDist >= bestDist) {
      continue;
    }

    for (const key of maze.keys) {
      // Skip keys already collected.
      if ((needed & (1 << (key - MIN_KEY))) === 0) {
        continue;
      }

      // For each robot.
      for (let i = 0; i < pos.length; i++) {
        const d = findRouteToKey(maze, dists, pos[i], key, ~needed,
                                 bestDist - idxDist);
        if (d < 0) {
          continue;
        }

        const dist = idxDist + d;

        if (dist < bestDist) {
          const npos = [...pos];
          const nneeded = needed ^ (1 << (key - MIN_KEY));
          npos[i] = key;
          relax([npos, nneeded], dist, popCountU32(needed) * 1000000);
        }
      }
    }
  }

  return bestDist;
}

class ChallengeD18 extends ChallengeFromFile {
  private input: string | null = null;

  constructor() {
    super("d18");
  }

  public async solveFirstStar(): Promise<string> {
    const input = this.getInput();

    const maze = parseMap(input);

    return findMinRoute(maze).toString();
  }

  public async solveSecondStar(): Promise<string> {
    const input = this.getInput();

    const maze = parseMap(input, true);

    return findMinRoute(maze).toString();
  }

  private getInput(): string {
    if (this.input === null) {
      this.input = this.loadInputFile(1);
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD18());
