/**
 * Tests for NautilusInference
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { nautilusInference } from "@/ai/nautilus-inference";

// Mock onnxruntime-web
vi.mock("onnxruntime-web", () => ({
  InferenceSession: {
    create: vi.fn(() => Promise.resolve({
      inputNames: ["input"],
      outputNames: ["output"],
      run: vi.fn(() => Promise.resolve({
        output: { data: [0.85] }
      }))
    }))
  },
  Tensor: vi.fn((type, data, shape) => ({ type, data, shape }))
}));

describe("NautilusInference", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize without crashing", () => {
    expect(nautilusInference).toBeDefined();
  });

  it("should report model as not loaded initially", () => {
    expect(nautilusInference.isModelLoaded()).toBe(false);
  });

  it("should load model successfully", async () => {
    await nautilusInference.loadModel("/models/test-model.onnx");
    
    expect(nautilusInference.isModelLoaded()).toBe(true);
  });

  it("should analyze text with fallback when model not loaded", async () => {
    await nautilusInference.unloadModel();
    
    const result = await nautilusInference.analyze("Test text for analysis");
    
    expect(result).toBeDefined();
    expect(result.text).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.timestamp).toBeDefined();
  });

  it("should analyze text with loaded model", async () => {
    await nautilusInference.loadModel("/models/test-model.onnx");
    
    const result = await nautilusInference.analyze("Test text for analysis");
    
    expect(result).toBeDefined();
    expect(result.text).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it("should perform contextual analysis", async () => {
    const text = "DP system operating normally with all thrusters functional";
    
    const result = await nautilusInference.analyzeContext(text);
    
    expect(result).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(result.keywords).toBeDefined();
    expect(result.categories).toBeDefined();
    expect(Array.isArray(result.keywords)).toBe(true);
    expect(Array.isArray(result.categories)).toBe(true);
  });

  it("should extract keywords from text", async () => {
    const text = "Dynamic positioning system thruster allocation failure detected";
    
    const result = await nautilusInference.analyzeContext(text);
    
    expect(result.keywords.length).toBeGreaterThan(0);
  });

  it("should detect DP-related categories", async () => {
    const text = "DP system thruster position reference lost";
    
    const result = await nautilusInference.analyzeContext(text);
    
    expect(result.categories).toContain("DP System");
  });

  it("should detect FMEA-related categories", async () => {
    const text = "FMEA analysis shows failure mode with high risk severity";
    
    const result = await nautilusInference.analyzeContext(text);
    
    expect(result.categories).toContain("FMEA");
  });

  it("should detect safety-related categories", async () => {
    const text = "Safety incident reported with minor injury to crew";
    
    const result = await nautilusInference.analyzeContext(text);
    
    expect(result.categories).toContain("Safety");
  });

  it("should analyze sentiment correctly", async () => {
    const positiveText = "Excellent performance, all systems operating normally";
    const negativeText = "Critical failure detected, emergency shutdown required";
    const neutralText = "System status update";
    
    const positiveResult = await nautilusInference.analyzeContext(positiveText);
    const negativeResult = await nautilusInference.analyzeContext(negativeText);
    const neutralResult = await nautilusInference.analyzeContext(neutralText);
    
    expect(positiveResult.sentiment).toBe("positive");
    expect(negativeResult.sentiment).toBe("negative");
    expect(neutralResult.sentiment).toBe("neutral");
  });

  it("should detect DP events", async () => {
    const text = "DP system operating with thruster allocation update";
    
    const result = await nautilusInference.analyzeContext(text);
    
    expect(result.dpEvents).toBeDefined();
    if (result.dpEvents && result.dpEvents.length > 0) {
      expect(result.dpEvents[0].type).toBeDefined();
      expect(result.dpEvents[0].timestamp).toBeDefined();
    }
  });

  it("should detect FMEA patterns", async () => {
    const text = "Thruster failure detected";
    
    const result = await nautilusInference.analyzeContext(text);
    
    expect(result.fmeaPatterns).toBeDefined();
    if (result.fmeaPatterns && result.fmeaPatterns.length > 0) {
      expect(result.fmeaPatterns[0].failureMode).toBeDefined();
      expect(result.fmeaPatterns[0].effect).toBeDefined();
      expect(result.fmeaPatterns[0].severity).toBeGreaterThan(0);
    }
  });

  it("should detect risks", async () => {
    const text = "Critical emergency situation detected";
    
    const result = await nautilusInference.analyzeContext(text);
    
    expect(result.risks).toBeDefined();
    if (result.risks && result.risks.length > 0) {
      expect(result.risks[0].type).toBeDefined();
      expect(result.risks[0].severity).toBeDefined();
      expect(["low", "medium", "high", "critical"]).toContain(result.risks[0].severity);
    }
  });

  it("should provide model info", async () => {
    await nautilusInference.loadModel("/models/test-model.onnx");
    
    const info = nautilusInference.getModelInfo();
    
    expect(info).toBeDefined();
    expect(info.loaded).toBe(true);
    expect(info.url).toBe("/models/test-model.onnx");
  });

  it("should unload model", async () => {
    await nautilusInference.loadModel("/models/test-model.onnx");
    expect(nautilusInference.isModelLoaded()).toBe(true);
    
    await nautilusInference.unloadModel();
    
    expect(nautilusInference.isModelLoaded()).toBe(false);
  });

  it("should handle errors during model loading", async () => {
    // Force an error
    const { InferenceSession } = await import("onnxruntime-web");
    vi.mocked(InferenceSession.create).mockRejectedValueOnce(new Error("Load failed"));
    
    await expect(
      nautilusInference.loadModel("/models/invalid-model.onnx")
    ).rejects.toThrow();
  });

  it("should handle short text analysis", async () => {
    const result = await nautilusInference.analyze("OK");
    
    expect(result).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(0);
  });

  it("should handle long text analysis", async () => {
    const longText = "A".repeat(1000);
    
    const result = await nautilusInference.analyze(longText);
    
    expect(result).toBeDefined();
  });

  it("should generate summaries", async () => {
    const text = "This is a test of the nautilus inference system analyzing DP operations and FMEA patterns";
    
    const result = await nautilusInference.analyzeContext(text);
    
    expect(result.summary).toBeDefined();
    expect(result.summary.length).toBeGreaterThan(0);
  });

  it("should handle multiple analyses in sequence", async () => {
    await nautilusInference.loadModel("/models/test-model.onnx");
    
    const result1 = await nautilusInference.analyze("First analysis");
    const result2 = await nautilusInference.analyze("Second analysis");
    const result3 = await nautilusInference.analyze("Third analysis");
    
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(result3).toBeDefined();
  });
});
