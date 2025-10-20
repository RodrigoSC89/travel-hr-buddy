import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Verificação de contraste e acessibilidade @a11y", () => {
  const routes = [
    { path: "/dashboard", name: "Dashboard" },
    { path: "/dp-intelligence", name: "DP Intelligence" },
    { path: "/peo-dp", name: "PEO-DP" },
  ];

  for (const route of routes) {
    test(`${route.name} deve ter contraste mínimo 4.5:1`, async ({ page }) => {
      // Navigate to the route
      await page.goto(`http://localhost:5173${route.path}`);
      
      // Wait for content to load
      await page.waitForLoadState("networkidle");

      // Run axe accessibility tests focused on color contrast
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .include("body")
        .analyze();

      // Filter for color contrast violations
      const contrastViolations = accessibilityScanResults.violations.filter(
        (violation) =>
          violation.id.includes("color-contrast") ||
          violation.tags.includes("color-contrast")
      );

      // Expect no color contrast violations
      expect(contrastViolations, `Color contrast violations found on ${route.name}`).toHaveLength(0);

      // Log all violations for debugging if there are any
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`Accessibility violations on ${route.name}:`, 
          JSON.stringify(accessibilityScanResults.violations, null, 2)
        );
      }

      // Expect compliance with WCAG 2.1 AA
      expect(accessibilityScanResults.violations.length, 
        `WCAG 2.1 AA violations found on ${route.name}`
      ).toBe(0);
    });
  }

  test("Verificar contraste de tokens de cores personalizadas", async ({ page }) => {
    // Create a test page with our custom color tokens
    await page.goto("about:blank");
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { background: #0f172a; }
            .text-base { color: #f1f5f9; }
            .text-muted { color: #cbd5e1; }
            .text-subtle { color: #94a3b8; }
            .bg-surface { background: #1e293b; }
            .bg-elevated { background: #334155; }
            .alert-warning { color: #ca8a04; background: #0f172a; }
            .alert-error { color: #dc2626; background: #0f172a; }
            .alert-success { color: #059669; background: #0f172a; }
          </style>
        </head>
        <body>
          <div class="text-base">Base text with high contrast</div>
          <div class="text-muted">Muted text with 7:1 contrast</div>
          <div class="text-subtle">Subtle text with 4.5:1 minimum</div>
          <div class="bg-surface text-base">Surface background with base text</div>
          <div class="bg-elevated text-base">Elevated background with base text</div>
          <div class="alert-warning">Warning message</div>
          <div class="alert-error">Error message</div>
          <div class="alert-success">Success message</div>
        </body>
      </html>
    `);

    // Run axe on our custom color test page
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2aa", "wcag21aa"])
      .analyze();

    // Expect no contrast violations
    const contrastIssues = results.violations.filter(
      (v) => v.id === "color-contrast"
    );
    
    expect(contrastIssues, "Custom color tokens should have sufficient contrast").toHaveLength(0);
  });
});
