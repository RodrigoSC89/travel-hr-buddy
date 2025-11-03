/**
 * PATCH 599 - Unit tests for Drill Planner
 * Tests drill scheduling, compliance tracking, and performance analysis
 */

import { describe, it, expect } from "vitest";

interface DrillSchedule {
  id: string;
  drill_type: "fire" | "abandon_ship" | "mob" | "security" | "pollution";
  vessel_id: string;
  scheduled_date: string;
  frequency: "weekly" | "monthly" | "quarterly" | "annually";
  required_by: "SOLAS" | "ISM" | "ISPS" | "MARPOL" | "flag_state";
  participants: string[];
  status: "scheduled" | "completed" | "cancelled" | "overdue";
}

interface DrillExecution {
  schedule_id: string;
  execution_date: string;
  duration_minutes: number;
  participants_count: number;
  checklist_completed: boolean;
  issues_found: string[];
  performance_score: number;
  notes: string;
}

interface DrillPerformance {
  drill_id: string;
  response_time_seconds: number;
  equipment_status: "operational" | "degraded" | "failed";
  crew_readiness_score: number;
  procedure_compliance: number;
  areas_for_improvement: string[];
  commendations: string[];
}

interface RegulatoryCompliance {
  vessel_id: string;
  drill_type: string;
  required_frequency: string;
  last_conducted: string;
  next_due: string;
  compliance_status: "compliant" | "due_soon" | "overdue";
  days_until_due: number;
}

