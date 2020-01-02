import {parseMap, findMinRoute} from "../src/d18";
import "jasmine";

describe("star1 examples", function() {
  const cases: [number, string][] = [
    [8,
     "#########\n" +
     "#b.A.@.a#\n" +
     "#########\n",
    ],
    [86,
     "########################\n" +
     "#f.D.E.e.C.b.A.@.a.B.c.#\n" +
     "######################.#\n" +
     "#d.....................#\n" +
     "########################\n",
    ],
    [132,
     "########################\n" +
     "#...............b.C.D.f#\n" +
     "#.######################\n" +
     "#.....@.a.B.c.d.A.e.F.g#\n" +
     "########################\n",
    ],
    [136,
     "#################\n" +
     "#i.G..c...e..H.p#\n" +
     "########.########\n" +
     "#j.A..b...f..D.o#\n" +
     "########@########\n" +
     "#k.E..a...g..B.n#\n" +
     "########.########\n" +
     "#l.F..d...h..C.m#\n" +
     "#################\n",
    ],
    [81,
     "########################\n" +
     "#@..............ac.GI.b#\n" +
     "###d#e#f################\n" +
     "###A#B#C################\n" +
     "###g#h#i################\n" +
     "########################\n",
    ],
  ];

  for (const [minRoute, input] of cases) {
    it (`Min route is ${minRoute} steps`, function() {
      const maze = parseMap(input);

      expect(findMinRoute(maze)).toEqual(minRoute);
    });
  }
});

describe("star2 examples", function() {
  const cases: [number, string][] = [
    [8,
     "#######\n" +
     "#a.#Cd#\n" +
     "##@#@##\n" +
     "#######\n" +
     "##@#@##\n" +
     "#cB#Ab#\n" +
     "#######\n",
    ],
    [24,
     "###############\n" +
     "#d.ABC.#.....a#\n" +
     "######@#@######\n" +
     "###############\n" +
     "######@#@######\n" +
     "#b.....#.....c#\n" +
     "###############\n"
    ],
    [32,
     "#############\n" +
     "#DcBa.#.GhKl#\n" +
     "#.###@#@#I###\n" +
     "#e#d#####j#k#\n" +
     "###C#@#@###J#\n" +
     "#fEbA.#.FgHi#\n" +
     "#############\n",
    ],
    [72,
     "#############\n" +
     "#g#f.D#..h#l#\n" +
     "#F###e#E###.#\n" +
     "#dCba@#@BcIJ#\n" +
     "#############\n" +
     "#nK.L@#@G...#\n" +
     "#M###N#H###.#\n" +
     "#o#m..#i#jk.#\n" +
     "#############\n"
    ],
  ];

  for (const [minRoute, input] of cases) {
    it (`Min route is ${minRoute} steps`, function() {
      const maze = parseMap(input, false);

      expect(findMinRoute(maze)).toEqual(minRoute);
    });
  }
});
