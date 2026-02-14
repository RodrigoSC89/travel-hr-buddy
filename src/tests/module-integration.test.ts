/**
 * Module Integration Service Tests
 * Tests cross-module communication, action handlers, and event system
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase before import
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [{ id: "1" }], error: null })),
      })),
    })),
  },
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn(),
  }),
}));

vi.mock("@/lib/navigation/spa-navigate", () => ({
  spaNavigate: vi.fn(),
}));

import { moduleIntegration, type IntegrationEvent } from "@/services/module-integration";

describe("ModuleIntegrationService", () => {
  describe("executeAction", () => {
    it("executes 'notify' action with success type", async () => {
      const result = await moduleIntegration.executeAction({
        module: "test",
        action: "notify",
        payload: { title: "Test", type: "success" },
      });
      expect(result).toHaveProperty("success", true);
    });

    it("executes 'notify' action with error type", async () => {
      const result = await moduleIntegration.executeAction({
        module: "test",
        action: "notify",
        payload: { title: "Error!", type: "error" },
      });
      expect(result).toHaveProperty("success", true);
    });

    it("returns error for unknown action", async () => {
      const result = await moduleIntegration.executeAction({
        module: "test",
        action: "nonexistent-action",
      });
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error", "Action not found");
    });

    it("calls callback with result", async () => {
      const callback = vi.fn();
      await moduleIntegration.executeAction({
        module: "test",
        action: "notify",
        payload: { title: "CB Test" },
        callback,
      });
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("event system", () => {
    it("subscribe and emit events", () => {
      const handler = vi.fn();
      const unsub = moduleIntegration.subscribe("test-event", handler);

      const event: IntegrationEvent = {
        type: "test-event",
        source: "unit-test",
        data: { key: "value" },
        timestamp: new Date(),
      };
      moduleIntegration.emit(event);

      expect(handler).toHaveBeenCalledWith(event);
      unsub();
    });

    it("wildcard subscriber receives all events", () => {
      const handler = vi.fn();
      const unsub = moduleIntegration.subscribe("*", handler);

      moduleIntegration.emit({
        type: "any-event",
        source: "test",
        data: {},
        timestamp: new Date(),
      });

      expect(handler).toHaveBeenCalled();
      unsub();
    });

    it("unsubscribe stops receiving events", () => {
      const handler = vi.fn();
      const unsub = moduleIntegration.subscribe("ephemeral", handler);
      unsub();

      moduleIntegration.emit({
        type: "ephemeral",
        source: "test",
        data: {},
        timestamp: new Date(),
      });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("registerAction", () => {
    it("registers and executes custom action", async () => {
      moduleIntegration.registerAction("custom-test", async (payload) => {
        return { computed: (payload.x as number) * 2 };
      });

      const result = await moduleIntegration.executeAction({
        module: "test",
        action: "custom-test",
        payload: { x: 21 },
      });
      expect(result).toHaveProperty("computed", 42);
    });
  });

  describe("batchExecute", () => {
    it("executes multiple actions in parallel", async () => {
      const results = await moduleIntegration.batchExecute([
        { module: "a", action: "notify", payload: { title: "1" } },
        { module: "b", action: "notify", payload: { title: "2" } },
      ]);
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty("success", true);
      expect(results[1]).toHaveProperty("success", true);
    });
  });

  describe("getModuleData", () => {
    it("returns error for unmapped module", async () => {
      const result = await moduleIntegration.getModuleData("nonexistent");
      expect(result.error).toBe("Module not mapped");
      expect(result.data).toEqual([]);
    });
  });
});
