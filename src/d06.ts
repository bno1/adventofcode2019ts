import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";

interface IObject {
  com_distance: number;
  name: string;
  orbiters: IObject[];
  parent: IObject | null;
}

interface IObjectIndex {
  [key: string]: IObject;
}

export function generateObjectTree(assoc: Array<[string, string]>): IObjectIndex {
  const index: IObjectIndex = {};

  for (const [orbitee, orbiter] of assoc) {
    let oe: IObject;
    let or: IObject;

    if (orbitee in index) {
      oe = index[orbitee];
    } else {
      oe = {
        com_distance: -1,
        name: orbitee,
        orbiters: [],
        parent: null,
      };
      index[oe.name] = oe;
    }

    if (orbiter in index) {
      or = index[orbiter];
    } else {
      or = {
        com_distance: -1,
        name: orbiter,
        orbiters: [],
        parent: oe,
      };
      index[or.name] = or;
    }

    or.parent = oe;
    oe.orbiters.push(or);
  }

  return index;
}

export function computeDistances(obj: IObject, dist: number) {
  obj.com_distance = dist;
  for (const orbiter of obj.orbiters) {
    computeDistances(orbiter, dist + 1);
  }
}

class ChallengeD06 extends ChallengeFromFile {
  private input: Array<[string, string]> | null = null;

  constructor() {
    super("d06");
  }

  public solveFirstStar(): string {
    const input = this.getInput();

    const index = generateObjectTree(input);
    computeDistances(index.COM, 0);

    const orbits = Object.values(index)
      .map((o) => o.com_distance)
      .reduce((s, d) => s + d, 0);

    return orbits.toString();
  }

  public solveSecondStar(): string {
    const input = this.getInput();

    const index = generateObjectTree(input);
    computeDistances(index.COM, 0);

    const you = index.YOU;
    const san = index.SAN;

    let youFather = you;
    let sanFather = san;

    // Frist move youFather or sanFather up the tree until they reach the
    // same level (distance)
    while (youFather.com_distance > sanFather.com_distance) {
      youFather = youFather.parent as IObject;
    }

    while (sanFather.com_distance > youFather.com_distance) {
      sanFather = sanFather.parent as IObject;
    }

    // Them move both youFather and sanFather up the tree until they reach
    // the same node (lowest common node between YOU and SAN)
    while (sanFather !== youFather) {
      sanFather = sanFather.parent as IObject;
      youFather = youFather.parent as IObject;
    }

    // Compute distance between YOU and the common node, SAN and the common
    // node and subtract 2 because we move YOU to orbit SAN's parent, not SAN
    const transfers = you.com_distance - youFather.com_distance
                      + san.com_distance - sanFather.com_distance - 2;

    return transfers.toString();
  }

  private getInput(): Array<[string, string]> {
    if (this.input === null) {
      this.input = this.loadInputFile(1)
        .split("\n")
        .filter((v) => v)
        .map((m) => {
          const [a, b] = m.split(")");
          return [a, b];
        });
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD06());
