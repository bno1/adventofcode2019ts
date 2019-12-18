import {generateObjectTree, computeDistances} from "../src/d06";
import "jasmine";

describe("test exmple d06", function() {
  const input: [string, string][] = [
    ["COM", "B"],
    ["B", "C"],
    ["C", "D"],
    ["D", "E"],
    ["E", "F"],
    ["B", "G"],
    ["G", "H"],
    ["D", "I"],
    ["E", "J"],
    ["J", "K"],
    ["K", "L"],
  ];

  it(`COM distance sum equals 42`, function() {
    let index = generateObjectTree(input);
    computeDistances(index["COM"], 0);

    const orbits = Object.values(index)
      .map((o) => o.com_distance)
      .reduce((s, d) => s + d, 0);

    expect(orbits).toEqual(42);
  });
});
