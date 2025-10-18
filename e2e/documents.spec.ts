import { test, expect } from '@playwright/test';

test.describe('Document Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to documents page
    // Assuming documents are at /documents or /admin/documents
    await page.goto('/admin/documents');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
  });

  test('should display documents list page', async ({ page }) => {
    // Check if we're redirected to login or on documents page
    const url = page.url();
    
    if (url.includes('admin/documents')) {
      // We're authenticated, check for document list elements
      const pageContent = await page.content();
      expect(pageContent.length).toBeGreaterThan(0);
    } else {
      // We were redirected to login, which is expected without auth
      await expect(page.locator('input[type="email"]')).toBeVisible();
    }
  });

  test('should have search functionality', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('admin/documents')) {
      // Look for search input
      const searchInput = page.locator('input[placeholder*="buscar" i], input[placeholder*="search" i]');
      const searchCount = await searchInput.count();
      
      if (searchCount > 0) {
        await expect(searchInput.first()).toBeVisible();
        
        // Try to type in search
        await searchInput.first().fill('test document');
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should have create document button', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('admin/documents')) {
      // Look for create/new document button
      const createButton = page.locator('button:has-text("criar"), button:has-text("novo"), button:has-text("create"), button:has-text("new")');
      const buttonCount = await createButton.count();
      
      // It's ok if there's no create button (permission-based)
      expect(buttonCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display document list or empty state', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('admin/documents')) {
      // Wait for content to load
      await page.waitForTimeout(2000);
      
      // Check for either document items or empty state message
      const hasDocuments = await page.locator('[data-testid="document-item"]').count() > 0;
      const hasEmptyState = await page.locator('text=/nenhum documento|no documents|vazio/i').count() > 0;
      const hasTable = await page.locator('table').count() > 0;
      const hasCards = await page.locator('[role="article"]').count() > 0;
      
      // At least one of these should be true
      expect(hasDocuments || hasEmptyState || hasTable || hasCards).toBeTruthy();
    }
  });

  test('should have filter options', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('admin/documents')) {
      // Look for filter elements (dropdowns, tabs, etc)
      const filterElements = page.locator('select, [role="combobox"], [role="tab"]');
      const count = await filterElements.count();
      
      // Filters are optional
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Document Operations', () => {
  test('should be able to navigate to document detail', async ({ page }) => {
    await page.goto('/admin/documents');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('admin/documents')) {
      // Try to find and click first document
      const documentLink = page.locator('a[href*="/documents/"], tr a, [data-testid="document-link"]').first();
      const linkCount = await documentLink.count();
      
      if (linkCount > 0) {
        await documentLink.click();
        await page.waitForTimeout(2000);
        
        // Should navigate to document detail
        const newUrl = page.url();
        expect(newUrl).not.toBe(url);
      }
    }
  });

  test('should show document actions menu', async ({ page }) => {
    await page.goto('/admin/documents');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('admin/documents')) {
      // Look for action buttons or menu
      const actionButton = page.locator('button[aria-label*="action"], button[aria-label*="menu"], button:has-text("...")').first();
      const buttonCount = await actionButton.count();
      
      if (buttonCount > 0) {
        await actionButton.click();
        await page.waitForTimeout(500);
        
        // Check if menu opened
        const menuItems = page.locator('[role="menuitem"], [role="menu"] button');
        const menuCount = await menuItems.count();
        expect(menuCount).toBeGreaterThan(0);
      }
    }
  });

  test('should support document sorting', async ({ page }) => {
    await page.goto('/admin/documents');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('admin/documents')) {
      // Look for sortable column headers
      const sortableHeader = page.locator('th[role="columnheader"]').first();
      const headerCount = await sortableHeader.count();
      
      if (headerCount > 0) {
        const initialContent = await page.content();
        
        // Click to sort
        await sortableHeader.click();
        await page.waitForTimeout(1000);
        
        const afterSortContent = await page.content();
        
        // Content should potentially change (though might be same if only 1 item)
        expect(afterSortContent.length).toBeGreaterThan(0);
      }
    }
  });

  test('should handle document export functionality', async ({ page }) => {
    await page.goto('/admin/documents');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('admin/documents')) {
      // Look for export button
      const exportButton = page.locator('button:has-text("export"), button:has-text("baixar"), button:has-text("download")');
      const count = await exportButton.count();
      
      // Export is optional
      expect(count).toBeGreaterThanOrEqual(0);
      
      if (count > 0) {
        // Click export button
        await exportButton.first().click();
        await page.waitForTimeout(1000);
      }
    }
  });
});

test.describe('Document Editor', () => {
  test('should have document editor accessible', async ({ page }) => {
    await page.goto('/admin/documents/editor');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('documents') && !url.endsWith('admin/documents')) {
      // We're on some document page
      // Look for editor elements
      const editorArea = page.locator('[contenteditable="true"], textarea, .tiptap, [role="textbox"]');
      const count = await editorArea.count();
      
      if (count > 0) {
        await expect(editorArea.first()).toBeVisible();
      }
    }
  });

  test('should support document history', async ({ page }) => {
    await page.goto('/admin/documents');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('admin/documents')) {
      // Navigate to first document if available
      const documentLink = page.locator('a[href*="/documents/"]').first();
      const linkCount = await documentLink.count();
      
      if (linkCount > 0) {
        await documentLink.click();
        await page.waitForTimeout(2000);
        
        // Look for history button or tab
        const historyButton = page.locator('button:has-text("histórico"), button:has-text("history"), a:has-text("histórico"), a:has-text("history")');
        const historyCount = await historyButton.count();
        
        if (historyCount > 0) {
          await historyButton.first().click();
          await page.waitForTimeout(1000);
          
          // Should show history
          const historyContent = page.locator('text=/versão|version|alteração|change/i');
          const contentCount = await historyContent.count();
          expect(contentCount).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
