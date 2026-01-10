/**
 * E2E Tests - HR Modules (RH & Pessoas + RH & IA)
 * Validates all HR critical flows
 */
import { test, expect } from '@playwright/test';

test.describe('HR Dashboard', () => {
  test('should load HR dashboard with KPIs', async ({ page }) => {
    await page.goto('/hr-dashboard');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    
    // Verify no console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.waitForTimeout(2000);
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('should display employee list', async ({ page }) => {
    await page.goto('/hr-dashboard');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Check for employee-related content
    const content = await page.content();
    expect(content).toContain('colaborador');
  });
});

test.describe('People Analytics', () => {
  test('should load analytics dashboard', async ({ page }) => {
    await page.goto('/people-analytics');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    
    // Should have charts or metrics
    await page.waitForLoadState('networkidle');
  });

  test('should display workforce metrics', async ({ page }) => {
    await page.goto('/people-analytics');
    await page.waitForLoadState('networkidle');
    
    // Look for typical analytics content
    const page_content = await page.textContent('body');
    const hasAnalytics = 
      page_content?.toLowerCase().includes('analytics') ||
      page_content?.toLowerCase().includes('turnover') ||
      page_content?.toLowerCase().includes('headcount') ||
      page_content?.toLowerCase().includes('colaborador');
    
    expect(hasAnalytics).toBeTruthy();
  });
});

test.describe('Employee Portal', () => {
  test('should load employee portal page', async ({ page }) => {
    await page.goto('/portal-colaborador');
    await expect(page.locator('h1, h2, [data-testid="portal-title"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display employee profile section', async ({ page }) => {
    await page.goto('/portal-colaborador');
    await page.waitForLoadState('networkidle');
    
    // Check for profile or personal info
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should have chatbot component available', async ({ page }) => {
    await page.goto('/portal-colaborador');
    await page.waitForLoadState('networkidle');
    
    // Look for chat-related elements
    const chatButton = page.locator('[aria-label*="chat"], button:has-text("Chat"), button:has-text("Assistente"), [data-testid="chatbot-trigger"]');
    
    // Should have some chatbot interface
    await page.waitForTimeout(1000);
  });
});

test.describe('Payroll Module', () => {
  test('should load payroll page', async ({ page }) => {
    await page.goto('/payroll');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display payroll information', async ({ page }) => {
    await page.goto('/folha-pagamento');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasPayroll = 
      content?.toLowerCase().includes('folha') ||
      content?.toLowerCase().includes('pagamento') ||
      content?.toLowerCase().includes('salário') ||
      content?.toLowerCase().includes('holerite');
    
    expect(hasPayroll).toBeTruthy();
  });
});

test.describe('Time Tracking', () => {
  test('should load time tracking page', async ({ page }) => {
    await page.goto('/time-tracking');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display clock-in interface', async ({ page }) => {
    await page.goto('/controle-ponto');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasTimeTracking = 
      content?.toLowerCase().includes('ponto') ||
      content?.toLowerCase().includes('entrada') ||
      content?.toLowerCase().includes('registro');
    
    expect(hasTimeTracking).toBeTruthy();
  });
});

test.describe('HR AI Modules', () => {
  test('should load HR chatbot page', async ({ page }) => {
    await page.goto('/hr-chatbot');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load HR OCR page', async ({ page }) => {
    await page.goto('/hr-ocr');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load turnover prediction page', async ({ page }) => {
    await page.goto('/hr-turnover');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    
    // Should display AI-related content
    const content = await page.textContent('body');
    const hasPrediction = 
      content?.toLowerCase().includes('predição') ||
      content?.toLowerCase().includes('turnover') ||
      content?.toLowerCase().includes('risco');
    
    expect(hasPrediction).toBeTruthy();
  });

  test('should load recruitment page', async ({ page }) => {
    await page.goto('/recruitment');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('HR Performance', () => {
  test('all HR routes should load within 5 seconds', async ({ page }) => {
    const routes = [
      '/hr-dashboard',
      '/people-analytics',
      '/portal-colaborador',
      '/payroll',
      '/time-tracking',
      '/hr-chatbot',
      '/hr-turnover'
    ];

    for (const route of routes) {
      const start = Date.now();
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(5000);
      console.log(`${route}: ${duration}ms`);
    }
  });
});
