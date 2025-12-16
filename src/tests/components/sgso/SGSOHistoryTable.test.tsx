/**
 * SGSO History Table Component Tests
 * Tests for SGSOHistoryTable component rendering and functionality
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { SGSOHistoryTable, SGSOActionPlan } from "@/components/sgso/SGSOHistoryTable";

const mockActionPlans: SGSOActionPlan[] = [
  {
    id: "plan-1",
    incident_id: "incident-1",
    vessel_id: "DP Shuttle Tanker X",
    correction_action: "Immediate gyro recalibration and replacement of faulty sensor",
    prevention_action: "Implement automated gyro drift detection system",
    recommendation_action: "Upgrade to redundant gyro system",
    status: "aberto",
    approved_by: null,
    approved_at: null,
    created_at: "2025-10-18T10:00:00Z",
    updated_at: "2025-10-18T10:00:00Z",
    incident: {
      id: "incident-1",
      title: "Loss of Position Due to Gyro Drift",
      incident_date: "2025-09-12T00:00:00Z",
      severity: "Alta",
      sgso_category: "Equipamento",
      sgso_risk_level: "Crítico",
      description: "Gyro drift during tandem loading",
    },
  },
  {
    id: "plan-2",
    incident_id: "incident-2",
    vessel_id: "DP Shuttle Tanker X",
    correction_action: "Software patch applied to thruster control system",
    prevention_action: "Implement software version control",
    recommendation_action: "Establish pre-ROV deployment checklist",
    status: "em_andamento",
    approved_by: "João Silva - Safety Manager",
    approved_at: "2025-10-15T10:00:00Z",
    created_at: "2025-10-17T10:00:00Z",
    updated_at: "2025-10-17T10:00:00Z",
    incident: {
      id: "incident-2",
      title: "Thruster Control Software Failure",
      incident_date: "2025-08-05T00:00:00Z",
      severity: "Alta",
      sgso_category: "Sistema",
      sgso_risk_level: "Alto",
      description: "Software failure during ROV ops",
    },
  },
  {
    id: "plan-3",
    incident_id: "incident-3",
    vessel_id: "DP Shuttle Tanker X",
    correction_action: "PMS configuration corrected",
    prevention_action: "Establish monthly PMS configuration review",
    recommendation_action: "Train all engineers on PMS configuration",
    status: "resolvido",
    approved_by: "Maria Santos - Technical Director",
    approved_at: "2025-10-08T10:00:00Z",
    created_at: "2025-10-10T10:00:00Z",
    updated_at: "2025-10-10T10:00:00Z",
    incident: {
      id: "incident-3",
      title: "Power Management System Malfunction",
      incident_date: "2024-12-03T00:00:00Z",
      severity: "Média",
      sgso_category: "Energia",
      sgso_risk_level: "Médio",
      description: "PMS configuration error",
    },
  },
];

describe("SGSOHistoryTable", () => {
  describe("Rendering", () => {
    it("should render the table with action plans", () => {
      render(<SGSOHistoryTable actionPlans={mockActionPlans} />);

      expect(screen.getByText("Loss of Position Due to Gyro Drift")).toBeInTheDocument();
      expect(screen.getByText("Thruster Control Software Failure")).toBeInTheDocument();
      expect(screen.getByText("Power Management System Malfunction")).toBeInTheDocument();
    });

    it("should render empty state when no action plans", () => {
      render(<SGSOHistoryTable actionPlans={[]} />);

      expect(screen.getByText("Nenhum plano de ação encontrado para esta embarcação.")).toBeInTheDocument();
    });

    it("should render table headers", () => {
      render(<SGSOHistoryTable actionPlans={mockActionPlans} />);

      expect(screen.getByText("Incidente")).toBeInTheDocument();
      expect(screen.getByText("Data do Incidente")).toBeInTheDocument();
      expect(screen.getByText("Categoria SGSO")).toBeInTheDocument();
      expect(screen.getByText("Nível de Risco")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
    });
  });

  describe("Status Badges", () => {
    it("should render 'Aberto' status badge with red color", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[0]]} />);

      const badge = screen.getByText("Aberto");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-destructive");
    });

    it("should render 'Em Andamento' status badge with yellow color", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[1]]} />);

      const badge = screen.getByText("Em Andamento");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-yellow-500");
    });

    it("should render 'Resolvido' status badge with green color", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[2]]} />);

      const badge = screen.getByText("Resolvido");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-green-600");
    });
  });

  describe("Risk Level Badges", () => {
    it("should render critical risk level", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[0]]} />);

      expect(screen.getByText(/Crítico/)).toBeInTheDocument();
    });

    it("should render high risk level", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[1]]} />);

      expect(screen.getByText(/Alto/)).toBeInTheDocument();
    });

    it("should render medium risk level", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[2]]} />);

      expect(screen.getByText(/Médio/)).toBeInTheDocument();
    });

    it("should render N/A for missing risk level", () => {
      const planWithoutRisk = {
        ...mockActionPlans[0],
        incident: { ...mockActionPlans[0].incident, sgso_risk_level: null },
      };
      render(<SGSOHistoryTable actionPlans={[planWithoutRisk]} />);

      expect(screen.getByText("N/A")).toBeInTheDocument();
    });
  });

  describe("Date Formatting", () => {
    it("should format dates in pt-BR locale", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[0]]} />);

      // Date should be formatted as DD/MM/YYYY
      expect(screen.getByText("12/09/2025")).toBeInTheDocument();
    });

    it("should format created_at dates", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[0]]} />);

      expect(screen.getByText("18/10/2025")).toBeInTheDocument();
    });
  });

  describe("Expandable Rows", () => {
    it("should expand row on button click", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[0]]} />);

      const expandButton = screen.getAllByRole("button", { name: /expandir detalhes/i })[0];
      fireEvent.click(expandButton);

      expect(screen.getByText("📋 Ação Corretiva")).toBeInTheDocument();
      expect(screen.getByText("🛡️ Ação Preventiva")).toBeInTheDocument();
      expect(screen.getByText("💡 Recomendação")).toBeInTheDocument();
    });

    it("should collapse row on second click", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[0]]} />);

      const expandButton = screen.getAllByRole("button", { name: /expandir detalhes/i })[0];
      fireEvent.click(expandButton);
      expect(screen.getByText("📋 Ação Corretiva")).toBeInTheDocument();

      fireEvent.click(expandButton);
      expect(screen.queryByText("📋 Ação Corretiva")).not.toBeInTheDocument();
    });

    it("should show action plan details when expanded", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[0]]} />);

      const expandButton = screen.getAllByRole("button", { name: /expandir detalhes/i })[0];
      fireEvent.click(expandButton);

      expect(screen.getByText("Immediate gyro recalibration and replacement of faulty sensor")).toBeInTheDocument();
      expect(screen.getByText("Implement automated gyro drift detection system")).toBeInTheDocument();
      expect(screen.getByText("Upgrade to redundant gyro system")).toBeInTheDocument();
    });

    it("should show approval information when present", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[1]]} />);

      const expandButton = screen.getAllByRole("button", { name: /expandir detalhes/i })[0];
      fireEvent.click(expandButton);

      expect(screen.getByText(/João Silva - Safety Manager/)).toBeInTheDocument();
    });

    it("should not show approval information when absent", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[0]]} />);

      const expandButton = screen.getAllByRole("button", { name: /expandir detalhes/i })[0];
      fireEvent.click(expandButton);

      expect(screen.queryByText(/Aprovado por:/)).not.toBeInTheDocument();
    });
  });

  describe("SGSO Category", () => {
    it("should render category badge", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[0]]} />);

      expect(screen.getByText("Equipamento")).toBeInTheDocument();
    });

    it("should render N/A for missing category", () => {
      const planWithoutCategory = {
        ...mockActionPlans[0],
        incident: { ...mockActionPlans[0].incident, sgso_category: null },
      };
      render(<SGSOHistoryTable actionPlans={[planWithoutCategory]} />);

      const rows = screen.getAllByRole("row");
      const dataRow = rows[1]; // First data row (after header)
      expect(within(dataRow).getByText("N/A")).toBeInTheDocument();
    });
  });

  describe("Edit Functionality", () => {
    it("should render edit button when onEdit provided", () => {
      const onEdit = vi.fn();
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[0]]} onEdit={onEdit} />);

      expect(screen.getByText("Editar")).toBeInTheDocument();
    });

    it("should not render edit button when onEdit not provided", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[0]]} />);

      expect(screen.queryByText("Editar")).not.toBeInTheDocument();
    });

    it("should call onEdit with plan ID when edit button clicked", () => {
      const onEdit = vi.fn();
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[0]]} onEdit={onEdit} />);

      const editButton = screen.getByText("Editar");
      fireEvent.click(editButton);

      expect(onEdit).toHaveBeenCalledWith("plan-1");
    });

    it("should render Ações header when onEdit provided", () => {
      const onEdit = vi.fn();
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[0]]} onEdit={onEdit} />);

      expect(screen.getByText("Ações")).toBeInTheDocument();
    });
  });

  describe("Missing Data Handling", () => {
    it("should handle missing incident title", () => {
      const planWithoutTitle = {
        ...mockActionPlans[0],
        incident: { ...mockActionPlans[0].incident, title: null },
      };
      render(<SGSOHistoryTable actionPlans={[planWithoutTitle]} />);

      expect(screen.getByText("Sem título")).toBeInTheDocument();
    });

    it("should handle missing action fields", () => {
      const planWithoutActions = {
        ...mockActionPlans[0],
        correction_action: null,
        prevention_action: null,
        recommendation_action: null,
      };
      render(<SGSOHistoryTable actionPlans={[planWithoutActions]} />);

      const expandButton = screen.getAllByRole("button", { name: /expandir detalhes/i })[0];
      fireEvent.click(expandButton);

      const notSpecified = screen.getAllByText("Não especificada");
      expect(notSpecified).toHaveLength(3);
    });
  });

  describe("Accessibility", () => {
    it("should have proper aria-labels on expand buttons", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[0]]} />);

      const expandButton = screen.getAllByRole("button", { name: /expandir detalhes/i })[0];
      expect(expandButton).toHaveAttribute("aria-label");
    });

    it("should update aria-label when row is expanded", () => {
      render(<SGSOHistoryTable actionPlans={[mockActionPlans[0]]} />);

      const expandButton = screen.getAllByRole("button", { name: /expandir detalhes/i })[0];
      fireEvent.click(expandButton);

      const collapseButton = screen.getByRole("button", { name: /fechar detalhes/i });
      expect(collapseButton).toBeInTheDocument();
    });

    it("should render semantic HTML table", () => {
      render(<SGSOHistoryTable actionPlans={mockActionPlans} />);

      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getAllByRole("row")).toHaveLength(mockActionPlans.length + 1); // +1 for header
    });
  });

  describe("Multiple Action Plans", () => {
    it("should render all action plans", () => {
      render(<SGSOHistoryTable actionPlans={mockActionPlans} />);

      expect(screen.getByText("Loss of Position Due to Gyro Drift")).toBeInTheDocument();
      expect(screen.getByText("Thruster Control Software Failure")).toBeInTheDocument();
      expect(screen.getByText("Power Management System Malfunction")).toBeInTheDocument();
    });

    it("should allow expanding multiple rows simultaneously", () => {
      render(<SGSOHistoryTable actionPlans={mockActionPlans} />);

      const expandButtons = screen.getAllByRole("button", { name: /expandir detalhes/i });
      fireEvent.click(expandButtons[0]);
      fireEvent.click(expandButtons[1]);

      const correctionHeaders = screen.getAllByText("📋 Ação Corretiva");
      expect(correctionHeaders).toHaveLength(2);
    });
  });
});
