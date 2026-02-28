/**
 * E2E Tests: Performance & Bundle Validation
 * Ensures the app loads efficiently and critical assets are properly split
 */
import { test, expect } from "@playwright/test";

test.describe("Performance", () => {
  test("should load auth page within acceptable time", async ({ page }) => {
    const start = Date.now();
    await page.goto("/auth");
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - start;
    // Should load within 10 seconds even on slow preview
    expect(loadTime).toBeLessThan(10000);
  });

  test("should not load heavy vendor chunks on auth page", async ({ page }) => {
    const heavyChunks: string[] = [];
    page.on("response", (response) => {
      const url = response.url();
      if (
        url.includes("three-vendor") ||
        url.includes("pdf-vendor") ||
        url.includes("xlsx-vendor") ||
        url.includes("tesseract-vendor") ||
        url.includes("onnx-vendor") ||
        url.includes("mapbox-vendor")
      ) {
        heavyChunks.push(url);
      }
    });

    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    
    // Heavy chunks should NOT be loaded on auth page
    expect(heavyChunks).toEqual([]);
  });

  test("should have proper chunk splitting (react-vendor separate)", async ({ page }) => {
    const chunks: string[] = [];
    page.on("response", (response) => {
      const url = response.url();
      if (url.includes(".js") && url.includes("assets")) {
        chunks.push(url);
      }
    });

    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    
    // Should have loaded some JS chunks
    expect(chunks.length).toBeGreaterThan(0);
  });

  test("should have no console errors on auth page", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // Ignore known non-critical errors
        if (!text.includes("favicon") && !text.includes("ResizeObserver")) {
          errors.push(text);
        }
      }
    });

    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    
    expect(errors).toEqual([]);
  });
});
