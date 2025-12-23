import { test, expect } from '@playwright/test';

test('Registrar auditoria SGSO com evidência', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('auditor@nautilus.com');
  await page.getByPlaceholder('Senha').fill('auditor123');
  await page.getByRole('button', { name: /entrar/i }).click();

  await page.getByRole('link', { name: /auditorias/i }).click();
  await page.getByRole('button', { name: /nova auditoria/i }).click();
  await page.getByLabel('Tipo de auditoria').selectOption('SGSO');
  await page.getByLabel('Embarcação').selectOption('Nautilus IX');
  await page.setInputFiles('input[type="file"]', 'tests/files/evidencia.jpg');
  await page.getByRole('button', { name: /registrar/i }).click();

  await expect(page.getByText('Auditoria registrada com sucesso')).toBeVisible();
});