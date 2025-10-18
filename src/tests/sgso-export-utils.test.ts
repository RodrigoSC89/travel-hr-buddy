import { describe, it, expect } from "vitest";
import { generateCSVFromPlans, SGSOActionPlan } from "@/lib/sgso/export-utils";

describe("SGSO Export Utilities", () => {
  const mockPlans: SGSOActionPlan[] = [
    {
      id: "plan-1",
      incident_id: "imca-2025-001",
      corrective_action: "Verificar sistema de energia redundante",
      preventive_action: "Implementar manutenção preventiva mensal",
      recommendation: "Treinar equipe em procedimentos de emergência",
      status: "approved",
      status_approval: "aprovado",
      approval_note: "Aprovado pelo time QSMS",
      created_at: "2025-01-15T10:00:00Z",
      dp_incidents: {
        id: "imca-2025-001",
        title: "Falha no sistema DP",
        description: "Perda temporária de posição",
        date: "2025-01-15",
        vessel: "PSV Atlantic",
        location: "Bacia de Campos",
        root_cause: "Falha no sistema de energia",
      },
    },
    {
      id: "plan-2",
      incident_id: "imca-2025-002",
      corrective_action: "Substituir componente defeituoso",
      preventive_action: "Estabelecer programa de inspeção rigorosa",
      recommendation: "Revisar procedimentos operacionais",
      status: "pending_approval",
      status_approval: "pendente",
      created_at: "2025-01-16T14:30:00Z",
      dp_incidents: {
        id: "imca-2025-002",
        title: "Erro de sensor",
        description: "Sensor apresentou leitura incorreta",
        date: "2025-01-16",
        vessel: "AHTS Navigator",
        location: "Santos Basin",
        root_cause: "Calibração inadequada",
      },
    },
  ];

  describe("generateCSVFromPlans", () => {
    it("should generate CSV with proper headers", () => {
      const csv = generateCSVFromPlans(mockPlans);
      const lines = csv.split("\n");
      
      expect(lines[0]).toContain("Data");
      expect(lines[0]).toContain("Incidente");
      expect(lines[0]).toContain("Embarcação");
      expect(lines[0]).toContain("Local");
      expect(lines[0]).toContain("Causa Raiz");
      expect(lines[0]).toContain("Correção");
      expect(lines[0]).toContain("Prevenção");
      expect(lines[0]).toContain("Recomendação");
      expect(lines[0]).toContain("Status Aprovação");
    });

    it("should generate correct number of rows", () => {
      const csv = generateCSVFromPlans(mockPlans);
      const lines = csv.split("\n");
      
      // Header + 2 data rows
      expect(lines.length).toBe(3);
    });

    it("should include incident data in CSV", () => {
      const csv = generateCSVFromPlans(mockPlans);
      
      expect(csv).toContain("Falha no sistema DP");
      expect(csv).toContain("PSV Atlantic");
      expect(csv).toContain("Bacia de Campos");
      expect(csv).toContain("aprovado");
    });

    it("should handle empty plans array", () => {
      const csv = generateCSVFromPlans([]);
      const lines = csv.split("\n");
      
      // Should only have header
      expect(lines.length).toBe(1);
      expect(lines[0]).toContain("Data");
    });

    it("should escape commas in fields", () => {
      const planWithCommas: SGSOActionPlan[] = [
        {
          id: "plan-3",
          incident_id: "test-001",
          corrective_action: "Action with, comma in it",
          preventive_action: "Another action, with comma",
          recommendation: "Recommendation, also with comma",
          status: "approved",
          status_approval: "aprovado",
          created_at: "2025-01-15T10:00:00Z",
          dp_incidents: {
            id: "test-001",
            title: "Test incident",
            date: "2025-01-15",
          },
        },
      ];

      const csv = generateCSVFromPlans(planWithCommas);
      
      // Fields with commas should be quoted
      expect(csv).toContain('"Action with, comma in it"');
      expect(csv).toContain('"Another action, with comma"');
      expect(csv).toContain('"Recommendation, also with comma"');
    });

    it("should handle missing optional fields", () => {
      const planWithMissingFields: SGSOActionPlan[] = [
        {
          id: "plan-4",
          incident_id: "test-002",
          corrective_action: "Some action",
          preventive_action: "Some prevention",
          recommendation: "",
          status: "approved",
          status_approval: "aprovado",
          created_at: "2025-01-15T10:00:00Z",
        },
      ];

      const csv = generateCSVFromPlans(planWithMissingFields);
      
      // Should handle missing dp_incidents gracefully
      expect(csv).toContain("test-002");
      expect(csv).toContain("-"); // Default for missing fields
    });

    it("should format dates correctly", () => {
      const csv = generateCSVFromPlans(mockPlans);
      
      // Should include formatted dates (DD/MM/YYYY format for pt-BR)
      expect(csv).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe("SGSOActionPlan type structure", () => {
    it("should have required fields", () => {
      const plan = mockPlans[0];
      
      expect(plan.id).toBeDefined();
      expect(plan.incident_id).toBeDefined();
      expect(plan.corrective_action).toBeDefined();
      expect(plan.preventive_action).toBeDefined();
      expect(plan.status).toBeDefined();
      expect(plan.status_approval).toBeDefined();
      expect(plan.created_at).toBeDefined();
    });

    it("should have proper status_approval values", () => {
      const validStatuses = ["pendente", "aprovado", "recusado"];
      
      mockPlans.forEach(plan => {
        expect(validStatuses).toContain(plan.status_approval);
      });
    });

    it("should have nested dp_incidents structure", () => {
      const plan = mockPlans[0];
      
      expect(plan.dp_incidents).toBeDefined();
      expect(plan.dp_incidents?.id).toBeDefined();
      expect(plan.dp_incidents?.title).toBeDefined();
      expect(plan.dp_incidents?.date).toBeDefined();
    });
  });
});
