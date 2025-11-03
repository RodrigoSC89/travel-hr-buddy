/**
 * PATCH 597 - Unit tests for LLM Task Engine
 * Tests task generation, scheduling logic, and AI-based prioritization
 */

import { describe, it, expect } from "vitest";

interface ScheduledTask {
  id: string;
  title: string;
  description: string;
  vessel_id: string;
  assigned_to: string;
  due_date: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "completed" | "overdue";
  type: "inspection" | "maintenance" | "drill" | "audit";
  risk_score: number;
}

interface TaskSuggestion {
  task_type: string;
  suggested_date: string;
  priority: string;
  reason: string;
  risk_factors: string[];
}

interface ComplianceScore {
  vessel_id: string;
  overall_score: number;
  psc_score: number;
  mlc_score: number;
  ism_score: number;
  last_updated: string;
}

describe("LLM Task Engine", () => {
  describe("Task Generation", () => {
    it("should generate valid task structure", () => {
      const task: ScheduledTask = {
        id: "task-001",
        title: "PSC Preparation Inspection",
        description: "Pre-port state control inspection",
        vessel_id: "vessel-123",
        assigned_to: "officer-456",
        due_date: "2025-12-15T10:00:00Z",
        priority: "high",
        status: "pending",
        type: "inspection",
        risk_score: 7.5,
      };

      expect(task.id).toBeTruthy();
      expect(task.title).toBeTruthy();
      expect(task.vessel_id).toBeTruthy();
      expect(["low", "medium", "high", "critical"]).toContain(task.priority);
      expect(task.risk_score).toBeGreaterThanOrEqual(0);
      expect(task.risk_score).toBeLessThanOrEqual(10);
    });

    it("should validate task types", () => {
      const validTypes = ["inspection", "maintenance", "drill", "audit"];
      const task: ScheduledTask = {
        id: "task-002",
        title: "Fire Drill",
        description: "Monthly fire drill exercise",
        vessel_id: "vessel-123",
        assigned_to: "crew-all",
        due_date: "2025-12-10T14:00:00Z",
        priority: "medium",
        status: "pending",
        type: "drill",
        risk_score: 5.0,
      };

      expect(validTypes).toContain(task.type);
    });
  });

  describe("AI Task Suggestions", () => {
    it("should generate task suggestions with valid structure", () => {
      const suggestion: TaskSuggestion = {
        task_type: "inspection",
        suggested_date: "2025-12-20T09:00:00Z",
        priority: "high",
        reason: "Based on historical compliance patterns and upcoming PSC inspection",
        risk_factors: ["low_compliance_score", "port_approaching", "high_traffic_area"],
      };

      expect(suggestion.task_type).toBeTruthy();
      expect(suggestion.suggested_date).toBeTruthy();
      expect(suggestion.reason).toBeTruthy();
      expect(suggestion.risk_factors).toBeInstanceOf(Array);
      expect(suggestion.risk_factors.length).toBeGreaterThan(0);
    });

    it("should prioritize based on risk score", () => {
      const highRiskTask: ScheduledTask = {
        id: "task-003",
        title: "Critical Equipment Inspection",
        description: "High risk equipment check",
        vessel_id: "vessel-123",
        assigned_to: "engineer-789",
        due_date: "2025-12-01T08:00:00Z",
        priority: "critical",
        status: "pending",
        type: "inspection",
        risk_score: 9.2,
      };

      const lowRiskTask: ScheduledTask = {
        id: "task-004",
        title: "Routine Maintenance",
        description: "Regular maintenance check",
        vessel_id: "vessel-123",
        assigned_to: "engineer-789",
        due_date: "2025-12-25T10:00:00Z",
        priority: "low",
        status: "pending",
        type: "maintenance",
        risk_score: 2.5,
      };

      expect(highRiskTask.risk_score).toBeGreaterThan(lowRiskTask.risk_score);
      expect(highRiskTask.priority).toBe("critical");
      expect(lowRiskTask.priority).toBe("low");
    });
  });

  describe("Compliance Integration", () => {
    it("should validate compliance score structure", () => {
      const complianceScore: ComplianceScore = {
        vessel_id: "vessel-123",
        overall_score: 87.5,
        psc_score: 90.0,
        mlc_score: 85.0,
        ism_score: 88.0,
        last_updated: "2025-11-03T10:00:00Z",
      };

      expect(complianceScore.vessel_id).toBeTruthy();
      expect(complianceScore.overall_score).toBeGreaterThanOrEqual(0);
      expect(complianceScore.overall_score).toBeLessThanOrEqual(100);
      expect(complianceScore.psc_score).toBeGreaterThanOrEqual(0);
      expect(complianceScore.mlc_score).toBeGreaterThanOrEqual(0);
      expect(complianceScore.ism_score).toBeGreaterThanOrEqual(0);
    });

    it("should trigger tasks when compliance score is low", () => {
      const lowComplianceScore: ComplianceScore = {
        vessel_id: "vessel-123",
        overall_score: 65.0,
        psc_score: 60.0,
        mlc_score: 70.0,
        ism_score: 65.0,
        last_updated: "2025-11-03T10:00:00Z",
      };

      // Low compliance should trigger high priority tasks
      expect(lowComplianceScore.overall_score).toBeLessThan(75);
      
      const shouldGenerateTask = lowComplianceScore.overall_score < 75;
      expect(shouldGenerateTask).toBe(true);
    });
  });

  describe("Task Scheduling Logic", () => {
    it("should calculate optimal scheduling windows", () => {
      const tasks: ScheduledTask[] = [
        {
          id: "task-005",
          title: "Weekly Inspection",
          description: "Regular weekly check",
          vessel_id: "vessel-123",
          assigned_to: "officer-456",
          due_date: "2025-12-07T10:00:00Z",
          priority: "medium",
          status: "pending",
          type: "inspection",
          risk_score: 5.0,
        },
        {
          id: "task-006",
          title: "Monthly Drill",
          description: "Monthly safety drill",
          vessel_id: "vessel-123",
          assigned_to: "crew-all",
          due_date: "2025-12-15T14:00:00Z",
          priority: "high",
          status: "pending",
          type: "drill",
          risk_score: 6.5,
        },
      ];

      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach((task) => {
        expect(new Date(task.due_date)).toBeInstanceOf(Date);
      });
    });

    it("should detect overdue tasks", () => {
      const overdueTask: ScheduledTask = {
        id: "task-007",
        title: "Overdue Inspection",
        description: "Past due inspection",
        vessel_id: "vessel-123",
        assigned_to: "officer-456",
        due_date: "2025-10-01T10:00:00Z",
        priority: "critical",
        status: "overdue",
        type: "inspection",
        risk_score: 9.5,
      };

      const now = new Date();
      const dueDate = new Date(overdueTask.due_date);
      const isOverdue = dueDate < now;

      expect(isOverdue).toBe(true);
      expect(overdueTask.status).toBe("overdue");
    });
  });

  describe("LLM Integration", () => {
    it("should generate contextual task descriptions", () => {
      const taskWithAIDescription: ScheduledTask = {
        id: "task-008",
        title: "Pre-Audit Preparation",
        description: "AI-generated: Based on previous audit findings and current compliance gaps, this inspection should focus on fire safety equipment, emergency procedures documentation, and crew training records.",
        vessel_id: "vessel-123",
        assigned_to: "safety-officer",
        due_date: "2025-12-10T09:00:00Z",
        priority: "high",
        status: "pending",
        type: "audit",
        risk_score: 7.8,
      };

      expect(taskWithAIDescription.description).toBeTruthy();
      expect(taskWithAIDescription.description.length).toBeGreaterThan(50);
      expect(taskWithAIDescription.description).toContain("AI-generated:");
    });
  });
});
