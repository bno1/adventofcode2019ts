import {Array2} from "./array2";
import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {findMin} from "./common";

type Coord = [number, number];

interface IMaze {
  map: Array2<Uint8Array>;
  portals: Map<string, [Coord, Coord]>;
  portalCoords: Map<string, Coord[]>;
}

const MOVEMENTS: Coord[] = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];

enum Cell {
  Empty = 0,
  Space = 1,
  Wall = 2,
  Portal = 3,
}

function eqCoord(a: Coord, b: Coord): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

function isOuter(maze: IMaze, x: number, y: number): boolean {
  return Math.min(x, maze.map.width - x - 1) < 2
         || Math.min(y, maze.map.height - y - 1) < 2;
}

export function parseMap(input: string): IMaze {
  const cells = input.split("\n").filter((l) => l).map((l) => l.split(""));
  const maze: IMaze = {
    map: new Array2(cells[0].length, cells.length, Uint8Array),
    portalCoords: new Map(),
    portals: new Map(),
  };

  maze.map.fill(Cell.Empty);

  for (let i = 0; i < maze.map.height; i++) {
    for (let j = 0; j < maze.map.width; j++) {
      const c = cells[i][j];
      switch (c) {
        case " ":
          break;

        case ".":
          maze.map.write(j, i, Cell.Space);
          break;

        case "#":
          maze.map.write(j, i, Cell.Wall);
          break;

        default:
          if (c >= "A" && c <= "Z") {
            let ngbSpace: Coord | null = null;
            let portal: string | null = null;

            for (const [dj, di] of MOVEMENTS) {
              const ii = i + di;
              const jj = j + dj;

              if (!maze.map.boundCheck(jj, ii)) {
                continue;
              }

              const cc = cells[ii][jj];
              if (cc === ".") {
                if (ngbSpace === null) {
                  ngbSpace = [jj, ii];
                } else {
                  throw new Error(`More than one neighbouring space`);
                }
              } else if (cc >= "A" && cc <= "Z") {
                if (portal === null) {
                  if (ii < i || jj < j) {
                    portal = [cc, c].join("");
                  } else {
                    portal = [c, cc].join("");
                  }
                } else {
                  throw new Error(`More than one neighbouring char`);
                }
              }
            }

            if (portal !== null && ngbSpace !== null) {
              maze.map.write(j, i, Cell.Portal);

              const coords = maze.portalCoords.get(portal);
              if (coords === undefined) {
                maze.portalCoords.set(portal, [[j, i]]);
              } else {
                coords.push([j, i]);
              }
            }
          } else {
            throw new Error(`Unknown cell: ${c}`);
          }

          break;
      }
    }
  }

  for (const coords of maze.portalCoords.values()) {
    if (coords.length === 1) {
      maze.portals.set(coords[0].toString(), [coords[0], [-1, -1]]);
    } else if (coords.length === 2) {
      maze.portals.set(coords[0].toString(), [coords[0], coords[1]]);
      maze.portals.set(coords[1].toString(), [coords[1], coords[0]]);
    } else {
      throw new Error(`Invalid coords length: ${coords.length}`);
    }
  }

  return maze;
}

function computePortalDistances(maze: IMaze): Map<string, number> {
  const dists = new Map();
  const visited = new Array2(maze.map.width, maze.map.height, Uint8Array);

  for (const [start] of maze.portals.values()) {
    visited.fill(0);
    const queue: Array<[Coord, number]> = [];

    queue.push([start, 0]);
    visited.write(start[0], start[1], 1);

    while (queue.length > 0) {
      const [pos, dist] = queue.shift() as [Coord, number];

      const cell = maze.map.read(pos[0], pos[1]);
      if (cell === Cell.Portal && !eqCoord(start, pos)) {
        dists.set([start, pos].toString(), dist - 2);
        dists.set([pos, start].toString(), dist - 2);
      } else {
        for (const [dx, dy] of MOVEMENTS) {
          const x = pos[0] + dx;
          const y = pos[1] + dy;

          if (!maze.map.boundCheck(x, y)) {
            continue;
          }

          const ngbCell = maze.map.read(x, y);
          if (ngbCell !== Cell.Space && ngbCell !== Cell.Portal) {
            continue;
          }

          if (visited.read(x, y)) {
            continue;
          }

          visited.write(x, y, 1);
          queue.push([[x, y], dist + 1]);
        }
      }
    }
  }

  return dists;
}

