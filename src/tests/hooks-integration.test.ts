/**
 * Hooks Integration Tests
 * Tests critical business hooks exist and export correctly
 */
import { describe, it, expect } from "vitest";

describe("Critical Hooks Exports", () => {
  it("useCRUD hook exports correctly", async () => {
    const mod = await import("@/hooks/useCRUD");
    expect(mod.useCRUD).toBeDefined();
    expect(typeof mod.useCRUD).toBe("function");
  });

  it("usePredictiveMaintenance hook exports correctly", async () => {
    const mod = await import("@/hooks/usePredictiveMaintenance");
    expect(mod.usePredictiveMaintenance).toBeDefined();
    expect(typeof mod.usePredictiveMaintenance).toBe("function");
  });

  it("useSessionSecurity hook exports correctly", async () => {
    const mod = await import("@/hooks/useSessionSecurity");
    expect(mod.useSessionSecurity).toBeDefined();
  });

  it("useCrossModuleAutomation hook exports correctly", async () => {
    const mod = await import("@/hooks/useCrossModuleAutomation");
    expect(mod.useCrossModuleAutomation).toBeDefined();
  });

  it("useRealtimeAlerts hook exports correctly", async () => {
    const mod = await import("@/hooks/useRealtimeAlerts");
    expect(mod.useRealtimeAlerts).toBeDefined();
  });
});

describe("Core Module Exports", () => {
  it("logger module exports correctly", async () => {
    const mod = await import("@/lib/logger");
    expect(mod.logger).toBeDefined();
    expect(typeof mod.logger.info).toBe("function");
    expect(typeof mod.logger.error).toBe("function");
    expect(typeof mod.logger.warn).toBe("function");
  });

  it("export-utils module exports correctly", async () => {
    const mod = await import("@/lib/export-utils");
    expect(mod.exportToCSV).toBeDefined();
    expect(mod.quickExport).toBeDefined();
    expect(mod.exportTableToPDF).toBeDefined();
  });

  it("supabase client exports correctly", async () => {
    const mod = await import("@/integrations/supabase/client");
    expect(mod.supabase).toBeDefined();
    expect(mod.supabase.from).toBeDefined();
    expect(mod.supabase.auth).toBeDefined();
  });

  it("API client exports correctly", async () => {
    const mod = await import("@/lib/api");
    expect(mod.apiClient).toBeDefined();
  });

  it("PWA utilities export correctly", async () => {
    const mod = await import("@/lib/pwa");
    expect(mod).toBeDefined();
  });
});

describe("AI Module Exports", () => {
  it("AI module exports correctly", async () => {
    const mod = await import("@/modules/ai");
    expect(mod.AdaptiveAI).toBeDefined();
    expect(mod.useAIAdvisor).toBeDefined();
  });
});
