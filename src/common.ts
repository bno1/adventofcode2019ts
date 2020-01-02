export function gcd(a: number, b: number) {
  let tmp: number;

  while (b !== 0) {
    tmp = a % b;
    a = b;
    b = tmp;
  }

  return a;
}

export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

export function findMin<T>(
  items: Iterable<T>, score: (e: T) => number,
): [T, number] {
  let minScore = Infinity;
  let e: T | null = null;

  for (const elem of items) {
    const elemScore = score(elem);
    if (elemScore < minScore) {
      minScore = elemScore;
      e = elem;
    }
  }

  if (e === null) {
    throw new Error("Empty list");
  }

  return [e, minScore];
}

export function popCountU32(v: number): number {
  // source: https://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetParallel
  v = v - ((v >> 1) & 0x55555555);                    // reuse input as temporary
  v = (v & 0x33333333) + ((v >> 2) & 0x33333333);     // temp
  return ((v + (v >> 4) & 0xF0F0F0F) * 0x1010101) >> 24; // count
}
