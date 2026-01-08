import { test, expect } from "@playwright/test";

/**
 * E2E Tests - Critical Routes Validation
 * Verifies all critical routes load without errors
 * 
 * Run with: npx playwright test e2e/critical-routes.spec.ts
 */

// Critical routes that must always work
const CRITICAL_ROUTES = [
  // Core Navigation
  { path: "/", name: "Home" },
  { path: "/central-comando", name: "Central de Comando" },
  { path: "/central-comando/visao-geral", name: "Visão Geral" },
  { path: "/central-comando/operacoes", name: "Operações" },
  { path: "/dashboard", name: "Dashboard" },
  
  // Operations
  { path: "/tracking", name: "Fleet Tracking" },
  { path: "/route-optimizer", name: "Route Optimizer" },
  { path: "/mission-command", name: "Mission Command" },
  
  // HR & Crew
  { path: "/human-resources", name: "Human Resources" },
  { path: "/crew", name: "Crew Management" },
  
  // Documents
  { path: "/documents", name: "Documents Hub" },
  
  // AI & Automation
  { path: "/ai-assistant", name: "AI Assistant" },
  { path: "/ai-hub", name: "AI Hub" },
  
  // Compliance
  { path: "/compliance-hub", name: "Compliance Hub" },
  
  // Admin
  { path: "/admin/control-panel", name: "Admin Control Panel" },
  { path: "/dev-routes", name: "Dev Routes Dashboard" },
];

// Secondary routes - important but less critical
const SECONDARY_ROUTES = [
  { path: "/settings", name: "Settings" },
  { path: "/integrations", name: "Integrations" },
  { path: "/telemetria", name: "Telemetry" },
  { path: "/maintenance-command", name: "Maintenance" },
  { path: "/voyage-command", name: "Voyage Command" },
  { path: "/finance-command", name: "Finance" },
];

test.describe("Critical Routes - Load Validation", () => {
  // Collect console errors
  let consoleErrors: string[] = [];
  
  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
  });

  for (const route of CRITICAL_ROUTES) {
    test(`${route.name} (${route.path}) loads successfully`, async ({ page }) => {
      // Navigate to route
      const response = await page.goto(route.path, { 
        waitUntil: "domcontentloaded",
        timeout: 30000 
      });
      
      // Check HTTP status
      expect(response?.status()).toBeLessThan(400);
      
      // Wait for initial render
      await page.waitForLoadState("networkidle", { timeout: 15000 });
      
      // Verify page has content
      const body = await page.locator("body").textContent();
      expect(body).toBeTruthy();
      expect(body!.length).toBeGreaterThan(50);
      
      // Check for React error boundaries
      const errorBoundary = await page.locator('text="Something went wrong"').count();
      expect(errorBoundary).toBe(0);
      
      // Filter critical console errors (ignore known warnings)
      const ignoredPatterns = [
        "favicon",
        "sourcemap",
        "ResizeObserver",
        "React DevTools",
        "Warning:",
        "Download the React"
      ];
      
      const criticalErrors = consoleErrors.filter(err => 
        !ignoredPatterns.some(pattern => err.includes(pattern))
      );
      
      // Log any errors for debugging
      if (criticalErrors.length > 0) {
        console.log(`Errors on ${route.path}:`, criticalErrors);
      }
      
      expect(criticalErrors.length).toBe(0);
    });
  }
});

test.describe("Secondary Routes - Basic Validation", () => {
  for (const route of SECONDARY_ROUTES) {
    test(`${route.name} (${route.path}) returns valid response`, async ({ page }) => {
      const response = await page.goto(route.path, { 
        waitUntil: "domcontentloaded",
        timeout: 30000 
      });
      
      // Accept 2xx and 3xx responses
      expect(response?.status()).toBeLessThan(400);
      
      // Verify body exists
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test.describe("Navigation Flow", () => {
  test("Can navigate between critical pages", async ({ page }) => {
    // Start at home
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Navigate to Central de Comando
    await page.goto("/central-comando/visao-geral");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
    
    // Navigate to Documents
    await page.goto("/documents");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
    
    // Navigate to AI Assistant
    await page.goto("/ai-assistant");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
  });

  test("Unknown routes redirect gracefully", async ({ page }) => {
    await page.goto("/this-route-definitely-does-not-exist-xyz123");
    await page.waitForLoadState("networkidle");
    
    // Should either show 404 page or redirect to home
    await expect(page.locator("body")).toBeVisible();
    const bodyText = await page.locator("body").textContent();
    expect(bodyText!.length).toBeGreaterThan(0);
  });
});

test.describe("Mobile Responsiveness", () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test("Central de Comando loads on mobile", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/central-comando/visao-geral");
    await page.waitForLoadState("networkidle", { timeout: 20000 });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 15 seconds on mobile
    expect(loadTime).toBeLessThan(15000);
    
    // Verify content is visible
    await expect(page.locator("body")).toBeVisible();
  });

  test("Dashboard loads on mobile without infinite loop", async ({ page }) => {
    // Navigate to dashboard
    await page.goto("/dashboard");
    
    // Wait for content (not networkidle to avoid loop detection issues)
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);
    
    // Check for loading indicators - should not be stuck
    const loadingSpinners = await page.locator('[class*="animate-spin"]').count();
    
    // After 3 seconds, there should be minimal or no loading spinners
    // (some components may still have refresh spinners)
    expect(loadingSpinners).toBeLessThan(5);
    
    // Verify actual content loaded
    const bodyContent = await page.locator("body").textContent();
    expect(bodyContent!.length).toBeGreaterThan(100);
  });
});

test.describe("Performance Benchmarks", () => {
  test("Critical routes load within acceptable time", async ({ page }) => {
    const benchmarks: Record<string, number> = {};
    
    for (const route of ["/", "/central-comando/visao-geral", "/dashboard"]) {
      const startTime = Date.now();
      
      await page.goto(route);
      await page.waitForLoadState("networkidle", { timeout: 30000 });
      
      benchmarks[route] = Date.now() - startTime;
    }
    
    // Log benchmarks
    console.log("Route Load Times:", benchmarks);
    
    // Each route should load in under 10 seconds
    for (const [route, time] of Object.entries(benchmarks)) {
      expect(time, `${route} took too long`).toBeLessThan(10000);
    }
  });
});
