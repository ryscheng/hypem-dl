import { createWriteStream, existsSync } from "node:fs";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import fetch from "node-fetch";
import { ADT } from "ts-adt";

const streamPipeline = promisify(pipeline);

/**
 * Download status
 */
export type DownloadStatus = ADT<{
  FILE_EXISTS: {};
  SUCCESS: {};
}>;

/**
 * Downloads a URL and stores it in a file
 * @param url
 * @param filename Path to file to store the URL contents
 * @returns 
 */
export async function downloadFile(url: string, filename: string): Promise<DownloadStatus> {
  //console.log(`Downloading ${url} to ${filename}`);

  // Skip download if file already exists
  if (existsSync(filename)) {
    // console.warn(`${filename} already exists. Skipping download`);
    return { _type: "FILE_EXISTS" };
  }

  // Download
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unexpected response ${response.statusText}`);
  } else if (!response.body) {
    throw new Error(`No response body`);
  }

  // Stream the response
  await streamPipeline(response.body, createWriteStream(filename));
  return { _type: "SUCCESS" };
}
