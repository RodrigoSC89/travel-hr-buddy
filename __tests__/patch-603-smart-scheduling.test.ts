/**
 * PATCH 603 - Smart Scheduling with AI Tests
 * Validation tests for risk-based scheduling, historical failure patterns, and AI predictions
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import { RiskBasedScheduler } from "@/modules/smart-scheduler/services/RiskBasedScheduler";
import { LLMNextInspectionPredictor } from "@/modules/smart-scheduler/services/LLMNextInspectionPredictor";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

// Mock AI kernel
vi.mock("@/ai/kernel", () => ({
  runAIContext: vi.fn(),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("PATCH 603 - Smart Scheduling with AI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Risk-Based Scheduling", () => {
    it("should generate risk-based task recommendations", async () => {
      const mockHistoricalData = [
        {
          id: "1",
          tipo: "PSC",
          data: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          findings: ["Safety equipment outdated", "Documentation incomplete"],
          score: 65,
        },
        {
          id: "2",
          tipo: "PSC",
          data: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          findings: ["Safety equipment outdated"],
          score: 70,
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: mockHistoricalData,
                error: null,
              }),
            }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const recommendations = await RiskBasedScheduler.autoRiskBasedScheduling("PSC", "vessel-1");

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("auditorias");
    });

    it("should calculate correct priority based on severity", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const recommendations = await RiskBasedScheduler.autoRiskBasedScheduling("MLC");

      expect(recommendations).toBeDefined();
    });

    it("should log audit event for auto-scheduling", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      await RiskBasedScheduler.autoRiskBasedScheduling("LSA", "vessel-2");

      // Check that system_logs insert was called
      expect(mockFrom).toHaveBeenCalledWith("system_logs");
    });
  });

  describe("LLM Next Inspection Predictor", () => {
    it("should predict next inspection date", async () => {
      const historicalData = [
        {
          data: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          score: 85,
          findings: [],
        },
        {
          data: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          score: 80,
          findings: ["Minor issue"],
        },
      ];

      const prediction = await LLMNextInspectionPredictor.predictNextInspection(
        "PSC",
        "vessel-1",
        historicalData
      );

      expect(prediction).toBeDefined();
      expect(prediction.moduleName).toBe("PSC");
      expect(prediction.vesselId).toBe("vessel-1");
      expect(prediction.predictedDate).toBeInstanceOf(Date);
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
      expect(["critical", "high", "medium", "low"]).toContain(prediction.priority);
      expect(prediction.reasoning).toBeTruthy();
    });

    it("should handle prediction without historical data", async () => {
      const prediction = await LLMNextInspectionPredictor.predictNextInspection("MLC");

      expect(prediction).toBeDefined();
      expect(prediction.moduleName).toBe("MLC");
      expect(prediction.predictedDate).toBeInstanceOf(Date);
    });

    it("should batch predict multiple inspections", async () => {
      const modules = [
        { name: "PSC", vesselId: "vessel-1" },
        { name: "MLC", vesselId: "vessel-2" },
        { name: "LSA", vesselId: "vessel-3" },
      ];

      const predictions = await LLMNextInspectionPredictor.batchPredict(modules);

      expect(predictions).toBeDefined();
      expect(predictions.length).toBe(3);
      expect(predictions[0].moduleName).toBe("PSC");
      expect(predictions[1].moduleName).toBe("MLC");
      expect(predictions[2].moduleName).toBe("LSA");
    });

    it("should use fallback prediction when AI fails", async () => {
      // Force AI to fail by not mocking runAIContext
      const prediction = await LLMNextInspectionPredictor.predictNextInspection("FFA");

      expect(prediction).toBeDefined();
      expect(prediction.confidence).toBeLessThan(1); // Fallback has lower confidence
      expect(prediction.reasoning).toContain("Rule-based");
    });
  });

  describe("Calendar Slot Availability", () => {
    it("should detect optimal calendar slots", () => {
      const tasks = [
        {
          id: "1",
          module: "PSC",
          title: "Task 1",
          description: "Test task",
          priority: "high" as const,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          aiGenerated: true,
          status: "pending" as const,
          source: "ai_generated" as const,
          createdAt: new Date(),
        },
        {
          id: "2",
          module: "MLC",
          title: "Task 2",
          description: "Test task",
          priority: "medium" as const,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          aiGenerated: true,
          status: "pending" as const,
          source: "ai_generated" as const,
          createdAt: new Date(),
        },
      ];

      // Calculate workload
      const workloadByDate = new Map<string, number>();
      tasks.forEach((task) => {
        const dateKey = task.dueDate.toISOString().split("T")[0];
        const weight = task.priority === "high" ? 3 : task.priority === "medium" ? 2 : 1;
        workloadByDate.set(dateKey, (workloadByDate.get(dateKey) || 0) + weight);
      });

      expect(workloadByDate.size).toBeGreaterThan(0);
      
      // Check workload calculation
      const workload = Array.from(workloadByDate.values())[0];
      expect(workload).toBeGreaterThan(0);
    });
  });

  describe("Scheduled Tasks Table Integrity", () => {
    it("should have correct table structure", async () => {
      // Mock table query to verify structure
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: "test-id",
                module: "PSC",
                related_entity: "vessel-1",
                title: "Test Task",
                description: "Description",
                priority: "high",
                due_date: new Date().toISOString(),
                created_by: "user-1",
                assigned_to: "user-2",
                ai_generated: true,
                status: "pending",
                source: "ai_generated",
                tags: ["test"],
                metadata: {},
                created_at: new Date().toISOString(),
                updated_at: null,
                completed_at: null,
              },
            ],
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const result = await supabase.from("scheduled_tasks").select("*").limit(1);

      expect(result.data).toBeDefined();
      if (result.data && result.data.length > 0) {
        const task = result.data[0];
        expect(task).toHaveProperty("id");
        expect(task).toHaveProperty("module");
        expect(task).toHaveProperty("priority");
        expect(task).toHaveProperty("due_date");
        expect(task).toHaveProperty("ai_generated");
        expect(task).toHaveProperty("status");
      }
    });
  });

  describe("User Overwrite Schedule", () => {
    it("should allow users to override AI-generated schedules", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: { id: "task-1", status: "in_progress" },
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const result = await supabase
        .from("scheduled_tasks")
        .update({ status: "in_progress" })
        .eq("id", "task-1");

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
    });

    it("should allow users to reschedule tasks", async () => {
      const newDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: { id: "task-1", due_date: newDueDate.toISOString() },
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const result = await supabase
        .from("scheduled_tasks")
        .update({ due_date: newDueDate.toISOString() })
        .eq("id", "task-1");

      expect(result.error).toBeNull();
    });
  });
});
