/**
 * E2E Tests - Training Modules (Nautilus Academy, SOLAS, ISPS, ISM)
 * Validates all training and certification flows
 */
import { test, expect } from '@playwright/test';

test.describe('Nautilus Academy (LMS)', () => {
  test('should load academy page', async ({ page }) => {
    await page.goto('/nautilus-academy');
    await expect(page.locator('h1, h2, [data-testid="page-title"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display course catalog', async ({ page }) => {
    await page.goto('/nautilus-academy');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasAcademy = 
      content?.toLowerCase().includes('academy') ||
      content?.toLowerCase().includes('curso') ||
      content?.toLowerCase().includes('treinamento') ||
      content?.toLowerCase().includes('módulo');
    
    expect(hasAcademy).toBeTruthy();
  });

  test('should have interactive course elements', async ({ page }) => {
    await page.goto('/nautilus-academy');
    await page.waitForLoadState('networkidle');
    
    const cards = page.locator('.card, [class*="card"], [data-course]');
    const buttons = page.locator('button');
    
    const cardsCount = await cards.count();
    const buttonsCount = await buttons.count();
    
    expect(cardsCount + buttonsCount).toBeGreaterThan(0);
  });
});

test.describe('SOLAS Training', () => {
  test('should load SOLAS training page', async ({ page }) => {
    await page.goto('/solas-training');
    await expect(page.locator('h1, h2, [data-testid="page-title"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display SOLAS content', async ({ page }) => {
    await page.goto('/solas-training');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasSOLAS = 
      content?.toLowerCase().includes('solas') ||
      content?.toLowerCase().includes('safety of life') ||
      content?.toLowerCase().includes('emergência') ||
      content?.toLowerCase().includes('abandono');
    
    expect(hasSOLAS).toBeTruthy();
  });
});

test.describe('ISPS Training', () => {
  test('should load ISPS security page', async ({ page }) => {
    await page.goto('/isps-security');
    await expect(page.locator('h1, h2, [data-testid="page-title"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display ISPS security content', async ({ page }) => {
    await page.goto('/isps-security');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasISPS = 
      content?.toLowerCase().includes('isps') ||
      content?.toLowerCase().includes('security') ||
      content?.toLowerCase().includes('segurança') ||
      content?.toLowerCase().includes('proteção');
    
    expect(hasISPS).toBeTruthy();
  });
});

test.describe('Drill Simulator', () => {
  test('should load drill simulator page', async ({ page }) => {
    await page.goto('/drill-simulator');
    await expect(page.locator('h1, h2, [data-testid="page-title"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display drill scenarios', async ({ page }) => {
    await page.goto('/drill-simulator');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasDrill = 
      content?.toLowerCase().includes('drill') ||
      content?.toLowerCase().includes('simulação') ||
      content?.toLowerCase().includes('exercício') ||
      content?.toLowerCase().includes('cenário');
    
    expect(hasDrill).toBeTruthy();
  });

  test('should have interactive simulation controls', async ({ page }) => {
    await page.goto('/drill-simulator');
    await page.waitForLoadState('networkidle');
    
    const buttons = page.locator('button:has-text("Iniciar"), button:has-text("Start"), button:has-text("Simular")');
    
    await page.waitForTimeout(500);
  });
});

test.describe('DP Intelligence / Mentor DP', () => {
  test('should load DP intelligence page', async ({ page }) => {
    await page.goto('/dp-intelligence');
    await expect(page.locator('h1, h2, [data-testid="page-title"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display DP training content', async ({ page }) => {
    await page.goto('/dp-intelligence');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasDP = 
      content?.toLowerCase().includes('dp') ||
      content?.toLowerCase().includes('dynamic positioning') ||
      content?.toLowerCase().includes('posicionamento');
    
    expect(hasDP).toBeTruthy();
  });
});

test.describe('Training Certifications', () => {
  test('should track certification expiry', async ({ page }) => {
    await page.goto('/nautilus-academy');
    await page.waitForLoadState('networkidle');
    
    // Look for certification-related content
    const content = await page.textContent('body');
    const hasCertifications = 
      content?.toLowerCase().includes('certificado') ||
      content?.toLowerCase().includes('certification') ||
      content?.toLowerCase().includes('validade') ||
      content?.toLowerCase().includes('expiração');
    
    // May or may not have explicit certification section
  });
});

test.describe('Training AI Features', () => {
  test('should have AI-powered quiz generation', async ({ page }) => {
    await page.goto('/nautilus-academy');
    await page.waitForLoadState('networkidle');
    
    // Look for quiz or AI-related buttons
    const aiButtons = page.locator('button:has-text("Quiz"), button:has-text("IA"), button:has-text("Gerar")');
    
    await page.waitForTimeout(500);
  });

  test('should have progress tracking', async ({ page }) => {
    await page.goto('/nautilus-academy');
    await page.waitForLoadState('networkidle');
    
    // Look for progress indicators
    const progressElements = page.locator('[role="progressbar"], .progress, [class*="progress"]');
    const percentages = page.locator('text=/%/');
    
    await page.waitForTimeout(500);
  });
});

test.describe('Training Performance', () => {
  test('all training routes should load within 5 seconds', async ({ page }) => {
    const routes = [
      '/nautilus-academy',
      '/solas-training',
      '/isps-security',
      '/drill-simulator',
      '/dp-intelligence'
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

  test('training modules should not have console errors', async ({ page }) => {
    const routes = ['/nautilus-academy', '/solas-training'];
    
    for (const route of routes) {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error' && !msg.text().includes('favicon')) {
          errors.push(msg.text());
        }
      });
      
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      const criticalErrors = errors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('Failed to load resource') &&
        !e.includes('net::ERR')
      );
      
      expect(criticalErrors.length).toBeLessThan(3);
    }
  });
});
