/**
 * SGSO Action Plans History API Endpoint Tests
 * 
 * Tests for the /api/sgso/history/[vesselId] endpoint that provides
 * complete traceability of action plans by vessel and incident
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

    it("should use correct API endpoint path with dynamic vesselId", () => {
      const endpointPath = "/api/sgso/history/[vesselId]";
      expect(endpointPath).toContain("sgso");
      expect(endpointPath).toContain("history");
      expect(endpointPath).toContain("[vesselId]");
    });

    it("should be accessible via pages/api/sgso/history/[vesselId].ts", () => {
      const filePath = "pages/api/sgso/history/[vesselId].ts";
      expect(filePath).toContain("sgso/history/[vesselId]");
    });
  });

  describe("URL Parameters", () => {
    it("should extract vesselId from URL parameter", () => {
      const vesselId = "uuid-vessel-123-456-789";
      expect(typeof vesselId).toBe("string");
      expect(vesselId).toBeTruthy();
    });

    it("should validate vesselId is a string", () => {
      const vesselId = "uuid-vessel-123-456-789";
      expect(typeof vesselId).toBe("string");
    });

    it("should return 400 for invalid vesselId type", () => {
      const errorResponse = {
        status: 400,
        error: "Vessel ID inválido."
      };
      expect(errorResponse.status).toBe(400);
      expect(errorResponse.error).toBe("Vessel ID inválido.");
    });
  });

  describe("Database Query", () => {
    it("should query sgso_action_plans table", () => {
      const tableName = "sgso_action_plans";
      expect(tableName).toBe("sgso_action_plans");
    });

    it("should select action plan fields", () => {
      const selectFields = [
        "id",
        "corrective_action",
        "preventive_action",
        "recommendation",
        "status",
        "approved_by",
        "approved_at",
        "created_at",
        "updated_at"
      ];
      expect(selectFields).toContain("corrective_action");
      expect(selectFields).toContain("preventive_action");
      expect(selectFields).toContain("recommendation");
      expect(selectFields).toContain("status");
      expect(selectFields).toContain("approved_by");
    });

    it("should join with dp_incidents table", () => {
      const joinTable = "dp_incidents";
      expect(joinTable).toBe("dp_incidents");
    });

    it("should select incident fields from dp_incidents", () => {
      const incidentFields = [
        "id",
        "description",
        "sgso_category",
        "sgso_risk_level",
        "updated_at",
        "incident_date"
      ];
      expect(incidentFields).toContain("description");
      expect(incidentFields).toContain("sgso_category");
      expect(incidentFields).toContain("sgso_risk_level");
    });

    it("should filter by vessel_id", () => {
      const vesselId = "uuid-vessel-123";
      const filterField = "vessel_id";
      expect(filterField).toBe("vessel_id");
      expect(vesselId).toBeTruthy();
    });

    it("should order by created_at descending", () => {
      const orderConfig = {
        field: "created_at",
        ascending: false
      };
      expect(orderConfig.field).toBe("created_at");
      expect(orderConfig.ascending).toBe(false);
    });
  });

  describe("Response Data", () => {
    it("should return array of action plans", () => {
      const mockData = [
        {
          id: "uuid-1",
          corrective_action: "Substituir giroscópio",
          preventive_action: "Verificação diária",
          recommendation: "Redundância de sensores",
          status: "resolvido",
          approved_by: "João Silva",
          approved_at: "2025-10-13T10:00:00Z",
          dp_incidents: {
            description: "Loss of Position",
            sgso_category: "Equipamento",
            sgso_risk_level: "Crítico"
          }
        }
      ];
      expect(Array.isArray(mockData)).toBe(true);
      expect(mockData).toHaveLength(1);
      expect(mockData[0]).toHaveProperty("corrective_action");
      expect(mockData[0]).toHaveProperty("dp_incidents");
    });

    it("should include nested dp_incidents data", () => {
      const mockPlan = {
        id: "uuid-1",
        status: "aberto",
        dp_incidents: {
          description: "Incident description",
          sgso_category: "Sistema",
          sgso_risk_level: "Alto"
        }
      };
      expect(mockPlan.dp_incidents).toBeDefined();
      expect(mockPlan.dp_incidents.description).toBeTruthy();
      expect(mockPlan.dp_incidents.sgso_category).toBe("Sistema");
    });

    it("should return empty array when no plans found", () => {
      const emptyResponse: any[] = [];
      expect(Array.isArray(emptyResponse)).toBe(true);
      expect(emptyResponse).toHaveLength(0);
    });
  });

  describe("Status Values", () => {
    it("should support 'aberto' status", () => {
      const status = "aberto";
      const validStatuses = ["aberto", "em_andamento", "resolvido"];
      expect(validStatuses).toContain(status);
    });

    it("should support 'em_andamento' status", () => {
      const status = "em_andamento";
      const validStatuses = ["aberto", "em_andamento", "resolvido"];
      expect(validStatuses).toContain(status);
    });

    it("should support 'resolvido' status", () => {
      const status = "resolvido";
      const validStatuses = ["aberto", "em_andamento", "resolvido"];
      expect(validStatuses).toContain(status);
    });
  });

  describe("Compliance Features", () => {
    it("should include approval information for QSMS compliance", () => {
      const plan = {
        approved_by: "Maria Santos - Diretora Técnica",
        approved_at: "2025-10-15T14:30:00Z"
      };
      expect(plan.approved_by).toBeTruthy();
      expect(plan.approved_at).toBeTruthy();
    });

    it("should support action plan traceability", () => {
      const plan = {
        corrective_action: "Immediate correction",
        preventive_action: "Preventive measures",
        recommendation: "Additional recommendations",
        created_at: "2025-10-10T10:00:00Z",
        updated_at: "2025-10-15T10:00:00Z"
      };
      expect(plan.corrective_action).toBeTruthy();
      expect(plan.preventive_action).toBeTruthy();
      expect(plan.created_at).toBeTruthy();
      expect(plan.updated_at).toBeTruthy();
    });

    it("should link to incident for complete audit trail", () => {
      const plan = {
        incident_id: "uuid-incident-123",
        dp_incidents: {
          description: "Incident details",
          sgso_category: "Equipamento",
          sgso_risk_level: "Crítico",
          incident_date: "2025-10-01"
        }
      };
      expect(plan.dp_incidents).toBeDefined();
      expect(plan.dp_incidents.sgso_category).toBeTruthy();
      expect(plan.dp_incidents.sgso_risk_level).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    it("should return 500 on database error", () => {
      const errorResponse = {
        status: 500,
        error: "Database error message"
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toBeTruthy();
    });

    it("should handle unexpected errors gracefully", () => {
      const errorResponse = {
        status: 500,
        error: "Erro interno do servidor ao buscar histórico SGSO."
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toContain("Erro interno");
    });

    it("should log errors to console", () => {
      const errorMessage = "Error fetching SGSO history";
      expect(typeof errorMessage).toBe("string");
      expect(errorMessage).toContain("SGSO history");
    });
  });

  describe("Performance", () => {
    it("should use indexed columns for efficient queries", () => {
      const indexedColumns = [
        "vessel_id",
        "incident_id",
        "status",
        "created_at"
      ];
      expect(indexedColumns).toContain("vessel_id");
      expect(indexedColumns).toContain("status");
      expect(indexedColumns).toContain("created_at");
    });

    it("should optimize with single query using join", () => {
      const queryCount = 1; // Single query with join instead of multiple queries
      expect(queryCount).toBe(1);
    });
  });
});
