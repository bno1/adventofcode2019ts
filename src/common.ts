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
  items: Iterable<T>, score: (e: T, idx: number) => number,
): [T, number, number] {
  let minScore = Infinity;
  let minIdx = -1;
  let e: T | null = null;
  let idx = 0;

  for (const elem of items) {
    const elemScore = score(elem, idx);
    if (elemScore < minScore) {
      minScore = elemScore;
      minIdx = idx;
      e = elem;
    }
    idx++;
  }

  if (e === null) {
    throw new Error("Empty list");
  }

  return [e, minScore, minIdx];
}

export function popCountU32(v: number): number {
  // source: https://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetParallel
  v = v - ((v >> 1) & 0x55555555);                    // reuse input as temporary
  v = (v & 0x33333333) + ((v >> 2) & 0x33333333);     // temp
  return ((v + (v >> 4) & 0xF0F0F0F) * 0x1010101) >> 24; // count
}
