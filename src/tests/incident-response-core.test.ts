
/**
 * Tests for Incident Response AI Core
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { handleIncidentReport } from "@/lib/ai/incident-response-core";

// Mock Supabase client
const mockInsert = vi.fn(() => Promise.resolve({ data: null, error: null }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  },
}));

// Mock MQTT client
const mockPublish = vi.fn();
const mockEnd = vi.fn();
vi.mock("mqtt", () => ({
  default: {
    connect: vi.fn(() => ({
      on: vi.fn((event, callback) => {
        if (event === "connect") {
          callback();
        }
      }),
      publish: mockPublish,
      end: mockEnd,
    })),
  },
}));

describe("Incident Response AI Core", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle critical DP failure incident", async () => {
    const incident = {
      type: "DP Failure",
      severity: "Critical" as const,
      message: "DP system lost position reference - GPS failure",
      module: "DP Advisor",
    };

    const response = await handleIncidentReport(incident);

    expect(response).toBeDefined();
    expect(response.id).toBeDefined();
    expect(response.timestamp).toBeDefined();
    expect(response.module).toBe("DP Advisor");
    expect(response.type).toBe("DP Failure");
    expect(response.severity).toBe("Critical");
    expect(response.riskScore).toBe(0.9);
    expect(response.compliance).toContain("IMCA M109");
    expect(response.compliance).toContain("IMCA M254");
    expect(response.compliance).toContain("ISM Code 10.2");
    expect(response.compliance).toContain("ISM Code 9.1");
  });

  it("should handle major equipment failure incident", async () => {
    const incident = {
      type: "Equipment Failure",
      severity: "Major" as const,
      message: "Main engine cooling system failure",
      module: "Maintenance Orchestrator",
    };

    const response = await handleIncidentReport(incident);

    expect(response).toBeDefined();
    expect(response.riskScore).toBe(0.7);
    expect(response.compliance).toContain("IMCA M140");
    expect(response.compliance).toContain("ISM Code 10.3");
  });

  it("should handle moderate safety alert", async () => {
    const incident = {
      type: "Safety Alert",
      severity: "Moderate" as const,
      message: "Fire alarm test scheduled",
      module: "Control Hub",
    };

    const response = await handleIncidentReport(incident);

    expect(response).toBeDefined();
    expect(response.riskScore).toBe(0.4);
    expect(response.compliance).toContain("ISM Code 9.1");
    expect(response.compliance).toContain("ISPS Code Part B-16");
  });

  it("should handle minor maintenance delay", async () => {
    const incident = {
      type: "Maintenance Delay",
      severity: "Minor" as const,
      message: "Routine maintenance postponed by 2 days",
      module: "Maintenance Orchestrator",
    };

    const response = await handleIncidentReport(incident);

    expect(response).toBeDefined();
    expect(response.riskScore).toBe(0.2);
    expect(response.compliance).toContain("IMCA M103");
    expect(response.compliance).toContain("ISM Code 10.3");
  });

  it("should persist incident to Supabase", async () => {
    const incident = {
      type: "System Event",
      severity: "Critical" as const,
      message: "System restart required",
      module: "SGSO Module",
    };

    await handleIncidentReport(incident);

    expect(mockInsert).toHaveBeenCalled();
    const insertedData = mockInsert.mock.calls[0][0];
    expect(insertedData.type).toBe("System Event");
    expect(insertedData.severity).toBe("Critical");
    expect(insertedData.module).toBe("SGSO Module");
    expect(insertedData.riskScore).toBe(0.9);
  });

  it("should not throw error when MQTT is not configured", async () => {
    // This test ensures the function doesn't crash when MQTT URL is not set
    const incident = {
      type: "Operational Anomaly",
      severity: "Minor" as const,
      message: "Minor deviation detected",
      module: "DP Advisor",
    };

    await expect(handleIncidentReport(incident)).resolves.not.toThrow();
  });

  it("should map compliance standards for unknown incident type", async () => {
    const incident = {
      type: "Unknown Type",
      severity: "Moderate" as const,
      message: "Unknown incident occurred",
      module: "Test Module",
    };

    const response = await handleIncidentReport(incident);

    expect(response).toBeDefined();
    // Should default to MTS Guidelines and NORMAM 101
    expect(response.compliance).toContain("MTS Guidelines");
    expect(response.compliance).toContain("NORMAM 101");
  });

  it("should generate unique IDs for different incidents", async () => {
    const incident1 = {
      type: "DP Failure",
      severity: "Critical" as const,
      message: "First incident",
      module: "DP Advisor",
    };

    const incident2 = {
      type: "DP Failure",
      severity: "Critical" as const,
      message: "Second incident",
      module: "DP Advisor",
    };

    const response1 = await handleIncidentReport(incident1);
    const response2 = await handleIncidentReport(incident2);

    expect(response1.id).not.toBe(response2.id);
  });

  it("should include all required fields in response", async () => {
    const incident = {
      type: "Safety Alert",
      severity: "Major" as const,
      message: "Security breach detected",
      module: "Control Hub",
    };

    const response = await handleIncidentReport(incident);

    expect(response).toHaveProperty("id");
    expect(response).toHaveProperty("timestamp");
    expect(response).toHaveProperty("module");
    expect(response).toHaveProperty("type");
    expect(response).toHaveProperty("severity");
    expect(response).toHaveProperty("message");
    expect(response).toHaveProperty("riskScore");
    expect(response).toHaveProperty("compliance");
    expect(Array.isArray(response.compliance)).toBe(true);
  });

  it("should not have duplicate compliance standards", async () => {
    const incident = {
      type: "DP Failure",
      severity: "Critical" as const,
      message: "Critical DP failure",
      module: "DP Advisor",
    };

    const response = await handleIncidentReport(incident);

    const uniqueStandards = new Set(response.compliance);
    expect(uniqueStandards.size).toBe(response.compliance.length);
  });
});
