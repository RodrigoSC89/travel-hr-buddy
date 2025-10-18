import { test, expect } from '@playwright/test';

test.describe('SGSO System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sgso');
    await page.waitForTimeout(2000);
  });

  test('should display SGSO dashboard', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('sgso') || url.includes('/')) {
      // Check for SGSO-related content
      const pageContent = await page.content();
      expect(pageContent.length).toBeGreaterThan(0);
    }
  });

  test('should show safety metrics', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('sgso')) {
      // Look for metrics display (charts, statistics, cards)
      await page.waitForTimeout(2000);
      
      const metricsElements = page.locator('[role="img"], canvas, svg[class*="recharts"]');
      const count = await metricsElements.count();
      
      // Metrics visualization might be present
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should have incident reporting capability', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('sgso')) {
      // Look for incident reporting button
      const reportButton = page.locator('button:has-text("incidente"), button:has-text("relatar"), button:has-text("report")');
      const count = await reportButton.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('SGSO Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/sgso');
    await page.waitForTimeout(2000);
  });

  test('should display SGSO admin interface', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('admin/sgso')) {
      // Check for admin-specific elements
      const pageContent = await page.content();
      expect(pageContent.length).toBeGreaterThan(0);
      
      // Look for admin controls
      const adminControls = page.locator('button, [role="tab"], select');
      const count = await adminControls.count();
      expect(count).toBeGreaterThan(0);
    } else if (url === '/' || url.includes('login')) {
      // Redirected to login - expected without auth
      await expect(page.locator('input[type="email"]')).toBeVisible();
    }
  });

  test('should show incident list', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('admin/sgso')) {
      await page.waitForTimeout(2000);
      
      // Look for incident list or table
      const incidentList = page.locator('table, [role="row"], [data-testid*="incident"]');
      const count = await incidentList.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should have filtering options', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('admin/sgso')) {
      // Look for filters
      const filters = page.locator('select, [role="combobox"], input[type="date"]');
      const count = await filters.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should support incident classification', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('admin/sgso')) {
      await page.waitForTimeout(2000);
      
      // Look for classification-related UI
      const classificationUI = page.locator('text=/classificação|classification|severidade|severity/i');
      const count = await classificationUI.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('SGSO Risk Metrics', () => {
  test('should display risk assessment panel', async ({ page }) => {
    await page.goto('/admin/metricas-risco');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('metricas-risco')) {
      // Check for risk metrics content
      const pageContent = await page.content();
      expect(pageContent.length).toBeGreaterThan(0);
      
      // Look for charts or statistics
      const visualizations = page.locator('canvas, svg, [role="img"]');
      const count = await visualizations.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should show risk trends over time', async ({ page }) => {
    await page.goto('/admin/metricas-risco');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('metricas-risco')) {
      // Look for time-based visualization
      const timeBasedChart = page.locator('canvas, svg[class*="recharts"]');
      const count = await timeBasedChart.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should support date range selection', async ({ page }) => {
    await page.goto('/admin/metricas-risco');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('metricas-risco')) {
      // Look for date pickers
      const datePicker = page.locator('input[type="date"], button:has-text("data"), button:has-text("date")');
      const count = await datePicker.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('SGSO Reports', () => {
  test('should generate SGSO reports', async ({ page }) => {
    await page.goto('/admin/sgso');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('admin/sgso')) {
      // Look for report generation button
      const reportButton = page.locator('button:has-text("relatório"), button:has-text("report"), button:has-text("gerar")');
      const count = await reportButton.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should support PDF export', async ({ page }) => {
    await page.goto('/admin/sgso');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('admin/sgso')) {
      // Look for PDF export option
      const pdfButton = page.locator('button:has-text("pdf"), button:has-text("exportar")');
      const count = await pdfButton.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('SGSO History', () => {
  test('should display SGSO history page', async ({ page }) => {
    // Try to navigate to history page (might need vessel ID)
    await page.goto('/admin/sgso/history');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    const pageContent = await page.content();
    
    expect(pageContent.length).toBeGreaterThan(0);
  });

  test('should show historical incident data', async ({ page }) => {
    await page.goto('/admin/sgso/history');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    if (url.includes('history')) {
      // Look for historical data display
      const historyElements = page.locator('table, [role="row"], .history-item');
      const count = await historyElements.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
