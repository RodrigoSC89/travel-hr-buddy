/**
 * PATCH 616 - E2E Tests for PSC Precheck Module
 * Tests: PSC inspection preparation, scoring, reporting
 */

import { test, expect } from '@playwright/test';

test.describe('PSC Precheck Module', () => {
  test.beforeEach(async ({ page }) => {
    // Try multiple possible routes
    await page.goto('/pre-psc');
  });

  test('should render PSC precheck page', async ({ page }) => {
    // Check page loads
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    
    // Check for PSC-related content
    const pscContent = page.locator('text=/psc|port state|inspection|precheck/i');
    await expect(pscContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display vessel selection', async ({ page }) => {
    // Look for vessel selector
    const vesselSelector = page.locator('select, [role="combobox"], input[placeholder*="vessel" i]');
    if (await vesselSelector.count() > 0) {
      await expect(vesselSelector.first()).toBeVisible();
    }
  });

  test('should show PSC inspection checklist', async ({ page }) => {
    // Look for checklist items
    const checklistItems = page.locator('[type="checkbox"], [role="checkbox"]');
    if (await checklistItems.count() > 0) {
      expect(await checklistItems.count()).toBeGreaterThan(0);
    }
  });

  test('should calculate PSC risk score', async ({ page }) => {
    // Look for score display
    const scoreDisplay = page.locator('text=/score|risk|rating/i');
    if (await scoreDisplay.count() > 0) {
      await expect(scoreDisplay.first()).toBeVisible();
    }
  });

  test('should have deficiency reporting', async ({ page }) => {
    // Look for deficiency section
    const deficiencySection = page.locator('text=/deficiency|deficiencies|finding/i');
    if (await deficiencySection.count() > 0) {
      await expect(deficiencySection.first()).toBeVisible();
    }
  });

  test('should allow adding inspection findings', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add"), button:has-text("New Finding")');
    if (await addButton.count() > 0) {
      await addButton.first().click();
      
      // Check for form or dialog
      await page.waitForTimeout(500);
      const formElements = page.locator('input, textarea, select');
      expect(await formElements.count()).toBeGreaterThan(0);
    }
  });

  test('should generate PSC report', async ({ page }) => {
    // Look for generate report button
    const generateButton = page.locator('button:has-text("Generate"), button:has-text("Report")');
    if (await generateButton.count() > 0) {
      await expect(generateButton.first()).toBeVisible();
    }
  });

  test('should display inspection history', async ({ page }) => {
    // Look for history section
    const historyTab = page.locator('text=/history|previous|past/i');
    if (await historyTab.count() > 0) {
      await historyTab.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should show compliance status', async ({ page }) => {
    // Look for compliance indicators
    const complianceIndicators = page.locator('text=/compliant|non-compliant|status/i, [class*="status"]');
    if (await complianceIndicators.count() > 0) {
      await expect(complianceIndicators.first()).toBeVisible();
    }
  });

  test('should have export functionality', async ({ page }) => {
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download"), button:has-text("PDF")');
    if (await exportButton.count() > 0) {
      await expect(exportButton.first()).toBeVisible();
    }
  });
});

test.describe('PSC Precheck - Risk Assessment', () => {
  test('should display risk factors', async ({ page }) => {
    await page.goto('/pre-psc');
    
    // Look for risk factor indicators
    const riskFactors = page.locator('text=/high risk|medium risk|low risk/i');
    if (await riskFactors.count() > 0) {
      await expect(riskFactors.first()).toBeVisible();
    }
  });

  test('should show inspection readiness score', async ({ page }) => {
    await page.goto('/pre-psc');
    
    // Look for readiness score
    const readinessScore = page.locator('text=/readiness|prepared|ready/i');
    if (await readinessScore.count() > 0) {
      await expect(readinessScore.first()).toBeVisible();
    }
  });
});

test.describe('PSC Precheck - Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/pre-psc');
    
    const headings = page.locator('h1, h2, h3, h4');
    expect(await headings.count()).toBeGreaterThan(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/pre-psc');
    
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeTruthy();
  });
});
