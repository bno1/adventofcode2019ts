interface IArray1 {
  readonly length: number;
  [idx: number]: number;

  fill(value: number, start?: number, end?: number): this;

  slice(start?: number, end?: number): this;

  set(array: number[]): void;

  forEach(callback: (v: number, i: number, arr: this) => void): void;

  find(predicate: (value: number, index: number, obj: this) => boolean,
       thisArg?: any): number | undefined;
}

type IArray1Constructor<T> = new(size: number) => T;

export class Array2<T extends IArray1> {
  public readonly width: number;
  public readonly height: number;
  private data: T;

  constructor(width: number, height: number, constr: IArray1Constructor<T>) {
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
    const rows = [];

    for (let i = 0; i < this.height; i++) {
      rows.push(this.data.slice(i * this.width, (i + 1) * this.width));
    }

    return rows;
  }

  public boundCheck(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  public find(
    predicate: (value: number, index: number, obj: T) => boolean,
    thisArg?: any,
  ): number | undefined {
    return this.data.find(predicate, thisArg);
  }

  public clone(): Array2<T> {
    const array = Object.create(Array2.prototype);
    array.width = this.width;
    array.height = this.height;
    array.data = this.data.slice();

    return array;
  }

  public toString(): string {
    return this.rows().map((r) => r.toString()).join("\n");
  }
}
