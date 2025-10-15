import { describe, it, expect, beforeEach, vi } from "vitest";
import { 
  createWorkflowDirect, 
  getWorkflow, 
  listWorkflows,
  updateWorkflow,
  deleteWorkflow,
  activateWorkflow,
  deactivateWorkflow,
} from "@/services/workflow-api";
import { seedSuggestionsForWorkflow, getWorkflowSuggestions } from "@/lib/workflows/seedSuggestions";

// Mock user ID for testing
const TEST_USER_ID = "test-user-id-123";

describe("Workflow Creation API", () => {
  beforeEach(() => {
    // Clear any mocks before each test
    vi.clearAllMocks();
  });

  describe("createWorkflowDirect", () => {
    it("should create a workflow with required fields", async () => {
      const request = {
        title: "Test Workflow",
        created_by: TEST_USER_ID,
      };

      const result = await createWorkflowDirect(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.workflow).toBeDefined();
      expect(result.workflow.title).toBe("Test Workflow");
      expect(result.workflow.created_by).toBe(TEST_USER_ID);
      expect(result.workflow.status).toBe("draft");
      expect(result.message).toContain("sucesso");
    });

    it("should create a workflow with optional fields", async () => {
      const request = {
        title: "Comprehensive Test Workflow",
        created_by: TEST_USER_ID,
        description: "This is a test workflow with all fields",
        category: "Testing",
        tags: ["test", "automated", "demo"],
      };

      const result = await createWorkflowDirect(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.workflow.description).toBe("This is a test workflow with all fields");
      expect(result.workflow.category).toBe("Testing");
      expect(result.workflow.tags).toEqual(["test", "automated", "demo"]);
    });

    it("should generate a valid UUID for workflow ID", async () => {
      const request = {
        title: "UUID Test Workflow",
        created_by: TEST_USER_ID,
      };

      const result = await createWorkflowDirect(request);

      expect(result.workflow.id).toBeDefined();
      expect(result.workflow.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it("should set timestamps correctly", async () => {
      const request = {
        title: "Timestamp Test Workflow",
        created_by: TEST_USER_ID,
      };

      const result = await createWorkflowDirect(request);

      expect(result.workflow.created_at).toBeDefined();
      expect(result.workflow.updated_at).toBeDefined();
      expect(new Date(result.workflow.created_at)).toBeInstanceOf(Date);
      expect(new Date(result.workflow.updated_at)).toBeInstanceOf(Date);
    });

    it("should throw error when title is missing", async () => {
      const request = {
        title: "",
        created_by: TEST_USER_ID,
      };

      await expect(createWorkflowDirect(request)).rejects.toThrow();
    });

    it("should throw error when created_by is missing", async () => {
      const request = {
        title: "Missing Creator Test",
        created_by: "",
      };

      await expect(createWorkflowDirect(request)).rejects.toThrow();
    });
  });

  describe("seedSuggestionsForWorkflow", () => {
    it("should seed AI suggestions for a workflow", async () => {
      // First create a workflow
      const createRequest = {
        title: "Suggestion Test Workflow",
        created_by: TEST_USER_ID,
        category: "Operations",
      };

      const createResult = await createWorkflowDirect(createRequest);
      const workflowId = createResult.workflow.id;

      // Seed suggestions
      await seedSuggestionsForWorkflow(workflowId, TEST_USER_ID);

      // Fetch suggestions to verify
      const suggestions = await getWorkflowSuggestions(workflowId);

      expect(suggestions).toBeDefined();
      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it("should create suggestions with correct structure", async () => {
      // Create a workflow
      const createRequest = {
        title: "Suggestion Structure Test",
        created_by: TEST_USER_ID,
      };

      const createResult = await createWorkflowDirect(createRequest);
      const workflowId = createResult.workflow.id;

      // Seed suggestions
      await seedSuggestionsForWorkflow(workflowId, TEST_USER_ID);

      // Fetch suggestions
      const suggestions = await getWorkflowSuggestions(workflowId);
      const firstSuggestion = suggestions[0];

      expect(firstSuggestion).toHaveProperty("id");
      expect(firstSuggestion).toHaveProperty("workflow_id");
      expect(firstSuggestion).toHaveProperty("etapa");
      expect(firstSuggestion).toHaveProperty("tipo_sugestao");
      expect(firstSuggestion).toHaveProperty("conteudo");
      expect(firstSuggestion).toHaveProperty("criticidade");
      expect(firstSuggestion).toHaveProperty("responsavel_sugerido");
      expect(firstSuggestion).toHaveProperty("origem");
      expect(firstSuggestion).toHaveProperty("status");
    });

    it("should create suggestions with different stages", async () => {
      const createRequest = {
        title: "Multi-Stage Workflow",
        created_by: TEST_USER_ID,
      };

      const createResult = await createWorkflowDirect(createRequest);
      const workflowId = createResult.workflow.id;

      await seedSuggestionsForWorkflow(workflowId, TEST_USER_ID);

      const suggestions = await getWorkflowSuggestions(workflowId);
      const stages = new Set(suggestions.map(s => s.etapa));

      expect(stages.size).toBeGreaterThan(1);
      expect(Array.from(stages)).toContain("Planejamento");
      expect(Array.from(stages)).toContain("Validação");
    });

    it("should set all suggestions to pending status", async () => {
      const createRequest = {
        title: "Pending Status Test",
        created_by: TEST_USER_ID,
      };

      const createResult = await createWorkflowDirect(createRequest);
      const workflowId = createResult.workflow.id;

      await seedSuggestionsForWorkflow(workflowId, TEST_USER_ID);

      const suggestions = await getWorkflowSuggestions(workflowId);

      suggestions.forEach(suggestion => {
        expect(suggestion.status).toBe("pending");
      });
    });
  });

  describe("getWorkflow", () => {
    it("should fetch a workflow by ID", async () => {
      // Create a workflow first
      const createRequest = {
        title: "Fetch Test Workflow",
        created_by: TEST_USER_ID,
      };

      const createResult = await createWorkflowDirect(createRequest);
      const workflowId = createResult.workflow.id;

      // Fetch the workflow
      const workflow = await getWorkflow(workflowId);

      expect(workflow).toBeDefined();
      expect(workflow.id).toBe(workflowId);
      expect(workflow.title).toBe("Fetch Test Workflow");
    });

    it("should throw error for non-existent workflow", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      await expect(getWorkflow(fakeId)).rejects.toThrow();
    });
  });

  describe("listWorkflows", () => {
    it("should return a list of workflows", async () => {
      const result = await listWorkflows();

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
    });

    it("should return workflows in descending order by creation date", async () => {
      // Create two workflows with slight delay
      await createWorkflowDirect({
        title: "First Workflow",
        created_by: TEST_USER_ID,
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      await createWorkflowDirect({
        title: "Second Workflow",
        created_by: TEST_USER_ID,
      });

      const workflows = await listWorkflows();

      expect(workflows.length).toBeGreaterThan(0);
      
      // Check if sorted correctly
      if (workflows.length >= 2) {
        const firstDate = new Date(workflows[0].created_at);
        const secondDate = new Date(workflows[1].created_at);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
    });
  });

  describe("updateWorkflow", () => {
    it("should update workflow title", async () => {
      const createResult = await createWorkflowDirect({
        title: "Original Title",
        created_by: TEST_USER_ID,
      });

      const updated = await updateWorkflow(createResult.workflow.id, {
        title: "Updated Title",
      });

      expect(updated.title).toBe("Updated Title");
    });

    it("should update workflow description", async () => {
      const createResult = await createWorkflowDirect({
        title: "Description Test",
        created_by: TEST_USER_ID,
      });

      const updated = await updateWorkflow(createResult.workflow.id, {
        description: "New description",
      });

      expect(updated.description).toBe("New description");
    });

    it("should update workflow category", async () => {
      const createResult = await createWorkflowDirect({
        title: "Category Test",
        created_by: TEST_USER_ID,
      });

      const updated = await updateWorkflow(createResult.workflow.id, {
        category: "New Category",
      });

      expect(updated.category).toBe("New Category");
    });
  });

  describe("activateWorkflow", () => {
    it("should change workflow status to active", async () => {
      const createResult = await createWorkflowDirect({
        title: "Activation Test",
        created_by: TEST_USER_ID,
      });

      const activated = await activateWorkflow(createResult.workflow.id);

      expect(activated.status).toBe("active");
    });
  });

  describe("deactivateWorkflow", () => {
    it("should change workflow status to inactive", async () => {
      const createResult = await createWorkflowDirect({
        title: "Deactivation Test",
        created_by: TEST_USER_ID,
      });

      // First activate it
      await activateWorkflow(createResult.workflow.id);

      // Then deactivate
      const deactivated = await deactivateWorkflow(createResult.workflow.id);

      expect(deactivated.status).toBe("inactive");
    });
  });

  describe("deleteWorkflow", () => {
    it("should delete a workflow", async () => {
      const createResult = await createWorkflowDirect({
        title: "Delete Test",
        created_by: TEST_USER_ID,
      });

      await deleteWorkflow(createResult.workflow.id);

      // Verify it's deleted
      await expect(getWorkflow(createResult.workflow.id)).rejects.toThrow();
    });
  });

  describe("API timing", () => {
    it("should complete workflow creation within reasonable time", async () => {
      const startTime = Date.now();
      
      await createWorkflowDirect({
        title: "Timing Test",
        created_by: TEST_USER_ID,
      });
      
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(3000); // Less than 3 seconds
    });

    it("should complete workflow fetch within reasonable time", async () => {
      const createResult = await createWorkflowDirect({
        title: "Fetch Timing Test",
        created_by: TEST_USER_ID,
      });

      const startTime = Date.now();
      await getWorkflow(createResult.workflow.id);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(2000); // Less than 2 seconds
    });
  });
});
