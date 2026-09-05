import { expect, test, type Locator } from "@playwright/test";
import githubSnapshot from "../src/data/github-snapshot.json" with { type: "json" };
import type { GitHubSnapshot } from "../src/types/site";

const siteHeading = (text: string) => new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
const snapshot = githubSnapshot as GitHubSnapshot;
const featuredRepositoryNames = ["scratchmate", "krit", "keepwright"] as const;
const publicPresenceLinks = [
  { label: "GitHub", href: "https://github.com/leonardocandiani" },
  { label: "YouTube", href: "https://youtube.com/@oleonardocandiani" },
  { label: "Instagram", href: "https://instagram.com/leonardocandiani" }
] as const;
const revealSelectors = [
  ".about-heading",
  ".culture-copy",
  ".culture-bridge",
  ".work-heading",
  ".jarvis-intro",
  ".education-intro",
  ".github-heading"
] as const;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
    year: "numeric"
  }).format(new Date(date));
}

function formatStars(stars: number) {
  return stars === 1 ? "1 estrela" : `${stars} estrelas`;
}

async function getDrawerStyles(scrim: Locator) {
  return scrim.evaluate((element) => {
    const scrimStyle = getComputedStyle(element);
    const sheet = element.querySelector<HTMLElement>(".nav-sheet");

    if (!sheet) {
      throw new Error("nav-sheet não encontrado.");
    }

    const sheetStyle = getComputedStyle(sheet);
    const matrix = sheetStyle.transform === "none" ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(sheetStyle.transform);

    return {
      sheetDuration: sheetStyle.transitionDuration,
      sheetHeight: sheet.getBoundingClientRect().height,
      sheetTiming: sheetStyle.transitionTimingFunction,
      sheetTransform: sheetStyle.transform,
      sheetTransition: sheetStyle.transitionProperty,
      sheetTranslateY: matrix.m42,
      scrimDuration: scrimStyle.transitionDuration,
      scrimOpacity: scrimStyle.opacity,
      scrimTiming: scrimStyle.transitionTimingFunction,
      scrimTransition: scrimStyle.transitionProperty
    };
  });
}

async function expectHeroCtaNavigatesToSection(
  page: import("@playwright/test").Page,
  name: string,
  hash: string,
  sectionSelector: string
) {
  const section = page.locator(sectionSelector);
  const link = page.locator("section.hero").getByRole("link", { name });

  await expect(link).toHaveAttribute("href", hash);
  await link.click();
  await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe(hash);
  await expect(section).toBeVisible();
  await expect
    .poll(async () =>
      section.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      })
    )
    .toBe(true);
}

async function expectHeaderNavResolvesToSection(page: import("@playwright/test").Page, label: string, hash: string) {
  const header = page.getByRole("banner");
  const menuButton = header.getByRole("button", { name: "Menu" });
  await expect(header.locator(".mobile-nav")).toHaveAttribute("data-hydrated", "true");

  if (await menuButton.isVisible()) {
    const mobileDialog = page.getByRole("dialog", { name: "Navegação" });

    await menuButton.click();
    await expect(mobileDialog).toBeVisible();

    const mobileNavigation = page.getByRole("navigation", { name: "Menu mobile" });
    const link = mobileNavigation.getByRole("link", { name: label });

    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator(".nav-scrim")).toHaveCount(0);
    await expect(page.locator("body")).toHaveJSProperty("style.overflow", "");
  } else {
    await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: label }).click();
  }

  await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe(hash);
  await expect(page.locator(hash)).toBeVisible();
}

