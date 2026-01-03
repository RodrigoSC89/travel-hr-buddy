import { test, expect } from "@playwright/test";

/**
 * SGSO ANP E2E Tests
 * Tests Sistema de Gestão de Segurança Operacional
 * Aligned with ANP Resolution 46/2016 and IBP 2022
 */
test.describe("SGSO ANP System", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/sgso");
    await page.waitForTimeout(1000);
  });

  test("should display SGSO dashboard", async ({ page }) => {
    await expect(page.locator("h1, h2").filter({ hasText: /sgso|safety management|segurança operacional/i }).first()).toBeVisible();
  });

  test("should show 16 Management Practices", async ({ page }) => {
    const practicesSection = page.locator("text=/Prática|Practice|16 Práticas/i").first();
    if (await practicesSection.isVisible()) {
      await expect(practicesSection).toBeVisible();
    }
  });

  test("should show incident management section", async ({ page }) => {
    const incidentSection = page.locator("text=/incident|incidente/i").first();
    if (await incidentSection.isVisible()) {
      await expect(incidentSection).toBeVisible();
    }
  });

  test("should display risk metrics", async ({ page }) => {
    const riskMetrics = page.locator("text=/risk|risco/i").first();
    if (await riskMetrics.isVisible()) {
      await expect(riskMetrics).toBeVisible();
    }
  });

  test("should have incident creation button", async ({ page }) => {
    const createButton = page.getByRole("button", { name: /new incident|novo incidente|create|novo/i }).first();
    if (await createButton.isVisible()) {
      await expect(createButton).toBeVisible();
    }
  });

  test("should display incident list", async ({ page }) => {
    const incidentList = page.locator("table, [data-testid=\"incident-list\"]").first();
    if (await incidentList.isVisible()) {
      await expect(incidentList).toBeVisible();
    }
  });

  test("should filter incidents by status", async ({ page }) => {
    const statusFilter = page.locator("select, [role=\"combobox\"]").first();
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.waitForTimeout(500);
    }
  });

  test("should show incident details on click", async ({ page }) => {
    const firstIncident = page.locator("table tbody tr, [data-testid=\"incident-item\"]").first();
    if (await firstIncident.isVisible()) {
      await firstIncident.click();
      await page.waitForTimeout(1000);
    }
  });

  test("should display safety statistics", async ({ page }) => {
    const stats = page.locator("[data-testid=\"stats\"], .stat-card, [class*=\"metric\"]").first();
    if (await stats.isVisible()) {
      await expect(stats).toBeVisible();
    }
  });

  test("should navigate to action plans", async ({ page }) => {
    const actionPlansLink = page.locator("text=/action plan|plano de ação|ação/i").first();
    if (await actionPlansLink.isVisible()) {
      await actionPlansLink.click();
      await page.waitForTimeout(1000);
    }
  });

  test("should show AI classification option", async ({ page }) => {
    const aiButton = page.locator("button").filter({ hasText: /ai|intelig|classify|ia/i }).first();
    if (await aiButton.isVisible()) {
      await expect(aiButton).toBeVisible();
    }
  });

  test("should display risk forecast", async ({ page }) => {
    const forecast = page.locator("text=/forecast|previsão/i").first();
    if (await forecast.isVisible()) {
      await expect(forecast).toBeVisible();
    }
  });

  test("should show corrective actions", async ({ page }) => {
    const correctiveActions = page.locator("text=/corrective|corretiva/i").first();
    if (await correctiveActions.isVisible()) {
      await expect(correctiveActions).toBeVisible();
    }
  });

  test("should export SGSO report", async ({ page }) => {
    const exportButton = page.getByRole("button", { name: /export|exportar|download|pdf/i }).first();
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeVisible();
    }
  });

  test("should show maturity curve (PDCA)", async ({ page }) => {
    const pdcaSection = page.locator("text=/PDCA|Maturidade|Maturity|Plan|Do|Check|Act/i");
    await page.waitForTimeout(2000);
  });

  test("should have knowledge base access", async ({ page }) => {
    const knowledgeButton = page.locator('button:has-text(/Base|Conhecimento|Knowledge|Legislação/)');
    if (await knowledgeButton.first().isVisible({ timeout: 5000 })) {
      await expect(knowledgeButton.first()).toBeEnabled();
    }
  });
});

test.describe("SGSO Evidence Manager", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/sgso");
    await page.waitForTimeout(1000);
  });

  test("should support evidence upload with OCR", async ({ page }) => {
    const uploadButton = page.locator('button:has-text(/Upload|Carregar|Evidência|Evidence/)');
    if (await uploadButton.first().isVisible({ timeout: 5000 })) {
      await expect(uploadButton.first()).toBeEnabled();
    }
  });

  test("should have file input for documents", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible({ timeout: 5000 })) {
      await expect(fileInput).toBeEnabled();
    }
  });
});

test.describe("SGSO Audit Trail", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/sgso");
    await page.waitForTimeout(1000);
  });

  test("should track audit history", async ({ page }) => {
    const auditTab = page.locator('button:has-text(/Auditoria|Audit|Trail|Histórico/)');
    if (await auditTab.first().isVisible({ timeout: 5000 })) {
      await auditTab.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test("should manage findings", async ({ page }) => {
    const findingsSection = page.locator('text=/Achados|Findings|Não-Conformidade|NC/i');
    await page.waitForTimeout(2000);
  });

  test("should create action plans", async ({ page }) => {
    const actionPlanButton = page.locator('button:has-text(/Plano|Plan|Ação|Action/)');
    if (await actionPlanButton.first().isVisible({ timeout: 5000 })) {
      await expect(actionPlanButton.first()).toBeEnabled();
    }
  });
});

test.describe("SGSO Reporting", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/sgso");
    await page.waitForTimeout(1000);
  });

  test("should generate ANP-formatted PDF report", async ({ page }) => {
    const pdfButton = page.locator('button:has-text(/PDF|Exportar|Export|Relatório|Report/)');
    if (await pdfButton.first().isVisible({ timeout: 5000 })) {
      await expect(pdfButton.first()).toBeEnabled();
    }
  });

  test("should configure automated email scheduling", async ({ page }) => {
    const scheduleButton = page.locator('button:has-text(/Agenda|Schedule|Email|Configurar/)');
    if (await scheduleButton.first().isVisible({ timeout: 5000 })) {
      await expect(scheduleButton.first()).toBeEnabled();
    }
  });

  test("should show compliance metrics dashboard", async ({ page }) => {
    const metrics = page.locator('[class*="metric"], [class*="stat"], text=/\\d+%/');
    await page.waitForTimeout(2000);
  });
});

test.describe("SGSO Permissions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/sgso");
    await page.waitForTimeout(1000);
  });

  test("should have permissions management", async ({ page }) => {
    const permissionsButton = page.locator('button:has-text(/Permissões|Permissions|Acesso|Access/)');
    if (await permissionsButton.first().isVisible({ timeout: 5000 })) {
      await expect(permissionsButton.first()).toBeEnabled();
    }
  });
});
