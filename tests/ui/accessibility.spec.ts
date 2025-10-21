import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("UI Accessibility Tests", () => {
  const criticalRoutes = [
    { path: "/dashboard", name: "Dashboard" },
    { path: "/dp-intelligence", name: "DP Intelligence" },
    { path: "/peo-dp", name: "PEO-DP" },
  ];

  for (const route of criticalRoutes) {
    test(`${route.name} should meet WCAG 2.1 AA standards`, async ({ page }) => {
      // Navigate to the route
      await page.goto(route.path);

      // Wait for content to load
      await page.waitForLoadState("networkidle");

      // Run comprehensive accessibility tests
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      // Expect no violations
      expect(
        accessibilityScanResults.violations,
        `WCAG 2.1 AA violations found on ${route.name}: ${JSON.stringify(accessibilityScanResults.violations, null, 2)}`
      ).toHaveLength(0);
    });

    test(`${route.name} should have proper color contrast`, async ({ page }) => {
      // Navigate to the route
      await page.goto(route.path);

      // Wait for content to load
      await page.waitForLoadState("networkidle");

      // Run axe focused on color contrast
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2aa"])
        .include("body")
        .analyze();

      // Filter for color contrast violations
      const contrastViolations = accessibilityScanResults.violations.filter(
        violation => violation.id.includes("color-contrast") || violation.tags.includes("wcag2aa")
      );

      // Expect no color contrast violations (minimum 4.5:1 for normal text)
      expect(contrastViolations, `Color contrast violations found on ${route.name}`).toHaveLength(
        0
      );
    });
  }

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Check for proper heading hierarchy
    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a"]).analyze();

    const headingViolations = accessibilityScanResults.violations.filter(violation =>
      violation.id.includes("heading")
    );

    expect(headingViolations, "Heading hierarchy violations found").toHaveLength(0);
  });

  test("should have proper form labels", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Check for form label accessibility
    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a"]).analyze();

    const labelViolations = accessibilityScanResults.violations.filter(
      violation => violation.id.includes("label") || violation.id.includes("form")
    );

    expect(labelViolations, "Form label violations found").toHaveLength(0);
  });

  test("should have sufficient color contrast for UI components", async ({ page }) => {
    // Create a test page with common UI component color combinations
    await page.goto("about:blank");
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              margin: 20px;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .component {
              margin: 10px 0;
              padding: 12px;
            }
            /* Primary colors */
            .bg-primary { background: hsl(222.2, 47.4%, 11.2%); color: hsl(210, 40%, 98%); }
            .bg-secondary { background: hsl(210, 40%, 96.1%); color: hsl(222.2, 47.4%, 11.2%); }
            
            /* Status colors */
            .status-success { background: hsl(142, 71%, 45%); color: white; }
            .status-warning { background: hsl(38, 92%, 50%); color: white; }
            .status-error { background: hsl(0, 84%, 60%); color: white; }
            .status-info { background: hsl(221, 83%, 53%); color: white; }
            
            /* Maritime variants */
            .maritime { background: rgb(30, 58, 138); color: white; border: 2px solid rgb(30, 64, 175); }
            .maritime-success { background: rgb(21, 128, 61); color: white; border: 2px solid rgb(22, 101, 52); }
            .maritime-danger { background: rgb(185, 28, 28); color: white; border: 2px solid rgb(153, 27, 27); }
            .maritime-warning { background: rgb(217, 119, 6); color: white; border: 2px solid rgb(180, 83, 9); }
            
            /* Text colors on dark background */
            .dark-bg { background: #0f172a; }
            .text-base { color: #f1f5f9; }
            .text-muted { color: #cbd5e1; }
            .text-subtle { color: #94a3b8; }
          </style>
        </head>
        <body>
          <h1>UI Component Color Contrast Test</h1>
          
          <div class="component bg-primary">Primary Button Text</div>
          <div class="component bg-secondary">Secondary Button Text</div>
          
          <div class="component status-success">Success Message</div>
          <div class="component status-warning">Warning Message</div>
          <div class="component status-error">Error Message</div>
          <div class="component status-info">Info Message</div>
          
          <div class="component maritime">Maritime Button</div>
          <div class="component maritime-success">Maritime Success</div>
          <div class="component maritime-danger">Maritime Danger</div>
          <div class="component maritime-warning">Maritime Warning</div>
          
          <div class="component dark-bg">
            <div class="text-base">Base text with high contrast</div>
            <div class="text-muted">Muted text with good contrast</div>
            <div class="text-subtle">Subtle text with minimum contrast</div>
          </div>
        </body>
      </html>
    `);

    // Run axe on our component color test page
    const results = await new AxeBuilder({ page }).withTags(["wcag2aa", "wcag21aa"]).analyze();

    // Filter for contrast issues
    const contrastIssues = results.violations.filter(v => v.id === "color-contrast");

    expect(
      contrastIssues,
      "UI components should have sufficient contrast (4.5:1 for normal text, 3:1 for large text)"
    ).toHaveLength(0);
  });

  test("should have keyboard-accessible interactive elements", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Check for keyboard accessibility violations
    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a"]).analyze();

    const keyboardViolations = accessibilityScanResults.violations.filter(
      violation =>
        violation.id.includes("keyboard") ||
        violation.id.includes("focus") ||
        violation.id.includes("tabindex")
    );

    expect(keyboardViolations, "Keyboard accessibility violations found").toHaveLength(0);
  });

  test("should have proper landmark regions", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Check for landmark region violations
    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a"]).analyze();

    const landmarkViolations = accessibilityScanResults.violations.filter(
      violation => violation.id.includes("landmark") || violation.id.includes("region")
    );

    expect(landmarkViolations, "Landmark region violations found").toHaveLength(0);
  });

  test("should not have duplicate IDs", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Check for duplicate ID violations
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    const duplicateIdViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === "duplicate-id"
    );

    expect(duplicateIdViolations, "Duplicate ID violations found").toHaveLength(0);
  });

  test("should have proper alt text for images", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Check for image alt text violations
    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a"]).analyze();

    const imageViolations = accessibilityScanResults.violations.filter(
      violation => violation.id.includes("image") || violation.id.includes("img")
    );

    expect(imageViolations, "Image accessibility violations found").toHaveLength(0);
  });
});
