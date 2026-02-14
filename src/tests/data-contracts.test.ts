/**
 * Data Contracts Tests - Zod Schema Validation
 * Tests all critical entity schemas and safe parse helpers
 */

import { describe, it, expect } from "vitest";
import {
  VesselSchema,
  CrewMemberSchema,
  DocumentSchema,
  IncidentSchema,
  AuditSchema,
  ActionItemSchema,
  safeParse,
  safeParseArray,
  CreateVesselInput,
  CreateCrewMemberInput,
} from "@/contracts/schemas";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("VesselSchema", () => {
  it("validates a correct vessel", () => {
    const vessel = { id: VALID_UUID, name: "MV Atlantic", status: "active" };
    const result = VesselSchema.safeParse(vessel);
    expect(result.success).toBe(true);
  });

  it("rejects vessel without name", () => {
    const vessel = { id: VALID_UUID, name: "", status: "active" };
    const result = VesselSchema.safeParse(vessel);
    expect(result.success).toBe(false);
  });

  it("rejects vessel with invalid status", () => {
    const vessel = { id: VALID_UUID, name: "MV Test", status: "flying" };
    const result = VesselSchema.safeParse(vessel);
    expect(result.success).toBe(false);
  });

  it("accepts nullable optional fields", () => {
    const vessel = {
      id: VALID_UUID,
      name: "MV Test",
      imo_number: null,
      vessel_type: null,
      flag: null,
      organization_id: null,
    };
    const result = VesselSchema.safeParse(vessel);
    expect(result.success).toBe(true);
  });

  it("defaults status to active when missing", () => {
    const vessel = { id: VALID_UUID, name: "MV Test" };
    const result = VesselSchema.safeParse(vessel);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("active");
  });
});

describe("CrewMemberSchema", () => {
  it("validates a correct crew member", () => {
    const crew = { id: VALID_UUID, full_name: "João Silva", status: "active" };
    const result = CrewMemberSchema.safeParse(crew);
    expect(result.success).toBe(true);
  });

  it("rejects empty full_name", () => {
    const crew = { id: VALID_UUID, full_name: "", status: "active" };
    const result = CrewMemberSchema.safeParse(crew);
    expect(result.success).toBe(false);
  });

  it("validates all valid statuses", () => {
    const statuses = ["active", "on_leave", "off_duty", "terminated", "pending"];
    for (const status of statuses) {
      const result = CrewMemberSchema.safeParse({ id: VALID_UUID, full_name: "Test", status });
      expect(result.success).toBe(true);
    }
  });

  it("validates email format when provided", () => {
    const crew = { id: VALID_UUID, full_name: "Test", email: "invalid-email" };
    const result = CrewMemberSchema.safeParse(crew);
    expect(result.success).toBe(false);
  });
});

describe("IncidentSchema", () => {
  it("validates a correct incident", () => {
    const incident = { id: VALID_UUID, title: "Fire in engine room", severity: "critical", status: "open", type: "safety" };
    const result = IncidentSchema.safeParse(incident);
    expect(result.success).toBe(true);
  });

  it("defaults severity to medium", () => {
    const incident = { id: VALID_UUID, title: "Test" };
    const result = IncidentSchema.safeParse(incident);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.severity).toBe("medium");
  });
});

describe("AuditSchema", () => {
  it("validates score range 0-100", () => {
    const valid = { id: VALID_UUID, audit_type: "internal", score: 85 };
    expect(AuditSchema.safeParse(valid).success).toBe(true);

    const tooHigh = { id: VALID_UUID, audit_type: "internal", score: 150 };
    expect(AuditSchema.safeParse(tooHigh).success).toBe(false);

    const negative = { id: VALID_UUID, audit_type: "internal", score: -5 };
    expect(AuditSchema.safeParse(negative).success).toBe(false);
  });
});

describe("ActionItemSchema", () => {
  it("validates all priority levels", () => {
    const priorities = ["low", "medium", "high", "critical"];
    for (const priority of priorities) {
      const result = ActionItemSchema.safeParse({ id: VALID_UUID, title: "Test", priority });
      expect(result.success).toBe(true);
    }
  });
});

describe("safeParse", () => {
  it("returns parsed data for valid input", () => {
    const result = safeParse(VesselSchema, { id: VALID_UUID, name: "Test" });
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test");
  });

  it("returns null for invalid input", () => {
    const result = safeParse(VesselSchema, { id: "not-a-uuid", name: "" });
    expect(result).toBeNull();
  });

  it("returns null for completely wrong data", () => {
    const result = safeParse(VesselSchema, "not an object");
    expect(result).toBeNull();
  });
});

describe("safeParseArray", () => {
  it("filters out invalid records", () => {
    const data = [
      { id: VALID_UUID, name: "Valid Ship" },
      { id: "bad", name: "" },
      { id: VALID_UUID, name: "Another Ship" },
    ];
    const result = safeParseArray(VesselSchema, data);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Valid Ship");
    expect(result[1].name).toBe("Another Ship");
  });

  it("returns empty array for all invalid data", () => {
    const result = safeParseArray(VesselSchema, [{ bad: true }, { worse: true }]);
    expect(result).toHaveLength(0);
  });
});

describe("CreateVesselInput", () => {
  it("omits id and timestamps", () => {
    const input = { name: "New Vessel", status: "active" as const };
    const result = CreateVesselInput.safeParse(input);
    expect(result.success).toBe(true);
  });
});

describe("CreateCrewMemberInput", () => {
  it("omits id and timestamps", () => {
    const input = { full_name: "New Crew", status: "active" as const };
    const result = CreateCrewMemberInput.safeParse(input);
    expect(result.success).toBe(true);
  });
});
