
/**
 * Tests for resolved work orders service
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createResolvedWorkOrder,
  getResolvedWorkOrdersByComponent,
  getResolvedWorkOrderStats,
} from "@/services/mmi/resolvedWorkOrdersService";

// Mock the supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("Resolved Work Orders Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createResolvedWorkOrder", () => {
    it("should create a resolved work order successfully", async () => {
      const mockData = {
        id: "123",
        titulo: "OS-001 - Bomba Hidráulica",
        componente_nome: "Bomba Hidráulica",
        componente_id: "BH-001",
        descricao: "Vazamento no selo",
        acao_tomada: "Substituição do selo",
        resultado: "Sucesso",
        resolvido_em: "2025-10-15T10:00:00Z",
        created_at: "2025-10-15T10:00:00Z",
      };

      const { supabase } = await import("@/integrations/supabase/client");
      const mockSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      });
      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
      });

      const result = await createResolvedWorkOrder({
        titulo: "OS-001 - Bomba Hidráulica",
        componente_nome: "Bomba Hidráulica",
        componente_id: "BH-001",
        descricao: "Vazamento no selo",
        acao_tomada: "Substituição do selo",
      });

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith("mmi_os_resolvidas");
    });
  });

  describe("getResolvedWorkOrdersByComponent", () => {
    it("should fetch work orders by component", async () => {
      const mockData = [
        {
          id: "123",
          titulo: "OS-001",
          componente_nome: "Bomba Hidráulica",
          resultado: "Sucesso",
        },
        {
          id: "124",
          titulo: "OS-002",
          componente_nome: "Bomba Hidráulica",
          resultado: "Falha",
        },
      ];

      const { supabase } = await import("@/integrations/supabase/client");
      
      const queryChain = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      
      const mockSelect = vi.fn().mockReturnValue(queryChain);
      
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
      });

      const result = await getResolvedWorkOrdersByComponent("Bomba Hidráulica");

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(queryChain.eq).toHaveBeenCalledWith("componente_nome", "Bomba Hidráulica");
    });
  });

  describe("getResolvedWorkOrderStats", () => {
    it("should calculate statistics correctly", async () => {
      const mockData = [
        {
          id: "1",
          resultado: "Sucesso",
          tempo_resolucao_horas: 2,
          componente_nome: "Test",
          titulo: "OS-001",
        },
        {
          id: "2",
          resultado: "Sucesso",
          tempo_resolucao_horas: 1,
          componente_nome: "Test",
          titulo: "OS-002",
        },
        {
          id: "3",
          resultado: "Falha",
          tempo_resolucao_horas: null,
          componente_nome: "Test",
          titulo: "OS-003",
        },
        {
          id: "4",
          resultado: null,
          tempo_resolucao_horas: null,
          componente_nome: "Test",
          titulo: "OS-004",
        },
      ];

      const { supabase } = await import("@/integrations/supabase/client");
      const mockSelect = vi.fn().mockResolvedValue({ data: mockData, error: null });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
      });

      const result = await getResolvedWorkOrderStats();

      expect(result.data).toEqual({
        total: 4,
        successful: 2,
        failed: 1,
        pending: 1,
        successRate: 50,
        avgResolutionHours: 1.5,
      });
      expect(result.error).toBeNull();
    });
  });
});
