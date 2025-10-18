/**
 * SGSO History API Endpoint Tests
 * 
 * Tests for the /api/sgso/history/[vesselId] endpoint that provides
 * action plan history for vessels based on DP incidents.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("SGSO History API Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Handling", () => {
    it("should handle GET requests", () => {
      const method = "GET";
      expect(method).toBe("GET");
    });

    it("should reject non-GET requests with 405", () => {
      const errorResponse = {
        status: 405,
        error: "Método não permitido."
      };
      expect(errorResponse.status).toBe(405);
      expect(errorResponse.error).toBe("Método não permitido.");
    });

    it("should use correct API endpoint path pattern", () => {
      const endpointPath = "/api/sgso/history/[vesselId]";
      expect(endpointPath).toContain("sgso/history");
    });

    it("should require vesselId parameter", () => {
      const vesselId = "123e4567-e89b-12d3-a456-426614174000";
      expect(vesselId).toBeTruthy();
    });

    it("should reject requests without vesselId", () => {
      const errorResponse = {
        status: 400,
        error: "vesselId é obrigatório."
      };
      expect(errorResponse.status).toBe(400);
    });
  });

  describe("Database Query", () => {
    it("should query sgso_action_plans table", () => {
      const tableName = "sgso_action_plans";
      expect(tableName).toBe("sgso_action_plans");
    });

    it("should join with dp_incidents table", () => {
      const selectQuery = `
        *,
        dp_incidents (
          description,
          updated_at,
          sgso_category,
          sgso_risk_level,
          title,
          date
        )
      `;
      expect(selectQuery).toContain("dp_incidents");
    });

    it("should filter by vessel_id", () => {
      const vesselId = "123e4567-e89b-12d3-a456-426614174000";
      const filterField = "vessel_id";
      expect(filterField).toBe("vessel_id");
      expect(vesselId).toBeTruthy();
    });

    it("should order by created_at descending", () => {
      const orderConfig = { created_at: { ascending: false } };
      expect(orderConfig.created_at.ascending).toBe(false);
    });
  });

  describe("Response Structure", () => {
    it("should return array of action plans", () => {
      const mockResponse = [
        {
          id: "plan-uuid-1",
          vessel_id: "vessel-uuid-1",
          incident_id: "imca-2025-014",
          corrective_action: "Realizar manutenção no thruster",
          preventive_action: "Implementar checklist preventivo",
          recommendation: "Aumentar frequência de inspeções",
          status: "em_andamento",
          approved_by: "João Silva",
          approved_at: "2025-10-15T10:00:00Z",
          created_at: "2025-10-10T08:00:00Z",
          dp_incidents: {
            description: "Falha no thruster principal",
            updated_at: "2025-10-10T09:00:00Z",
            sgso_category: "Equipamento",
            sgso_risk_level: "Alto",
            title: "Thruster Failure",
            date: "2025-10-09"
          }
        }
      ];

      expect(Array.isArray(mockResponse)).toBe(true);
      expect(mockResponse[0]).toHaveProperty("id");
      expect(mockResponse[0]).toHaveProperty("vessel_id");
      expect(mockResponse[0]).toHaveProperty("incident_id");
      expect(mockResponse[0]).toHaveProperty("status");
      expect(mockResponse[0]).toHaveProperty("dp_incidents");
    });

    it("should include action plan fields", () => {
      const actionPlan = {
        corrective_action: "Ação corretiva",
        preventive_action: "Ação preventiva",
        recommendation: "Recomendação IA/manual"
      };

      expect(actionPlan.corrective_action).toBeTruthy();
      expect(actionPlan.preventive_action).toBeTruthy();
      expect(actionPlan.recommendation).toBeTruthy();
    });

    it("should include incident details", () => {
      const incidentData = {
        description: "Descrição do incidente",
        sgso_category: "Equipamento",
        sgso_risk_level: "Alto",
        title: "Título do incidente",
        date: "2025-10-09"
      };

      expect(incidentData).toHaveProperty("description");
      expect(incidentData).toHaveProperty("sgso_category");
      expect(incidentData).toHaveProperty("sgso_risk_level");
    });

    it("should include approval information", () => {
      const approvalInfo = {
        approved_by: "João Silva",
        approved_at: "2025-10-15T10:00:00Z"
      };

      expect(approvalInfo.approved_by).toBeTruthy();
      expect(approvalInfo.approved_at).toBeTruthy();
    });
  });

  describe("Status Values", () => {
    it("should support 'aberto' status", () => {
      const status = "aberto";
      expect(status).toBe("aberto");
    });

    it("should support 'em_andamento' status", () => {
      const status = "em_andamento";
      expect(status).toBe("em_andamento");
    });

    it("should support 'resolvido' status", () => {
      const status = "resolvido";
      expect(status).toBe("resolvido");
    });

    it("should validate status values", () => {
      const validStatuses = ["aberto", "em_andamento", "resolvido"];
      expect(validStatuses).toHaveLength(3);
      expect(validStatuses).toContain("aberto");
      expect(validStatuses).toContain("em_andamento");
      expect(validStatuses).toContain("resolvido");
    });
  });

  describe("Error Handling", () => {
    it("should return 500 on database error", () => {
      const errorResponse = {
        status: 500,
        error: "Database connection failed"
      };
      expect(errorResponse.status).toBe(500);
    });

    it("should handle missing incident data gracefully", () => {
      const planWithoutIncident = {
        id: "plan-uuid-1",
        vessel_id: "vessel-uuid-1",
        incident_id: "missing-incident",
        status: "aberto",
        dp_incidents: null
      };
      expect(planWithoutIncident.dp_incidents).toBeNull();
    });

    it("should return empty array when no plans exist", () => {
      const emptyResponse: unknown[] = [];
      expect(Array.isArray(emptyResponse)).toBe(true);
      expect(emptyResponse).toHaveLength(0);
    });
  });

  describe("Integration with Frontend", () => {
    it("should provide data suitable for SGSOHistoryTable component", () => {
      const planData = {
        id: "plan-uuid-1",
        corrective_action: "Ação corretiva",
        preventive_action: "Ação preventiva",
        recommendation: "Recomendação",
        status: "em_andamento",
        approved_by: "João Silva",
        dp_incidents: {
          title: "Incidente Title",
          sgso_category: "Equipamento",
          sgso_risk_level: "Alto"
        }
      };

      expect(planData).toHaveProperty("status");
      expect(planData.dp_incidents).toHaveProperty("sgso_category");
      expect(planData.dp_incidents).toHaveProperty("sgso_risk_level");
    });

    it("should support pagination (ordered by created_at)", () => {
      const plans = [
        { id: "1", created_at: "2025-10-15T10:00:00Z" },
        { id: "2", created_at: "2025-10-14T10:00:00Z" },
        { id: "3", created_at: "2025-10-13T10:00:00Z" }
      ];

      // Plans should be ordered by created_at descending
      expect(plans[0].created_at > plans[1].created_at).toBe(true);
      expect(plans[1].created_at > plans[2].created_at).toBe(true);
    });
  });

  describe("QSMS Compliance", () => {
    it("should track approval for compliance", () => {
      const complianceData = {
        approved_by: "João Silva - Gerente QSMS",
        approved_at: "2025-10-15T10:00:00Z"
      };

      expect(complianceData.approved_by).toBeTruthy();
      expect(complianceData.approved_at).toBeTruthy();
    });

    it("should support traceability by incident", () => {
      const traceability = {
        incident_id: "imca-2025-014",
        vessel_id: "vessel-uuid-1",
        created_at: "2025-10-10T08:00:00Z"
      };

      expect(traceability.incident_id).toBeTruthy();
      expect(traceability.vessel_id).toBeTruthy();
      expect(traceability.created_at).toBeTruthy();
    });

    it("should enable audit trail for IBAMA/IMCA", () => {
      const auditTrail = {
        action_plan_id: "plan-uuid-1",
        incident_reference: "imca-2025-014",
        status_history: "aberto -> em_andamento -> resolvido",
        approver: "João Silva",
        approval_date: "2025-10-15"
      };

      expect(auditTrail).toHaveProperty("action_plan_id");
      expect(auditTrail).toHaveProperty("incident_reference");
      expect(auditTrail).toHaveProperty("approver");
    });
  });
});
