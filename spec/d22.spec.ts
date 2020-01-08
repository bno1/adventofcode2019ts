import {Ring} from "../src/d22";
import "jasmine";

describe("star1 examples", function() {
  const cases: [string, string][] = [
    ["9 8 7 6 5 4 3 2 1 0", "deal into new stack"],
    ["3 4 5 6 7 8 9 0 1 2", "cut 3"],
    ["6 7 8 9 0 1 2 3 4 5", "cut -4"],
    ["0 7 4 1 8 5 2 9 6 3", "deal with increment 3"],
    ["0 3 6 9 2 5 8 1 4 7", "deal with increment 7"],
    ["0 3 6 9 2 5 8 1 4 7",
     "deal with increment 7\n" +
     "deal into new stack\n" +
     "deal into new stack\n",
    ],
    ["3 0 7 4 1 8 5 2 9 6",
     "cut 6\n" +
     "deal with increment 7\n" +
     "deal into new stack\n",
    ],
    ["6 3 0 7 4 1 8 5 2 9",
     "deal with increment 7\n" +
     "deal with increment 9\n" +
     "cut -2\n",
    ],
    ["9 2 5 8 1 4 7 0 3 6",
     "deal into new stack\n" +
     "cut -2\n" +
     "deal with increment 7\n" +
     "cut 8\n" +
     "cut -4\n" +
     "deal with increment 7\n" +
     "cut 3\n" +
     "deal with increment 9\n" +
     "deal with increment 3\n" +
     "cut -1\n",
    ],
  ];

  const ring = new Ring(BigInt(10));

  for (const [result, input] of cases) {
    it (`Result is ${result}`, function() {
      const shuffles = input.split("\n")
                            .filter((l) => l)
                            .map((l) => ring.parseShuffle(l));
      const shuffle = ring.composeShuffles(shuffles);

      const res = new Array(10);
      for (let i = 0; i < 10; i++) {
        res[Number(ring.applyShuffle(shuffle, BigInt(i)))] = i;
      }

      expect(res.join(" ")).toEqual(result);

      const ishuffle = ring.inverseShuffle(shuffle);

      for (let i = 0; i < 10; i++) {
        res[i] = ring.applyShuffle(ishuffle, BigInt(i));
      }

      expect(res.join(" ")).toEqual(result);
    });
  }
});

describe("star2 examples", function() {
  const cases: string[] = [
    "deal into new stack",
    "cut 3",
    "cut -4",
    "deal with increment 3",
    "deal with increment 7",
    "deal with increment 7\n" +
    "deal into new stack\n" +
    "deal into new stack\n",
    "cut 6\n" +
    "deal with increment 7\n" +
    "deal into new stack\n",
    "deal with increment 7\n" +
    "deal with increment 9\n" +
    "cut -2\n",
    "deal into new stack\n" +
    "cut -2\n" +
    "deal with increment 7\n" +
    "cut 8\n" +
    "cut -4\n" +
    "deal with increment 7\n" +
    "cut 3\n" +
    "deal with increment 9\n" +
    "deal with increment 3\n" +
    "cut -1\n",
  ];

  const ring = new Ring(BigInt(13));
  const base: bigint[] = [];
  for (let i = 0; i < 13; i++) {
    base.push(BigInt(i));
  }

  for (const idx in cases) {
    for (const cnt of [1, 10, 50, 100]) {
      it (`${idx} works with cnt ${cnt}`, function() {
        const shuffles = cases[idx].split("\n")
                              .filter((l) => l)
                              .map((l) => ring.parseShuffle(l));

        const shuffle = ring.composeShuffles(shuffles);
        const res = [...base];
        for (let k = 0; k < cnt; k++) {
          const tmp = [...res];
          for (let i = 0; i < base.length; i++) {
            res[Number(ring.applyShuffle(shuffle, BigInt(i)))] = tmp[i];
          }
        }

        const ishuffle = ring.inverseShuffle(shuffle);
        const res2 = [...base];
        for (let k = 0; k < cnt; k++) {
          const tmp = [...res2];
          for (let i = 0; i < base.length; i++) {
            res2[i] = tmp[Number(ring.applyShuffle(ishuffle, BigInt(i)))];
          }
        }

        expect(res.join(" ")).toEqual(res2.join(" "));

        const pishuffle = ring.powShuffle(ishuffle, BigInt(cnt));
        const res3 = [...base];
        for (let i = 0; i < base.length; i++) {
          res3[i] = ring.applyShuffle(pishuffle, BigInt(i));
        }

        expect(res3.join(" ")).toEqual(res.join(" "));
      });
    }
  }
});
