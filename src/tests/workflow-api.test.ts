// @ts-nocheck — Test mocks: Supabase client mock types incompatible with strict generics
/**
 * Tests for Workflow API Service Layer
 * Uses proper mocking for dynamic table accessors
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all dependencies before importing the module
vi.mock("@/lib/supabase/dynamic-tables", () => ({
  smartWorkflowsTable: {
    insertSingle: vi.fn(),
    selectOne: vi.fn(),
    query: vi.fn(),
    updateSingle: vi.fn(),
    delete: vi.fn(),
  },
  smartWorkflowStepsTable: {
    insertSingle: vi.fn(),
    selectOne: vi.fn(),
    query: vi.fn(),
    updateSingle: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock("@/lib/workflows/seedSuggestions", () => ({
  seedSuggestionsForWorkflow: vi.fn(),
}));

// Import after mocks
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
import { smartWorkflowsTable, smartWorkflowStepsTable } from "@/lib/supabase/dynamic-tables";
import { supabase } from "@/integrations/supabase/client";
import { seedSuggestionsForWorkflow } from "@/lib/workflows/seedSuggestions";

describe("Workflow API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createWorkflow", () => {
    it("should create a workflow successfully", async () => {
      const mockUser = { id: "user-123" };
      const mockDbWorkflow = {
        id: "workflow-123",
        name: "Test Workflow",
        description: "Test Description",
        status: "draft",
        created_by: "user-123",
        created_at: "2025-10-15T10:00:00Z",
        updated_at: "2025-10-15T10:00:00Z",
        workflow_type: "general",
        metadata: {},
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

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(smartWorkflowsTable.insertSingle).mockResolvedValue({
        data: mockDbWorkflow as any,
        error: null,
      });

      vi.mocked(seedSuggestionsForWorkflow).mockResolvedValue({
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
    });

    it("should throw error when user is not authenticated", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated", name: "AuthError", status: 401 },
      });

      await expect(
        createWorkflow({ title: "Test" })
      ).rejects.toThrow("User not authenticated");
    });

    it("should throw error when workflow creation fails", async () => {
      const mockUser = { id: "user-123" };
      
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(smartWorkflowsTable.insertSingle).mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      await expect(
        createWorkflow({ title: "Test" })
      ).rejects.toThrow("Database error");
    });
  });

  describe("getWorkflow", () => {
    it("should fetch a workflow by ID", async () => {
      const mockDbWorkflow = {
        id: "workflow-123",
        name: "Test Workflow",
        status: "draft",
        description: null,
        workflow_type: "general",
        created_at: "2025-01-01",
        updated_at: "2025-01-01",
        created_by: null,
        metadata: null,
      };

      vi.mocked(smartWorkflowsTable.selectOne).mockResolvedValue({ 
        data: mockDbWorkflow as any, 
        error: null 
      });

      const result = await getWorkflow("workflow-123");

      expect(result).toMatchObject({
        id: "workflow-123",
        title: "Test Workflow",
        status: "draft",
      });
      expect(smartWorkflowsTable.selectOne).toHaveBeenCalledWith("workflow-123");
    });

    it("should return null when workflow is not found", async () => {
      vi.mocked(smartWorkflowsTable.selectOne).mockResolvedValue({
        data: null,
        error: new Error("Not found"),
      });

      const result = await getWorkflow("invalid-id");

      expect(result).toBeNull();
    });
  });

  describe("getWorkflows", () => {
    it("should fetch all workflows", async () => {
      const mockDbWorkflows = [
        { id: "1", name: "Workflow 1", status: "draft", description: null, workflow_type: "general", created_at: "2025-01-01", updated_at: "2025-01-01", created_by: null, metadata: null },
        { id: "2", name: "Workflow 2", status: "draft", description: null, workflow_type: "general", created_at: "2025-01-01", updated_at: "2025-01-01", created_by: null, metadata: null },
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockDbWorkflows, error: null });
      const mockSelectFn = vi.fn().mockReturnValue({ order: mockOrder });
      vi.mocked(smartWorkflowsTable.query).mockReturnValue({ select: mockSelectFn } as any);

      const result = await getWorkflows();

      expect(result.map((w) => ({ id: w.id, title: w.title }))).toEqual([
        { id: "1", title: "Workflow 1" },
        { id: "2", title: "Workflow 2" },
      ]);
    });

    it("should return empty array on error", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Error" },
      });
      const mockSelectFn = vi.fn().mockReturnValue({ order: mockOrder });
      vi.mocked(smartWorkflowsTable.query).mockReturnValue({ select: mockSelectFn } as any);

      const result = await getWorkflows();

      expect(result).toEqual([]);
    });
  });

  describe("updateWorkflow", () => {
    it("should update a workflow", async () => {
      const mockDbWorkflow = {
        id: "workflow-123",
        name: "Updated Workflow",
        status: "active",
        description: null,
        workflow_type: "general",
        created_at: "2025-01-01",
        updated_at: "2025-01-01",
        created_by: null,
        metadata: null,
      };

      vi.mocked(smartWorkflowsTable.updateSingle).mockResolvedValue({
        data: mockDbWorkflow as any,
        error: null,
      });

      const result = await updateWorkflow("workflow-123", { title: "Updated Workflow" });

      expect(result).toMatchObject({
        id: "workflow-123",
        title: "Updated Workflow",
        status: "active",
      });
    });

    it("should return null on error", async () => {
      vi.mocked(smartWorkflowsTable.updateSingle).mockResolvedValue({
        data: null,
        error: new Error("Error"),
      });

      const result = await updateWorkflow("workflow-123", { title: "Updated" });

      expect(result).toBeNull();
    });
  });

  describe("deleteWorkflow", () => {
    it("should delete a workflow successfully", async () => {
      vi.mocked(smartWorkflowsTable.delete).mockResolvedValue({ error: null });

      const result = await deleteWorkflow("workflow-123");

      expect(result).toBe(true);
      expect(smartWorkflowsTable.delete).toHaveBeenCalledWith("workflow-123");
    });

    it("should return false on error", async () => {
      vi.mocked(smartWorkflowsTable.delete).mockResolvedValue({ error: new Error("Error") });

      const result = await deleteWorkflow("workflow-123");

      expect(result).toBe(false);
    });
  });

  describe("getWorkflowSteps", () => {
    it("should fetch workflow steps", async () => {
      const mockDbSteps = [
        { id: "step-1", step_name: "Step 1", position: 0, workflow_id: "workflow-123", status: "pendente", description: null, priority: "medium", assigned_to: null, due_date: null, created_at: "2025-01-01", updated_at: null, created_by: null, metadata: null },
        { id: "step-2", step_name: "Step 2", position: 1, workflow_id: "workflow-123", status: "pendente", description: null, priority: "medium", assigned_to: null, due_date: null, created_at: "2025-01-01", updated_at: null, created_by: null, metadata: null },
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockDbSteps, error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelectFn = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(smartWorkflowStepsTable.query).mockReturnValue({ select: mockSelectFn } as any);

      const result = await getWorkflowSteps("workflow-123");

      expect(result.map((s) => ({ id: s.id, title: s.title, position: s.position }))).toEqual([
        { id: "step-1", title: "Step 1", position: 0 },
        { id: "step-2", title: "Step 2", position: 1 },
      ]);
    });

    it("should return empty array on error", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Error" },
      });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelectFn = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(smartWorkflowStepsTable.query).mockReturnValue({ select: mockSelectFn } as any);

      const result = await getWorkflowSteps("workflow-123");

      expect(result).toEqual([]);
    });
  });

  describe("createWorkflowStep", () => {
    it("should create a workflow step", async () => {
      const mockUser = { id: "user-123" };
      const mockDbStep = {
        id: "step-123",
        workflow_id: "workflow-123",
        step_name: "New Step",
        status: "pendente",
        description: null,
        position: 0,
        priority: "medium",
        assigned_to: "user-123",
        due_date: null,
        created_at: "2025-01-01",
        updated_at: null,
        created_by: "user-123",
        metadata: null,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(smartWorkflowStepsTable.insertSingle).mockResolvedValue({ 
        data: mockDbStep as any, 
        error: null 
      });

      const result = await createWorkflowStep({
        workflow_id: "workflow-123",
        title: "New Step",
        status: "pendente",
      });

      expect(result).toMatchObject({
        id: "step-123",
        workflow_id: "workflow-123",
        title: "New Step",
        status: "pendente",
      });
    });

    it("should return null when user is not authenticated", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated", name: "AuthError", status: 401 },
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
      const mockDbStep = {
        id: "step-123",
        step_name: "Updated Step",
        status: "em_progresso",
        workflow_id: "workflow-123",
        description: null,
        position: 0,
        priority: "medium",
        assigned_to: null,
        due_date: null,
        created_at: "2025-01-01",
        updated_at: "2025-01-02",
        created_by: null,
        metadata: null,
      };

      vi.mocked(smartWorkflowStepsTable.updateSingle).mockResolvedValue({
        data: mockDbStep as any,
        error: null,
      });

      const result = await updateWorkflowStep("step-123", { status: "em_progresso" });

      expect(result).toMatchObject({
        id: "step-123",
        title: "Updated Step",
        status: "em_progresso",
      });
    });

    it("should return null on error", async () => {
      vi.mocked(smartWorkflowStepsTable.updateSingle).mockResolvedValue({
        data: null,
        error: new Error("Error"),
      });

      const result = await updateWorkflowStep("step-123", { status: "concluido" });

      expect(result).toBeNull();
    });
  });

  describe("deleteWorkflowStep", () => {
    it("should delete a workflow step successfully", async () => {
      vi.mocked(smartWorkflowStepsTable.delete).mockResolvedValue({ error: null });

      const result = await deleteWorkflowStep("step-123");

      expect(result).toBe(true);
      expect(smartWorkflowStepsTable.delete).toHaveBeenCalledWith("step-123");
    });

    it("should return false on error", async () => {
      vi.mocked(smartWorkflowStepsTable.delete).mockResolvedValue({ error: new Error("Error") });

      const result = await deleteWorkflowStep("step-123");

      expect(result).toBe(false);
    });
  });
});
