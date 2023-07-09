var fs = require("fs");
var youtubeAPI = require("youtube-api");
//var youtubeDL = require("youtube-dl");

/**
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
 */
