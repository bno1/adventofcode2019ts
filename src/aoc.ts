#!/usr/bin/env node

import {ChallengeRegistry} from "./challenge_registry";
import "./d01";

const args: string[] = process.argv.slice(2);

function printHelp() {
  console.log(`
node aoc.js [options]

options:
  -h, --help               print this help message
  CHALLENGE                name of challenge to solve
                           e.g. d01, d02, d20
`);
}

function run() {
  let challengeName = null;

  for (const arg of args) {
    switch (arg) {
      case "-h":
      case "--help":
        printHelp();
        return;

      default:
        if (challengeName === null) {
          challengeName = arg;
        } else {
          throw new Error(`Unexpected argument "${arg}"`);
        }

        break;
    }
  }

  if (challengeName === null) {
    throw new Error(`Challenge name not specified`);
  }

  const registry = ChallengeRegistry.getInstance();
  const challenge = registry.getChallenge(challengeName);

  console.log(`First star: ${challenge.solveFirstStar()}`);
  console.log(`Second star: ${challenge.solveSecondStar()}`);
}

run();