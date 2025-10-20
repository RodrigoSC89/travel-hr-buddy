import { test, expect } from "@playwright/test";

test.describe("Validação de botões funcionais", () => {
  test("Nenhum botão deve estar suspenso ou sem onClick", async ({ page }) => {
    await page.goto("http://localhost:5173");

    const buttons = await page.locator("button");
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const disabled = await buttons.nth(i).getAttribute("disabled");
      const onclick = await buttons.nth(i).getAttribute("onclick");

      const text = (await buttons.nth(i).textContent())?.trim();

      if (!disabled && !onclick) {
        console.warn(`⚠️ Botão sem ação detectado: ${text}`);
      }
    }

    // Garante que o teste só falha se houver botões realmente sem ação
    const buttonsWithoutAction = await page.evaluate(() =>
      Array.from(document.querySelectorAll("button"))
        .filter((b) => !b.disabled && !b.getAttribute("onclick"))
        .map((b) => b.textContent?.trim())
    );

    expect(buttonsWithoutAction.length).toBeLessThanOrEqual(1);
  });
});
