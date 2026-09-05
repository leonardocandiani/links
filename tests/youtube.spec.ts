import { expect, test } from "@playwright/test";
import youtubeSnapshot from "../src/data/youtube-snapshot.json" with { type: "json" };

const channelUrl = "https://www.youtube.com/@oleonardocandiani";
const [featured, ...otherVideos] = youtubeSnapshot.videos;
const recentVideos = otherVideos.slice(0, 3);
const locales = [
  {
    path: "/", locale: "pt-BR", title: "Construindo com IA e automação.",
    play: "Reproduzir vídeo", open: "Abrir no YouTube", channel: "Explorar o canal",
    latest: "Último vídeo publicado", more: "Mais vídeos do canal",
    privacy: "O player do YouTube só carrega quando você aperta play."
  },
  {
    path: "/en/", locale: "en", title: "Building with AI and automation.",
    play: "Play video", open: "Open on YouTube", channel: "Explore the channel",
    latest: "Latest published video", more: "More from the channel",
    privacy: "The YouTube player only loads when you press play."
  }
] as const;

for (const copy of locales) {
  test(`publica vídeos, links e datas do snapshot em ${copy.locale}`, async ({ page }) => {
    await page.goto(copy.path);
    const section = page.locator("#youtube");
    const featuredArticle = section.locator(".youtube-featured");
    const dateFormatter = new Intl.DateTimeFormat(copy.locale, {
      day: "numeric", month: "short", year: "numeric", timeZone: "America/Sao_Paulo"
    });

    expect(youtubeSnapshot.channelId).toBe("UCqO85XZNoBRx1SuYX20Nbgw");
    expect(recentVideos).toHaveLength(3);
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(copy.title);
    await expect(section.getByRole("link", { name: copy.channel })).toHaveAttribute("href", channelUrl);
    await expect(section.getByRole("heading", { name: copy.more })).toBeVisible();
    await expect(featuredArticle).toContainText(copy.latest);
    await expect(featuredArticle).toContainText(copy.privacy);
    await expect(featuredArticle.getByRole("heading", { level: 3 })).toHaveText(featured.title);
    await expect(featuredArticle.getByRole("heading", { level: 3 })).toHaveAttribute("lang", "pt-BR");
    await expect(featuredArticle.locator("time")).toHaveAttribute("datetime", featured.publishedAt);
    await expect(featuredArticle.locator("time")).toHaveText(dateFormatter.format(new Date(featured.publishedAt)));
    await expect(featuredArticle.getByRole("link", { name: copy.open })).toHaveAttribute("href", featured.url);
    const featuredImage = featuredArticle.locator("img");
    await expect(featuredImage).toHaveAttribute("data-youtube-fallback", featured.thumbnail);
    await expect(featuredImage).toHaveAttribute("width", "1280");
    await expect(featuredImage).toHaveAttribute("height", "720");
    expect([`https://i.ytimg.com/vi/${featured.id}/maxresdefault.jpg`, featured.thumbnail]).toContain(await featuredImage.getAttribute("src"));

    const recentItems = section.locator(".youtube-list > li");
    await expect(recentItems).toHaveCount(3);
    for (const [index, video] of recentVideos.entries()) {
      const item = recentItems.nth(index);
      const url = new URL(video.url);
      expect(url.origin).toBe("https://www.youtube.com");
      expect(url.pathname).toBe("/watch");
      expect(url.searchParams.get("v")).toBe(video.id);
      expect(Number.isNaN(Date.parse(video.publishedAt))).toBe(false);
      await expect(item.getByRole("link")).toHaveAttribute("href", video.url);
      await expect(item.getByRole("heading", { level: 4 })).toHaveText(video.title);
      await expect(item.getByRole("heading", { level: 4 })).toHaveAttribute("lang", "pt-BR");
      await expect(item.locator("time")).toHaveAttribute("datetime", video.publishedAt);
      await expect(item.locator("time")).toHaveText(dateFormatter.format(new Date(video.publishedAt)));
      await expect(item.locator("img")).toHaveAttribute("src", video.thumbnail);
    }

    for (const link of await section.getByRole("link").all()) {
      await expect(link).toHaveAttribute("target", "_blank");
      const rel = await link.getAttribute("rel");
      expect(rel?.split(/\s+/)).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
    }
    if (copy.locale === "en") {
      await expect(section).toContainText("Videos are in Portuguese.");
    }
  });

  test(`carrega o player nocookie somente após play em ${copy.locale}`, async ({ page }) => {
    const playerRequests: string[] = [];
    await page.route(/^https:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\//, async (route) => {
      playerRequests.push(route.request().url());
      await route.fulfill({ contentType: "text/html", body: "<!doctype html><html><body></body></html>" });
    });
    await page.goto(copy.path);
    const section = page.locator("#youtube");
    const play = section.getByRole("button", { name: `${copy.play}: ${featured.title}`, exact: true });

    await expect(play).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
    expect(playerRequests).toEqual([]);
    await play.click();

    const iframe = section.locator("iframe");
    const embedUrl = `https://www.youtube-nocookie.com/embed/${featured.id}?autoplay=1&rel=0`;
    await expect(iframe).toHaveCount(1);
    await expect(iframe).toHaveAttribute("src", embedUrl);
    await expect(iframe).toHaveAttribute("title", featured.title);
    await expect(iframe).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    await expect(iframe).toHaveAttribute("allowfullscreen", "");
    await expect(iframe).toBeFocused();
    await expect(play).toHaveCount(0);
    await expect.poll(() => playerRequests).toEqual([embedUrl]);
    await expect(section.getByRole("link", { name: copy.open, exact: true })).toHaveAttribute("href", featured.url);
  });

  test(`mantém o link externo funcional sem JavaScript em ${copy.locale}`, async ({ browser, baseURL }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Executa cada idioma uma vez com JavaScript desabilitado.");
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    await context.route("https://www.youtube.com/**", (route) => route.fulfill({
      contentType: "text/html", body: "<!doctype html><html><body>Destino externo interceptado pelo teste.</body></html>"
    }));
    try {
      const page = await context.newPage();
      await page.goto(copy.path);
      const section = page.locator("#youtube");
      const watch = section.getByRole("link", { name: copy.open, exact: true });
      const thumbnailLink = section.getByRole("link", { name: `${copy.open}: ${featured.title}`, exact: true });
      await expect(section.getByRole("heading", { level: 2 })).toHaveText(copy.title);
      await expect(section.locator("iframe")).toHaveCount(0);
      await expect(section.getByRole("button")).toHaveCount(0);
      await expect(thumbnailLink).toBeVisible();
      await expect(thumbnailLink).toHaveAttribute("href", featured.url);
      await expect(thumbnailLink).toHaveAttribute("target", "_blank");
      await expect(thumbnailLink).toHaveAttribute("rel", "noopener noreferrer");
      await expect(watch).toBeVisible();
      await expect(watch).toHaveAttribute("href", featured.url);
      const popupPromise = page.waitForEvent("popup");
      await thumbnailLink.click();
      const popup = await popupPromise;
      await expect(popup).toHaveURL(featured.url);
      await expect(popup.locator("body")).toHaveText("Destino externo interceptado pelo teste.");
    } finally {
      await context.close();
    }
  });
}

test("usa a thumbnail do snapshot quando a imagem maior falha", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Verifica o fallback de rede uma vez.");
  await page.route(`https://i.ytimg.com/vi/${featured.id}/maxresdefault.jpg`, (route) => route.abort("failed"));
  await page.goto("/");
  const image = page.locator(".youtube-featured img");
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveAttribute("src", featured.thumbnail);
  await expect(page.locator(".youtube-featured .youtube-watch-link")).toHaveAttribute("href", featured.url);
});
