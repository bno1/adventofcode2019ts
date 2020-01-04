#!/usr/bin/env node

import {ChallengeRegistry} from "./challenge_registry";
import "./d01";
import "./d02";
import "./d03";
import "./d04";
import "./d05";
import "./d06";
import "./d07";
import "./d08";
import "./d09";
import "./d10";
import "./d11";
import "./d12";
import "./d13";
import "./d14";
import "./d15";
import "./d16";
import "./d17";
import "./d18";
import "./d19";
import "./d20";

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

async function run() {
  let challengeParam = null;

  for (const arg of args) {
    switch (arg) {
      case "-h":
      case "--help":
        printHelp();
        return;

      default:
        if (challengeParam === null) {
          challengeParam = arg;
        } else {
          throw new Error(`Unexpected argument "${arg}"`);
        }

        break;
    }
  }

  if (challengeParam === null) {
    throw new Error(`Challenge name not specified`);
  }

  const registry = ChallengeRegistry.getInstance();
  const challengeNames = [];
  if (challengeParam === "all") {
    challengeNames.push(...registry.listChallenges());
  } else {
    challengeNames.push(challengeParam);
  }

  for (const challengeName of challengeNames) {
    console.log(`Challenge: ${challengeName}`);
    const challenge = registry.getChallenge(challengeName);

    console.log(`First star: ${await challenge.solveFirstStar()}`);
    console.log(`Second star: ${await challenge.solveSecondStar()}`);
  }
}

run();