test("renders the portfolio shell", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Construo a inteligência");
  await expect(page.locator("section#sobre")).toBeAttached();
  await expect(page.locator("section#cultura")).toBeAttached();
  await expect(page.locator("section#repertorio")).toBeAttached();
  await expect(page.locator("section#jarvis")).toBeAttached();
  await expect(page.locator("section#educacao")).toBeAttached();
  await expect(page.getByRole("heading", { name: siteHeading("Operação antes do hype") })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "O que nos limita é a nossa criatividade.", exact: true })
  ).toBeVisible();
  await expect(page.locator("#repertorio [role='tab']")).toHaveCount(5);
  await expect(page.locator("#repertorio [role='tabpanel']")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Pular para o conteúdo" })).toBeAttached();

  const hero = page.locator("section.hero");
  const heroPicture = hero.locator("picture.hero-media");
  const heroSource = heroPicture.locator("source");
  const heroImage = heroPicture.locator("img");

  await expect(hero).toBeVisible();
  await expect(heroPicture).toBeVisible();
  await expect(heroImage).toBeVisible();
  await expect(heroSource).toHaveAttribute("media", "(min-width: 64rem)");
  await expect(heroSource).toHaveAttribute("srcset", "/images/hero-horizon-wide.webp");
  await expect(heroImage).toHaveAttribute("src", "/images/hero-horizon-mobile.webp");
  await expect(heroImage).toHaveAttribute("alt", "Caminho terracota entre arquitetura escura e um horizonte azul");
  await expect(hero.getByRole("link", { name: "Conhecer meu trabalho" })).toHaveAttribute("href", "#sobre");
  await expect(hero.getByRole("link", { name: "Explorar repertório" })).toHaveAttribute("href", "#repertorio");

  const renderedImage = await heroImage.evaluate((image) => {
    const img = image as HTMLImageElement;
    return {
      complete: img.complete,
      currentSrc: img.currentSrc,
      naturalWidth: img.naturalWidth
    };
  });

  expect(renderedImage.complete).toBe(true);
  expect(renderedImage.naturalWidth).toBeGreaterThan(0);

  if (testInfo.project.name === "desktop") {
    expect(renderedImage.currentSrc).toContain("/images/hero-horizon-wide.webp");
    await expect(page.getByRole("navigation", { name: "Principal" })).toBeVisible();
    await expectHeroCtaNavigatesToSection(page, "Conhecer meu trabalho", "#sobre", "section#sobre");
    await page.goto("/");
    await expectHeroCtaNavigatesToSection(page, "Explorar repertório", "#repertorio", "section#repertorio");
    return;
  }

  expect(renderedImage.currentSrc).toContain("/images/hero-horizon-mobile.webp");

  const mediaBox = await heroPicture.boundingBox();
  const imageBox = await heroImage.boundingBox();
  const contentBox = await hero.locator(".hero-content").boundingBox();
  const imageFit = await heroImage.evaluate((image) => getComputedStyle(image).objectFit);

  expect(mediaBox).not.toBeNull();
  expect(imageBox).not.toBeNull();
  expect(contentBox).not.toBeNull();
  expect(imageFit).toBe("cover");
  expect(contentBox!.y).toBeLessThan(mediaBox!.y + mediaBox!.height);
  expect(imageBox!.x).toBeLessThanOrEqual(mediaBox!.x + 1);
  expect(imageBox!.y).toBeLessThanOrEqual(mediaBox!.y + 1);
  expect(imageBox!.width).toBeGreaterThanOrEqual(mediaBox!.width - 1);
  expect(imageBox!.height).toBeGreaterThanOrEqual(mediaBox!.height - 1);

  const menuButton = page.getByRole("banner").getByRole("button", { name: "Menu" });
  await menuButton.click();

  const navScrim = page.locator(".nav-scrim");
  const mobileNavigation = page.getByRole("navigation", { name: "Menu mobile" });
  const mobileDialog = page.getByRole("dialog", { name: "Navegação" });
  await expect(navScrim).toHaveAttribute("data-state", "open");
  await expect(mobileDialog).toBeVisible();
  await expect(mobileNavigation).toBeVisible();
  await expect(page.getByRole("button", { name: "Fechar" })).toBeFocused();
  await expect(page.locator("body")).toHaveJSProperty("style.overflow", "hidden");

  const openDrawerStyles = await getDrawerStyles(navScrim);

  expect(openDrawerStyles.scrimTransition).toBe("opacity");
  expect(openDrawerStyles.scrimDuration).toBe("0.24s");
  expect(openDrawerStyles.sheetTransition).toBe("transform");
  expect(openDrawerStyles.sheetDuration).toBe("0.24s");

  await expect
    .poll(async () => {
      const styles = await getDrawerStyles(navScrim);

      return {
        scrimOpacity: styles.scrimOpacity,
        sheetTranslateY: Math.abs(styles.sheetTranslateY) < 1 ? 0 : styles.sheetTranslateY
      };
    })
    .toEqual({ scrimOpacity: "1", sheetTranslateY: 0 });

  await page.keyboard.press("Shift+Tab");
  await expect(mobileNavigation.getByRole("link", { name: "Contato" })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Fechar" })).toBeFocused();

  await navScrim.evaluate((element) => {
    const sheet = element.querySelector<HTMLElement>(".nav-sheet");
    const win = window as typeof window & {
      __drawerClosingState?: {
        ariaHidden: string | null;
        dataState: string | null;
        mounted: boolean;
        sheetHeight: number;
        sheetTransform: string;
        sheetTranslateY: number;
        scrimOpacity: string;
        triggerFocused: boolean;
      } | null;
    };

    if (!sheet) {
      throw new Error("nav-sheet não encontrado.");
    }

    win.__drawerClosingState = null;

    const observer = new MutationObserver(() => {
      if (element.getAttribute("data-state") !== "closed") {
        return;
      }

      const trigger = document.querySelector<HTMLButtonElement>(".mobile-nav .nav-trigger");
      const previousScrimTransition = (element as HTMLElement).style.transition;
      const previousSheetTransition = sheet.style.transition;
      (element as HTMLElement).style.transition = "none";
      sheet.style.transition = "none";

      const scrimStyle = getComputedStyle(element);
      const sheetStyle = getComputedStyle(sheet);
      const matrix =
        sheetStyle.transform === "none" ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(sheetStyle.transform);

      win.__drawerClosingState = {
        ariaHidden: element.getAttribute("aria-hidden"),
        dataState: element.getAttribute("data-state"),
        mounted: document.contains(element),
        sheetHeight: sheet.getBoundingClientRect().height,
        sheetTransform: sheetStyle.transform,
        sheetTranslateY: matrix.m42,
        scrimOpacity: scrimStyle.opacity,
        triggerFocused: document.activeElement === trigger
      };

      (element as HTMLElement).style.transition = previousScrimTransition;
      sheet.style.transition = previousSheetTransition;
      observer.disconnect();
    });

    observer.observe(element, { attributeFilter: ["aria-hidden", "data-state"] });
  });

  await page.keyboard.press("Escape");
  await expect
    .poll(
      () =>
      page.evaluate(() => {
        const win = window as typeof window & { __drawerClosingState?: unknown };

        return win.__drawerClosingState ?? null;
      }),
      { intervals: [10, 20, 50], timeout: 1000 }
    )
    .not.toBeNull();

  const closingSnapshot = await page.evaluate(() => {
    const win = window as typeof window & {
      __drawerClosingState?: {
        ariaHidden: string | null;
        dataState: string | null;
        mounted: boolean;
        sheetHeight: number;
        sheetTransform: string;
        sheetTranslateY: number;
        scrimOpacity: string;
        triggerFocused: boolean;
      } | null;
    };

    return win.__drawerClosingState;
  });

  expect(closingSnapshot).not.toBeNull();
  expect(closingSnapshot?.ariaHidden).toBe("true");
  expect(closingSnapshot?.dataState).toBe("closed");
  expect(closingSnapshot?.mounted).toBe(true);
  expect(closingSnapshot?.triggerFocused).toBe(true);
  expect(closingSnapshot?.scrimOpacity).toBe("0");
  expect(closingSnapshot!.sheetTranslateY).toBeGreaterThanOrEqual(closingSnapshot!.sheetHeight - 1);
  expect(closingSnapshot?.sheetTransform).not.toBe("none");

  await expect(mobileDialog).toHaveCount(0);
  await expect(navScrim).toHaveCount(0);
  await expect(menuButton).toBeFocused();
  await expect(page.locator("body")).toHaveJSProperty("style.overflow", "");
});

