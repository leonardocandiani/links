import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("publishes a complete English portfolio at /en", async ({ page }) => {
  await page.goto("/en/");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle("Leonardo Candiani | AI leadership, products, and business systems");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("I build the intelligence");
  await expect(page.getByRole("heading", { name: "What limits us is our creativity." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ask your company. It answers on WhatsApp." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Raising people's level changes the company's limits." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What I learn also becomes public tooling." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeAttached();
  await expect(page.getByRole("link", { name: "Ver em português" }).first()).toHaveAttribute("href", "/");

  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute("href", "https://leonardocandiani.com.br/en/");
  await expect(page.locator('link[rel="alternate"][hreflang="pt-BR"]')).toHaveAttribute("href", "https://leonardocandiani.com.br/");
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", "https://leonardocandiani.com.br/en/");
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "en_US");
});

test("runs the Minino Jarvis demo entirely in English", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/#jarvis");

  const jarvis = page.locator("#jarvis");
  const demo = jarvis.locator(".jarvis-demo");

  await jarvis.scrollIntoViewIfNeeded();
  await jarvis.getByLabel("Question for Minino Jarvis").fill("How are sales this week?");
  await jarvis.getByRole("button", { name: "Send" }).click();
  await expect(demo).toHaveAttribute("data-step", "approval", { timeout: 1_500 });
  await expect(jarvis.getByText("The bottleneck moved", { exact: true })).toBeVisible();
  await expect(jarvis.getByRole("button", { name: "Authorize action" })).toBeVisible();

  await jarvis.getByRole("button", { name: "Authorize action" }).click();
  await expect(demo).toHaveAttribute("data-step", "success", { timeout: 1_500 });
  await expect(jarvis.getByText("Queue prioritized, owners assigned and response deadlines tracked.")).toBeVisible();
});

test("keeps the English page free of serious accessibility violations", async ({ page }) => {
  await page.goto("/en/");

  const results = await new AxeBuilder({ page }).analyze();
  const blockingViolations = results.violations.filter((violation) =>
    violation.impact === "critical" || violation.impact === "serious"
  );

  expect(blockingViolations).toEqual([]);
});

test("keeps the approved personal branding in both locales", async ({ page }) => {
  for (const path of ["/", "/en/"]) {
    await page.goto(path);
    await expect(page.locator(".site-header .brand__given")).toHaveText("Leonardo");
    await expect(page.locator(".site-header .brand__surname")).toHaveText("Candiani");
    await expect(page.locator(".hero-limit-word")).toHaveCount(0);
    await expect(page.locator(".culture-limit-word")).toHaveCount(1);
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/favicon.png?v=4");
  }
});

test("shows a single language switch at each viewport size", async ({ page }, testInfo) => {
  await page.goto("/");

  const visibleSwitches = await page.locator(".language-switch").evaluateAll((elements) =>
    elements.filter((element) => {
      const styles = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return styles.display !== "none" && box.width > 0 && box.height > 0;
    }).length
  );

  expect(visibleSwitches, `language switch duplicado em ${testInfo.project.name}`).toBe(1);
});

test("keeps the mobile hero clean and the navigation compact", async ({ browser, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Executa uma vez no viewport exato do iPhone reportado.");

  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  await page.goto("/");

  const layout = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".header-shell");
    const surname = document.querySelector<HTMLElement>(".site-header .brand__surname");

    if (!header || !surname) {
      throw new Error("Estrutura visual principal incompleta.");
    }

    const headerBox = header.getBoundingClientRect();
    const headerStyle = getComputedStyle(header);
    const nameLine = getComputedStyle(surname, "::before");

    return {
      headerHeight: headerBox.height,
      headerInsideViewport: headerBox.left >= 0 && headerBox.right <= window.innerWidth,
      headerRadius: Number.parseFloat(headerStyle.borderTopLeftRadius),
      hasHeroLine: Boolean(document.querySelector(".hero-limit-word")),
      nameLineContent: nameLine.content,
      noDocumentOverflow: document.documentElement.scrollWidth <= window.innerWidth
    };
  });

  expect(layout.hasHeroLine).toBe(false);
  expect(["none", "normal"]).toContain(layout.nameLineContent);
  expect(layout.headerHeight).toBeGreaterThanOrEqual(56);
  expect(layout.headerHeight).toBeLessThanOrEqual(64);
  expect(layout.headerRadius).toBeLessThanOrEqual(18);
  expect(layout.headerInsideViewport).toBe(true);
  expect(layout.noDocumentOverflow).toBe(true);

  await context.close();
});

test("keeps the header name free of decorative cursors and nested hover pills", async ({ page }) => {
  await page.goto("/");

  const brand = page.locator(".site-header .brand");
  const surname = brand.locator(".brand__surname");
  const initialBackground = await brand.evaluate((element) => getComputedStyle(element).backgroundColor);

  await brand.hover();

  const visualState = await brand.evaluate((element) => {
    const surname = element.querySelector<HTMLElement>(".brand__surname");

    if (!surname) {
      throw new Error("Sobrenome da assinatura não encontrado.");
    }

    return {
      background: getComputedStyle(element).backgroundColor,
      beforeContent: getComputedStyle(surname, "::before").content,
      afterContent: getComputedStyle(surname, "::after").content
    };
  });

  expect(["none", "normal"]).toContain(visualState.beforeContent);
  expect(["none", "normal"]).toContain(visualState.afterContent);
  expect(visualState.background).toBe(initialBackground);
  await expect(surname).toHaveText("Candiani");
});

