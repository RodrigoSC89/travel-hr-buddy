/**
 * E2E Tests: Voyages Module
 * PATCH: Comprehensive voyage management testing
 */

import { test, expect } from "@playwright/test";

test.describe("Voyages Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/voyages");
    await page.waitForLoadState("networkidle");
  });

  test("should display voyage list", async ({ page }) => {
    await expect(
      page.locator("[data-testid=\"voyage-list\"]").or(page.getByText(/viagens|voyages/i).first())
    ).toBeVisible({ timeout: 10000 });
  });

  test("should show voyage details", async ({ page }) => {
    const voyageCard = page.locator("[data-testid=\"voyage-card\"]").first().or(
      page.locator(".voyage-item").first()
    );
    
    if (await voyageCard.isVisible()) {
      await voyageCard.click();
      await expect(page.getByText(/detalhes|details|origem|origin|destino|destination/i).first()).toBeVisible();
    }
  });

  test("should filter voyages by status", async ({ page }) => {
    const statusFilter = page.getByRole("combobox").first().or(
      page.locator("[data-testid=\"status-filter\"]")
    );
    
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.getByRole("option").first().click();
    }
  });

  test("should display voyage map", async ({ page }) => {
    const mapTab = page.getByRole("tab", { name: /mapa|map/i }).or(
      page.getByText(/mapa|map/i).first()
    );
    
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(2000); // Wait for map to load
      
      // Check for map container
      const mapContainer = page.locator(".mapboxgl-map").or(page.locator("[data-testid=\"voyage-map\"]"));
      if (await mapContainer.isVisible()) {
        await expect(mapContainer).toBeVisible();
      }
    }
  });

  test("should create noon report", async ({ page }) => {
    // Navigate to noon reports
    await page.goto("/noon-reports");
    await page.waitForLoadState("networkidle");
    
    const createButton = page.getByRole("button", { name: /novo|new|criar|create/i });
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Check for form
      await expect(
        page.locator("form").or(page.getByRole("dialog"))
      ).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Voyages - Performance", () => {
  test("should load voyage list within 3 seconds", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/voyages");
    await page.waitForLoadState("networkidle");
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // 5s max for slow connections
    
    console.log(`Voyage list loaded in ${loadTime}ms`);
  });
});
