var fs = require("fs");
var path = require("path");
var glob = require("glob");
var MUSIC_EXTENSIONS = [
  ".mp3", ".flac", ".ogg", //Audio
  ".mp4", ".webm"
];

var opts = require("nomnom")
  .option("run", {
    abbr: "r",
    flag: true,
    help: "Until this flag is set, this is a dry-run"
  }).parse();

/** GET ARTISTS **/
var getArtists = function(pattern) {
  var result = {};
  var fileArr = glob.sync(pattern);
  for (var i = 0; i < fileArr.length; i++) {
    var filename = path.basename(fileArr[i]);
    var tokens = filename.split(" - ");
    if (tokens.length > 1 && tokens[0].length > 0) {
      result[tokens[0].toLowerCase().trim()] = fileArr[i];
    }
  }
  return result;
}

/** RENAME FILES **/
var renameFiles = function(artists) {
  var raw, 
      oldPath,
      newPath,
      extension, 
      filename, 
      directory,
      counter = 0,
      i;

  for (i = 0; i < process.argv.length; i++) {
    oldPath = process.argv[i];
    directory = path.dirname(oldPath);
    filename = path.basename(oldPath);
    extension = path.extname(filename);

    if (MUSIC_EXTENSIONS.indexOf(extension) < 0) {
      continue;
    }

    raw = path.basename(filename, extension);
    raw = raw.replace(/[Ff]eat/g, "ft");
    raw = raw.replace(/Ft/g, "ft");
    raw = raw.replace(/["'\.]/g, "");
    raw = raw.replace(/[_]/g, " ");
    raw = raw.replace(/▶ /g, "");
    raw = raw.replace(/ hd720/g, "");
    raw = raw.replace(/ medium/g, "");
    raw = raw.replace(/ Official Video/g, "");
    raw = raw.replace(/ Official Music Video/g, "");
    raw = raw.replace(/ OFFICIAL VIDEO/g, "");
    raw = raw.replace(/ OFFICIAL MUSIC VIDEO/g, "");

    // raw = raw.substring(0, raw.indexOf("_Hype_Machine"));
    // raw = raw.replace(/_/g, " ");
    
    // Split artist - title
    for (var j = 0; j < raw.length; j++) {
      var test = raw.substr(0, j).toLowerCase();
      if (artists.hasOwnProperty(test)) {
        raw = raw.substr(0, j) + " - " + raw.substr(j+1);
        break;
      }
    }

    counter += 1;
    raw = raw + extension;
    newPath = path.join(directory, raw);
    console.log(raw);
    //console.log(filename + " => " + raw);
    if (opts.run) {
      fs.renameSync(oldPath, newPath);
    }
  }
  console.log("Processed " + counter + " filenames");
}

var artists = getArtists("/Users/ryscheng/Downloads/music/**/*.mp3");
renameFiles(artists);
