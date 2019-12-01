import fs from "fs";
import path from "path";

export interface IChallenge {
  readonly name: string;

  solveFirstStar(): string;
  solveSecondStar(): string;
}

export abstract class ChallengeFromFile implements IChallenge {
  public readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  public abstract solveFirstStar(): string;
  public abstract solveSecondStar(): string;

  protected loadInputFile(star: number): string {
    const filename = path.join(__dirname, `../inputs/${this.name}_${star}.txt`);

    return fs.readFileSync(filename).toString();
  }
}
