import { XMLParser, XMLValidator } from "fast-xml-parser";

export const YOUTUBE_CHANNEL_ID = "UCqO85XZNoBRx1SuYX20Nbgw";
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@oleonardocandiani";
export const YOUTUBE_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

/** @typedef {{ id: string, title: string, url: string, thumbnail: string, publishedAt: string }} YouTubeVideo */
/** @typedef {{ syncedAt: string, channelId: string, videos: YouTubeVideo[] }} YouTubeSnapshot */

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  trimValues: true,
  processEntities: true,
  isArray: (_name, path) => path === "feed.entry" || path.endsWith(".link")
});

/** @param {string} xml @returns {YouTubeVideo[]} */
export function parseYouTubeFeed(xml) {
  if (typeof xml !== "string" || xml.length > 1_000_000 || /<!DOCTYPE|<!ENTITY/i.test(xml)) {
    throw new Error("Feed YouTube inválido ou grande demais.");
  }
  if (XMLValidator.validate(xml) !== true) throw new Error("Feed YouTube contém XML malformado.");

  const feed = parser.parse(xml).feed;
  if (
    feed?.["@_xmlns"] !== "http://www.w3.org/2005/Atom" ||
    feed?.["@_xmlns:yt"] !== "http://www.youtube.com/xml/schemas/2015" ||
    feed?.["@_xmlns:media"] !== "http://search.yahoo.com/mrss/" ||
    ![YOUTUBE_CHANNEL_ID, YOUTUBE_CHANNEL_ID.slice(2)].includes(feed?.["yt:channelId"]) ||
    !Array.isArray(feed.entry) || !feed.entry.length
  ) throw new Error("Feed YouTube não corresponde ao canal ou não contém vídeos.");

  const videos = feed.entry.map((entry) => {
    if (entry["yt:channelId"] !== YOUTUBE_CHANNEL_ID) throw new Error("Vídeo de outro canal no feed.");
    const video = {
      id: entry["yt:videoId"],
      title: typeof entry.title === "string" ? entry.title.replace(/\s*[\u2013\u2014]\s*/g, ": ") : entry.title,
      url: entry.link?.find((link) => link["@_rel"] === "alternate")?.["@_href"],
      thumbnail: entry["media:group"]?.["media:thumbnail"]?.["@_url"],
      publishedAt: entry.published
    };
    if (!isYouTubeVideo(video)) throw new Error("Feed YouTube contém vídeo inválido.");
    return video;
  });

  const uniqueVideos = [...new Map(videos.map((video) => [video.id, video])).values()];
  return uniqueVideos.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 6);
}

/** @param {unknown} value @returns {asserts value is YouTubeSnapshot} */
export function validateYouTubeSnapshot(value) {
  const snapshot = /** @type {YouTubeSnapshot | null} */ (value);
  if (
    !snapshot || typeof snapshot !== "object" ||
    snapshot.channelId !== YOUTUBE_CHANNEL_ID || !isDate(snapshot.syncedAt) ||
    !Array.isArray(snapshot.videos) || !snapshot.videos.length || snapshot.videos.length > 6 ||
    !snapshot.videos.every(isYouTubeVideo) ||
    new Set(snapshot.videos.map((video) => video.id)).size !== snapshot.videos.length
  ) throw new Error("Snapshot YouTube não tem o formato esperado.");
}

function isYouTubeVideo(video) {
  if (
    !video || typeof video !== "object" || typeof video.id !== "string" ||
    !/^[A-Za-z0-9_-]{11}$/.test(video.id) || typeof video.title !== "string" ||
    !video.title.trim() || video.title.length > 500 || !isDate(video.publishedAt)
  ) return false;

  try {
    const url = new URL(video.url);
    const thumbnail = new URL(video.thumbnail);
    return (
      url.href === `https://www.youtube.com/watch?v=${video.id}` &&
      thumbnail.protocol === "https:" && !thumbnail.username && !thumbnail.password && !thumbnail.port &&
      /^(i|i[1-4])\.ytimg\.com$/.test(thumbnail.hostname) &&
      thumbnail.pathname === `/vi/${video.id}/hqdefault.jpg` && !thumbnail.search && !thumbnail.hash
    );
  } catch {
    return false;
  }
}

function isDate(value) {
  return typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    Number.isFinite(Date.parse(value));
}
