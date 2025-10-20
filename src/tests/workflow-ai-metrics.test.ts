import { describe, it, expect, beforeEach, vi } from "vitest";
import { getWorkflowAISummary } from "@/lib/analytics/workflowAIMetrics";
import { supabase } from "@/integrations/supabase/client";

// Mock the supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("Workflow AI Metrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWorkflowAISummary", () => {
    it("should return correct metrics with valid data", async () => {
      // Mock data: 12 total suggestions, 9 accepted
      const mockAllSuggestions = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        etapa: `Step ${i + 1}`,
        tipo_sugestao: "improvement",
        conteudo: `Content ${i + 1}`,
        criticidade: "medium",
        responsavel_sugerido: "User",
        origem: i < 9 ? "Copilot" : "Other",
      }));

      const mockAcceptedSuggestions = mockAllSuggestions
        .filter((s) => s.origem === "Copilot")
        .map((s) => ({ etapa: s.etapa }));

      // Mock the first call for all suggestions
      const selectMock1 = vi.fn().mockResolvedValue({
        data: mockAllSuggestions,
        error: null,
      });

      // Mock the second call for accepted suggestions
      const eqMock = vi.fn().mockResolvedValue({
        data: mockAcceptedSuggestions,
        error: null,
      });

      const selectMock2 = vi.fn().mockReturnValue({ eq: eqMock });

      const fromMock = vi.fn()
        .mockReturnValueOnce({ select: selectMock1 })
        .mockReturnValueOnce({ select: selectMock2 });

      vi.mocked(supabase.from).mockImplementation(fromMock);

      const result = await getWorkflowAISummary();

      expect(result).toBeDefined();
      expect(result.total).toBe(12);
      expect(result.aceitas).toBe(9);
      expect(result.taxa).toBe("75.0");
    });

    it("should handle empty suggestions table", async () => {
      const selectMock1 = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const eqMock = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const selectMock2 = vi.fn().mockReturnValue({ eq: eqMock });

      const fromMock = vi.fn()
        .mockReturnValueOnce({ select: selectMock1 })
        .mockReturnValueOnce({ select: selectMock2 });

      vi.mocked(supabase.from).mockImplementation(fromMock);

      const result = await getWorkflowAISummary();

      expect(result).toBeDefined();
      expect(result.total).toBe(0);
      expect(result.aceitas).toBe(0);
      expect(result.taxa).toBe("0.0");
    });

    it("should handle database errors gracefully", async () => {
      const selectMock1 = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Database connection error" },
      });

      const eqMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Database connection error" },
      });

      const selectMock2 = vi.fn().mockReturnValue({ eq: eqMock });

      const fromMock = vi.fn()
        .mockReturnValueOnce({ select: selectMock1 })
        .mockReturnValueOnce({ select: selectMock2 });

      vi.mocked(supabase.from).mockImplementation(fromMock);

      const result = await getWorkflowAISummary();

      expect(result).toBeDefined();
      expect(result.total).toBe(0);
      expect(result.aceitas).toBe(0);
      expect(result.taxa).toBe("0.0");
    });

    it("should calculate 100% adoption rate correctly", async () => {
      const mockAllSuggestions = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        etapa: `Step ${i + 1}`,
        origem: "Copilot",
      }));

      const selectMock1 = vi.fn().mockResolvedValue({
        data: mockAllSuggestions,
        error: null,
      });

      const eqMock = vi.fn().mockResolvedValue({
        data: mockAllSuggestions.map((s) => ({ etapa: s.etapa })),
        error: null,
      });

      const selectMock2 = vi.fn().mockReturnValue({ eq: eqMock });

      const fromMock = vi.fn()
        .mockReturnValueOnce({ select: selectMock1 })
        .mockReturnValueOnce({ select: selectMock2 });

      vi.mocked(supabase.from).mockImplementation(fromMock);

      const result = await getWorkflowAISummary();

      expect(result.total).toBe(10);
      expect(result.aceitas).toBe(10);
      expect(result.taxa).toBe("100.0");
    });
  });

  describe("Return type validation", () => {
    it("should return object with correct structure", async () => {
      const selectMock1 = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const eqMock = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const selectMock2 = vi.fn().mockReturnValue({ eq: eqMock });

      const fromMock = vi.fn()
        .mockReturnValueOnce({ select: selectMock1 })
        .mockReturnValueOnce({ select: selectMock2 });

      vi.mocked(supabase.from).mockImplementation(fromMock);

      const result = await getWorkflowAISummary();

      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("aceitas");
      expect(result).toHaveProperty("taxa");
      expect(typeof result.total).toBe("number");
      expect(typeof result.aceitas).toBe("number");
      expect(typeof result.taxa).toBe("string");
    });
  });
});