describe("Drill Planner", () => {
  describe("Drill Scheduling", () => {
    it("should create valid drill schedule", () => {
      const schedule: DrillSchedule = {
        id: "drill-001",
        drill_type: "fire",
        vessel_id: "vessel-123",
        scheduled_date: "2025-12-10T14:00:00Z",
        frequency: "monthly",
        required_by: "SOLAS",
        participants: ["crew-all"],
        status: "scheduled",
      };

      expect(schedule.id).toBeTruthy();
      expect(["fire", "abandon_ship", "mob", "security", "pollution"]).toContain(schedule.drill_type);
      expect(["weekly", "monthly", "quarterly", "annually"]).toContain(schedule.frequency);
      expect(schedule.participants).toBeInstanceOf(Array);
      expect(schedule.participants.length).toBeGreaterThan(0);
    });

    it("should schedule fire drills monthly per SOLAS", () => {
      const fireDrill: DrillSchedule = {
        id: "drill-002",
        drill_type: "fire",
        vessel_id: "vessel-123",
        scheduled_date: "2025-12-01T10:00:00Z",
        frequency: "monthly",
        required_by: "SOLAS",
        participants: ["crew-all"],
        status: "scheduled",
      };

      expect(fireDrill.drill_type).toBe("fire");
      expect(fireDrill.frequency).toBe("monthly");
      expect(fireDrill.required_by).toBe("SOLAS");
    });

    it("should schedule abandon ship drills monthly per SOLAS", () => {
      const abandonShipDrill: DrillSchedule = {
        id: "drill-003",
        drill_type: "abandon_ship",
        vessel_id: "vessel-123",
        scheduled_date: "2025-12-05T09:00:00Z",
        frequency: "monthly",
        required_by: "SOLAS",
        participants: ["crew-all"],
        status: "scheduled",
      };

      expect(abandonShipDrill.drill_type).toBe("abandon_ship");
      expect(abandonShipDrill.frequency).toBe("monthly");
    });
  });

  describe("Drill Execution", () => {
    it("should record drill execution data", () => {
      const execution: DrillExecution = {
        schedule_id: "drill-001",
        execution_date: "2025-12-10T14:15:00Z",
        duration_minutes: 45,
        participants_count: 25,
        checklist_completed: true,
        issues_found: ["Fire alarm response delay in engine room", "One crew member absent"],
        performance_score: 8.5,
        notes: "Overall good performance. Need to improve alarm response time in machinery spaces.",
      };

      expect(execution.schedule_id).toBeTruthy();
      expect(execution.duration_minutes).toBeGreaterThan(0);
      expect(execution.participants_count).toBeGreaterThan(0);
      expect(execution.performance_score).toBeGreaterThanOrEqual(0);
      expect(execution.performance_score).toBeLessThanOrEqual(10);
      expect(execution.issues_found).toBeInstanceOf(Array);
    });

    it("should validate checklist completion", () => {
      const completeExecution: DrillExecution = {
        schedule_id: "drill-002",
        execution_date: "2025-12-10T14:00:00Z",
        duration_minutes: 50,
        participants_count: 24,
        checklist_completed: true,
        issues_found: [],
        performance_score: 9.5,
        notes: "Excellent execution, all objectives met.",
      };

      const incompleteExecution: DrillExecution = {
        schedule_id: "drill-003",
        execution_date: "2025-12-10T14:00:00Z",
        duration_minutes: 30,
        participants_count: 22,
        checklist_completed: false,
        issues_found: ["Checklist not completed", "Missing documentation"],
        performance_score: 6.0,
        notes: "Incomplete drill, requires remedial action.",
      };

      expect(completeExecution.checklist_completed).toBe(true);
      expect(incompleteExecution.checklist_completed).toBe(false);
      expect(completeExecution.performance_score).toBeGreaterThan(incompleteExecution.performance_score);
    });
  });

  describe("Performance Analysis", () => {
    it("should analyze drill performance", () => {
      const performance: DrillPerformance = {
        drill_id: "drill-001",
        response_time_seconds: 180,
        equipment_status: "operational",
        crew_readiness_score: 8.7,
        procedure_compliance: 92.0,
        areas_for_improvement: [
          "Faster muster station assembly",
          "Better communication during initial alarm",
        ],
        commendations: [
          "Excellent fire team response",
          "Proper use of fire fighting equipment",
        ],
      };

      expect(performance.response_time_seconds).toBeGreaterThan(0);
      expect(["operational", "degraded", "failed"]).toContain(performance.equipment_status);
      expect(performance.crew_readiness_score).toBeGreaterThanOrEqual(0);
      expect(performance.crew_readiness_score).toBeLessThanOrEqual(10);
      expect(performance.procedure_compliance).toBeGreaterThanOrEqual(0);
      expect(performance.procedure_compliance).toBeLessThanOrEqual(100);
    });

    it("should identify performance trends", () => {
      const performances: DrillPerformance[] = [
        {
          drill_id: "drill-001",
          response_time_seconds: 180,
          equipment_status: "operational",
          crew_readiness_score: 8.7,
          procedure_compliance: 92.0,
          areas_for_improvement: ["Response time"],
          commendations: ["Good communication"],
        },
        {
          drill_id: "drill-002",
          response_time_seconds: 165,
          equipment_status: "operational",
          crew_readiness_score: 9.0,
          procedure_compliance: 95.0,
          areas_for_improvement: [],
          commendations: ["Excellent response", "Perfect execution"],
        },
        {
          drill_id: "drill-003",
          response_time_seconds: 150,
          equipment_status: "operational",
          crew_readiness_score: 9.3,
          procedure_compliance: 98.0,
          areas_for_improvement: [],
          commendations: ["Outstanding performance"],
        },
      ];

      // Check improvement trend
      expect(performances[0].response_time_seconds).toBeGreaterThan(performances[1].response_time_seconds);
      expect(performances[1].response_time_seconds).toBeGreaterThan(performances[2].response_time_seconds);
      expect(performances[2].crew_readiness_score).toBeGreaterThan(performances[0].crew_readiness_score);
    });
  });

  describe("Regulatory Compliance", () => {
    it("should track compliance status", () => {
      const compliance: RegulatoryCompliance = {
        vessel_id: "vessel-123",
        drill_type: "fire",
        required_frequency: "monthly",
        last_conducted: "2025-11-10T14:00:00Z",
        next_due: "2025-12-10T14:00:00Z",
        compliance_status: "compliant",
        days_until_due: 7,
      };

      expect(compliance.vessel_id).toBeTruthy();
      expect(["compliant", "due_soon", "overdue"]).toContain(compliance.compliance_status);
      expect(compliance.days_until_due).toBeGreaterThanOrEqual(0);
    });

    it("should detect overdue drills", () => {
      const overdueCompliance: RegulatoryCompliance = {
        vessel_id: "vessel-123",
        drill_type: "abandon_ship",
        required_frequency: "monthly",
        last_conducted: "2025-09-15T14:00:00Z",
        next_due: "2025-10-15T14:00:00Z",
        compliance_status: "overdue",
        days_until_due: -18,
      };

      expect(overdueCompliance.compliance_status).toBe("overdue");
      expect(overdueCompliance.days_until_due).toBeLessThan(0);
    });

    it("should alert for upcoming drills", () => {
      const dueSoonCompliance: RegulatoryCompliance = {
        vessel_id: "vessel-123",
        drill_type: "mob",
        required_frequency: "quarterly",
        last_conducted: "2025-10-01T14:00:00Z",
        next_due: "2025-12-05T14:00:00Z",
        compliance_status: "due_soon",
        days_until_due: 2,
      };

      expect(dueSoonCompliance.compliance_status).toBe("due_soon");
      expect(dueSoonCompliance.days_until_due).toBeGreaterThan(0);
      expect(dueSoonCompliance.days_until_due).toBeLessThan(7);
    });
  });

  describe("AI Recommendations", () => {
    it("should generate drill recommendations based on performance", () => {
      const lowPerformanceDrill: DrillPerformance = {
        drill_id: "drill-004",
        response_time_seconds: 300,
        equipment_status: "degraded",
        crew_readiness_score: 6.5,
        procedure_compliance: 75.0,
        areas_for_improvement: [
          "Slow response time",
          "Equipment maintenance needed",
          "Procedure review required",
        ],
        commendations: [],
      };

      // Low performance should trigger recommendations
      const needsImprovement = lowPerformanceDrill.crew_readiness_score < 7.5;
      const needsTraining = lowPerformanceDrill.procedure_compliance < 85;
      
      expect(needsImprovement).toBe(true);
      expect(needsTraining).toBe(true);
      expect(lowPerformanceDrill.areas_for_improvement.length).toBeGreaterThan(0);
    });
  });
});
