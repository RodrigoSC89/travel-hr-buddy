/**
 * E2E Tests - Voyage Creation Flow
 */

import { test, expect } from '@playwright/test';

test.describe('Voyage Planning E2E', () => {
  test('deve criar nova viagem', async ({ page }) => {
    await page.goto('/fleet-command');
    await page.click('[data-testid="new-voyage-btn"]');
    await page.fill('[data-testid="departure-port"]', 'Santos');
    await page.fill('[data-testid="arrival-port"]', 'Rotterdam');
    await page.click('[data-testid="save-voyage"]');
    await expect(page.locator('text=Santos')).toBeVisible();
  });
});
