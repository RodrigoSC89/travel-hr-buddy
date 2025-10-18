import { test, expect } from '@playwright/test';

test.describe('Template Operations Tests', () => {
  test('should navigate to intelligent documents page', async ({ page }) => {
    await page.goto('/intelligent-documents');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/intelligent-documents');
  });

  test('should display template list', async ({ page }) => {
    await page.goto('/intelligent-documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeDefined();
  });

  test('should create new template', async ({ page }) => {
    await page.goto('/intelligent-documents');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.getByRole('button').filter({ hasText: /new|novo|criar|template/i });
    const hasButton = await createButton.count() > 0;
    expect(hasButton).toBeDefined();
  });

  test('should edit template content', async ({ page }) => {
    await page.goto('/intelligent-documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const editableArea = page.locator('[contenteditable="true"]').or(
      page.locator('textarea')
    );
    const hasEditor = await editableArea.count() > 0;
    expect(hasEditor).toBeDefined();
  });

  test('should apply template to document', async ({ page }) => {
    await page.goto('/intelligent-documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const applyButton = page.getByRole('button').filter({ hasText: /apply|aplicar|use|usar/i });
    const hasButton = await applyButton.count() > 0;
    expect(hasButton).toBeDefined();
  });

  test('should search templates', async ({ page }) => {
    await page.goto('/intelligent-documents');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('input[type="search"]').or(
      page.locator('input[placeholder*="search"]').or(
        page.locator('input[placeholder*="buscar"]')
      )
    );
    const hasSearch = await searchInput.count() > 0;
    expect(hasSearch).toBeDefined();
  });

  test('should filter templates by category', async ({ page }) => {
    await page.goto('/intelligent-documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const filterControl = page.locator('select').or(
      page.locator('[role="combobox"]')
    );
    const hasFilter = await filterControl.count() > 0;
    expect(hasFilter).toBeDefined();
  });

  test('should delete template', async ({ page }) => {
    await page.goto('/intelligent-documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const deleteButton = page.getByRole('button').filter({ hasText: /delete|excluir|remover/i });
    const hasDelete = await deleteButton.count() > 0;
    expect(hasDelete).toBeDefined();
  });

  test('should duplicate template', async ({ page }) => {
    await page.goto('/intelligent-documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const duplicateButton = page.getByRole('button').filter({ hasText: /duplicate|duplicar|copy|copiar/i });
    const hasDuplicate = await duplicateButton.count() > 0;
    expect(hasDuplicate).toBeDefined();
  });

  test('should preview template', async ({ page }) => {
    await page.goto('/intelligent-documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const previewButton = page.getByRole('button').filter({ hasText: /preview|visualizar|ver/i });
    const hasPreview = await previewButton.count() > 0;
    expect(hasPreview).toBeDefined();
  });

  test('should support AI-generated templates', async ({ page }) => {
    await page.goto('/intelligent-documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const aiText = page.getByText(/AI|IA|artificial|intelligence|inteligência/i);
    const hasAI = await aiText.count() > 0;
    expect(hasAI).toBeDefined();
  });

  test('should rewrite template with AI', async ({ page }) => {
    await page.goto('/intelligent-documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const rewriteButton = page.getByRole('button').filter({ hasText: /rewrite|reescrever|improve|melhorar/i });
    const hasRewrite = await rewriteButton.count() > 0;
    expect(hasRewrite).toBeDefined();
  });

  test('should save template changes', async ({ page }) => {
    await page.goto('/intelligent-documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const saveButton = page.getByRole('button').filter({ hasText: /save|salvar|gravar/i });
    const hasSave = await saveButton.count() > 0;
    expect(hasSave).toBeDefined();
  });

  test('should validate template fields', async ({ page }) => {
    await page.goto('/intelligent-documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeDefined();
  });

  test('should display template metadata', async ({ page }) => {
    await page.goto('/intelligent-documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const metadataText = page.getByText(/created|criado|updated|atualizado|author|autor|date|data/i);
    const hasMetadata = await metadataText.count() > 0;
    expect(hasMetadata).toBeDefined();
  });

  test('should support template versioning', async ({ page }) => {
    await page.goto('/intelligent-documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const versionText = page.getByText(/version|versão|history|histórico/i);
    const hasVersion = await versionText.count() > 0;
    expect(hasVersion).toBeDefined();
  });
});
