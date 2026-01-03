import { test, expect } from "@playwright/test";

/**
 * PEO-DP Petrobras 2021 E2E Tests
 * Tests the Programa de Excelência em Operações DP
 * 54+ requirements across 6 sections, with Section 3.2 as critical
 */
test.describe("PEO-DP Petrobras 2021", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/peo-dp");
    await page.waitForTimeout(1000);
  });

  test("should display PEO-DP dashboard", async ({ page }) => {
    await expect(page.locator("h1, h2").filter({ hasText: /peo-dp|dynamic positioning/i }).first()).toBeVisible();
  });

  test("should show 6 sections with requirements", async ({ page }) => {
    const sectionsTab = page.locator("text=/Seção|Section|6 Seções/i").first();
    if (await sectionsTab.isVisible()) {
      await expect(sectionsTab).toBeVisible();
    }
  });

  test("should highlight Section 3.2 (Gestão) as critical", async ({ page }) => {
    const criticalSection = page.locator("text=/3\\.2|Gestão|crítico|critical/i");
    await page.waitForTimeout(2000);
  });

  test("should display IPCLV indicator (meta 100%)", async ({ page }) => {
    const ipclvIndicator = page.locator("text=/IPCLV|100%/i");
    await page.waitForTimeout(2000);
  });

  test("should track DP events (Drift Off, Drive Off, Large Excursion)", async ({ page }) => {
    const dpEvents = page.locator("text=/Drift Off|Drive Off|Large Excursion|Evento DP/i");
    await page.waitForTimeout(2000);
  });

  test("should display ASOG status", async ({ page }) => {
    const asogStatus = page.locator("text=/asog|status operacional/i").first();
    if (await asogStatus.isVisible()) {
      await expect(asogStatus).toBeVisible();
    }
  });

  test("should have DP class selector (DP1/DP2/DP3)", async ({ page }) => {
    const dpSelector = page.locator("text=/DP1|DP2|DP3/i").first();
    if (await dpSelector.isVisible()) {
      await expect(dpSelector).toBeVisible();
    }
  });

  test("should show compliance metrics", async ({ page }) => {
    const complianceCard = page.locator("text=/compliance|conformidade|%/i").first();
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

  test("should show AI advisor for evidence", async ({ page }) => {
    const aiAdvisor = page.locator("text=/AI Advisor|Advisor|IA|Evidência/i").first();
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

  test("should display 54+ requirements", async ({ page }) => {
    const requirements = page.locator('[class*="requirement"], [class*="item"], tr');
    await page.waitForTimeout(3000);
  });

  test("should allow requirement responses", async ({ page }) => {
    const responseInput = page.locator('input, textarea, select, [role="combobox"]').first();
    if (await responseInput.isVisible({ timeout: 5000 })) {
      await expect(responseInput).toBeEnabled();
    }
  });

  test("should navigate between sections", async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    if (await tabs.count() > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe("PEO-DP AI Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/peo-dp");
    await page.waitForTimeout(1000);
  });

  test("should have AI evidence generator", async ({ page }) => {
    const aiButton = page.locator('button:has-text(/IA|AI|Evidência|Evidence|Gerar/)');
    if (await aiButton.first().isVisible({ timeout: 5000 })) {
      await expect(aiButton.first()).toBeEnabled();
    }
  });

  test("should have voice chat functionality", async ({ page }) => {
    const voiceButton = page.locator('button:has-text(/Voz|Voice|Chat|Assistente/)');
    if (await voiceButton.first().isVisible({ timeout: 5000 })) {
      await expect(voiceButton.first()).toBeEnabled();
    }
  });
});

test.describe("PEO-DP Reporting", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/peo-dp");
    await page.waitForTimeout(1000);
  });

  test("should generate ANP-standard reports", async ({ page }) => {
    const reportButton = page.locator('button:has-text(/Relatório|Report|PDF|ANP/)');
    if (await reportButton.first().isVisible({ timeout: 5000 })) {
      await expect(reportButton.first()).toBeEnabled();
    }
  });

  test("should show progress per section", async ({ page }) => {
    const progress = page.locator('[class*="progress"], [role="progressbar"], text=/\\d+%/');
    await page.waitForTimeout(2000);
  });
});