export function findMinPath(maze: IMaze, start: string, end: string): number {
  const portalDists = computePortalDistances(maze);
  const dists: Map<string, number> = new Map();
  const openSet: Set<string> = new Set();

  for (const [src] of maze.portals.values()) {
    dists.set(src.toString(), Infinity);
    openSet.add(src.toString());
  }

  const startCoord = (maze.portalCoords.get(start) as Coord[])[0];
  const endCoord = (maze.portalCoords.get(end) as Coord[])[0];
  dists.set(startCoord.toString(), 0);

  while (openSet.size > 0) {
    const [pos, dist] = findMin(openSet.keys(),
                                (p) => dists.get(p) as number);

    openSet.delete(pos);

    for (const [ngb, dst] of maze.portals.values()) {
      const ngbDist = portalDists.get([pos, ngb].toString());
      if (ngbDist === undefined) {
        continue;
      }

      if (dist + ngbDist < (dists.get(ngb.toString()) as number)) {
        dists.set(ngb.toString(), dist + ngbDist);

        // Go through portal
        if (dst[0] >= 0 && dst[1] >= 0) {
          dists.set(dst.toString(), dist + ngbDist + 1);
        }
      }
    }
  }

  return (dists.get(endCoord.toString()) as number);
}

export function findMinPathRec(maze: IMaze, start: string, end: string): number {
  const portalDists = computePortalDistances(maze);
  const dists: Map<string, number> = new Map();
  const openSet: Map<string, [Coord, number]> = new Map();

  const startCoord = (maze.portalCoords.get(start) as Coord[])[0];
  const endCoord = (maze.portalCoords.get(end) as Coord[])[0];

  function getDist(pos: Coord, level: number): number {
    const d = dists.get([pos, level].toString());
    return d === undefined ? Infinity : d;
  }

  openSet.set([startCoord, 0].toString(), [startCoord, 0]);
  dists.set([startCoord, 0].toString(), 0);

  while (openSet.size > 0) {
    const [[pos, level], dist] = findMin(openSet.values(),
                                         ([p, l]) => getDist(p, l));

    openSet.delete([pos, level].toString());

    if (eqCoord(pos, endCoord)) {
      return dist;
    }

    for (const [ngb, dst] of maze.portals.values()) {
      const outer = isOuter(maze, ngb[0], ngb[1]);

      if (outer) {
        if (level === 0) {
          if (!eqCoord(ngb, startCoord) && !eqCoord(ngb, endCoord)) {
            continue;
          }
        } else {
          if (eqCoord(ngb, startCoord) || eqCoord(ngb, endCoord)) {
            continue;
          }
        }
      }

      const ngbDist = portalDists.get([pos, ngb].toString());
      if (ngbDist === undefined) {
        continue;
      }

      if (dist + ngbDist < getDist(ngb, level)) {
        const k = [ngb, level].toString();
        dists.set(k, dist + ngbDist);
        openSet.set(k, [ngb, level]);

        if (dst[0] >= 0 && dst[1] >= 0) {
          const nlevel = outer ? Math.max(level - 1, 0) : level + 1;
          const nk = [dst, nlevel].toString();
          dists.set(nk, dist + ngbDist + 1);
          openSet.set(nk, [dst, nlevel]);
        }
      }
    }
  }

  return Infinity;
}

class ChallengeD20 extends ChallengeFromFile {
  private input: string | null = null;

  constructor() {
    super("d20");
  }

  public async solveFirstStar(): Promise<string> {
    const input = this.getInput();

    const maze = parseMap(input);

    return findMinPath(maze, "AA", "ZZ").toString();
  }

  public async solveSecondStar(): Promise<string> {
    const input = this.getInput();

    const maze = parseMap(input);

    return findMinPathRec(maze, "AA", "ZZ").toString();
  }

  private getInput(): string {
    if (this.input === null) {
      this.input = this.loadInputFile(1);
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD20());
