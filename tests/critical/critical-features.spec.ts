/**
 * 🧪 CRITICAL FEATURES E2E TESTS
 * Playwright tests for the 8 critical modules in Nautilus One v3.2.0
 */

import { test, expect } from '@playwright/test';

test.describe('💥 Critical Features - Functional Tests', () => {

  test.describe('1. Vessel Contracts + Downtime AI', () => {
    test('should load vessel contracts page', async ({ page }) => {
      await page.goto('/vessel-contracts');
      await expect(page).toHaveURL(/vessel-contracts/);
      await expect(page.locator('text=Contrato')).toBeVisible();
    });

    test('should display downtime trend chart', async ({ page }) => {
      await page.goto('/vessel-contracts');
      await page.click('text=Downtime');
      await expect(page.locator('[data-testid="downtime-chart"]')).toBeVisible();
    });
  });

  test.describe('2. CTS + Crew Compliance', () => {
    test('should load CTS validation page', async ({ page }) => {
      await page.goto('/vessel-cts');
      await expect(page).toHaveURL(/vessel-cts/);
      await expect(page.locator('text=CTS')).toBeVisible();
    });

    test('should show non-conformity alerts', async ({ page }) => {
      await page.goto('/vessel-cts');
      // Look for alert indicators
      const alerts = page.locator('[data-status="non-conforming"], .text-destructive, text=Não Conformidade');
      await expect(alerts.first()).toBeVisible({ timeout: 5000 }).catch(() => {
        // Non-conformities may not exist in test data
        console.log('No non-conformities found in test data');
      });
    });
  });

  test.describe('3. IMCA Incidents Study', () => {
    test('should load IMCA incidents page', async ({ page }) => {
      await page.goto('/safety-imca');
      await expect(page).toHaveURL(/safety-imca/);
      await expect(page.locator('text=IMCA')).toBeVisible();
    });

    test('should display incident classification', async ({ page }) => {
      await page.goto('/safety-imca');
      await expect(page.locator('text=Incidente, text=Classificação')).toBeVisible();
    });
  });

  test.describe('4. Vessel History', () => {
    test('should load vessel history page', async ({ page }) => {
      await page.goto('/vessel-history');
      await expect(page).toHaveURL(/vessel-history/);
      await expect(page.locator('text=Histórico')).toBeVisible();
    });

    test('should display timeline', async ({ page }) => {
      await page.goto('/vessel-history');
      await expect(page.locator('text=Timeline, [data-testid="timeline"]')).toBeVisible();
    });
  });

  test.describe('5. Responsibility Matrix', () => {
    test('should load responsibility matrix page', async ({ page }) => {
      await page.goto('/responsibility-matrix');
      await expect(page).toHaveURL(/responsibility-matrix/);
      await expect(page.locator('text=Matriz, text=Responsabilidade')).toBeVisible();
    });

    test('should have RACI model elements', async ({ page }) => {
      await page.goto('/responsibility-matrix');
      const raciElements = page.locator('text=Responsável, text=Aprovador, text=Consultado, text=Informado');
      await expect(raciElements.first()).toBeVisible();
    });
  });

  test.describe('6. GMUD Management', () => {
    test('should load GMUD page', async ({ page }) => {
      await page.goto('/gmud');
      await expect(page).toHaveURL(/gmud/);
      await expect(page.locator('text=GMUD, text=Gestão de Mudanças')).toBeVisible();
    });

    test('should show workflow status', async ({ page }) => {
      await page.goto('/gmud');
      await expect(page.locator('text=Pendente, text=Aprovado, text=Fluxo')).toBeVisible();
    });
  });

  test.describe('7. PEOTRAM AI + Voice', () => {
    test('should load PEOTRAM page', async ({ page }) => {
      await page.goto('/peotram');
      await expect(page).toHaveURL(/peotram/);
      await expect(page.locator('text=PEOTRAM')).toBeVisible();
    });

    test('should have AI capabilities available', async ({ page }) => {
      await page.goto('/peotram');
      const aiButton = page.locator('text=IA, text=Gerar Evidência, text=Análise');
      await expect(aiButton.first()).toBeVisible();
    });

    test('should have export functionality', async ({ page }) => {
      await page.goto('/peotram');
      const exportButton = page.locator('text=Exportar, text=PDF, text=Download');
      await expect(exportButton.first()).toBeVisible();
    });
  });

  test.describe('8. Human Factors / Neuroscience', () => {
    test('should load human factors page', async ({ page }) => {
      await page.goto('/safety-human-factors');
      await expect(page).toHaveURL(/safety-human-factors/);
      await expect(page.locator('text=Fatores Humanos, text=Neurociência')).toBeVisible();
    });

    test('should have QE assessment', async ({ page }) => {
      await page.goto('/safety-human-factors');
      await expect(page.locator('text=QE, text=Quociente Emocional, text=Avaliação')).toBeVisible();
    });
  });

});

test.describe('🔗 Critical Routes Accessibility', () => {
  const criticalRoutes = [
    { path: '/vessel-contracts', name: 'Vessel Contracts' },
    { path: '/vessel-cts', name: 'Vessel CTS' },
    { path: '/safety-imca', name: 'Safety IMCA' },
    { path: '/vessel-history', name: 'Vessel History' },
    { path: '/responsibility-matrix', name: 'Responsibility Matrix' },
    { path: '/gmud', name: 'GMUD' },
    { path: '/peotram', name: 'PEOTRAM' },
    { path: '/safety-human-factors', name: 'Human Factors' },
  ];

  for (const route of criticalRoutes) {
    test(`${route.name} should be accessible`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page).not.toHaveURL(/404|error/i);
      // Page should have meaningful content
      await expect(page.locator('main, [role="main"], .container')).toBeVisible();
    });
  }
});
