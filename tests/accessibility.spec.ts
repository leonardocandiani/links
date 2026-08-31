import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const revealSelectors = [
  ".about-heading",
  ".culture-copy",
  ".culture-bridge",
  ".work-heading",
  ".jarvis-intro",
  ".education-intro",
  ".github-heading"
] as const;

test("não tem violações Axe críticas ou sérias na home", async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();
  const blockingViolations = results.violations.filter((violation) =>
    violation.impact === "critical" || violation.impact === "serious"
  );

  expect(blockingViolations).toEqual([]);
});

test("mantém a estrutura semântica principal da home", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
});

test("mantém conteúdo e menus acessíveis com reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const jarvis = page.locator("#jarvis");
  await jarvis.scrollIntoViewIfNeeded();
  await jarvis.getByRole("button", { name: /Onde preciso agir hoje/i }).click();
  await expect(jarvis.locator(".jarvis-demo")).toHaveAttribute("data-step", "approval", { timeout: 1_500 });
  await expect(jarvis.getByText("Prioridade encontrada", { exact: true })).toBeVisible();

  const github = page.locator("#github");
  await github.scrollIntoViewIfNeeded();
  await expect(github).toBeVisible();

  for (const selector of revealSelectors) {
    const element = page.locator(selector);

    await element.scrollIntoViewIfNeeded();
    await expect(element).toHaveAttribute("data-reveal-ready", "true");
    await expect(element).toHaveAttribute("data-visible", "true");
    await expect(element).toBeVisible();

    const motionStyles = await element.evaluate((node) => {
      const style = getComputedStyle(node);

      return {
        transform: style.transform,
        transitionDuration: style.transitionDuration,
        transitionProperty: style.transitionProperty,
        transitionTimingFunction: style.transitionTimingFunction
      };
    });

    expect(motionStyles).toEqual({
      transform: "none",
      transitionDuration: "0s",
      transitionProperty: "none",
      transitionTimingFunction: "ease"
    });
  }

  const menuButton = page.getByRole("banner").getByRole("button", { name: "Menu" });

  if (await menuButton.isVisible()) {
    await expect(page.locator(".mobile-nav")).toHaveAttribute("data-hydrated", "true");
    await menuButton.click();
    await expect(page.getByRole("dialog", { name: "Navegação" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Navegação" })).toHaveCount(0);
    await expect(menuButton).toBeFocused();
  }
});

test("mantém alvos de toque com pelo menos 44 por 44 pixels", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "iPhone 15 Pro", "Verificação específica do viewport mobile.");
  await page.goto("/");

  const undersizedTargets = await page.locator("a, button, summary").evaluateAll((elements) =>
    elements
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();

        return {
          label: element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) ?? "",
          width: rect.width,
          height: rect.height
        };
      })
      .filter((target) => target.width < 44 || target.height < 44)
  );

  expect(undersizedTargets).toEqual([]);
});
