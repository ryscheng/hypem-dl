const path = require("path");
const readline = require("readline");
const open = require("open");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("close", () => process.exit(0));
// For each line, open a youtube search
rl.on("line", (line) => {
  // Assume the filename is enough for the search terms
  const searchTerms = path.basename(line, path.extname(line));
  //searchTerms = searchTerms.split(" - ")[0];
  open(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(
      searchTerms,
    )}`,
  );
  rl.prompt();
});
rl.setPrompt("");
rl.prompt();
