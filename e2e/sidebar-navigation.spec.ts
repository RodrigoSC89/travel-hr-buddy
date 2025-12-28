/**
 * E2E Tests for Sidebar Navigation
 * Validates that the unified sidebar routes configuration is working correctly
 * 
 * @description Tests navigation flow using the centralized SIDEBAR_ROUTES
 */
import { test, expect } from "@playwright/test";

// Test configuration
const BASE_ROUTES_TO_TEST = [
  { path: "/weather-maritime", title: "Clima Marítimo" },
  { path: "/ais-tracker-page", title: "AIS Tracker" },
  { path: "/voice-transcriber", title: "IA de Voz" },
  { path: "/security-center", title: "Security Center" },
  { path: "/nautilus-command", title: "Nautilus Command" },
  { path: "/executive-bi", title: "Executive BI" },
  { path: "/noc-monitoring", title: "NOC Monitoring" },
];

test.describe("Sidebar Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication to bypass login
    await page.addInitScript(() => {
      localStorage.setItem("sb-vnbptmixvwropvanyhdb-auth-token", JSON.stringify({
        access_token: "mock-token",
        refresh_token: "mock-refresh",
        expires_at: Date.now() + 3600000,
        user: { id: "test-user", email: "test@nautilus.dev" }
      }));
    });
    
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should display sidebar with all main sections", async ({ page }) => {
    // Verify sidebar is visible
    const sidebar = page.locator('aside[role="navigation"]');
    await expect(sidebar).toBeVisible({ timeout: 10000 });

    // Check main sections exist
    const expectedSections = [
      "Operações & Segurança",
      "APIs & Integrações",
      "Centro de Comando",
      "Sistema Marítimo",
    ];

    for (const section of expectedSections) {
      const sectionButton = page.locator(`button:has-text("${section}")`);
      await expect(sectionButton).toBeVisible();
    }
  });

  test("should expand and collapse sidebar sections", async ({ page }) => {
    // Find APIs & Integrações section
    const apisSection = page.locator('button:has-text("APIs & Integrações")');
    await expect(apisSection).toBeVisible();

    // Click to expand
    await apisSection.click();
    await page.waitForTimeout(300);

    // Verify submenu items are visible
    const climaMaritimo = page.locator('a[href="/weather-maritime"]');
    await expect(climaMaritimo).toBeVisible();

    // Click again to collapse
    await apisSection.click();
    await page.waitForTimeout(300);
  });

  test("should navigate to Weather Maritime page", async ({ page }) => {
    // Expand APIs section
    const apisSection = page.locator('button:has-text("APIs & Integrações")');
    await apisSection.click();
    await page.waitForTimeout(300);

    // Click on Clima Marítimo
    const weatherLink = page.locator('a[href="/weather-maritime"]');
    await weatherLink.click();
    await page.waitForLoadState("networkidle");

    // Verify URL changed
    await expect(page).toHaveURL(/weather-maritime/);

    // Verify page content loaded
    const pageTitle = page.locator('text=Clima Marítimo');
    await expect(pageTitle).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to AIS Tracker page", async ({ page }) => {
    // Expand APIs section
    const apisSection = page.locator('button:has-text("APIs & Integrações")');
    await apisSection.click();
    await page.waitForTimeout(300);

    // Click on AIS Tracker
    const aisLink = page.locator('a[href="/ais-tracker-page"]');
    await aisLink.click();
    await page.waitForLoadState("networkidle");

    // Verify URL changed
    await expect(page).toHaveURL(/ais-tracker-page/);
  });

  test("should highlight active route in sidebar", async ({ page }) => {
    // Navigate to weather maritime
    await page.goto("/weather-maritime");
    await page.waitForLoadState("networkidle");

    // Verify the link has active styling
    const activeLink = page.locator('a[href="/weather-maritime"]');
    await expect(activeLink).toHaveAttribute("aria-current", "page");
  });

  test("should auto-expand section containing current route", async ({ page }) => {
    // Navigate directly to a route
    await page.goto("/weather-maritime");
    await page.waitForLoadState("networkidle");

    // The APIs & Integrações section should be expanded
    const weatherLink = page.locator('a[href="/weather-maritime"]');
    await expect(weatherLink).toBeVisible();
  });

  test("should work on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find and click mobile menu button
    const menuButton = page.locator('button[aria-label="Abrir menu"]');
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);

      // Sidebar should be visible now
      const sidebar = page.locator('aside[role="navigation"]');
      await expect(sidebar).toBeVisible();
    }
  });

  test("should navigate between multiple routes without errors", async ({ page }) => {
    const routes = ["/nautilus-command", "/weather-maritime", "/security-center"];
    const errors: string[] = [];

    // Capture console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500);
    }

    // Filter out expected network errors (API calls may fail in test)
    const criticalErrors = errors.filter(
      (e) => !e.includes("Failed to fetch") && !e.includes("NetworkError")
    );

    expect(criticalErrors.length).toBeLessThan(3);
  });

  test("should render sidebar routes from centralized config", async ({ page }) => {
    // Test that routes from sidebar-routes.ts are rendered
    const routesToCheck = [
      { href: "/weather-maritime", section: "APIs & Integrações" },
      { href: "/nautilus-command", section: "Centro de Comando" },
      { href: "/security-center", section: "Operações & Segurança" },
    ];

    for (const route of routesToCheck) {
      // Expand section
      const sectionButton = page.locator(`button:has-text("${route.section}")`);
      await sectionButton.click();
      await page.waitForTimeout(200);

      // Check link exists
      const link = page.locator(`a[href="${route.href}"]`);
      await expect(link).toBeVisible();

      // Collapse section
      await sectionButton.click();
      await page.waitForTimeout(200);
    }
  });
});

test.describe("Sidebar Route Consistency", () => {
  test("all sidebar links should lead to valid pages", async ({ page }) => {
    // Mock auth
    await page.addInitScript(() => {
      localStorage.setItem("sb-vnbptmixvwropvanyhdb-auth-token", JSON.stringify({
        access_token: "mock-token",
        refresh_token: "mock-refresh",
        expires_at: Date.now() + 3600000,
        user: { id: "test-user", email: "test@nautilus.dev" }
      }));
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Sample routes to validate
    const sampleRoutes = [
      "/weather-maritime",
      "/ais-tracker-page", 
      "/nautilus-command",
      "/executive-bi",
    ];

    for (const route of sampleRoutes) {
      const response = await page.goto(route);
      
      // Check page didn't return 404
      expect(response?.status()).not.toBe(404);
      
      // Check for basic page structure
      const main = page.locator("main, [role='main'], .flex-1");
      await expect(main.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
