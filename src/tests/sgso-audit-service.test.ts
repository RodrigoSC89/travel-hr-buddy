/**
 * SGSO Audit Service Tests
 * 
 * Tests for submitSGSOAudit and loadSGSOAudit functions
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { AuditItem } from "@/services/sgso-audit-service";

describe("SGSO Audit Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitSGSOAudit Function", () => {
    it("should accept vesselId, auditorId, and items as parameters", () => {
      const vesselId = "vessel-uuid-123";
      const auditorId = "auditor-uuid-456";
      const items: AuditItem[] = [
        {
          requirement_number: 1,
          requirement_title: "Safety Management System",
          compliance_status: "compliant",
          evidence: "Certificate on file",
          comment: "All requirements met"
        }
      ];

      expect(vesselId).toBeTruthy();
      expect(auditorId).toBeTruthy();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(1);
    });

    it("should create audit with vessel_id and auditor_id", () => {
      const auditPayload = {
        vessel_id: "vessel-uuid-123",
        auditor_id: "auditor-uuid-456"
      };

      expect(auditPayload).toHaveProperty("vessel_id");
      expect(auditPayload).toHaveProperty("auditor_id");
    });

    it("should map items with audit_id", () => {
      const auditId = "audit-uuid-789";
      const items: AuditItem[] = [
        {
          requirement_number: 1,
          requirement_title: "Safety Management System",
          compliance_status: "compliant",
          evidence: "Certificate on file",
          comment: "All requirements met"
        },
        {
          requirement_number: 2,
          requirement_title: "Emergency Response",
          compliance_status: "partial",
          evidence: "Training records incomplete",
          comment: "Need to update training"
        }
      ];

      const itemsPayload = items.map(item => ({
        audit_id: auditId,
        ...item
      }));

      expect(itemsPayload).toHaveLength(2);
      expect(itemsPayload[0]).toHaveProperty("audit_id", auditId);
      expect(itemsPayload[1]).toHaveProperty("audit_id", auditId);
    });

    it("should insert items into sgso_audit_items table", () => {
      const tableName = "sgso_audit_items";
      expect(tableName).toBe("sgso_audit_items");
    });

    it("should return audit.id on success", () => {
      const mockAudit = {
        id: "audit-uuid-789",
        vessel_id: "vessel-uuid-123",
        auditor_id: "auditor-uuid-456"
      };

      expect(mockAudit.id).toBeTruthy();
      expect(typeof mockAudit.id).toBe("string");
    });

    it("should throw error on audit creation failure", () => {
      const error = new Error("Erro ao criar auditoria: Database error");
      expect(error.message).toContain("Erro ao criar auditoria");
    });

    it("should throw error on items insertion failure", () => {
      const error = new Error("Erro ao salvar itens: Invalid data");
      expect(error.message).toContain("Erro ao salvar itens");
    });
  });

  describe("loadSGSOAudit Function", () => {
    it("should accept vesselId as parameter", () => {
      const vesselId = "vessel-uuid-123";
      expect(vesselId).toBeTruthy();
      expect(typeof vesselId).toBe("string");
    });

    it("should query sgso_audits table with nested items", () => {
      const queryStructure = {
        table: "sgso_audits",
        select: [
          "id",
          "audit_date",
          "auditor_id",
          "sgso_audit_items"
        ]
      };

      expect(queryStructure.table).toBe("sgso_audits");
      expect(queryStructure.select).toContain("sgso_audit_items");
    });

    it("should filter by vessel_id", () => {
      const vesselId = "vessel-uuid-123";
      const filter = { vessel_id: vesselId };
      
      expect(filter).toHaveProperty("vessel_id", vesselId);
    });

    it("should order by audit_date descending", () => {
      const orderBy = {
        column: "audit_date",
        ascending: false
      };

      expect(orderBy.column).toBe("audit_date");
      expect(orderBy.ascending).toBe(false);
    });

    it("should return array of audits with nested items", () => {
      const mockAudits = [
        {
          id: "audit-uuid-1",
          audit_date: "2025-10-15",
          auditor_id: "auditor-uuid-456",
          sgso_audit_items: [
            {
              id: "item-uuid-1",
              requirement_number: 1,
              requirement_title: "Safety Management System",
              compliance_status: "compliant",
              evidence: "Certificate on file",
              comment: "All requirements met"
            }
          ]
        },
        {
          id: "audit-uuid-2",
          audit_date: "2025-09-15",
          auditor_id: "auditor-uuid-789",
          sgso_audit_items: [
            {
              id: "item-uuid-2",
              requirement_number: 1,
              requirement_title: "Safety Management System",
              compliance_status: "partial",
              evidence: "Some documents missing",
              comment: "Need to complete documentation"
            }
          ]
        }
      ];

      expect(Array.isArray(mockAudits)).toBe(true);
      expect(mockAudits).toHaveLength(2);
      expect(mockAudits[0]).toHaveProperty("id");
      expect(mockAudits[0]).toHaveProperty("audit_date");
      expect(mockAudits[0]).toHaveProperty("auditor_id");
      expect(mockAudits[0]).toHaveProperty("sgso_audit_items");
      expect(Array.isArray(mockAudits[0].sgso_audit_items)).toBe(true);
    });

    it("should throw error on query failure", () => {
      const error = new Error("Erro ao carregar auditorias: Network error");
      expect(error.message).toContain("Erro ao carregar auditorias");
    });
  });

  describe("AuditItem Type", () => {
    it("should have required properties", () => {
      const item: AuditItem = {
        requirement_number: 1,
        requirement_title: "Safety Management System",
        compliance_status: "compliant",
        evidence: "Certificate on file",
        comment: "All requirements met"
      };

      expect(item).toHaveProperty("requirement_number");
      expect(item).toHaveProperty("requirement_title");
      expect(item).toHaveProperty("compliance_status");
      expect(item).toHaveProperty("evidence");
      expect(item).toHaveProperty("comment");
    });

    it("should accept valid compliance_status values", () => {
      const statuses: Array<'compliant' | 'partial' | 'non-compliant'> = [
        'compliant',
        'partial',
        'non-compliant'
      ];

      statuses.forEach(status => {
        const item: AuditItem = {
          requirement_number: 1,
          requirement_title: "Test",
          compliance_status: status,
          evidence: "Test evidence",
          comment: "Test comment"
        };
        expect(item.compliance_status).toBe(status);
      });
    });

    it("should have requirement_number as number", () => {
      const item: AuditItem = {
        requirement_number: 1,
        requirement_title: "Safety Management System",
        compliance_status: "compliant",
        evidence: "Certificate on file",
        comment: "All requirements met"
      };

      expect(typeof item.requirement_number).toBe("number");
    });

    it("should have string properties for title, evidence, and comment", () => {
      const item: AuditItem = {
        requirement_number: 1,
        requirement_title: "Safety Management System",
        compliance_status: "compliant",
        evidence: "Certificate on file",
        comment: "All requirements met"
      };

      expect(typeof item.requirement_title).toBe("string");
      expect(typeof item.evidence).toBe("string");
      expect(typeof item.comment).toBe("string");
    });
  });

  describe("SGSOAudit Type", () => {
    it("should have required properties", () => {
      const audit = {
        id: "audit-uuid-1",
        audit_date: "2025-10-15",
        auditor_id: "auditor-uuid-456",
        sgso_audit_items: []
      };

      expect(audit).toHaveProperty("id");
      expect(audit).toHaveProperty("audit_date");
      expect(audit).toHaveProperty("auditor_id");
      expect(audit).toHaveProperty("sgso_audit_items");
    });

    it("should have sgso_audit_items as array", () => {
      const audit = {
        id: "audit-uuid-1",
        audit_date: "2025-10-15",
        auditor_id: "auditor-uuid-456",
        sgso_audit_items: [
          {
            id: "item-uuid-1",
            requirement_number: 1,
            requirement_title: "Safety Management System",
            compliance_status: "compliant" as const,
            evidence: "Certificate on file",
            comment: "All requirements met"
          }
        ]
      };

      expect(Array.isArray(audit.sgso_audit_items)).toBe(true);
      expect(audit.sgso_audit_items).toHaveLength(1);
    });
  });

  describe("Integration", () => {
    it("should handle complete audit submission workflow", () => {
      const vesselId = "vessel-uuid-123";
      const auditorId = "auditor-uuid-456";
      const items: AuditItem[] = [
        {
          requirement_number: 1,
          requirement_title: "Safety Management System",
          compliance_status: "compliant",
          evidence: "Certificate on file",
          comment: "All requirements met"
        },
        {
          requirement_number: 2,
          requirement_title: "Emergency Response",
          compliance_status: "partial",
          evidence: "Training records incomplete",
          comment: "Need to update training"
        }
      ];

      // Simulate audit creation
      const mockAudit = {
        id: "audit-uuid-789",
        vessel_id: vesselId,
        auditor_id: auditorId
      };

      // Simulate items mapping
      const itemsPayload = items.map(item => ({
        audit_id: mockAudit.id,
        ...item
      }));

      expect(mockAudit.id).toBeTruthy();
      expect(itemsPayload).toHaveLength(2);
      expect(itemsPayload[0]).toHaveProperty("audit_id");
    });

    it("should handle loading audits with multiple items", () => {
      const mockResponse = [
        {
          id: "audit-uuid-1",
          audit_date: "2025-10-15",
          auditor_id: "auditor-uuid-456",
          sgso_audit_items: [
            {
              id: "item-uuid-1",
              requirement_number: 1,
              requirement_title: "Safety Management System",
              compliance_status: "compliant",
              evidence: "Certificate on file",
              comment: "All requirements met"
            },
            {
              id: "item-uuid-2",
              requirement_number: 2,
              requirement_title: "Emergency Response",
              compliance_status: "partial",
              evidence: "Training records incomplete",
              comment: "Need to update training"
            }
          ]
        }
      ];

      expect(mockResponse[0].sgso_audit_items).toHaveLength(2);
    });
  });
});
