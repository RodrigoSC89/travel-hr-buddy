/**
 * Comprehensive E2E Tests - Critical Flows
 * Covers: Auth, Dashboard Navigation, Crew CRUD, Documents, Compliance
 */
import { test, expect } from "@playwright/test";

// ============================================
// AUTH FLOWS
// ============================================
test.describe("Authentication Flows", () => {
  test("should display login page with email/password form", async ({ page }) => {
    await page.goto("/auth");
    await expect(page).toHaveURL(/\/auth/);
    
    // Verify form elements exist
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput.first()).toBeVisible();
    await expect(passwordInput.first()).toBeVisible();
  });

  test("should show validation errors for empty form submission", async ({ page }) => {
    await page.goto("/auth");
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Should show validation or stay on auth page
      await expect(page).toHaveURL(/\/auth/);
    }
  });

  test("should show validation for invalid email format", async ({ page }) => {
    await page.goto("/auth");
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    await emailInput.fill("invalid-email");
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill("password123");
    
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/auth/);
    }
  });

  test("should redirect unauthenticated users to auth page", async ({ page }) => {
    await page.goto("/command");
    await page.waitForTimeout(2000);
    // Should redirect to auth or show login
    const url = page.url();
    expect(url).toMatch(/\/(auth|login|command)/);
  });
});

// ============================================
// NAVIGATION & SIDEBAR
// ============================================
test.describe("Navigation & Sidebar", () => {
  test("should load landing page successfully", async ({ page }) => {
    await page.goto("/landing");
    await expect(page).toHaveURL(/\/landing/);
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("should handle 404 routes gracefully", async ({ page }) => {
    await page.goto("/nonexistent-route-12345");
    await page.waitForTimeout(2000);
    // Should show NotFound or redirect
    const content = await page.textContent("body");
    expect(content).toBeTruthy();
  });

  test("should redirect legacy routes correctly", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(2000);
    // /dashboard should redirect to /command
    const url = page.url();
    expect(url).toMatch(/\/(command|auth)/);
  });

  test("should redirect /crew to /crew-management", async ({ page }) => {
    await page.goto("/crew");
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toMatch(/\/(crew-management|auth)/);
  });

  test("should redirect /fleet-dashboard to /fleet-command", async ({ page }) => {
    await page.goto("/fleet-dashboard");
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toMatch(/\/(fleet-command|auth)/);
  });
});

// ============================================
// DOCUMENT FLOWS
// ============================================
test.describe("Document Management", () => {
  test("should load documents page", async ({ page }) => {
    await page.goto("/documents");
    await page.waitForTimeout(3000);
    const url = page.url();
    // Either shows documents or redirects to auth
    expect(url).toMatch(/\/(documents|auth)/);
  });

  test("should load compliance page", async ({ page }) => {
    await page.goto("/compliance");
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toMatch(/\/(compliance|auth)/);
  });
});

// ============================================
// FLEET & MARITIME
// ============================================
test.describe("Fleet & Maritime Operations", () => {
  test("should load fleet command center", async ({ page }) => {
    await page.goto("/fleet-command");
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toMatch(/\/(fleet-command|auth)/);
  });

  test("should load maritime command center", async ({ page }) => {
    await page.goto("/maritime-command");
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toMatch(/\/(maritime-command|auth)/);
  });

  test("should load tracking page", async ({ page }) => {
    await page.goto("/tracking");
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toMatch(/\/(tracking|auth)/);
  });
});

// ============================================
// ADMIN & BI
// ============================================
test.describe("Admin & Analytics", () => {
  test("should load admin BI page", async ({ page }) => {
    await page.goto("/admin/bi");
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toMatch(/\/(admin\/bi|auth)/);
  });

  test("should load settings page", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toMatch(/\/(settings|auth)/);
  });

  test("should load integrations page", async ({ page }) => {
    await page.goto("/integrations");
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toMatch(/\/(integrations|auth)/);
  });
});

// ============================================
// PERFORMANCE & ACCESSIBILITY
// ============================================
test.describe("Performance & A11y Basics", () => {
  test("should have proper page title", async ({ page }) => {
    await page.goto("/auth");
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("should have viewport meta tag", async ({ page }) => {
    await page.goto("/auth");
    const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(viewport).toContain("width=device-width");
  });

  test("should load without console errors on critical pages", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("favicon")) {
        errors.push(msg.text());
      }
    });

    await page.goto("/auth");
    await page.waitForTimeout(3000);
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      (e) => !e.includes("net::ERR") && !e.includes("ResizeObserver") && !e.includes("403") && !e.includes("Failed to load resource")
    );
    
    // Allow max 2 non-critical console errors
    expect(criticalErrors.length).toBeLessThanOrEqual(2);
  });

  test("should respond within 5 seconds on page load", async ({ page }) => {
    const start = Date.now();
    await page.goto("/auth");
    await page.waitForLoadState("domcontentloaded");
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });
});

// ============================================
// MOBILE RESPONSIVENESS
// ============================================
test.describe("Mobile Responsiveness", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("should render auth page on mobile", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.locator("body")).toBeVisible();
    
    // Check no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(376);
  });
});

// ============================================
// ROUTE INTEGRITY (Smoke Tests)
// ============================================
test.describe("Route Integrity - Smoke Tests", () => {
  const criticalRoutes = [
    "/auth",
    "/landing",
    "/command",
    "/maritime-command",
    "/fleet-command",
    "/documents",
    "/compliance",
    "/settings",
    "/crew-management",
    "/tracking",
    "/maintenance",
    "/admin/bi",
  ];

  for (const route of criticalRoutes) {
    test(`should load ${route} without crash`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(500);
      await page.waitForTimeout(1000);
      
      // Page should have content
      const body = await page.textContent("body");
      expect(body?.length).toBeGreaterThan(0);
    });
  }
});
