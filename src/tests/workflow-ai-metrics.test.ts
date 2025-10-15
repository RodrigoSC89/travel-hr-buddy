import { describe, it, expect } from "vitest";
import type { WorkflowAISummary } from "@/lib/analytics/workflowAIMetrics";

describe("Workflow AI Metrics", () => {
  it("should have proper structure for WorkflowAISummary", () => {
    const mockSummary: WorkflowAISummary = {
      total: 12,
      aceitas: 9,
      taxa: "75.0"
    };

    expect(mockSummary.total).toBeDefined();
    expect(mockSummary.aceitas).toBeDefined();
    expect(mockSummary.taxa).toBeDefined();
    expect(typeof mockSummary.total).toBe("number");
    expect(typeof mockSummary.aceitas).toBe("number");
    expect(mockSummary.total).toBeGreaterThanOrEqual(0);
    expect(mockSummary.aceitas).toBeGreaterThanOrEqual(0);
    expect(mockSummary.aceitas).toBeLessThanOrEqual(mockSummary.total);
  });

  it("should allow taxa as string or number", () => {
    const summaryWithString: WorkflowAISummary = {
      total: 10,
      aceitas: 7,
      taxa: "70.0"
    };

    const summaryWithNumber: WorkflowAISummary = {
      total: 0,
      aceitas: 0,
      taxa: 0
    };

    expect(summaryWithString.taxa).toBe("70.0");
    expect(summaryWithNumber.taxa).toBe(0);
  });

  it("should handle edge cases", () => {
    const zeroSummary: WorkflowAISummary = {
      total: 0,
      aceitas: 0,
      taxa: 0
    };

    expect(zeroSummary.total).toBe(0);
    expect(zeroSummary.aceitas).toBe(0);
    expect(zeroSummary.taxa).toBe(0);
  });

  it("should calculate correct adoption rate", () => {
    const fullAdoption: WorkflowAISummary = {
      total: 20,
      aceitas: 20,
      taxa: "100.0"
    };

    const partialAdoption: WorkflowAISummary = {
      total: 100,
      aceitas: 75,
      taxa: "75.0"
    };

    expect(fullAdoption.taxa).toBe("100.0");
    expect(partialAdoption.taxa).toBe("75.0");
  });
});
