var path = require("path");
var readline = require("readline");
var open = require("open");

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var youtubeKey = process.env.YOUTUBE_KEY;

rl.setPrompt("");
rl.prompt();

rl.on("line", function(line) {
  var dir = path.dirname(line);
  var searchTerms = path.basename(line, path.extname(line));

  searchTerms = searchTerms.split(" - ")[0];
  open("https://www.youtube.com/results?search_query="+encodeURIComponent(searchTerms));

  rl.prompt();
});

rl.on("close", function() {
  process.exit(0);
});