test("mantém o retrato do Sobre cobrindo o palco no desktop", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Valida a composição sobreposta apenas no layout desktop.");
  await page.goto("/");

  const layout = await page.locator("#sobre .about-story").evaluate((story) => {
    const portrait = story.querySelector<HTMLElement>(".about-portrait");
    const image = story.querySelector<HTMLImageElement>(".about-portrait img");
    const copy = story.querySelector<HTMLElement>(".about-copy");

    if (!portrait || !image || !copy) {
      throw new Error("Estrutura visual do Sobre incompleta.");
    }

    const storyBox = story.getBoundingClientRect();
    const portraitBox = portrait.getBoundingClientRect();
    const imageBox = image.getBoundingClientRect();
    const copyBox = copy.getBoundingClientRect();

    return {
      copyInsideStory: copyBox.top >= storyBox.top && copyBox.bottom <= storyBox.bottom,
      imageCoverage: imageBox.height / storyBox.height,
      portraitCoverage: portraitBox.height / storyBox.height
    };
  });

  expect(layout.copyInsideStory).toBe(true);
  expect(layout.imageCoverage).toBeGreaterThanOrEqual(.99);
  expect(layout.portraitCoverage).toBeGreaterThanOrEqual(.99);
});

test("publica um favicon fotográfico coerente com a marca pessoal", async ({ page, request }) => {
  await page.goto("/");

  const icon = page.locator('link[rel="icon"]');
  await expect(icon).toHaveAttribute("href", "/favicon.png?v=4");

  const response = await request.get("/favicon.png?v=4");
  const bytes = await response.body();

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image/png");
  expect(bytes.length).toBeGreaterThan(5_000);
});

