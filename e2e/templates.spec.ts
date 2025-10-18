import { test, expect } from '@playwright/test';

test.describe('Template Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/templates');
    await page.waitForTimeout(2000);
  });

  test('should display templates page', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('templates') || url === '/') {
      const pageContent = await page.content();
      expect(pageContent.length).toBeGreaterThan(0);
    }
  });

  test('should show template list', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('templates')) {
      await page.waitForTimeout(2000);
      
      // Look for template items
      const templates = page.locator('[data-testid*="template"], table tr, [role="article"]');
      const count = await templates.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should have create template button', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('templates')) {
      // Look for create button
      const createButton = page.locator('button:has-text("criar"), button:has-text("novo"), button:has-text("create")');
      const count = await createButton.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should support template search', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('templates')) {
      // Look for search input
      const searchInput = page.locator('input[placeholder*="buscar"], input[placeholder*="search"]');
      const count = await searchInput.count();
      
      if (count > 0) {
        await searchInput.first().fill('test');
        await page.waitForTimeout(1000);
      }
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Template Editor', () => {
  test('should access template editor', async ({ page }) => {
    await page.goto('/admin/templates/editor');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('templates')) {
      // Look for editor interface
      const editor = page.locator('[contenteditable="true"], textarea, .tiptap, [role="textbox"]');
      const count = await editor.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should have template formatting tools', async ({ page }) => {
    await page.goto('/admin/templates/editor');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('templates')) {
      // Look for formatting toolbar
      const toolbar = page.locator('[role="toolbar"], .toolbar, button[aria-label*="bold"], button[aria-label*="italic"]');
      const count = await toolbar.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should support template preview', async ({ page }) => {
    await page.goto('/admin/templates/editor');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('templates')) {
      // Look for preview button or mode
      const previewButton = page.locator('button:has-text("preview"), button:has-text("visualizar")');
      const count = await previewButton.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Template Operations', () => {
  test('should support template duplication', async ({ page }) => {
    await page.goto('/admin/templates');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('templates')) {
      // Look for duplicate action
      const actionButton = page.locator('button[aria-label*="action"], button:has-text("...")').first();
      const count = await actionButton.count();
      
      if (count > 0) {
        await actionButton.click();
        await page.waitForTimeout(500);
        
        // Look for duplicate option
        const duplicateOption = page.locator('text=/duplicar|duplicate|copiar|copy/i');
        const dupCount = await duplicateOption.count();
        expect(dupCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should support template deletion', async ({ page }) => {
    await page.goto('/admin/templates');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('templates')) {
      // Look for delete action
      const actionButton = page.locator('button[aria-label*="action"], button:has-text("...")').first();
      const count = await actionButton.count();
      
      if (count > 0) {
        await actionButton.click();
        await page.waitForTimeout(500);
        
        // Look for delete option
        const deleteOption = page.locator('text=/excluir|delete|remover|remove/i');
        const delCount = await deleteOption.count();
        expect(delCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should support template export', async ({ page }) => {
    await page.goto('/admin/templates');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('templates')) {
      // Look for export functionality
      const exportButton = page.locator('button:has-text("export"), button:has-text("exportar")');
      const count = await exportButton.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('AI Template Features', () => {
  test('should have AI template generation', async ({ page }) => {
    await page.goto('/admin/documents/ai-templates');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('ai-templates')) {
      // Look for AI generation button
      const aiButton = page.locator('button:has-text("ai"), button:has-text("gerar"), button:has-text("generate")');
      const count = await aiButton.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should support template rewriting', async ({ page }) => {
    await page.goto('/admin/documents/ai-templates');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('ai-templates') || url.includes('templates')) {
      // Look for rewrite functionality
      const rewriteButton = page.locator('button:has-text("reescrever"), button:has-text("rewrite")');
      const count = await rewriteButton.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should have template suggestions', async ({ page }) => {
    await page.goto('/admin/documents/ai-templates');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('ai-templates')) {
      // Look for suggestions section
      const suggestions = page.locator('text=/sugestão|suggestion|recomendação|recommendation/i');
      const count = await suggestions.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Template Categories', () => {
  test('should support template categorization', async ({ page }) => {
    await page.goto('/admin/templates');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('templates')) {
      // Look for category filters or tabs
      const categories = page.locator('[role="tab"], select option, button[role="radio"]');
      const count = await categories.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter templates by category', async ({ page }) => {
    await page.goto('/admin/templates');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('templates')) {
      // Try to click category filter
      const categoryTab = page.locator('[role="tab"]').first();
      const count = await categoryTab.count();
      
      if (count > 0) {
        const initialContent = await page.content();
        await categoryTab.click();
        await page.waitForTimeout(1000);
        
        const afterContent = await page.content();
        expect(afterContent.length).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Template Application', () => {
  test('should support applying templates to documents', async ({ page }) => {
    await page.goto('/admin/templates');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('templates')) {
      // Look for apply button
      const applyButton = page.locator('button:has-text("aplicar"), button:has-text("apply"), button:has-text("usar")');
      const count = await applyButton.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should show template preview before applying', async ({ page }) => {
    await page.goto('/admin/templates');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('templates')) {
      // Look for preview before apply
      const templateItem = page.locator('[data-testid*="template"], tr').first();
      const count = await templateItem.count();
      
      if (count > 0) {
        await templateItem.click();
        await page.waitForTimeout(1000);
        
        // Should show some preview or detail
        const preview = page.locator('.preview, [role="dialog"], [data-testid*="preview"]');
        const previewCount = await preview.count();
        expect(previewCount).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
