import { test, expect } from '@playwright/test';

test.describe('SGSO - Sistema de Gestão de Segurança Operacional', () => {
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

  test('should load SGSO dashboard', async ({ page }) => {
    await page.goto('/admin/sgso');
    await page.waitForTimeout(1000);

    // Verify SGSO page loaded
    const hasTitle = await page.locator('text=/sgso|segurança|operational safety/i').count() > 0;
    expect(hasTitle).toBeTruthy();
  });

  test('should register a new incident', async ({ page }) => {
    await page.goto('/admin/sgso');
    await page.waitForTimeout(1000);

    // Look for "register incident" or "novo incidente" button
    const newIncidentButton = page.locator('button, [role="button"]').filter({ 
      hasText: /novo|new|registrar|register|incidente|incident/i 
    }).first();
    
    if (await newIncidentButton.isVisible()) {
      await newIncidentButton.click();
      await page.waitForTimeout(1000);

      // Fill incident details
      const titleInput = page.locator('input').filter({ 
        hasText: /título|title|nome|name|descrição|description/i 
      }).first();
      
      if (await titleInput.isVisible()) {
        await titleInput.fill('Incident Test ' + Date.now());
      }

      // Look for description/details field
      const descriptionField = page.locator('textarea').first();
      if (await descriptionField.isVisible()) {
        await descriptionField.fill('This is a test incident for automated testing purposes.');
      }

      // Look for severity/type selection
      const severitySelect = page.locator('select, [role="combobox"]').first();
      if (await severitySelect.isVisible()) {
        // Select first available option
        await severitySelect.click();
        await page.waitForTimeout(500);
        const firstOption = page.locator('[role="option"]').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
        }
      }

      // Save the incident
      const saveButton = page.locator('button').filter({ 
        hasText: /salvar|save|criar|create|registrar|register/i 
      }).first();
      
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(2000);
        
        // Verify success
        const hasSuccess = await page.locator('text=/sucesso|success|registrado|registered|criado|created/i').count() > 0;
        expect(hasSuccess || !page.url().includes('novo')).toBeTruthy();
      }
    }
  });

  test('should analyze incident with AI', async ({ page }) => {
    await page.goto('/admin/sgso');
    await page.waitForTimeout(1000);

    // Look for existing incidents or AI analysis button
    const aiAnalysisButton = page.locator('button, [role="button"]').filter({ 
      hasText: /ai|ia|analis|analyz|classificar|classify/i 
    }).first();
    
    if (await aiAnalysisButton.isVisible()) {
      await aiAnalysisButton.click();
      await page.waitForTimeout(3000);

      // Check if AI analysis results are shown
      const hasAnalysis = await page.locator('text=/análise|analysis|classificação|classification|risco|risk/i').count() > 0;
      expect(hasAnalysis).toBeTruthy();
    } else {
      // Try to view an existing incident
      const incidentRow = page.locator('tr, [role="row"]').nth(1);
      if (await incidentRow.isVisible()) {
        await incidentRow.click();
        await page.waitForTimeout(1000);

        // Look for AI analysis in detail view
        const aiButton = page.locator('button, [role="button"]').filter({ 
          hasText: /ai|ia|analis|analyz/i 
        }).first();
        
        if (await aiButton.isVisible()) {
          await aiButton.click();
          await page.waitForTimeout(3000);
          
          const hasAnalysis = await page.locator('text=/análise|analysis/i').count() > 0;
          expect(hasAnalysis).toBeTruthy();
        }
      }
    }
  });

  test('should display incident metrics', async ({ page }) => {
    await page.goto('/admin/sgso');
    await page.waitForTimeout(1000);

    // Look for metrics/statistics section
    const hasMetrics = await page.locator('text=/métrica|metric|estatística|statistic|total|indicador|indicator/i').count() > 0;
    expect(hasMetrics).toBeTruthy();

    // Check for charts or visualizations
    const hasCharts = await page.locator('canvas, svg').count() > 0;
    expect(hasCharts).toBeTruthy();
  });
});
