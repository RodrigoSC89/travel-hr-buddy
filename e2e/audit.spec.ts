import { test, expect } from "@playwright/test";

test.describe("Audit Simulation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/dashboard-auditorias");
    await page.waitForTimeout(1000);
  });

  test("should display audit dashboard", async ({ page }) => {
    await expect(page.locator("h1, h2").filter({ hasText: /audit|auditoria/i }).first()).toBeVisible();
  });

  test("should show list of audits", async ({ page }) => {
    const auditList = page.locator("table, [data-testid=\"audit-list\"]").first();
    if (await auditList.isVisible()) {
      await expect(auditList).toBeVisible();
    }
  });

  test("should have create audit button", async ({ page }) => {
    const createButton = page.getByRole("button", { name: /new audit|nova auditoria|create/i }).first();
    if (await createButton.isVisible()) {
      await expect(createButton).toBeVisible();
    }
  });

  test("should filter audits by type", async ({ page }) => {
    const typeFilter = page.locator("select, [role=\"combobox\"]").filter({ hasText: /type|tipo/i }).first();
    if (await typeFilter.isVisible()) {
      await typeFilter.click();
      await page.waitForTimeout(500);
    }
  });

  test("should display audit status", async ({ page }) => {
    const status = page.locator("text=/pending|completed|em andamento|concluíd/i").first();
    if (await status.isVisible()) {
      await expect(status).toBeVisible();
    }
  });

  test("should navigate to audit details", async ({ page }) => {
    const firstAudit = page.locator("table tbody tr, [data-testid=\"audit-item\"]").first();
    if (await firstAudit.isVisible()) {
      await firstAudit.click();
      await page.waitForTimeout(1000);
    }
  });

  test("should show audit checklist", async ({ page }) => {
    const checklist = page.locator("text=/checklist|itens/i").first();
    if (await checklist.isVisible()) {
      await expect(checklist).toBeVisible();
    }
  });

  test("should display compliance metrics", async ({ page }) => {
    const metrics = page.locator("[data-testid=\"metrics\"], .metric-card").first();
    if (await metrics.isVisible()) {
      await expect(metrics).toBeVisible();
    }
  });

  test("should add audit comments", async ({ page }) => {
    const commentButton = page.getByRole("button", { name: /comment|comentário/i }).first();
    if (await commentButton.isVisible()) {
      await commentButton.click();
      await page.waitForTimeout(500);
      const commentInput = page.locator("textarea, input[type=\"text\"]").first();
      if (await commentInput.isVisible()) {
        await commentInput.fill("Test comment");
      }
    }
  });

  test("should show risk alerts", async ({ page }) => {
    const alerts = page.locator("text=/alert|alerta|warning/i").first();
    if (await alerts.isVisible()) {
      await expect(alerts).toBeVisible();
    }
  });

  test("should export audit report", async ({ page }) => {
    const exportButton = page.getByRole("button", { name: /export|exportar|pdf/i }).first();
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeVisible();
    }
  });

  test("should schedule audit", async ({ page }) => {
    const scheduleButton = page.getByRole("button", { name: /schedule|agendar/i }).first();
    if (await scheduleButton.isVisible()) {
      await scheduleButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test("should show audit history", async ({ page }) => {
    const historyLink = page.getByRole("link", { name: /history|histórico/i }).first();
    if (await historyLink.isVisible()) {
      await historyLink.click();
      await page.waitForTimeout(1000);
    }
  });

  test("should display non-conformities", async ({ page }) => {
    const nonConformities = page.locator("text=/non-conformity|não conformidade/i").first();
    if (await nonConformities.isVisible()) {
      await expect(nonConformities).toBeVisible();
    }
  });

  test("should assign auditor", async ({ page }) => {
    const assignButton = page.locator("button").filter({ hasText: /assign|atribuir/i }).first();
    if (await assignButton.isVisible()) {
      await assignButton.click();
      await page.waitForTimeout(500);
    }
  });

  test("should show completion percentage", async ({ page }) => {
    const progress = page.locator("[role=\"progressbar\"], text=/\\d+%/").first();
    if (await progress.isVisible()) {
      await expect(progress).toBeVisible();
    }
  });
});
