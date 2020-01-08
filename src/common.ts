export const BI_ONE = BigInt(1);
export const BI_ZERO = BigInt(0);

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

export function extendedEuler(a: number, b: number): [number, number, number] {
  let q = 0;
  const r = [a, b];
  const s = [1, 0];
  const t = [0, 1];
  let i = 0;
  let j = 1 - i;

  while (r[j] !== 0) {
    q = Math.trunc(r[i] / r[j]);
    r[i] -= q * r[j];
    s[i] -= q * s[j];
    t[i] -= q * t[j];

    i = j;
    j = 1 - i;
  }

  return [q, s[i], t[i]];
}

export function extendedEulerBig(a: bigint, b: bigint): [bigint, bigint, bigint] {
  let q = BI_ZERO;
  const r = [a, b];
  const s = [BI_ONE, BI_ZERO];
  const t = [BI_ZERO, BI_ONE];
  let i = 0;
  let j = 1 - i;

  while (r[j] !== BI_ZERO) {
    q = r[i] / r[j];
    r[i] -= q * r[j];
    s[i] -= q * s[j];
    t[i] -= q * t[j];

    i = j;
    j = 1 - i;
  }

  return [q, s[i], t[i]];
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
