import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";
import { transpileModule } from "typescript";

import { parseYouTubeFeed, validateYouTubeSnapshot, YOUTUBE_CHANNEL_ID } from "./youtube-data.mjs";
import { syncYouTubeSnapshot } from "./sync-youtube.mjs";

const channelId = "UCqO85XZNoBRx1SuYX20Nbgw";
const video = {
  id: "1OjhOxk41wE",
  title: "JavaScript & n8n: automação",
  url: "https://www.youtube.com/watch?v=1OjhOxk41wE",
  thumbnail: "https://i2.ytimg.com/vi/1OjhOxk41wE/hqdefault.jpg",
  publishedAt: "2025-06-04T15:18:40+00:00"
};
const fallback = { syncedAt: "2026-09-04T12:00:00.000Z", channelId, videos: [video] };
const directories: string[] = [];
const logger = { log: vi.fn(), warn: vi.fn() };

function entry(item = video) {
  return `<entry><yt:videoId>${item.id}</yt:videoId><yt:channelId>${channelId}</yt:channelId>
    <title>${item.title.replaceAll("&", "&amp;")}</title>
    <link rel="alternate" href="${item.url}"/><published>${item.publishedAt}</published>
    <media:group><media:thumbnail url="${item.thumbnail}" width="480" height="360"/></media:group></entry>`;
}

function feed(entries = entry()) {
  return `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/">
    <yt:channelId>${channelId}</yt:channelId><title>Leonardo Candiani</title>${entries}</feed>`;
}

async function snapshotFile(snapshot: unknown = fallback) {
  const directory = await mkdtemp(join(tmpdir(), "portfolio-youtube-test-"));
  directories.push(directory);
  const path = join(directory, "youtube-snapshot.json");
  await writeFile(path, JSON.stringify(snapshot));
  return path;
}

