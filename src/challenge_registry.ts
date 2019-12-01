import {IChallenge} from "./challenge";

export class ChallengeRegistry {
  public static getInstance(): ChallengeRegistry {
    if (!this.instance) {
      this.instance = new ChallengeRegistry();
    }

    return this.instance;
  }

  private static instance: ChallengeRegistry;
  private challenges: { [id: string]: IChallenge } = {};

  private constructor() {

  }

  public getChallenge(name: string): IChallenge {
    if (name in this.challenges) {
      return this.challenges[name];
    } else {
      throw new Error(`Challenge "${name}" not registered`);
    }
  }

  public registerChallenge(name: string, challenge: IChallenge) {
    if (name in this.challenges) {
      throw new Error(`Challenge "${name}" already registered`);
    }

    this.challenges[name] = challenge;
  }
}