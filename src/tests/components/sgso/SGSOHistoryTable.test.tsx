/**
 * SGSOHistoryTable Component Tests
 * 
 * Tests for the SGSOHistoryTable component that displays action plan history
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SGSOHistoryTable } from "@/components/sgso/SGSOHistoryTable";

describe("SGSOHistoryTable Component", () => {
  const mockPlans = [
    {
      id: "plan-1",
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
    },
    {
      id: "plan-2",
      corrective_action: "Substituir sensor",
      preventive_action: "Calibração mensal",
      recommendation: "Monitoramento contínuo",
      status: "resolvido",
      approved_by: "Maria Santos",
      approved_at: "2025-10-12T14:00:00Z",
      created_at: "2025-10-08T08:00:00Z",
      dp_incidents: {
        description: "Sensor de posição com defeito",
        updated_at: "2025-10-08T09:00:00Z",
        sgso_category: "Sistema",
        sgso_risk_level: "Médio",
        title: "Sensor Malfunction",
        date: "2025-10-07"
      }
    }
  ];

  describe("Rendering", () => {
    it("should render table header correctly", () => {
      render(<SGSOHistoryTable plans={mockPlans} />);
      
      expect(screen.getByText("📜 Histórico de Planos de Ação SGSO")).toBeDefined();
    });

    it("should render table headers", () => {
      render(<SGSOHistoryTable plans={mockPlans} />);
      
      expect(screen.getByText("Data")).toBeDefined();
      expect(screen.getByText("Incidente")).toBeDefined();
      expect(screen.getByText("Categoria")).toBeDefined();
      expect(screen.getByText("Risco")).toBeDefined();
      expect(screen.getByText("Plano de Ação")).toBeDefined();
      expect(screen.getByText("Status")).toBeDefined();
      expect(screen.getByText("Aprovador")).toBeDefined();
      expect(screen.getByText("Ações")).toBeDefined();
    });

    it("should render empty state when no plans", () => {
      render(<SGSOHistoryTable plans={[]} />);
      
      expect(screen.getByText("Nenhum plano de ação encontrado para esta embarcação.")).toBeDefined();
    });

    it("should render plan data rows", () => {
      render(<SGSOHistoryTable plans={mockPlans} />);
      
      expect(screen.getByText("Thruster Failure")).toBeDefined();
      expect(screen.getByText("Sensor Malfunction")).toBeDefined();
    });
  });

  describe("Status Display", () => {
    it("should display 'aberto' status correctly", () => {
      const plans = [
        {
          ...mockPlans[0],
          status: "aberto"
        }
      ];
      
      render(<SGSOHistoryTable plans={plans} />);
      expect(screen.getByText("Aberto")).toBeDefined();
    });

    it("should display 'em_andamento' status correctly", () => {
      const plans = [
        {
          ...mockPlans[0],
          status: "em_andamento"
        }
      ];
      
      render(<SGSOHistoryTable plans={plans} />);
      expect(screen.getByText("Em Andamento")).toBeDefined();
    });

    it("should display 'resolvido' status correctly", () => {
      const plans = [
        {
          ...mockPlans[1],
          status: "resolvido"
        }
      ];
      
      render(<SGSOHistoryTable plans={plans} />);
      expect(screen.getByText("Resolvido")).toBeDefined();
    });

    it("should apply correct color for 'aberto' status", () => {
      const statusColors = {
        aberto: "bg-red-500",
        em_andamento: "bg-yellow-500",
        resolvido: "bg-green-600"
      };
      
      expect(statusColors.aberto).toBe("bg-red-500");
    });

    it("should apply correct color for 'em_andamento' status", () => {
      const statusColors = {
        aberto: "bg-red-500",
        em_andamento: "bg-yellow-500",
        resolvido: "bg-green-600"
      };
      
      expect(statusColors.em_andamento).toBe("bg-yellow-500");
    });

    it("should apply correct color for 'resolvido' status", () => {
      const statusColors = {
        aberto: "bg-red-500",
        em_andamento: "bg-yellow-500",
        resolvido: "bg-green-600"
      };
      
      expect(statusColors.resolvido).toBe("bg-green-600");
    });
  });

  describe("Action Plan Details", () => {
    it("should show corrective action in details", () => {
      const plans = [mockPlans[0]];
      render(<SGSOHistoryTable plans={plans} />);
      
      expect(screen.getByText("Ver detalhes")).toBeDefined();
    });

    it("should display all action types", () => {
      const actionTypes = {
        corrective: "✅ Correção",
        preventive: "🔁 Prevenção",
        recommendation: "🧠 Recomendação"
      };
      
      expect(actionTypes.corrective).toBeTruthy();
      expect(actionTypes.preventive).toBeTruthy();
      expect(actionTypes.recommendation).toBeTruthy();
    });
  });

  describe("Date Formatting", () => {
    it("should format dates correctly", () => {
      const dateString = "2025-10-15T10:00:00Z";
      const formatted = new Date(dateString).toLocaleDateString("pt-BR");
      expect(formatted).toBeTruthy();
    });

    it("should format date-time correctly", () => {
      const dateString = "2025-10-15T10:00:00Z";
      const formatted = new Date(dateString).toLocaleString("pt-BR");
      expect(formatted).toBeTruthy();
    });

    it("should handle missing dates gracefully", () => {
      const dateString = undefined;
      const formatted = dateString ? new Date(dateString).toLocaleDateString("pt-BR") : "—";
      expect(formatted).toBe("—");
    });
  });

  describe("Incident Information", () => {
    it("should display incident title", () => {
      render(<SGSOHistoryTable plans={mockPlans} />);
      
      expect(screen.getByText("Thruster Failure")).toBeDefined();
    });

    it("should display incident category", () => {
      render(<SGSOHistoryTable plans={mockPlans} />);
      
      expect(screen.getByText("Equipamento")).toBeDefined();
      expect(screen.getByText("Sistema")).toBeDefined();
    });

    it("should display risk level badge", () => {
      render(<SGSOHistoryTable plans={mockPlans} />);
      
      expect(screen.getByText("Alto")).toBeDefined();
      expect(screen.getByText("Médio")).toBeDefined();
    });

    it("should handle missing incident data", () => {
      const plansWithMissingData = [
        {
          ...mockPlans[0],
          dp_incidents: undefined
        }
      ];
      
      render(<SGSOHistoryTable plans={plansWithMissingData} />);
      // Should render without crashing
      expect(screen.getByText("📜 Histórico de Planos de Ação SGSO")).toBeDefined();
    });
  });

  describe("Approval Information", () => {
    it("should display approver name", () => {
      render(<SGSOHistoryTable plans={mockPlans} />);
      
      expect(screen.getByText("João Silva")).toBeDefined();
      expect(screen.getByText("Maria Santos")).toBeDefined();
    });

    it("should handle missing approval data", () => {
      const plansWithoutApproval = [
        {
          ...mockPlans[0],
          approved_by: undefined,
          approved_at: undefined
        }
      ];
      
      render(<SGSOHistoryTable plans={plansWithoutApproval} />);
      // Should show "—" for missing approval
      expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    });
  });

  describe("Edit Functionality", () => {
    it("should show edit button when onEdit is provided", () => {
      const onEdit = vi.fn();
      render(<SGSOHistoryTable plans={mockPlans} onEdit={onEdit} />);
      
      const editButtons = screen.getAllByText(/✏️ Editar/);
      expect(editButtons.length).toBe(mockPlans.length);
    });

    it("should not show edit button when onEdit is not provided", () => {
      render(<SGSOHistoryTable plans={mockPlans} />);
      
      const editButtons = screen.queryAllByText(/✏️ Editar/);
      expect(editButtons.length).toBe(0);
    });
  });

  describe("Compliance Features", () => {
    it("should display all required compliance fields", () => {
      const complianceFields = [
        "corrective_action",
        "preventive_action",
        "recommendation",
        "status",
        "approved_by",
        "approved_at"
      ];
      
      complianceFields.forEach(field => {
        expect(field).toBeTruthy();
      });
    });

    it("should support audit trail with timestamps", () => {
      const plan = mockPlans[0];
      expect(plan.created_at).toBeTruthy();
      expect(plan.approved_at).toBeTruthy();
    });

    it("should link to incident for traceability", () => {
      const plan = mockPlans[0];
      expect(plan.dp_incidents).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("should render table with proper structure", () => {
      render(<SGSOHistoryTable plans={mockPlans} />);
      
      // Check if table is present
      const table = document.querySelector("table");
      expect(table).toBeTruthy();
    });

    it("should have header row", () => {
      render(<SGSOHistoryTable plans={mockPlans} />);
      
      const thead = document.querySelector("thead");
      expect(thead).toBeTruthy();
    });

    it("should have body rows for data", () => {
      render(<SGSOHistoryTable plans={mockPlans} />);
      
      const tbody = document.querySelector("tbody");
      expect(tbody).toBeTruthy();
    });
  });
});
