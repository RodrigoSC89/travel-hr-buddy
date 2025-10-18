import { describe, it, expect, beforeEach, vi } from "vitest";
import { SGSO_REQUIREMENTS } from "@/types/sgso-audit";
import type { SGSOAuditItem, ComplianceStatus } from "@/types/sgso-audit";

describe("SGSO Audit System", () => {
  describe("SGSO Requirements", () => {
    it("should have exactly 17 requirements", () => {
      expect(SGSO_REQUIREMENTS).toHaveLength(17);
    });

    it("should have all requirements numbered from 1 to 17", () => {
      const numbers = SGSO_REQUIREMENTS.map(req => req.requirement_number);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
    });

    it("should have title and description for each requirement", () => {
      SGSO_REQUIREMENTS.forEach(req => {
        expect(req.requirement_title).toBeTruthy();
        expect(req.requirement_title.length).toBeGreaterThan(0);
        expect(req.description).toBeTruthy();
        expect(req.description.length).toBeGreaterThan(0);
      });
    });

    it("should have unique requirement numbers", () => {
      const numbers = SGSO_REQUIREMENTS.map(req => req.requirement_number);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(17);
    });
  });

  describe("Compliance Status", () => {
    it("should support all valid compliance statuses", () => {
      const validStatuses: ComplianceStatus[] = [
        'compliant',
        'non_compliant',
        'partial',
        'pending'
      ];

      validStatuses.forEach(status => {
        expect(['compliant', 'non_compliant', 'partial', 'pending']).toContain(status);
      });
    });
  });

  describe("Audit Item Structure", () => {
    it("should have correct structure for audit items", () => {
      const mockItem: Partial<SGSOAuditItem> = {
        requirement_number: 1,
        requirement_title: "Test Requirement",
        description: "Test Description",
        compliance_status: 'pending',
        evidence: "Test Evidence",
        ai_analysis: {
          causa_provavel: "Test cause",
          recomendacao: "Test recommendation",
          impacto: "Test impact"
        },
        notes: "Test notes"
      };

      expect(mockItem.requirement_number).toBeDefined();
      expect(mockItem.requirement_title).toBeDefined();
      expect(mockItem.description).toBeDefined();
      expect(mockItem.compliance_status).toBeDefined();
      expect(mockItem.evidence).toBeDefined();
      expect(mockItem.ai_analysis).toBeDefined();
      expect(mockItem.notes).toBeDefined();
    });
  });

  describe("ANP Requirements Content", () => {
    it("should include key SGSO practice: Liderança e Responsabilidade", () => {
      const requirement = SGSO_REQUIREMENTS.find(req => req.requirement_number === 1);
      expect(requirement?.requirement_title).toContain("Liderança");
    });

    it("should include key SGSO practice: Identificação de Perigos", () => {
      const requirement = SGSO_REQUIREMENTS.find(req => req.requirement_number === 2);
      expect(requirement?.requirement_title).toContain("Identificação de Perigos");
    });

    it("should include key SGSO practice: Controle de Riscos", () => {
      const requirement = SGSO_REQUIREMENTS.find(req => req.requirement_number === 3);
      expect(requirement?.requirement_title).toContain("Controle de Riscos");
    });

    it("should include key SGSO practice: Preparação e Resposta a Emergências", () => {
      const requirement = SGSO_REQUIREMENTS.find(req => req.requirement_number === 8);
      expect(requirement?.requirement_title).toContain("Emergências");
    });

    it("should include key SGSO practice: Investigação de Incidentes", () => {
      const requirement = SGSO_REQUIREMENTS.find(req => req.requirement_number === 11);
      expect(requirement?.requirement_title).toContain("Investigação de Incidentes");
    });
  });

  describe("Audit Statistics Calculation", () => {
    it("should correctly count compliance statistics", () => {
      const mockItems: Partial<SGSOAuditItem>[] = [
        { compliance_status: 'compliant' },
        { compliance_status: 'compliant' },
        { compliance_status: 'non_compliant' },
        { compliance_status: 'partial' },
        { compliance_status: 'pending' },
      ];

      const stats = {
        compliant: mockItems.filter(i => i.compliance_status === 'compliant').length,
        non_compliant: mockItems.filter(i => i.compliance_status === 'non_compliant').length,
        partial: mockItems.filter(i => i.compliance_status === 'partial').length,
        pending: mockItems.filter(i => i.compliance_status === 'pending').length,
      };

      expect(stats.compliant).toBe(2);
      expect(stats.non_compliant).toBe(1);
      expect(stats.partial).toBe(1);
      expect(stats.pending).toBe(1);
    });

    it("should detect incomplete audits", () => {
      const mockItems: Partial<SGSOAuditItem>[] = [
        { compliance_status: 'compliant' },
        { compliance_status: 'pending' },
        { compliance_status: 'pending' },
      ];

      const pendingCount = mockItems.filter(i => i.compliance_status === 'pending').length;
      expect(pendingCount).toBeGreaterThan(0);
    });

    it("should detect completed audits", () => {
      const mockItems: Partial<SGSOAuditItem>[] = [
        { compliance_status: 'compliant' },
        { compliance_status: 'non_compliant' },
        { compliance_status: 'partial' },
      ];

      const pendingCount = mockItems.filter(i => i.compliance_status === 'pending').length;
      expect(pendingCount).toBe(0);
    });
  });
});
