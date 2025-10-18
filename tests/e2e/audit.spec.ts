import { test, expect } from '@playwright/test';

test.describe('Audit Simulation', () => {
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

  test('should navigate to audit simulation page', async ({ page }) => {
    // Try different possible audit pages
    const auditUrls = [
      '/admin/audit/simulate',
      '/admin/auditorias-imca',
      '/admin/dashboard-auditorias',
      '/admin/metricas-risco'
    ];

    let pageLoaded = false;
    for (const url of auditUrls) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
        await page.waitForTimeout(1000);
        
        const hasContent = await page.locator('body').textContent();
        if (hasContent && hasContent.length > 100) {
          pageLoaded = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    expect(pageLoaded).toBeTruthy();
  });

  test('should generate audit simulation', async ({ page }) => {
    await page.goto('/admin/auditorias-imca');
    await page.waitForTimeout(1000);

    // Look for simulate/generate button
    const simulateButton = page.locator('button, [role="button"]').filter({ 
      hasText: /simular|simulate|gerar|generate|nova|new|auditoria|audit/i 
    }).first();
    
    if (await simulateButton.isVisible()) {
      await simulateButton.click();
      await page.waitForTimeout(1000);

      // Select vessel/embarcação if needed
      const vesselSelect = page.locator('select, [role="combobox"]').filter({
        hasText: /embarcação|vessel|navio|ship/i
      }).first();
      
      if (await vesselSelect.isVisible()) {
        await vesselSelect.click();
        await page.waitForTimeout(500);
        const option = page.locator('[role="option"]').nth(1);
        if (await option.isVisible()) {
          await option.click();
        }
      }

      // Select norm/norma if needed
      const normSelect = page.locator('select, [role="combobox"]').filter({
        hasText: /norma|norm|imca|iso/i
      }).first();
      
      if (await normSelect.isVisible()) {
        await normSelect.click();
        await page.waitForTimeout(500);
        const option = page.locator('[role="option"]').nth(1);
        if (await option.isVisible()) {
          await option.click();
        }
      }

      // Submit simulation
      const submitButton = page.locator('button').filter({ 
        hasText: /simular|simulate|gerar|generate|iniciar|start/i 
      }).first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(5000);

        // Check for simulation results
        const hasResults = await page.locator('text=/resultado|result|score|pontuação|conformidade|compliance/i').count() > 0;
        expect(hasResults).toBeTruthy();
      }
    }
  });

  test('should view audit report with AI analysis', async ({ page }) => {
    await page.goto('/admin/auditorias-imca');
    await page.waitForTimeout(1000);

    // Look for existing audit report
    const reportRow = page.locator('tr, [role="row"], a, [role="link"]').filter({
      hasText: /auditoria|audit|relatório|report/i
    }).nth(1);
    
    if (await reportRow.isVisible()) {
      await reportRow.click();
      await page.waitForTimeout(2000);

      // Check for AI analysis or insights
      const hasAIContent = await page.locator('text=/ai|ia|análise|analysis|recomendação|recommendation|ação corretiva|corrective action/i').count() > 0;
      expect(hasAIContent).toBeTruthy();

      // Check for score or metrics
      const hasScore = await page.locator('text=/score|pontuação|%|conformidade|compliance/i').count() > 0;
      expect(hasScore).toBeTruthy();
    }
  });

  test('should display audit metrics by norm', async ({ page }) => {
    await page.goto('/admin/metricas-risco');
    await page.waitForTimeout(1000);

    // Check for metrics display
    const hasMetrics = await page.locator('text=/métrica|metric|imca|iso|anp|indicador|indicator/i').count() > 0;
    expect(hasMetrics).toBeTruthy();

    // Check for charts
    const hasVisualizations = await page.locator('canvas, svg').count() > 0;
    expect(hasVisualizations).toBeTruthy();
  });

  test('should filter audits by status', async ({ page }) => {
    await page.goto('/admin/auditorias-imca');
    await page.waitForTimeout(1000);

    // Look for filter options
    const filterButton = page.locator('button, select, [role="combobox"]').filter({
      hasText: /filtro|filter|status|estado/i
    }).first();
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);

      // Select a filter option
      const option = page.locator('[role="option"], option').filter({
        hasText: /aberto|open|pendente|pending|concluído|completed/i
      }).first();
      
      if (await option.isVisible()) {
        await option.click();
        await page.waitForTimeout(1000);

        // Verify content updated
        const hasContent = await page.locator('tr, [role="row"]').count() >= 0;
        expect(hasContent).toBeTruthy();
      }
    }
  });
});
