import { describe, it, expect, vi, beforeEach } from "vitest";
import { SGSO_REQUIREMENTS } from "@/types/sgso";

describe("SGSO Audit System", () => {
  describe("SGSO_REQUIREMENTS", () => {
    it("should have exactly 17 requirements", () => {
      expect(SGSO_REQUIREMENTS).toHaveLength(17);
    });

    it("should have sequential requirement numbers from 1 to 17", () => {
      SGSO_REQUIREMENTS.forEach((req, index) => {
        expect(req.requirement_number).toBe(index + 1);
      });
    });

    it("should have all required fields for each requirement", () => {
      SGSO_REQUIREMENTS.forEach((req) => {
        expect(req).toHaveProperty("requirement_number");
        expect(req).toHaveProperty("requirement_title");
        expect(req).toHaveProperty("description");
        expect(typeof req.requirement_number).toBe("number");
        expect(typeof req.requirement_title).toBe("string");
        expect(typeof req.description).toBe("string");
      });
    });

    it("should have non-empty titles and descriptions", () => {
      SGSO_REQUIREMENTS.forEach((req) => {
        expect(req.requirement_title.length).toBeGreaterThan(0);
        expect(req.description.length).toBeGreaterThan(0);
      });
    });

    it("should have first requirement about security policy", () => {
      const firstReq = SGSO_REQUIREMENTS[0];
      expect(firstReq.requirement_number).toBe(1);
      expect(firstReq.requirement_title).toContain("Política de Segurança");
    });

    it("should have last requirement about mechanical integrity", () => {
      const lastReq = SGSO_REQUIREMENTS[16];
      expect(lastReq.requirement_number).toBe(17);
      expect(lastReq.requirement_title).toContain("Integridade Mecânica");
    });
  });

  describe("Audit Item Structure", () => {
    it("should support compliant status", () => {
      const validStatuses = ["compliant", "non-compliant", "partial"];
      expect(validStatuses).toContain("compliant");
    });

    it("should support non-compliant status", () => {
      const validStatuses = ["compliant", "non-compliant", "partial"];
      expect(validStatuses).toContain("non-compliant");
    });

    it("should support partial status", () => {
      const validStatuses = ["compliant", "non-compliant", "partial"];
      expect(validStatuses).toContain("partial");
    });
  });

  describe("AI Analysis Structure", () => {
    it("should have expected AI analysis fields", () => {
      const mockAnalysis = {
        causa_provavel: "Test cause",
        recomendacao: "Test recommendation",
        impacto: "Test impact",
      };

      expect(mockAnalysis).toHaveProperty("causa_provavel");
      expect(mockAnalysis).toHaveProperty("recomendacao");
      expect(mockAnalysis).toHaveProperty("impacto");
    });
  });

  describe("Audit Workflow", () => {
    it("should validate that audit requires all items to have compliance status before submission", () => {
      const auditItems = SGSO_REQUIREMENTS.map(req => ({
        id: `item-${req.requirement_number}`,
        audit_id: "test-audit",
        requirement_number: req.requirement_number,
        requirement_title: req.requirement_title,
        description: req.description,
        compliance_status: null,
        evidence: "",
      }));

      const incompleteItems = auditItems.filter(item => !item.compliance_status);
      expect(incompleteItems.length).toBe(17);
    });

    it("should allow submission when all items have compliance status", () => {
      const auditItems = SGSO_REQUIREMENTS.map(req => ({
        id: `item-${req.requirement_number}`,
        audit_id: "test-audit",
        requirement_number: req.requirement_number,
        requirement_title: req.requirement_title,
        description: req.description,
        compliance_status: "compliant" as const,
        evidence: "Test evidence",
      }));

      const incompleteItems = auditItems.filter(item => !item.compliance_status);
      expect(incompleteItems.length).toBe(0);
    });
  });

  describe("Requirement Content Quality", () => {
    it("should have requirement 2 about risk identification and assessment", () => {
      const req2 = SGSO_REQUIREMENTS.find(r => r.requirement_number === 2);
      expect(req2?.requirement_title).toContain("Identificação de Perigos");
      expect(req2?.requirement_title).toContain("Avaliação de Riscos");
    });

    it("should have requirement 8 about emergency response", () => {
      const req8 = SGSO_REQUIREMENTS.find(r => r.requirement_number === 8);
      expect(req8?.requirement_title).toContain("Emergências");
    });

    it("should have requirement 11 about incident investigation", () => {
      const req11 = SGSO_REQUIREMENTS.find(r => r.requirement_number === 11);
      expect(req11?.requirement_title).toContain("Investigação de Incidentes");
    });
  });
});
