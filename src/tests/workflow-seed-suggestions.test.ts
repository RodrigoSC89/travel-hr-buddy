/**
 * Tests for Workflow Suggestions Seeder
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  seedSuggestionsForWorkflow,
  getAvailableTemplates,
  getTemplateSuggestions,
} from "@/lib/workflows/seedSuggestions";

// Mock the supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe("Workflow Suggestions Seeder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("seedSuggestionsForWorkflow", () => {
    it("should seed suggestions for a default workflow", async () => {
      const mockUser = { id: "user-123" };
      const mockSteps = [
        {
          id: "step-1",
          workflow_id: "workflow-123",
          title: "Planejamento inicial",
          status: "pendente",
        },
      ];

      const { supabase } = await import("@/integrations/supabase/client");

      (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = vi.fn().mockResolvedValue({ data: mockSteps, error: null });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
      });

      const result = await seedSuggestionsForWorkflow({
        workflowId: "workflow-123",
        workflowTitle: "Test Workflow",
      });

      expect(result.success).toBe(true);
      expect(result.suggestions).toEqual(mockSteps);
      expect(mockInsert).toHaveBeenCalled();
    });

    it("should use maintenance template for maintenance workflows", async () => {
      const mockUser = { id: "user-123" };
      const mockSteps = [
        {
          id: "step-1",
          workflow_id: "workflow-123",
          title: "Inspeção inicial",
          status: "pendente",
        },
      ];

      const { supabase } = await import("@/integrations/supabase/client");

      (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = vi.fn().mockResolvedValue({ data: mockSteps, error: null });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
      });

      const result = await seedSuggestionsForWorkflow({
        workflowId: "workflow-123",
        workflowTitle: "Manutenção Preventiva",
      });

      expect(result.success).toBe(true);
      expect(result.suggestions).toEqual(mockSteps);
    });

    it("should use audit template for audit workflows", async () => {
      const mockUser = { id: "user-123" };
      const mockSteps = [
        {
          id: "step-1",
          workflow_id: "workflow-123",
          title: "Preparação da auditoria",
          status: "pendente",
        },
      ];

      const { supabase } = await import("@/integrations/supabase/client");

      (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = vi.fn().mockResolvedValue({ data: mockSteps, error: null });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
      });

      const result = await seedSuggestionsForWorkflow({
        workflowId: "workflow-123",
        workflowTitle: "Auditoria Interna",
      });

      expect(result.success).toBe(true);
      expect(result.suggestions).toEqual(mockSteps);
    });

    it("should use template based on category", async () => {
      const mockUser = { id: "user-123" };
      const mockSteps = [
        {
          id: "step-1",
          workflow_id: "workflow-123",
          title: "Levantamento de necessidades",
          status: "pendente",
        },
      ];

      const { supabase } = await import("@/integrations/supabase/client");

      (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = vi.fn().mockResolvedValue({ data: mockSteps, error: null });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
      });

      const result = await seedSuggestionsForWorkflow({
        workflowId: "workflow-123",
        workflowTitle: "Test Workflow",
        category: "treinamento",
      });

      expect(result.success).toBe(true);
      expect(result.suggestions).toEqual(mockSteps);
    });

    it("should limit suggestions to maxSuggestions", async () => {
      const mockUser = { id: "user-123" };
      const mockSteps = [
        {
          id: "step-1",
          workflow_id: "workflow-123",
          title: "Planejamento inicial",
          status: "pendente",
        },
        {
          id: "step-2",
          workflow_id: "workflow-123",
          title: "Análise de requisitos",
          status: "pendente",
        },
      ];

      const { supabase } = await import("@/integrations/supabase/client");

      (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = vi.fn().mockResolvedValue({ data: mockSteps, error: null });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
      });

      const result = await seedSuggestionsForWorkflow({
        workflowId: "workflow-123",
        workflowTitle: "Test Workflow",
        maxSuggestions: 2,
      });

      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ workflow_id: "workflow-123" }),
        ])
      );
    });

    it("should return error when user is not authenticated", async () => {
      const { supabase } = await import("@/integrations/supabase/client");

      (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const result = await seedSuggestionsForWorkflow({
        workflowId: "workflow-123",
        workflowTitle: "Test Workflow",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not authenticated");
      expect(result.suggestions).toEqual([]);
    });

    it("should return error when database insert fails", async () => {
      const mockUser = { id: "user-123" };
      const { supabase } = await import("@/integrations/supabase/client");

      (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
      });

      const result = await seedSuggestionsForWorkflow({
        workflowId: "workflow-123",
        workflowTitle: "Test Workflow",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error");
      expect(result.suggestions).toEqual([]);
    });
  });

  describe("getAvailableTemplates", () => {
    it("should return list of available templates", () => {
      const templates = getAvailableTemplates();

      expect(templates).toContain("default");
      expect(templates).toContain("manutenção");
      expect(templates).toContain("auditoria");
      expect(templates).toContain("treinamento");
      expect(templates).toContain("projeto");
      expect(templates.length).toBeGreaterThan(0);
    });
  });

  describe("getTemplateSuggestions", () => {
    it("should return default template suggestions", () => {
      const suggestions = getTemplateSuggestions("default");

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toHaveProperty("title");
      expect(suggestions[0]).toHaveProperty("description");
      expect(suggestions[0]).toHaveProperty("priority");
      expect(suggestions[0]).toHaveProperty("position");
      expect(suggestions[0]).toHaveProperty("tags");
    });

    it("should return maintenance template suggestions", () => {
      const suggestions = getTemplateSuggestions("manutenção");

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].title).toContain("Inspeção");
    });

    it("should return default template for unknown template name", () => {
      const suggestions = getTemplateSuggestions("unknown-template");

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].title).toBe("Planejamento inicial");
    });

    it("should handle case-insensitive template names", () => {
      const suggestions = getTemplateSuggestions("AUDITORIA");

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });
});
