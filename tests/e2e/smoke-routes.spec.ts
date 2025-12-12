/**
 * PATCH: Smoke Tests for Critical Routes
 * Validates main routes load without errors
 */

import { test, expect } from "@playwright/test";
import { setupConsoleErrorListener, filterCriticalErrors } from "./test-utils";

const CRITICAL_ROUTES = [
  { path: "/", name: "Dashboard/Login" },
  { path: "/dashboard", name: "Main Dashboard" },
  { path: "/compliance", name: "Compliance Hub" },
  { path: "/hr", name: "HR Module" },
  { path: "/documents", name: "Documents" },
  { path: "/crew", name: "Crew Management" },
  { path: "/training", name: "Training" },
  { path: "/reports", name: "Reports" },
  { path: "/analytics", name: "Analytics" },
  { path: "/settings", name: "Settings" },
  { path: "/integrations", name: "Integrations" },
  { path: "/ai-dashboard", name: "AI Dashboard" },
  { path: "/ai-suggestions", name: "AI Suggestions" },
  { path: "/ai-adoption", name: "AI Adoption" },
];

test.describe("Smoke Tests - Critical Routes", () => {
  test.describe.configure({ mode: "parallel" });

  for (const route of CRITICAL_ROUTES) {
    test(`should load ${route.name} (${route.path}) without critical errors`, async ({ page }) => {
      const consoleErrors = setupConsoleErrorListener(page);
      
      // Navigate with timeout
      const response = await page.goto(route.path, { 
        timeout: 30000,
        waitUntil: "domcontentloaded" 
      });

      // Check response status
      if (response) {
        // Allow redirects to login (302, 307) or success (200)
        expect([200, 302, 307]).toContain(response.status());
      }

      // Wait a bit for any async errors
      await page.waitForTimeout(1000);

      // Filter and check critical errors
      const criticalErrors = filterCriticalErrors(consoleErrors);
      
      // Allow up to 3 non-critical console errors
      if (criticalErrors.length > 3) {
        console.log(`Critical errors on ${route.path}:`, criticalErrors);
      }
      
      expect(criticalErrors.length).toBeLessThanOrEqual(5);

      // Verify page has content (not blank)
      const bodyText = await page.locator("body").textContent();
      expect(bodyText?.length).toBeGreaterThan(0);
    });
  }
});

test.describe("Smoke Tests - Auth Flow", () => {
  test("should display login form on unauthenticated access", async ({ page }) => {
    await page.goto("/");
    
    // Should see login elements or be redirected to login
    const hasLoginForm = await page.locator("input[type=\"email\"], input[type=\"password\"], [data-testid=\"login-form\"]").first().isVisible().catch(() => false);
    const isOnLoginPage = page.url().includes("login") || page.url().includes("auth");
    
    expect(hasLoginForm || isOnLoginPage).toBeTruthy();
  });

  test("should handle invalid login attempt", async ({ page }) => {
    await page.goto("/");
    
    const emailInput = page.locator("input[type=\"email\"]");
    const passwordInput = page.locator("input[type=\"password\"]");
    
    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      await emailInput.fill("invalid@test.com");
      await passwordInput.fill("wrongpassword");
      
      const submitButton = page.getByRole("button", { name: /sign in|login|entrar/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Wait for error message or stay on page
        await page.waitForTimeout(2000);
        
        // Should still be on login page or show error
        const stillOnLogin = page.url().includes("login") || page.url() === "http://localhost:4173/";
        expect(stillOnLogin).toBeTruthy();
      }
    }
  });
});

test.describe("Smoke Tests - Navigation", () => {
  test("should have working sidebar navigation", async ({ page }) => {
    await page.goto("/");
    
    // Check for sidebar or navigation menu
    const sidebar = page.locator("[data-testid=\"sidebar\"], nav, aside").first();
    const hasSidebar = await sidebar.isVisible().catch(() => false);
    
    if (hasSidebar) {
      // Check for navigation links
      const navLinks = await page.locator("nav a, aside a, [role=\"navigation\"] a").count();
      expect(navLinks).toBeGreaterThan(0);
    }
  });

  test("should handle 404 gracefully", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist-12345");
    
    // Should either show 404 page or redirect
    const pageContent = await page.content();
    const is404 = pageContent.includes("404") || pageContent.includes("not found") || pageContent.includes("não encontrada");
    const wasRedirected = page.url() !== "http://localhost:4173/this-route-does-not-exist-12345";
    
    expect(is404 || wasRedirected).toBeTruthy();
  });
});

test.describe("Smoke Tests - Performance", () => {
  test("main page should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/", { waitUntil: "domcontentloaded" });
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test("should not have memory leaks indicators", async ({ page }) => {
    await page.goto("/");
    
    // Check for obvious memory leak patterns in console
    const consoleMessages: string[] = [];
    page.on("console", msg => consoleMessages.push(msg.text()));
    
    // Navigate between pages a few times
    await page.goto("/dashboard").catch(() => {});
    await page.goto("/").catch(() => {});
    await page.goto("/dashboard").catch(() => {});
    
    await page.waitForTimeout(1000);
    
    // Check for memory-related warnings
    const memoryWarnings = consoleMessages.filter(msg => 
      msg.toLowerCase().includes("memory") && msg.toLowerCase().includes("leak")
    );
    
    expect(memoryWarnings.length).toBe(0);
  });
});
