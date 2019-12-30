import {expandInput, fft} from "../src/d16";
import "jasmine";

describe("star1 examples", function() {
  const cases: [string, number, string][] = [
    ["12345678", 4, "01029498"],
    ["80871224585914546619083218645595", 100, "24176176"],
    ["19617804207202209144916044189917", 100, "73745418"],
    ["69317163492948606335995924319873", 100, "52432133"],
  ];

  for (const [input, phases, output] of cases) {
    it (`${input} evaluates to ${output} after ${phases} phases`, function() {
      let state = Uint8Array.from(input.split("").map((v) => parseInt(v, 10)));

      for (let i = 0; i < phases; i++) {
        state = fft(state);
      }

      expect(state.slice(0, 8).join("")).toEqual(output);
    });
  }
});

describe("star2 examples", function() {
  const cases: [string, number, string][] = [
    ["03036732577212944063491565474664", 100, "84462026"],
    ["02935109699940807407585447034323", 100, "78725270"],
    ["03081770884921959731165446850517", 100, "53553731"],
  ];

  for (const [input, phases, output] of cases) {
    it (`${input} evaluates to ${output} after ${phases} phases`, function() {
      let iinput = input.split("").map((v) => parseInt(v, 10));
      let state = expandInput(iinput, 10000);
      const offset = iinput.slice(0, 7).reduce((s, v) => s * 10 + v, 0);

      for (let i = 0; i < 100; i++) {
        state = fft(state, offset);
      }

      expect(state.slice(offset, offset + 8).join("")).toEqual(output);
    });
  }
});
