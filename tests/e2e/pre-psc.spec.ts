/**
 * E2E Tests for Pre-PSC Module
 * Tests the Pre-Port State Control inspection workflow
 */

import { test, expect } from "@playwright/test";

test.describe("Pre-PSC Module", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Pre-PSC dashboard
    await page.goto("/compliance/pre-psc");
  });

  test("should display Pre-PSC dashboard", async ({ page }) => {
    // Check if dashboard loads
    await expect(page.getByRole("heading", { name: /Pre-Port State Control/i })).toBeVisible();
    
    // Check stats cards are visible
    await expect(page.getByText("Total Inspections")).toBeVisible();
    await expect(page.getByText("Average Score")).toBeVisible();
    await expect(page.getByText("Critical Items")).toBeVisible();
    await expect(page.getByText("Readiness Status")).toBeVisible();
  });

  test("should show new inspection button", async ({ page }) => {
    const newButton = page.getByRole("button", { name: /New Inspection/i });
    await expect(newButton).toBeVisible();
    await expect(newButton).toBeEnabled();
  });

  test("should switch between tabs", async ({ page }) => {
    // Check Overview tab
    await page.getByRole("tab", { name: /Overview/i }).click();
    await expect(page.getByText(/What is Pre-PSC/i)).toBeVisible();

    // Check Form tab
    await page.getByRole("tab", { name: /Inspection Form/i }).click();
    await expect(page.getByRole("button", { name: /Start New Inspection/i })).toBeVisible();

    // Check History tab
    await page.getByRole("tab", { name: /History/i }).click();
    await expect(page.getByText(/Inspection History/i)).toBeVisible();
  });

  test("should start new inspection", async ({ page }) => {
    // Click new inspection button
    await page.getByRole("button", { name: /New Inspection/i }).click();
    
    // Should switch to form tab
    await expect(page.getByText("Pre-PSC Inspection Form")).toBeVisible();
    
    // Check required fields are present
    await expect(page.getByLabel(/Inspector Name/i)).toBeVisible();
    await expect(page.getByLabel(/Port\/Country/i)).toBeVisible();
    await expect(page.getByLabel(/Inspection Date/i)).toBeVisible();
  });

  test("should fill inspection form", async ({ page }) => {
    // Start new inspection
    await page.getByRole("button", { name: /New Inspection/i }).click();
    
    // Fill in inspector details
    await page.getByLabel(/Inspector Name/i).fill("Test Inspector");
    await page.getByLabel(/Port\/Country/i).fill("Singapore");
    
    // Check progress bar exists
    await expect(page.getByText(/Completion Progress/i)).toBeVisible();
    
    // Check save buttons are present
    await expect(page.getByRole("button", { name: /Save Draft/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Submit Inspection/i })).toBeVisible();
  });

  test("should display checklist categories", async ({ page }) => {
    // Start new inspection
    await page.getByRole("button", { name: /New Inspection/i }).click();
    
    // Check for expected categories
    const categories = [
      "Certificates & Documentation",
      "Fire Safety",
      "Life Saving Appliances",
      "Navigation",
      "MARPOL",
      "ISM Code",
    ];
    
    for (const category of categories) {
      await expect(page.getByText(category)).toBeVisible();
    }
  });

  test("should validate inspector name is required", async ({ page }) => {
    // Start new inspection
    await page.getByRole("button", { name: /New Inspection/i }).click();
    
    // Try to save without inspector name
    await page.getByRole("button", { name: /Save Draft/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/Inspector name is required/i)).toBeVisible();
  });

  test("should disable submit button until form is complete", async ({ page }) => {
    // Start new inspection
    await page.getByRole("button", { name: /New Inspection/i }).click();
    
    // Fill inspector name
    await page.getByLabel(/Inspector Name/i).fill("Test Inspector");
    
    // Submit button should be disabled (0% completion)
    const submitButton = page.getByRole("button", { name: /Submit Inspection/i });
    await expect(submitButton).toBeDisabled();
    
    // Check message
    await expect(page.getByText(/Complete all items to submit/i)).toBeVisible();
  });

  test("should update checklist item status", async ({ page }) => {
    // Start new inspection
    await page.getByRole("button", { name: /New Inspection/i }).click();
    
    // Find first status select
    const firstStatusSelect = page.locator("button[role=\"combobox\"]").first();
    await firstStatusSelect.click();
    
    // Select compliant
    await page.getByRole("option", { name: /Compliant/i }).click();
    
    // Check if badge updates
    await expect(page.getByText("compliant")).toBeVisible();
  });
});

test.describe("Pre-PSC Accessibility", () => {
  test("should have accessible form labels", async ({ page }) => {
    await page.goto("/compliance/pre-psc");
    await page.getByRole("button", { name: /New Inspection/i }).click();
    
    // Check form accessibility
    await expect(page.getByLabel(/Inspector Name/i)).toBeVisible();
    await expect(page.getByLabel(/Port\/Country/i)).toBeVisible();
    await expect(page.getByLabel(/Inspection Date/i)).toBeVisible();
  });

  test("should have keyboard navigation", async ({ page }) => {
    await page.goto("/compliance/pre-psc");
    
    // Tab through interactive elements
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: /New Inspection/i })).toBeFocused();
  });

  test("should have proper ARIA labels", async ({ page }) => {
    await page.goto("/compliance/pre-psc");
    
    // Check for role attributes
    const tabs = page.getByRole("tablist");
    await expect(tabs).toBeVisible();
    
    const buttons = page.getByRole("button");
    await expect(buttons.first()).toBeVisible();
  });
});
