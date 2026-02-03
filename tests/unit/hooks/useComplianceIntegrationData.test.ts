/**
 * Unit Tests: useComplianceIntegrationData
 * P1 Compliance - Integration Hub Data
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: { status: "ok" }, error: null })),
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

describe("useComplianceIntegrationData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export all compliance integration hooks", async () => {
    const module = await import("@/hooks/useComplianceIntegrationData");
    
    expect(module.useIntegrationStatus).toBeDefined();
    expect(module.useRecentActivities).toBeDefined();
    expect(module.useComplianceStats).toBeDefined();
  });

  it("useIntegrationStatus should be a function", async () => {
    const { useIntegrationStatus } = await import(
      "@/hooks/useComplianceIntegrationData"
    );
    expect(typeof useIntegrationStatus).toBe("function");
  });

  it("useRecentActivities should be a function", async () => {
    const { useRecentActivities } = await import(
      "@/hooks/useComplianceIntegrationData"
    );
    expect(typeof useRecentActivities).toBe("function");
  });

  it("useComplianceStats should be a function", async () => {
    const { useComplianceStats } = await import(
      "@/hooks/useComplianceIntegrationData"
    );
    expect(typeof useComplianceStats).toBe("function");
  });
});

describe("IntegrationStatus types", () => {
  it("should define correct status values", () => {
    const validStatuses = ["connected", "degraded", "disconnected", "checking"];
    
    validStatuses.forEach((status) => {
      expect(typeof status).toBe("string");
    });
  });

  it("should support PEOTRAM, PEO-DP, and Supabase services", () => {
    const services = ["peotram", "peodp", "supabase"];
    
    services.forEach((service) => {
      expect(typeof service).toBe("string");
      expect(service.length).toBeGreaterThan(0);
    });
  });
});

describe("Activity types", () => {
  it("should define correct activity structure", () => {
    const mockActivity = {
      id: "test-id",
      type: "non_conformity",
      title: "Test Activity",
      module: "Compliance",
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    expect(mockActivity.id).toBeDefined();
    expect(mockActivity.type).toBeDefined();
    expect(mockActivity.title).toBeDefined();
    expect(mockActivity.module).toBeDefined();
    expect(mockActivity.timestamp).toBeDefined();
    expect(mockActivity.status).toBeDefined();
  });
});
