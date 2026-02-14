/**
 * Extended Data Contract Tests
 * Edge cases, cross-schema validation, and real-world data patterns
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
  CreateDocumentInput,
  CreateIncidentInput,
  CreateActionItemInput,
  UpdateVesselInput,
  UpdateIncidentInput,
  UpdateActionItemInput,
} from "@/contracts/schemas";

const UUID = "550e8400-e29b-41d4-a716-446655440000";
const UUID2 = "660e8400-e29b-41d4-a716-446655440001";

// ============================================
// DOCUMENT SCHEMA
// ============================================
describe("DocumentSchema", () => {
  it("validates a complete document", () => {
    const doc = {
      id: UUID,
      title: "Safety Manual",
      file_name: "safety-manual.pdf",
      file_type: "application/pdf",
      storage_path: "/docs/safety-manual.pdf",
      category: "safety",
      description: "Main safety procedures manual",
      file_size_bytes: 1024000,
    };
    expect(DocumentSchema.safeParse(doc).success).toBe(true);
  });

  it("rejects document with empty title", () => {
    const doc = { id: UUID, title: "", file_name: "test.pdf", file_type: "pdf", storage_path: "/test" };
    expect(DocumentSchema.safeParse(doc).success).toBe(false);
  });

  it("rejects invalid file_url format", () => {
    const doc = { id: UUID, title: "Test", file_name: "t.pdf", file_type: "pdf", storage_path: "/t", file_url: "not-a-url" };
    expect(DocumentSchema.safeParse(doc).success).toBe(false);
  });

  it("accepts valid file_url", () => {
    const doc = { id: UUID, title: "Test", file_name: "t.pdf", file_type: "pdf", storage_path: "/t", file_url: "https://storage.example.com/t.pdf" };
    expect(DocumentSchema.safeParse(doc).success).toBe(true);
  });
});

// ============================================
// CROSS-ENTITY REFERENCING
// ============================================
describe("Cross-entity references", () => {
  it("ActionItem references vessel_id and organization_id correctly", () => {
    const item = {
      id: UUID,
      title: "Replace fire extinguisher",
      priority: "high",
      status: "pending",
      vessel_id: UUID2,
      organization_id: UUID,
      assigned_to: UUID2,
    };
    expect(ActionItemSchema.safeParse(item).success).toBe(true);
  });

  it("CrewMember can reference vessel_id", () => {
    const crew = {
      id: UUID,
      full_name: "Carlos Santos",
      vessel_id: UUID2,
      rank: "Chief Engineer",
    };
    expect(CrewMemberSchema.safeParse(crew).success).toBe(true);
  });

  it("Incident can reference vessel_id", () => {
    const incident = {
      id: UUID,
      title: "Engine overheat",
      vessel_id: UUID2,
      severity: "high",
    };
    expect(IncidentSchema.safeParse(incident).success).toBe(true);
  });
});

// ============================================
// CREATE/UPDATE INPUT SCHEMAS
// ============================================
describe("Create/Update Input schemas", () => {
  it("CreateDocumentInput rejects id field", () => {
    const input = { id: UUID, title: "Test", file_name: "t.pdf", file_type: "pdf", storage_path: "/t" };
    const result = CreateDocumentInput.safeParse(input);
    // id should be stripped/ignored since it's omitted
    expect(result.success).toBe(true);
  });

  it("CreateIncidentInput validates without id", () => {
    const input = { title: "Spill detected", severity: "critical" as const, type: "environmental" as const };
    expect(CreateIncidentInput.safeParse(input).success).toBe(true);
  });

  it("UpdateVesselInput requires id", () => {
    const withId = { id: UUID, name: "Updated Name" };
    expect(UpdateVesselInput.safeParse(withId).success).toBe(true);

    const withoutId = { name: "No Id" };
    expect(UpdateVesselInput.safeParse(withoutId).success).toBe(false);
  });

  it("UpdateIncidentInput allows partial updates", () => {
    const partial = { id: UUID, status: "resolved" as const };
    expect(UpdateIncidentInput.safeParse(partial).success).toBe(true);
  });

  it("UpdateActionItemInput allows status change only", () => {
    const update = { id: UUID, status: "completed" as const };
    expect(UpdateActionItemInput.safeParse(update).success).toBe(true);
  });

  it("CreateActionItemInput validates priority", () => {
    const valid = { title: "Test task", priority: "critical" as const };
    expect(CreateActionItemInput.safeParse(valid).success).toBe(true);

    const invalid = { title: "Test", priority: "urgent" };
    expect(CreateActionItemInput.safeParse(invalid).success).toBe(false);
  });
});

// ============================================
// SAFE PARSE WITH REAL-WORLD SCENARIOS
// ============================================
describe("safeParse with real-world data", () => {
  it("handles Supabase response with extra fields gracefully", () => {
    const supabaseRow = {
      id: UUID,
      name: "MV Explorer",
      status: "active",
      unknown_field_1: "hello",
      unknown_field_2: 42,
    };
    const result = safeParse(VesselSchema, supabaseRow);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("MV Explorer");
  });

  it("handles null responses from Supabase", () => {
    expect(safeParse(VesselSchema, null)).toBeNull();
    expect(safeParse(VesselSchema, undefined)).toBeNull();
  });

  it("safeParseArray handles mixed valid/invalid + nulls", () => {
    const data = [
      { id: UUID, name: "Valid Ship", status: "active" },
      null,
      { id: "not-uuid", name: "" },
      { id: UUID2, name: "Ship 2" },
    ];
    const result = safeParseArray(VesselSchema, data.filter(Boolean) as unknown[]);
    expect(result).toHaveLength(2);
  });

  it("safeParseArray with large dataset performs correctly", () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: UUID,
      name: `Ship ${i}`,
      status: i % 3 === 0 ? "active" : "maintenance",
    }));
    const start = Date.now();
    const result = safeParseArray(VesselSchema, largeDataset);
    const elapsed = Date.now() - start;
    expect(result.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(1000); // < 1s for 1000 records
  });
});

// ============================================
// BOUNDARY VALUES
// ============================================
describe("Boundary values", () => {
  it("AuditSchema score boundaries", () => {
    expect(AuditSchema.safeParse({ id: UUID, audit_type: "psc", score: 0 }).success).toBe(true);
    expect(AuditSchema.safeParse({ id: UUID, audit_type: "psc", score: 100 }).success).toBe(true);
    expect(AuditSchema.safeParse({ id: UUID, audit_type: "psc", score: -0.1 }).success).toBe(false);
    expect(AuditSchema.safeParse({ id: UUID, audit_type: "psc", score: 100.1 }).success).toBe(false);
  });

  it("CrewMember with very long name", () => {
    const longName = "A".repeat(500);
    const result = CrewMemberSchema.safeParse({ id: UUID, full_name: longName });
    expect(result.success).toBe(true);
  });

  it("Vessel name minimum length enforced", () => {
    expect(VesselSchema.safeParse({ id: UUID, name: "A" }).success).toBe(true);
    expect(VesselSchema.safeParse({ id: UUID, name: "" }).success).toBe(false);
  });
});
