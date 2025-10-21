import { describe, it, expect, vi, beforeEach } from "vitest";
import { AIInsightReporter } from "@/lib/ai/ai-insight-reporter";

// Mock the dependencies
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { status: "ok" }, error: null }),
    },
  })),
}));

vi.mock("@/lib/mqtt/secure-client", () => ({
  initSecureMQTT: vi.fn(() => ({
    publish: vi.fn(),
    on: vi.fn(),
    end: vi.fn(),
  })),
}));

describe("AIInsightReporter", () => {
  let reporter: AIInsightReporter;

  beforeEach(() => {
    reporter = new AIInsightReporter();
  });

  it("should create an instance of AIInsightReporter", () => {
    expect(reporter).toBeInstanceOf(AIInsightReporter);
  });

  it("should report an incident with info severity", async () => {
    const event = {
      module: "TestModule",
      severity: "info" as const,
      message: "Test incident",
      metadata: { test: true },
    };

    await expect(reporter.report(event)).resolves.not.toThrow();
  });

  it("should report an incident with warning severity", async () => {
    const event = {
      module: "TestModule",
      severity: "warning" as const,
      message: "Warning test",
    };

    await expect(reporter.report(event)).resolves.not.toThrow();
  });

  it("should report an incident with critical severity", async () => {
    const event = {
      module: "TestModule",
      severity: "critical" as const,
      message: "Critical test",
    };

    await expect(reporter.report(event)).resolves.not.toThrow();
  });
});
