interface Array1 {
  readonly length: number;
  [idx: number]: number;

  fill(value: number): this;
  fill(value: number, start: number): this;
  fill(value: number, start: number, end: number): this;

  slice(begin: number): this;
  slice(begin: number, end: number): this;

  set(array: number[]): void;

  forEach(callback: (v: number, i: number, arr: this) => void): void;
}

interface Array1Constructor<T> {
  new(size: number): T;
}

export class Array2<T extends Array1> {
  public readonly width: number;
  public readonly height: number;
  private data: T;

  constructor(width: number, height: number, constr: Array1Constructor<T>) {
    this.width = width;
    this.height = height;
    this.data = new constr(this.width * this.height);
  }

  public read(x: number, y: number): number {
    return this.data[x + y * this.width];
  }

  public write(x: number, y: number, v: number) {
    this.data[x + y * this.width] = v;
  }

  public modify(x: number, y: number, f: (v: number) => number) {
    const idx = x + y * this.width;
    this.data[idx] = f(this.data[idx]);
  }

  public set(array: number[]) {
    this.data.set(array);
  }

  public fill(value: number) {
    this.data.fill(value);
  }

  public forEach(callback: (v: number, i: number, arr: T) => void) {
    this.data.forEach(callback);
  }

  public rows(): T[] {
    let rows = [];

    for (let i = 0; i < this.height; i++) {
      rows.push(this.data.slice(i * this.width, (i + 1) * this.width));
    }

    return rows;
  }

  public toString(): string {
    let rows = [];

    for (let i = 0; i < this.height; i++) {
      rows.push(this.data.slice(i * this.width, (i + 1) * this.width));
    }

    return rows.map((r) => r.toString()).join('\n');
  }
}
