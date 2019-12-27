import {Array2} from "./array2";
import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";

type Layer = Array2<Uint8Array>;

const IMAGE_WIDTH = 25;
const IMAGE_HEIGHT = 6;
const IMAGE_PIXELS = IMAGE_WIDTH * IMAGE_HEIGHT;

function readLayers(pixels: number[]): Layer[] {
  const layers: Layer[] = [];

  for (let i = 0; i < pixels.length; i += IMAGE_PIXELS) {
    const layer = new Array2(IMAGE_WIDTH, IMAGE_HEIGHT, Uint8Array);
    layer.set(pixels.slice(i, i + IMAGE_PIXELS));
    layers.push(layer);
  }

  return layers;
}

class ChallengeD08 extends ChallengeFromFile {
  private input: number[] | null = null;

  constructor() {
    super("d08");
  }

  public async solveFirstStar(): Promise<string> {
    const input = this.getInput();
    const layers = readLayers(input);
    let bestCounts: {[key: number]: number} = {
      0: Infinity,
    };

    for (const layer of layers) {
      const counts: {[key: number]: number} = {0: 0, 1: 0, 2: 0};

      layer.forEach((v) => counts[v]++);
      if (counts[0] < bestCounts[0]) {
        bestCounts = counts;
      }
    }

    return (bestCounts[1] * bestCounts[2]).toString();
  }

  public async solveSecondStar(): Promise<string> {
    const input = this.getInput();
    const layers = readLayers(input);

    const render = new Array2(IMAGE_WIDTH, IMAGE_HEIGHT, Uint8Array);
    render.fill(2);

    for (const layer of layers) {
      for (let y = 0; y < render.height; y++) {
        for (let x = 0; x < render.width; x++) {
          if (render.read(x, y) === 2) {
            const v = layer.read(x, y);
            if (v !== 2) {
              render.write(x, y, v);
            }
          }
        }
      }
    }

    return "\n" + render.rows()
      .map((row) => Array.from(row).map((v) => [" ", "█"][v]).join(""))
      .join("\n");
  }

  private getInput(): number[] {
    if (this.input === null) {
      this.input = this.loadInputFile(1)
        .split("")
        .filter((m) => m >= "0" && m <= "9")
        .map((m) => parseInt(m, 10));
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD08());
