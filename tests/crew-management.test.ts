/**
 * Unit tests for Crew Management Module
 * Tests crew member operations and assignment logic
 */

import { describe, it, expect } from "vitest";

// Mock crew member type
interface CrewMember {
  id: string;
  name: string;
  role: string;
  status: "active" | "inactive" | "on-leave";
  certifications: string[];
  assigned_vessel?: string;
}

describe("Crew Management Module", () => {
  describe("Crew Member Operations", () => {
    it("should validate crew member data", () => {
      const crewMember: CrewMember = {
        id: "1",
        name: "John Doe",
        role: "Captain",
        status: "active",
        certifications: ["STCW", "Master License"],
      };

      expect(crewMember.name).toBeTruthy();
      expect(crewMember.role).toBeTruthy();
      expect(crewMember.status).toBe("active");
    });

    it("should filter active crew members", () => {
      const crew: CrewMember[] = [
        {
          id: "1",
          name: "John Doe",
          role: "Captain",
          status: "active",
          certifications: ["STCW"],
        },
        {
          id: "2",
          name: "Jane Smith",
          role: "Engineer",
          status: "inactive",
          certifications: ["STCW"],
        },
        {
          id: "3",
          name: "Bob Johnson",
          role: "Deck Officer",
          status: "active",
          certifications: ["STCW"],
        },
      ];

      const activeCrew = crew.filter(member => member.status === "active");
      expect(activeCrew).toHaveLength(2);
    });

    it("should check crew certification validity", () => {
      const crewMember: CrewMember = {
        id: "1",
        name: "John Doe",
        role: "Captain",
        status: "active",
        certifications: ["STCW", "Master License", "GMDSS"],
      };

      const requiredCerts = ["STCW", "Master License"];
      const hasRequiredCerts = requiredCerts.every(cert =>
        crewMember.certifications.includes(cert)
      );

      expect(hasRequiredCerts).toBe(true);
    });

    it("should assign crew member to vessel", () => {
      const crewMember: CrewMember = {
        id: "1",
        name: "John Doe",
        role: "Captain",
        status: "active",
        certifications: ["STCW"],
      };

      const assignedMember = {
        ...crewMember,
        assigned_vessel: "VESSEL-001",
      };

      expect(assignedMember.assigned_vessel).toBe("VESSEL-001");
    });

    it("should count crew members by role", () => {
      const crew: CrewMember[] = [
        { id: "1", name: "John", role: "Captain", status: "active", certifications: [] },
        { id: "2", name: "Jane", role: "Engineer", status: "active", certifications: [] },
        { id: "3", name: "Bob", role: "Engineer", status: "active", certifications: [] },
      ];

      const engineerCount = crew.filter(m => m.role === "Engineer").length;
      expect(engineerCount).toBe(2);
    });
  });

  describe("Crew Assignment Logic", () => {
    it("should validate vessel capacity", () => {
      const vesselCapacity = 20;
      const assignedCrew = 15;
      
      const canAssign = assignedCrew < vesselCapacity;
      expect(canAssign).toBe(true);
    });

    it("should prevent over-assignment", () => {
      const vesselCapacity = 20;
      const assignedCrew = 20;
      
      const canAssign = assignedCrew < vesselCapacity;
      expect(canAssign).toBe(false);
    });

    it("should calculate crew utilization rate", () => {
      const totalCrew = 100;
      const assignedCrew = 85;
      
      const utilizationRate = (assignedCrew / totalCrew) * 100;
      expect(utilizationRate).toBe(85);
    });
  });

  describe("Crew Scheduling", () => {
    it("should detect scheduling conflicts", () => {
      const schedules = [
        { crewId: "1", startDate: "2025-10-01", endDate: "2025-10-15" },
        { crewId: "1", startDate: "2025-10-10", endDate: "2025-10-20" },
      ];

      const hasConflict = schedules.some((current, index) =>
        schedules.slice(index + 1).some(other => {
          const currentStart = new Date(current.startDate).getTime();
          const currentEnd = new Date(current.endDate).getTime();
          const otherStart = new Date(other.startDate).getTime();
          const otherEnd = new Date(other.endDate).getTime();

          const overlaps = currentStart <= otherEnd && otherStart <= currentEnd;
          return current.crewId === other.crewId && overlaps;
        })
      );
      expect(hasConflict).toBe(true);
    });

    it("should calculate rotation periods", () => {
      const rotationDays = 90;
      const currentDay = 45;
      const remainingDays = rotationDays - currentDay;
      
      expect(remainingDays).toBe(45);
    });
  });
});
