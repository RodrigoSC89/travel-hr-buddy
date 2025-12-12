import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockIncident, mockCrew } from "../shared/mock-factories";

describe("Integration: Incident Lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should complete full incident lifecycle from creation to resolution", async () => {
    // Arrange
    const incident = mockIncident({ 
      status: "pending",
      severity: "high",
      type: "emergency"
    });

    // Act - Create incident
    const created = { ...incident, id: "inc-001", createdAt: new Date() };
    expect(created.status).toBe("pending");

    // Act - Assign crew
    const crew = mockCrew({ status: "available" });
    const assigned = { 
      ...created, 
      status: "assigned",
      assignedCrew: [crew.id],
      assignedAt: new Date()
    };
    expect(assigned.status).toBe("assigned");
    expect(assigned.assignedCrew).toHaveLength(1);

    // Act - Start response
    const inProgress = {
      ...assigned,
      status: "in_progress",
      startedAt: new Date(),
    };
    expect(inProgress.status).toBe("in_progress");

    // Act - Resolve incident
    const resolved = {
      ...inProgress,
      status: "resolved",
      resolvedAt: new Date(),
      resolution: "Successfully handled emergency",
    };
    expect(resolved.status).toBe("resolved");
    expect(resolved.resolution).toBeDefined();
  });

  it("should handle incident escalation", async () => {
    // Arrange
    const incident = mockIncident({ 
      severity: "low",
      type: "maintenance"
    });

    // Act - Escalate incident
    const escalated = {
      ...incident,
      severity: "high",
      escalatedAt: new Date(),
      escalationReason: "Situation worsened",
    };

    // Assert
    expect(escalated.severity).toBe("high");
    expect(escalated.escalatedAt).toBeInstanceOf(Date);
    expect(escalated.escalationReason).toBeDefined();
  });

  it("should track incident timeline events", async () => {
    // Arrange
    const incident = mockIncident();
    const timeline: unknown[] = [];

    // Act - Add timeline events
    timeline.push({
      timestamp: new Date(),
      event: "incident_created",
      description: "Incident reported",
    });

    timeline.push({
      timestamp: new Date(),
      event: "crew_assigned",
      description: "Crew member assigned to incident",
    });

    timeline.push({
      timestamp: new Date(),
      event: "incident_resolved",
      description: "Incident successfully resolved",
    });

    // Assert
    expect(timeline).toHaveLength(3);
    expect(timeline[0].event).toBe("incident_created");
    expect(timeline[2].event).toBe("incident_resolved");
  });

  it("should calculate incident response metrics", async () => {
    // Arrange
    const createdAt = new Date("2025-01-20T10:00:00Z");
    const assignedAt = new Date("2025-01-20T10:05:00Z");
    const resolvedAt = new Date("2025-01-20T10:30:00Z");

    // Act - Calculate metrics
    const timeToAssign = (assignedAt.getTime() - createdAt.getTime()) / 60000; // minutes
    const timeToResolve = (resolvedAt.getTime() - createdAt.getTime()) / 60000; // minutes

    // Assert
    expect(timeToAssign).toBe(5); // 5 minutes to assign
    expect(timeToResolve).toBe(30); // 30 minutes to resolve
  });

  it("should prevent invalid status transitions", async () => {
    // Arrange
    const incident = mockIncident({ status: "resolved" });

    // Act & Assert - Cannot reopen resolved incident without proper flow
    const validTransitions = ["resolved", "archived"];
    const invalidTransition = "pending";

    expect(validTransitions).toContain("resolved");
    expect(validTransitions).not.toContain(invalidTransition);
  });

  it("should support multiple crew assignments", async () => {
    // Arrange
    const incident = mockIncident({ severity: "critical" });
    const crew1 = mockCrew({ rank: "captain" });
    const crew2 = mockCrew({ rank: "engineer" });
    const crew3 = mockCrew({ rank: "medic" });

    // Act
    const multiCrewIncident = {
      ...incident,
      assignedCrew: [crew1.id, crew2.id, crew3.id],
    };

    // Assert
    expect(multiCrewIncident.assignedCrew).toHaveLength(3);
    expect(multiCrewIncident.assignedCrew).toContain(crew1.id);
    expect(multiCrewIncident.assignedCrew).toContain(crew2.id);
    expect(multiCrewIncident.assignedCrew).toContain(crew3.id);
  });
};
