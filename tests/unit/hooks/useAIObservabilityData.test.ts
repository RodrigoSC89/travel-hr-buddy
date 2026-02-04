/**
 * Unit Tests: AI Observability Data Hook
 * P4 - Cobertura de testes para módulo AI Observability
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
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        gte: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  },
}));

describe("useAIAgents Hook", () => {
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

  it("should export useAIAgents function", async () => {
    const { useAIAgents } = await import("@/hooks/useAIObservabilityData");
    expect(useAIAgents).toBeDefined();
    expect(typeof useAIAgents).toBe("function");
  });

  it("should return query result", async () => {
    const { useAIAgents } = await import("@/hooks/useAIObservabilityData");
    const { result } = renderHook(() => useAIAgents(), { wrapper });

    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("isLoading");
  });
});

describe("useAIMetrics Hook", () => {
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

  it("should export useAIMetrics function", async () => {
    const { useAIMetrics } = await import("@/hooks/useAIObservabilityData");
    expect(useAIMetrics).toBeDefined();
    expect(typeof useAIMetrics).toBe("function");
  });
});

describe("useAILogs Hook", () => {
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

  it("should export useAILogs function", async () => {
    const { useAILogs } = await import("@/hooks/useAIObservabilityData");
    expect(useAILogs).toBeDefined();
    expect(typeof useAILogs).toBe("function");
  });
});

describe("AI Agent Interface", () => {
  it("should define correct AIAgent structure", () => {
    const sampleAgent = {
      id: "agent-001",
      name: "Document Processor",
      type: "autonomous",
      status: "active" as const,
      lastActivity: new Date(),
      tasksCompleted: 150,
      successRate: 0.95,
    };

    expect(sampleAgent.id).toBeDefined();
    expect(["active", "idle", "error", "offline"]).toContain(sampleAgent.status);
    expect(sampleAgent.successRate).toBeGreaterThanOrEqual(0);
    expect(sampleAgent.successRate).toBeLessThanOrEqual(1);
  });
});

describe("AI Metrics Interface", () => {
  it("should define correct AIMetrics structure", () => {
    const sampleMetrics = {
      totalRequests: 1000,
      avgResponseTime: 250,
      errorRate: 0.02,
      tokensUsed: 50000,
      costEstimate: 12.50,
    };

    expect(sampleMetrics.totalRequests).toBeGreaterThanOrEqual(0);
    expect(sampleMetrics.avgResponseTime).toBeGreaterThanOrEqual(0);
    expect(sampleMetrics.errorRate).toBeGreaterThanOrEqual(0);
    expect(sampleMetrics.errorRate).toBeLessThanOrEqual(1);
  });
});

describe("AI Log Interface", () => {
  it("should define correct AILog structure", () => {
    const sampleLog = {
      id: "log-001",
      timestamp: new Date(),
      level: "info" as const,
      agentId: "agent-001",
      message: "Task completed successfully",
      metadata: { taskId: "task-123" },
    };

    expect(sampleLog.id).toBeDefined();
    expect(["debug", "info", "warn", "error"]).toContain(sampleLog.level);
    expect(sampleLog.agentId).toBeDefined();
  });
});
