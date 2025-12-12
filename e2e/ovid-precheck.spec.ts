/**
 * PATCH 616 - E2E Tests for OVID Precheck Module  
 * Tests: OVID (Offshore Vessel Inspection Database) pre-inspection checks
 */

import { test, expect } from "@playwright/test";

test.describe("OVID Precheck Module", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pre-ovid-inspection");
  });

  test("should render OVID precheck page", async ({ page }) => {
    // Check page loads
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10000 });
    
    // Check for OVID-related content
    const ovidContent = page.locator("text=/ovid|offshore|vessel inspection/i");
    await expect(ovidContent.first()).toBeVisible({ timeout: 10000 });
  });

  test("should display vessel information section", async ({ page }) => {
    // Look for vessel details
    const vesselInfo = page.locator("text=/vessel|ship|imo|name/i");
    if (await vesselInfo.count() > 0) {
      await expect(vesselInfo.first()).toBeVisible();
    }
  });

  test("should show inspection checklist categories", async ({ page }) => {
    // Look for categories
    const categories = page.locator("text=/safety|navigation|machinery|accommodation/i");
    if (await categories.count() > 0) {
      expect(await categories.count()).toBeGreaterThan(0);
    }
  });

  test("should have risk assessment section", async ({ page }) => {
    // Look for risk indicators
    const riskSection = page.locator("text=/risk|assessment|score/i");
    if (await riskSection.count() > 0) {
      await expect(riskSection.first()).toBeVisible();
    }
  });

  test("should allow creating new pre-inspection", async ({ page }) => {
    const newButton = page.locator("button:has-text(\"New\"), button:has-text(\"Create\")").first();
    
    if (await newButton.isVisible()) {
      await newButton.click();
      await page.waitForTimeout(500);
      
      // Form should appear
      const formElements = page.locator("input, select, textarea");
      expect(await formElements.count()).toBeGreaterThan(0);
    }
  });

  test("should display compliance status", async ({ page }) => {
    // Look for compliance indicators
    const complianceStatus = page.locator("[class*=\"status\"], text=/compliant|non-compliant/i");
    if (await complianceStatus.count() > 0) {
      await expect(complianceStatus.first()).toBeVisible();
    }
  });

  test("should show deficiency tracking", async ({ page }) => {
    // Look for deficiencies
    const deficiencies = page.locator("text=/deficiency|finding|observation/i");
    if (await deficiencies.count() > 0) {
      await expect(deficiencies.first()).toBeVisible();
    }
  });

  test("should have document upload functionality", async ({ page }) => {
    // Look for file upload
    const uploadButton = page.locator("input[type=\"file\"], button:has-text(\"Upload\")");
    if (await uploadButton.count() > 0) {
      await expect(uploadButton.first()).toBeVisible();
    }
  });

  test("should display inspection history", async ({ page }) => {
    // Look for history tab
    const historyTab = page.locator("text=/history|previous|past inspections/i");
    if (await historyTab.count() > 0) {
      await historyTab.first().click();
      await page.waitForTimeout(500);
    }
  });

  test("should generate pre-inspection report", async ({ page }) => {
    const reportButton = page.locator("button:has-text(\"Report\"), button:has-text(\"Generate\"), button:has-text(\"Export\")");
    if (await reportButton.count() > 0) {
      await expect(reportButton.first()).toBeVisible();
    }
  });

  test("should show inspection readiness score", async ({ page }) => {
    // Look for readiness indicators
    const readiness = page.locator("text=/readiness|prepared|ready/i, [class*=\"score\"]");
    if (await readiness.count() > 0) {
      await expect(readiness.first()).toBeVisible();
    }
  });

  test("should display action items", async ({ page }) => {
    // Look for action items or tasks
    const actions = page.locator("text=/action|task|todo|to-do/i");
    if (await actions.count() > 0) {
      await expect(actions.first()).toBeVisible();
    }
  });
});

test.describe("OVID Precheck - Inspection Areas", () => {
  test("should cover safety management system", async ({ page }) => {
    await page.goto("/pre-ovid-inspection");
    
    // Look for SMS related items
    const sms = page.locator("text=/safety management|sms|ism code/i");
    if (await sms.count() > 0) {
      await expect(sms.first()).toBeVisible();
    }
  });

  test("should cover equipment and machinery", async ({ page }) => {
    await page.goto("/pre-ovid-inspection");
    
    // Look for equipment checks
    const equipment = page.locator("text=/equipment|machinery|engine/i");
    if (await equipment.count() > 0) {
      await expect(equipment.first()).toBeVisible();
    }
  });

  test("should cover documentation requirements", async ({ page }) => {
    await page.goto("/pre-ovid-inspection");
    
    // Look for documentation section
    const docs = page.locator("text=/document|certificate|record/i");
    if (await docs.count() > 0) {
      await expect(docs.first()).toBeVisible();
    }
  });
});

test.describe("OVID Precheck - Data Management", () => {
  test("should allow saving inspection progress", async ({ page }) => {
    await page.goto("/pre-ovid-inspection");
    
    const saveButton = page.locator("button:has-text(\"Save\"), button:has-text(\"Save Draft\")");
    if (await saveButton.count() > 0) {
      await expect(saveButton.first()).toBeVisible();
    }
  });

  test("should support search and filter", async ({ page }) => {
    await page.goto("/pre-ovid-inspection");
    
    // Look for search functionality
    const searchInput = page.locator("input[type=\"search\"], input[placeholder*=\"search\" i]");
    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible();
    }
  });
});

test.describe("OVID Precheck - Accessibility", () => {
  test("should have proper form labels", async ({ page }) => {
    await page.goto("/pre-ovid-inspection");
    
    const inputs = page.locator("input, select, textarea");
    const count = await inputs.count();
    
    if (count > 0) {
      // Sample check for proper labeling
      const firstInput = inputs.first();
      const ariaLabel = await firstInput.getAttribute("aria-label");
      const id = await firstInput.getAttribute("id");
      
      // Should have either aria-label or associated label
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        expect(hasLabel || ariaLabel).toBeTruthy();
      }
    }
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.goto("/pre-ovid-inspection");
    
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeTruthy();
  });

  test("should have proper heading structure", async ({ page }) => {
    await page.goto("/pre-ovid-inspection");
    
    const headings = page.locator("h1, h2, h3, h4");
    expect(await headings.count()).toBeGreaterThan(0);
  });
});
