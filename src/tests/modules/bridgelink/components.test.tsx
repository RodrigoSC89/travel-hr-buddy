import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DPStatusCard } from "@/modules/control/bridgelink/components/DPStatusCard";
import { RiskAlertPanel } from "@/modules/control/bridgelink/components/RiskAlertPanel";
import { LiveDecisionMap } from "@/modules/control/bridgelink/components/LiveDecisionMap";
import type { RiskAlert, DPEvent } from "@/modules/control/bridgelink/types";

// Mock Chart.js components
vi.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="mock-chart">Chart</div>,
}));

describe("BridgeLink Components", () => {
  describe("DPStatusCard", () => {
    it("should render normal status correctly", () => {
      render(<DPStatusCard status="Normal" />);

      expect(screen.getByText(/Status do Sistema DP/i)).toBeInTheDocument();
      expect(screen.getByText(/🟢 Normal/i)).toBeInTheDocument();
    });

    it("should render degradation status correctly", () => {
      render(<DPStatusCard status="Degradation" />);

      expect(screen.getByText(/🟡 Degradação/i)).toBeInTheDocument();
    });

    it("should render critical status correctly", () => {
      render(<DPStatusCard status="Critical" />);

      expect(screen.getByText(/🔴 Crítico/i)).toBeInTheDocument();
    });

    it("should render offline status correctly", () => {
      render(<DPStatusCard status="Offline" />);

      expect(screen.getByText(/⚫ Offline/i)).toBeInTheDocument();
    });

    it("should render unknown status correctly", () => {
      render(<DPStatusCard status="Unknown" />);

      expect(screen.getByText(/❔ Desconhecido/i)).toBeInTheDocument();
    });
  });

  describe("RiskAlertPanel", () => {
    it("should show empty state when no alerts", () => {
      render(<RiskAlertPanel alerts={[]} />);

      expect(screen.getByText(/Alertas de Risco/i)).toBeInTheDocument();
      expect(screen.getByText(/Nenhum alerta ativo/i)).toBeInTheDocument();
    });

    it("should render alerts correctly", () => {
      const mockAlerts: RiskAlert[] = [
        {
          id: "alert-1",
          level: "critical",
          title: "Critical Alert",
          description: "This is a critical alert",
          timestamp: new Date().toISOString(),
          source: "DP System",
        },
        {
          id: "alert-2",
          level: "medium",
          title: "Medium Alert",
          description: "This is a medium alert",
          timestamp: new Date().toISOString(),
          source: "SGSO",
        },
      ];

      render(<RiskAlertPanel alerts={mockAlerts} />);

      expect(screen.getByText("Critical Alert")).toBeInTheDocument();
      expect(screen.getByText("Medium Alert")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument(); // Badge count
    });

    it("should display recommendations when available", () => {
      const mockAlerts: RiskAlert[] = [
        {
          id: "alert-1",
          level: "high",
          title: "High Alert",
          description: "Alert with recommendations",
          timestamp: new Date().toISOString(),
          source: "DP System",
          recommendations: ["Check thruster", "Verify position"],
        },
      ];

      render(<RiskAlertPanel alerts={mockAlerts} />);

      expect(screen.getByText(/Recomendações:/i)).toBeInTheDocument();
      expect(screen.getByText("Check thruster")).toBeInTheDocument();
      expect(screen.getByText("Verify position")).toBeInTheDocument();
    });

    it("should sort alerts by severity", () => {
      const mockAlerts: RiskAlert[] = [
        {
          id: "alert-1",
          level: "low",
          title: "Low Alert",
          description: "Low priority",
          timestamp: new Date().toISOString(),
          source: "System A",
        },
        {
          id: "alert-2",
          level: "critical",
          title: "Critical Alert",
          description: "High priority",
          timestamp: new Date().toISOString(),
          source: "System B",
        },
        {
          id: "alert-3",
          level: "medium",
          title: "Medium Alert",
          description: "Medium priority",
          timestamp: new Date().toISOString(),
          source: "System C",
        },
      ];

      render(<RiskAlertPanel alerts={mockAlerts} />);

      // Critical should appear first
      expect(screen.getByText("Critical Alert")).toBeInTheDocument();
      expect(screen.getByText("Medium Alert")).toBeInTheDocument();
      expect(screen.getByText("Low Alert")).toBeInTheDocument();
    });
  });

  describe("LiveDecisionMap", () => {
    it("should show empty state when no events", () => {
      render(<LiveDecisionMap events={[]} />);

      expect(screen.getByText(/Mapa de Decisão Contextual/i)).toBeInTheDocument();
      expect(screen.getByText(/Nenhum evento registrado/i)).toBeInTheDocument();
    });

    it("should render events correctly", () => {
      const mockEvents: DPEvent[] = [
        {
          id: "evt-1",
          timestamp: new Date().toISOString(),
          type: "position",
          severity: "normal",
          system: "DP-2",
          description: "Position maintained",
        },
        {
          id: "evt-2",
          timestamp: new Date().toISOString(),
          type: "thruster",
          severity: "critical",
          system: "DP-3",
          description: "Thruster failure",
        },
      ];

      render(<LiveDecisionMap events={mockEvents} />);

      expect(screen.getByText(/2 eventos/i)).toBeInTheDocument();
      expect(screen.getByText("Position maintained")).toBeInTheDocument();
      expect(screen.getByText("Thruster failure")).toBeInTheDocument();
    });

    it("should display severity badges", () => {
      const mockEvents: DPEvent[] = [
        {
          id: "evt-1",
          timestamp: new Date().toISOString(),
          type: "test",
          severity: "normal",
          system: "DP-1",
          description: "Normal event",
        },
        {
          id: "evt-2",
          timestamp: new Date().toISOString(),
          type: "test",
          severity: "degradation",
          system: "DP-2",
          description: "Degraded event",
        },
        {
          id: "evt-3",
          timestamp: new Date().toISOString(),
          type: "test",
          severity: "critical",
          system: "DP-3",
          description: "Critical event",
        },
      ];

      render(<LiveDecisionMap events={mockEvents} />);

      expect(screen.getByText(/🟢 Normal/i)).toBeInTheDocument();
      expect(screen.getByText(/🟡 Degradação/i)).toBeInTheDocument();
      expect(screen.getByText(/🔴 Crítico/i)).toBeInTheDocument();
    });

    it("should display legend with severity levels", () => {
      const mockEvents: DPEvent[] = [
        {
          id: "evt-1",
          timestamp: new Date().toISOString(),
          type: "test",
          severity: "normal",
          system: "DP-1",
          description: "Test",
        },
      ];

      render(<LiveDecisionMap events={mockEvents} />);

      // Check for legend items
      expect(screen.getByText("Normal")).toBeInTheDocument();
      expect(screen.getByText("Degradação")).toBeInTheDocument();
      expect(screen.getByText("Crítico")).toBeInTheDocument();
    });
  });
};
