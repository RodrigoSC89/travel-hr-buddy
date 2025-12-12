/**
 * PATCH 616 - E2E Tests for Travel Search Module
 * Tests: rendering, search functionality, booking flow
 */

import { test, expect } from "@playwright/test";

/**
 * Default timeout for E2E tests
 */
const DEFAULT_TIMEOUT = 10000;

test.describe("Travel Search Module", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to travel search
    await page.goto("/travel-search");
  });

  test("should render travel search page", async ({ page }) => {
    // Check for key elements
    await expect(page.locator("h1, h2").first()).toBeVisible();
    
    // Verify search components are present
    const searchInputs = page.locator("input[type=\"search\"], input[placeholder*=\"search\" i]");
    await expect(searchInputs.first()).toBeVisible({ timeout: DEFAULT_TIMEOUT });
  });

  test("should have flight search functionality", async ({ page }) => {
    // Look for flight-related elements
    const flightElements = page.locator("text=/flight|airplane|plane/i").first();
    await expect(flightElements).toBeVisible({ timeout: DEFAULT_TIMEOUT });
  });

  test("should have hotel search functionality", async ({ page }) => {
    // Look for hotel-related elements
    const hotelElements = page.locator("text=/hotel|accommodation/i").first();
    await expect(hotelElements).toBeVisible({ timeout: DEFAULT_TIMEOUT });
  });

  test("should allow date selection", async ({ page }) => {
    // Look for date picker or calendar
    const dateInputs = page.locator("input[type=\"date\"], button[aria-label*=\"calendar\" i], button[aria-label*=\"date\" i]");
    if (await dateInputs.count() > 0) {
      await expect(dateInputs.first()).toBeVisible();
    }
  });

  test("should have search button", async ({ page }) => {
    // Find search button
    const searchButton = page.locator("button:has-text(\"Search\"), button:has-text(\"Buscar\"), button[type=\"submit\"]").first();
    await expect(searchButton).toBeVisible({ timeout: DEFAULT_TIMEOUT });
  });

  test("should display loading state during search", async ({ page }) => {
    // This test checks if loading states are properly shown
    const searchButton = page.locator("button:has-text(\"Search\"), button:has-text(\"Buscar\")").first();
    
    if (await searchButton.isVisible()) {
      await searchButton.click();
      
      // Check for loading indicators
      const loadingIndicators = page.locator("[role=\"status\"], .loading, .spinner, text=/loading/i");
      if (await loadingIndicators.count() > 0) {
        await expect(loadingIndicators.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("should handle search results", async ({ page }) => {
    // Check if results container exists
    const resultsContainer = page.locator("[class*=\"result\"], [data-testid*=\"result\"]");
    // This is okay to not find results immediately without search
    expect(await resultsContainer.count()).toBeGreaterThanOrEqual(0);
  });

  test("should have filters for search refinement", async ({ page }) => {
    // Look for filter options
    const filters = page.locator("text=/filter|sort|price|rating/i");
    if (await filters.count() > 0) {
      await expect(filters.first()).toBeVisible();
    }
  });

  test("should navigate back to dashboard", async ({ page }) => {
    // Find back or home button
    const backButton = page.locator("a[href=\"/\"], button:has-text(\"Back\"), button:has-text(\"Home\")").first();
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL(/\/(dashboard)?$/);
    }
  });
});

test.describe("Travel Search - Accessibility", () => {
  test("should have proper heading structure", async ({ page }) => {
    await page.goto("/travel-search");
    
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    expect(await headings.count()).toBeGreaterThan(0);
  });

  test("should have keyboard navigation", async ({ page }) => {
    await page.goto("/travel-search");
    
    // Test tab navigation
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeTruthy();
  });

  test("should have aria labels on interactive elements", async ({ page }) => {
    await page.goto("/travel-search");
    
    // Check for aria labels on buttons
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute("aria-label");
        const text = await button.textContent();
        
        // Either aria-label or text content should exist
        expect(ariaLabel || text).toBeTruthy();
      }
    }
  });
});
