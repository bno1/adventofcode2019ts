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

describe("test programs d05", function() {
  const cases = [
    [[1002,4,3,4,33], [1002,4,3,4,99]],
    [[1101,100,-1,4,0], [1101,100,-1,4,99]],
  ];

  for (let [initial, final] of cases) {
    it(`program ${initial} evaluates to ${final}`, function() {
      let state = [...initial];
      runIntcode(state);
      expect(state).toEqual(final);
    });
  }

  const io_cases = [
    [[3,9,8,9,10,9,4,9,99,-1,8], [8], [1]],
    [[3,9,8,9,10,9,4,9,99,-1,8], [0], [0]],
    [[3,9,7,9,10,9,4,9,99,-1,8], [8], [0]],
    [[3,9,7,9,10,9,4,9,99,-1,8], [0], [1]],
    [[3,3,1108,-1,8,3,4,3,99], [8], [1]],
    [[3,3,1108,-1,8,3,4,3,99], [0], [0]],
    [[3,3,1107,-1,8,3,4,3,99], [8], [0]],
    [[3,3,1107,-1,8,3,4,3,99], [0], [1]],
    [[3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9], [0], [0]],
    [[3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9], [1], [1]],
    [[3,3,1105,-1,9,1101,0,0,12,4,12,99,1], [0], [0]],
    [[3,3,1105,-1,9,1101,0,0,12,4,12,99,1], [1], [1]],
    [[3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31, 1106,0,36,98,0,0,
      1002,21,125,20,4,20,1105,1,46,104, 999,1105,1,46,1101,1000,1,20,4,20,
      1105,1,46,98,99], [7], [999]],
    [[3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31, 1106,0,36,98,0,0,
      1002,21,125,20,4,20,1105,1,46,104, 999,1105,1,46,1101,1000,1,20,4,20,
      1105,1,46,98,99], [8], [1000]],
    [[3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31, 1106,0,36,98,0,0,
      1002,21,125,20,4,20,1105,1,46,104, 999,1105,1,46,1101,1000,1,20,4,20,
      1105,1,46,98,99], [9], [1001]],
  ];

  for (let [program, input, output] of io_cases) {
    it(`program ${program} with input ${input} output ${output}`, function() {
      let state = [...program];
      expect(runIntcode(state, input)).toEqual(output);
    });
  }
});

describe("test programs d09", function() {
  const cases = [
    [[109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99],
     [109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99]],
    [[104,1125899906842624,99], [1125899906842624]],
  ];

  for (let [initial, output] of cases) {
    it(`program ${initial} outputs ${output}`, function() {
      let state = [...initial];
      expect(runIntcode(state)).toEqual(output);
    });
  }

  it (`program outputs 16-digit integer`, function() {
    let output = runIntcode([1102,34915192,34915192,7,4,7,99,0]);
    expect(output.length).toEqual(1);
    expect(output[0].toString().length).toEqual(16);
  });
});
