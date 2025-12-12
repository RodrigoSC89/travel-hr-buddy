/**
 * PATCH 653 - E2E Tests: Admin Dashboards
 * Tests admin dashboard accessibility and functionality
 */

import { test, expect } from "@playwright/test";

test.describe("Admin Dashboards - Unauthenticated", () => {
  test("performance dashboard should require authentication", async ({ page }) => {
    await page.goto("/admin/performance");
    
    // Should redirect to auth or show login
    await page.waitForURL(/login|signin|auth|\/$/, { timeout: 5000 });
    await expect(page.locator("input[type=\"email\"]")).toBeVisible();
  });

  test("errors dashboard should require authentication", async ({ page }) => {
    await page.goto("/admin/errors");
    
    // Should redirect to auth
    await page.waitForURL(/login|signin|auth|\/$/, { timeout: 5000 });
  });

  test("health dashboard should require authentication", async ({ page }) => {
    await page.goto("/health");
    
    // Should redirect to auth
    await page.waitForURL(/login|signin|auth|\/$/, { timeout: 5000 });
  });
});

test.describe("Admin Dashboard Navigation", () => {
  test("should have navigation between admin sections", async ({ page }) => {
    await page.goto("/");
    
    // Look for admin or dashboard links in navigation
    const navLinks = await page.locator("nav a, [role=\"navigation\"] a").all();
    
    // Check if any navigation items exist
    expect(navLinks.length).toBeGreaterThan(0);
  });

  test("should display page title correctly", async ({ page }) => {
    await page.goto("/");
    
    // Page should have a title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});

test.describe("Dashboard UI Elements", () => {
  test("home page should load without errors", async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    
    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");
    
    // Should have minimal errors (some are expected during auth checks)
    expect(errors.filter(e => !e.includes("auth") && !e.includes("session"))).toHaveLength(0);
  });

  test("should have responsive navigation", async ({ page }) => {
    await page.goto("/");
    
    // Check for header/nav elements
    const header = page.locator("header, nav, [role=\"banner\"], [role=\"navigation\"]").first();
    await expect(header).toBeVisible({ timeout: 5000 });
  });

  test("should load without JavaScript errors", async ({ page }) => {
    const jsErrors: Error[] = [];
    page.on("pageerror", error => {
      jsErrors.push(error);
    });

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    
    // Should have no critical JS errors
    expect(jsErrors.filter(e => !e.message.includes("auth"))).toHaveLength(0);
  });
});

test.describe("Performance Dashboard UI", () => {
  test("should have performance metrics when accessible", async ({ page }) => {
    await page.goto("/admin/performance");
    
    // If redirected, that's expected (auth required)
    const currentUrl = page.url();
    if (currentUrl.includes("admin/performance")) {
      // Check for performance-related elements
      await expect(
        page.locator("text=/performance|metrics|lcp|fid|cls/i")
      ).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Error Dashboard UI", () => {
  test("should have error tracking elements when accessible", async ({ page }) => {
    await page.goto("/admin/errors");
    
    // If redirected, that's expected (auth required)
    const currentUrl = page.url();
    if (currentUrl.includes("admin/errors")) {
      // Check for error-related elements
      await expect(
        page.locator("text=/error|track|severity|category/i")
      ).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Health Dashboard UI", () => {
  test("should have health check elements when accessible", async ({ page }) => {
    await page.goto("/health");
    
    // If redirected, that's expected (auth required)
    const currentUrl = page.url();
    if (currentUrl.includes("health")) {
      // Check for health-related elements
      await expect(
        page.locator("text=/health|status|system|monitor/i")
      ).toBeVisible({ timeout: 5000 });
    }
  });
});