test("transforma criatividade no fio condutor do portfólio", async ({ page }, testInfo) => {
  await page.goto("/");

  const culture = page.locator("section#cultura");
  const about = page.locator("section#sobre");
  const repertoire = page.locator("section#repertorio");
  const cultureImage = culture.getByRole("img", {
    name: "Planos de vidro azul e papel claro convergem para uma abertura iluminada"
  });

  await expect(culture).toBeVisible();
  await expect(culture.getByText("Nossa cultura", { exact: true })).toBeVisible();
  await expect(culture.getByText("Criatividade, para mim, é repertório aplicado:")).toBeVisible();
  await expect(culture.getByText("Uma cultura que se transforma em trabalho.")).toBeVisible();
  await expect(culture.getByRole("list", { name: "Como a criatividade atravessa o portfólio" })).toBeVisible();
  await expect(culture.getByRole("listitem")).toHaveCount(3);
  await expect(culture.getByRole("heading", { name: "Mais referências, mais caminhos possíveis." })).toBeVisible();
  await expect(culture.getByRole("heading", { name: "Informação vira capacidade empresarial." })).toBeVisible();
  await expect(culture.getByRole("heading", { name: "O repertório deixa de ficar concentrado." })).toBeVisible();
  await expect(cultureImage).toBeVisible();
  await expect(page.locator('img[src="/images/vision-architecture.webp"]')).toHaveCount(1);

  const sectionOrder = await page.locator("main > section").evaluateAll((sections) =>
    sections.map((section) => section.id).filter(Boolean)
  );
  expect(sectionOrder.indexOf("sobre")).toBeLessThan(sectionOrder.indexOf("cultura"));
  expect(sectionOrder.indexOf("cultura")).toBeLessThan(sectionOrder.indexOf("repertorio"));

  const cultureBox = await culture.boundingBox();
  const aboutBox = await about.boundingBox();
  const repertoireBox = await repertoire.boundingBox();
  expect(cultureBox).not.toBeNull();
  expect(aboutBox).not.toBeNull();
  expect(repertoireBox).not.toBeNull();
  expect(cultureBox!.y).toBeGreaterThan(aboutBox!.y);
  expect(cultureBox!.y).toBeLessThan(repertoireBox!.y);

  if (testInfo.project.name === "desktop") {
    const layout = await culture.locator(".culture-stage").evaluate((stage) => {
      const copy = stage.querySelector<HTMLElement>(".culture-copy");
      const media = stage.querySelector<HTMLElement>(".culture-media");

      if (!copy || !media) {
        throw new Error("Estrutura do manifesto incompleta.");
      }

      return {
        copyRight: copy.offsetLeft + copy.offsetWidth,
        mediaLeft: media.offsetLeft
      };
    });

    expect(layout.copyRight).toBeLessThanOrEqual(layout.mediaLeft);
    return;
  }

  const layout = await culture.locator(".culture-stage").evaluate((stage) => {
    const copy = stage.querySelector<HTMLElement>(".culture-copy");
    const media = stage.querySelector<HTMLElement>(".culture-media");

    if (!copy || !media) {
      throw new Error("Estrutura do manifesto incompleta.");
    }

    return {
      copyBottom: copy.offsetTop + copy.offsetHeight,
      mediaTop: media.offsetTop
    };
  });

  expect(layout.copyBottom).toBeLessThanOrEqual(layout.mediaTop);
});

