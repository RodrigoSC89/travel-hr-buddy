import { describe, it, expect } from "vitest";
import { IMCA_STANDARDS, AUDIT_MODULES } from "@/types/imca-audit";
import { exportAuditToMarkdown } from "@/services/imca-audit-service";
import type { IMCAAuditReport } from "@/types/imca-audit";

describe("IMCA Audit Types and Standards", () => {
  describe("IMCA Standards Catalog", () => {
    it("should contain all 10 international standards", () => {
      expect(IMCA_STANDARDS).toHaveLength(10);
    });

    it("should include key IMCA standards", () => {
      const standardCodes = IMCA_STANDARDS.map(s => s.code);
      
      expect(standardCodes).toContain("IMCA M103");
      expect(standardCodes).toContain("IMCA M117");
      expect(standardCodes).toContain("IMCA M190");
      expect(standardCodes).toContain("IMCA M166");
      expect(standardCodes).toContain("IMCA M109");
      expect(standardCodes).toContain("IMCA M220");
      expect(standardCodes).toContain("IMCA M140");
    });

    it("should include IMO and MTS standards", () => {
      const standardCodes = IMCA_STANDARDS.map(s => s.code);
      
      expect(standardCodes).toContain("MSF 182");
      expect(standardCodes).toContain("MTS DP Operations");
      expect(standardCodes).toContain("IMO MSC.1/Circ.1580");
    });

    it("should have proper standard structure", () => {
      IMCA_STANDARDS.forEach(standard => {
        expect(standard).toHaveProperty("code");
        expect(standard).toHaveProperty("name");
        expect(standard).toHaveProperty("description");
        expect(standard).toHaveProperty("category");
        expect(standard.code).toBeTruthy();
        expect(standard.name).toBeTruthy();
        expect(standard.description).toBeTruthy();
      });
    });
  });

  describe("Audit Modules", () => {
    it("should contain all 12 audit modules", () => {
      expect(AUDIT_MODULES).toHaveLength(12);
    });

    it("should include key DP system modules", () => {
      expect(AUDIT_MODULES).toContain("Sistema de Controle DP");
      expect(AUDIT_MODULES).toContain("Sistema de Propulsão");
      expect(AUDIT_MODULES).toContain("Sensores de Posicionamento");
      expect(AUDIT_MODULES).toContain("Rede e Comunicações");
      expect(AUDIT_MODULES).toContain("Pessoal DP");
      expect(AUDIT_MODULES).toContain("Logs e Históricos");
      expect(AUDIT_MODULES).toContain("FMEA");
      expect(AUDIT_MODULES).toContain("Testes Anuais");
      expect(AUDIT_MODULES).toContain("Documentação");
      expect(AUDIT_MODULES).toContain("Power Management System");
      expect(AUDIT_MODULES).toContain("Capability Plots");
      expect(AUDIT_MODULES).toContain("Planejamento Operacional");
    });
  });
});

describe("IMCA Audit Service", () => {
  describe("exportAuditToMarkdown", () => {
    const mockAudit: IMCAAuditReport = {
      basicData: {
        vesselName: "Test Vessel",
        operationType: "navio",
        location: "Test Location",
        dpClass: "DP2",
        auditObjective: "Test audit",
        auditDate: "2025-10-16"
      },
      context: "Test audit context",
      modulesAudited: ["Sistema de Controle DP", "Sistema de Propulsão"],
      standardsApplied: ["IMCA M103", "IMCA M117"],
      nonConformities: [
        {
          module: "Sistema de Controle DP",
          standard: "IMCA M103",
          description: "Test non-conformity",
          riskLevel: "Alto",
          probableCauses: ["Cause 1", "Cause 2"],
          correctiveAction: "Test action",
          verificationRequirements: "Test verification"
        }
      ],
      actionPlan: [
        {
          priority: "Crítico",
          action: "Test action",
          recommendedDeadline: "7 dias",
          responsibleParty: "Test party",
          verificationMethod: "Test method"
        }
      ],
      summary: "Test summary",
      recommendations: "Test recommendations",
      status: "draft",
      generatedAt: "2025-10-16T00:00:00Z"
    };

    it("should export audit to markdown format", () => {
      const markdown = exportAuditToMarkdown(mockAudit);
      
      expect(markdown).toBeTruthy();
      expect(typeof markdown).toBe("string");
    });

    it("should include vessel name in markdown", () => {
      const markdown = exportAuditToMarkdown(mockAudit);
      
      expect(markdown).toContain("Test Vessel");
    });

    it("should include basic information section", () => {
      const markdown = exportAuditToMarkdown(mockAudit);
      
      expect(markdown).toContain("## Informações Básicas");
      expect(markdown).toContain("DP2");
      expect(markdown).toContain("Test Location");
    });

    it("should include non-conformities section", () => {
      const markdown = exportAuditToMarkdown(mockAudit);
      
      expect(markdown).toContain("## Não-Conformidades Identificadas");
      expect(markdown).toContain("Sistema de Controle DP");
      expect(markdown).toContain("Test non-conformity");
      expect(markdown).toContain("Alto");
    });

    it("should include action plan section", () => {
      const markdown = exportAuditToMarkdown(mockAudit);
      
      expect(markdown).toContain("## Plano de Ação Priorizado");
      expect(markdown).toContain("Crítico");
      expect(markdown).toContain("7 dias");
    });

    it("should include standards applied", () => {
      const markdown = exportAuditToMarkdown(mockAudit);
      
      expect(markdown).toContain("## Normas Aplicadas");
      expect(markdown).toContain("IMCA M103");
      expect(markdown).toContain("IMCA M117");
    });

    it("should include summary and recommendations", () => {
      const markdown = exportAuditToMarkdown(mockAudit);
      
      expect(markdown).toContain("## Resumo");
      expect(markdown).toContain("Test summary");
      expect(markdown).toContain("## Recomendações");
      expect(markdown).toContain("Test recommendations");
    });

    it("should format markdown with proper headings", () => {
      const markdown = exportAuditToMarkdown(mockAudit);
      
      // Check for markdown h1
      expect(markdown).toMatch(/^# Auditoria Técnica IMCA/);
      
      // Check for multiple h2 sections
      const h2Count = (markdown.match(/^## /gm) || []).length;
      expect(h2Count).toBeGreaterThan(5);
    });
  });
});
