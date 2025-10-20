/**
 * Tests for Nautilus Core Alpha - BridgeLink + NautilusAI
 * 
 * Comprehensive test suite covering:
 * - BridgeLink event emission and reception
 * - NautilusAI analysis, classification, and prediction
 * - Integration between BridgeLink and NautilusAI
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { BridgeLink, BridgeLinkEvent } from "@/core/BridgeLink";
import { NautilusAI } from "@/ai/nautilus-core";

describe("BridgeLink - Event Communication System", () => {
  beforeEach(() => {
    // Clear history before each test
    BridgeLink.clearHistory();
  });

  describe("Event Emission", () => {
    it("should emit events successfully", () => {
      const testData = { jobId: 123, status: "created" };
      BridgeLink.emit("mmi:job:created", "MMI Module", testData);

      const history = BridgeLink.getHistory();
      const event = history.find(e => e.type === "mmi:job:created");
      
      expect(event).toBeDefined();
      expect(event!.type).toBe("mmi:job:created");
      expect(event!.source).toBe("MMI Module");
      expect(event!.data).toEqual(testData);
    });

    it("should generate unique event IDs", () => {
      BridgeLink.emit("system:module:loaded", "Test", {});
      BridgeLink.emit("system:module:loaded", "Test", {});

      const history = BridgeLink.getHistory(2);
      expect(history[0].id).not.toBe(history[1].id);
    });

    it("should include timestamp in events", () => {
      const beforeTime = Date.now();
      BridgeLink.emit("ai:analysis:complete", "NautilusAI", {});
      const afterTime = Date.now();

      const history = BridgeLink.getHistory(1);
      expect(history[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(history[0].timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe("Event Subscription", () => {
    it("should receive events when subscribed", () => {
      const mockCallback = vi.fn();
      const unsubscribe = BridgeLink.on("dp:incident:reported", mockCallback);

      BridgeLink.emit("dp:incident:reported", "DP Intelligence", { incidentId: 456 });

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback.mock.calls[0][0].type).toBe("dp:incident:reported");

      unsubscribe();
    });

    it("should not receive events after unsubscribing", () => {
      const mockCallback = vi.fn();
      const unsubscribe = BridgeLink.on("fmea:risk:identified", mockCallback);

      BridgeLink.emit("fmea:risk:identified", "FMEA", { risk: "high" });
      expect(mockCallback).toHaveBeenCalledTimes(1);

      unsubscribe();
      BridgeLink.emit("fmea:risk:identified", "FMEA", { risk: "medium" });
      expect(mockCallback).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it("should support multiple listeners for the same event", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsub1 = BridgeLink.on("asog:procedure:activated", callback1);
      const unsub2 = BridgeLink.on("asog:procedure:activated", callback2);

      BridgeLink.emit("asog:procedure:activated", "ASOG", { procedure: "test" });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);

      unsub1();
      unsub2();
    });

    it("should handle errors in listeners gracefully", () => {
      const errorCallback = vi.fn(() => {
        throw new Error("Listener error");
      });
      const successCallback = vi.fn();

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const unsub1 = BridgeLink.on("wsog:checklist:completed", errorCallback);
      const unsub2 = BridgeLink.on("wsog:checklist:completed", successCallback);

      BridgeLink.emit("wsog:checklist:completed", "WSOG", { checklist: "test" });

      expect(errorCallback).toHaveBeenCalled();
      expect(successCallback).toHaveBeenCalled(); // Should still be called
      expect(consoleErrorSpy).toHaveBeenCalled();

      unsub1();
      unsub2();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Event History", () => {
    it("should maintain event history", () => {
      BridgeLink.emit("mmi:forecast:update", "MMI", { forecast: 1 });
      BridgeLink.emit("dp:intelligence:alert", "DP", { alert: 2 });
      BridgeLink.emit("system:module:loaded", "System", { module: 3 });

      const history = BridgeLink.getHistory();
      expect(history.length).toBeGreaterThanOrEqual(3);
    });

    it("should limit history to 500 events", () => {
      // Emit 600 events
      for (let i = 0; i < 600; i++) {
        BridgeLink.emit("telemetry:log", "Test", { count: i });
      }

      const history = BridgeLink.getHistory();
      expect(history.length).toBeLessThanOrEqual(500);
    });

    it("should retrieve limited history", () => {
      BridgeLink.emit("mmi:job:created", "MMI", { id: 1 });
      BridgeLink.emit("mmi:job:created", "MMI", { id: 2 });
      BridgeLink.emit("mmi:job:created", "MMI", { id: 3 });

      const history = BridgeLink.getHistory(2);
      expect(history).toHaveLength(2);
    });

    it("should clear history", () => {
      BridgeLink.emit("system:module:loaded", "Test", {});
      expect(BridgeLink.getHistory().length).toBeGreaterThan(0);

      BridgeLink.clearHistory();
      expect(BridgeLink.getHistory()).toHaveLength(0);
    });
  });

  describe("Statistics", () => {
    it("should track statistics correctly", () => {
      BridgeLink.clearHistory();
      
      BridgeLink.emit("mmi:job:created", "MMI", {});
      BridgeLink.emit("dp:incident:reported", "DP", {});

      const stats = BridgeLink.getStats();
      expect(stats.totalEvents).toBeGreaterThanOrEqual(2);
      expect(stats.eventTypes).toBeGreaterThan(0);
    });

    it("should count active listeners", () => {
      const unsub1 = BridgeLink.on("mmi:forecast:update", vi.fn());
      const unsub2 = BridgeLink.on("dp:intelligence:alert", vi.fn());

      const stats = BridgeLink.getStats();
      expect(stats.activeListeners).toBeGreaterThanOrEqual(2);

      unsub1();
      unsub2();
    });
  });
});

describe("NautilusAI - AI Core", () => {
  describe("Analysis", () => {
    it("should analyze input successfully", async () => {
      const result = await NautilusAI.analyze("Test input data");

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.timestamp).toBeDefined();
    });

    it("should provide suggestions in analysis", async () => {
      const result = await NautilusAI.analyze("Safety check data");

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(typeof result.suggestions[0]).toBe("string");
    });
  });

  describe("Classification", () => {
    it("should classify input successfully", async () => {
      const result = await NautilusAI.classify("Operational data");

      expect(result).toBeDefined();
      expect(result.category).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.alternatives).toBeInstanceOf(Array);
      expect(result.timestamp).toBeDefined();
    });

    it("should provide alternative categories", async () => {
      const result = await NautilusAI.classify("Technical documentation");

      expect(result.alternatives.length).toBeGreaterThan(0);
      expect(result.alternatives[0]).toHaveProperty("category");
      expect(result.alternatives[0]).toHaveProperty("confidence");
    });

    it("should return valid category types", async () => {
      const result = await NautilusAI.classify("Input data");
      const validCategories = ["safety", "compliance", "operational", "technical"];

      expect(validCategories).toContain(result.category);
    });
  });

  describe("Prediction", () => {
    it("should make predictions successfully", async () => {
      const historicalData = [1, 2, 3, 4, 5];
      const result = await NautilusAI.predict(historicalData);

      expect(result).toBeDefined();
      expect(result.prediction).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.factors).toBeInstanceOf(Array);
      expect(result.timestamp).toBeDefined();
    });

    it("should provide prediction factors", async () => {
      const result = await NautilusAI.predict([1, 2, 3]);

      expect(result.factors.length).toBeGreaterThan(0);
      expect(result.factors[0]).toHaveProperty("factor");
      expect(result.factors[0]).toHaveProperty("weight");
    });

    it("should calculate factor weights correctly", async () => {
      const result = await NautilusAI.predict([]);

      const totalWeight = result.factors.reduce((sum, f) => sum + f.weight, 0);
      expect(totalWeight).toBeCloseTo(1.0, 1);
    });
  });

  describe("Model Management", () => {
    it("should load model successfully", async () => {
      await NautilusAI.loadModel("test-model", "1.0.0");

      const status = NautilusAI.getModelStatus();
      expect(status.loaded).toBe(true);
      expect(status.modelName).toBe("test-model");
      expect(status.version).toBe("1.0.0");
    });

    it("should unload model successfully", async () => {
      await NautilusAI.loadModel("test-model", "1.0.0");
      expect(NautilusAI.getModelStatus().loaded).toBe(true);

      NautilusAI.unloadModel();
      expect(NautilusAI.getModelStatus().loaded).toBe(false);
    });

    it("should return correct initial status", () => {
      NautilusAI.unloadModel(); // Ensure clean state
      const status = NautilusAI.getModelStatus();

      expect(status.loaded).toBe(false);
      expect(status.modelName).toBe(null);
      expect(status.version).toBe(null);
    });
  });
});

describe("Integration - BridgeLink + NautilusAI", () => {
  beforeEach(() => {
    BridgeLink.clearHistory();
  });

  it("should emit events when AI analysis completes", async () => {
    const mockCallback = vi.fn();
    const unsubscribe = BridgeLink.on("ai:analysis:complete", mockCallback);

    await NautilusAI.analyze("Integration test data");

    expect(mockCallback).toHaveBeenCalled();
    unsubscribe();
  });

  it("should emit events when classification completes", async () => {
    const mockCallback = vi.fn();
    const unsubscribe = BridgeLink.on("ai:analysis:complete", mockCallback);

    await NautilusAI.classify("Integration test");

    expect(mockCallback).toHaveBeenCalled();
    unsubscribe();
  });

  it("should emit events when prediction completes", async () => {
    const mockCallback = vi.fn();
    const unsubscribe = BridgeLink.on("ai:analysis:complete", mockCallback);

    await NautilusAI.predict([1, 2, 3]);

    expect(mockCallback).toHaveBeenCalled();
    unsubscribe();
  });

  it("should emit system events when model loads", async () => {
    const mockCallback = vi.fn();
    const unsubscribe = BridgeLink.on("system:module:loaded", mockCallback);

    await NautilusAI.loadModel("integration-test", "1.0.0");

    expect(mockCallback).toHaveBeenCalled();
    const event = mockCallback.mock.calls[0][0] as BridgeLinkEvent;
    expect(event.source).toBe("NautilusAI");
    
    unsubscribe();
  });
});
