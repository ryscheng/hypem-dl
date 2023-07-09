# hypem-dl

Fetches mp3 files from Hype Machine

## Installation

```bash
npm install hypem-dl
# or yarn add hypem-dl
```

## Usage

### Download files

This will download up to 50 tracks as mp3 files to a local directory.
Files are named `${artist} - ${title}.mp3`.
The only required parameter is the `slug`.

```js
import { HypemDownloadArgs, hypemDownloadAll } from "hypem-dl";

// Full list of arguments you can pass in
const args: HypemDownloadArgs = {
  // Which local folder to store the mp3 files (defaults to user home downloads folder)
  destination: "./data/";
  // "popular", "latest", or a username
  slug: "popular";
  // Which page to retrieve (starts at 1)
  page: 1;
  // HTTP User-Agent override
  userAgent: "USERAGENT";
  // HTTP Cookie override
  cookie: "COOKIE";
};
await hypemDownloadAll({ slug: "popular" });
```

#### Progress reporting

Because we download sequentially, the promise exposes an `onProgress` function for responding to progress.

```js
const promise = hypemDownloadAll(args);
promise.onProgress(p => {
  // `p` is a value from 0 to 1
  console.log(p);
});
```

### Get URLs for MP3 files

This will return information for up to 50 tracks
(e.g. artist, song title, and a streaming URL),
leaving it up to you how to use the URLs.
Use the second `page` parameter to retrieve more than 50 tracks.


```js
import { TrackStatus, getStreamUrls } from "hypem-dl";

const results: TrackStatus[] = await getStreamUrls("popular", 1);
```

As a third optional parameter, you can override select HTTP headers.

```js
const headerOverrides = {
  "User-Agent": "USERAGENT";
  Cookie: "COOKIES";
};
const results: TrackStatus[] = await getStreamUrls("popular", 1, headerOverrides);
```

## Run as a CLI

Download up to 50 tracks at a time from Hype Machine.
Use the `page` parameter to retrieve more than 50 tracks.

```bash
npx hypem-dl --slug popular
```

Options:
- `--destination DIRECTORY_PATH` - Store files here (Default: user Downloads directory)
- `--page NUMBER` - Starts at 1 (Default: 1)

## Lint

```bash
yarn lint
```

As of now, this just runs `prettier` manually.

## Misc

### YouTube searches

We included a utility script for opening up a bunch of YouTube searches off the commandline.

For example, if you want to perform a YouTube search for every filename in
in the current directory:

```bash
ls | node src/bin/youtube_search.cjs
```

This will automatically open the default browser.
Once you have the YouTube URL you care about, you can use 
[youtube-dl](https://github.com/ytdl-org/youtube-dl)
to download the media.
