import { test, expect } from '@playwright/test';

test('Criar incidente com IA operacional', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('admin@nautilus.com');
  await page.getByPlaceholder('Senha').fill('admin123');
  await page.getByRole('button', { name: /entrar/i }).click();

  await page.getByRole('link', { name: /incidentes/i }).click();
  await page.getByRole('button', { name: /novo incidente/i }).click();
  await page.getByLabel('Descrição').fill('Falha de comunicação com ponte de comando');
  await page.getByLabel('Severidade').selectOption('Alta');
  await page.getByRole('button', { name: /gerar resposta IA/i }).click();

  await expect(page.getByText(/Recomendação da IA/)).toBeVisible();
});