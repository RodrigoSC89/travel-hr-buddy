/**
 * E2E Tests for LSA & FFA Inspections Module
 */

import { test, expect } from "@playwright/test";

test.describe("LSA & FFA Inspections Module", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the module (adjust URL as needed for your routing)
    await page.goto("/lsa-ffa-inspections");
  });

  test("should display the dashboard with statistics", async ({ page }) => {
    // Check if dashboard is visible
    await expect(page.locator("h1")).toContainText("LSA & FFA Inspections");
    
    // Check if stats cards are present
    await expect(page.locator("text=Total Inspections")).toBeVisible();
    await expect(page.locator("text=Average Score")).toBeVisible();
    await expect(page.locator("text=Critical Issues")).toBeVisible();
    await expect(page.locator("text=Compliance Status")).toBeVisible();
  });

  test("should show new inspection buttons", async ({ page }) => {
    // Check for action buttons
    await expect(page.locator("button:has-text(\"New LSA Inspection\")")).toBeVisible();
    await expect(page.locator("button:has-text(\"New FFA Inspection\")")).toBeVisible();
  });

  test("should navigate between tabs", async ({ page }) => {
    // Check if tabs are present
    await expect(page.locator("[role=\"tablist\"]")).toBeVisible();
    
    // Check Overview tab
    await page.click("text=Overview");
    await expect(page.locator("text=Recent Inspections")).toBeVisible();
    
    // Check LSA tab
    await page.click("text=LSA");
    await expect(page.locator("text=Life-Saving Appliances")).toBeVisible();
    
    // Check FFA tab
    await page.click("text=FFA");
    await expect(page.locator("text=Fire-Fighting Appliances")).toBeVisible();
  });

  test("should open inspection form when clicking new LSA inspection", async ({ page }) => {
    // Click new LSA inspection button
    await page.click("button:has-text(\"New LSA Inspection\")");
    
    // Wait for form tab to be active
    await page.waitForSelector("[role=\"tabpanel\"]", { state: "visible" });
    
    // Check if form elements are present
    await expect(page.locator("label:has-text(\"Inspector Name\")")).toBeVisible();
    await expect(page.locator("label:has-text(\"Inspection Date\")")).toBeVisible();
    await expect(page.locator("label:has-text(\"Inspection Type\")")).toBeVisible();
  });

  test("should display checklist items for LSA inspection", async ({ page }) => {
    // Create new LSA inspection
    await page.click("button:has-text(\"New LSA Inspection\")");
    
    // Navigate to checklist tab
    await page.click("text=Checklist");
    
    // Check if checklist categories are present
    await expect(page.locator("text=Lifeboats")).toBeVisible();
    await expect(page.locator("text=Life Rafts")).toBeVisible();
    await expect(page.locator("text=Life Jackets")).toBeVisible();
  });

  test("should allow adding issues", async ({ page }) => {
    // Create new inspection
    await page.click("button:has-text(\"New LSA Inspection\")");
    
    // Navigate to issues tab
    await page.click("text=Issues");
    
    // Click add issue button
    await page.click("button:has-text(\"Add Issue\")");
    
    // Check if issue form is present
    await expect(page.locator("textarea[placeholder*=\"Describe the issue\"]")).toBeVisible();
  });

  test("should show AI insights tab", async ({ page }) => {
    // Create new inspection
    await page.click("button:has-text(\"New LSA Inspection\")");
    
    // Navigate to AI tab
    await page.click("text=AI Insights");
    
    // Check if AI component is present
    await expect(page.locator("text=AI-Powered Insights")).toBeVisible();
  });

  test("should show signature tab", async ({ page }) => {
    // Create new inspection
    await page.click("button:has-text(\"New LSA Inspection\")");
    
    // Navigate to signature tab
    await page.click("text=Signature");
    
    // Check if signature canvas is present
    await expect(page.locator("text=Inspector Signature")).toBeVisible();
    await expect(page.locator("button:has-text(\"Clear Signature\")")).toBeVisible();
  });

  test("should calculate and display compliance score", async ({ page }) => {
    // Create new inspection
    await page.click("button:has-text(\"New LSA Inspection\")");
    
    // Check if score is displayed
    await expect(page.locator("text=Compliance Score")).toBeVisible();
    
    // Score should be visible with percentage
    const scoreElement = page.locator("text=/\\d+%/").first();
    await expect(scoreElement).toBeVisible();
  });

  test("should show compliance status badge", async ({ page }) => {
    // Check overview tab for compliance status
    await page.click("text=Overview");
    
    // Compliance status should be visible
    await expect(page.locator("text=Compliance Status")).toBeVisible();
  });

  test("should allow switching between LSA and FFA inspection types", async ({ page }) => {
    // Create new inspection
    await page.click("button:has-text(\"New LSA Inspection\")");
    
    // Switch to FFA
    await page.click("[role=\"combobox\"]");
    await page.click("text=FFA - Fire-Fighting Appliances");
    
    // Navigate to checklist to verify FFA categories
    await page.click("text=Checklist");
    
    // Check for FFA-specific categories
    await expect(page.locator("text=Fire Extinguishers")).toBeVisible();
  });

  test("should validate required fields before saving", async ({ page }) => {
    // Create new inspection
    await page.click("button:has-text(\"New LSA Inspection\")");
    
    // Try to save without inspector name
    await page.click("button:has-text(\"Save Inspection\")");
    
    // Should show validation message (implementation depends on your validation)
    // This is a placeholder - adjust based on actual implementation
  });

  test("should show cancel button in form", async ({ page }) => {
    // Create new inspection
    await page.click("button:has-text(\"New LSA Inspection\")");
    
    // Check for cancel button
    await expect(page.locator("button:has-text(\"Cancel\")")).toBeVisible();
  });

  test("should display export PDF button for saved inspections", async ({ page }) => {
    // Navigate to overview
    await page.click("text=Overview");
    
    // If there are inspections, check for download button
    const downloadButtons = page.locator("button >> svg[class*=\"lucide-download\"]");
    const count = await downloadButtons.count();
    
    if (count > 0) {
      await expect(downloadButtons.first()).toBeVisible();
    }
  });
});
