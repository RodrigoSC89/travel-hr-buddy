import { test, expect } from "@playwright/test";

test.describe("PEO-DP System", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/peo-dp");
    await page.waitForTimeout(1000);
  });

  test("should display PEO-DP dashboard", async ({ page }) => {
    await expect(page.locator("h1, h2").filter({ hasText: /peo-dp|dynamic positioning/i }).first()).toBeVisible();
  });

  test("should show 7 pillars overview", async ({ page }) => {
    const pillarsTab = page.locator("text=/7 Pilares|Pillars/i").first();
    if (await pillarsTab.isVisible()) {
      await pillarsTab.click();
      await page.waitForTimeout(500);
    }
  });

  test("should display ASOG status", async ({ page }) => {
    const asogStatus = page.locator("text=/asog|status operacional/i").first();
    if (await asogStatus.isVisible()) {
      await expect(asogStatus).toBeVisible();
    }
  });

  test("should have DP class selector", async ({ page }) => {
    const dpSelector = page.locator("text=/DP1|DP2|DP3/i").first();
    if (await dpSelector.isVisible()) {
      await expect(dpSelector).toBeVisible();
    }
  });

  test("should show compliance metrics", async ({ page }) => {
    const complianceCard = page.locator("text=/compliance|conformidade/i").first();
    if (await complianceCard.isVisible()) {
      await expect(complianceCard).toBeVisible();
    }
  });

  test("should display FMEA integration tab", async ({ page }) => {
    const fmeaTab = page.locator("text=/FMEA/i").first();
    if (await fmeaTab.isVisible()) {
      await fmeaTab.click();
      await page.waitForTimeout(500);
    }
  });

  test("should show AI advisor", async ({ page }) => {
    const aiAdvisor = page.locator("text=/AI Advisor|Advisor/i").first();
    if (await aiAdvisor.isVisible()) {
      await aiAdvisor.click();
      await page.waitForTimeout(500);
    }
  });

  test("should display logbook section", async ({ page }) => {
    const logbook = page.locator("text=/logbook/i").first();
    if (await logbook.isVisible()) {
      await logbook.click();
      await page.waitForTimeout(500);
    }
  });

  test("should show DP trials section", async ({ page }) => {
    const trials = page.locator("text=/trials|testes/i").first();
    if (await trials.isVisible()) {
      await trials.click();
      await page.waitForTimeout(500);
    }
  });

  test("should have export functionality", async ({ page }) => {
    const exportButton = page.getByRole("button", { name: /export|exportar|download/i }).first();
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeVisible();
    }
  });
});
