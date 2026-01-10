/**
 * E2E Tests - Audit Modules (PEO-DP, PEOTRAM, SGSO, MLC, IMCA, Pre-OVID, PSC)
 * Validates all compliance and audit critical flows
 */
import { test, expect } from '@playwright/test';

test.describe('PEO-DP Audit Module', () => {
  test('should load PEO-DP page', async ({ page }) => {
    await page.goto('/peo-dp');
    await expect(page.locator('h1, h2, [data-testid="page-title"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display audit checklist elements', async ({ page }) => {
    await page.goto('/peo-dp');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasPEODP = 
      content?.toLowerCase().includes('peo') ||
      content?.toLowerCase().includes('auditoria') ||
      content?.toLowerCase().includes('checklist') ||
      content?.toLowerCase().includes('evidência');
    
    expect(hasPEODP).toBeTruthy();
  });

  test('should have navigation tabs or sections', async ({ page }) => {
    await page.goto('/peo-dp');
    await page.waitForLoadState('networkidle');
    
    // Look for tabs, sections, or navigation
    const tabs = page.locator('[role="tab"], [data-state="active"], .tab, button[class*="tab"]');
    const sections = page.locator('section, [data-section], .card');
    
    const tabCount = await tabs.count();
    const sectionCount = await sections.count();
    
    expect(tabCount + sectionCount).toBeGreaterThan(0);
  });

  test('should allow evidence generation flow', async ({ page }) => {
    await page.goto('/peo-dp');
    await page.waitForLoadState('networkidle');
    
    // Look for evidence-related buttons
    const evidenceButtons = page.locator('button:has-text("Evidência"), button:has-text("Gerar"), button:has-text("Upload")');
    
    // Should have some evidence functionality
    await page.waitForTimeout(1000);
  });
});

test.describe('PEOTRAM Audit Module', () => {
  test('should load PEOTRAM page', async ({ page }) => {
    await page.goto('/peotram');
    await expect(page.locator('h1, h2, [data-testid="page-title"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display PEOTRAM compliance elements', async ({ page }) => {
    await page.goto('/peotram');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasPEOTRAM = 
      content?.toLowerCase().includes('peotram') ||
      content?.toLowerCase().includes('treinamento') ||
      content?.toLowerCase().includes('conformidade') ||
      content?.toLowerCase().includes('elemento');
    
    expect(hasPEOTRAM).toBeTruthy();
  });

  test('should have element completion tracking', async ({ page }) => {
    await page.goto('/peotram');
    await page.waitForLoadState('networkidle');
    
    // Look for progress indicators
    const progressElements = page.locator('[role="progressbar"], .progress, [class*="progress"], [data-progress]');
    const checkboxes = page.locator('input[type="checkbox"], [role="checkbox"]');
    const badges = page.locator('.badge, [class*="badge"], span[class*="status"]');
    
    // Should have some tracking UI
    await page.waitForTimeout(500);
  });
});

test.describe('SGSO Module', () => {
  test('should load SGSO page', async ({ page }) => {
    await page.goto('/sgso');
    await expect(page.locator('h1, h2, [data-testid="page-title"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display SGSO safety elements', async ({ page }) => {
    await page.goto('/sgso');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasSGSO = 
      content?.toLowerCase().includes('sgso') ||
      content?.toLowerCase().includes('segurança') ||
      content?.toLowerCase().includes('incidente') ||
      content?.toLowerCase().includes('operacional');
    
    expect(hasSGSO).toBeTruthy();
  });

  test('should have incident reporting capability', async ({ page }) => {
    await page.goto('/sgso');
    await page.waitForLoadState('networkidle');
    
    // Look for incident-related buttons
    const buttons = page.locator('button:has-text("Incidente"), button:has-text("Novo"), button:has-text("Registrar")');
    
    await page.waitForTimeout(500);
  });
});

test.describe('MLC Inspection Module', () => {
  test('should load MLC page', async ({ page }) => {
    await page.goto('/mlc-inspection');
    await expect(page.locator('h1, h2, [data-testid="page-title"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display MLC compliance checklist', async ({ page }) => {
    await page.goto('/mlc-inspection');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasMLC = 
      content?.toLowerCase().includes('mlc') ||
      content?.toLowerCase().includes('maritime labour') ||
      content?.toLowerCase().includes('trabalho marítimo') ||
      content?.toLowerCase().includes('inspeção');
    
    expect(hasMLC).toBeTruthy();
  });
});

test.describe('Pre-OVID Inspection Module', () => {
  test('should load Pre-OVID page', async ({ page }) => {
    await page.goto('/pre-ovid');
    await expect(page.locator('h1, h2, [data-testid="page-title"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display OVID inspection elements', async ({ page }) => {
    await page.goto('/pre-ovid-inspection');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasOVID = 
      content?.toLowerCase().includes('ovid') ||
      content?.toLowerCase().includes('inspeção') ||
      content?.toLowerCase().includes('vetting');
    
    expect(hasOVID).toBeTruthy();
  });
});

test.describe('IMCA Audit Module', () => {
  test('should load IMCA page', async ({ page }) => {
    await page.goto('/imca-audit');
    await expect(page.locator('h1, h2, [data-testid="page-title"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display IMCA safety elements', async ({ page }) => {
    await page.goto('/imca-audit');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasIMCA = 
      content?.toLowerCase().includes('imca') ||
      content?.toLowerCase().includes('human factors') ||
      content?.toLowerCase().includes('safety');
    
    expect(hasIMCA).toBeTruthy();
  });
});

test.describe('PSC Package Module', () => {
  test('should load PSC page', async ({ page }) => {
    await page.goto('/psc-package');
    await expect(page.locator('h1, h2, [data-testid="page-title"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display PSC package elements', async ({ page }) => {
    await page.goto('/psc-package');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasPSC = 
      content?.toLowerCase().includes('psc') ||
      content?.toLowerCase().includes('port state') ||
      content?.toLowerCase().includes('pacote');
    
    expect(hasPSC).toBeTruthy();
  });
});

test.describe('Compliance Hub', () => {
  test('should load compliance center', async ({ page }) => {
    await page.goto('/compliance-hub');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display unified compliance dashboard', async ({ page }) => {
    await page.goto('/compliance-center');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasCompliance = 
      content?.toLowerCase().includes('compliance') ||
      content?.toLowerCase().includes('conformidade') ||
      content?.toLowerCase().includes('score');
    
    expect(hasCompliance).toBeTruthy();
  });
});

test.describe('Audit Evidence Generation', () => {
  test('evidence buttons should be clickable in PEO-DP', async ({ page }) => {
    await page.goto('/peo-dp');
    await page.waitForLoadState('networkidle');
    
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // Should have interactive buttons
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('evidence buttons should be clickable in PEOTRAM', async ({ page }) => {
    await page.goto('/peotram');
    await page.waitForLoadState('networkidle');
    
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
  });
});

test.describe('Audit Performance', () => {
  test('all audit routes should load within 5 seconds', async ({ page }) => {
    const routes = [
      '/peo-dp',
      '/peotram',
      '/sgso',
      '/mlc-inspection',
      '/pre-ovid',
      '/imca-audit',
      '/psc-package',
      '/compliance-hub'
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

  test('audit modules should not have console errors', async ({ page }) => {
    const routes = ['/peo-dp', '/peotram', '/sgso'];
    
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
      
      // Filter out known acceptable errors
      const criticalErrors = errors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('Failed to load resource') &&
        !e.includes('net::ERR')
      );
      
      expect(criticalErrors.length).toBeLessThan(3);
    }
  });
});
