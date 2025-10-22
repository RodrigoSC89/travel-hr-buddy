import { test, expect } from '@playwright/test';

/**
 * Full Preview Verification Test Suite
 * 
 * This test suite verifies that all key routes of the Nautilus One system
 * are rendering correctly without white screens or TypeScript errors.
 * 
 * It tests the following:
 * - HTTP status is valid (not 404/500)
 * - Page loads completely (networkidle)
 * - Page contains content (not blank)
 * - Page title contains expected keywords
 */

const routes = [
  '/dashboard',
  '/dp-intelligence',
  '/bridgelink',
  '/forecast-global',
  '/control-hub',
  '/peo-dp',
  '/ai-assistant',
  '/analytics',
  '/price-alerts',
  '/reports',
  '/portal',
  '/checklists-inteligentes'
];

test.describe('Preview Build Verification', () => {
  for (const route of routes) {
    test(`🧭 Verificando módulo: ${route}`, async ({ page }) => {
      // Aumenta o timeout para páginas que podem demorar para carregar
      test.setTimeout(30000);
      
      // Navega para a rota
      const response = await page.goto(`http://localhost:8080${route}`);
      
      // Verifica se a página carregou com sucesso (não 404)
      expect(response?.status()).toBeLessThan(400);
      
      // Aguarda um pouco para garantir que o JS foi executado
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Verifica se não há erro de tela branca (deve ter conteúdo)
      const bodyText = await page.textContent('body');
      expect(bodyText?.length).toBeGreaterThan(0);
      
      // Verifica se o título contém palavras-chave do sistema
      const title = await page.title();
      expect(title).toMatch(/Nautilus|DP Intelligence|Forecast|Control|Portal|Analytics|BridgeLink|Checklists/i);
    });
  }
});
