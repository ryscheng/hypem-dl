#!/usr/bin/env node

import path from "path";
import ora from "ora";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { HypemDownloadArgs, hypemDownloadAll } from "./lib/hypem.js";

// If user doesn't specify a destination folder, either use the Downloads folder or a local data folder
const DEFAULT_DESTINATION = process.env.HOME
  ? path.resolve(process.env.HOME, "./Downloads/")
  : path.resolve("./data");

// Use yargs to parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option("slug", {
    type: "string",
    describe: "Hype Machine slug",
  })
  .option("page", {
    type: "number",
    describe: "Page number",
  })
  .option("destination", {
    type: "string",
    describe: "Destination directory",
    default: DEFAULT_DESTINATION,
  })
  .option("userAgent", {
    type: "string",
    describe: "User agent to use for HTTP requests",
  })
  .option("cookie", {
    type: "string",
    describe: "Cookie to use for HTTP requests",
  })
  .demandOption(["slug"])
  .strict()
  .help("h")
  .alias("h", "help")
  .argv;

async function main() {
  const args = argv as HypemDownloadArgs;
  console.log("Fetching tracks...");
  console.log(`Downloading to ${args.destination}...`);

  const firstSpinner = ora('Getting streaming URLs').start();
  const secondSpinner = ora('Downloading tracks');
  const promise = hypemDownloadAll(args);
  promise.onProgress(p => {
    secondSpinner.suffixText = `${Math.round(p * 100.0)}%`;
    if (firstSpinner.isSpinning) {
      firstSpinner.succeed();
      secondSpinner.start();
    }
    if (p >= 1) {
      secondSpinner.succeed();
    }
  });
  const results = await promise;
  const errored = results.filter(r => !["DOWNLOAD_SUCCESS", "DOWNLOAD_SKIPPED"].includes(r._type));
  const succeeded = results.filter(r => r._type === "DOWNLOAD_SUCCESS");
  const skipped = results.filter(r => r._type === "DOWNLOAD_SKIPPED");
  ora(`Processed ${results.length} tracks`).start().succeed();
  console.log(`  ${succeeded.length} downloaded`);
  console.log(`  ${skipped.length} skipped`);
  console.log(`  ${errored.length} errors`);
  for (const e of errored) {
    e._type === "NOT_FOUND"
      ? console.warn(`${e.message}: ${e.trackInfo.artist} - ${e.trackInfo.song}`)
      : console.warn(`Failed to download ${e.artist} - ${e.title}`);
  }
}
main();
