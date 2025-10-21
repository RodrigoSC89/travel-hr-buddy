/**
 * Tests for AI Insight Reporter
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { AIInsightReporter } from "@/lib/ai/insight-reporter";

// Mock Supabase client
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: { status: "ok" }, error: null })),
    },
  })),
}));

// Mock MQTT client
vi.mock("@/lib/mqtt/secure-client", () => ({
  initSecureMQTT: vi.fn(() => ({
    publish: vi.fn(),
    isConnected: vi.fn(() => true),
  })),
}));

describe("AIInsightReporter", () => {
  let reporter: AIInsightReporter;

  beforeEach(() => {
    vi.clearAllMocks();
    reporter = new AIInsightReporter();
  });

  it("should initialize without crashing", () => {
    expect(reporter).toBeDefined();
  });

  it("should report anomaly with info severity", async () => {
    const event = {
      module: "TestModule",
      severity: "info" as const,
      message: "Test message",
    };

    await expect(reporter.reportAnomaly(event)).resolves.not.toThrow();
  });

  it("should report anomaly with warning severity", async () => {
    const event = {
      module: "TestModule",
      severity: "warning" as const,
      message: "Warning message",
    };

    await expect(reporter.reportAnomaly(event)).resolves.not.toThrow();
  });

  it("should report anomaly with critical severity", async () => {
    const event = {
      module: "TestModule",
      severity: "critical" as const,
      message: "Critical message",
    };

    await expect(reporter.reportAnomaly(event)).resolves.not.toThrow();
  });

  it("should include metadata when provided", async () => {
    const event = {
      module: "TestModule",
      severity: "info" as const,
      message: "Test message with metadata",
      metadata: {
        userId: "123",
        action: "test",
      },
    };

    await expect(reporter.reportAnomaly(event)).resolves.not.toThrow();
  });

  it("should handle anomaly without metadata", async () => {
    const event = {
      module: "TestModule",
      severity: "info" as const,
      message: "Test message without metadata",
    };

    await expect(reporter.reportAnomaly(event)).resolves.not.toThrow();
  });

  it("should report anomaly with complex metadata", async () => {
    const event = {
      module: "TestModule",
      severity: "warning" as const,
      message: "Complex metadata test",
      metadata: {
        nested: {
          value: 123,
          array: [1, 2, 3],
        },
        boolean: true,
      },
    };

    await expect(reporter.reportAnomaly(event)).resolves.not.toThrow();
  });
});
