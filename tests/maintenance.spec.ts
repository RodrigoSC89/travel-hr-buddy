import { test, expect } from '@playwright/test';

test.describe('Maintenance Planner Module', () => {
  test('loads maintenance planner and shows active jobs', async ({ page }) => {
    await page.goto('/maintenance/planner');
    await expect(page.getByText('Manutenções Ativas')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Nova OS/i })).toBeVisible();
  });

  test('create new maintenance job', async ({ page }) => {
    await page.goto('/maintenance/planner');
    await page.getByRole('button', { name: /Nova OS/i }).click();
    await page.fill('#equipment', 'Gerador Diesel');
    await page.fill('#reason', 'Substituição preventiva');
    await page.click('text=Salvar');
    await expect(page.getByText('OS criada com sucesso')).toBeVisible({ timeout: 5000 });
  });

  test('displays maintenance history', async ({ page }) => {
    await page.goto('/maintenance/history');
    await expect(page.getByText('Histórico de Manutenção')).toBeVisible({ timeout: 10000 });
  });

  test('shows maintenance analytics', async ({ page }) => {
    await page.goto('/maintenance/analytics');
    await expect(page.getByText('Analytics de Manutenção')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('PEO-DP Module', () => {
  test('loads PEO-DP dashboard', async ({ page }) => {
    await page.goto('/safety/peo-dp');
    await expect(page.getByText(/PEO-DP|Dynamic Positioning/i)).toBeVisible({ timeout: 10000 });
  });

  test('create new emergency plan', async ({ page }) => {
    await page.goto('/safety/peo-dp');
    await page.getByRole('button', { name: /Novo Plano|New Plan/i }).click();
    await expect(page.getByText(/Criar Plano|Create Plan/i)).toBeVisible({ timeout: 5000 });
  });

  test('displays simulation page', async ({ page }) => {
    await page.goto('/safety/peo-dp/simulation');
    await expect(page.getByText(/Simulação|Simulation/i)).toBeVisible({ timeout: 10000 });
  });

  test('shows logs page', async ({ page }) => {
    await page.goto('/safety/peo-dp/logs');
    await expect(page.getByText(/Logs|Histórico/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('SGSO Module', () => {
  test('loads SGSO dashboard', async ({ page }) => {
    await page.goto('/compliance/sgso');
    await expect(page.getByText(/SGSO|Segurança/i)).toBeVisible({ timeout: 10000 });
  });

  test('navigate to audits page', async ({ page }) => {
    await page.goto('/compliance/sgso/audit');
    await expect(page.getByText(/Audit|Auditoria/i)).toBeVisible({ timeout: 10000 });
  });

  test('displays findings page', async ({ page }) => {
    await page.goto('/compliance/sgso/findings');
    await expect(page.getByText(/Findings|Constatações/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('ISM Audit Module', () => {
  test('loads ISM audit dashboard', async ({ page }) => {
    await page.goto('/audits/ism');
    await expect(page.getByText(/ISM|Auditorias/i)).toBeVisible({ timeout: 10000 });
  });

  test('create new audit', async ({ page }) => {
    await page.goto('/audits/ism');
    await page.getByRole('button', { name: /Nova Auditoria|New Audit/i }).click();
    await page.fill('#tipo', 'Interna');
    await page.click('text=Salvar');
    await expect(page.getByText(/criada com sucesso|created successfully/i)).toBeVisible({ timeout: 5000 });
  });

  test('displays findings page', async ({ page }) => {
    await page.goto('/audits/ism/findings');
    await expect(page.getByText(/Findings|Não Conformidades/i)).toBeVisible({ timeout: 10000 });
  });

  test('shows checklists page', async ({ page }) => {
    await page.goto('/audits/ism/checklists');
    await expect(page.getByText(/Checklist/i)).toBeVisible({ timeout: 10000 });
  });
});
