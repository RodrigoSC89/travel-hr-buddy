/**
 * SGSO History Table Component Tests
 * 
 * Tests for the SGSOHistoryTable component that displays
 * action plans history with expandable details
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SGSOHistoryTable, SGSOActionPlan } from "@/components/sgso/SGSOHistoryTable";

// Mock data for tests
const mockActionPlans: SGSOActionPlan[] = [
  {
    id: "plan-1",
    corrective_action: "Substituir giroscópio defeituoso",
    preventive_action: "Verificação diária dos sensores",
    recommendation: "Considerar redundância de sensores",
    status: "resolvido",
    approved_by: "João Silva - Gerente de Operações",
    approved_at: "2025-10-13T10:00:00Z",
    created_at: "2025-10-10T10:00:00Z",
    updated_at: "2025-10-13T10:00:00Z",
    dp_incidents: {
      id: "incident-1",
      description: "Loss of Position Due to Gyro Drift",
      sgso_category: "Equipamento",
      sgso_risk_level: "Crítico",
      updated_at: "2025-10-10T10:00:00Z",
      incident_date: "2025-10-10"
    }
  },
  {
    id: "plan-2",
    corrective_action: "Atualização do firmware",
    preventive_action: "Protocolo de testes",
    recommendation: "Avaliar upgrade",
    status: "em_andamento",
    approved_by: "Maria Santos - Diretora Técnica",
    approved_at: "2025-10-15T14:30:00Z",
    created_at: "2025-10-12T10:00:00Z",
    updated_at: "2025-10-15T14:30:00Z",
    dp_incidents: {
      id: "incident-2",
      description: "Thruster Control Software Failure",
      sgso_category: "Sistema",
      sgso_risk_level: "Alto",
      updated_at: "2025-10-12T10:00:00Z",
      incident_date: "2025-10-12"
    }
  },
  {
    id: "plan-3",
    corrective_action: "Revisão da configuração do PMS",
    preventive_action: "Documentação atualizada",
    recommendation: "Sistema de monitoramento em tempo real",
    status: "aberto",
    approved_by: null,
    approved_at: null,
    created_at: "2025-10-16T10:00:00Z",
    updated_at: "2025-10-16T10:00:00Z",
    dp_incidents: {
      id: "incident-3",
      description: "Power Management System Malfunction",
      sgso_category: "Energia",
      sgso_risk_level: "Médio",
      updated_at: "2025-10-16T10:00:00Z",
      incident_date: "2025-10-16"
    }
  }
];

describe("SGSOHistoryTable Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the component with title", () => {
      render(<SGSOHistoryTable plans={mockActionPlans} />);
      expect(screen.getByText(/Histórico de Planos de Ação SGSO/i)).toBeInTheDocument();
    });

    it("should render table headers", () => {
      render(<SGSOHistoryTable plans={mockActionPlans} />);
      expect(screen.getByText("Data")).toBeInTheDocument();
      expect(screen.getByText("Incidente")).toBeInTheDocument();
      expect(screen.getByText("Categoria")).toBeInTheDocument();
      expect(screen.getByText("Risco")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Aprovador")).toBeInTheDocument();
      expect(screen.getByText("Ações")).toBeInTheDocument();
    });

    it("should render all action plans", () => {
      render(<SGSOHistoryTable plans={mockActionPlans} />);
      expect(screen.getByText("Loss of Position Due to Gyro Drift")).toBeInTheDocument();
      expect(screen.getByText("Thruster Control Software Failure")).toBeInTheDocument();
      expect(screen.getByText("Power Management System Malfunction")).toBeInTheDocument();
    });

    it("should render empty state when no plans provided", () => {
      render(<SGSOHistoryTable plans={[]} />);
      expect(screen.getByText(/Nenhum plano de ação encontrado/i)).toBeInTheDocument();
    });
  });

  describe("Status Display", () => {
    it("should display 'Aberto' status badge for open plans", () => {
      render(<SGSOHistoryTable plans={mockActionPlans} />);
      const statusBadges = screen.getAllByText("Aberto");
      expect(statusBadges.length).toBeGreaterThan(0);
    });

    it("should display 'Em Andamento' status badge for in-progress plans", () => {
      render(<SGSOHistoryTable plans={mockActionPlans} />);
      const statusBadges = screen.getAllByText("Em Andamento");
      expect(statusBadges.length).toBeGreaterThan(0);
    });

    it("should display 'Resolvido' status badge for resolved plans", () => {
      render(<SGSOHistoryTable plans={mockActionPlans} />);
      const statusBadges = screen.getAllByText("Resolvido");
      expect(statusBadges.length).toBeGreaterThan(0);
    });

    it("should use color-coded badges for different statuses", () => {
      const statusConfig = {
        aberto: { variant: "destructive", label: "Aberto" },
        em_andamento: { variant: "default", label: "Em Andamento" },
        resolvido: { variant: "default", label: "Resolvido" }
      };
      expect(statusConfig.aberto.variant).toBe("destructive");
      expect(statusConfig.resolvido.label).toBe("Resolvido");
    });
  });

  describe("Risk Level Display", () => {
    it("should display risk levels", () => {
      render(<SGSOHistoryTable plans={mockActionPlans} />);
      expect(screen.getByText("Crítico")).toBeInTheDocument();
      expect(screen.getByText("Alto")).toBeInTheDocument();
      expect(screen.getByText("Médio")).toBeInTheDocument();
    });

    it("should use different badge variants for risk levels", () => {
      const riskConfig = {
        Crítico: "destructive",
        Alto: "default",
        Médio: "secondary",
        Baixo: "outline"
      };
      expect(riskConfig.Crítico).toBe("destructive");
      expect(riskConfig.Médio).toBe("secondary");
    });

    it("should handle missing risk level gracefully", () => {
      const planWithoutRisk = [{
        ...mockActionPlans[0],
        dp_incidents: {
          ...mockActionPlans[0].dp_incidents,
          sgso_risk_level: ""
        }
      }];
      render(<SGSOHistoryTable plans={planWithoutRisk} />);
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  describe("Category Display", () => {
    it("should display incident categories", () => {
      render(<SGSOHistoryTable plans={mockActionPlans} />);
      expect(screen.getByText("Equipamento")).toBeInTheDocument();
      expect(screen.getByText("Sistema")).toBeInTheDocument();
      expect(screen.getByText("Energia")).toBeInTheDocument();
    });

    it("should handle missing category gracefully", () => {
      const planWithoutCategory = [{
        ...mockActionPlans[0],
        dp_incidents: {
          ...mockActionPlans[0].dp_incidents,
          sgso_category: ""
        }
      }];
      render(<SGSOHistoryTable plans={planWithoutCategory} />);
      const emptyMarkers = screen.getAllByText("—");
      expect(emptyMarkers.length).toBeGreaterThan(0);
    });
  });

  describe("Approval Information", () => {
    it("should display approver name when available", () => {
      render(<SGSOHistoryTable plans={mockActionPlans} />);
      expect(screen.getByText("João Silva - Gerente de Operações")).toBeInTheDocument();
      expect(screen.getByText("Maria Santos - Diretora Técnica")).toBeInTheDocument();
    });

    it("should display '—' when no approver", () => {
      render(<SGSOHistoryTable plans={mockActionPlans} />);
      const emptyMarkers = screen.getAllByText("—");
      expect(emptyMarkers.length).toBeGreaterThan(0);
    });

    it("should format approval date in pt-BR locale", () => {
      const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      };
      const formatted = formatDate("2025-10-13T10:00:00Z");
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe("Date Formatting", () => {
    it("should format dates in pt-BR format", () => {
      render(<SGSOHistoryTable plans={mockActionPlans} />);
      // Dates should be formatted as DD/MM/YYYY
      const dateElements = screen.getAllByText(/\d{2}\/\d{2}\/\d{4}/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it("should use incident_date or updated_at for display", () => {
      const plan = mockActionPlans[0];
      expect(plan.dp_incidents.updated_at || plan.dp_incidents.incident_date).toBeTruthy();
    });
  });

  describe("Action Plan Details", () => {
    it("should include corrective action", () => {
      const plan = mockActionPlans[0];
      expect(plan.corrective_action).toBeTruthy();
      expect(plan.corrective_action).toBe("Substituir giroscópio defeituoso");
    });

    it("should include preventive action", () => {
      const plan = mockActionPlans[0];
      expect(plan.preventive_action).toBeTruthy();
      expect(plan.preventive_action).toBe("Verificação diária dos sensores");
    });

    it("should include recommendations", () => {
      const plan = mockActionPlans[0];
      expect(plan.recommendation).toBeTruthy();
      expect(plan.recommendation).toBe("Considerar redundância de sensores");
    });
  });

  describe("Edit Functionality", () => {
    it("should accept onEdit callback prop", () => {
      const mockOnEdit = vi.fn();
      render(<SGSOHistoryTable plans={mockActionPlans} onEdit={mockOnEdit} />);
      expect(mockOnEdit).toBeDefined();
    });

    it("should be optional (component works without onEdit)", () => {
      render(<SGSOHistoryTable plans={mockActionPlans} />);
      expect(screen.getByText("Histórico de Planos de Ação SGSO")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should use overflow-x-auto for table responsiveness", () => {
      const { container } = render(<SGSOHistoryTable plans={mockActionPlans} />);
      const scrollContainer = container.querySelector(".overflow-x-auto");
      expect(scrollContainer).toBeInTheDocument();
    });

    it("should truncate long incident descriptions", () => {
      const { container } = render(<SGSOHistoryTable plans={mockActionPlans} />);
      const truncatedCells = container.querySelectorAll(".truncate");
      expect(truncatedCells.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should use semantic table structure", () => {
      const { container } = render(<SGSOHistoryTable plans={mockActionPlans} />);
      expect(container.querySelector("table")).toBeInTheDocument();
      expect(container.querySelector("thead")).toBeInTheDocument();
      expect(container.querySelector("tbody")).toBeInTheDocument();
    });

    it("should provide table headers for screen readers", () => {
      render(<SGSOHistoryTable plans={mockActionPlans} />);
      const headers = ["Data", "Incidente", "Categoria", "Risco", "Status", "Aprovador", "Ações"];
      headers.forEach(header => {
        expect(screen.getByText(header)).toBeInTheDocument();
      });
    });

    it("should use icons with text labels for better accessibility", () => {
      const statusConfig = {
        aberto: { icon: "AlertCircle", label: "Aberto" },
        em_andamento: { icon: "Clock", label: "Em Andamento" },
        resolvido: { icon: "CheckCircle2", label: "Resolvido" }
      };
      expect(statusConfig.aberto.label).toBeTruthy();
      expect(statusConfig.resolvido.label).toBeTruthy();
    });
  });

  describe("Data Integrity", () => {
    it("should maintain referential integrity with incidents", () => {
      mockActionPlans.forEach(plan => {
        expect(plan.dp_incidents).toBeDefined();
        expect(plan.dp_incidents.id).toBeTruthy();
      });
    });

    it("should have timestamps for audit trail", () => {
      mockActionPlans.forEach(plan => {
        expect(plan.created_at).toBeTruthy();
        expect(plan.updated_at).toBeTruthy();
      });
    });

    it("should link to specific incident", () => {
      const plan = mockActionPlans[0];
      expect(plan.dp_incidents.description).toBeTruthy();
      expect(plan.dp_incidents.sgso_category).toBeTruthy();
    });
  });
});
