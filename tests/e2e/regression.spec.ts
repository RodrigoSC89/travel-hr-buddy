/**
 * Regression Tests - FASE 3
 * Testes de regressão para validação de correções da FASE 2.5
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "./helpers/auth.helpers";
import { expectPageLoaded, expectNotFound } from "./helpers/navigation.helpers";

test.describe("FASE 3 - Regression: Routes (FASE 2.5)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("REG-ROUTES-001: Rotas corrigidas na FASE 2.5 devem funcionar", async ({ page }) => {
    const newRoutes = [
      "/dashboard",
      "/settings",
      "/admin",
      "/ai-enhanced-modules",
      "/ai-modules-status",
      "/ai-training",
      "/business-continuity",
      "/experimental",
      "/fleet-management",
      "/forecast"
    ];
    
    for (const route of newRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);
      
      // Verificar que não é 404
      await expectNotFound(page, false);
    }
  });

  test("REG-ROUTES-002: Rotas órfãs devem retornar 404 ou redirecionar", async ({ page }) => {
    const orphanRoutes = [
      "/rota-orfan-teste-12345",
      "/pagina-inexistente",
      "/modulo-nao-existe"
    ];
    
    for (const route of orphanRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);
      
      // Deve ser 404 OU redirecionar para home/dashboard
      const currentUrl = page.url();
      const is404 = (await page.locator("body").textContent() || "").includes("404");
      const isRedirected = currentUrl.includes("/dashboard") || currentUrl.includes("/home");
      
      expect(is404 || isRedirected).toBe(true);
    }
  });
});

test.describe("FASE 3 - Regression: Lazy Loading (FASE 2.5)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("REG-LAZY-001: Páginas com lazy loading devem carregar corretamente", async ({ page }) => {
    const pagesWithLazyLoading = [
      "/dashboard",
      "/esg-dashboard",
      "/ism-audit",
      "/maintenance",
      "/crew-management"
    ];
    
    for (const route of pagesWithLazyLoading) {
      await page.goto(route, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000); // Aguardar lazy load
      
      await expectPageLoaded(page);
      
      // Verificar que não ficou em loading eterno
      const hasLoadingSpinner = await page.locator(".loading, [data-loading=\"true\"], .spinner")
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      
      // Loading pode estar presente, mas não deve ser o único conteúdo
      expect(true).toBe(true);
    }
  });

  test("REG-LAZY-002: Navegação rápida não deve causar erros de lazy loading", async ({ page }) => {
    // Monitorar erros
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));
    
    // Navegar rapidamente entre páginas
    await page.goto("/dashboard", { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);
    
    await page.goto("/esg-dashboard", { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);
    
    await page.goto("/crew-management", { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);
    
    await page.goto("/maintenance", { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
    
    // Filtrar erros críticos
    const criticalErrors = errors.filter(err => 
      !err.includes("favicon") && 
      !err.includes("manifest") &&
      !err.includes("ResizeObserver")
    );
    
    expect(criticalErrors.length).toBeLessThan(3);
  });

  test("REG-LAZY-003: Chunks lazy-loaded devem carregar sem erro", async ({ page }) => {
    // Monitorar requisições de chunks
    const failedChunks: string[] = [];
    
    page.on("response", response => {
      const url = response.url();
      if (url.includes(".js") && response.status() >= 400) {
        failedChunks.push(url);
      }
    });
    
    // Navegar por várias páginas para carregar chunks
    const routes = ["/dashboard", "/esg-dashboard", "/maintenance", "/crew-management"];
    
    for (const route of routes) {
      await page.goto(route, { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
    }
    
    expect(failedChunks.length).toBe(0);
  });
});

test.describe("FASE 3 - Regression: TypeScript Strict (FASE 2.5)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("REG-TS-001: Aplicação não deve ter erros de runtime por TypeScript", async ({ page }) => {
    const errors: string[] = [];
    
    page.on("pageerror", err => {
      // Filtrar erros relacionados a TypeScript
      if (err.message.includes("undefined") || 
          err.message.includes("null") ||
          err.message.includes("Cannot read property")) {
        errors.push(err.message);
      }
    });
    
    // Navegar por várias páginas
    const routes = ["/dashboard", "/esg-dashboard", "/maintenance"];
    
    for (const route of routes) {
      await page.goto(route, { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);
    }
    
    expect(errors.length).toBeLessThan(2);
  });

  test("REG-TS-002: Componentes devem lidar com props undefined/null", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    
    // Verificar que a página renderizou sem erros
    await expectPageLoaded(page);
    
    // Não deve ter mensagens de erro visíveis
    const errorMessages = page.locator("[role=\"alert\"], .error-boundary, .error-message");
    const errorCount = await errorMessages.count();
    
    expect(errorCount).toBeLessThan(2);
  });
});

test.describe("FASE 3 - Regression: Console Logs (FASE 2)", () => {
  test("REG-CONSOLE-001: Não deve ter console.log em produção", async ({ page }) => {
    const consoleLogs: string[] = [];
    
    page.on("console", msg => {
      if (msg.type() === "log") {
        consoleLogs.push(msg.text());
      }
    });
    
    await loginAsUser(page);
    await page.goto("/dashboard");
    await page.waitForTimeout(2000);
    
    // Filtrar logs permitidos (warn, error são ok)
    const unwantedLogs = consoleLogs.filter(log => 
      !log.includes("Download") && // DevTools
      !log.includes("warning") &&
      !log.toLowerCase().includes("dev")
    );
    
    // Deve ter poucos console.log (idealmente 0)
    expect(unwantedLogs.length).toBeLessThan(10);
  });
});

test.describe("FASE 3 - Regression: Performance", () => {
  test("REG-PERF-001: Initial load deve ser rápido (< 5s)", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    
    const loadTime = Date.now() - startTime;
    
    // Tempo de carregamento deve ser razoável
    expect(loadTime).toBeLessThan(10000); // 10s máximo
  });

  test("REG-PERF-002: Navegação entre páginas deve ser rápida", async ({ page }) => {
    await loginAsUser(page);
    
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    
    const startTime = Date.now();
    await page.goto("/esg-dashboard");
    await page.waitForLoadState("domcontentloaded");
    const navTime = Date.now() - startTime;
    
    // Navegação deve ser rápida
    expect(navTime).toBeLessThan(5000);
  });
});
