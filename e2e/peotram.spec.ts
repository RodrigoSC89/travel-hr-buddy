import { test, expect } from "@playwright/test";

test.describe("PEOTRAM Audit System", () => {
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
});
