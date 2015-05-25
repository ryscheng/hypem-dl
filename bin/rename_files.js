var fs = require("fs");
var path = require("path");
var MUSIC_EXTENSIONS = [".mp3", ".flac", ".ogg"];

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

  // raw = raw.replace(/►_/g, "");
  // raw = raw.substring(0, raw.indexOf("_Hype_Machine"));
  // raw = raw.replace(/_/g, " ");

  counter += 1;
  raw = raw + extension;
  newPath = path.join(directory, raw);
  console.log(raw);
  //console.log(filename + " => " + raw);

  //fs.renameSync(oldPath, newPath);

}

console.log("Processed " + counter + " filenames");
