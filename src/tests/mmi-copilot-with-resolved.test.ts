import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCopilotRecommendation,
  getCopilotRecommendationStreaming,
  getHistoricalActions,
  addResolvedAction,
} from "@/services/mmi/copilotApi";
import { supabase } from "@/integrations/supabase/client";

// Mock the Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe("MMI Copilot with Resolved Actions API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCopilotRecommendation", () => {
    it("should call the mmi-copilot-with-resolved function with correct parameters", async () => {
      const mockResponse = {
        data: {
          reply: "Recomendação baseada em histórico",
          historicalContext: [
            {
              componente: "Sistema Hidráulico Principal",
              acao_realizada: "Substituição de válvula",
              efetiva: true,
            },
          ],
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const request = {
        prompt: "Manutenção preventiva do sistema hidráulico necessária",
        componente: "Sistema Hidráulico Principal",
      };

      const result = await getCopilotRecommendation(request);

      expect(supabase.functions.invoke).toHaveBeenCalledWith("mmi-copilot-with-resolved", {
        body: request,
      });
      expect(result.reply).toBe("Recomendação baseada em histórico");
      expect(result.historicalContext).toHaveLength(1);
    });

    it("should handle errors from the function call", async () => {
      const mockError = new Error("Function error");
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(
        getCopilotRecommendation({ prompt: "test prompt" })
      ).rejects.toThrow();
    });

    it("should work without component parameter", async () => {
      const mockResponse = {
        data: {
          reply: "Recomendação geral",
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const result = await getCopilotRecommendation({ prompt: "Análise geral" });

      expect(result.reply).toBe("Recomendação geral");
      expect(result.historicalContext).toEqual([]);
    });
  });

  describe("getCopilotRecommendationStreaming", () => {
    it("should handle streaming environment check", async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const mockOnChunk = vi.fn();

      // This will fail due to missing environment variables in test,
      // but we're testing that it tries to get the session
      await expect(
        getCopilotRecommendationStreaming({ prompt: "test" }, mockOnChunk)
      ).rejects.toThrow();

      expect(supabase.auth.getSession).toHaveBeenCalled();
    });
  });

  describe("getHistoricalActions", () => {
    it("should query historical actions for a specific component", async () => {
      const mockData = [
        {
          job_id: "123",
          componente: "Sistema Hidráulico Principal",
          descricao_tecnica: "Vazamento no sistema",
          acao_realizada: "Troca de vedação",
          causa_confirmada: "Vedação deteriorada",
          efetiva: true,
          resolvido_em: "2025-01-01T00:00:00Z",
          duracao_execucao: "2 hours",
        },
        {
          job_id: "124",
          componente: "Sistema Hidráulico Principal",
          descricao_tecnica: "Pressão baixa",
          acao_realizada: "Ajuste de bomba",
          causa_confirmada: "Bomba desregulada",
          efetiva: true,
          resolvido_em: "2025-01-02T00:00:00Z",
          duracao_execucao: "1 hour",
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getHistoricalActions("Sistema Hidráulico Principal");

      expect(supabase.from).toHaveBeenCalledWith("mmi_os_ia_feed");
      expect(mockQuery.select).toHaveBeenCalledWith("*");
      expect(mockQuery.eq).toHaveBeenCalledWith("componente", "Sistema Hidráulico Principal");
      expect(mockQuery.eq).toHaveBeenCalledWith("efetiva", true);
      expect(mockQuery.order).toHaveBeenCalledWith("resolvido_em", { ascending: false });
      expect(mockQuery.limit).toHaveBeenCalledWith(3);
      expect(result).toHaveLength(2);
      expect(result[0].acao_realizada).toBe("Troca de vedação");
    });

    it("should respect custom limit parameter", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      await getHistoricalActions("Test Component", 5);

      expect(mockQuery.limit).toHaveBeenCalledWith(5);
    });

    it("should handle errors when querying historical actions", async () => {
      const mockError = new Error("Database error");
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      await expect(getHistoricalActions("Test Component")).rejects.toThrow();
    });

    it("should return empty array when no historical actions found", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getHistoricalActions("Nonexistent Component");

      expect(result).toEqual([]);
    });
  });

  describe("addResolvedAction", () => {
    it("should insert a new resolved action record", async () => {
      const mockInsertedData = {
        id: "new-id-123",
        created_at: "2025-01-15T00:00:00Z",
      };

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockInsertedData, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const actionData = {
        os_id: "OS-2025-001",
        componente: "Gerador Principal",
        descricao_tecnica: "Ruído anormal detectado",
        acao_realizada: "Ajuste de rolamentos",
        efetiva: true,
        causa_confirmada: "Rolamentos desgastados",
        duracao_execucao: "3 hours",
      };

      const result = await addResolvedAction(actionData);

      expect(supabase.from).toHaveBeenCalledWith("mmi_os_resolvidas");
      expect(mockQuery.insert).toHaveBeenCalledWith(actionData);
      expect(mockQuery.select).toHaveBeenCalledWith("id, created_at");
      expect(mockQuery.single).toHaveBeenCalled();
      expect(result.id).toBe("new-id-123");
      expect(result.created_at).toBe("2025-01-15T00:00:00Z");
    });

    it("should handle errors when inserting resolved action", async () => {
      const mockError = new Error("Insert error");
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      await expect(
        addResolvedAction({
          os_id: "OS-2025-002",
          componente: "Test Component",
        })
      ).rejects.toThrow();
    });

    it("should accept minimal required fields", async () => {
      const mockInsertedData = {
        id: "new-id-456",
        created_at: "2025-01-15T00:00:00Z",
      };

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockInsertedData, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const minimalData = {
        os_id: "OS-2025-003",
      };

      const result = await addResolvedAction(minimalData);

      expect(result.id).toBe("new-id-456");
      expect(mockQuery.insert).toHaveBeenCalledWith(minimalData);
    });
  });

  describe("Integration scenarios", () => {
    it("should demonstrate full workflow: get historical actions, get recommendation, add resolved action", async () => {
      // Step 1: Get historical actions
      const historicalMockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [
            {
              componente: "Motor Principal",
              acao_realizada: "Troca de filtro",
              efetiva: true,
            },
          ],
          error: null,
        }),
      };

      // Step 2: Get recommendation
      const recommendationResponse = {
        data: {
          reply: "Baseado no histórico, recomendo troca de filtro",
          historicalContext: [],
        },
        error: null,
      };

      // Step 3: Add resolved action
      const addActionMockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: "action-123", created_at: "2025-01-15T00:00:00Z" },
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === "mmi_os_ia_feed") {
          return historicalMockQuery as any;
        } else if (table === "mmi_os_resolvidas") {
          return addActionMockQuery as any;
        }
        return {} as any;
      });

      vi.mocked(supabase.functions.invoke).mockResolvedValue(recommendationResponse);

      // Execute workflow
      const historical = await getHistoricalActions("Motor Principal");
      expect(historical).toHaveLength(1);

      const recommendation = await getCopilotRecommendation({
        prompt: "Análise do motor",
        componente: "Motor Principal",
      });
      expect(recommendation.reply).toContain("histórico");

      const added = await addResolvedAction({
        os_id: "OS-2025-004",
        componente: "Motor Principal",
        acao_realizada: "Troca de filtro realizada",
        efetiva: true,
      });
      expect(added.id).toBe("action-123");
    });
  });
});
