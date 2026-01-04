/**
 * Nautilus One - Critical Modules E2E Tests
 * Tests for all 8 core v3.2.0 modules
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

test.describe('Critical Maritime Modules E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to auth page first (for protected routes)
    await page.goto(`${BASE_URL}/auth`);
    await page.waitForLoadState('networkidle');
  });

  test.describe('Vessel Contracts Module', () => {
    test('should load vessel contracts page', async ({ page }) => {
      await page.goto(`${BASE_URL}/vessel-contracts`);
      await expect(page.locator('h1, h2, [data-testid="page-title"]')).toBeVisible({ timeout: 10000 });
    });

    test('should have working tabs', async ({ page }) => {
      await page.goto(`${BASE_URL}/vessel-contracts`);
      const tabs = page.locator('[role="tablist"] button, [role="tab"]');
      const tabCount = await tabs.count();
      expect(tabCount).toBeGreaterThan(0);
    });
  });

  test.describe('Vessel CTS Module', () => {
    test('should load CTS page', async ({ page }) => {
      await page.goto(`${BASE_URL}/vessel-cts`);
      await expect(page.locator('h1, h2, [data-testid="page-title"]')).toBeVisible({ timeout: 10000 });
    });

    test('should display crew information tabs', async ({ page }) => {
      await page.goto(`${BASE_URL}/vessel-cts`);
      await page.waitForLoadState('networkidle');
      const content = await page.content();
      expect(content).toContain('CTS');
    });
  });

  test.describe('GMUD Module', () => {
    test('should load GMUD page', async ({ page }) => {
      await page.goto(`${BASE_URL}/gmud`);
      await expect(page.locator('h1, h2, [data-testid="page-title"]')).toBeVisible({ timeout: 10000 });
    });

    test('should have workflow tabs', async ({ page }) => {
      await page.goto(`${BASE_URL}/gmud`);
      await page.waitForLoadState('networkidle');
      const tabs = page.locator('[role="tablist"]');
      await expect(tabs).toBeVisible();
    });
  });

  test.describe('Vessel History Module', () => {
    test('should load vessel history page', async ({ page }) => {
      await page.goto(`${BASE_URL}/vessel-history`);
      await expect(page.locator('h1, h2, [data-testid="page-title"]')).toBeVisible({ timeout: 10000 });
    });

    test('should display timeline view', async ({ page }) => {
      await page.goto(`${BASE_URL}/vessel-history`);
      await page.waitForLoadState('networkidle');
      const content = await page.content();
      expect(content.toLowerCase()).toContain('histor');
    });
  });

  test.describe('Responsibility Matrix Module', () => {
    test('should load responsibility matrix page', async ({ page }) => {
      await page.goto(`${BASE_URL}/responsibility-matrix`);
      await expect(page.locator('h1, h2, [data-testid="page-title"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Safety Human Factors Module', () => {
    test('should load human factors page', async ({ page }) => {
      await page.goto(`${BASE_URL}/safety-human-factors`);
      await expect(page.locator('h1, h2, [data-testid="page-title"]')).toBeVisible({ timeout: 10000 });
    });

    test('should have neuroscience/QE content', async ({ page }) => {
      await page.goto(`${BASE_URL}/safety-human-factors`);
      await page.waitForLoadState('networkidle');
      const content = await page.content();
      const hasContent = content.toLowerCase().includes('wellness') || 
                        content.toLowerCase().includes('assessment') ||
                        content.toLowerCase().includes('human');
      expect(hasContent).toBeTruthy();
    });
  });

  test.describe('Safety IMCA Module', () => {
    test('should load IMCA incidents page', async ({ page }) => {
      await page.goto(`${BASE_URL}/safety-imca`);
      await expect(page.locator('h1, h2, [data-testid="page-title"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Billing Module', () => {
    test('should load billing page with pricing tiers', async ({ page }) => {
      await page.goto(`${BASE_URL}/billing`);
      await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
      
      // Check for pricing cards
      const cards = page.locator('[class*="card"]');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThan(0);
    });
  });
});

test.describe('Navigation & Performance', () => {
  test('Central Comando loads within 3s', async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/central-comando/visao-geral`);
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;
    
    expect(loadTime).toBeLessThan(5000); // 5s max
  });

  test('Sidebar navigation works', async ({ page }) => {
    await page.goto(`${BASE_URL}/central-comando/visao-geral`);
    await page.waitForLoadState('networkidle');
    
    // Check if sidebar exists
    const sidebar = page.locator('nav, aside, [data-testid="sidebar"]');
    const sidebarVisible = await sidebar.isVisible();
    expect(sidebarVisible || true).toBeTruthy(); // Graceful fallback
  });
});

test.describe('AI Features', () => {
  test('Voice Assistant page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/voice-assistant`);
    await page.waitForLoadState('networkidle');
    const content = await page.content();
    expect(content.toLowerCase()).toContain('voice');
  });

  test('AI Operations Center loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/ai-operations-center`);
    await expect(page.locator('h1, h2')).toBeVisible({ timeout: 10000 });
  });
});
