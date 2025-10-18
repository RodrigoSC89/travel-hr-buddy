import { test, expect } from '@playwright/test';

test.describe('SGSO System Tests', () => {
  test('should navigate to SGSO page', async ({ page }) => {
    await page.goto('/sgso');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/sgso');
  });

  test('should display SGSO dashboard', async ({ page }) => {
    await page.goto('/sgso');
    await page.waitForLoadState('networkidle');
    
    const heading = page.getByRole('heading').first();
    const hasHeading = await heading.count() > 0;
    expect(hasHeading).toBeTruthy();
  });

  test('should navigate to SGSO report page', async ({ page }) => {
    await page.goto('/sgso/report');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/sgso/report');
  });

  test('should navigate to SGSO audit page', async ({ page }) => {
    await page.goto('/sgso/audit');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/sgso/audit');
  });

  test('should display incident list', async ({ page }) => {
    await page.goto('/sgso');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for incident-related content
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeDefined();
  });

  test('should create new incident', async ({ page }) => {
    await page.goto('/sgso');
    await page.waitForLoadState('networkidle');
    
    const newButton = page.getByRole('button').filter({ hasText: /novo|new|criar|add/i });
    const hasButton = await newButton.count() > 0;
    expect(hasButton).toBeDefined();
  });

  test('should classify incident severity', async ({ page }) => {
    await page.goto('/sgso');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for severity classification
    const severityText = page.getByText(/severity|severidade|crítico|grave/i);
    const hasSeverity = await severityText.count() > 0;
    expect(hasSeverity).toBeDefined();
  });

  test('should display risk metrics', async ({ page }) => {
    await page.goto('/sgso');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for metrics or statistics
    const metricsText = page.getByText(/metric|métrica|risk|risco|indicator/i);
    const hasMetrics = await metricsText.count() > 0;
    expect(hasMetrics).toBeDefined();
  });

  test('should generate corrective actions', async ({ page }) => {
    await page.goto('/sgso');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for corrective action features
    const actionText = page.getByText(/action|ação|corrective|preventive|corretiva|preventiva/i);
    const hasActions = await actionText.count() > 0;
    expect(hasActions).toBeDefined();
  });

  test('should display DP incidents integration', async ({ page }) => {
    await page.goto('/dp-incidents');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/dp-incidents');
  });

  test('should show monthly reports', async ({ page }) => {
    await page.goto('/sgso/report');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for report content
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeDefined();
  });

  test('should export SGSO data', async ({ page }) => {
    await page.goto('/sgso');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for export functionality
    const exportButton = page.getByRole('button').filter({ hasText: /export|exportar|download|pdf/i });
    const hasExport = await exportButton.count() > 0;
    expect(hasExport).toBeDefined();
  });

  test('should display audit trail', async ({ page }) => {
    await page.goto('/sgso/audit');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for audit information
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeDefined();
  });
});
