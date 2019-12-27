import fs from "fs";
import path from "path";

export interface IChallenge {
  readonly name: string;

  solveFirstStar(): Promise<string>;
  solveSecondStar(): Promise<string>;
}

export abstract class ChallengeFromFile implements IChallenge {
  public readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  public async abstract solveFirstStar(): Promise<string>;
  public async abstract solveSecondStar(): Promise<string>;

  protected loadInputFile(star: number): string {
    const filename = path.join(__dirname, `../inputs/${this.name}_${star}.txt`);

    return fs.readFileSync(filename).toString();
  }
}
