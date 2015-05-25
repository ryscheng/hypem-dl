var path = require("path");
var readline = require("readline");
var Fetcher = require("./lib/fetcher");

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var youtubeKey = process.env.YOUTUBE_KEY;
var fetch = new Fetcher(youtubeKey);

rl.setPrompt("");
rl.prompt();

rl.on("line", function(line) {
  var searchTerms = path.basename(line, path.extname(line));
  // If don't already have video
  fetch.addToQueue(searchTerms, searchTerms + ".mp4");
  rl.prompt();
});

rl.on("close", function() {
  fetch.finish(function() {
    process.exit(0);
  });
});
