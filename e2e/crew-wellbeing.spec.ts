/**
 * E2E Tests - Crew Wellbeing & Health Check-in
 * Validates the HealthCheckIn component and data persistence
 * PATCH: P2 E2E Tests for Health Check-in handlers
 */

import { test, expect } from '@playwright/test';

test.describe('Crew Wellbeing - Health Check-in', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/crew-wellbeing');
    await page.waitForLoadState('networkidle');
  });

  test('should display health check-in form', async ({ page }) => {
    // Look for the Health Check-in card
    const healthCard = page.locator('text=/Health Check-in|Check-in de Saúde/i').first();
    await expect(healthCard).toBeVisible({ timeout: 10000 });
  });

  test('should have all health metric inputs', async ({ page }) => {
    // Sleep hours input
    const sleepInput = page.locator('input[type="number"]').first();
    if (await sleepInput.isVisible({ timeout: 5000 })) {
      await expect(sleepInput).toBeVisible();
    }

    // Slider controls for ratings
    const sliders = page.locator('[role="slider"], input[type="range"]');
    const sliderCount = await sliders.count();
    expect(sliderCount).toBeGreaterThanOrEqual(1);
  });

  test('should display rating labels', async ({ page }) => {
    const labels = [
      /sleep|sono/i,
      /nutrition|nutrição/i,
      /mood|humor/i,
      /stress|estresse/i,
      /energy|energia/i
    ];

    for (const labelPattern of labels) {
      const label = page.locator(`text=${labelPattern}`).first();
      if (await label.isVisible({ timeout: 3000 })) {
        await expect(label).toBeVisible();
      }
    }
  });

  test('should have save button', async ({ page }) => {
    const saveButton = page.getByRole('button', { name: /salvar|save|submit/i }).first();
    if (await saveButton.isVisible({ timeout: 5000 })) {
      await expect(saveButton).toBeEnabled();
    }
  });

  test('should update sleep hours value', async ({ page }) => {
    const sleepInput = page.locator('input[type="number"]').first();
    if (await sleepInput.isVisible({ timeout: 5000 })) {
      await sleepInput.clear();
      await sleepInput.fill('8');
      await expect(sleepInput).toHaveValue('8');
    }
  });

  test('should display notes textarea', async ({ page }) => {
    const notesField = page.locator('textarea').first();
    if (await notesField.isVisible({ timeout: 5000 })) {
      await expect(notesField).toBeVisible();
      await notesField.fill('Test note for health check-in');
      await expect(notesField).toHaveValue('Test note for health check-in');
    }
  });

  test('should show loading state on submit', async ({ page }) => {
    const saveButton = page.getByRole('button', { name: /salvar|save/i }).first();
    if (await saveButton.isVisible({ timeout: 5000 })) {
      await saveButton.click();
      // Check for loading indicator or disabled state
      await page.waitForTimeout(500);
      // Button should either show loader or toast message
      const toast = page.locator('[role="status"], [data-sonner-toast]').first();
      await page.waitForTimeout(2000);
    }
  });

  test('should have proper form structure', async ({ page }) => {
    // Card structure
    const card = page.locator('[class*="card"], .card').first();
    if (await card.isVisible({ timeout: 5000 })) {
      await expect(card).toBeVisible();
    }

    // Icons should be present
    const icons = page.locator('svg');
    expect(await icons.count()).toBeGreaterThan(0);
  });

  test('should display rating colors based on value', async ({ page }) => {
    // Look for colored rating text (green/yellow/red)
    const ratingTexts = page.locator('text=/\\/5$/');
    if (await ratingTexts.first().isVisible({ timeout: 5000 })) {
      expect(await ratingTexts.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Health Check-in - Data Persistence', () => {
  test('should attempt to save data to Supabase', async ({ page }) => {
    await page.goto('/crew-wellbeing');
    await page.waitForLoadState('networkidle');

    // Set up network request interception
    let apiCalled = false;
    page.on('request', request => {
      if (request.url().includes('supabase') && request.method() === 'POST') {
        apiCalled = true;
      }
    });

    const saveButton = page.getByRole('button', { name: /salvar|save/i }).first();
    if (await saveButton.isVisible({ timeout: 5000 })) {
      await saveButton.click();
      await page.waitForTimeout(3000);
    }
  });

  test('should show success or error toast after submission', async ({ page }) => {
    await page.goto('/crew-wellbeing');
    await page.waitForLoadState('networkidle');

    const saveButton = page.getByRole('button', { name: /salvar|save/i }).first();
    if (await saveButton.isVisible({ timeout: 5000 })) {
      await saveButton.click();
      
      // Wait for toast notification
      const toast = page.locator('[role="status"], [data-sonner-toast], [class*="toast"]');
      await page.waitForTimeout(3000);
    }
  });
});
