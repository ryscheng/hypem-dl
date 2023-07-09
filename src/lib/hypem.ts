import fetch from "node-fetch";
import path from "path";
import * as cheerio from "cheerio";
import { ADT } from "ts-adt";
import pProgress from "p-progress";
import { downloadFile } from "./downloadFile.js";
import { assertNever } from "./common.js";

// Hype Machine URLs
const BASE_URL = "https://hypem.com";
const TRACK_BASE_URL = "https://hypem.com/serve/source";
// Default HTTP headers
const HTTP_HEADERS: HttpHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
};

/**
 * HTTP headers that we use
 */
interface HttpHeaders {
  "User-Agent": string;
  Cookie?: string;
}

interface TrackLocation {
  artist: string;
  title: string;
  url: string;
}

type TrackDownload = TrackLocation & {
  absolutePath: string;
};

/**
 * Information for a single track
 */
export type TrackStatus = ADT<{
  NOT_FOUND: {
    trackInfo: any;
    message: string;
  };
  FOUND: TrackLocation;
  DOWNLOAD_ERROR: TrackLocation & {
    message: string;
  };
  DOWNLOAD_SKIPPED: TrackDownload;
  DOWNLOAD_SUCCESS: TrackDownload;
}>;

// Clean up a filename
const cleanFilename = (s: string) =>
  s
    .replace(/[^\w \-\(\)\.]/g, "") // remove non-alphanumeric characters
    .replace(/\.{2,}/g, "."); // remove repeating periods

/**
 * Create a filename for a track
 * @param track 
 * @returns 
 */
export function makeFilename(track: TrackStatus) {
  // Throw if it's a missing track
  if (track._type !== "FOUND") {
    throw new Error(`Unexpected track type: ${track._type}`);
  }
  return cleanFilename(`${track.artist} - ${track.title}.mp3`);
}

/**
 * Retrieve track information from a Hype Machine playlist
 * Results are paginated (only retrieve 50 at a time)
 * @param hypemSlug e.g. "popular", "latest", or a username
 * @param page which page to retrieve (starts at 1)
 * @param headerOverrides
 * @returns 
 */
export async function getStreamUrls(
  hypemSlug: string,
  page?: number,
  headerOverrides?: Partial<HttpHeaders>,
): Promise<TrackStatus[]> {
  // First retrieve the front page to get a cookie
  const frontPageResponse = await fetch(BASE_URL, {
    method: "get",
    headers: { ...HTTP_HEADERS, ...headerOverrides },
  });
  if (!frontPageResponse.ok) {
    throw new Error(
      `Unable to get front page: ${frontPageResponse.statusText}`,
    );
  }

  // Get the cookie
  const cookie = headerOverrides?.Cookie ?? frontPageResponse.headers.get("set-cookie");
  if (!cookie) {
    throw new Error("No cookie found");
  }

  // Retrieve the playlist page
  //console.log(`Cookie: ${cookie}`);
  const response = await fetch(`${BASE_URL}/${hypemSlug}/${page ?? ""}`, {
    headers: {
      ...HTTP_HEADERS,
      Cookie: cookie,
      ...headerOverrides,
    },
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Unable to get page: ${response.statusText}`);
  } else if (!body) {
    throw new Error("No response body");
  }

  // Retrieve the playlist data JSON from the page
  //console.log(`Body: ${body}`);
  const $ = cheerio.load(body);
  const script = $("#displayList-data").html();
  if (!script) {
    throw new Error("No script found");
  }

  // Get the tracks from the JSON
  //console.log(`Script: ${script}`);
  const json = JSON.parse(script);
  const tracks = json.tracks;
  //console.log(`Found ${tracks.length} tracks`);

  // Get the stream URLs for each track
  let errorMsg = "";
  const promises: Promise<TrackStatus>[] = tracks.map(
    async (t: any): Promise<TrackStatus> => {
      if (t.id && t.key) {
        // Get the stream URL
        const trackLocatorUrl = `${TRACK_BASE_URL}/${t.id}/${t.key}`;
        const trackResponse = await fetch(trackLocatorUrl, {
          headers: {
            ...HTTP_HEADERS,
            Cookie: cookie,
            "Content-Type": "application/json",
            ...headerOverrides,
          },
        });

        // Check if we got a valid response
        try {
          const trackJson: any = await trackResponse.json();
          //console.log(trackJson);
          if (trackJson.url) {
            return {
              _type: "FOUND",
              artist: t.artist,
              title: t.song,
              url: trackJson.url,
            };
          }
          errorMsg = "Missing track URL";
        } catch (e) {
          errorMsg = "Unable to retrieve streaming URL";
        }
      } else {
        errorMsg = "Unable to find the track ID and key"; 
      }
      
      //console.log(`Skipping track ${JSON.stringify(t)}`);
      return {
        _type: "NOT_FOUND",
        trackInfo: t,
        message: errorMsg,
      };
    },
  );

  const result = await Promise.all(promises);
  //console.log(`Retrieved metadata for ${result.length} tracks`);
  return result;
}

/**
 * Arguments for downloading tracks from Hype Machine
 */
export interface HypemDownloadArgs {
  // Which local folder to store the mp3 files (defaults to user home downloads folder)
  destination: string;
  // "popular", "latest", or a username
  slug: string;
  // Which page to retrieve (starts at 1)
  page?: number;
  // HTTP User-Agent override
  userAgent?: string;
  // HTTP Cookie override
  cookie?: string;
}

/**
 * Download up to 50 tracks from Hype Machine.
 * Files are downloaded sequentially.
 * Use the `page` parameter to retrieve more than 50 tracks
 * @param args 
 */
export const hypemDownloadAll = (args: HypemDownloadArgs) => pProgress(async progress => {
  // Get streaming URLs for all tracks from Hype Machine
  const urlResults = await getStreamUrls(args.slug, args.page, {
    ...(args.userAgent ? { "User-Agent": args.userAgent } : {}),
    ...(args.cookie ? { Cookie: args.cookie } : {}),
  });

  // Download each track
  const results: TrackStatus[] = [];
  for (let i = 0; i < urlResults.length; i++) {
    const u = urlResults[i];
    progress(i / urlResults.length);

    if (u._type !== "FOUND") {
      results.push(u);
      continue;
    }

    // Download the file
    const filename = makeFilename(u);
    const absPath = path.resolve(args.destination, filename);
    //console.log(`Downloading to ${filename}`);
    try {
      const downloadResp = await downloadFile(u.url, absPath);
      if (downloadResp._type === "SUCCESS") {
        results.push({ ...u , _type: "DOWNLOAD_SUCCESS", absolutePath: absPath });
        continue;
      } else if (downloadResp._type === "FILE_EXISTS") {
        results.push({ ...u, _type: "DOWNLOAD_SKIPPED", absolutePath: absPath });
        continue;
      } else {
        assertNever(downloadResp);
      }
    } catch (e: any) {
      results.push({ ...u, _type: "DOWNLOAD_ERROR", message: e.message });
      continue;
    }
  }
  return results;
});
