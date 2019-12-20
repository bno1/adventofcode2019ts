import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";


const IMAGE_WIDTH = 25;
const IMAGE_HEIGHT = 6;
const IMAGE_PIXELS = IMAGE_WIDTH * IMAGE_HEIGHT;

class Layer {
  pixels: Uint8Array;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.pixels = new Uint8Array(this.width * this.height);
  }

  get(x: number, y: number): number {
    return this.pixels[x + y * this.width];
  }

  set(x: number, y: number, v: number) {
    this.pixels[x + y * this.width] = v;
  }

  setArray(arr: number[]) {
    if (this.pixels.length != arr.length) {
      throw new Error(
        `Array length ${arr.length} differs from layer size` +
        `${this.width}x${this.height}`);
    }

    this.pixels.set(arr);
  }

  rows(): Uint8Array[] {
    let rows: Uint8Array[] = [];

    for (let i = 0; i < this.height; i++) {
      rows.push(this.pixels.slice(i * this.width, (i+1) * this.width));
    }

    return rows;
  }
}

function readLayers(pixels: number[]): Layer[] {
  let layers: Layer[] = [];

  for (let i = 0; i < pixels.length; i += IMAGE_PIXELS) {
    let layer = new Layer(IMAGE_WIDTH, IMAGE_HEIGHT);
    layer.setArray(pixels.slice(i, i + IMAGE_PIXELS));
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

      layer.pixels.forEach((v) => counts[v]++);
      if (counts[0] < best_counts[0]) {
        best_counts = counts;
      }
    }

    return (best_counts[1] * best_counts[2]).toString();
  }

  public solveSecondStar(): string {
    let input = this.getInput();
    let layers = readLayers(input);

    let render = new Layer(IMAGE_WIDTH, IMAGE_HEIGHT);
    render.pixels.fill(2);

    for (let layer of layers) {
      for (let y = 0; y < render.height; y++) {
        for (let x = 0; x < render.width; x++) {
          if (render.get(x, y) == 2) {
            const v = layer.get(x, y);
            if (v != 2) {
              render.set(x, y, v);
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
