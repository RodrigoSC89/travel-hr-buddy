/**
 * Validation Schemas Tests
 * Validates all Zod schemas for maritime forms
 */
import { describe, it, expect } from "vitest";
import {
  vesselSchema,
  maintenanceOrderSchema,
  certificateSchema,
  purchaseOrderSchema,
  voyagePlanSchema,
  noonReportSchema,
  incidentReportSchema,
  workRestRecordSchema,
  crewMemberSchema,
  addCrewFormSchema,
} from "@/lib/validation/schemas";

describe("Maritime Zod Validation Schemas", () => {
  describe("vesselSchema", () => {
    it("accepts valid vessel", () => {
      const result = vesselSchema.safeParse({
        name: "MV Atlantic Star",
        vessel_type: "Tanker",
        flag_state: "BR",
        status: "active",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid IMO number", () => {
      const result = vesselSchema.safeParse({
        name: "Test",
        vessel_type: "Tanker",
        flag_state: "BR",
        imo_number: "INVALID",
      });
      expect(result.success).toBe(false);
    });

    it("accepts valid IMO format", () => {
      const result = vesselSchema.safeParse({
        name: "Test Vessel",
        vessel_type: "Bulk",
        flag_state: "PA",
        imo_number: "IMO 9876543",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("voyagePlanSchema", () => {
    it("accepts valid voyage plan", () => {
      const result = voyagePlanSchema.safeParse({
        vessel_id: "550e8400-e29b-41d4-a716-446655440000",
        voyage_number: "V-2026-001",
        departure_port: "Santos",
        arrival_port: "Rotterdam",
        departure_date: "2026-03-01T00:00:00Z",
        arrival_date: "2026-03-20T00:00:00Z",
        status: "planned",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing departure port", () => {
      const result = voyagePlanSchema.safeParse({
        vessel_id: "550e8400-e29b-41d4-a716-446655440000",
        voyage_number: "V001",
        departure_port: "",
        arrival_port: "Rotterdam",
        departure_date: "2026-03-01T00:00:00Z",
        arrival_date: "2026-03-20T00:00:00Z",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("noonReportSchema", () => {
    it("accepts valid noon report", () => {
      const result = noonReportSchema.safeParse({
        vessel_id: "550e8400-e29b-41d4-a716-446655440000",
        report_date: "2026-02-26T12:00:00Z",
        latitude: -23.55,
        longitude: -46.63,
        speed: 12.5,
        wind_force: 5,
        sea_state: 3,
        fuel_consumed_mt: 45.2,
      });
      expect(result.success).toBe(true);
    });

    it("rejects out-of-range latitude", () => {
      const result = noonReportSchema.safeParse({
        vessel_id: "550e8400-e29b-41d4-a716-446655440000",
        report_date: "2026-02-26T12:00:00Z",
        latitude: 95,
        longitude: -46.63,
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid Beaufort scale", () => {
      const result = noonReportSchema.safeParse({
        vessel_id: "550e8400-e29b-41d4-a716-446655440000",
        report_date: "2026-02-26T12:00:00Z",
        latitude: 0,
        longitude: 0,
        wind_force: 15,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("incidentReportSchema", () => {
    it("accepts valid incident", () => {
      const result = incidentReportSchema.safeParse({
        title: "Near miss on deck",
        description: "Crew member slipped near crane area during loading ops",
        incident_type: "near_miss",
        severity: "medium",
        vessel_id: "550e8400-e29b-41d4-a716-446655440000",
        incident_date: "2026-02-26T08:30:00Z",
      });
      expect(result.success).toBe(true);
    });

    it("rejects short description", () => {
      const result = incidentReportSchema.safeParse({
        title: "Test incident title",
        description: "Short",
        incident_type: "injury",
        severity: "high",
        vessel_id: "550e8400-e29b-41d4-a716-446655440000",
        incident_date: "2026-02-26T08:30:00Z",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("workRestRecordSchema (MLC Reg 2.3)", () => {
    it("accepts valid work/rest record", () => {
      const result = workRestRecordSchema.safeParse({
        crew_member_id: "550e8400-e29b-41d4-a716-446655440000",
        record_date: "2026-02-26T00:00:00Z",
        work_hours: 10,
        rest_hours: 14,
      });
      expect(result.success).toBe(true);
    });

    it("rejects work+rest > 24h", () => {
      const result = workRestRecordSchema.safeParse({
        crew_member_id: "550e8400-e29b-41d4-a716-446655440000",
        record_date: "2026-02-26T00:00:00Z",
        work_hours: 16,
        rest_hours: 12,
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative hours", () => {
      const result = workRestRecordSchema.safeParse({
        crew_member_id: "550e8400-e29b-41d4-a716-446655440000",
        record_date: "2026-02-26T00:00:00Z",
        work_hours: -2,
        rest_hours: 14,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("maintenanceOrderSchema", () => {
    it("accepts valid maintenance order", () => {
      const result = maintenanceOrderSchema.safeParse({
        title: "Replace main engine filter",
        priority: "high",
        category: "Engine",
        vessel_id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("purchaseOrderSchema", () => {
    it("rejects empty items array", () => {
      const result = purchaseOrderSchema.safeParse({
        supplier_name: "Marine Supplies Ltd",
        items: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("addCrewFormSchema", () => {
    it("accepts valid crew member", () => {
      const result = addCrewFormSchema.safeParse({
        full_name: "João Silva",
        rank: "Chief Officer",
        nationality: "BR",
        status: "available",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid nationality code", () => {
      const result = addCrewFormSchema.safeParse({
        full_name: "Test User",
        rank: "AB",
        nationality: "Brasil",
        status: "active",
      });
      expect(result.success).toBe(false);
    });
  });
});
