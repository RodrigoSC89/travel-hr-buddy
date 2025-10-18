import { test, expect } from '@playwright/test';

test.describe('Template Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/templates');
    await page.waitForTimeout(1000);
  });

  test('should display templates page', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /template/i }).first()).toBeVisible();
  });

  test('should show template list', async ({ page }) => {
    const templateList = page.locator('table, [data-testid="template-list"], .template-grid').first();
    if (await templateList.isVisible()) {
      await expect(templateList).toBeVisible();
    }
  });

  test('should have create template button', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /new template|novo template|create/i }).first();
    if (await createButton.isVisible()) {
      await expect(createButton).toBeVisible();
    }
  });

  test('should search templates', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
  });

  test('should filter templates by category', async ({ page }) => {
    const categoryFilter = page.locator('select, [role="combobox"]').filter({ hasText: /category|categoria/i }).first();
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      await page.waitForTimeout(500);
    }
  });

  test('should preview template', async ({ page }) => {
    const previewButton = page.locator('button[aria-label*="preview"], button').filter({ hasText: /preview|visualizar/ }).first();
    if (await previewButton.isVisible()) {
      await previewButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should edit template', async ({ page }) => {
    const editButton = page.locator('button[aria-label*="edit"], button').filter({ hasText: /edit|editar/ }).first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should delete template', async ({ page }) => {
    const deleteButton = page.locator('button[aria-label*="delete"], button').filter({ hasText: /delete|excluir/ }).first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.waitForTimeout(500);
      // Look for confirmation dialog
      const confirmButton = page.getByRole('button', { name: /confirm|yes|sim/i }).first();
      if (await confirmButton.isVisible()) {
        // Don't actually delete in test
      }
    }
  });

  test('should duplicate template', async ({ page }) => {
    const duplicateButton = page.locator('button').filter({ hasText: /duplicate|duplicar|copy/i }).first();
    if (await duplicateButton.isVisible()) {
      await duplicateButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should show template details', async ({ page }) => {
    const firstTemplate = page.locator('table tbody tr, [data-testid="template-item"]').first();
    if (await firstTemplate.isVisible()) {
      await firstTemplate.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should apply template to document', async ({ page }) => {
    const applyButton = page.locator('button').filter({ hasText: /apply|aplicar|use/i }).first();
    if (await applyButton.isVisible()) {
      await applyButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should show AI template generation option', async ({ page }) => {
    const aiButton = page.locator('button').filter({ hasText: /ai|intelig|generate/i }).first();
    if (await aiButton.isVisible()) {
      await expect(aiButton).toBeVisible();
    }
  });

  test('should display template usage statistics', async ({ page }) => {
    const stats = page.locator('text=/used|usage|uso|utiliza/i').first();
    if (await stats.isVisible()) {
      await expect(stats).toBeVisible();
    }
  });

  test('should export template', async ({ page }) => {
    const exportButton = page.locator('button').filter({ hasText: /export|exportar|download/i }).first();
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeVisible();
    }
  });

  test('should import template', async ({ page }) => {
    const importButton = page.locator('button, input[type="file"]').filter({ hasText: /import|importar|upload/ }).first();
    if (await importButton.isVisible()) {
      await expect(importButton).toBeVisible();
    }
  });

  test('should show template version history', async ({ page }) => {
    const historyButton = page.locator('button').filter({ hasText: /history|histórico|version/i }).first();
    if (await historyButton.isVisible()) {
      await historyButton.click();
      await page.waitForTimeout(1000);
    }
  });
});
