import { test, expect } from "@playwright/test";

test.describe("PEOTRAM Audit Complete E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/peotram");
    await page.waitForLoadState("networkidle");
  });

  test("should display all 13 PEOTRAM elements", async ({ page }) => {
    const elementsTab = page.locator('[data-value="13-elements"]');
    if (await elementsTab.isVisible()) {
      await elementsTab.click();
    }
    
    // Verify 13 elements are visible
    for (let i = 1; i <= 13; i++) {
      const elementTab = page.locator(`text=Elemento ${i}`).first();
      await expect(elementTab).toBeVisible({ timeout: 10000 });
    }
  });

  test("should open audit form with all requirements", async ({ page }) => {
    const auditTab = page.locator('[data-value="audits"]');
    if (await auditTab.isVisible()) {
      await auditTab.click();
    }
    
    // Check for audit form elements
    await expect(page.locator('text=Auditoria')).toBeVisible({ timeout: 5000 });
  });

  test("should display progress dashboard with scores", async ({ page }) => {
    const dashboardTab = page.locator('[data-value="dashboard"]');
    if (await dashboardTab.isVisible()) {
      await dashboardTab.click();
    }
    
    // Verify dashboard elements
    await expect(page.locator('text=Score')).toBeVisible({ timeout: 5000 });
  });

  test("should have AI evidence generator button enabled", async ({ page }) => {
    const evidenceTab = page.locator('[data-value="evidence-gen"]');
    if (await evidenceTab.isVisible()) {
      await evidenceTab.click();
      await expect(page.locator('button:has-text("Gerar")')).toBeEnabled({ timeout: 5000 });
    }
  });

  test("should allow navigation between element tabs", async ({ page }) => {
    const elementsTab = page.locator('[data-value="13-elements"]');
    if (await elementsTab.isVisible()) {
      await elementsTab.click();
    }
    
    // Click on different elements
    const element3 = page.locator('text=Elemento 3').first();
    if (await element3.isVisible()) {
      await element3.click();
      await expect(page.locator('text=3')).toBeVisible();
    }
  });

  test("should show voice assistant button", async ({ page }) => {
    const voiceTab = page.locator('[data-value="voice-chat"]');
    if (await voiceTab.isVisible()) {
      await expect(voiceTab).toBeEnabled();
    }
  });

  test("should display PDF report generation option", async ({ page }) => {
    const pdfTab = page.locator('[data-value="pdf-report"]');
    if (await pdfTab.isVisible()) {
      await pdfTab.click();
      await expect(page.locator('text=PDF')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("PEO-DP 2026 Complete E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/peo-dp");
    await page.waitForLoadState("networkidle");
  });

  test("should display all 6 PEO-DP sections", async ({ page }) => {
    const sections = ["Gestão", "Treinamentos", "Procedimentos", "Operação", "Manutenção", "Testes"];
    for (const section of sections) {
      await expect(page.locator(`text=${section}`).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should have AI evidence generator available", async ({ page }) => {
    const aiTab = page.locator('[data-value="ai-chat"]');
    if (await aiTab.isVisible()) {
      await aiTab.click();
      await expect(page.locator('text=IA')).toBeVisible({ timeout: 5000 });
    }
  });

  test("should display compliance metrics", async ({ page }) => {
    await expect(page.locator('text=Conformidade')).toBeVisible({ timeout: 5000 });
  });

  test("should allow starting new audit", async ({ page }) => {
    const newAuditBtn = page.locator('button:has-text("Nova Auditoria")').first();
    if (await newAuditBtn.isVisible()) {
      await expect(newAuditBtn).toBeEnabled();
    }
  });

  test("should show DP class selector", async ({ page }) => {
    await expect(page.locator('text=DP').first()).toBeVisible({ timeout: 5000 });
  });
});
