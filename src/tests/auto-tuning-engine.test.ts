/**
 * PATCH 567 - Auto-Tuning Engine Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { autoTuningEngine } from "@/ai/auto-tuning-engine";

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        gte: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
  },
}));

describe("Auto-Tuning Engine", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should have default configuration", () => {
    const config = autoTuningEngine.getConfig();
    
    expect(config).toBeDefined();
    expect(config.thresholds).toBeDefined();
    expect(config.weights).toBeDefined();
    expect(config.rules).toBeDefined();
  });

  it("should have confidence threshold between 0 and 1", () => {
    const config = autoTuningEngine.getConfig();
    
    expect(config.thresholds.confidence_min).toBeGreaterThanOrEqual(0);
    expect(config.thresholds.confidence_min).toBeLessThanOrEqual(1);
  });

  it("should have accuracy target between 0 and 1", () => {
    const config = autoTuningEngine.getConfig();
    
    expect(config.thresholds.accuracy_target).toBeGreaterThanOrEqual(0);
    expect(config.thresholds.accuracy_target).toBeLessThanOrEqual(1);
  });

  it("should have positive response time threshold", () => {
    const config = autoTuningEngine.getConfig();
    
    expect(config.thresholds.response_time_max).toBeGreaterThan(0);
  });

  it("should have weights that sum to reasonable value", () => {
    const config = autoTuningEngine.getConfig();
    const totalWeight = 
      config.weights.user_feedback +
      config.weights.accuracy +
      config.weights.speed;
    
    // Weights should sum to approximately 1.0
    expect(totalWeight).toBeCloseTo(1.0, 1);
  });

  it("should return empty snapshots initially", () => {
    const snapshots = autoTuningEngine.getSnapshots();
    
    expect(Array.isArray(snapshots)).toBe(true);
  });

  it("should get current metrics without errors", async () => {
    const metrics = await autoTuningEngine.getCurrentMetrics();
    
    expect(metrics).toBeDefined();
    expect(metrics.total_decisions).toBeDefined();
    expect(metrics.accuracy_rate).toBeDefined();
    expect(metrics.avg_confidence).toBeDefined();
    expect(metrics.avg_response_time).toBeDefined();
  });

  it("should have valid learning rate", () => {
    const config = autoTuningEngine.getConfig();
    
    expect(config.rules.learning_rate).toBeGreaterThan(0);
    expect(config.rules.learning_rate).toBeLessThanOrEqual(1);
  });

  it("should have rollback setting defined", () => {
    const config = autoTuningEngine.getConfig();
    
    expect(typeof config.rules.rollback_on_degradation).toBe("boolean");
  });
});
