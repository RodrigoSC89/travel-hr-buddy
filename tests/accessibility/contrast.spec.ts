import { test, expect } from "@playwright/test";
import { injectAxe, checkA11y } from "@axe-core/playwright";

test.describe("Verificação de contraste e acessibilidade", () => {
  test("Todos os módulos devem ter contraste mínimo 4.5:1 @a11y", async ({ page }) => {
    const routes = [
      "/dashboard",
      "/dp-intelligence",
      "/forecast-global",
      "/control-hub",
      "/fmea-expert",
      "/peo-dp"
    ];

    for (const route of routes) {
      await page.goto(`http://localhost:5173${route}`);
      await injectAxe(page);
      await checkA11y(page, undefined, {
        detailedReport: true,
        detailedReportOptions: { html: true },
        runOnly: ["color-contrast"],
      });
    }
  });
});