test("mantém o manifesto legível em 320 pixels", async ({ browser, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Executa uma vez com contexto mobile estreito próprio.");

  const context = await browser.newContext({
    baseURL,
    viewport: { width: 320, height: 720 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  await page.goto("/#cultura");

  const culture = page.locator("#cultura");
  const stage = culture.locator(".culture-stage");
  const heading = culture.getByRole("heading", { name: "O que nos limita é a nossa criatividade.", exact: true });
  const layout = await stage.evaluate((element) => {
    const copy = element.querySelector<HTMLElement>(".culture-copy");
    const media = element.querySelector<HTMLElement>(".culture-media");
    const title = element.querySelector<HTMLElement>("#culture-title");

    if (!copy || !media || !title) {
      throw new Error("Estrutura do manifesto incompleta.");
    }

    const stageBox = element.getBoundingClientRect();
    const titleBox = title.getBoundingClientRect();

    return {
      copyBottom: copy.offsetTop + copy.offsetHeight,
      mediaTop: media.offsetTop,
      noDocumentOverflow: document.documentElement.scrollWidth <= window.innerWidth,
      titleInsideStage: titleBox.left >= stageBox.left && titleBox.right <= stageBox.right,
      titleTextFits: title.scrollWidth <= title.clientWidth
    };
  });

  await expect(culture).toBeVisible();
  await expect(heading).toBeVisible();
  expect(layout.copyBottom).toBe(layout.mediaTop);
  expect(layout.noDocumentOverflow).toBe(true);
  expect(layout.titleInsideStage).toBe(true);
  expect(layout.titleTextFits).toBe(true);

  await context.close();
});

test("carrega a narrativa visual completa sem imagens quebradas", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Valida o conjunto visual uma vez no desktop.");
  await page.goto("/");

  const sectionImages = [
    ["#sobre", "/images/leonardo-portrait-mobile.webp"],
    ["#cultura", "/images/vision-architecture.webp"],
    ["#repertorio", "/images/systems-workbench.webp"],
    ["#jarvis", "/images/jarvis-intelligence.webp"],
    ["#educacao", "/images/education-collaboration.webp"],
    ["#github", "/images/open-source-workbench.webp"]
  ] as const;

  for (const [sectionSelector, source] of sectionImages) {
    const image = page.locator(sectionSelector).locator(`img[src="${source}"]`);

    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }

  for (const id of ["sobre", "cultura", "repertorio", "jarvis", "educacao", "youtube", "github"]) {
    const section = page.locator(`section#${id}`);
    await expect(section).toHaveAccessibleName(/\S/);
    await expect(section.getByRole("heading", { level: 2 })).toHaveCount(1);
  }
  await expect(page.locator("#contato")).toHaveCSS("background-image", /contact-horizon\.webp/);
});

test("mantém navegação mobile nativa sem JavaScript", async ({ browser, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Executa uma vez com contexto mobile próprio.");

  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  await page.goto("/");

  const fallback = page.locator(".mobile-nav-fallback");
  const reactNav = page.locator(".mobile-nav");

  await expect(reactNav).toBeHidden();
  await expect(fallback).toBeVisible();

  const nativeMenu = fallback.getByText("Menu", { exact: true });
  await nativeMenu.click();

  const nativeNav = fallback.getByRole("navigation", { name: "Menu mobile sem JavaScript" });
  await expect(nativeNav).toBeVisible();
  await expect(nativeNav.getByRole("link")).toHaveCount(8);
  await expect(nativeNav.getByRole("link", { name: "YouTube" })).toHaveAttribute("href", "#youtube");
  await expect(nativeNav.getByRole("link", { name: "View in English" })).toHaveAttribute("href", "/en/");

  await nativeNav.getByRole("link", { name: "Educação" }).click();
  await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#educacao");
  await expect(page.locator("#educacao")).toBeVisible();

  await context.close();
});

test("mantém o drawer mobile dentro da viewport e fecha por toque", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "desktop", "Verificação específica do menu mobile/tablet.");
  await page.goto("/");

  await expect(page.locator(".mobile-nav")).toHaveAttribute("data-hydrated", "true");
  const menuButton = page.getByRole("banner").getByRole("button", { name: "Menu" });
  await menuButton.click();

  const dialog = page.getByRole("dialog", { name: "Navegação" });
  const closeButton = dialog.getByRole("button", { name: "Fechar" });
  const viewport = page.viewportSize();
  await expect
    .poll(async () => {
      const box = await dialog.boundingBox();

      return box && viewport ? box.y >= 0 && box.y + box.height <= viewport.height : false;
    })
    .toBe(true);

  const dialogBox = await dialog.boundingBox();
  const closeBox = await closeButton.boundingBox();

  expect(viewport).not.toBeNull();
  expect(dialogBox).not.toBeNull();
  expect(closeBox).not.toBeNull();
  expect(dialogBox!.y).toBeGreaterThanOrEqual(0);
  expect(dialogBox!.y + dialogBox!.height).toBeLessThanOrEqual(viewport!.height);
  expect(closeBox!.y).toBeGreaterThanOrEqual(0);
  expect(closeBox!.y + closeBox!.height).toBeLessThanOrEqual(viewport!.height);

  await closeButton.click();
  await expect(dialog).toHaveCount(0);
  await expect(menuButton).toBeFocused();
});

test("navega para os itens internos publicados", async ({ page }) => {
  await page.goto("/");

  await expectHeaderNavResolvesToSection(page, "Sobre", "#sobre");
  await expectHeaderNavResolvesToSection(page, "Repertório", "#repertorio");
  await expectHeaderNavResolvesToSection(page, "Jarvis", "#jarvis");
  await expectHeaderNavResolvesToSection(page, "Educação", "#educacao");
});

test("aguarda a hidratação antes de escolher a navegação mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "desktop", "Regressão dos timeouts observados em mobile e tablet.");
  let delayedModules = 0;
  await page.route("**/*MobileNav*", async (route) => {
    delayedModules += 1;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });

  await page.goto("/", { waitUntil: "commit" });
  await expectHeaderNavResolvesToSection(page, "Sobre", "#sobre");
  expect(delayedModules).toBeGreaterThan(0);
  await expect(page.getByRole("banner").getByRole("button", { name: "Menu" })).toBeFocused();
});

test("navega para GitHub e Contato pelo menu mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "desktop", "Verificação específica do menu mobile/tablet.");

  await page.goto("/");
  await expectHeaderNavResolvesToSection(page, "Educação", "#educacao");

  await page.goto("/");
  await expectHeaderNavResolvesToSection(page, "Open source", "#github");

  await page.goto("/");
  await expectHeaderNavResolvesToSection(page, "Contato", "#contato");
});

test("explora o repertório por clique e teclado", async ({ page }) => {
  await page.goto("/");

  const repertoire = page.locator("#repertorio");
  const agentsTab = repertoire.getByRole("tab", { name: "Agentes & automação" });
  const productTab = repertoire.getByRole("tab", { name: "Produto & engenharia" });
  const panel = repertoire.getByRole("tabpanel");

  await repertoire.scrollIntoViewIfNeeded();
  await agentsTab.click();
  await expect(agentsTab).toHaveAttribute("aria-selected", "true");
  await expect(panel.getByRole("heading", { name: "Agentes que conversam, consultam, decidem e executam com contexto." })).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Minino Jarvis" })).toBeVisible();

  await agentsTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(productTab).toBeFocused();
  await expect(productTab).toHaveAttribute("aria-selected", "true");
  await expect(panel.getByRole("heading", { name: "Da interface ao processo de fundo, construo o produto inteiro." })).toBeVisible();
});

