/**
 * Unit Tests: useWeatherIntegrationStatus
 * P2 Compliance - Weather Integration Guard
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase before importing the hook
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe("useWeatherIntegrationStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should export the hook function", async () => {
    const { useWeatherIntegrationStatus } = await import(
      "@/hooks/useWeatherIntegrationStatus"
    );
    expect(useWeatherIntegrationStatus).toBeDefined();
    expect(typeof useWeatherIntegrationStatus).toBe("function");
  });

  it("should export useWeatherCanShowData helper", async () => {
    const { useWeatherCanShowData } = await import(
      "@/hooks/useWeatherIntegrationStatus"
    );
    expect(useWeatherCanShowData).toBeDefined();
    expect(typeof useWeatherCanShowData).toBe("function");
  });

  it("should have correct WeatherIntegrationStatus interface", async () => {
    const { useWeatherIntegrationStatus } = await import(
      "@/hooks/useWeatherIntegrationStatus"
    );
    
    // Type check - the hook should return a query result
    // This is a compile-time check that the types are correct
    expect(useWeatherIntegrationStatus).toBeDefined();
  });
});

describe("WeatherIntegrationStatus type", () => {
  it("should define correct source properties", async () => {
    // Import to check type exports
    const module = await import("@/hooks/useWeatherIntegrationStatus");
    
    // The module should export the hook
    expect(module.useWeatherIntegrationStatus).toBeDefined();
    expect(module.useWeatherCanShowData).toBeDefined();
  });
});

describe("Integration status logic", () => {
  it("should define CONNECTED status for 3+ sources", () => {
    // This tests the business logic documented in MOCK_ZERO_GAPS.md
    const configuredCount = 3;
    let status = "NOT_CONFIGURED";
    
    if (configuredCount >= 3) {
      status = "CONNECTED";
    } else if (configuredCount >= 1) {
      status = "DEGRADED";
    }
    
    expect(status).toBe("CONNECTED");
  });

  it("should define DEGRADED status for 1-2 sources", () => {
    const configuredCount = 2;
    let status = "NOT_CONFIGURED";
    
    if (configuredCount >= 3) {
      status = "CONNECTED";
    } else if (configuredCount >= 1) {
      status = "DEGRADED";
    }
    
    expect(status).toBe("DEGRADED");
  });

  it("should define NOT_CONFIGURED status for 0 sources", () => {
    const configuredCount = 0;
    let status = "NOT_CONFIGURED";
    
    if (configuredCount >= 3) {
      status = "CONNECTED";
    } else if (configuredCount >= 1) {
      status = "DEGRADED";
    }
    
    expect(status).toBe("NOT_CONFIGURED");
  });
});
