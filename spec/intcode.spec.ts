import {runIntcode} from "../src/intcode";
import "jasmine";

describe("test programs d02", function() {
  const cases = [
    [[1,0,0,0,99], [2,0,0,0,99]],
    [[2,3,0,3,99], [2,3,0,6,99]],
    [[2,4,4,5,99,0], [2,4,4,5,99,9801]],
    [[1,1,1,4,99,5,6,0,99], [30,1,1,4,2,5,6,0,99]]
  ];

  for (let [initial, final] of cases) {
    it(`program ${initial} evaluates to ${final}`, function() {
      let state = [...initial];
      runIntcode(state);
      expect(state).toEqual(final);
    });
  }
});
