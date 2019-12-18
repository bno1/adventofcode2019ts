import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";


interface Object {
  name: string;
  parent: Object | null;
  orbiters: Object[];
  com_distance: number;
}

interface ObjectIndex {
  [key: string]: Object;
}

export function generateObjectTree(assoc: [string, string][]): ObjectIndex {
  let index: ObjectIndex = {};

  for (let [orbitee, orbiter] of assoc) {
    let oe: Object;
    let or: Object;

    if (orbitee in index) {
      oe = index[orbitee];
    } else {
      oe = {
        name: orbitee,
        parent: null,
        orbiters: [],
        com_distance: -1,
      };
      index[oe.name] = oe;
    }

    if (orbiter in index) {
      or = index[orbiter];
    } else {
      or = {
        name: orbiter,
        parent: oe,
        orbiters: [],
        com_distance: -1,
      };
      index[or.name] = or;
    }

    or.parent = oe;
    oe.orbiters.push(or);
  }

  return index;
}

export function computeDistances(obj: Object, dist: number) {
  obj.com_distance = dist;
  for (let orbiter of obj.orbiters) {
    computeDistances(orbiter, dist + 1);
  }
}

class ChallengeD06 extends ChallengeFromFile {
  private input: [string, string][] | null = null;

  constructor() {
    super("d06");
  }

  public solveFirstStar(): string {
    let input = this.getInput();

    let index = generateObjectTree(input);
    computeDistances(index["COM"], 0);

    const orbits = Object.values(index)
      .map((o) => o.com_distance)
      .reduce((s, d) => s + d, 0);

    return orbits.toString();
  }

  public solveSecondStar(): string {
    let input = this.getInput();

    let index = generateObjectTree(input);
    computeDistances(index["COM"], 0);

    const you = index["YOU"];
    const san = index["SAN"];

    let you_father = you;
    let san_father = san;

    // Frist move you_father or san_father up the tree until they reach the
    // same level (distance)
    while (you_father.com_distance > san_father.com_distance) {
      you_father = you_father.parent as Object;
    }

    while (san_father.com_distance > you_father.com_distance) {
      san_father = san_father.parent as Object;
    }

    // Them move both you_father and san_father up the tree until they reach
    // the same node (lowest common node between YOU and SAN)
    while (san_father != you_father) {
      san_father = san_father.parent as Object;
      you_father = you_father.parent as Object;
    }

    // Compute distance between YOU and the common node, SAN and the common
    // node and subtract 2 because we move YOU to orbit SAN's parent, not SAN
    const transfers = you.com_distance - you_father.com_distance
                      + san.com_distance - san_father.com_distance - 2;

    return transfers.toString();
  }

  private getInput(): [string, string][] {
    if (this.input === null) {
      this.input = this.loadInputFile(1)
        .split('\n')
        .filter((v) => v)
        .map((m) => {
          let [a, b] = m.split(')');
          return [a, b];
        });
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD06());
