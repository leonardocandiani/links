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
    await expect(page.locator(".brand-signature__surname").first()).toHaveText("Candiani");
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

test("keeps the mobile hero clean and the navigation compact", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Executa uma vez no viewport exato do iPhone reportado.");

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  await page.goto("http://127.0.0.1:4322/");

  const layout = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".header-shell");
    const surname = document.querySelector<HTMLElement>(".site-header .brand-signature__surname");

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
      nameLineDisplay: nameLine.display,
      noDocumentOverflow: document.documentElement.scrollWidth <= window.innerWidth
    };
  });

  expect(layout.hasHeroLine).toBe(false);
  expect(layout.nameLineDisplay).toBe("none");
  expect(layout.headerHeight).toBeLessThanOrEqual(56);
  expect(layout.headerRadius).toBeLessThanOrEqual(18);
  expect(layout.headerInsideViewport).toBe(true);
  expect(layout.noDocumentOverflow).toBe(true);

  await context.close();
});

test("keeps the header name free of decorative cursors and nested hover pills", async ({ page }) => {
  await page.goto("/");

  const brand = page.locator(".site-header .brand");
  const surname = brand.locator(".brand-signature__surname");
  const initialBackground = await brand.evaluate((element) => getComputedStyle(element).backgroundColor);

  await brand.hover();

  const visualState = await brand.evaluate((element) => {
    const surname = element.querySelector<HTMLElement>(".brand-signature__surname");

    if (!surname) {
      throw new Error("Sobrenome da assinatura não encontrado.");
    }

    return {
      background: getComputedStyle(element).backgroundColor,
      lineDisplay: getComputedStyle(surname, "::before").display
    };
  });

  expect(visualState.lineDisplay).toBe("none");
  expect(visualState.background).toBe(initialBackground);
  await expect(surname).toHaveText("Candiani");
});

test("centers the signature vertically inside the header control", async ({ page }) => {
  await page.goto("/");

  const alignment = await page.locator(".site-header .brand").evaluate((brand) => {
    const givenName = brand.querySelector<HTMLElement>(".brand-signature__given");

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

test("keeps the desktop header grouped without elastic dead space", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Executa uma vez no breakpoint desktop reportado.");

  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await context.newPage();

  await page.goto("http://127.0.0.1:4322/");

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
      noDocumentOverflow: document.documentElement.scrollWidth <= window.innerWidth
    };
  });

  expect(layout.gap).toBeGreaterThanOrEqual(8);
  expect(layout.gap).toBeLessThanOrEqual(24);
  expect(layout.unusedSpace).toBeLessThanOrEqual(18);
  expect(layout.shellWidth).toBeLessThanOrEqual(800);
  expect(layout.noDocumentOverflow).toBe(true);

  await context.close();
});
