import {intersectionDistance, intersectionDelay} from "../src/d03";
import "jasmine";

describe("intersectionDistance", function() {
  let cases: [string, string, number][] = [
    ['R75,D30,R83,U83,L12,D49,R71,U7,L72',
     'U62,R66,U55,R34,D71,R55,D58,R83',
     159],
    ['R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51',
     'U98,R91,D20,R16,D67,R40,U7,R15,U6,R7',
     135]
  ];

  for (let [instr1, instr2, dist] of cases) {
    it(`${instr1}, ${instr2} -> ${dist}`, function() {
      expect(intersectionDistance(instr1.split(','), instr2.split(','))).toEqual(dist);
    });
  }
});

describe("intersectionDelay", function() {
  let cases: [string, string, number][] = [
    ['R75,D30,R83,U83,L12,D49,R71,U7,L72',
     'U62,R66,U55,R34,D71,R55,D58,R83',
     610],
    ['R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51',
     'U98,R91,D20,R16,D67,R40,U7,R15,U6,R7',
     410]
  ];

  for (let [instr1, instr2, dist] of cases) {
    it(`${instr1}, ${instr2} -> ${dist}`, function() {
      expect(intersectionDelay(instr1.split(','), instr2.split(','))).toEqual(dist);
    });
  }
});
