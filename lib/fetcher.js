var youtubeAPI = require("youtube-api");
var youtubeDL = require("youtube-dl");

var Fetcher = function(key) {
  this._key = key;
  this._queue = [];
  this._init();
};

Fetcher.prototype.addToQueue = function(query, outFile) {
  youtubeAPI.search.list({
    q: query,
    part: "snippet",
    safeSearch: "none",
    type: "video",
    maxResults: 5,
    order: "relevance"
  }, function(err, data) {
    if (err) {
      console.log(err);
    }
    console.log(data);
    for (var i = 0; i < data.items.length; i++) {
      var elt = data.items[i];
      console.log(elt);
      // Check for Official Music Video
      // this._queue.push(elt.id.videoId);
    }
  }.bind(this));
};

Fetcher.prototype.finish = function(cb) {

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
