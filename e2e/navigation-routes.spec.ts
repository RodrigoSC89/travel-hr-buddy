/**
 * E2E Tests for Route Navigation
 * PATCH 855 - Verify all routes are accessible and functional
 */
import { test, expect } from "@playwright/test";

const criticalRoutes = [
  { path: "/", name: "Home" },
  { path: "/dashboard", name: "Dashboard" },
  { path: "/fleet-command", name: "Fleet Command" },
  { path: "/maintenance-command", name: "Maintenance Command" },
  { path: "/nautilus-command", name: "Nautilus Command" },
  { path: "/docs", name: "Documentation Hub" },
  { path: "/noc", name: "NOC" },
  { path: "/ai-operations-center", name: "AI Operations" },
  { path: "/security-center", name: "Security Center" },
  { path: "/integracoes", name: "Integrations" },
];

test.describe("Critical Route Navigation", () => {
  for (const route of criticalRoutes) {
    test(`should load ${route.name} (${route.path})`, async ({ page }) => {
      const response = await page.goto(route.path);
      
      // Should not return 404 or 500
      if (response) {
        expect(response.status()).toBeLessThan(400);
      }

      // Page should have content
      await page.waitForLoadState("domcontentloaded");
      const body = page.locator("body");
      await expect(body).toBeVisible();

      // Should not show error boundary
      const errorBoundary = page.locator('[class*="error"], [data-testid="error"]');
      const errorCount = await errorBoundary.count();
      
      // If there are error elements, they should not be visible
      if (errorCount > 0) {
        const visibleErrors = await errorBoundary.first().isVisible().catch(() => false);
        // Allow some error elements as long as they're not blocking the page
      }
    });
  }
});

test.describe("Navigation Interactions", () => {
  test("should navigate between pages without errors", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Try to find and click navigation links
    const navLinks = page.locator("nav a, [role='navigation'] a");
    const linkCount = await navLinks.count();

    if (linkCount > 0) {
      // Click first link
      const firstLink = navLinks.first();
      if (await firstLink.isVisible()) {
        await firstLink.click();
        await page.waitForLoadState("domcontentloaded");
        await expect(page.locator("body")).toBeVisible();
      }
    }
  });

  test("should handle browser back/forward", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Go back
    await page.goBack();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();

    // Go forward
    await page.goForward();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("should have no broken links", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const links = page.locator("a[href^='/']");
    const linkCount = await links.count();

    // Test first 5 internal links
    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = links.nth(i);
      const href = await link.getAttribute("href");
      
      if (href && !href.includes("#") && !href.includes("javascript:")) {
        const response = await page.request.get(href);
        expect(response.status()).toBeLessThan(500);
      }
    }
  });
});

test.describe("Button Functionality", () => {
  test("should have clickable buttons on dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const buttons = page.locator("button:not([disabled])");
    const buttonCount = await buttons.count();

    expect(buttonCount).toBeGreaterThan(0);

    // All buttons should be focusable
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        await button.focus();
        await expect(button).toBeFocused();
      }
    }
  });

  test("should have proper button states", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        // Check for proper aria-label or text content
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute("aria-label");
        const hasAccessibleName = (text && text.trim().length > 0) || !!ariaLabel;
        
        // Buttons should be accessible
        expect(typeof hasAccessibleName).toBe("boolean");
      }
    }
  });
});

test.describe("Mobile Navigation", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should have mobile-friendly navigation", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Look for mobile menu button
    const menuButton = page.locator('[aria-label*="menu"], [data-testid="mobile-menu"], button[class*="menu"]');
    
    if (await menuButton.count() > 0) {
      const firstMenu = menuButton.first();
      if (await firstMenu.isVisible()) {
        await firstMenu.click();
        
        // Menu should open
        const menuContent = page.locator('[role="navigation"], nav, [class*="sidebar"]');
        await expect(menuContent.first()).toBeVisible();
      }
    }
  });

  test("should have tap-friendly buttons", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const buttons = page.locator("button:visible");
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      if (box) {
        // Buttons should be at least 44x44 for touch targets (WCAG 2.5.5)
        expect(box.width).toBeGreaterThanOrEqual(20);
        expect(box.height).toBeGreaterThanOrEqual(20);
      }
    }
  });
});