test("resolve todos os destinos do nav desktop", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Verificação específica do nav desktop.");

  const navTargets = ["#sobre", "#repertorio", "#jarvis", "#educacao", "#youtube", "#github", "#contato"];

  await page.goto("/");

  for (const hash of navTargets) {
    await expect(page.getByRole("navigation", { name: "Principal" }).locator(`a[href="${hash}"]`)).toHaveCount(1);
    await expect.poll(async () => page.evaluate((selector) => document.querySelectorAll(selector).length, hash)).toBe(1);
  }

  await page.getByRole("navigation", { name: "Principal" }).locator('a[href="#github"]').click();
  await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#github");
  await expect(page.locator("#github")).toBeVisible();

  await page.getByRole("navigation", { name: "Principal" }).locator('a[href="#contato"]').click();
  await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#contato");
  await expect(page.locator("#contato")).toBeVisible();
});

test("apresenta educação aplicada para empresas", async ({ page }) => {
  await page.goto("/");

  const education = page.locator("#educacao");
  const leverageItems = education.locator(".education-leverage-item");
  const methodItems = education.locator(".education-method li");

  await education.scrollIntoViewIfNeeded();
  await expect(
    education.getByRole("heading", { name: "Elevar o nível das pessoas muda o limite da empresa." })
  ).toBeVisible();
  await expect(
    education.getByText(
      "Desenho e conduzo treinamentos in-company para transformar IA em capacidade prática: mais repertório, autonomia e velocidade para resolver problemas reais da operação."
    )
  ).toBeVisible();

  await expect(leverageItems).toHaveCount(2);
  await expect(leverageItems.nth(0).locator(".education-metric")).toHaveText("7× mais rápido");
  await expect(leverageItems.nth(0).locator("h3")).toHaveText("Aprender mais rápido");
  await expect(leverageItems.nth(0).locator("p").last()).toHaveText(
    "Ciclos curtos de prática, feedback e IA comprimem o caminho entre não saber e conseguir aplicar."
  );
  await expect(leverageItems.nth(1).locator(".education-metric")).toHaveText("1 → 7");
  await expect(leverageItems.nth(1).locator("h3")).toHaveText("Capacidade de 7 pessoas");
  await expect(leverageItems.nth(1).locator("p").last()).toHaveText(
    "Agentes, automações e sistemas ajudam cada colaborador a operar com a alavancagem de uma pequena equipe, sem multiplicar horas."
  );

  await expect(methodItems).toHaveCount(3);
  await expect(methodItems.nth(0).locator(".education-method-number")).toHaveText("01");
  await expect(methodItems.nth(0).locator("h3")).toHaveText("Diagnóstico da operação");
  await expect(methodItems.nth(0).locator("p")).toHaveText(
    "O treinamento começa nos gargalos, ferramentas e decisões que a equipe já enfrenta."
  );
  await expect(methodItems.nth(1).locator(".education-method-number")).toHaveText("02");
  await expect(methodItems.nth(1).locator("h3")).toHaveText("Prática aplicada");
  await expect(methodItems.nth(1).locator("p")).toHaveText(
    "Cada conceito vira exercício, workflow e uso real de IA dentro do contexto da empresa."
  );
  await expect(methodItems.nth(2).locator(".education-method-number")).toHaveText("03");
  await expect(methodItems.nth(2).locator("h3")).toHaveText("Capacidade que permanece");
  await expect(methodItems.nth(2).locator("p")).toHaveText(
    "Playbooks e padrões deixam o conhecimento utilizável depois do encontro."
  );

  await expect(
    education.getByText(
      "7× é uma referência de desenho e alavancagem do programa. O resultado depende do contexto, da adesão e da execução de cada equipe."
    )
  ).toBeVisible();

  const cta = education.getByRole("link", { name: "Levar o treinamento para minha empresa" });

  const href = await cta.getAttribute("href");
  expect(href).not.toBeNull();
  const trainingUrl = new URL(href!);
  expect(trainingUrl.origin).toBe("https://wa.me");
  expect(trainingUrl.pathname).toBe("/5544998893474");
  expect(trainingUrl.searchParams.get("text")).toBe("Olá, Leonardo. Quero conversar sobre um treinamento de IA para a minha equipe.");
});

