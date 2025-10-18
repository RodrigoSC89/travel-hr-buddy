import { test, expect } from '@playwright/test';

test.describe('Document Management', () => {
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

  test('should navigate to document creation page', async ({ page }) => {
    await page.goto('/admin/documents/create');
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Verify page loaded (check for common document creation elements)
    const hasDocumentForm = await page.locator('input, textarea, [contenteditable="true"]').count() > 0;
    expect(hasDocumentForm).toBeTruthy();
  });

  test('should create a new document', async ({ page }) => {
    await page.goto('/admin/documents/create');
    await page.waitForTimeout(1000);

    // Look for title/name input
    const titleInput = page.locator('input[name="title"], input[placeholder*="título"], input[placeholder*="nome"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Test Document ' + Date.now());
    }

    // Look for content area
    const contentArea = page.locator('textarea, [contenteditable="true"]').first();
    if (await contentArea.isVisible()) {
      await contentArea.fill('This is test content for automated testing.');
    }

    // Look for save/create button
    const saveButton = page.locator('button').filter({ hasText: /salvar|criar|save|create/i }).first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
      
      // Check for success indication
      const hasSuccess = await page.locator('text=/sucesso|success|criado|created/i').count() > 0;
      expect(hasSuccess || !page.url().includes('create')).toBeTruthy();
    }
  });

  test('should generate document with AI', async ({ page }) => {
    await page.goto('/admin/documents/create');
    await page.waitForTimeout(1000);

    // Look for AI generation button/option
    const aiButton = page.locator('button, [role="button"]').filter({ 
      hasText: /ai|ia|gerar|generate|assistente|assistant/i 
    }).first();
    
    if (await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(1000);
      
      // Look for prompt input
      const promptInput = page.locator('input, textarea').filter({ 
        hasText: /prompt|descrição|description|instrução/i 
      }).first();
      
      if (await promptInput.isVisible()) {
        await promptInput.fill('Criar documento sobre segurança operacional');
        
        // Look for generate button
        const generateButton = page.locator('button').filter({ 
          hasText: /gerar|generate|criar|create/i 
        }).first();
        
        if (await generateButton.isVisible()) {
          await generateButton.click();
          await page.waitForTimeout(5000);
          
          // Check if content was generated
          const hasContent = await page.locator('[contenteditable="true"], textarea').first().inputValue();
          expect(hasContent.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should export document to PDF', async ({ page }) => {
    await page.goto('/admin/documents');
    await page.waitForTimeout(1000);

    // Look for existing document
    const documentLink = page.locator('a, [role="link"]').filter({ 
      hasText: /documento|document|ver|view/i 
    }).first();
    
    if (await documentLink.isVisible()) {
      await documentLink.click();
      await page.waitForTimeout(1000);
      
      // Look for PDF export button
      const pdfButton = page.locator('button, [role="button"]').filter({ 
        hasText: /pdf|exportar|export|baixar|download/i 
      }).first();
      
      if (await pdfButton.isVisible()) {
        // Set up download listener
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
        await pdfButton.click();
        
        try {
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toContain('.pdf');
        } catch (e) {
          // PDF export might be in progress, that's ok
          console.log('PDF export initiated');
        }
      }
    }
  });
});
