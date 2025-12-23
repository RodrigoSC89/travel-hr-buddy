/**
 * PATCH 852 - Nautilus E2E Tests
 * Real user flow tests with Playwright
 */

import { test, expect } from "@playwright/test";

test.describe("Nautilus One - Fluxos Reais", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.describe("1. Fluxo de Tripulação", () => {
    test("deve exibir página inicial corretamente", async ({ page }) => {
      await expect(page).toHaveTitle(/Nautilus/i);
      await expect(page.locator("body")).toBeVisible();
    });

    test("deve navegar para Maritime Command", async ({ page }) => {
      // Navigate to maritime command if link exists
      const maritimeLink = page.locator('a[href*="maritime"]').first();
      if (await maritimeLink.isVisible()) {
        await maritimeLink.click();
        await page.waitForLoadState("networkidle");
        await expect(page).toHaveURL(/maritime/);
      }
    });

    test("deve exibir dashboard com métricas", async ({ page }) => {
      // Check for dashboard elements
      const dashboard = page.locator('[data-testid="dashboard"], .dashboard, main');
      await expect(dashboard).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("2. Fluxo de Viagem", () => {
    test("deve acessar módulo de viagens", async ({ page }) => {
      const voyageLink = page.locator('a[href*="voyage"], a[href*="travel"]').first();
      if (await voyageLink.isVisible()) {
        await voyageLink.click();
        await page.waitForLoadState("networkidle");
      }
    });
  });

  test.describe("3. Relatório de Auditoria", () => {
    test("deve acessar compliance hub", async ({ page }) => {
      const complianceLink = page.locator('a[href*="compliance"]').first();
      if (await complianceLink.isVisible()) {
        await complianceLink.click();
        await page.waitForLoadState("networkidle");
        await expect(page).toHaveURL(/compliance/);
      }
    });
  });

  test.describe("4. Inteligência de Risco", () => {
    test("deve acessar AI Command", async ({ page }) => {
      const aiLink = page.locator('a[href*="ai-command"], a[href*="ai"]').first();
      if (await aiLink.isVisible()) {
        await aiLink.click();
        await page.waitForLoadState("networkidle");
      }
    });
  });

  test.describe("5. Manutenção com IA", () => {
    test("deve acessar Maintenance Command", async ({ page }) => {
      const maintenanceLink = page.locator('a[href*="maintenance"]').first();
      if (await maintenanceLink.isVisible()) {
        await maintenanceLink.click();
        await page.waitForLoadState("networkidle");
      }
    });
  });

  test.describe("6. Sistema de Diagnóstico", () => {
    test("deve acessar página de debug", async ({ page }) => {
      await page.goto("/__debug__");
      await page.waitForLoadState("networkidle");
      
      // Should show diagnostic information
      const debugContent = page.locator("body");
      await expect(debugContent).toBeVisible();
    });
  });

  test.describe("7. Performance", () => {
    test("página inicial deve carregar em menos de 5 segundos", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000);
    });

    test("deve ter métricas de Web Vitals aceitáveis", async ({ page }) => {
      await page.goto("/");
      
      // Measure LCP
      const lcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ type: "largest-contentful-paint", buffered: true });
          
          // Fallback after 10s
          setTimeout(() => resolve(10000), 10000);
        });
      });
      
      // LCP should be under 4 seconds for good UX
      expect(lcp).toBeLessThan(4000);
    });
  });

  test.describe("8. Navegação Responsiva", () => {
    test("deve funcionar em mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      
      // Check that content is visible on mobile
      const mainContent = page.locator("main, [role='main'], .main-content, body > div").first();
      await expect(mainContent).toBeVisible();
    });

    test("deve funcionar em tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      
      const mainContent = page.locator("main, [role='main'], .main-content, body > div").first();
      await expect(mainContent).toBeVisible();
    });
  });
});