test("apresenta GitHub público, presença pública e contato", async ({ page }) => {
  await page.goto("/");

  const github = page.locator("#github");
  const featuredCards = github.locator(".github-featured-card");
  const recentItems = github.locator(".github-recent-item");
  const profileLink = github.getByRole("link", { name: "Ver perfil completo" });
  const expectedFeaturedRepositories = featuredRepositoryNames.map((name) => {
    const repository = snapshot.repositories.find((item) => item.name === name);

    expect(repository, `${name} deve existir no snapshot não vazio usado pelo build`).toBeTruthy();

    return repository!;
  });
  const expectedRecentNames = snapshot.repositories
    .filter((repository) => !featuredRepositoryNames.includes(repository.name as (typeof featuredRepositoryNames)[number]))
    .slice(0, 4)
    .map((repository) => repository.name);

  expect(snapshot.repositories.length).toBeGreaterThan(0);
  await expect(github).toContainText("Open source");
  await expect(featuredCards.first()).toBeVisible();
  await expect(featuredCards).toHaveCount(3);
  await expect(featuredCards.locator("h3 a")).toHaveText([...featuredRepositoryNames]);

  for (const [index, repository] of expectedFeaturedRepositories.entries()) {
    const card = featuredCards.nth(index);

    await expect(card).toContainText(repository.language ?? "Linguagem não informada");
    await expect(card).toContainText(formatStars(repository.stars));
    await expect(card.locator("time")).toHaveText(formatDate(repository.pushedAt));
  }

  await expect(recentItems).toHaveCount(expectedRecentNames.length);
  expect(expectedRecentNames.length).toBeLessThanOrEqual(4);
  expect(await recentItems.locator("h3 a").allTextContents()).toEqual(expectedRecentNames);
  expect(expectedRecentNames).toEqual(expect.not.arrayContaining([...featuredRepositoryNames]));

  await expect(profileLink).toHaveAttribute("href", "https://github.com/leonardocandiani");
  await expect(profileLink).toHaveAttribute("target", "_blank");
  await expect(profileLink).toHaveAttribute("rel", /noopener/);
  await expect(profileLink).toHaveAttribute("rel", /noreferrer/);

  for (const repositoryLink of await github.locator('article a[href^="https://github.com/"]').all()) {
    const href = await repositoryLink.getAttribute("href");
    const rel = await repositoryLink.getAttribute("rel");

    expect(href).toMatch(/^https:\/\/github\.com\/leonardocandiani\//);
    await expect(repositoryLink).toHaveAttribute("target", "_blank");
    expect(rel?.split(/\s+/)).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
  }

  const presence = page.locator("section.public-presence");
  const presenceLinks = presence.getByRole("link");

  await expect(presenceLinks).toHaveCount(3);
  await expect(presence.getByRole("link", { name: /WhatsApp/ })).toHaveCount(0);

  for (const [index, expectedLink] of publicPresenceLinks.entries()) {
    const presenceLink = presenceLinks.nth(index);
    const rel = await presenceLink.getAttribute("rel");

    await expect(presenceLink).toHaveAccessibleName(expectedLink.label);
    await expect(presenceLink).toHaveAttribute("href", expectedLink.href);
    await expect(presenceLink).toHaveAttribute("target", "_blank");
    expect(rel?.split(/\s+/)).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
  }

  const whatsappLink = page.locator("footer#contato").getByRole("link", { name: "Falar com Leonardo no WhatsApp" });
  const href = await whatsappLink.getAttribute("href");
  const whatsappUrl = new URL(href!);

  expect(whatsappUrl.origin).toBe("https://wa.me");
  expect(whatsappUrl.pathname).toBe("/5544998893474");
  expect(whatsappUrl.searchParams.get("text")).toBe("Olá Leo, quero conversar sobre IA na minha empresa");
  await expect(page.locator("footer#contato .contact-meta")).toHaveText("Leonardo Candiani, Brasil");
});

test("apresenta o Minino Jarvis como case e não como hero", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).not.toContainText("Minino Jarvis");

  const jarvis = page.locator("#jarvis");
  const demo = jarvis.locator(".jarvis-demo");

  await jarvis.scrollIntoViewIfNeeded();
  await expect(jarvis.getByRole("heading", { name: "Pergunte à sua empresa. Ela responde no WhatsApp." })).toBeVisible();
  await expect(
    jarvis.getByText(
      "O Minino Jarvis coloca informações conectadas da operação na palma de diretores e gestores, para investigar, decidir e acelerar novas capacidades sem sair da conversa."
    )
  ).toBeVisible();
  await expect(jarvis.getByText("Arquitetura invisível, impacto visível.")).toBeVisible();
  await expect(
    jarvis.getByRole("heading", {
      name: "Harnesses próprios, integrações reais e frameworks atuais validados no mercado."
    })
  ).toBeVisible();
  await expect(
    jarvis.getByText(
      "A experiência simples no WhatsApp depende de uma arquitetura que organiza contexto, ferramentas, memória, regras e permissões da empresa."
    )
  ).toBeVisible();

  await jarvis.getByRole("button", { name: /Onde preciso agir hoje/i }).click();
  await expect(demo).toHaveAttribute("data-step", "question");
  const directorMessage = jarvis.locator(".jarvis-message-director");

  await expect(directorMessage.getByText("Como está nossa operação hoje e onde preciso agir primeiro?")).toBeVisible();
  await expect(demo).toHaveAttribute("data-step", "consulting", { timeout: 2_000 });
  await expect(jarvis.getByRole("complementary", { name: "Bastidores técnicos da consulta" })).toBeVisible();
  await expect(jarvis.locator(".jarvis-tools li")).toHaveCount(3);

  await expect(demo).toHaveAttribute("data-step", "approval", { timeout: 5_000 });
  const answerMessage = jarvis.locator(".jarvis-answer");

  await expect(answerMessage.getByText("Prioridade encontrada", { exact: true })).toBeVisible();
  await expect(answerMessage.getByText("Conversas qualificadas estão aguardando retorno.")).toBeVisible();
  await expect(answerMessage.getByText("WhatsApp / conversas")).toBeVisible();
  await expect(jarvis.getByRole("complementary", { name: "Bastidores técnicos da consulta" })).toHaveCount(0);

  await jarvis.getByRole("button", { name: "Autorizar ação" }).click();
  await expect(demo).toHaveAttribute("data-step", "success", { timeout: 3_000 });
  const success = jarvis.locator(".jarvis-success");
  const askAgain = jarvis.getByRole("button", { name: "Fazer outra pergunta" });

  await expect(success).toContainText("Contatos distribuídos, gestores avisados");
  await expect.poll(async () => Number(await success.evaluate((element) => getComputedStyle(element).opacity))).toBe(1);

  await askAgain.click();
  await expect(demo).toHaveAttribute("data-step", "idle");
});

