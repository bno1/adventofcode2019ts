import {Array2} from "./array2";
import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {runIntcode} from "./intcode";

type Coord = [number, number];
type Image = Array2<Uint8Array>;

enum Dir {
  Right = 0,
  Down = 1,
  Left = 2,
  Up = 3,
}

// Vectors for the Dir enum
const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

enum Cell {
  Scaffold = "#".charCodeAt(0),
  Space = ".".charCodeAt(0),
  VaccumUp = "^".charCodeAt(0),
  VaccumDown = "v".charCodeAt(0),
  VaccumLeft = "<".charCodeAt(0),
  VaccumRight = ">".charCodeAt(0),
}

interface IGraphNode {
  idx: number;

  // ngb[i] = index of the node reached if walking the edge in the direction
  // i relative to this node.
  ngb: [number, number, number, number];
  pos: Coord;
}

interface IGraph {
  map: Map<string, IGraphNode>;
  nodes: IGraphNode[];
}

function loadImage(program: number[]): Image {
  const image: number[][] = [];
  let row = [];

  const output = runIntcode(program);
  for (const chr of output) {
    if (chr === 10) {
      if (row.length > 0) {
        image.push(row);
        row = [];
      }
    } else {
      row.push(chr);
    }
  }

  const height = image.length;
  const width = image[0].length;
  const imgArray = new Array2(width, height, Uint8Array);

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      imgArray.write(j, i, image[i][j]);
    }
  }

  return imgArray;
}

// Starting from [x, y] walk in the direction dir until reaching a dead end or
// an intersection. Return path made up of [x, y, direction].
function traverseEdge(
  image: Image, x: number, y: number, dir: number,
): Array<[number, number, number]> {
  let prevX = x;
  let prevY = y;

  x += DIRECTIONS[dir][0];
  y += DIRECTIONS[dir][1];

  const path: Array<[number, number, number]> = [];

  while (true) {
    // Save position.
    path.push([x, y, dir]);
    const ngbs = [];

    for (let d = 0; d < 4; d++) {
      const xx = x + DIRECTIONS[d][0];
      const yy = y + DIRECTIONS[d][1];

      // Skip previous visited cell.
      if (xx === prevX && yy === prevY) {
        continue;
      }

      if (!image.boundCheck(xx, yy)) {
        continue;
      }

      if (image.read(xx, yy) === Cell.Scaffold) {
        ngbs.push([xx, yy, d]);
      }
    }

    if (ngbs.length === 1) {
      // Continue along the edge.
      prevX = x;
      prevY = y;
      x = ngbs[0][0];
      y = ngbs[0][1];
      dir = ngbs[0][2];
    } else {
      // Reached dead-end or intersection.
      return path;
    }
  }
}

function buildGraph(image: Image): IGraph {
  let startx = -1;
  let starty = -1;

  // Find vaccum position.
  loop1:
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      switch (image.read(x, y)) {
        case Cell.VaccumRight:
        case Cell.VaccumLeft:
        case Cell.VaccumDown:
        case Cell.VaccumUp:
          startx = x;
          starty = y;
          break loop1;
      }
    }
  }

  // Perform a DFS from the vaccum position
  const nodes: IGraphNode[] = [];
  const nodesMap: Map<string, IGraphNode> = new Map();
  const stack = [];

  // First node is vaccum cell.
  nodes.push({
    idx: 0,
    ngb: [-1, -1, -1, -1],
    pos: [startx, starty],
  });
  nodesMap.set(nodes[0].pos.toString(), nodes[0]);

  stack.push(nodes[0]);

  while (stack.length > 0) {
    const node = stack.pop() as IGraphNode;

    // For each direction from this node.
    for (let d = 0; d < 4; d++) {
      // Skip visited neighbours.
      if (node.ngb[d] >= 0) {
        continue;
      }

      const x = node.pos[0] + DIRECTIONS[d][0];
      const y = node.pos[1] + DIRECTIONS[d][1];

      if (!image.boundCheck(x, y)) {
        continue;
      }

      if (image.read(x, y) === Cell.Scaffold) {
        // Unvisited neighbour. Walk this edge.
        const path = traverseEdge(image, node.pos[0], node.pos[1], d);
        const [endX, endY, endDir] = path[path.length - 1];

        let newNode = nodesMap.get([endX, endY].toString());
        if (newNode === undefined) {
          // Create newly discovered node.
          newNode = {
            idx: nodes.length,
            ngb: [-1, -1, -1, -1],
            pos: [endX, endY],
          };

          nodes.push(newNode);
          nodesMap.set(newNode.pos.toString(), newNode);
          stack.push(newNode);
        }

        // Set edges.
        newNode.ngb[(endDir + 2) % 4] = node.idx;
        node.ngb[d] = newNode.idx;
      }
    }
  }

  return {
    map: nodesMap,
    nodes,
  };
}

