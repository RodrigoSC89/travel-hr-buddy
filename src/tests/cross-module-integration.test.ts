/**
 * Cross-Module Integration Tests
 * Validates side-effects engine, event bus, and module integration completeness
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { id: "1" }, error: null })) })), then: vi.fn((cb: any) => cb({ data: [{ id: "1" }], error: null })) })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
      select: vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve({ data: [], error: null })), lt: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })) })), limit: vi.fn(() => Promise.resolve({ data: [{ id: "1" }], error: null })) })),
    })),
    auth: { getUser: vi.fn(() => Promise.resolve({ data: { user: { id: "u1" } }, error: null })) },
  },
}));

vi.mock("@/integrations/supabase/untyped-client", () => ({
  fromUntyped: vi.fn(() => ({
    insert: vi.fn(() => ({ select: vi.fn(() => Promise.resolve({ data: [{ id: "1" }], error: null })) })),
    update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          lt: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
          ilike: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
        })),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      limit: vi.fn(() => Promise.resolve({ data: [{ id: "1" }], error: null })),
    })),
  })),
}));

vi.mock("sonner", () => ({ toast: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }) }));
vi.mock("@/lib/navigation/spa-navigate", () => ({ spaNavigate: vi.fn() }));

describe("Cross-Module Side Effects Engine", () => {
  it("should export getSideEffectStats with valid counts", async () => {
    const { getSideEffectStats } = await import("@/lib/integration/cross-module-side-effects");
    const stats = getSideEffectStats();
    expect(stats.eventTypes).toBeGreaterThan(50);
    expect(stats.totalEffects).toBeGreaterThan(70);
  });

  it("should have procurement side effects registered", async () => {
    const mod = await import("@/lib/integration/cross-module-side-effects");
    const stats = mod.getSideEffectStats();
    // Procurement, document, training, safety, finance events added
    expect(stats.eventTypes).toBeGreaterThan(55);
  });
});

describe("Auto Integration Interceptor", () => {
  it("should export installAutoIntegration", async () => {
    const mod = await import("@/lib/integration/install-auto-integration");
    expect(mod.installAutoIntegration).toBeDefined();
    expect(typeof mod.installAutoIntegration).toBe("function");
  });

  it("should export interceptMutation", async () => {
    const mod = await import("@/lib/integration/auto-integration-interceptor");
    expect(mod.interceptMutation).toBeDefined();
  });
});

describe("Module Integration Service", () => {
  it("should handle navigate action", async () => {
    const { moduleIntegration } = await import("@/services/module-integration");
    const result = await moduleIntegration.executeAction({
      module: "test", action: "navigate", payload: { path: "/command" },
    });
    expect(result).toHaveProperty("success", true);
  });

  it("should handle batch notifications", async () => {
    const { moduleIntegration } = await import("@/services/module-integration");
    const results = await moduleIntegration.batchExecute([
      { module: "a", action: "notify", payload: { title: "Test 1", type: "success" } },
      { module: "b", action: "notify", payload: { title: "Test 2", type: "info" } },
      { module: "c", action: "notify", payload: { title: "Test 3", type: "error" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach(r => expect(r).toHaveProperty("success", true));
  });

  it("should check module status", async () => {
    const { moduleIntegration } = await import("@/services/module-integration");
    const status = await moduleIntegration.checkModuleStatus("fleet");
    expect(status).toHaveProperty("online");
  });
});

describe("Event Bus Domain Events", () => {
  it("should export localEventBus", async () => {
    const mod = await import("@/lib/events/event-bus");
    expect(mod.localEventBus).toBeDefined();
    expect(mod.localEventBus.emit).toBeDefined();
    expect(mod.localEventBus.on).toBeDefined();
  });

  it("should emit and receive events via on()", async () => {
    const { localEventBus } = await import("@/lib/events/event-bus");
    const handler = vi.fn();
    const unsub = localEventBus.on("*", handler);
    localEventBus.emit({ type: "vessel.created", payload: { value: 42 } });
    expect(handler).toHaveBeenCalledTimes(1);
    unsub();
  });
});

describe("Integration Coverage Validation", () => {
  it("critical domain event types should be registered", async () => {
    const { getSideEffectStats } = await import("@/lib/integration/cross-module-side-effects");
    const stats = getSideEffectStats();
    // Comprehensive coverage: maintenance, compliance, crew, voyage, procurement, document, training, safety, finance
    expect(stats.eventTypes).toBeGreaterThanOrEqual(55);
    expect(stats.totalEffects).toBeGreaterThanOrEqual(75);
  });
});
