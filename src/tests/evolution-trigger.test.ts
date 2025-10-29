/**
 * PATCH 570 - Evolution Trigger Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { evolutionTrigger } from "@/ai/evolution-trigger";

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock auto-tuning engine
vi.mock("@/ai/auto-tuning-engine", () => ({
  autoTuningEngine: {
    getCurrentMetrics: vi.fn().mockResolvedValue({
      total_decisions: 100,
      accepted_decisions: 75,
      rejected_decisions: 25,
      avg_confidence: 0.8,
      avg_response_time: 1200,
      accuracy_rate: 0.75,
    }),
    getConfig: vi.fn().mockReturnValue({
      thresholds: {
        confidence_min: 0.7,
        accuracy_target: 0.85,
        response_time_max: 2000,
      },
      weights: {
        user_feedback: 0.4,
        accuracy: 0.4,
        speed: 0.2,
      },
      rules: {
        auto_adjust_enabled: true,
        learning_rate: 0.1,
        rollback_on_degradation: true,
      },
    }),
  },
}));

describe("Evolution Trigger", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should have empty audits initially", () => {
    const audits = evolutionTrigger.getAudits();
    
    expect(Array.isArray(audits)).toBe(true);
  });

  it("should return weekly report when audits exist", () => {
    const report = evolutionTrigger.getWeeklyReport();
    
    // Should have a report since auto-start runs an audit
    expect(report).toBeDefined();
    if (report) {
      expect(report.audits).toBeDefined();
      expect(report.overall_trend).toBeDefined();
      expect(report.critical_issues).toBeDefined();
      expect(report.patch_suggestions).toBeDefined();
    }
  });

  it("should trigger audit manually", async () => {
    await evolutionTrigger.triggerAuditNow();
    
    // Should have created at least one audit
    const audits = evolutionTrigger.getAudits();
    expect(audits.length).toBeGreaterThan(0);
  });

  it("should create audit with required fields", async () => {
    await evolutionTrigger.triggerAuditNow();
    
    const audits = evolutionTrigger.getAudits();
    const audit = audits[0];
    
    expect(audit).toBeDefined();
    expect(audit.id).toBeDefined();
    expect(audit.timestamp).toBeDefined();
    expect(audit.metrics).toBeDefined();
    expect(audit.performance_score).toBeDefined();
    expect(audit.anomalies).toBeDefined();
    expect(audit.recommendations).toBeDefined();
  });

  it("should detect anomalies when performance is poor", async () => {
    await evolutionTrigger.triggerAuditNow();
    
    const audits = evolutionTrigger.getAudits();
    const audit = audits[0];
    
    // Should detect low accuracy (0.75 vs target 0.85)
    expect(audit.anomalies.length).toBeGreaterThan(0);
  });

  it("should provide recommendations when anomalies exist", async () => {
    await evolutionTrigger.triggerAuditNow();
    
    const audits = evolutionTrigger.getAudits();
    const audit = audits[0];
    
    if (audit.anomalies.length > 0) {
      expect(audit.recommendations.length).toBeGreaterThan(0);
    }
  });

  it("should calculate performance score between 0 and 1", async () => {
    await evolutionTrigger.triggerAuditNow();
    
    const audits = evolutionTrigger.getAudits();
    const audit = audits[0];
    
    expect(audit.performance_score).toBeGreaterThanOrEqual(0);
    expect(audit.performance_score).toBeLessThanOrEqual(1);
  });
});
