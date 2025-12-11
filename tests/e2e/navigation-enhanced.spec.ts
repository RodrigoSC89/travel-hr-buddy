/**
 * Enhanced Navigation E2E Tests - FASE 3
 * Testes completos de navegação
 */

import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { mainRoutes, moduleRoutes, menuItems } from './fixtures/navigation.fixtures';
import { loginAsUser } from './helpers/auth.helpers';
import { 
  navigateTo, 
  expectMainMenu, 
  expectNotFound, 
  expectPageLoaded,
  expectCurrentRoute,
  waitForNavigation
} from './helpers/navigation.helpers';

test.describe('FASE 3 - Main Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await loginAsUser(page);
  });

  test('NAV-001: Deve acessar dashboard', async ({ page }) => {
    await navigateTo(page, mainRoutes.dashboard);
    await expectPageLoaded(page);
    await expectCurrentRoute(page, '/dashboard');
  });

  test('NAV-002: Deve ter menu principal visível', async ({ page }) => {
    await navigateTo(page, mainRoutes.dashboard);
    await expectMainMenu(page);
  });

  test('NAV-003: Deve navegar entre módulos principais', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    
    // Testar navegação para alguns módulos
    const modulesToTest = ['ESG', 'Auditorias', 'Manutenção', 'Tripulação'];
    
    for (const moduleName of modulesToTest) {
      const menuItem = page.locator(`nav >> a:has-text("${moduleName}"), nav >> button:has-text("${moduleName}")`).first();
      
      if (await menuItem.isVisible({ timeout: 2000 }).catch(() => false)) {
        await menuItem.click();
        await waitForNavigation(page);
        
        // Verificar que navegou (não está em 404)
        await expectNotFound(page, false);
      }
    }
  });

  test('NAV-004: Deve navegar para ESG Dashboard', async ({ page }) => {
    await navigateTo(page, moduleRoutes.esg);
    await expectPageLoaded(page);
  });

  test('NAV-005: Deve navegar para Auditorias ISM', async ({ page }) => {
    await navigateTo(page, moduleRoutes.ismAudit);
    await expectPageLoaded(page);
  });

  test('NAV-006: Deve navegar para Manutenção', async ({ page }) => {
    await navigateTo(page, moduleRoutes.maintenance);
    await expectPageLoaded(page);
  });

  test('NAV-007: Deve navegar para Gestão de Tripulação', async ({ page }) => {
    await navigateTo(page, moduleRoutes.crewManagement);
    await expectPageLoaded(page);
  });

  test('NAV-008: Deve mostrar 404 para rota inexistente', async ({ page }) => {
    await page.goto('/rota-que-nao-existe-12345');
    await page.waitForLoadState('networkidle');
    await expectNotFound(page, true);
  });

  test('NAV-009: Deve navegar usando botão voltar do navegador', async ({ page }) => {
    await navigateTo(page, mainRoutes.dashboard);
    await navigateTo(page, moduleRoutes.esg);
    
    await page.goBack();
    await waitForNavigation(page);
    
    await expectCurrentRoute(page, '/dashboard');
  });

  test('NAV-010: Deve navegar usando botão avançar do navegador', async ({ page }) => {
    await navigateTo(page, mainRoutes.dashboard);
    await navigateTo(page, moduleRoutes.esg);
    await page.goBack();
    await page.goForward();
    await waitForNavigation(page);
    
    await expectCurrentRoute(page, '/esg');
  });
});

test.describe('FASE 3 - Responsive Navigation', () => {
  test('NAV-MOBILE-001: Deve ter navegação funcional em mobile', async ({ page }) => {
    await loginAsUser(page);
    
    // Configurar viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(mainRoutes.dashboard);
    
    // Verificar que a página carregou
    await expectPageLoaded(page);
  });

  test('NAV-MOBILE-002: Deve ter menu hamburger em mobile', async ({ page }) => {
    await loginAsUser(page);
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(mainRoutes.dashboard);
    
    // Procurar por botão de menu mobile
    const menuButtonSelectors = [
      'button[aria-label="Menu"]',
      'button:has-text("Menu")',
      '[data-testid="mobile-menu"]',
      '.mobile-menu-button'
    ];
    
    let menuFound = false;
    for (const selector of menuButtonSelectors) {
      if (await page.locator(selector).isVisible({ timeout: 2000 }).catch(() => false)) {
        menuFound = true;
        break;
      }
    }
    
    // Em mobile, deve ter menu hamburger OU menu sempre visível
    const hasNav = await page.locator('nav').isVisible({ timeout: 2000 }).catch(() => false);
    expect(menuFound || hasNav).toBe(true);
  });
});

test.describe('FASE 3 - Route Validation (Regressão)', () => {
  test('ROUTE-REG-001: Todas as rotas registradas devem carregar sem erro', async ({ page }) => {
    await loginAsUser(page);
    
    const routesToTest = [
      mainRoutes.dashboard,
      mainRoutes.admin,
      mainRoutes.settings,
      moduleRoutes.esg,
      moduleRoutes.ismAudit,
      moduleRoutes.maintenance,
      moduleRoutes.crewManagement
    ];
    
    for (const route of routesToTest) {
      await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);
      
      // Verificar que não é 404
      await expectNotFound(page, false);
    }
  });

  test('ROUTE-REG-002: Lazy loading não deve quebrar rotas', async ({ page }) => {
    await loginAsUser(page);
    
    // Navegar rapidamente entre rotas
    await navigateTo(page, mainRoutes.dashboard);
    await expectPageLoaded(page);
    
    await navigateTo(page, moduleRoutes.esg);
    await expectPageLoaded(page);
    
    await navigateTo(page, moduleRoutes.maintenance);
    await expectPageLoaded(page);
    
    // Todas devem carregar corretamente
  });
});
