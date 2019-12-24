import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";
import {Array2} from "./array2";


type Layer = Array2<Uint8Array>;

const IMAGE_WIDTH = 25;
const IMAGE_HEIGHT = 6;
const IMAGE_PIXELS = IMAGE_WIDTH * IMAGE_HEIGHT;

function readLayers(pixels: number[]): Layer[] {
  let layers: Layer[] = [];

  for (let i = 0; i < pixels.length; i += IMAGE_PIXELS) {
    let layer = new Array2(IMAGE_WIDTH, IMAGE_HEIGHT, Uint8Array);
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

  public solveFirstStar(): string {
    let input = this.getInput();
    let layers = readLayers(input);
    let best_counts: {[key: number]: number} = {
      0: Infinity
    };

    for (let layer of layers) {
      let counts: {[key: number]: number} = {0: 0, 1: 0, 2: 0};

      layer.forEach((v) => counts[v]++);
      if (counts[0] < best_counts[0]) {
        best_counts = counts;
      }
    }

    return (best_counts[1] * best_counts[2]).toString();
  }

  public solveSecondStar(): string {
    let input = this.getInput();
    let layers = readLayers(input);

    let render = new Array2(IMAGE_WIDTH, IMAGE_HEIGHT, Uint8Array);
    render.fill(2);

    for (let layer of layers) {
      for (let y = 0; y < render.height; y++) {
        for (let x = 0; x < render.width; x++) {
          if (render.read(x, y) == 2) {
            const v = layer.read(x, y);
            if (v != 2) {
              render.write(x, y, v);
            }
          }
        }
      }
    }

    return '\n' + render.rows()
      .map((row) => Array.from(row).map((v) => [' ', '█'][v]).join(''))
      .join('\n');
  }

  private getInput(): number[] {
    if (this.input === null) {
      this.input = this.loadInputFile(1)
        .split('')
        .filter((m) => m >= '0' && m <= '9')
        .map((m) => parseInt(m, 10));
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD08());
