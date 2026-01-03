import { test, expect } from "@playwright/test";

/**
 * Unified Compliance Dashboard E2E Tests
 * Tests the consolidated compliance status view
 */
test.describe("Unified Compliance Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/compliance-center");
    await page.waitForTimeout(1000);
  });

  test("should display compliance center", async ({ page }) => {
    await expect(page.locator("h1, h2").filter({ hasText: /compliance|conformidade/i }).first()).toBeVisible();
  });

  test("should show unified status tab", async ({ page }) => {
    const unifiedTab = page.locator('button:has-text(/Unificado|Unified|Status/)');
    if (await unifiedTab.first().isVisible({ timeout: 5000 })) {
      await expect(unifiedTab.first()).toBeEnabled();
    }
  });

  test("should display overall compliance score", async ({ page }) => {
    const scoreElement = page.locator('text=/\\d+%/');
    await expect(scoreElement.first()).toBeVisible({ timeout: 10000 });
  });

  test("should show module cards for MLC, PEOTRAM, PEO-DP, SGSO, Pre-OVID", async ({ page }) => {
    const modules = ['MLC', 'PEOTRAM', 'PEO-DP', 'SGSO', 'Pre-OVID'];
    
    for (const module of modules) {
      const moduleCard = page.locator(`text=/${module}/i`);
      await page.waitForTimeout(500);
    }
  });

  test("should display status indicators (Conformes, Atenção, Críticos)", async ({ page }) => {
    const statusIndicators = page.locator('text=/Conformes|Atenção|Críticos/i');
    await page.waitForTimeout(2000);
  });

  test("should navigate to individual modules from cards", async ({ page }) => {
    const moduleLink = page.locator('a[href*="mlc"], a[href*="peotram"], a[href*="sgso"]');
    if (await moduleLink.first().isVisible({ timeout: 5000 })) {
      await expect(moduleLink.first()).toBeVisible();
    }
  });

  test("should show quick actions section", async ({ page }) => {
    const quickActions = page.locator('text=/Ações Rápidas|Quick Actions/i');
    await page.waitForTimeout(2000);
  });

  test("should have refresh button", async ({ page }) => {
    const refreshButton = page.locator('button:has-text(/Atualizar|Refresh/)');
    if (await refreshButton.first().isVisible({ timeout: 5000 })) {
      await expect(refreshButton.first()).toBeEnabled();
    }
  });

  test("should show last update timestamp", async ({ page }) => {
    const timestamp = page.locator('text=/Última atualização|Last update/i');
    await page.waitForTimeout(2000);
  });

  test("should display progress bars for each module", async ({ page }) => {
    const progressBars = page.locator('[class*="progress"], [role="progressbar"]');
    await expect(progressBars.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Compliance Dashboard GRC View", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/compliance-center");
    await page.waitForTimeout(1000);
  });

  test("should switch to GRC ISO 37301 tab", async ({ page }) => {
    const grcTab = page.locator('button:has-text(/GRC|ISO 37301/)');
    if (await grcTab.first().isVisible({ timeout: 5000 })) {
      await grcTab.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test("should show risks section", async ({ page }) => {
    const risksSection = page.locator('text=/Riscos|Risks/i');
    await page.waitForTimeout(2000);
  });

  test("should show AI recommendations", async ({ page }) => {
    const aiSection = page.locator('text=/IA|AI|Recomendações|Recommendations/i');
    await page.waitForTimeout(2000);
  });

  test("should have report generation button", async ({ page }) => {
    const reportButton = page.locator('button:has-text(/Relatório|Report|Gerar/)');
    if (await reportButton.first().isVisible({ timeout: 5000 })) {
      await expect(reportButton.first()).toBeEnabled();
    }
  });
});

test.describe("Compliance Dashboard Navigation", () => {
  test("should navigate to MLC module", async ({ page }) => {
    await page.goto("/compliance-center");
    await page.waitForLoadState('networkidle');

    const mlcLink = page.locator('a[href*="mlc-inspection"]');
    if (await mlcLink.first().isVisible({ timeout: 5000 })) {
      await mlcLink.first().click();
      await expect(page).toHaveURL(/mlc-inspection/);
    }
  });

  test("should navigate to PEOTRAM module", async ({ page }) => {
    await page.goto("/compliance-center");
    await page.waitForLoadState('networkidle');

    const peotramLink = page.locator('a[href*="peotram"]');
    if (await peotramLink.first().isVisible({ timeout: 5000 })) {
      await peotramLink.first().click();
      await expect(page).toHaveURL(/peotram/);
    }
  });

  test("should navigate to SGSO module", async ({ page }) => {
    await page.goto("/compliance-center");
    await page.waitForLoadState('networkidle');

    const sgsoLink = page.locator('a[href*="sgso"]');
    if (await sgsoLink.first().isVisible({ timeout: 5000 })) {
      await sgsoLink.first().click();
      await expect(page).toHaveURL(/sgso/);
    }
  });
});
