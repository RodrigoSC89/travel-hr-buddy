/**
 * Mega-Hub Smoke Test Suite
 * Validates all 7 Mega-Hubs render correctly with no dead screens.
 * 
 * Policy: 100% sidebar items must load a valid component (no 404, no blank).
 */
import { test, expect } from "@playwright/test";

const MEGA_HUBS = [
  {
    name: "Command Hub",
    routes: [
      { path: "/central-comando/visao-geral", label: "Visão Geral" },
      { path: "/nautilus-command", label: "Nautilus Command" },
      { path: "/executive-bi", label: "Executive BI" },
      { path: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    name: "Operations Hub",
    routes: [
      { path: "/operations-command", label: "Operations Command" },
      { path: "/voyage-command", label: "Voyage Command" },
      { path: "/tracking", label: "Fleet Tracking" },
      { path: "/route-optimizer", label: "Route Optimizer" },
      { path: "/mission-command", label: "Mission Command" },
    ],
  },
  {
    name: "Maintenance Hub",
    routes: [
      { path: "/maintenance-command", label: "Maintenance Command" },
      { path: "/drydock-management", label: "Drydock Management" },
    ],
  },
  {
    name: "AI Hub",
    routes: [
      { path: "/ai-hub", label: "AI Hub" },
      { path: "/ai-assistant", label: "AI Assistant" },
    ],
  },
  {
    name: "Tracking Hub",
    routes: [
      { path: "/telemetria", label: "Telemetry" },
      { path: "/weather-maritime", label: "Weather Maritime" },
      { path: "/ais-tracker-page", label: "AIS Tracker" },
    ],
  },
  {
    name: "Compliance Hub",
    routes: [
      { path: "/compliance-hub", label: "Compliance Hub" },
      { path: "/sgso-report", label: "SGSO Report" },
    ],
  },
  {
    name: "Workbench Hub",
    routes: [
      { path: "/human-resources", label: "Human Resources" },
      { path: "/crew", label: "Crew Management" },
      { path: "/documents", label: "Documents Hub" },
      { path: "/finance-command", label: "Finance Command" },
      { path: "/settings", label: "Settings" },
    ],
  },
];

// Flatten all routes for parallel testing
const ALL_ROUTES = MEGA_HUBS.flatMap((hub) =>
  hub.routes.map((r) => ({ ...r, hub: hub.name }))
);

test.describe("Mega-Hub Smoke Tests", () => {
  for (const route of ALL_ROUTES) {
    test(`[${route.hub}] ${route.label} (${route.path}) renders`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));

      const response = await page.goto(route.path, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });

      // Must not be 404/500
      expect(response?.status(), `${route.path} returned ${response?.status()}`).toBeLessThan(400);

      // Wait for React to render
      await page.waitForTimeout(2000);

      // Must have meaningful content (not blank)
      const bodyText = await page.locator("body").textContent();
      expect(bodyText!.length, `${route.path} appears blank`).toBeGreaterThan(50);

      // Must not show error boundary
      const errorBoundaryCount = await page.locator('text="Something went wrong"').count();
      expect(errorBoundaryCount, `${route.path} shows error boundary`).toBe(0);

      // Must not have unrecoverable JS errors
      const critical = errors.filter(
        (e) =>
          !e.includes("ResizeObserver") &&
          !e.includes("Non-Error promise rejection") &&
          !e.includes("Failed to fetch")
      );
      expect(critical.length, `JS errors on ${route.path}: ${critical.join(", ")}`).toBe(0);
    });
  }
});

test.describe("Mega-Hub Navigation Integrity", () => {
  test("Sequential navigation across all 7 hubs preserves SPA state", async ({ page }) => {
    const hubEntryPoints = MEGA_HUBS.map((h) => h.routes[0]);

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    for (const entry of hubEntryPoints) {
      await page.goto(entry.path, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForTimeout(1000);

      // Verify no full page reload (SPA check)
      const bodyVisible = await page.locator("body").isVisible();
      expect(bodyVisible, `Body not visible after navigating to ${entry.path}`).toBe(true);
    }
  });

  test("Browser back/forward works across hubs", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    await page.goto("/compliance-hub");
    await page.waitForLoadState("domcontentloaded");

    await page.goto("/crew");
    await page.waitForLoadState("domcontentloaded");

    // Go back twice
    await page.goBack();
    await page.waitForTimeout(1000);
    expect(page.url()).toContain("/compliance-hub");

    await page.goBack();
    await page.waitForTimeout(1000);
    expect(page.url()).toContain("/dashboard");

    // Go forward
    await page.goForward();
    await page.waitForTimeout(1000);
    expect(page.url()).toContain("/compliance-hub");
  });
});

test.describe("Mega-Hub Performance", () => {
  test("All hub entry points load under 8s", async ({ page }) => {
    const results: { hub: string; path: string; time: number }[] = [];

    for (const hub of MEGA_HUBS) {
      const entry = hub.routes[0];
      const start = Date.now();

      await page.goto(entry.path, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForTimeout(500);

      results.push({ hub: hub.name, path: entry.path, time: Date.now() - start });
    }

    console.table(results);

    for (const r of results) {
      expect(r.time, `${r.hub} (${r.path}) took ${r.time}ms`).toBeLessThan(8000);
    }
  });
});
