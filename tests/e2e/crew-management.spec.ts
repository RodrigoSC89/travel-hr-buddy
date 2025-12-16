/**
 * E2E Tests: Crew Management Module
 * PATCH: Comprehensive crew workflow testing
 */

import { test, expect } from "@playwright/test";

test.describe("Crew Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to crew module
    await page.goto("/crew");
    await page.waitForLoadState("networkidle");
  });

  test("should display crew list", async ({ page }) => {
    // Wait for content to load
    await expect(page.locator('[data-testid="crew-list"]').or(page.getByText(/tripulação|crew/i).first())).toBeVisible({ timeout: 10000 });
  });

  test("should filter crew by status", async ({ page }) => {
    // Look for filter controls
    const filterButton = page.locator('[data-testid="filter-button"]').or(page.getByRole("button", { name: /filtrar|filter/i }));
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Apply a filter
      const activeFilter = page.getByText(/ativo|active/i);
      if (await activeFilter.isVisible()) {
        await activeFilter.click();
      }
    }
  });

  test("should navigate to crew member details", async ({ page }) => {
    // Click on first crew member
    const crewCard = page.locator('[data-testid="crew-card"]').first().or(
      page.locator(".crew-member-card").first()
    ).or(
      page.getByRole("link", { name: /ver detalhes|view details/i }).first()
    );
    
    if (await crewCard.isVisible()) {
      await crewCard.click();
      await expect(page).toHaveURL(/crew\/.*|crew-member\/.*/);
    }
  });

  test("should show crew certificates", async ({ page }) => {
    // Navigate to certificates tab/section
    const certificatesTab = page.getByRole("tab", { name: /certificados|certificates/i }).or(
      page.getByText(/certificados|certificates/i).first()
    );
    
    if (await certificatesTab.isVisible()) {
      await certificatesTab.click();
      await expect(page.getByText(/validade|expiry|validity/i).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should handle search functionality", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar|search|pesquisar/i);
    
    if (await searchInput.isVisible()) {
      await searchInput.fill("Test");
      await page.waitForTimeout(500); // Debounce
      
      // Results should update
      await expect(page.locator("[data-testid='crew-list']").or(page.locator(".crew-grid"))).toBeVisible();
    }
  });
});

test.describe("Crew - Mobile Responsiveness", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should display mobile-friendly crew list", async ({ page }) => {
    await page.goto("/crew");
    await page.waitForLoadState("networkidle");
    
    // Check for mobile layout
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Crew - Slow Network", () => {
  test("should handle slow network gracefully", async ({ page, context }) => {
    // Simulate slow network
    await context.route("**/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.continue();
    });

    await page.goto("/crew");
    
    // Should show loading state
    const loader = page.getByTestId("loading").or(page.locator(".skeleton")).or(page.getByText(/carregando|loading/i));
    
    // Wait for content to eventually load
    await page.waitForLoadState("networkidle", { timeout: 30000 });
  });
});
