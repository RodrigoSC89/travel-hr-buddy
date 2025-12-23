import { test, expect } from '@playwright/test';

test('Criar avaliação de risco', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('admin@nautilus.com');
  await page.getByPlaceholder('Senha').fill('admin123');
  await page.getByRole('button', { name: /entrar/i }).click();

  await page.getByRole('link', { name: /riscos/i }).click();
  await page.getByRole('button', { name: /nova avaliação/i }).click();
  await page.getByLabel('Título').fill('Risco de Propulsão');
  await page.getByLabel('Probabilidade').selectOption('Alta');
  await page.getByLabel('Impacto').selectOption('Crítico');
  await page.getByRole('button', { name: /salvar/i }).click();

  await expect(page.getByText('Avaliação registrada com sucesso')).toBeVisible();
});