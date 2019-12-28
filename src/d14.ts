import {ChallengeFromFile} from "./challenge";
import {ChallengeRegistry} from "./challenge_registry";

interface IReactionInput {
  qty: number;
  name: string;
}

interface IReaction {
  qty: number;
  chems: IReactionInput[];
}

interface IReactions {
  [chem: string]: IReaction;
}

export function parseReactions(input: string): IReactions {
  const reactions: IReactions = {};

  for (const line of input.split("\n")) {
    if (!line) {
      continue;
    }

    const m = line.match(/^(.*)=>\s*(\d+)\s+(\S+)\s*$/);
    if (m == null) {
      throw new Error(`Failed to parse line ${line}`);
    }

    const prodQty = parseInt(m[2], 10);
    const prod = m[3];
    const chems = [];

    for (const chem of m[1].split(",")) {
      const cm = chem.match(/^\s*(\d+)\s+(\S+)\s*$/);
      if (cm == null) {
        throw new Error(`Failed to parse list of input chemicals: ${m[1]}`);
      }

      chems.push({qty: parseInt(cm[1], 10), name: cm[2]});
    }

    reactions[prod] = {qty: prodQty, chems};
  }

  return reactions;
}

export function computeNeeded(
  product: string, qtyProd: number, base: string, reactions: IReactions,
): number {
  // State holds the number of each chemical needed. The quantity can be
  // negative, denoting the surplus left over from production.
  const state: {[chem: string]: number} = {};
  let done = false;

  for (const chem of Object.keys(reactions)) {
    state[chem] = 0;
  }

  state[product] = qtyProd;
  state[base] = 0;

  while (!done) {
    done = true;

    for (const chem of Object.keys(state)) {
      if (chem === base) {
        continue;
      }

      const needed = state[chem];
      if (needed > 0) {
        done = false;
        const reaction = reactions[chem];
        const n = Math.ceil(needed / reaction.qty);

        state[chem] -= n * reaction.qty;

        for (const inChem of reaction.chems) {
          state[inChem.name] += n * inChem.qty;
        }
      }
    }
  }

  return state[base];
}

export function computeProduction(
  product: string, base: string, qtyBase: number, reactions: IReactions,
): number {
  // Perform a binary search over the quantity of fuel produced.
  const lookupTable: {[key: number]: number} = {};

  function getNeeded(n: number): number {
    if (n in lookupTable) {
      return lookupTable[n];
    }

    const needed = computeNeeded(product, n, base, reactions);
    lookupTable[n] = needed;
    return needed;
  }

  let lb = 0;
  let ub = 2;

  while (ub - lb > 1) {
    const qtyLB = getNeeded(lb);
    const qtyUB = getNeeded(ub);

    // If [ub, lb] are too small or too large then double/half them.
    if (qtyLB > qtyBase) {
      ub = lb;
      lb = Math.trunc(lb / 2);
      continue;
    } else if (qtyUB <= qtyBase) {
      lb = ub;
      ub = ub * 2;
      continue;
    }

    const mid = Math.trunc((lb + ub) / 2);
    const qtyMid = getNeeded(mid);

    if (qtyMid <= qtyBase) {
      lb = mid;
      continue;
    } else {
      ub = mid;
      continue;
    }
  }

  return lb;
}

class ChallengeD14 extends ChallengeFromFile {
  private input: IReactions | null = null;

  constructor() {
    super("d14");
  }

  public async solveFirstStar(): Promise<string> {
    const input = this.getInput();

    return computeNeeded("FUEL", 1, "ORE", input).toString();
  }

  public async solveSecondStar(): Promise<string> {
    const input = this.getInput();

    return computeProduction("FUEL", "ORE", 1000000000000, input).toString();
  }

  private getInput(): IReactions {
    if (this.input === null) {
      this.input = parseReactions(this.loadInputFile(1));
    }

    return this.input;
  }
}

ChallengeRegistry.getInstance().registerChallenge(new ChallengeD14());
