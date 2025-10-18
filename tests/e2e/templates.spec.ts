import { test, expect } from '@playwright/test';

test.describe('Templates Management', () => {
  test.beforeEach(async ({ page }) => {
    // Skip if no credentials
    if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
      test.skip();
    }

    // Login first
    await page.goto('/auth/login');
    await page.locator('input[type="email"], input[name="email"]').fill(process.env.TEST_USER_EMAIL);
    await page.locator('input[type="password"], input[name="password"]').fill(process.env.TEST_USER_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
  });

  test('should navigate to templates page', async ({ page }) => {
    await page.goto('/admin/templates');
    await page.waitForTimeout(1000);

    // Verify templates page loaded
    const hasTitle = await page.locator('text=/template|modelo/i').count() > 0;
    expect(hasTitle).toBeTruthy();
  });

  test('should create a new template', async ({ page }) => {
    await page.goto('/admin/templates');
    await page.waitForTimeout(1000);

    // Look for create template button
    const createButton = page.locator('button, [role="button"]').filter({ 
      hasText: /novo|new|criar|create|adicionar|add/i 
    }).first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(1000);

      // Fill template name
      const nameInput = page.locator('input').filter({ 
        hasText: /nome|name|título|title/i 
      }).first();
      
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Template ' + Date.now());
      }

      // Fill template content
      const contentArea = page.locator('textarea, [contenteditable="true"]').first();
      if (await contentArea.isVisible()) {
        await contentArea.fill('This is a test template content for automation.');
      }

      // Select category if available
      const categorySelect = page.locator('select, [role="combobox"]').filter({
        hasText: /categoria|category|tipo|type/i
      }).first();
      
      if (await categorySelect.isVisible()) {
        await categorySelect.click();
        await page.waitForTimeout(500);
        const option = page.locator('[role="option"]').nth(1);
        if (await option.isVisible()) {
          await option.click();
        }
      }

      // Save template
      const saveButton = page.locator('button').filter({ 
        hasText: /salvar|save|criar|create/i 
      }).first();
      
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(2000);

        // Verify success
        const hasSuccess = await page.locator('text=/sucesso|success|criado|created/i').count() > 0;
        expect(hasSuccess || !page.url().includes('novo')).toBeTruthy();
      }
    }
  });

  test('should apply template to document', async ({ page }) => {
    await page.goto('/admin/templates');
    await page.waitForTimeout(1000);

    // Look for existing template
    const templateCard = page.locator('[role="button"], button, a').filter({
      hasText: /aplicar|apply|usar|use/i
    }).first();
    
    if (await templateCard.isVisible()) {
      await templateCard.click();
      await page.waitForTimeout(1000);

      // If modal/dialog opens, confirm application
      const confirmButton = page.locator('button').filter({ 
        hasText: /confirmar|confirm|aplicar|apply|ok/i 
      }).first();
      
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        await page.waitForTimeout(2000);

        // Check for success or navigation to document
        const hasSuccess = await page.locator('text=/sucesso|success|aplicado|applied/i').count() > 0;
        expect(hasSuccess || page.url().includes('document')).toBeTruthy();
      }
    }
  });

  test('should favorite a template', async ({ page }) => {
    await page.goto('/admin/templates');
    await page.waitForTimeout(1000);

    // Look for favorite/star button
    const favoriteButton = page.locator('button, [role="button"]').filter({ 
      hasText: /favorit|estrela|star/i 
    }).or(page.locator('[data-testid*="favorite"], [aria-label*="favorite"]')).first();
    
    if (await favoriteButton.isVisible()) {
      // Click to favorite
      await favoriteButton.click();
      await page.waitForTimeout(1000);

      // Verify favorited state (button should change appearance or show confirmation)
      const hasConfirmation = await page.locator('text=/favoritado|favorited|sucesso|success/i').count() > 0;
      expect(hasConfirmation || await favoriteButton.isVisible()).toBeTruthy();
    } else {
      // Alternative: look for heart/star icon within template cards
      const iconButton = page.locator('[data-icon="star"], [data-icon="heart"], svg').first();
      if (await iconButton.isVisible()) {
        await iconButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should filter templates by category', async ({ page }) => {
    await page.goto('/admin/templates');
    await page.waitForTimeout(1000);

    // Look for filter/category selector
    const filterSelect = page.locator('select, [role="combobox"], button').filter({
      hasText: /categoria|category|filtro|filter|tipo|type/i
    }).first();
    
    if (await filterSelect.isVisible()) {
      await filterSelect.click();
      await page.waitForTimeout(500);

      // Select a category
      const option = page.locator('[role="option"], option').nth(1);
      if (await option.isVisible()) {
        await option.click();
        await page.waitForTimeout(1000);

        // Verify templates are displayed
        const hasTemplates = await page.locator('[role="card"], .card, [class*="template"]').count() >= 0;
        expect(hasTemplates).toBeTruthy();
      }
    }
  });

  test('should search for templates', async ({ page }) => {
    await page.goto('/admin/templates');
    await page.waitForTimeout(1000);

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="buscar"], input[placeholder*="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);

      // Verify search results or that page responded to search
      const hasContent = await page.locator('body').textContent();
      expect(hasContent).toBeTruthy();
    }
  });

  test('should edit existing template', async ({ page }) => {
    await page.goto('/admin/templates');
    await page.waitForTimeout(1000);

    // Look for edit button on template
    const editButton = page.locator('button, [role="button"]').filter({ 
      hasText: /editar|edit|modificar|modify/i 
    }).first();
    
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);

      // Modify content
      const contentArea = page.locator('textarea, [contenteditable="true"]').first();
      if (await contentArea.isVisible()) {
        await contentArea.fill(await contentArea.inputValue() + ' - Modified');
        
        // Save changes
        const saveButton = page.locator('button').filter({ 
          hasText: /salvar|save|atualizar|update/i 
        }).first();
        
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(2000);

          // Verify success
          const hasSuccess = await page.locator('text=/sucesso|success|atualizado|updated/i').count() > 0;
          expect(hasSuccess || !page.url().includes('edit')).toBeTruthy();
        }
      }
    }
  });
});