afterEach(async () => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  document.body.replaceChildren();
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("YouTube player interaction", () => {
  async function initializePlayer({ id = video.id, playLabel = "Play video", complete = false, naturalWidth = 1280, focusedSelector = "" } = {}) {
    const source = await readFile(join(process.cwd(), "src/components/YouTubeSection.astro"), "utf8");
    const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    expect(script).toBeTruthy();
    document.body.innerHTML = `<div data-youtube-player><a class="youtube-play" href="${video.url}" target="_blank" rel="noopener noreferrer" data-astro-cid-test data-video-id="${id}" data-video-title="Tutorial" data-play-label="${playLabel}"><img src="https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg" data-youtube-fallback="${video.thumbnail}" width="1280" height="720"><span class="youtube-play-text">Open on YouTube</span></a></div><a class="youtube-watch-link" href="${video.url}">Open on YouTube</a>`;
    const image = document.querySelector<HTMLImageElement>("img")!;
    Object.defineProperties(image, {
      complete: { configurable: true, value: complete },
      naturalWidth: { configurable: true, value: naturalWidth }
    });
    if (focusedSelector) document.querySelector<HTMLAnchorElement>(focusedSelector)?.focus();
    new Function(transpileModule(script!, { compilerOptions: { target: 9 } }).outputText)();
    return { button: document.querySelector<HTMLButtonElement>("button"), image };
  }

  it("creates the privacy-enhanced embed only after a click and preserves the external link", async () => {
    const { button } = await initializePlayer();
    expect(button).not.toBeNull();
    expect(document.querySelector("iframe")).toBeNull();
    button!.click();
    const iframe = document.querySelector("iframe");
    expect(iframe?.src).toBe(`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`);
    expect(iframe?.title).toBe("Tutorial");
    expect(iframe?.referrerPolicy).toBe("strict-origin-when-cross-origin");
    expect(document.activeElement).toBe(iframe);
    expect(document.querySelector<HTMLAnchorElement>(".youtube-watch-link")?.href).toBe(video.url);
  });

  it("keeps a native link instead of enhancing an invalid video ID", async () => {
    expect((await initializePlayer({ id: "invalid/id" })).button).toBeNull();
    expect(document.querySelector<HTMLAnchorElement>(".youtube-play")?.href).toBe(video.url);
    expect(document.querySelector("iframe")).toBeNull();
  });

  it("preserves focus when enhancing an already focused video link", async () => {
    const { button } = await initializePlayer({ focusedSelector: ".youtube-play" });
    expect(document.activeElement).toBe(button);
  });

  it("does not move focus from another link during enhancement", async () => {
    await initializePlayer({ focusedSelector: ".youtube-watch-link" });
    expect(document.activeElement).toBe(document.querySelector(".youtube-watch-link"));
  });

  it.each(["Play video", "Reproduzir vídeo"])("enhances the link with localized button text: %s", async (playLabel) => {
    const { button } = await initializePlayer({ playLabel });
    expect(button?.getAttribute("aria-label")).toBe(`${playLabel}: Tutorial`);
    expect(button?.textContent).toBe(playLabel);
    expect(button?.type).toBe("button");
    expect(button?.hasAttribute("data-astro-cid-test")).toBe(true);
    expect(button?.hasAttribute("href")).toBe(false);
    expect(button?.hasAttribute("target")).toBe(false);
  });

  it("uses the original thumbnail after a high-resolution image error", async () => {
    const { image } = await initializePlayer();
    expect(image.src).toContain("maxresdefault.jpg");
    image.dispatchEvent(new Event("error"));
    expect(image.src).toBe(video.thumbnail);
    image.dispatchEvent(new Event("error"));
    expect(image.src).toBe(video.thumbnail);
  });

  it("uses the original thumbnail for a loaded YouTube placeholder", async () => {
    const { image } = await initializePlayer({ naturalWidth: 120 });
    image.dispatchEvent(new Event("load"));
    expect(image.src).toBe(video.thumbnail);
  });

  it.each([0, 120])("handles a cached failed image with naturalWidth %s", async (naturalWidth) => {
    const { image } = await initializePlayer({ complete: true, naturalWidth });
    expect(image.src).toBe(video.thumbnail);
  });

  it("keeps a valid high-resolution cached image", async () => {
    const { image } = await initializePlayer({ complete: true });
    expect(image.src).toContain("maxresdefault.jpg");
    expect(image.width).toBe(1280);
    expect(image.height).toBe(720);
  });
});

describe("parseYouTubeFeed", () => {
  it("parses a single Atom entry and decodes XML entities", () => {
    expect(YOUTUBE_CHANNEL_ID).toBe(channelId);
    expect(parseYouTubeFeed(feed())).toEqual([video]);
  });

  it("accepts the unprefixed channel ID returned at the root of the live feed", () => {
    expect(parseYouTubeFeed(feed().replace(`<yt:channelId>${channelId}</yt:channelId>`, `<yt:channelId>${channelId.slice(2)}</yt:channelId>`)))
      .toEqual([video]);
  });

  it("sorts by publication date, removes duplicates, and keeps six videos", () => {
    const items = Array.from({ length: 8 }, (_, index) => ({
      ...video,
      id: `video00000${index}`,
      url: `https://www.youtube.com/watch?v=video00000${index}`,
      thumbnail: `https://i.ytimg.com/vi/video00000${index}/hqdefault.jpg`,
      publishedAt: `2025-01-0${index + 1}T12:00:00Z`
    }));
    expect(parseYouTubeFeed(feed(items.map(entry).join("") + entry(items[7]))).map((item: typeof video) => item.id))
      .toEqual(items.slice(2).reverse().map((item) => item.id));
  });

  it("supports CDATA and alternate attribute order", () => {
    const xml = feed().replace("JavaScript &amp; n8n: automação", "<![CDATA[JavaScript & n8n: automação]]>")
      .replace(`rel="alternate" href="${video.url}"`, `href='${video.url}' rel='alternate'`);
    expect(parseYouTubeFeed(xml)).toEqual([video]);
  });

  it("normalizes editorial dashes without changing title meaning", () => {
    expect(parseYouTubeFeed(feed(entry({ ...video, title: "n8n \u2014 automação" })))[0].title)
      .toBe("n8n: automação");
  });

  it.each([
    ["malformed XML", "<feed><entry></feed>"],
    ["HTML response", "<html><body>Unavailable</body></html>"],
    ["empty feed", feed("")],
    ["wrong channel", feed().replaceAll(channelId, "UC0000000000000000000000")],
    ["external entity", `<!DOCTYPE feed [<!ENTITY ex SYSTEM "file:///etc/passwd">]>${feed()}`],
    ["invalid date", feed().replace(video.publishedAt, "not-a-date")],
    ["malicious URL", feed().replace(video.url, "https://example.com/watch?v=1OjhOxk41wE")],
    ["mismatched video", feed().replace(video.url, "https://www.youtube.com/watch?v=DFOjdhrGTD4")],
    ["unsafe thumbnail", feed().replace(video.thumbnail, "https://ytimg.com.evil.example/hqdefault.jpg")],
    ["oversized payload", "x".repeat(1_000_001)]
  ])("rejects %s", (_, xml) => {
    expect(() => parseYouTubeFeed(xml)).toThrow();
  });
});

describe("validateYouTubeSnapshot", () => {
  it("accepts a valid snapshot", () => {
    expect(() => validateYouTubeSnapshot(fallback)).not.toThrow();
  });

  it.each([
    null,
    { ...fallback, channelId: "different" },
    { ...fallback, syncedAt: "yesterday" },
    { ...fallback, videos: [] },
    { ...fallback, videos: [{ ...video, url: "javascript:alert(1)" }] },
    { ...fallback, videos: [{ ...video, thumbnail: "https://user:pass@i.ytimg.com/vi/1OjhOxk41wE/hqdefault.jpg" }] },
    { ...fallback, videos: [{ ...video, title: "" }] }
  ])("rejects invalid stored data", (snapshot) => {
    expect(() => validateYouTubeSnapshot(snapshot)).toThrow();
  });
});

describe("syncYouTubeSnapshot", () => {
  it("writes the parsed feed atomically and sends a ten-second timeout", async () => {
    const targetPath = await snapshotFile();
    const timeout = vi.spyOn(AbortSignal, "timeout");
    const fetchImpl = vi.fn(async () => ({ ok: true, status: 200, text: async () => feed() }));
    const result = await syncYouTubeSnapshot({ fetchImpl, targetPath, logger, now: () => new Date("2026-09-05T00:00:00Z") });
    expect(result.usedFallback).toBe(false);
    expect(result.snapshot).toEqual({ ...fallback, syncedAt: "2026-09-05T00:00:00.000Z" });
    expect(JSON.parse(await readFile(targetPath, "utf8"))).toEqual(result.snapshot);
    expect(await readdir(directories[0])).toEqual(["youtube-snapshot.json"]);
    expect(timeout).toHaveBeenCalledWith(10_000);
    expect(fetchImpl).toHaveBeenCalledWith(expect.stringContaining(`channel_id=${channelId}`), expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it.each(["http", "malformed", "network", "timeout"])("preserves the existing snapshot after %s failure", async (failure) => {
    const targetPath = await snapshotFile();
    const before = await readFile(targetPath, "utf8");
    const fetchImpl = async () => {
      if (failure === "network") throw new Error("offline");
      if (failure === "timeout") throw new DOMException("Timed out", "TimeoutError");
      return { ok: failure !== "http", status: failure === "http" ? 503 : 200, text: async () => "<feed>" };
    };
    expect(await syncYouTubeSnapshot({ fetchImpl, targetPath, logger })).toEqual({ snapshot: fallback, usedFallback: true });
    expect(await readFile(targetPath, "utf8")).toBe(before);
    expect(logger.warn).toHaveBeenCalledOnce();
  });

  it("fails clearly when the network and local snapshot are both invalid", async () => {
    const targetPath = await snapshotFile({ videos: [] });
    await expect(syncYouTubeSnapshot({ fetchImpl: async () => ({ ok: false, status: 503 }), targetPath, logger }))
      .rejects.toThrow("snapshot local é inválido");
  });
});
