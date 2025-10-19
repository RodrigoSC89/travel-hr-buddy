/**
 * SGSO History API Tests
 * Tests for /api/sgso/history/[vesselId] endpoint
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";
import handler, { SGSOHistoryResponse } from "../../pages/api/sgso/history/[vesselId]";

// Mock Supabase client
const mockSupabaseData = {
  success: [
    {
      id: "plan-1",
      incident_id: "incident-1",
      vessel_id: "DP Shuttle Tanker X",
      correction_action: "Immediate gyro recalibration",
      prevention_action: "Implement automated drift detection",
      recommendation_action: "Upgrade to redundant gyro system",
      status: "aberto",
      approved_by: null,
      approved_at: null,
      created_at: "2025-10-18T10:00:00Z",
      updated_at: "2025-10-18T10:00:00Z",
      incident: {
        id: "incident-1",
        title: "Loss of Position Due to Gyro Drift",
        incident_date: "2025-09-12T00:00:00Z",
        severity: "Alta",
        sgso_category: "Equipamento",
        sgso_risk_level: "Crítico",
        description: "Gyro drift during tandem loading",
      },
    },
    {
      id: "plan-2",
      incident_id: "incident-2",
      vessel_id: "DP Shuttle Tanker X",
      correction_action: "Software patch applied",
      prevention_action: "Implement software version control",
      recommendation_action: "Establish pre-ROV deployment checklist",
      status: "em_andamento",
      approved_by: "João Silva - Safety Manager",
      approved_at: "2025-10-15T10:00:00Z",
      created_at: "2025-10-17T10:00:00Z",
      updated_at: "2025-10-17T10:00:00Z",
      incident: {
        id: "incident-2",
        title: "Thruster Control Software Failure",
        incident_date: "2025-08-05T00:00:00Z",
        severity: "Alta",
        sgso_category: "Sistema",
        sgso_risk_level: "Alto",
        description: "Software failure during ROV ops",
      },
    },
  ],
  empty: [],
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn((column: string, value: string) => ({
          order: vi.fn(() => ({
            data: value === "DP Shuttle Tanker X" ? mockSupabaseData.success : mockSupabaseData.empty,
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

// Helper to create mock request/response
function createMocks(query: Record<string, unknown> = {}, method = "GET") {
  const req = {
    method,
    query,
  } as unknown as NextApiRequest;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as NextApiResponse<SGSOHistoryResponse>;

  return { req, res };
}

describe("SGSO History API - /api/sgso/history/[vesselId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Method Validation", () => {
    it("should only allow GET requests", async () => {
      const { req, res } = createMocks({}, "POST");
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Method not allowed",
      });
    });

    it("should allow GET requests", async () => {
      const { req, res } = createMocks({ vesselId: "DP Shuttle Tanker X" }, "GET");
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("Parameter Validation", () => {
    it("should reject missing vessel ID", async () => {
      const { req, res } = createMocks({});
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Invalid or missing vessel ID parameter",
      });
    });

    it("should reject empty vessel ID", async () => {
      const { req, res } = createMocks({ vesselId: "   " });
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Vessel ID cannot be empty",
      });
    });

    it("should accept valid vessel ID", async () => {
      const { req, res } = createMocks({ vesselId: "DP Shuttle Tanker X" });
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should trim vessel ID whitespace", async () => {
      const { req, res } = createMocks({ vesselId: "  DP Shuttle Tanker X  " });
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("Data Retrieval", () => {
    it("should return action plans for valid vessel", async () => {
      const { req, res } = createMocks({ vesselId: "DP Shuttle Tanker X" });
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: "plan-1",
            vessel_id: "DP Shuttle Tanker X",
            status: "aberto",
          }),
        ]),
      });
    });

    it("should return empty array for vessel with no action plans", async () => {
      const { req, res } = createMocks({ vesselId: "Unknown Vessel" });
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });

    it("should include incident details in response", async () => {
      const { req, res } = createMocks({ vesselId: "DP Shuttle Tanker X" });
      await handler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            incident: expect.objectContaining({
              title: expect.any(String),
              sgso_category: expect.any(String),
              sgso_risk_level: expect.any(String),
            }),
          }),
        ]),
      });
    });
  });

  describe("Response Structure", () => {
    it("should return correct data structure", async () => {
      const { req, res } = createMocks({ vesselId: "DP Shuttle Tanker X" });
      await handler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            incident_id: expect.any(String),
            vessel_id: expect.any(String),
            status: expect.stringMatching(/^(aberto|em_andamento|resolvido)$/),
            created_at: expect.any(String),
            updated_at: expect.any(String),
            incident: expect.objectContaining({
              id: expect.any(String),
              title: expect.any(String),
              incident_date: expect.any(String),
              severity: expect.any(String),
            }),
          }),
        ]),
      });
    });

    it("should include all action plan fields", async () => {
      const { req, res } = createMocks({ vesselId: "DP Shuttle Tanker X" });
      await handler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            correction_action: expect.any(String),
            prevention_action: expect.any(String),
            recommendation_action: expect.any(String),
          }),
        ]),
      });
    });
  });

  describe("Status Workflow", () => {
    it("should return plans with different status states", async () => {
      const { req, res } = createMocks({ vesselId: "DP Shuttle Tanker X" });
      await handler(req, res);

      const callArgs = (res.json as unknown).mock.calls[0][0];
      const statuses = callArgs.data.map((plan: unknown) => plan.status);

      expect(statuses).toContain("aberto");
      expect(statuses).toContain("em_andamento");
    });

    it("should include approval information when present", async () => {
      const { req, res } = createMocks({ vesselId: "DP Shuttle Tanker X" });
      await handler(req, res);

      const callArgs = (res.json as unknown).mock.calls[0][0];
      const approvedPlan = callArgs.data.find((plan: unknown) => plan.approved_by);

      expect(approvedPlan).toBeDefined();
      expect(approvedPlan.approved_by).toBeTruthy();
      expect(approvedPlan.approved_at).toBeTruthy();
    });
  });

  describe("QSMS Compliance Features", () => {
    it("should include timestamps for audit trail", async () => {
      const { req, res } = createMocks({ vesselId: "DP Shuttle Tanker X" });
      await handler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            created_at: expect.any(String),
            updated_at: expect.any(String),
          }),
        ]),
      });
    });

    it("should include risk level for external audits", async () => {
      const { req, res } = createMocks({ vesselId: "DP Shuttle Tanker X" });
      await handler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            incident: expect.objectContaining({
              sgso_risk_level: expect.any(String),
            }),
          }),
        ]),
      });
    });

    it("should include SGSO category for classification", async () => {
      const { req, res } = createMocks({ vesselId: "DP Shuttle Tanker X" });
      await handler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            incident: expect.objectContaining({
              sgso_category: expect.any(String),
            }),
          }),
        ]),
      });
    });
  });

  describe("Chronological Ordering", () => {
    it("should order results by created_at descending (newest first)", async () => {
      const { req, res } = createMocks({ vesselId: "DP Shuttle Tanker X" });
      await handler(req, res);

      const callArgs = (res.json as unknown).mock.calls[0][0];
      const dates = callArgs.data.map((plan: unknown) => new Date(plan.created_at).getTime());

      // Check if sorted in descending order
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });
  });
});
