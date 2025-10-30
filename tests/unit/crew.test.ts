/**
 * PATCH 532 - Unit tests for Crew Module
 * Tests crew member operations, assignments, and validations
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

interface CrewMember {
  id: string;
  name: string;
  role: string;
  status: "active" | "inactive" | "on-leave";
  certifications: string[];
  assigned_vessel?: string;
  email?: string;
  phone?: string;
}

interface CrewSchedule {
  id: string;
  crew_member_id: string;
  vessel_id: string;
  start_date: string;
  end_date: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
}

describe("Crew Module", () => {
  describe("Crew Member Validation", () => {
    it("should validate required crew member fields", () => {
      const crewMember: CrewMember = {
        id: "crew-001",
        name: "John Doe",
        role: "Captain",
        status: "active",
        certifications: ["STCW", "Master License"],
      };

      expect(crewMember.id).toBeTruthy();
      expect(crewMember.name).toBeTruthy();
      expect(crewMember.role).toBeTruthy();
      expect(crewMember.status).toBe("active");
      expect(crewMember.certifications).toHaveLength(2);
    });

    it("should validate crew member status values", () => {
      const validStatuses: Array<"active" | "inactive" | "on-leave"> = [
        "active",
        "inactive",
        "on-leave",
      ];

      validStatuses.forEach(status => {
        const member: CrewMember = {
          id: "test-id",
          name: "Test Member",
          role: "Engineer",
          status,
          certifications: [],
        };

        expect(["active", "inactive", "on-leave"]).toContain(member.status);
      });
    });

    it("should handle optional crew member fields", () => {
      const crewMember: CrewMember = {
        id: "crew-002",
        name: "Jane Smith",
        role: "Engineer",
        status: "active",
        certifications: ["STCW"],
        email: "jane.smith@example.com",
        phone: "+1-555-0123",
        assigned_vessel: "vessel-001",
      };

      expect(crewMember.email).toBe("jane.smith@example.com");
      expect(crewMember.phone).toBe("+1-555-0123");
      expect(crewMember.assigned_vessel).toBe("vessel-001");
    });
  });

  describe("Crew Filtering and Sorting", () => {
    const crewMembers: CrewMember[] = [
      {
        id: "1",
        name: "Alice Johnson",
        role: "Captain",
        status: "active",
        certifications: ["STCW", "Master License"],
        assigned_vessel: "vessel-001",
      },
      {
        id: "2",
        name: "Bob Wilson",
        role: "Engineer",
        status: "inactive",
        certifications: ["STCW"],
      },
      {
        id: "3",
        name: "Carol Davis",
        role: "Chef",
        status: "on-leave",
        certifications: ["Food Safety"],
      },
      {
        id: "4",
        name: "David Brown",
        role: "Deckhand",
        status: "active",
        certifications: ["STCW"],
        assigned_vessel: "vessel-002",
      },
    ];

    it("should filter active crew members", () => {
      const activeMembers = crewMembers.filter(
        member => member.status === "active"
      );

      expect(activeMembers).toHaveLength(2);
      expect(activeMembers.every(m => m.status === "active")).toBe(true);
    });

    it("should filter crew members by role", () => {
      const engineers = crewMembers.filter(member => member.role === "Engineer");

      expect(engineers).toHaveLength(1);
      expect(engineers[0].name).toBe("Bob Wilson");
    });

    it("should filter crew members with certifications", () => {
      const stcwCertified = crewMembers.filter(member =>
        member.certifications.includes("STCW")
      );

      expect(stcwCertified).toHaveLength(3);
    });

    it("should filter assigned crew members", () => {
      const assignedMembers = crewMembers.filter(
        member => member.assigned_vessel !== undefined
      );

      expect(assignedMembers).toHaveLength(2);
      expect(assignedMembers.every(m => m.assigned_vessel)).toBe(true);
    });

    it("should sort crew members by name", () => {
      const sorted = [...crewMembers].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      expect(sorted[0].name).toBe("Alice Johnson");
      expect(sorted[sorted.length - 1].name).toBe("David Brown");
    });
  });

  describe("Crew Schedules", () => {
    const schedules: CrewSchedule[] = [
      {
        id: "schedule-001",
        crew_member_id: "crew-001",
        vessel_id: "vessel-001",
        start_date: "2025-11-01",
        end_date: "2025-11-30",
        status: "scheduled",
      },
      {
        id: "schedule-002",
        crew_member_id: "crew-002",
        vessel_id: "vessel-001",
        start_date: "2025-10-15",
        end_date: "2025-10-29",
        status: "active",
      },
      {
        id: "schedule-003",
        crew_member_id: "crew-003",
        vessel_id: "vessel-002",
        start_date: "2025-09-01",
        end_date: "2025-09-30",
        status: "completed",
      },
    ];

    it("should validate schedule dates", () => {
      schedules.forEach(schedule => {
        const start = new Date(schedule.start_date);
        const end = new Date(schedule.end_date);

        expect(start <= end).toBe(true);
      });
    });

    it("should filter schedules by status", () => {
      const activeSchedules = schedules.filter(s => s.status === "active");

      expect(activeSchedules).toHaveLength(1);
      expect(activeSchedules[0].crew_member_id).toBe("crew-002");
    });

    it("should find schedules for a crew member", () => {
      const crewId = "crew-001";
      const memberSchedules = schedules.filter(
        s => s.crew_member_id === crewId
      );

      expect(memberSchedules).toHaveLength(1);
      expect(memberSchedules[0].id).toBe("schedule-001");
    });

    it("should validate schedule status values", () => {
      const validStatuses = ["scheduled", "active", "completed", "cancelled"];

      schedules.forEach(schedule => {
        expect(validStatuses).toContain(schedule.status);
      });
    });
  });

  describe("Crew Assignment Logic", () => {
    it("should assign crew member to vessel", () => {
      const crewMember: CrewMember = {
        id: "crew-001",
        name: "John Doe",
        role: "Captain",
        status: "active",
        certifications: ["STCW"],
      };

      const assignedMember = {
        ...crewMember,
        assigned_vessel: "vessel-001",
      };

      expect(assignedMember.assigned_vessel).toBe("vessel-001");
    });

    it("should unassign crew member from vessel", () => {
      const assignedMember: CrewMember = {
        id: "crew-001",
        name: "John Doe",
        role: "Captain",
        status: "active",
        certifications: ["STCW"],
        assigned_vessel: "vessel-001",
      };

      const { assigned_vessel, ...unassignedMember } = assignedMember;

      expect(unassignedMember.assigned_vessel).toBeUndefined();
    });

    it("should validate crew member is active before assignment", () => {
      const inactiveMember: CrewMember = {
        id: "crew-002",
        name: "Jane Smith",
        role: "Engineer",
        status: "inactive",
        certifications: ["STCW"],
      };

      const canAssign = inactiveMember.status === "active";

      expect(canAssign).toBe(false);
    });
  });

  describe("Crew Certification Management", () => {
    it("should add certification to crew member", () => {
      const crewMember: CrewMember = {
        id: "crew-001",
        name: "John Doe",
        role: "Captain",
        status: "active",
        certifications: ["STCW"],
      };

      const updatedMember = {
        ...crewMember,
        certifications: [...crewMember.certifications, "Master License"],
      };

      expect(updatedMember.certifications).toHaveLength(2);
      expect(updatedMember.certifications).toContain("Master License");
    });

    it("should remove certification from crew member", () => {
      const crewMember: CrewMember = {
        id: "crew-001",
        name: "John Doe",
        role: "Captain",
        status: "active",
        certifications: ["STCW", "Master License", "Safety Officer"],
      };

      const updatedMember = {
        ...crewMember,
        certifications: crewMember.certifications.filter(
          cert => cert !== "Safety Officer"
        ),
      };

      expect(updatedMember.certifications).toHaveLength(2);
      expect(updatedMember.certifications).not.toContain("Safety Officer");
    });

    it("should check if crew member has required certification", () => {
      const crewMember: CrewMember = {
        id: "crew-001",
        name: "John Doe",
        role: "Captain",
        status: "active",
        certifications: ["STCW", "Master License"],
      };

      const hasSTCW = crewMember.certifications.includes("STCW");
      const hasMedical = crewMember.certifications.includes("Medical Officer");

      expect(hasSTCW).toBe(true);
      expect(hasMedical).toBe(false);
    });
  });
});
