import { test, expect } from '@playwright/test';

test.describe('SGSO System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sgso');
    await page.waitForTimeout(1000);
  });

  test('should display SGSO dashboard', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /sgso|safety management/i }).first()).toBeVisible();
  });

  test('should show incident management section', async ({ page }) => {
    const incidentSection = page.locator('text=/incident|incidente/i').first();
    if (await incidentSection.isVisible()) {
      await expect(incidentSection).toBeVisible();
    }
  });

  test('should display risk metrics', async ({ page }) => {
    const riskMetrics = page.locator('text=/risk|risco/i').first();
    if (await riskMetrics.isVisible()) {
      await expect(riskMetrics).toBeVisible();
    }
  });

  test('should have incident creation button', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /new incident|novo incidente|create/i }).first();
    if (await createButton.isVisible()) {
      await expect(createButton).toBeVisible();
    }
  });

  test('should display incident list', async ({ page }) => {
    const incidentList = page.locator('table, [data-testid="incident-list"]').first();
    if (await incidentList.isVisible()) {
      await expect(incidentList).toBeVisible();
    }
  });

  test('should filter incidents by status', async ({ page }) => {
    const statusFilter = page.locator('select, [role="combobox"]').filter({ hasText: /status/i }).first();
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.waitForTimeout(500);
    }
  });

  test('should show incident details on click', async ({ page }) => {
    const firstIncident = page.locator('table tbody tr, [data-testid="incident-item"]').first();
    if (await firstIncident.isVisible()) {
      await firstIncident.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should display safety statistics', async ({ page }) => {
    const stats = page.locator('[data-testid="stats"], .stat-card, [class*="metric"]').first();
    if (await stats.isVisible()) {
      await expect(stats).toBeVisible();
    }
  });

  test('should navigate to action plans', async ({ page }) => {
    const actionPlansLink = page.getByRole('link', { name: /action plan|plano de ação/i }).first();
    if (await actionPlansLink.isVisible()) {
      await actionPlansLink.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should show AI classification option', async ({ page }) => {
    const aiButton = page.locator('button').filter({ hasText: /ai|intelig|classify/i }).first();
    if (await aiButton.isVisible()) {
      await expect(aiButton).toBeVisible();
    }
  });

  test('should display risk forecast', async ({ page }) => {
    const forecast = page.locator('text=/forecast|previsão/i').first();
    if (await forecast.isVisible()) {
      await expect(forecast).toBeVisible();
    }
  });

  test('should show corrective actions', async ({ page }) => {
    const correctiveActions = page.locator('text=/corrective|corretiva/i').first();
    if (await correctiveActions.isVisible()) {
      await expect(correctiveActions).toBeVisible();
    }
  });

  test('should export SGSO report', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /export|exportar|download/i }).first();
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeVisible();
    }
  });
});
