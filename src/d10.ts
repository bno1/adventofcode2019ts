import {Array2} from "./array2";
import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {gcd} from "./common";

type Map = Array2<Uint8Array>;

// Quadrant of a point.
function quadrant(x: number, y: number): number {
  if (y < 0) {
    return x >= 0 ? 1 : 4;
  } else {
    return x >= 0 ? 2 : 3;
  }
}

// Order rays clockwise starting with [0, -1].
function cmpRays([dx1, dy1]: [number, number], [dx2, dy2]: [number, number]) {
  const q1 = quadrant(dx1, dy1);
  const q2 = quadrant(dx2, dy2);

  if (q1 !== q2) {
    return q1 - q2;
  }

  return (dy1 / dx1 < dy2 / dx2) ? -1 : 1;
}

// Generate all rays that can appear in a width x height map. A ray is a vector
// [dx, dy] pointing to a position that is in the line of sight relative to a
// point.
// If [x, y] is a point on a map then [x + dx, y + dy], [x + 2dx, y + 2dy], ...
// are position that can be in the line of sight of [x, y].
// Rays are canonicalized: [dx, dy] cannot be reduced (dx and dy are coprime)
// and [k * dx, k * dy] (k is a positive integer) are not rays because they are
// reducible to [dx, dy].
export function generateRays(
    width: number, height: number,
): Array<[number, number]> {
  const rays: Array<[number, number]> = [];

  // Rays for each axis
  if (width > 1) {
    rays.push([1, 0], [-1, 0]);
  }

  if (height > 1) {
    rays.push([0, 1], [0, -1]);
  }

  // [i, j] is in the first quadrant.
  for (let i = 1; i < width; i++) {
    for (let j = 1; j < height; j++) {
      // Keep only canonicalized rays (coprime i and j).
      if (gcd(i, j) === 1) {
        // Project [i, j] into each quadrant.
        rays.push([i, j], [-i, -j], [i, -j], [-i, j]);
      }
    }
  }

  // Sort rays clockwise.
  rays.sort(cmpRays);

  return rays;
}

// Starting at [x, y] march along ray [dx, dy] until an asteroid is encountered
// or the end of map is reached.
// Return the position of the asteroid or null.
function marchRay(
  map: Map, x: number, y: number, dx: number, dy: number,
): [number, number] | null {
  x += dx;
  y += dy;

  while (x >= 0 && x < map.width && y >= 0 && y < map.height) {
    if (map.read(x, y) !== 0) {
      return [x, y];
    }

    x += dx;
    y += dy;
  }

  return null;
}

export function readMap(input: string): Map {
  const rows = input.split("\n").filter((m) => m);
  const data = rows.join("").split("").map((c) => c === "." ? 0 : 1);

  const map = new Array2(rows[0].length, rows.length, Uint8Array);
  map.set(data);

  return map;
}

export function findBestPos(
    map: Map, rays: Array<[number, number]>,
): [number, [number, number]] {
  // visibility is used for debugging.
  const visibility = new Array2<Uint32Array>(map.width, map.height, Uint32Array);
  let bestPos: [number, number] = [-1, -1];
  let bestScore = -Infinity;

  visibility.fill(0);

  // For each asteroid.
  for (let j = 0; j < map.height; j++) {
    for (let i = 0; i < map.width; i++) {
      if (map.read(i, j) === 0) {
        continue;
      }

      let score = 0;

      // For each ray.
      for (const [dx, dy] of rays) {
        // Check if an asteroid is in the line of sight on this ray and count it.
        if (marchRay(map, i, j, dx, dy) !== null) {
          score++;
        }
      }

      visibility.write(i, j, score);

      if (score > bestScore) {
        bestPos = [i, j];
        bestScore = score;
      }
    }
  }

  // console.log(visibility.toString());
  return [bestScore, bestPos];
}

export function completeVaporization(
    map: Map, rays: Array<[number, number]>, x: number, y: number,
): Array<[number, number]> {
  const removals: Array<[number, number]> = [];
  let found = true;

  while (found) {
    found = false;

    // March rays and destroy asteroids.
    for (const [dx, dy] of rays) {
      const r = marchRay(map, x, y, dx, dy);
      if (r === null) {
        continue;
      }

      found = true;

      const [i, j] = r;
      removals.push([i, j]);
      map.write(i, j, 0);
    }
  }

  return removals;
}

class ChallengeD10 extends ChallengeFromFile {
  private input: Map | null = null;

  constructor() {
    super("d10");
  }

  public solveFirstStar(): string {
    const map = this.getInput();
    const rays = generateRays(map.width, map.height);

    const [score, pos] = findBestPos(this.getInput(), rays);

    return `${score} at ${pos}`;
  }

  public solveSecondStar(): string {
    const map = this.getInput();
    const rays = generateRays(map.width, map.height);

    const [ , [x, y]] = findBestPos(this.getInput(), rays);
    const removals = completeVaporization(map, rays, x, y);
    const r = removals[199];

    return `${r[0] * 100 + r[1]}`;
  }

  private getInput(): Map {
    if (this.input === null) {
      this.input = readMap(this.loadInputFile(1));
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD10());
