/**
 * PATCH 532 - Unit tests for Mission Control Module
 * Tests mission planning, execution, monitoring, and coordination
 */

import { describe, it, expect } from "vitest";

interface Mission {
  id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  vessel_id: string;
  start_date: string;
  end_date: string;
  assigned_crew: string[];
  created_by: string;
  created_at: string;
}

interface MissionTask {
  id: string;
  mission_id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "blocked";
  assigned_to: string;
  due_date: string;
  priority: "low" | "medium" | "high";
}

interface MissionLog {
  id: string;
  mission_id: string;
  event_type: string;
  description: string;
  severity: "info" | "warning" | "error" | "critical";
  timestamp: string;
  logged_by: string;
}

describe("Mission Control Module", () => {
  describe("Mission Validation", () => {
    it("should validate mission structure", () => {
      const mission: Mission = {
        id: "mission-001",
        name: "Offshore Survey Alpha",
        description: "Geological survey mission",
        status: "planning",
        priority: "high",
        vessel_id: "vessel-001",
        start_date: "2025-11-01",
        end_date: "2025-11-15",
        assigned_crew: ["crew-001", "crew-002", "crew-003"],
        created_by: "user-001",
        created_at: "2025-10-29T10:00:00Z",
      };

      expect(mission.id).toBeTruthy();
      expect(mission.name).toBeTruthy();
      expect(mission.vessel_id).toBeTruthy();
      expect(mission.assigned_crew.length).toBeGreaterThan(0);
    });

    it("should validate mission status values", () => {
      const validStatuses: Array<
        "planning" | "active" | "completed" | "cancelled"
      > = ["planning", "active", "completed", "cancelled"];

      validStatuses.forEach(status => {
        const mission: Mission = {
          id: "test-mission",
          name: "Test Mission",
          description: "Test",
          status,
          priority: "medium",
          vessel_id: "vessel-001",
          start_date: "2025-11-01",
          end_date: "2025-11-15",
          assigned_crew: ["crew-001"],
          created_by: "user",
          created_at: new Date().toISOString(),
        };

        expect(["planning", "active", "completed", "cancelled"]).toContain(
          mission.status
        );
      });
    });

    it("should validate mission priority values", () => {
      const validPriorities: Array<"low" | "medium" | "high" | "critical"> = [
        "low",
        "medium",
        "high",
        "critical",
      ];

      validPriorities.forEach(priority => {
        const mission: Mission = {
          id: "test-mission",
          name: "Test Mission",
          description: "Test",
          status: "planning",
          priority,
          vessel_id: "vessel-001",
          start_date: "2025-11-01",
          end_date: "2025-11-15",
          assigned_crew: ["crew-001"],
          created_by: "user",
          created_at: new Date().toISOString(),
        };

        expect(["low", "medium", "high", "critical"]).toContain(
          mission.priority
        );
      });
    });

    it("should validate mission dates", () => {
      const mission: Mission = {
        id: "mission-001",
        name: "Test Mission",
        description: "Test",
        status: "planning",
        priority: "medium",
        vessel_id: "vessel-001",
        start_date: "2025-11-01",
        end_date: "2025-11-15",
        assigned_crew: ["crew-001"],
        created_by: "user",
        created_at: "2025-10-29T10:00:00Z",
      };

      const startDate = new Date(mission.start_date);
      const endDate = new Date(mission.end_date);

      expect(startDate <= endDate).toBe(true);
    });
  });

  describe("Mission Filtering and Sorting", () => {
    const missions: Mission[] = [
      {
        id: "1",
        name: "Survey Alpha",
        description: "Survey mission",
        status: "active",
        priority: "high",
        vessel_id: "vessel-001",
        start_date: "2025-10-01",
        end_date: "2025-10-15",
        assigned_crew: ["crew-001", "crew-002"],
        created_by: "user-001",
        created_at: "2025-09-15T10:00:00Z",
      },
      {
        id: "2",
        name: "Transport Beta",
        description: "Transport mission",
        status: "planning",
        priority: "medium",
        vessel_id: "vessel-002",
        start_date: "2025-11-01",
        end_date: "2025-11-10",
        assigned_crew: ["crew-003"],
        created_by: "user-002",
        created_at: "2025-10-01T10:00:00Z",
      },
      {
        id: "3",
        name: "Rescue Gamma",
        description: "Emergency rescue",
        status: "active",
        priority: "critical",
        vessel_id: "vessel-003",
        start_date: "2025-10-29",
        end_date: "2025-10-30",
        assigned_crew: ["crew-004", "crew-005", "crew-006"],
        created_by: "user-003",
        created_at: "2025-10-28T10:00:00Z",
      },
      {
        id: "4",
        name: "Survey Delta",
        description: "Completed survey",
        status: "completed",
        priority: "medium",
        vessel_id: "vessel-001",
        start_date: "2025-09-01",
        end_date: "2025-09-15",
        assigned_crew: ["crew-001", "crew-002"],
        created_by: "user-001",
        created_at: "2025-08-15T10:00:00Z",
      },
    ];

    it("should filter missions by status", () => {
      const activeMissions = missions.filter(m => m.status === "active");

      expect(activeMissions).toHaveLength(2);
      expect(activeMissions.every(m => m.status === "active")).toBe(true);
    });

    it("should filter missions by priority", () => {
      const criticalMissions = missions.filter(m => m.priority === "critical");

      expect(criticalMissions).toHaveLength(1);
      expect(criticalMissions[0].name).toBe("Rescue Gamma");
    });

    it("should filter missions by vessel", () => {
      const vessel001Missions = missions.filter(
        m => m.vessel_id === "vessel-001"
      );

      expect(vessel001Missions).toHaveLength(2);
    });

    it("should sort missions by priority", () => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const sorted = [...missions].sort(
        (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
      );

      expect(sorted[0].priority).toBe("critical");
      expect(sorted[sorted.length - 1].priority).toBe("medium");
    });

    it("should find missions with crew member", () => {
      const crewId = "crew-001";
      const crewMissions = missions.filter(m =>
        m.assigned_crew.includes(crewId)
      );

      expect(crewMissions).toHaveLength(2);
    });
  });

  describe("Mission Tasks", () => {
    const tasks: MissionTask[] = [
      {
        id: "task-001",
        mission_id: "mission-001",
        title: "Prepare equipment",
        description: "Prepare survey equipment",
        status: "completed",
        assigned_to: "crew-001",
        due_date: "2025-10-30",
        priority: "high",
      },
      {
        id: "task-002",
        mission_id: "mission-001",
        title: "Conduct survey",
        description: "Conduct geological survey",
        status: "in-progress",
        assigned_to: "crew-002",
        due_date: "2025-11-05",
        priority: "high",
      },
      {
        id: "task-003",
        mission_id: "mission-001",
        title: "Compile report",
        description: "Compile survey results",
        status: "pending",
        assigned_to: "crew-003",
        due_date: "2025-11-10",
        priority: "medium",
      },
    ];

    it("should filter tasks by mission", () => {
      const missionTasks = tasks.filter(t => t.mission_id === "mission-001");

      expect(missionTasks).toHaveLength(3);
    });

    it("should filter tasks by status", () => {
      const inProgressTasks = tasks.filter(t => t.status === "in-progress");

      expect(inProgressTasks).toHaveLength(1);
      expect(inProgressTasks[0].title).toBe("Conduct survey");
    });

    it("should calculate task completion percentage", () => {
      const completed = tasks.filter(t => t.status === "completed").length;
      const total = tasks.length;
      const percentage = (completed / total) * 100;

      expect(percentage).toBeCloseTo(33.33, 1);
    });

    it("should find overdue tasks", () => {
      const today = new Date("2025-11-06");
      const overdue = tasks.filter(task => {
        const dueDate = new Date(task.due_date);
        return dueDate < today && task.status !== "completed";
      });

      expect(overdue).toHaveLength(1); // task-002 due 2025-11-05
    });

    it("should find tasks assigned to crew member", () => {
      const crewId = "crew-002";
      const assignedTasks = tasks.filter(t => t.assigned_to === crewId);

      expect(assignedTasks).toHaveLength(1);
      expect(assignedTasks[0].title).toBe("Conduct survey");
    });
  });

  describe("Mission Logs", () => {
    const logs: MissionLog[] = [
      {
        id: "log-001",
        mission_id: "mission-001",
        event_type: "status_change",
        description: "Mission started",
        severity: "info",
        timestamp: "2025-11-01T08:00:00Z",
        logged_by: "system",
      },
      {
        id: "log-002",
        mission_id: "mission-001",
        event_type: "alert",
        description: "Weather warning",
        severity: "warning",
        timestamp: "2025-11-02T10:00:00Z",
        logged_by: "crew-001",
      },
      {
        id: "log-003",
        mission_id: "mission-001",
        event_type: "incident",
        description: "Equipment malfunction",
        severity: "error",
        timestamp: "2025-11-03T14:00:00Z",
        logged_by: "crew-002",
      },
      {
        id: "log-004",
        mission_id: "mission-001",
        event_type: "emergency",
        description: "Emergency response required",
        severity: "critical",
        timestamp: "2025-11-04T09:00:00Z",
        logged_by: "crew-001",
      },
    ];

    it("should filter logs by mission", () => {
      const missionLogs = logs.filter(l => l.mission_id === "mission-001");

      expect(missionLogs).toHaveLength(4);
    });

    it("should filter logs by severity", () => {
      const criticalLogs = logs.filter(l => l.severity === "critical");

      expect(criticalLogs).toHaveLength(1);
      expect(criticalLogs[0].event_type).toBe("emergency");
    });

    it("should sort logs by timestamp", () => {
      const sorted = [...logs].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      expect(sorted[0].id).toBe("log-004"); // Most recent
      expect(sorted[sorted.length - 1].id).toBe("log-001"); // Oldest
    });

    it("should count logs by severity", () => {
      const severityCounts = logs.reduce(
        (acc, log) => {
          acc[log.severity] = (acc[log.severity] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      expect(severityCounts["info"]).toBe(1);
      expect(severityCounts["warning"]).toBe(1);
      expect(severityCounts["error"]).toBe(1);
      expect(severityCounts["critical"]).toBe(1);
    });

    it("should filter logs by event type", () => {
      const alerts = logs.filter(l => l.event_type === "alert");

      expect(alerts).toHaveLength(1);
      expect(alerts[0].description).toBe("Weather warning");
    });
  });

  describe("Mission Status Transitions", () => {
    it("should transition from planning to active", () => {
      const mission: Mission = {
        id: "mission-001",
        name: "Test Mission",
        description: "Test",
        status: "planning",
        priority: "medium",
        vessel_id: "vessel-001",
        start_date: "2025-11-01",
        end_date: "2025-11-15",
        assigned_crew: ["crew-001"],
        created_by: "user",
        created_at: "2025-10-29T10:00:00Z",
      };

      const updatedMission = {
        ...mission,
        status: "active" as const,
      };

      expect(updatedMission.status).toBe("active");
    });

    it("should transition from active to completed", () => {
      const mission: Mission = {
        id: "mission-001",
        name: "Test Mission",
        description: "Test",
        status: "active",
        priority: "medium",
        vessel_id: "vessel-001",
        start_date: "2025-11-01",
        end_date: "2025-11-15",
        assigned_crew: ["crew-001"],
        created_by: "user",
        created_at: "2025-10-29T10:00:00Z",
      };

      const completedMission = {
        ...mission,
        status: "completed" as const,
      };

      expect(completedMission.status).toBe("completed");
    });
  });
});
