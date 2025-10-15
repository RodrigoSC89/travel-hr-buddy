/**
 * Tests for Workflow API Service Layer
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createWorkflow,
  getWorkflow,
  getWorkflows,
  updateWorkflow,
  deleteWorkflow,
  getWorkflowSteps,
  createWorkflowStep,
  updateWorkflowStep,
  deleteWorkflowStep,
} from "@/services/workflow-api";

// Mock the supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock the seedSuggestionsForWorkflow function
vi.mock("@/lib/workflows/seedSuggestions", () => ({
  seedSuggestionsForWorkflow: vi.fn(),
}));

describe("Workflow API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createWorkflow", () => {
    it("should create a workflow successfully", async () => {
      const mockUser = { id: "user-123" };
      const mockWorkflow = {
        id: "workflow-123",
        title: "Test Workflow",
        description: "Test Description",
        status: "draft",
        created_by: "user-123",
        created_at: "2025-10-15T10:00:00Z",
        updated_at: "2025-10-15T10:00:00Z",
        category: null,
        tags: [],
        config: {},
      };
      const mockSteps = [
        {
          id: "step-1",
          workflow_id: "workflow-123",
          title: "Planejamento inicial",
          status: "pendente",
          position: 0,
          priority: "high",
        },
      ];

      const { supabase } = await import("@/integrations/supabase/client");
      const { seedSuggestionsForWorkflow } = await import("@/lib/workflows/seedSuggestions");

      (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockWorkflow, error: null }),
      });
      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
      });

      (seedSuggestionsForWorkflow as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        suggestions: mockSteps,
      });

      const result = await createWorkflow({
        title: "Test Workflow",
        description: "Test Description",
      });

      expect(result.success).toBe(true);
      expect(result.workflow.title).toBe("Test Workflow");
      expect(result.suggestions).toHaveLength(1);
      expect(mockInsert).toHaveBeenCalled();
    });

    it("should throw error when user is not authenticated", async () => {
      const { supabase } = await import("@/integrations/supabase/client");

      (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      await expect(
        createWorkflow({ title: "Test" })
      ).rejects.toThrow("User not authenticated");
    });

    it("should throw error when workflow creation fails", async () => {
      const mockUser = { id: "user-123" };
      const { supabase } = await import("@/integrations/supabase/client");

      (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      });
      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
      });

      await expect(
        createWorkflow({ title: "Test" })
      ).rejects.toThrow("Database error");
    });
  });

  describe("getWorkflow", () => {
    it("should fetch a workflow by ID", async () => {
      const mockWorkflow = {
        id: "workflow-123",
        title: "Test Workflow",
        status: "draft",
      };

      const { supabase } = await import("@/integrations/supabase/client");
      const mockSingle = vi.fn().mockResolvedValue({ data: mockWorkflow, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
      });

      const result = await getWorkflow("workflow-123");

      expect(result).toEqual(mockWorkflow);
      expect(mockEq).toHaveBeenCalledWith("id", "workflow-123");
    });

    it("should return null when workflow is not found", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
      });

      const result = await getWorkflow("invalid-id");

      expect(result).toBeNull();
    });
  });

  describe("getWorkflows", () => {
    it("should fetch all workflows", async () => {
      const mockWorkflows = [
        { id: "1", title: "Workflow 1" },
        { id: "2", title: "Workflow 2" },
      ];

      const { supabase } = await import("@/integrations/supabase/client");
      const mockOrder = vi.fn().mockResolvedValue({ data: mockWorkflows, error: null });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
      });

      const result = await getWorkflows();

      expect(result).toEqual(mockWorkflows);
      expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
    });

    it("should return empty array on error", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Error" },
      });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
      });

      const result = await getWorkflows();

      expect(result).toEqual([]);
    });
  });

  describe("updateWorkflow", () => {
    it("should update a workflow", async () => {
      const mockUpdatedWorkflow = {
        id: "workflow-123",
        title: "Updated Workflow",
        status: "active",
      };

      const { supabase } = await import("@/integrations/supabase/client");
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockUpdatedWorkflow,
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: mockUpdate,
      });

      const result = await updateWorkflow("workflow-123", { title: "Updated Workflow" });

      expect(result).toEqual(mockUpdatedWorkflow);
      expect(mockUpdate).toHaveBeenCalledWith({ title: "Updated Workflow" });
    });

    it("should return null on error", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Error" },
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: mockUpdate,
      });

      const result = await updateWorkflow("workflow-123", { title: "Updated" });

      expect(result).toBeNull();
    });
  });

  describe("deleteWorkflow", () => {
    it("should delete a workflow successfully", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        delete: mockDelete,
      });

      const result = await deleteWorkflow("workflow-123");

      expect(result).toBe(true);
      expect(mockEq).toHaveBeenCalledWith("id", "workflow-123");
    });

    it("should return false on error", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const mockEq = vi.fn().mockResolvedValue({ error: { message: "Error" } });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        delete: mockDelete,
      });

      const result = await deleteWorkflow("workflow-123");

      expect(result).toBe(false);
    });
  });

  describe("getWorkflowSteps", () => {
    it("should fetch workflow steps", async () => {
      const mockSteps = [
        { id: "step-1", title: "Step 1", position: 0 },
        { id: "step-2", title: "Step 2", position: 1 },
      ];

      const { supabase } = await import("@/integrations/supabase/client");
      const mockOrder = vi.fn().mockResolvedValue({ data: mockSteps, error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
      });

      const result = await getWorkflowSteps("workflow-123");

      expect(result).toEqual(mockSteps);
      expect(mockEq).toHaveBeenCalledWith("workflow_id", "workflow-123");
    });

    it("should return empty array on error", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Error" },
      });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
      });

      const result = await getWorkflowSteps("workflow-123");

      expect(result).toEqual([]);
    });
  });

  describe("createWorkflowStep", () => {
    it("should create a workflow step", async () => {
      const mockUser = { id: "user-123" };
      const mockStep = {
        id: "step-123",
        workflow_id: "workflow-123",
        title: "New Step",
        status: "pendente",
      };

      const { supabase } = await import("@/integrations/supabase/client");

      (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSingle = vi.fn().mockResolvedValue({ data: mockStep, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
      });

      const result = await createWorkflowStep({
        workflow_id: "workflow-123",
        title: "New Step",
        status: "pendente",
      });

      expect(result).toEqual(mockStep);
      expect(mockInsert).toHaveBeenCalled();
    });

    it("should return null when user is not authenticated", async () => {
      const { supabase } = await import("@/integrations/supabase/client");

      (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const result = await createWorkflowStep({
        workflow_id: "workflow-123",
        title: "New Step",
      });

      expect(result).toBeNull();
    });
  });

  describe("updateWorkflowStep", () => {
    it("should update a workflow step", async () => {
      const mockUpdatedStep = {
        id: "step-123",
        title: "Updated Step",
        status: "em_progresso",
      };

      const { supabase } = await import("@/integrations/supabase/client");
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockUpdatedStep,
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: mockUpdate,
      });

      const result = await updateWorkflowStep("step-123", { status: "em_progresso" });

      expect(result).toEqual(mockUpdatedStep);
      expect(mockUpdate).toHaveBeenCalledWith({ status: "em_progresso" });
    });

    it("should return null on error", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Error" },
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: mockUpdate,
      });

      const result = await updateWorkflowStep("step-123", { status: "concluido" });

      expect(result).toBeNull();
    });
  });

  describe("deleteWorkflowStep", () => {
    it("should delete a workflow step successfully", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        delete: mockDelete,
      });

      const result = await deleteWorkflowStep("step-123");

      expect(result).toBe(true);
      expect(mockEq).toHaveBeenCalledWith("id", "step-123");
    });

    it("should return false on error", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const mockEq = vi.fn().mockResolvedValue({ error: { message: "Error" } });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        delete: mockDelete,
      });

      const result = await deleteWorkflowStep("step-123");

      expect(result).toBe(false);
    });
  });
});
