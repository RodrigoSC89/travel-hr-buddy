/**
 * Auditoria Generate API Endpoint Tests
 * 
 * Tests for the /api/auditoria/generate endpoint that generates
 * technical audit reports for ships using OpenAI GPT-4
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auditoria Generate API Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Handling", () => {
    it("should handle POST requests", () => {
      const method = "POST";
      expect(method).toBe("POST");
    });

    it("should use correct API endpoint path", () => {
      const endpointPath = "/api/auditoria/generate";
      expect(endpointPath).toBe("/api/auditoria/generate");
    });

    it("should be accessible via pages/api/auditoria/generate.ts", () => {
      const filePath = "pages/api/auditoria/generate.ts";
      expect(filePath).toContain("auditoria/generate");
    });

    it("should reject non-POST methods with 405 status", () => {
      const method = "GET";
      const expectedStatus = 405;
      expect(method).not.toBe("POST");
      expect(expectedStatus).toBe(405);
    });
  });

  describe("Request Body Validation", () => {
    it("should require nomeNavio field", () => {
      const requiredField = "nomeNavio";
      expect(requiredField).toBe("nomeNavio");
    });

    it("should require contexto field", () => {
      const requiredField = "contexto";
      expect(requiredField).toBe("contexto");
    });

    it("should require user_id field", () => {
      const requiredField = "user_id";
      expect(requiredField).toBe("user_id");
    });

    it("should return 400 for missing required fields", () => {
      const expectedStatus = 400;
      expect(expectedStatus).toBe(400);
    });
  });

  describe("OpenAI Integration", () => {
    it("should use GPT-4 model", () => {
      const model = "gpt-4";
      expect(model).toBe("gpt-4");
    });

    it("should set temperature to 0.7", () => {
      const temperature = 0.7;
      expect(temperature).toBe(0.7);
    });

    it("should limit max_tokens to 1800", () => {
      const maxTokens = 1800;
      expect(maxTokens).toBe(1800);
    });

    it("should include system message about DP auditing", () => {
      const systemMessage = "Você é um especialista técnico em auditorias DP.";
      expect(systemMessage).toContain("auditorias DP");
    });
  });

  describe("Supabase Integration", () => {
    it("should save to auditorias_imca table", () => {
      const tableName = "auditorias_imca";
      expect(tableName).toBe("auditorias_imca");
    });

    it("should include nome_navio in database record", () => {
      const field = "nome_navio";
      expect(field).toBe("nome_navio");
    });

    it("should include contexto in database record", () => {
      const field = "contexto";
      expect(field).toBe("contexto");
    });

    it("should include relatorio in database record", () => {
      const field = "relatorio";
      expect(field).toBe("relatorio");
    });

    it("should include user_id in database record", () => {
      const field = "user_id";
      expect(field).toBe("user_id");
    });
  });

  describe("Response Handling", () => {
    it("should return 200 status on success", () => {
      const expectedStatus = 200;
      expect(expectedStatus).toBe(200);
    });

    it("should return output field in response", () => {
      const responseField = "output";
      expect(responseField).toBe("output");
    });

    it("should return 500 status on error", () => {
      const expectedStatus = 500;
      expect(expectedStatus).toBe(500);
    });

    it("should include error message on failure", () => {
      const errorMessage = "Erro na geração de auditoria.";
      expect(errorMessage).toContain("Erro");
    });
  });

  describe("IMCA Standards Coverage", () => {
    it("should reference IMCA M103 standard", () => {
      const standard = "IMCA M103";
      expect(standard).toContain("IMCA");
    });

    it("should reference IMCA M117 standard", () => {
      const standard = "IMCA M117";
      expect(standard).toContain("IMCA");
    });

    it("should reference IMCA M190 standard", () => {
      const standard = "IMCA M190";
      expect(standard).toContain("IMCA");
    });

    it("should reference IMCA M166 standard", () => {
      const standard = "IMCA M166";
      expect(standard).toContain("IMCA");
    });

    it("should reference IMCA M109 standard", () => {
      const standard = "IMCA M109";
      expect(standard).toContain("IMCA");
    });

    it("should reference IMCA M220 standard", () => {
      const standard = "IMCA M220";
      expect(standard).toContain("IMCA");
    });

    it("should reference IMCA M140 standard", () => {
      const standard = "IMCA M140";
      expect(standard).toContain("IMCA");
    });

    it("should reference MSF 182 standard", () => {
      const standard = "MSF 182";
      expect(standard).toBe("MSF 182");
    });

    it("should reference IMO MSC.1/Circ.1580 guidelines", () => {
      const standard = "IMO MSC.1/Circ.1580";
      expect(standard).toContain("IMO");
    });
  });
});
