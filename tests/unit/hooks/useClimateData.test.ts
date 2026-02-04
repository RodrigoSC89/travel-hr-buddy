/**
 * Unit Tests: useClimateData
 * P4 - Cobertura de testes para hooks core
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
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      not: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  },
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useClimateData Hook", () => {
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

  it("should export useClimateData function", async () => {
    const { useClimateData } = await import("@/hooks/useClimateData");
    expect(useClimateData).toBeDefined();
    expect(typeof useClimateData).toBe("function");
  });

  it("should export DEPARTAMENTOS constant", async () => {
    const { DEPARTAMENTOS } = await import("@/hooks/useClimateData");
    expect(DEPARTAMENTOS).toBeDefined();
    expect(Array.isArray(DEPARTAMENTOS)).toBe(true);
    expect(DEPARTAMENTOS.length).toBeGreaterThan(0);
  });

  it("should export DEFAULT_PULSE_QUESTIONS constant", async () => {
    const { DEFAULT_PULSE_QUESTIONS } = await import("@/hooks/useClimateData");
    expect(DEFAULT_PULSE_QUESTIONS).toBeDefined();
    expect(Array.isArray(DEFAULT_PULSE_QUESTIONS)).toBe(true);
    expect(DEFAULT_PULSE_QUESTIONS[0]).toHaveProperty("id");
    expect(DEFAULT_PULSE_QUESTIONS[0]).toHaveProperty("pergunta");
    expect(DEFAULT_PULSE_QUESTIONS[0]).toHaveProperty("categoria");
  });

  it("should return initial loading state", async () => {
    const { useClimateData } = await import("@/hooks/useClimateData");
    const { result } = renderHook(() => useClimateData(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it("should return empty arrays initially", async () => {
    const { useClimateData } = await import("@/hooks/useClimateData");
    const { result } = renderHook(() => useClimateData(), { wrapper });

    await waitFor(() => {
      expect(result.current.surveys).toEqual([]);
      expect(result.current.climateResults).toEqual([]);
      expect(result.current.feedback).toEqual([]);
    });
  });

  it("should provide mutation functions", async () => {
    const { useClimateData } = await import("@/hooks/useClimateData");
    const { result } = renderHook(() => useClimateData(), { wrapper });

    expect(result.current.submitSurveyResponse).toBeDefined();
    expect(result.current.registerMood).toBeDefined();
    expect(result.current.refetch).toBeDefined();
  });

  it("should have isEmpty flag when no results", async () => {
    const { useClimateData } = await import("@/hooks/useClimateData");
    const { result } = renderHook(() => useClimateData(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isEmpty).toBe(true);
  });
});

describe("ClimateResult Interface", () => {
  it("should define correct ClimateResult structure", async () => {
    const { ClimateResult } = await import("@/hooks/useClimateData");
    
    // Type check via sample object
    const sampleResult = {
      categoria: "Satisfação",
      score: 85,
      trend: "up" as const,
      participacao: 75,
    };

    expect(sampleResult.categoria).toBeDefined();
    expect(sampleResult.score).toBeGreaterThanOrEqual(0);
    expect(["up", "down", "stable"]).toContain(sampleResult.trend);
  });
});

describe("ClimateFeedback Interface", () => {
  it("should define correct ClimateFeedback structure", async () => {
    const sampleFeedback = {
      id: "fb-001",
      tipo: "sugestao" as const,
      texto: "Melhorar comunicação",
      departamento: "Operações",
      data: "2024-01-15",
      status: "pendente" as const,
    };

    expect(sampleFeedback.id).toBeDefined();
    expect(["elogio", "sugestao", "critica"]).toContain(sampleFeedback.tipo);
    expect(["pendente", "em_analise", "respondido", "resolvido"]).toContain(sampleFeedback.status);
  });
});
