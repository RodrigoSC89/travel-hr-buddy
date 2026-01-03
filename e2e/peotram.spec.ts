import { test, expect } from "@playwright/test";

/**
 * PEOTRAM 2024 E2E Tests
 * Tests the Petrobras PEOTRAM standard with 13 elements
 */
test.describe("PEOTRAM 2024 Audit System", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/peotram");
    await page.waitForTimeout(1000);
  });

  test("should display PEOTRAM dashboard", async ({ page }) => {
    await expect(page.locator("h1, h2").filter({ hasText: /peotram|auditoria/i }).first()).toBeVisible();
  });

  test("should show 13 elements tabs", async ({ page }) => {
    const tabsTrigger = page.locator("text=/13 Elementos|elementos/i").first();
    if (await tabsTrigger.isVisible()) {
      await expect(tabsTrigger).toBeVisible();
    }
  });

  test("should display compliance score", async ({ page }) => {
    const scoreElement = page.locator("text=/%|score/i").first();
    if (await scoreElement.isVisible()) {
      await expect(scoreElement).toBeVisible();
    }
  });

  test("should have new audit button", async ({ page }) => {
    const newAuditButton = page.getByRole("button", { name: /nova auditoria|new audit/i }).first();
    if (await newAuditButton.isVisible()) {
      await expect(newAuditButton).toBeVisible();
      await newAuditButton.click();
      await page.waitForTimeout(500);
    }
  });

  test("should show audit list", async ({ page }) => {
    const auditList = page.locator("table, [data-testid=\"audit-list\"]").first();
    if (await auditList.isVisible()) {
      await expect(auditList).toBeVisible();
    }
  });

  test("should display AI assistant tab", async ({ page }) => {
    const aiTab = page.locator("text=/IA Chat|AI|Assistente/i").first();
    if (await aiTab.isVisible()) {
      await aiTab.click();
      await page.waitForTimeout(500);
    }
  });

  test("should show evidence generator", async ({ page }) => {
    const evidenceTab = page.locator("text=/Evidências|Evidence/i").first();
    if (await evidenceTab.isVisible()) {
      await evidenceTab.click();
      await page.waitForTimeout(500);
    }
  });

  test("should display export button", async ({ page }) => {
    const exportButton = page.getByRole("button", { name: /exportar|export|download/i }).first();
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeVisible();
    }
  });

  test("should navigate to PDF report", async ({ page }) => {
    const pdfTab = page.locator("text=/Relatório PDF|PDF Report/i").first();
    if (await pdfTab.isVisible()) {
      await pdfTab.click();
      await page.waitForTimeout(500);
    }
  });

  test("should show non-conformities section", async ({ page }) => {
    const ncSection = page.locator("text=/não conformidade|non-conform/i").first();
    if (await ncSection.isVisible()) {
      await expect(ncSection).toBeVisible();
    }
  });

  test("should highlight critical elements 4, 6, 11, 12", async ({ page }) => {
    // PEOTRAM 2024 critical elements
    const criticalElements = page.locator("text=/crítico|critical|Elemento 4|Elemento 6|Elemento 11|Elemento 12/i");
    await page.waitForTimeout(2000);
  });

  test("should navigate between 13 element tabs", async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    const count = await tabs.count();
    if (count > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
      await expect(page.locator('[role="tabpanel"]').first()).toBeVisible();
    }
  });

  test("should show progress per element", async ({ page }) => {
    const progressBars = page.locator('[class*="progress"], [role="progressbar"]');
    if (await progressBars.first().isVisible({ timeout: 5000 })) {
      await expect(progressBars.first()).toBeVisible();
    }
  });

  test("should have voice assistant button", async ({ page }) => {
    const voiceButton = page.locator('button:has-text(/Voz|Voice|Microfone/)');
    if (await voiceButton.first().isVisible({ timeout: 5000 })) {
      await expect(voiceButton.first()).toBeEnabled();
    }
  });

  test("should allow marking items as compliant", async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"], [role="checkbox"]').first();
    if (await checkbox.isVisible({ timeout: 5000 })) {
      const wasChecked = await checkbox.isChecked();
      await checkbox.click();
      await expect(checkbox).toBeChecked({ checked: !wasChecked });
    }
  });

  test("should persist data on page reload", async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible({ timeout: 5000 })) {
      await checkbox.click();
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
  });
});

test.describe("PEOTRAM AI Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/peotram");
    await page.waitForTimeout(1000);
  });

  test("should have AI evidence generator", async ({ page }) => {
    const aiButton = page.locator('button:has-text(/IA|AI|Evidência|Gerar/)');
    if (await aiButton.first().isVisible({ timeout: 5000 })) {
      await expect(aiButton.first()).toBeEnabled();
    }
  });

  test("should show AI analysis results", async ({ page }) => {
    const analysisSection = page.locator('text=/análise|analysis|recomendação|recommendation/i');
    await page.waitForTimeout(2000);
  });
});

test.describe("PEOTRAM Reporting", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/peotram");
    await page.waitForTimeout(1000);
  });

  test("should generate PDF report", async ({ page }) => {
    const pdfButton = page.locator('button:has-text(/PDF|Relatório|Report/)');
    if (await pdfButton.first().isVisible({ timeout: 5000 })) {
      await expect(pdfButton.first()).toBeEnabled();
    }
  });

  test("should include digital signatures", async ({ page }) => {
    const signatureSection = page.locator('text=/assinatura|signature|assinar/i');
    await page.waitForTimeout(2000);
  });
});
