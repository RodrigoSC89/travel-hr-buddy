/**
 * E2E Tests - Fleet Command Center
 * Critical flow tests for fleet management operations
 */

import { test, expect } from '@playwright/test';

test.describe('Fleet Command Center E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fleet-command');
    await page.waitForLoadState('networkidle');
  });

  test('deve carregar página de Fleet Command', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Fleet Command Center/i })).toBeVisible();
  });

  test('deve exibir KPIs de frota', async ({ page }) => {
    // Verificar se os cards de KPI estão visíveis
    await expect(page.getByText(/Total de Embarcações/i)).toBeVisible();
    await expect(page.getByText(/Em Operação/i)).toBeVisible();
    await expect(page.getByText(/Eficiência Média/i)).toBeVisible();
  });

  test('deve navegar entre abas', async ({ page }) => {
    // Verificar tabs disponíveis
    const tabs = ['Visão Geral', 'Rastreamento', 'Embarcações', 'Manutenção', 'Combustível', 'Analytics'];
    
    for (const tab of tabs) {
      const tabButton = page.getByRole('tab', { name: new RegExp(tab, 'i') });
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('deve abrir modal de nova embarcação', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Nova Embarcação/i });
    await addButton.click();
    
    // Verificar se o modal abriu
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/Adicione uma embarcação/i)).toBeVisible();
  });

  test('deve validar campos obrigatórios ao adicionar embarcação', async ({ page }) => {
    // Abrir modal
    await page.getByRole('button', { name: /Nova Embarcação/i }).click();
    
    // Tentar submeter sem preencher campos
    const submitButton = page.getByRole('button', { name: /Adicionar/i });
    await submitButton.click();
    
    // Deve mostrar mensagem de erro
    await expect(page.getByText(/Nome é obrigatório/i)).toBeVisible();
  });

  test('deve exibir mapa de rastreamento', async ({ page }) => {
    // Navegar para aba de rastreamento
    const trackingTab = page.getByRole('tab', { name: /Rastreamento/i });
    await trackingTab.click();
    
    // Verificar se o mapa carregou
    await page.waitForTimeout(2000);
    const mapContainer = page.locator('.mapboxgl-map, [data-testid="fleet-map"]');
    await expect(mapContainer).toBeVisible();
  });

  test('deve funcionar botão de atualizar dados', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: /Atualizar/i });
    await refreshButton.click();
    
    // Verificar que o botão está em estado de loading
    await expect(refreshButton.locator('svg.animate-spin')).toBeVisible();
    
    // Aguardar loading terminar
    await page.waitForTimeout(3000);
    await expect(refreshButton.locator('svg.animate-spin')).not.toBeVisible();
  });

  test('deve exibir AI Copilot', async ({ page }) => {
    // Verificar se o AI Copilot está visível na página
    await expect(page.getByText(/Fleet AI Copilot/i)).toBeVisible();
    
    // Verificar ações rápidas
    await expect(page.getByRole('button', { name: /Otimizar Rotas/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Análise Combustível/i })).toBeVisible();
  });

  test('deve criar nova missão', async ({ page }) => {
    const missionButton = page.getByRole('button', { name: /Nova Missão/i });
    await missionButton.click();
    
    // Verificar se o dialog de missão abriu
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});

test.describe('Fleet Command - Responsividade', () => {
  test('deve funcionar em dispositivo móvel', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/fleet-command');
    await page.waitForLoadState('networkidle');
    
    // Verificar se a página carrega corretamente
    await expect(page.getByRole('heading', { name: /Fleet Command Center/i })).toBeVisible();
    
    // Verificar se os KPIs estão em layout mobile
    await expect(page.getByText(/Total de Embarcações/i)).toBeVisible();
  });

  test('deve funcionar em tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/fleet-command');
    await page.waitForLoadState('networkidle');
    
    // Verificar se a página carrega corretamente
    await expect(page.getByRole('heading', { name: /Fleet Command Center/i })).toBeVisible();
  });
});

test.describe('Fleet Command - Performance', () => {
  test('deve carregar em menos de 5 segundos', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/fleet-command');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
  });
});
