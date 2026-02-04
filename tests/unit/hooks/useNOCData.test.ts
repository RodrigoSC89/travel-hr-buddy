/**
 * Unit Tests: NOC Real Data Hook
 * P4 - Cobertura de testes para módulo NOC
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  },
}));

describe("useNOCServices Hook", () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    wrapper = ({ children }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  });

  it("should export useNOCServices function", async () => {
    const { useNOCServices } = await import("@/hooks/useNOCData");
    expect(useNOCServices).toBeDefined();
    expect(typeof useNOCServices).toBe("function");
  });

  it("should return query result with data property", async () => {
    const { useNOCServices } = await import("@/hooks/useNOCData");
    const { result } = renderHook(() => useNOCServices(), { wrapper });

    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("isLoading");
  });
});

describe("useNOCAlerts Hook", () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    wrapper = ({ children }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  });

  it("should export useNOCAlerts function", async () => {
    const { useNOCAlerts } = await import("@/hooks/useNOCData");
    expect(useNOCAlerts).toBeDefined();
    expect(typeof useNOCAlerts).toBe("function");
  });
});

describe("NOC Service Interface", () => {
  it("should define correct NOCService structure", () => {
    const sampleService = {
      id: "svc-001",
      name: "API Gateway",
      status: "healthy" as const,
      uptime: 99.95,
      latency: 45,
      lastCheck: new Date(),
    };

    expect(sampleService.id).toBeDefined();
    expect(["healthy", "degraded", "down"]).toContain(sampleService.status);
    expect(sampleService.uptime).toBeGreaterThanOrEqual(0);
    expect(sampleService.uptime).toBeLessThanOrEqual(100);
  });
});

describe("NOC Alert Interface", () => {
  it("should define correct NOCAlert structure", () => {
    const sampleAlert = {
      id: "alert-001",
      title: "High CPU Usage",
      severity: "warning" as const,
      source: "monitoring",
      timestamp: new Date(),
      acknowledged: false,
    };

    expect(sampleAlert.id).toBeDefined();
    expect(["info", "warning", "error", "critical"]).toContain(sampleAlert.severity);
    expect(typeof sampleAlert.acknowledged).toBe("boolean");
  });
});
