import { test, expect } from "@playwright/test";

/**
 * PATCH 608.1 - Travel Intelligence Fallback Tests
 * 
 * Tests to verify API fallback behavior when Skyscanner/external APIs fail
 */

test.describe("Travel Intelligence API Fallback", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the travel page
    await page.goto("/travel");
  });

  test("should display fallback data when API fails", async ({ page }) => {
    // Abort all API calls to simulate API failure
    await page.route("**/functions/v1/amadeus-search", route => route.abort());
    
    // Wait for the page to load
    await page.waitForLoadState("networkidle");
    
    // Click on the flights tab
    await page.click("button:has-text(\"Voos\")");
    
    // Wait for flight search form
    await page.waitForSelector("input[placeholder*=\"origem\"]", { timeout: 5000 });
    
    // Fill in search form
    await page.fill("input[placeholder*=\"origem\"]", "SP");
    await page.fill("input[placeholder*=\"destino\"]", "Paris");
    
    // Set departure date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    await page.fill("input[type=\"date\"]", dateStr);
    
    // Click search button
    await page.click("button:has-text(\"Buscar\")");
    
    // Wait for results or error
    await page.waitForTimeout(2000);
    
    // Check that error message is displayed using more semantic selectors
    const errorBox = page.locator("[role=\"alert\"]").first();
    await expect(errorBox).toBeVisible({ timeout: 10000 });
    
    // Verify error message contains fallback text
    const errorText = await errorBox.textContent();
    expect(errorText).toMatch(/Falha|demonstração|Aviso/i);
  });

  test("should display fallback hotels when API fails", async ({ page }) => {
    // Abort all hotel API calls
    await page.route("**/functions/v1/amadeus-search", route => {
      if (route.request().postDataJSON()?.searchType === "hotels") {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    // Click on the hotels tab
    await page.click("button:has-text(\"Hotéis\")");
    
    // Wait for hotel search form
    await page.waitForSelector("input[placeholder*=\"Destino\"]", { timeout: 5000 });
    
    // Fill in search form
    await page.fill("input[placeholder*=\"Destino\"]", "Rio de Janeiro");
    
    // Click search button
    await page.click("button:has-text(\"Buscar Hotéis\")");
    
    // Wait for results or error
    await page.waitForTimeout(2000);
    
    // Check that error message or fallback data is displayed
    const errorOrResults = await page.locator("[role=\"alert\"], .space-y-4").first().isVisible();
    expect(errorOrResults).toBeTruthy();
  });

  test("should handle timeout gracefully", async ({ page }) => {
    // Delay API response to simulate timeout
    await page.route("**/functions/v1/amadeus-search", async route => {
      // Delay for 11 seconds (just over 10s timeout threshold)
      await new Promise(resolve => setTimeout(resolve, 11000));
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: false, error: "Timeout" })
      });
    });
    
    // Click on flights tab
    await page.click("button:has-text(\"Voos\")");
    
    // Fill in search form quickly
    await page.fill("input[placeholder*=\"origem\"]", "GRU");
    await page.fill("input[placeholder*=\"destino\"]", "GIG");
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill("input[type=\"date\"]", tomorrow.toISOString().split("T")[0]);
    
    // Click search
    await page.click("button:has-text(\"Buscar\")");
    
    // Should show timeout message within reasonable time
    await page.waitForSelector("[role=\"alert\"]", { timeout: 15000 });
    
    const alert = page.locator("[role=\"alert\"]");
    const alertText = await alert.textContent();
    expect(alertText).toMatch(/tempo|timeout|demonstração/i);
  });

  test("should cache search results", async ({ page }) => {
    // Allow first request to succeed
    let callCount = 0;
    await page.route("**/functions/v1/amadeus-search", route => {
      callCount++;
      if (callCount === 1) {
        // First call succeeds
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
            data: {
              data: [
                {
                  id: "test-flight-1",
                  itineraries: [{
                    segments: [{
                      carrierCode: "LA",
                      number: "3511",
                      departure: { iataCode: "GRU", at: "2024-01-15T08:30:00" },
                      arrival: { iataCode: "SDU", at: "2024-01-15T09:45:00" }
                    }],
                    duration: "PT1H15M"
                  }],
                  price: { total: "299" }
                }
              ]
            }
          })
        });
      } else {
        // Subsequent calls should not happen (cached)
        route.abort();
      }
    });
    
    // Perform first search
    await page.click("button:has-text(\"Voos\")");
    await page.fill("input[placeholder*=\"origem\"]", "GRU");
    await page.fill("input[placeholder*=\"destino\"]", "SDU");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill("input[type=\"date\"]", tomorrow.toISOString().split("T")[0]);
    await page.click("button:has-text(\"Buscar\")");
    
    // Wait for results
    await page.waitForTimeout(2000);
    
    // Perform same search again
    await page.click("button:has-text(\"Buscar\")");
    await page.waitForTimeout(1000);
    
    // Should show "Resultados do cache" toast
    const toast = page.locator("text=cache").first();
    await expect(toast).toBeVisible({ timeout: 5000 });
  });

  test("should validate input fields", async ({ page }) => {
    // Click on flights tab
    await page.click("button:has-text(\"Voos\")");
    
    // Try to search without filling required fields
    await page.click("button:has-text(\"Buscar\")");
    
    // Should show validation error
    await page.waitForTimeout(500);
    const validationError = page.locator("text=obrigatórios").first();
    await expect(validationError).toBeVisible({ timeout: 5000 });
  });

  test("should work on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate and interact
    await page.click("button:has-text(\"Voos\")");
    
    // Should be able to see and interact with search form
    const originInput = page.locator("input[placeholder*=\"origem\"]");
    await expect(originInput).toBeVisible();
    
    // Form should be responsive
    await originInput.fill("GRU");
    await page.fill("input[placeholder*=\"destino\"]", "GIG");
    
    // Search button should be accessible
    const searchButton = page.locator("button:has-text(\"Buscar\")");
    await expect(searchButton).toBeVisible();
  });
});
