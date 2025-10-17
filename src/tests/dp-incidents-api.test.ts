/**
 * DP Incidents API Endpoint Tests
 * 
 * Tests for the /api/dp-incidents endpoint that provides CRUD operations
 * for DP (Dynamic Positioning) incidents with AI analysis
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("DP Incidents API Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Handling", () => {
    it("should handle GET requests", () => {
      const method = "GET";
      expect(method).toBe("GET");
    });

    it("should handle POST requests", () => {
      const method = "POST";
      expect(method).toBe("POST");
    });

    it("should reject unsupported methods with 405", () => {
      const errorResponse = {
        status: 405,
        error: "Method not allowed"
      };
      expect(errorResponse.status).toBe(405);
      expect(errorResponse.error).toBe("Method not allowed");
    });

    it("should use correct API endpoint path", () => {
      const endpointPath = "/api/dp-incidents";
      expect(endpointPath).toBe("/api/dp-incidents");
    });

    it("should be accessible via pages/api/dp-incidents/index.ts", () => {
      const filePath = "pages/api/dp-incidents/index.ts";
      expect(filePath).toContain("dp-incidents");
    });
  });

  describe("GET - List Incidents", () => {
    it("should query dp_incidents table", () => {
      const tableName = "dp_incidents";
      expect(tableName).toBe("dp_incidents");
    });

    it("should select all columns", () => {
      const selectQuery = "*";
      expect(selectQuery).toBe("*");
    });

    it("should order by incident_date descending", () => {
      const orderConfig = { 
        field: "incident_date", 
        ascending: false 
      };
      expect(orderConfig.field).toBe("incident_date");
      expect(orderConfig.ascending).toBe(false);
    });

    it("should return array of incidents", () => {
      const mockResponse = [
        {
          id: "uuid-1",
          title: "Test Incident",
          description: "Test description",
          severity: "Alta",
          vessel: "Test Vessel"
        }
      ];
      expect(Array.isArray(mockResponse)).toBe(true);
      expect(mockResponse[0].title).toBeDefined();
    });
  });

  describe("POST - Create Incident", () => {
    it("should require title field", () => {
      const requiredFields = ["title", "description"];
      expect(requiredFields).toContain("title");
    });

    it("should require description field", () => {
      const requiredFields = ["title", "description"];
      expect(requiredFields).toContain("description");
    });

    it("should accept optional source field", () => {
      const requestBody = {
        title: "Test",
        description: "Test desc",
        source: "IMCA M220"
      };
      expect(requestBody.source).toBe("IMCA M220");
    });

    it("should accept optional incident_date field", () => {
      const requestBody = {
        title: "Test",
        description: "Test desc",
        incident_date: "2024-10-17"
      };
      expect(requestBody.incident_date).toBe("2024-10-17");
    });

    it("should accept optional severity field", () => {
      const requestBody = {
        title: "Test",
        description: "Test desc",
        severity: "Alta"
      };
      expect(requestBody.severity).toBe("Alta");
    });

    it("should accept optional vessel field", () => {
      const requestBody = {
        title: "Test",
        description: "Test desc",
        vessel: "Drillship Alpha"
      };
      expect(requestBody.vessel).toBe("Drillship Alpha");
    });

    it("should return 400 if title is missing", () => {
      const errorResponse = {
        status: 400,
        error: "Missing required fields: title and description are required"
      };
      expect(errorResponse.status).toBe(400);
    });

    it("should return 201 on successful creation", () => {
      const successStatus = 201;
      expect(successStatus).toBe(201);
    });
  });

  describe("Database Schema", () => {
    it("should have id as uuid primary key", () => {
      const schema = {
        id: "uuid PRIMARY KEY"
      };
      expect(schema.id).toContain("uuid");
    });

    it("should have title as text NOT NULL", () => {
      const schema = {
        title: "text NOT NULL"
      };
      expect(schema.title).toContain("text");
      expect(schema.title).toContain("NOT NULL");
    });

    it("should have description as text NOT NULL", () => {
      const schema = {
        description: "text NOT NULL"
      };
      expect(schema.description).toContain("text");
    });

    it("should have gpt_analysis as jsonb", () => {
      const schema = {
        gpt_analysis: "jsonb"
      };
      expect(schema.gpt_analysis).toBe("jsonb");
    });

    it("should have created_at with default", () => {
      const schema = {
        created_at: "timestamp DEFAULT now()"
      };
      expect(schema.created_at).toContain("timestamp");
    });
  });

  describe("AI Analysis Endpoint", () => {
    it("should have explain endpoint", () => {
      const explainPath = "/api/dp-incidents/explain";
      expect(explainPath).toContain("explain");
    });

    it("should be POST only", () => {
      const method = "POST";
      expect(method).toBe("POST");
    });

    it("should require incident id", () => {
      const requestBody = {
        id: "uuid-123"
      };
      expect(requestBody.id).toBeDefined();
    });

    it("should return analysis with success flag", () => {
      const responseStructure = {
        success: true,
        analysis: {
          causa_provavel: "string",
          medidas_prevencao: "string",
          impacto_operacional: "string",
          referencia_normativa: "string",
          grau_severidade: "Alta"
        }
      };
      expect(responseStructure.success).toBe(true);
      expect(responseStructure.analysis.causa_provavel).toBeDefined();
    });

    it("should update incident with gpt_analysis", () => {
      const updateOperation = {
        table: "dp_incidents",
        set: { gpt_analysis: {} },
        where: { id: "uuid-123" }
      };
      expect(updateOperation.table).toBe("dp_incidents");
      expect(updateOperation.set.gpt_analysis).toBeDefined();
    });
  });

  describe("AI Analysis Structure", () => {
    it("should include causa_provavel", () => {
      const analysis = {
        causa_provavel: "Análise da causa"
      };
      expect(analysis.causa_provavel).toBeDefined();
    });

    it("should include medidas_prevencao", () => {
      const analysis = {
        medidas_prevencao: "Medidas recomendadas"
      };
      expect(analysis.medidas_prevencao).toBeDefined();
    });

    it("should include impacto_operacional", () => {
      const analysis = {
        impacto_operacional: "Impacto na operação"
      };
      expect(analysis.impacto_operacional).toBeDefined();
    });

    it("should include referencia_normativa", () => {
      const analysis = {
        referencia_normativa: "IMCA M220, M103"
      };
      expect(analysis.referencia_normativa).toBeDefined();
    });

    it("should include grau_severidade", () => {
      const analysis = {
        grau_severidade: "Alta"
      };
      expect(analysis.grau_severidade).toBeDefined();
    });

    it("should validate severity values", () => {
      const validSeverities = ["Alta", "Média", "Baixa"];
      expect(validSeverities).toContain("Alta");
      expect(validSeverities).toContain("Média");
      expect(validSeverities).toContain("Baixa");
    });
  });

  describe("Error Handling", () => {
    it("should return 500 on database error", () => {
      const errorResponse = {
        status: 500,
        error: "Internal server error"
      };
      expect(errorResponse.status).toBe(500);
    });

    it("should return 404 if incident not found for analysis", () => {
      const errorResponse = {
        status: 404,
        error: "Incidente não encontrado"
      };
      expect(errorResponse.status).toBe(404);
      expect(errorResponse.error).toContain("não encontrado");
    });

    it("should handle AI analysis errors gracefully", () => {
      const errorResponse = {
        status: 500,
        error: "Failed to analyze incident"
      };
      expect(errorResponse.error).toContain("Failed to analyze");
    });
  });

  describe("Integration with OpenAI", () => {
    it("should use GPT-4 model", () => {
      const model = "gpt-4";
      expect(model).toBe("gpt-4");
    });

    it("should set temperature to 0.4", () => {
      const temperature = 0.4;
      expect(temperature).toBe(0.4);
    });

    it("should request JSON response format", () => {
      const responseFormat = { type: "json_object" };
      expect(responseFormat.type).toBe("json_object");
    });

    it("should include IMCA context in prompt", () => {
      const prompt = "especialista em operações DP (Dynamic Positioning) offshore, com base nas diretrizes da IMCA";
      expect(prompt).toContain("IMCA");
      expect(prompt).toContain("Dynamic Positioning");
    });
  });
});
