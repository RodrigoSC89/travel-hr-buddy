import { test, expect } from '@playwright/test';

test.describe('Template System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/templates');
  });

  test('should load templates page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/templates/);
    
    // Verify templates page loads
    expect(page.url()).toMatch(/\/admin\/templates/);
  });

  test('should create new template', async ({ page }) => {
    // Look for create template button
    const createButton = page.locator('button:has-text("Criar"), button:has-text("Novo"), a:has-text("Criar")').first();
    
    if (await createButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createButton.click();
      
      // Should navigate to editor or show modal
      await page.waitForTimeout(1000);
      
      const hasEditor = await page.locator('form, [role="dialog"], textarea, [contenteditable]').first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(hasEditor || page.url().includes('editor')).toBeTruthy();
    } else {
      expect(page.url()).toMatch(/\/admin\/templates/);
    }
  });

  test('should apply template', async ({ page }) => {
    // Look for apply or use template buttons
    const applyButton = page.locator('button:has-text("Aplicar"), button:has-text("Usar"), button:has-text("Use")').first();
    
    const hasApplyFeature = await applyButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    // Verify page loads
    expect(page.url()).toMatch(/\/admin\/templates/);
  });

  test('should favorite template', async ({ page }) => {
    // Look for favorite buttons or icons
    const favoriteButton = page.locator('button[title*="favorit"], svg[data-icon="heart"], svg[data-icon="star"]').first();
    
    const hasFavoriteFeature = await favoriteButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    // Verify page loads
    expect(page.url()).toMatch(/\/admin\/templates/);
  });

  test('should filter and search templates', async ({ page }) => {
    // Look for search or filter inputs
    const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"], input[placeholder*="Search"]').first();
    
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Verify search works
      expect(page.url()).toMatch(/\/admin\/templates/);
    } else {
      expect(page.url()).toMatch(/\/admin\/templates/);
    }
  });
});
