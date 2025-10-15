/**
 * Tests for resolved work orders service
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createResolvedWorkOrder,
  getResolvedWorkOrdersByComponent,
  getAiLearningFeed,
  getResolvedWorkOrderStats,
  updateWorkOrderEffectiveness,
  getMostCommonCauses,
  getMostEffectiveActions,
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
        os_id: "OS-001",
        componente: "Bomba Hidráulica",
        descricao_tecnica: "Vazamento no selo",
        acao_realizada: "Substituição do selo",
        efetiva: true,
        causa_confirmada: "Desgaste natural",
        resolvido_em: "2025-10-15T10:00:00Z",
        duracao_execucao: "2 hours",
        evidencia_url: null,
        job_id: null,
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
        os_id: "OS-001",
        componente: "Bomba Hidráulica",
        descricao_tecnica: "Vazamento no selo",
        acao_realizada: "Substituição do selo",
        efetiva: true,
        causa_confirmada: "Desgaste natural",
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
          os_id: "OS-001",
          componente: "Bomba Hidráulica",
          efetiva: true,
        },
        {
          id: "124",
          os_id: "OS-002",
          componente: "Bomba Hidráulica",
          efetiva: false,
        },
      ];

      const { supabase } = await import("@/integrations/supabase/client");
      
      // Create a chainable mock object
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
      expect(queryChain.eq).toHaveBeenCalledWith("componente", "Bomba Hidráulica");
    });

    it("should filter by effectiveness when requested", async () => {
      const mockData = [
        {
          id: "123",
          os_id: "OS-001",
          componente: "Bomba Hidráulica",
          efetiva: true,
        },
      ];

      const { supabase } = await import("@/integrations/supabase/client");
      
      // Create a chainable mock object
      const queryChain = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      
      const mockSelect = vi.fn().mockReturnValue(queryChain);
      
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
      });

      const result = await getResolvedWorkOrdersByComponent("Bomba Hidráulica", true);

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(queryChain.eq).toHaveBeenCalledWith("componente", "Bomba Hidráulica");
      expect(queryChain.eq).toHaveBeenCalledWith("efetiva", true);
    });
  });

  describe("getAiLearningFeed", () => {
    it("should fetch AI learning feed data", async () => {
      const mockData = [
        {
          componente: "Bomba Hidráulica",
          descricao_tecnica: "Vazamento",
          acao_realizada: "Substituição",
          causa_confirmada: "Desgaste",
          efetiva: true,
          resolvido_em: "2025-10-15T10:00:00Z",
          duracao_execucao: "2 hours",
          job_id: null,
        },
      ];

      const { supabase } = await import("@/integrations/supabase/client");
      const mockLimit = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockOrder = vi.fn().mockReturnValue({
        limit: mockLimit,
      });
      const mockSelect = vi.fn().mockReturnValue({
        order: mockOrder,
      });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
      });

      const result = await getAiLearningFeed();

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith("mmi_os_ia_feed");
    });
  });

  describe("getResolvedWorkOrderStats", () => {
    it("should calculate statistics correctly", async () => {
      const mockData = [
        {
          id: "1",
          efetiva: true,
          duracao_execucao: "2 hours",
          componente: "Test",
          os_id: "OS-001",
          descricao_tecnica: null,
          acao_realizada: null,
          resolvido_em: null,
          causa_confirmada: null,
          evidencia_url: null,
          job_id: null,
          created_at: "2025-10-15T10:00:00Z",
        },
        {
          id: "2",
          efetiva: true,
          duracao_execucao: "1 hour",
          componente: "Test",
          os_id: "OS-002",
          descricao_tecnica: null,
          acao_realizada: null,
          resolvido_em: null,
          causa_confirmada: null,
          evidencia_url: null,
          job_id: null,
          created_at: "2025-10-15T10:00:00Z",
        },
        {
          id: "3",
          efetiva: false,
          duracao_execucao: null,
          componente: "Test",
          os_id: "OS-003",
          descricao_tecnica: null,
          acao_realizada: null,
          resolvido_em: null,
          causa_confirmada: null,
          evidencia_url: null,
          job_id: null,
          created_at: "2025-10-15T10:00:00Z",
        },
        {
          id: "4",
          efetiva: null,
          duracao_execucao: null,
          componente: "Test",
          os_id: "OS-004",
          descricao_tecnica: null,
          acao_realizada: null,
          resolvido_em: null,
          causa_confirmada: null,
          evidencia_url: null,
          job_id: null,
          created_at: "2025-10-15T10:00:00Z",
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
        effective: 2,
        ineffective: 1,
        pending: 1,
        effectivenessRate: 50,
        avgDurationMinutes: 90, // (120 + 60) / 2
      });
      expect(result.error).toBeNull();
    });
  });

  describe("updateWorkOrderEffectiveness", () => {
    it("should update effectiveness status", async () => {
      const mockData = {
        id: "123",
        efetiva: true,
        causa_confirmada: "Desgaste natural",
      };

      const { supabase } = await import("@/integrations/supabase/client");
      const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle,
      });
      const mockEq = vi.fn().mockReturnValue({
        select: mockSelect,
      });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: mockUpdate,
      });

      const result = await updateWorkOrderEffectiveness("123", true, "Desgaste natural");

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(mockUpdate).toHaveBeenCalledWith({
        efetiva: true,
        causa_confirmada: "Desgaste natural",
      });
    });
  });

  describe("getMostCommonCauses", () => {
    it("should return most common causes sorted by count", async () => {
      const mockData = [
        { causa_confirmada: "Desgaste natural" },
        { causa_confirmada: "Desgaste natural" },
        { causa_confirmada: "Falta de manutenção" },
        { causa_confirmada: "Desgaste natural" },
      ];

      const { supabase } = await import("@/integrations/supabase/client");
      const mockNot = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockEq = vi.fn().mockReturnValue({
        not: mockNot,
      });
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
      });

      const result = await getMostCommonCauses("Bomba Hidráulica", 5);

      expect(result.data).toEqual([
        { causa: "Desgaste natural", count: 3 },
        { causa: "Falta de manutenção", count: 1 },
      ]);
      expect(result.error).toBeNull();
    });
  });

  describe("getMostEffectiveActions", () => {
    it("should calculate success rate for actions", async () => {
      const mockData = [
        { acao_realizada: "Substituição", efetiva: true },
        { acao_realizada: "Substituição", efetiva: true },
        { acao_realizada: "Substituição", efetiva: false },
        { acao_realizada: "Reparo", efetiva: true },
      ];

      const { supabase } = await import("@/integrations/supabase/client");
      const mockNot2 = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockNot1 = vi.fn().mockReturnValue({
        not: mockNot2,
      });
      const mockEq = vi.fn().mockReturnValue({
        not: mockNot1,
      });
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
      });

      const result = await getMostEffectiveActions("Bomba Hidráulica", 5);

      expect(result.data).toEqual([
        { acao: "Reparo", successRate: 100, count: 1 },
        { acao: "Substituição", successRate: expect.closeTo(66.67, 0.1), count: 3 },
      ]);
      expect(result.error).toBeNull();
    });
  });
});
