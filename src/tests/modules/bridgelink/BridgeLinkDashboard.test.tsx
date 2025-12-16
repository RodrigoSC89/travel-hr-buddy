import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import BridgeLinkDashboard from "@/modules/control/bridgelink/BridgeLinkDashboard";
import * as bridgeLinkApi from "@/modules/control/bridgelink/services/bridge-link-api";

// Mock Chart.js components
vi.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="mock-chart">Chart</div>,
}));

// Mock the API module
vi.mock("@/modules/control/bridgelink/services/bridge-link-api", () => ({
  getBridgeLinkData: vi.fn(),
  connectToLiveStream: vi.fn(() => vi.fn()),
  exportReportJSON: vi.fn(),
}));

describe("BridgeLinkDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the dashboard title", async () => {
    vi.mocked(bridgeLinkApi.getBridgeLinkData).mockResolvedValue({
      dpEvents: [],
      riskAlerts: [],
      status: "Normal",
    });

    render(<BridgeLinkDashboard />);

    expect(screen.getByText(/🧭 BridgeLink — Painel Integrado/i)).toBeInTheDocument();
  });

  it("should display loading state initially", async () => {
    vi.mocked(bridgeLinkApi.getBridgeLinkData).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<BridgeLinkDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Carregando dados do BridgeLink/i)).toBeInTheDocument();
    });
  });

  it("should render dashboard components when data is loaded", async () => {
    const mockData = {
      dpEvents: [
        {
          id: "evt-1",
          timestamp: new Date().toISOString(),
          type: "position",
          severity: "normal" as const,
          system: "DP-2",
          description: "Test event",
        },
      ],
      riskAlerts: [
        {
          id: "alert-1",
          level: "medium" as const,
          title: "Test Alert",
          description: "Test description",
          timestamp: new Date().toISOString(),
          source: "DP System",
        },
      ],
      status: "Normal",
    };

    vi.mocked(bridgeLinkApi.getBridgeLinkData).mockResolvedValue(mockData);

    render(<BridgeLinkDashboard />);

    await waitFor(() => {
      expect(screen.getAllByText(/Status do Sistema DP/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Alertas de Risco/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Mapa de Decisão Contextual/i).length).toBeGreaterThan(0);
    });
  });

  it("should display event and alert counts", async () => {
    const mockData = {
      dpEvents: [
        {
          id: "evt-1",
          timestamp: new Date().toISOString(),
          type: "position",
          severity: "normal" as const,
          system: "DP-2",
          description: "Event 1",
        },
        {
          id: "evt-2",
          timestamp: new Date().toISOString(),
          type: "thruster",
          severity: "critical" as const,
          system: "DP-3",
          description: "Event 2",
        },
      ],
      riskAlerts: [
        {
          id: "alert-1",
          level: "high" as const,
          title: "Alert 1",
          description: "Description 1",
          timestamp: new Date().toISOString(),
          source: "System A",
        },
      ],
      status: "Degradation",
    };

    vi.mocked(bridgeLinkApi.getBridgeLinkData).mockResolvedValue(mockData);

    render(<BridgeLinkDashboard />);

    await waitFor(() => {
      // Check for the integration stats section
      const eventCount = screen.getAllByText("2");
      const alertCount = screen.getAllByText("1");
      expect(eventCount.length).toBeGreaterThan(0);
      expect(alertCount.length).toBeGreaterThan(0);
    });
  });

  it("should handle errors gracefully", async () => {
    vi.mocked(bridgeLinkApi.getBridgeLinkData).mockRejectedValue(
      new Error("Network error")
    );

    render(<BridgeLinkDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar dados/i)).toBeInTheDocument();
    });
  });

  it("should render integration information", async () => {
    vi.mocked(bridgeLinkApi.getBridgeLinkData).mockResolvedValue({
      dpEvents: [],
      riskAlerts: [],
      status: "Normal",
    });

    render(<BridgeLinkDashboard />);

    await waitFor(() => {
      expect(screen.getAllByText(/Integrações Ativas/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/DP Intelligence Center/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/SGSO Logs/i).length).toBeGreaterThan(0);
    });
  });
});
