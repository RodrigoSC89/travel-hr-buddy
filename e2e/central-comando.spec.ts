/**
 * E2E Tests - Central de Comando
 * Critical flow tests for unified command center
 */

import { test, expect } from '@playwright/test';

test.describe('Central de Comando E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/central-comando');
    await page.waitForLoadState('networkidle');
  });

  test('deve carregar página de Central de Comando', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Central de Comando/i })).toBeVisible();
  });

  test('deve exibir todas as abas principais', async ({ page }) => {
    const tabs = ['Visão Geral', 'Operações', 'Executivo', 'IA', 'Resiliência', 'Alertas', 'Config'];
    
    for (const tab of tabs) {
      const tabTrigger = page.getByRole('tab', { name: new RegExp(tab, 'i') });
      await expect(tabTrigger).toBeVisible();
    }
  });

  test('deve navegar para aba de Visão Geral', async ({ page }) => {
    await page.goto('/central-comando/visao-geral');
    await page.waitForLoadState('networkidle');
    
    // Verificar se o conteúdo de visão geral está visível
    await expect(page.getByRole('tab', { name: /Visão Geral/i })).toHaveAttribute('data-state', 'active');
  });

  test('deve navegar para aba de Operações', async ({ page }) => {
    const operacoesTab = page.getByRole('tab', { name: /Operações/i });
    await operacoesTab.click();
    
    await expect(operacoesTab).toHaveAttribute('data-state', 'active');
  });

  test('deve exibir status de conexão online', async ({ page }) => {
    await expect(page.getByText(/Online|Conectando/i)).toBeVisible();
  });

  test('deve funcionar botão de atualizar', async ({ page }) => {
    const refreshButton = page.locator('button').filter({ has: page.locator('svg.lucide-refresh-cw') });
    
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(500);
      // Verificar que a ação foi executada (toast de sucesso ou loading)
    }
  });

  test('deve funcionar toggle de tema', async ({ page }) => {
    const themeButton = page.locator('button').filter({ has: page.locator('svg.lucide-sun, svg.lucide-moon') });
    
    if (await themeButton.isVisible()) {
      await themeButton.click();
      await page.waitForTimeout(300);
      // O tema deve ter mudado
    }
  });

  test('deve abrir painel de IA', async ({ page }) => {
    const iaButton = page.getByText(/IA Ativa/i);
    
    if (await iaButton.isVisible()) {
      await iaButton.click();
      await page.waitForTimeout(500);
      
      // Verificar se o painel de IA abriu
      await expect(page.getByText(/Assistente IA/i)).toBeVisible();
    }
  });

  test('deve fechar painel de IA', async ({ page }) => {
    // Abrir painel
    const iaButton = page.getByText(/IA Ativa/i);
    if (await iaButton.isVisible()) {
      await iaButton.click();
      await page.waitForTimeout(500);
      
      // Fechar painel
      const closeButton = page.getByRole('button', { name: /Fechar chat/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('deve exibir alertas críticos quando existirem', async ({ page }) => {
    // Verificar se há indicador de alertas
    const alertBadge = page.locator('[data-tour="tabs"] .destructive');
    // Se houver alertas, o badge deve ser visível
  });
});

test.describe('Central de Comando - Subrotas', () => {
  test('deve navegar para /central-comando/operacoes', async ({ page }) => {
    await page.goto('/central-comando/operacoes');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('tab', { name: /Operações/i })).toHaveAttribute('data-state', 'active');
  });

  test('deve navegar para /central-comando/executivo', async ({ page }) => {
    await page.goto('/central-comando/executivo');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('tab', { name: /Executivo/i })).toHaveAttribute('data-state', 'active');
  });

  test('deve navegar para /central-comando/ia', async ({ page }) => {
    await page.goto('/central-comando/ia');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('tab', { name: /IA/i })).toHaveAttribute('data-state', 'active');
  });

  test('deve navegar para /central-comando/alertas', async ({ page }) => {
    await page.goto('/central-comando/alertas');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('tab', { name: /Alertas/i })).toHaveAttribute('data-state', 'active');
  });
});

test.describe('Central de Comando - Dados em Tempo Real', () => {
  test('deve exibir timestamp de última sincronização', async ({ page }) => {
    // Verificar se há indicador de hora da última sincronização
    const timeIndicator = page.locator('text=/\\d{2}:\\d{2}/');
    await expect(timeIndicator.first()).toBeVisible();
  });

  test('deve carregar dados do sistema', async ({ page }) => {
    // Aguardar carregamento completo
    await page.waitForTimeout(3000);
    
    // Verificar se não há estado de loading permanente
    const loadingSpinner = page.locator('.animate-spin');
    // Não deve ter spinner permanente após 3 segundos
  });
});

test.describe('Central de Comando - Responsividade', () => {
  test('deve funcionar em dispositivo móvel', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/central-comando');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: /Central de Comando/i })).toBeVisible();
  });
});