test("centers the signature vertically inside the header control", async ({ page }) => {
  await page.goto("/");

  const alignment = await page.locator(".site-header .brand").evaluate((brand) => {
    const givenName = brand.querySelector<HTMLElement>(".brand__given");

    if (!givenName) {
      throw new Error("Nome da assinatura não encontrado.");
    }

    const brandBox = brand.getBoundingClientRect();
    const textBox = givenName.getBoundingClientRect();
    const brandCenter = brandBox.top + brandBox.height / 2;
    const textCenter = textBox.top + textBox.height / 2;

    return {
      centerDifference: Math.abs(brandCenter - textCenter),
      alignItems: getComputedStyle(brand).alignItems
    };
  });

  expect(alignment.alignItems).toBe("center");
  expect(alignment.centerDifference).toBeLessThanOrEqual(1);
});

test("keeps the desktop header centered with balanced margins and separated controls", async ({ browser, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Executa uma vez no breakpoint desktop reportado.");

  const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Principal" })).toBeVisible();

  const layout = await page.evaluate(() => {
    const shell = document.querySelector<HTMLElement>(".header-shell");
    const brand = document.querySelector<HTMLElement>(".site-header .brand");
    const navigation = document.querySelector<HTMLElement>(".desktop-nav");

    if (!shell || !brand || !navigation) {
      throw new Error("Cabeçalho desktop incompleto.");
    }

    const shellBox = shell.getBoundingClientRect();
    const brandBox = brand.getBoundingClientRect();
    const navigationBox = navigation.getBoundingClientRect();

    return {
      gap: navigationBox.left - brandBox.right,
      unusedSpace: (brandBox.left - shellBox.left) + (shellBox.right - navigationBox.right),
      shellWidth: shellBox.width,
      shellHeight: shellBox.height,
      centerDifference: Math.abs(shellBox.left + shellBox.width / 2 - window.innerWidth / 2),
      controlsInsideShell: brandBox.left >= shellBox.left && navigationBox.right <= shellBox.right,
      controlsShareCenter: Math.abs(brandBox.top + brandBox.height / 2 - navigationBox.top - navigationBox.height / 2) <= 1,
      noDocumentOverflow: document.documentElement.scrollWidth <= window.innerWidth
    };
  });

  expect(layout.gap).toBeGreaterThanOrEqual(8);
  expect(layout.gap).toBeLessThanOrEqual(layout.shellWidth * .3);
  expect(layout.unusedSpace).toBeLessThanOrEqual(18);
  expect(layout.shellWidth).toBeCloseTo(1120, 0);
  expect(layout.shellHeight).toBeGreaterThanOrEqual(56);
  expect(layout.shellHeight).toBeLessThanOrEqual(64);
  expect(layout.centerDifference).toBeLessThanOrEqual(1);
  expect(layout.controlsInsideShell).toBe(true);
  expect(layout.controlsShareCenter).toBe(true);
  expect(layout.noDocumentOverflow).toBe(true);

  await context.close();
});

test("uses the mobile drawer below 1100 pixels and releases the page on desktop resize", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Executa uma vez os dois lados do breakpoint.");
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/");
  await expect(page.locator(".mobile-nav")).toHaveAttribute("data-hydrated", "true");

  const menu = page.getByRole("banner").getByRole("button", { name: "Menu" });
  const desktopNavigation = page.getByRole("navigation", { name: "Principal" });
  await expect(menu).toBeVisible();
  await expect(desktopNavigation).toBeHidden();
  await page.setViewportSize({ width: 1099, height: 768 });
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(page.getByRole("dialog", { name: "Navegação" })).toBeVisible();
  await expect(page.locator("main")).toHaveJSProperty("inert", true);

  await page.setViewportSize({ width: 1100, height: 768 });
  await expect(desktopNavigation).toBeVisible();
  await expect(menu).toBeHidden();
  await expect(page.locator(".nav-scrim")).toHaveCount(0);
  await expect(page.locator("main")).toHaveJSProperty("inert", false);
  await expect(page.locator("body")).toHaveJSProperty("style.overflow", "");
});

test("keeps the English training CTA contextual without navigating off-site", async ({ page }) => {
  await page.goto("/en/");
  const cta = page.locator("#educacao").getByRole("link", { name: "Bring this training to my company" });
  const href = await cta.getAttribute("href");
  expect(href).not.toBeNull();
  const destination = new URL(href!);
  expect(destination.origin).toBe("https://wa.me");
  expect(destination.pathname).toBe("/5544998893474");
  expect(destination.searchParams.get("text")).toBe("Hi Leonardo. I would like to discuss AI training for my team.");
});
