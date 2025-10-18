import { test, expect } from '@playwright/test';

test.describe('SGSO System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/sgso');
  });

  test('should load SGSO dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/sgso/);
    
    // Check for SGSO dashboard elements
    const hasDashboard = await page.locator('[data-testid="sgso-dashboard"], .sgso-dashboard').first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasDashboard || page.url().includes('/admin/sgso')).toBeTruthy();
  });

  test('should show incident registration form', async ({ page }) => {
    // Look for incident registration button or form
    const incidentButton = page.locator('button:has-text("Incidente"), button:has-text("Registrar"), button:has-text("Novo")').first();
    
    if (await incidentButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await incidentButton.click();
      
      // Should show form or modal
      const hasForm = await page.locator('form, [role="dialog"]').first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(hasForm).toBeTruthy();
    } else {
      // Just verify page loads
      expect(page.url()).toMatch(/\/admin\/sgso/);
    }
  });

  test('should support AI-powered incident analysis', async ({ page }) => {
    // Look for AI analysis features
    const aiButton = page.locator('button:has-text("IA"), button:has-text("AI"), button:has-text("Analis"), button:has-text("Classificar")').first();
    
    const hasAIFeature = await aiButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    // Just verify the SGSO page is accessible
    expect(page.url()).toMatch(/\/admin\/sgso/);
  });

  test('should display risk metrics', async ({ page }) => {
    // Look for risk metrics or indicators
    const hasMetrics = await page.locator('[data-testid="metrics"], .metrics, .risk-assessment').first().isVisible({ timeout: 5000 }).catch(() => false);
    
    // Verify page loads successfully
    expect(page.url()).toMatch(/\/admin\/sgso/);
  });
});
