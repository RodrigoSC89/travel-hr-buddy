/**
 * NautilusInference AI Tests
 * Tests for embedded AI inference engine
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NautilusInference } from "@/ai/nautilus-inference";

// Mock ONNX Runtime
vi.mock("onnxruntime-web", () => ({
  InferenceSession: {
    create: vi.fn().mockResolvedValue({
      inputNames: ["input"],
      outputNames: ["output"],
      run: vi.fn().mockResolvedValue({
        output: {
          data: new Float32Array([0.85]),
        },
      }),
    }),
  },
  Tensor: class MockTensor {
    constructor(
      public type: string,
      public data: Float32Array,
      public dims: number[]
    ) {}
  },
}));

describe("NautilusInference AI Engine", () => {
  let inference: NautilusInference;

  beforeEach(() => {
    inference = new NautilusInference();
  });

  describe("Model Loading", () => {
    it("should load model successfully", async () => {
      await inference.loadModel("/models/nautilus-mini.onnx");

      expect(inference.isModelLoaded()).toBe(true);
    });

    it("should store model info", async () => {
      const modelUrl = "/models/nautilus-mini.onnx";
      await inference.loadModel(modelUrl);

      const info = inference.getModelInfo();
      expect(info.url).toBe(modelUrl);
      expect(info.loaded).toBe(true);
    });

    it("should return correct model state before loading", () => {
      const info = inference.getModelInfo();
      expect(info.url).toBe(null);
      expect(info.loaded).toBe(false);
    });
  });

  describe("Text Analysis", () => {
    beforeEach(async () => {
      await inference.loadModel("/models/nautilus-mini.onnx");
    });

    it("should analyze text successfully", async () => {
      const result = await inference.analyze("Test input text");

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result).toContain("Confidence");
    });

    it("should throw error if model not loaded", async () => {
      const uninitializedInference = new NautilusInference();

      await expect(
        uninitializedInference.analyze("Test text")
      ).rejects.toThrow("Model not loaded");
    });

    it("should handle empty text", async () => {
      const result = await inference.analyze("");

      expect(result).toBeDefined();
    });

    it("should handle long text", async () => {
      const longText = "a".repeat(1000);
      const result = await inference.analyze(longText);

      expect(result).toBeDefined();
    });
  });

  describe("Context Analysis", () => {
    beforeEach(async () => {
      await inference.loadModel("/models/nautilus-mini.onnx");
    });

    it("should analyze log context", async () => {
      const logs = [
        "DP system operating normally",
        "Thruster 1 status: OK",
        "Position accuracy: 2.5m",
      ];

      const result = await inference.analyzeContext(logs);

      expect(result).toHaveProperty("summary");
      expect(result).toHaveProperty("insights");
      expect(result).toHaveProperty("risks");
      expect(Array.isArray(result.insights)).toBe(true);
      expect(Array.isArray(result.risks)).toBe(true);
    });

    it("should detect error patterns", async () => {
      const logs = [
        "Error in thruster control",
        "Warning: DP position drift",
        "System alert triggered",
      ];

      const result = await inference.analyzeContext(logs);

      expect(result.insights.length).toBeGreaterThan(0);
      expect(result.insights.some((i) => i.includes("Error"))).toBe(true);
    });

    it("should detect critical events", async () => {
      const logs = [
        "Critical: DP system failure",
        "Emergency shutdown initiated",
        "Alarm: Thruster fault",
      ];

      const result = await inference.analyzeContext(logs);

      expect(result.risks.length).toBeGreaterThan(0);
      expect(result.risks.some((r) => r.includes("Critical"))).toBe(true);
    });

    it("should detect DP-related events", async () => {
      const logs = [
        "DP reference system switch",
        "Dynamic positioning mode active",
        "Thruster allocation updated",
      ];

      const result = await inference.analyzeContext(logs);

      expect(result.risks.some((r) => r.includes("DP"))).toBe(true);
    });

    it("should handle empty log array", async () => {
      const result = await inference.analyzeContext([]);

      expect(result).toHaveProperty("summary");
      expect(result).toHaveProperty("insights");
      expect(result).toHaveProperty("risks");
    });

    it("should handle single log entry", async () => {
      const result = await inference.analyzeContext(["Single log entry"]);

      expect(result.insights).toBeDefined();
      expect(result.risks).toBeDefined();
    });

    it("should detect high volume events", async () => {
      const manyLogs = Array(15).fill("Normal operation log");
      const result = await inference.analyzeContext(manyLogs);

      expect(
        result.insights.some((i) => i.includes("High volume"))
      ).toBe(true);
    });
  });

  describe("Model Lifecycle", () => {
    it("should unload model successfully", async () => {
      await inference.loadModel("/models/nautilus-mini.onnx");
      expect(inference.isModelLoaded()).toBe(true);

      await inference.unload();
      expect(inference.isModelLoaded()).toBe(false);
    });

    it("should clear model info after unload", async () => {
      await inference.loadModel("/models/nautilus-mini.onnx");
      await inference.unload();

      const info = inference.getModelInfo();
      expect(info.url).toBe(null);
      expect(info.loaded).toBe(false);
    });

    it("should handle unload when no model loaded", async () => {
      await expect(inference.unload()).resolves.not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    beforeEach(async () => {
      await inference.loadModel("/models/nautilus-mini.onnx");
    });

    it("should handle special characters in text", async () => {
      const specialText = "Test @#$% special & characters! 🚢";
      const result = await inference.analyze(specialText);

      expect(result).toBeDefined();
    });

    it("should handle unicode text", async () => {
      const unicodeText = "测试 テスト тест";
      const result = await inference.analyze(unicodeText);

      expect(result).toBeDefined();
    });

    it("should handle mixed case logs", async () => {
      const logs = [
        "CRITICAL ERROR",
        "warning condition",
        "Normal Operation",
      ];

      const result = await inference.analyzeContext(logs);

      expect(result.risks.length).toBeGreaterThan(0);
      expect(result.insights.length).toBeGreaterThan(0);
    });
  });
});