test("mantém a experiência completa do Jarvis com reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const jarvis = page.locator("#jarvis");
  const demo = jarvis.locator(".jarvis-demo");

  await jarvis.scrollIntoViewIfNeeded();
  await expect(demo).toHaveAttribute("data-step", "idle");
  await jarvis.getByRole("button", { name: /Qual equipe pede atenção/i }).click();
  await expect(demo).toHaveAttribute("data-step", "approval", { timeout: 1_500 });
  await expect(jarvis.getByText("Atenção na equipe de atendimento", { exact: true })).toBeVisible();

  const animatedItem = jarvis.locator(".jarvis-answer-copy p").first();
  const motion = await animatedItem.evaluate((element) => {
    const style = getComputedStyle(element);
    return { animationDuration: style.animationDuration, transform: style.transform };
  });

  expect(motion).toEqual({ animationDuration: "0s", transform: "none" });
});

test("roteia pergunta livre e recusa resposta fora do escopo do protótipo", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const jarvis = page.locator("#jarvis");
  const demo = jarvis.locator(".jarvis-demo");
  const input = jarvis.getByLabel("Pergunta para o Minino Jarvis");

  await jarvis.scrollIntoViewIfNeeded();
  await input.fill("Como estão nossas vendas?");
  await jarvis.getByRole("button", { name: "Enviar" }).click();
  await expect(demo).toHaveAttribute("data-step", "approval", { timeout: 1_500 });
  await expect(jarvis.getByText("O gargalo mudou de lugar", { exact: true })).toBeVisible();

  await jarvis.getByRole("button", { name: "Escolher outra pergunta" }).click();
  await input.fill("Qual será o clima amanhã?");
  await jarvis.getByRole("button", { name: "Enviar" }).click();
  await expect(demo).toHaveAttribute("data-step", "unsupported");
  await expect(jarvis.getByText("Esta demonstração tem um recorte claro.")).toBeVisible();
  await expect(jarvis.locator(".jarvis-answer")).toHaveCount(0);
});

test("cancela a consulta anterior quando o visitante troca de cenário", async ({ page }) => {
  await page.goto("/");

  const jarvis = page.locator("#jarvis");
  const demo = jarvis.locator(".jarvis-demo");

  await jarvis.scrollIntoViewIfNeeded();
  await jarvis.getByRole("button", { name: /Onde preciso agir hoje/i }).click();
  await expect(demo).toHaveAttribute("data-step", "consulting", { timeout: 2_000 });
  await jarvis.getByRole("button", { name: /Qual equipe pede atenção/i }).click();
  await expect(demo).toHaveAttribute("data-step", "approval", { timeout: 5_000 });
  await expect(jarvis.locator(".jarvis-message-director")).toContainText("Qual equipe precisa de atenção hoje?");
  await expect(jarvis.getByText("Atenção na equipe de atendimento", { exact: true })).toBeVisible();
  await expect(jarvis.getByText("Prioridade encontrada", { exact: true })).toHaveCount(0);
});

test("leva a pergunta para a conversa no celular", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "iPhone 15 Pro", "Verificação específica do viewport mobile.");
  await page.goto("/");

  const jarvis = page.locator("#jarvis");
  const experience = jarvis.locator(".jarvis-experience");

  await jarvis.scrollIntoViewIfNeeded();
  await jarvis.getByRole("button", { name: /Onde preciso agir hoje/i }).click();
  await expect
    .poll(async () => experience.evaluate((element) => Math.abs(element.getBoundingClientRect().top)))
    .toBeLessThan(120);
  await expect(jarvis.locator(".jarvis-message-director")).toBeVisible();
});

test("marca os sete reveals editoriais quando entram na viewport", async ({ page }) => {
  await page.goto("/");

  for (const selector of revealSelectors) {
    const element = page.locator(selector);

    await element.scrollIntoViewIfNeeded();
    await expect(element).toHaveAttribute("data-visible", "true");
  }
});
