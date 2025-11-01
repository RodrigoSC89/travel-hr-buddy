import { Page } from "@playwright/test";

/**
 * Shared utilities for E2E tests - PATCH 549
 */

/**
 * Filters out non-critical console errors
 * @param errors Array of console error messages
 * @returns Array of critical errors only
 */
export function filterCriticalErrors(errors: string[]): string[] {
  return errors.filter(error => 
    !error.includes("favicon") && 
    !error.includes("manifest") &&
    !error.toLowerCase().includes("warning") &&
    !error.includes("DevTools") &&
    !error.includes("ResizeObserver") // Known benign error
  );
}

/**
 * Sets up console error listener for a page
 * @param page Playwright page instance
 * @returns Array that will be populated with console errors
 */
export function setupConsoleErrorListener(page: Page): string[] {
  const consoleErrors: string[] = [];
  
  page.on("console", msg => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });
  
  return consoleErrors;
}

/**
 * Sets up page error listener for JavaScript runtime errors
 * @param page Playwright page instance
 * @returns Array that will be populated with page errors
 */
export function setupPageErrorListener(page: Page): string[] {
  const jsErrors: string[] = [];
  
  page.on("pageerror", error => {
    jsErrors.push(error.message);
  });
  
  return jsErrors;
}

/**
 * Mock authentication by setting localStorage token
 * @param page Playwright page instance
 */
export async function mockAuthentication(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.setItem("auth-token", "mock-token");
  });
}

/**
 * Wait for network idle with timeout
 * @param page Playwright page instance
 * @param timeout Timeout in milliseconds (default: 10000)
 */
export async function waitForNetworkIdle(page: Page, timeout: number = 10000): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout });
}

/**
 * Check if page loaded without critical errors
 * @param consoleErrors Array of console errors
 * @param maxCriticalErrors Maximum number of critical errors allowed (default: 3)
 * @returns Object with hasErrors and criticalErrors
 */
export function validatePageLoad(consoleErrors: string[], maxCriticalErrors: number = 3): {
  hasErrors: boolean;
  criticalErrors: string[];
} {
  const criticalErrors = filterCriticalErrors(consoleErrors);
  
  return {
    hasErrors: criticalErrors.length > maxCriticalErrors,
    criticalErrors
  };
}
