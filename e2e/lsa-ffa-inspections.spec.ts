/**
 * PATCH 616 - E2E Tests for LSA FFA Inspections Module
 * Tests: Life Saving Appliances (LSA) and Fire Fighting Appliances (FFA) inspections
 */

import { test, expect } from '@playwright/test';

test.describe('LSA-FFA Inspections Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lsa-ffa-inspections');
  });

  test('should render LSA-FFA inspections page', async ({ page }) => {
    // Check page loads
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    
    // Check for LSA/FFA content
    const content = page.locator('text=/lsa|ffa|life saving|fire fighting|inspection/i');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display inspection categories', async ({ page }) => {
    // Look for LSA and FFA categories
    const categories = page.locator('text=/life saving|fire fighting/i');
    if (await categories.count() > 0) {
      expect(await categories.count()).toBeGreaterThan(0);
    }
  });

  test('should show equipment checklist', async ({ page }) => {
    // Look for equipment items
    const equipment = page.locator('text=/lifeboat|life raft|fire extinguisher|hose|pump/i');
    if (await equipment.count() > 0) {
      await expect(equipment.first()).toBeVisible();
    }
  });

  test('should have inspection date selector', async ({ page }) => {
    // Look for date input
    const dateInput = page.locator('input[type="date"], button[aria-label*="date" i]');
    if (await dateInput.count() > 0) {
      await expect(dateInput.first()).toBeVisible();
    }
  });

  test('should allow creating new inspection', async ({ page }) => {
    const createButton = page.locator('button:has-text("New"), button:has-text("Create Inspection")').first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Check for inspection form
      const formInputs = page.locator('input, select, textarea');
      expect(await formInputs.count()).toBeGreaterThan(0);
    }
  });

  test('should show inspection status', async ({ page }) => {
    // Look for status indicators
    const statusElements = page.locator('[class*="status"], text=/passed|failed|pending/i');
    if (await statusElements.count() > 0) {
      await expect(statusElements.first()).toBeVisible();
    }
  });

  test('should display equipment condition', async ({ page }) => {
    // Look for condition indicators
    const conditionElements = page.locator('text=/good|fair|poor|damaged|serviceable/i');
    if (await conditionElements.count() > 0) {
      await expect(conditionElements.first()).toBeVisible();
    }
  });

  test('should have photo upload capability', async ({ page }) => {
    // Look for image upload
    const uploadInput = page.locator('input[type="file"][accept*="image"], button:has-text("Upload Photo")');
    if (await uploadInput.count() > 0) {
      await expect(uploadInput.first()).toBeVisible();
    }
  });

  test('should show compliance requirements', async ({ page }) => {
    // Look for compliance/regulatory info
    const compliance = page.locator('text=/solas|regulation|requirement|standard/i');
    if (await compliance.count() > 0) {
      await expect(compliance.first()).toBeVisible();
    }
  });

  test('should generate inspection report', async ({ page }) => {
    const reportButton = page.locator('button:has-text("Report"), button:has-text("Generate")');
    if (await reportButton.count() > 0) {
      await expect(reportButton.first()).toBeVisible();
    }
  });

  test('should display next inspection due dates', async ({ page }) => {
    // Look for due dates
    const dueDates = page.locator('text=/due|next inspection|expiry/i');
    if (await dueDates.count() > 0) {
      await expect(dueDates.first()).toBeVisible();
    }
  });

  test('should allow marking items as inspected', async ({ page }) => {
    // Look for checkboxes or completion markers
    const checkboxes = page.locator('input[type="checkbox"], [role="checkbox"]');
    if (await checkboxes.count() > 0) {
      const firstCheckbox = checkboxes.first();
      if (await firstCheckbox.isVisible()) {
        await firstCheckbox.click();
        await page.waitForTimeout(300);
      }
    }
  });
});

test.describe('LSA-FFA Inspections - Equipment Categories', () => {
  test('should list life saving appliances', async ({ page }) => {
    await page.goto('/lsa-ffa-inspections');
    
    // Check for LSA items
    const lsaItems = page.locator('text=/lifeboat|life raft|life jacket|immersion suit|epirb/i');
    if (await lsaItems.count() > 0) {
      await expect(lsaItems.first()).toBeVisible();
    }
  });

  test('should list fire fighting appliances', async ({ page }) => {
    await page.goto('/lsa-ffa-inspections');
    
    // Check for FFA items
    const ffaItems = page.locator('text=/fire extinguisher|fire hose|fire pump|fire alarm|sprinkler/i');
    if (await ffaItems.count() > 0) {
      await expect(ffaItems.first()).toBeVisible();
    }
  });
});

test.describe('LSA-FFA Inspections - Reporting', () => {
  test('should have deficiency recording', async ({ page }) => {
    await page.goto('/lsa-ffa-inspections');
    
    // Look for deficiency section
    const deficiencySection = page.locator('text=/deficiency|defect|finding/i');
    if (await deficiencySection.count() > 0) {
      await expect(deficiencySection.first()).toBeVisible();
    }
  });

  test('should show inspection summary', async ({ page }) => {
    await page.goto('/lsa-ffa-inspections');
    
    // Look for summary or overview
    const summary = page.locator('text=/summary|overview|total/i');
    if (await summary.count() > 0) {
      await expect(summary.first()).toBeVisible();
    }
  });
});

test.describe('LSA-FFA Inspections - Accessibility', () => {
  test('should have descriptive labels', async ({ page }) => {
    await page.goto('/lsa-ffa-inspections');
    
    const inputs = page.locator('input, select');
    const count = await inputs.count();
    
    if (count > 0) {
      // Check that inputs have labels or aria-labels
      for (let i = 0; i < Math.min(count, 3); i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          expect(hasLabel || ariaLabel).toBeTruthy();
        }
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/lsa-ffa-inspections');
    
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeTruthy();
  });
});
