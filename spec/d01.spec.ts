import {computeFuelNeeded, computeFuelNeeded2} from "../src/d01";
import "jasmine";

describe("computeFuelNeeded", function() {
  for (let [mass, fuel] of [[12, 2], [14, 2], [1969, 654], [100756, 33583]]) {
    it(`mass ${mass} -> fuel ${fuel}`, function() {
      expect(computeFuelNeeded(mass)).toEqual(fuel);
    });
  }
});

describe("computeFuelNeeded2", function() {
  for (let [mass, fuel] of [[12, 2], [14, 2], [1969, 966], [100756, 50346]]) {
    it(`mass ${mass} -> fuel ${fuel}`, function() {
      expect(computeFuelNeeded2(mass)).toEqual(fuel);
    });
  }
});
