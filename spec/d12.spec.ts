import {Vec3, createMoons, runNBody, computeEnergy, findCycle} from "../src/d12";
import "jasmine";

describe("star1 examples", function() {
  const cases: [Vec3[], number, number][] = [
    [[[-1, 0, 2],
      [2, -10, -7],
      [4, -8, 8],
      [3, 5, -1],
     ],
     10,
     179
    ],
    [[[-8,-10, 0],
      [5, 5, 10],
      [2, -7, 3],
      [9, -8, -3],
     ],
     100,
     1940
    ],
  ];

  for (const [positions, iters, eng] of cases) {
    it (`Has energy ${eng} after ${iters} iterations`, function() {
      let moons = createMoons(positions);

      for (let i = 0; i < iters; i++) {
        runNBody(moons);
      }

      expect(computeEnergy(moons)).toEqual(eng);
    });
  }
});

describe("star2 examples", function() {
  const cases: [Vec3[], number][] = [
    [[[-1, 0, 2],
      [2, -10, -7],
      [4, -8, 8],
      [3, 5, -1],
     ],
     2772,
    ],
    [[[-8,-10, 0],
      [5, 5, 10],
      [2, -7, 3],
      [9, -8, -3],
     ],
     4686774924,
    ],
  ];

  for (const [positions, repetition] of cases) {
    it (`Repeats after ${repetition} iterations`, function() {
      let moons = createMoons(positions);

      expect(findCycle(moons)).toEqual(repetition);
    });
  }
});
