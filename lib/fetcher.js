var fs = require("fs");
var youtubeAPI = require("youtube-api");
//var youtubeDL = require("youtube-dl");

var Fetcher = function(key) {
  this._key = key;
  this._queue = [];
  this._init();
};

Fetcher.prototype.addToQueue = function(query, outFile) {
  // If don't already have video
  fs.stat(outFile, function(query, outFile, err, stats) {
    if (stats) {
      console.log(outFile + " already exists. Skipping...");
      return;
    }
    youtubeAPI.search.list({
      q: query,
      part: "snippet",
      safeSearch: "none",
      type: "video",
      maxResults: 5,
      order: "relevance"
    }, function(outFile, err, data) {
      if (err) {
        console.log("Error searching YT for " + outFile + ". Skipping...");
        return;
      }
      for (var i = 0; i < data.items.length; i++) {
        var videoId = data.items[i].id.videoId;
        var title = data.items[i].snippet.title;
        var desc = data.items[i].snippet.description;
        console.log(title);
        // Check for "Official Music Video"
        // this._queue.push(elt.id.videoId);
      }
    }.bind(this, outFile));
  }.bind(this, query, outFile));
  /**
    **/
};

Fetcher.prototype.finish = function(cb) {
  cb();
};

Fetcher.prototype.printSummary = function() {
};

Fetcher.prototype._init = function() {
  youtubeAPI.authenticate({
    type: "key",
    key: this._key
  });
};

module.exports = Fetcher;