function buildPath(image: Image, graph: IGraph): string[] {
  // Start from vaccum node.
  let [x, y] = graph.nodes[0].pos;
  let dir = graph.nodes[0].ngb.findIndex((v) => v >= 0);

  // Assume the vaccum robot is facing up.
  let vaccumDir = Dir.Up;
  let steps = 0;
  const vaccumPath: string[] = [];

  // End a straight segment and save L,N or R,N in the vaccumPath.
  function endSegment() {
    if ((vaccumDir + 1) % 4 === dir) {
      vaccumPath.push(`R,${steps}`);
    } else if ((vaccumDir + 3) % 4 === dir) {
      vaccumPath.push(`L,${steps}`);
    } else {
      throw new Error("Unexpected state");
    }

    // Update vaccum direction.
    vaccumDir = dir;
    steps = 0;
  }

  while (true) {
    const path = traverseEdge(image, x, y, dir);

    // Walk all cells, record straight segments and update vaccum direction.
    for (const [, , stepDir] of path) {
      if (stepDir !== dir) {
        endSegment();
        dir = stepDir;
      }

      steps++;
    }

    const [nodeX, nodeY] = path[path.length - 1];
    const node = graph.map.get([nodeX, nodeY].toString());

    if (node === undefined) {
      throw new Error("Unexpected state");
    }

    // Walk through this node without changing direction. I assume the
    // scaffolding is looping so the robot should visit all the edges this way.
    // If the robot can't walk through the node without changing direction then
    // assume it reached the end and return.
    const nextNode = node.ngb[dir];
    if (nextNode === -1) {
      endSegment();
      break;
    } else {
      x = nodeX;
      y = nodeY;
    }
  }

  return vaccumPath;
}

function compressPath(fullPath: string[]): [string, string[]] {
  const labels: string[] = ["C", "B", "A"];

  function pathLength(path: string[]) {
    return path.length - 1 + path.reduce((s, c) => s + c.length, 0);
  }

  function helper(
    path: string[], levels: Map<string, string[]>, level: number,
    callback: (path: string[], levels: Map<string, string[]>) => void,
  ) {
    let start = 0;
    let end;

    // Find first L,N or R,N element.
    for (start = 0; start < path.length; start++) {
      if (path[start].startsWith("L") || path[start].startsWith("R")) {
        break;
      }
    }

    // None found, the whole path is made of A, B or C. Return path.
    if (start >= path.length) {
      callback(path, levels);
      return;
    }

    if (level === 0) {
      return;
    }

    // Find last L,N or R,N element in this run from start
    // (before any A, B or C).
    for (end = start; end < path.length; end++) {
      if (!path[end].startsWith("L") && !path[end].startsWith("R")) {
        break;
      }
    }

    const label = labels[level - 1];

    // Try to label a chunk from (start, start + len) where start + len <= end
    // with label.
    for (let len = end - start; len > 0; len--) {
      const chunk = path.slice(start, start + len);
      if (pathLength(chunk) > 20) {
        continue;
      }

      // Copy path.
      levels.set(label, chunk);
      const newPath = [...path];
      newPath.splice(start, len, label);

      // Replace sequences matching chunk with label.
      let i = start + 1;
      while (i + len <= newPath.length) {
        let match = true;
        for (let j = 0; j < len; j++) {
          if (newPath[i + j] !== chunk[j]) {
            match = false;
            break;
          }
        }

        if (match) {
          newPath.splice(i, len, label);
        }

        i++;
      }

      helper(newPath, levels, level - 1, callback);
    }
  }

  const solutions: Array<[string, string[]]> = [];

  helper(fullPath, new Map(), 3, (compressedPath, levels) => {
    solutions.push([
      compressedPath.join(","),
      ["A", "B", "C"].map((l) => (levels.get(l) as string[]).join(","))]);
  });

  if (solutions.length < 1) {
    throw new Error("No solutions found");
  }

  return solutions[0];
}

class ChallengeD17 extends ChallengeFromFile {
  private input: number[] | null = null;

  constructor() {
    super("d17");
  }

  public async solveFirstStar(): Promise<string> {
    const input = this.getInput();
    const image = loadImage([...input]);
    const graph = buildGraph(image);

    function isIntersection(node: IGraphNode): boolean {
      let cnt = 0;

      for (const ngb of node.ngb) {
        if (ngb >= 0) {
          cnt++;
        }
      }

      return cnt > 1;
    }

    return graph.nodes
      .filter(isIntersection)
      .reduce((s, n) => s + n.pos[0] * n.pos[1], 0)
      .toString();
  }

  public async solveSecondStar(): Promise<string> {
    const input = this.getInput();
    const image = loadImage([...input]);
    const graph = buildGraph(image);
    const path = buildPath(image, graph);
    const [routine, functions] = compressPath(path);

    const programInput = [];
    for (const line of [routine].concat(functions, ["n"])) {
      programInput.push(...(line + "\n").split("").map((v) => v.charCodeAt(0)));
    }

    const newInput = [...input];
    newInput[0] = 2;
    const output = runIntcode(newInput, programInput);

    return output[output.length - 1].toString();
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

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD17());
