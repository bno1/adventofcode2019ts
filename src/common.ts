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
