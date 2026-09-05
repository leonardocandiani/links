import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseYouTubeFeed, validateYouTubeSnapshot, YOUTUBE_CHANNEL_ID, YOUTUBE_FEED_URL } from "./youtube-data.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const snapshotPath = resolve(projectRoot, "src/data/youtube-snapshot.json");

/**
 * @typedef {{ ok: boolean, status: number, text?: () => Promise<string> }} YouTubeResponse
 * @typedef {{
 *   fetchImpl?: (url: string, init: { headers: Record<string, string>, signal: AbortSignal }) => Promise<YouTubeResponse>,
 *   targetPath?: string,
 *   now?: () => Date,
 *   logger?: Pick<Console, "log" | "warn">
 * }} SyncYouTubeOptions
 */

/** @param {SyncYouTubeOptions} [options] */
export async function syncYouTubeSnapshot({
  fetchImpl = globalThis.fetch,
  targetPath = snapshotPath,
  now = () => new Date(),
  logger = console
} = {}) {
  try {
    const response = await fetchImpl(YOUTUBE_FEED_URL, {
      headers: { Accept: "application/atom+xml, application/xml, text/xml", "User-Agent": "leonardo-candiani-site" },
      signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok || !response.text) throw new Error(`YouTube respondeu ${response.status}`);

    const snapshot = {
      syncedAt: now().toISOString(),
      channelId: YOUTUBE_CHANNEL_ID,
      videos: parseYouTubeFeed(await response.text())
    };
    validateYouTubeSnapshot(snapshot);
    const targetDirectory = dirname(targetPath);
    const temporaryPath = resolve(targetDirectory, `.${basename(targetPath)}.${process.pid}.${randomUUID()}.tmp`);
    await mkdir(targetDirectory, { recursive: true });
    await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`);
    await rename(temporaryPath, targetPath);

    logger.log(`YouTube snapshot sincronizado: ${snapshot.videos.length} vídeos.`);
    return { snapshot, usedFallback: false };
  } catch (error) {
    try {
      const snapshot = JSON.parse(await readFile(targetPath, "utf8"));
      validateYouTubeSnapshot(snapshot);
      logger.warn(`Falha ao sincronizar YouTube (${formatError(error)}). Usando snapshot local com ${snapshot.videos.length} vídeos.`);
      return { snapshot, usedFallback: true };
    } catch (fallbackError) {
      throw new Error(`Falha ao sincronizar YouTube (${formatError(error)}) e o snapshot local é inválido (${formatError(fallbackError)}).`);
    }
  }
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  syncYouTubeSnapshot().catch((error) => {
    console.error(formatError(error));
    process.exitCode = 1;
  });
}
