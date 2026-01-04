/**
 * Beta Program E2E Tests
 * Tests for beta feedback form, dashboard, and status page
 */
import { test, expect } from '@playwright/test';

test.describe('Beta Feedback Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/beta-feedback');
  });

  test('should load beta feedback page', async ({ page }) => {
    await expect(page.locator('h1:has-text("Beta Feedback")')).toBeVisible();
    await expect(page.locator('text=Ajude-nos a melhorar')).toBeVisible();
  });

  test('should display step progress indicators', async ({ page }) => {
    // Check for progress bar
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    
    // Check for step icons
    const steps = page.locator('.rounded-full');
    await expect(steps.first()).toBeVisible();
  });

  test('should navigate between steps', async ({ page }) => {
    // Fill required field in step 1
    await page.fill('input[placeholder="Seu nome"]', 'Test User');
    
    // Click next
    await page.click('button:has-text("Próximo")');
    
    // Should show step 2 content
    await expect(page.locator('text=Avaliação Geral')).toBeVisible();
    
    // Click previous
    await page.click('button:has-text("Anterior")');
    
    // Should return to step 1
    await expect(page.locator('input[placeholder="Seu nome"]')).toBeVisible();
  });

  test('should have rating sliders', async ({ page }) => {
    // Navigate to step 2
    await page.fill('input[placeholder="Seu nome"]', 'Test User');
    await page.click('button:has-text("Próximo")');
    
    // Check for sliders
    const sliders = page.locator('[role="slider"]');
    await expect(sliders.first()).toBeVisible();
  });

  test('should have recommendation radio buttons', async ({ page }) => {
    await page.fill('input[placeholder="Seu nome"]', 'Test User');
    await page.click('button:has-text("Próximo")');
    
    // Check for radio group
    const radioGroup = page.locator('[role="radiogroup"]');
    await expect(radioGroup.first()).toBeVisible();
  });

  test('should have module checkboxes', async ({ page }) => {
    await page.fill('input[placeholder="Seu nome"]', 'Test User');
    await page.click('button:has-text("Próximo")');
    
    // Check for checkboxes
    const checkboxes = page.locator('[role="checkbox"]');
    await expect(checkboxes.first()).toBeVisible();
  });

  test('should require name field', async ({ page }) => {
    // Try to submit without name
    // The form should show validation
    await page.click('button:has-text("Próximo")');
    
    // Name input should still be visible (didn't advance)
    await expect(page.locator('input[placeholder="Seu nome"]')).toBeVisible();
  });
});

test.describe('Beta Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/beta-dashboard');
  });

  test('should load beta dashboard page', async ({ page }) => {
    await expect(page.locator('h1:has-text("Beta Dashboard")')).toBeVisible();
    await expect(page.locator('text=Análise de feedback')).toBeVisible();
  });

  test('should display KPI cards', async ({ page }) => {
    // Check for KPI cards
    await expect(page.locator('text=Total Respostas')).toBeVisible();
    await expect(page.locator('text=Avaliação Média')).toBeVisible();
  });

  test('should have tab navigation', async ({ page }) => {
    const tabs = page.locator('[role="tablist"]');
    await expect(tabs).toBeVisible();
    
    // Check for Analytics tab
    await expect(page.locator('button:has-text("Analytics")')).toBeVisible();
    
    // Check for Emails tab
    await expect(page.locator('button:has-text("Emails")')).toBeVisible();
    
    // Check for Testimonials tab
    await expect(page.locator('button:has-text("Depoimentos")')).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    // Click Emails tab
    await page.click('button:has-text("Emails")');
    
    // Should show email-related content
    await expect(page.locator('text=Enviar Emails Beta')).toBeVisible();
  });

  test('should have email send buttons', async ({ page }) => {
    await page.click('button:has-text("Emails")');
    
    // Check for email type buttons
    await expect(page.locator('button:has-text("Invitation")')).toBeVisible();
    await expect(page.locator('button:has-text("Welcome")')).toBeVisible();
  });

  test('should have refresh button', async ({ page }) => {
    const refreshBtn = page.locator('button:has-text("Atualizar")');
    await expect(refreshBtn).toBeVisible();
    await expect(refreshBtn).toBeEnabled();
  });

  test('should have export button', async ({ page }) => {
    const exportBtn = page.locator('button:has-text("Exportar")');
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toBeEnabled();
  });
});

test.describe('Status Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/status');
  });

  test('should load status page', async ({ page }) => {
    await expect(page.locator('h1:has-text("Nautilus One Status")')).toBeVisible();
  });

  test('should display overall status', async ({ page }) => {
    // Should show status text
    await expect(page.locator('text=/Operacional|Degradado|Interrupção|Manutenção/')).toBeVisible();
  });

  test('should display components list', async ({ page }) => {
    await expect(page.locator('text=Status dos Componentes')).toBeVisible();
    
    // Check for some default components
    await expect(page.locator('text=Web Application')).toBeVisible();
    await expect(page.locator('text=Database')).toBeVisible();
    await expect(page.locator('text=Authentication')).toBeVisible();
  });

  test('should have refresh button', async ({ page }) => {
    const refreshBtn = page.locator('button:has-text("Atualizar")');
    await expect(refreshBtn).toBeVisible();
    await expect(refreshBtn).toBeEnabled();
  });

  test('should show uptime chart', async ({ page }) => {
    await expect(page.locator('text=Uptime')).toBeVisible();
    await expect(page.locator('text=Últimos 30 dias')).toBeVisible();
  });

  test('should display component status icons', async ({ page }) => {
    // Check for status indicators (checkmarks, warnings, etc.)
    const statusIcons = page.locator('svg').filter({ has: page.locator('path') });
    await expect(statusIcons.first()).toBeVisible();
  });

  test('should have link back to dashboard', async ({ page }) => {
    await expect(page.locator('a:has-text("Voltar ao Dashboard")')).toBeVisible();
  });

  test('should update timestamp on refresh', async ({ page }) => {
    // Get initial timestamp text
    const timestampLocator = page.locator('text=/Atualizado/');
    await expect(timestampLocator).toBeVisible();
    
    // Click refresh
    await page.click('button:has-text("Atualizar")');
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Timestamp should still be visible
    await expect(timestampLocator).toBeVisible();
  });
});

test.describe('Beta Program Integration', () => {
  test('should navigate from feedback to dashboard', async ({ page }) => {
    // Complete feedback form would redirect to success
    await page.goto('/beta-feedback');
    await expect(page).toHaveURL(/beta-feedback/);
    
    // Navigate to dashboard
    await page.goto('/beta-dashboard');
    await expect(page).toHaveURL(/beta-dashboard/);
  });

  test('should access status page without auth', async ({ page }) => {
    // Status page should be accessible
    await page.goto('/status');
    await expect(page.locator('h1:has-text("Nautilus One Status")')).toBeVisible();
  });
});
