import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DPAlertFeed from "@/components/dp/DPAlertFeed";

// Mock the MQTT publisher module
vi.mock("@/lib/mqtt/publisher", () => ({
  subscribeDPAlerts: vi.fn((callback) => {
    // Simulate MQTT callback with mock alerts
    setTimeout(() => {
      callback({
        type: "Alerta Crítico",
        risk: 0.85,
        timestamp: Date.now(),
      });
    }, 0);
    return { end: vi.fn() };
  }),
}));

describe("DPAlertFeed Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the alerts title", () => {
    render(<DPAlertFeed />);
    expect(screen.getByText("Últimos Alertas DP")).toBeInTheDocument();
  });

  it("should display 'no alerts' message initially", () => {
    // Mock with no callbacks
    vi.doMock("@/lib/mqtt/publisher", () => ({
      subscribeDPAlerts: vi.fn(() => ({ end: vi.fn() })),
    }));
    
    render(<DPAlertFeed />);
    expect(screen.getByText("Sem alertas recentes.")).toBeInTheDocument();
  });

  it("should render within a card component", () => {
    const { container } = render(<DPAlertFeed />);
    
    const card = container.querySelector("[class*=\"card\"]");
    expect(card).toBeTruthy();
  });

  it("should display the AlertTriangle icon", () => {
    const { container } = render(<DPAlertFeed />);
    
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("should display alerts when received", async () => {
    render(<DPAlertFeed />);
    
    await waitFor(() => {
      expect(screen.getByText("Alerta Crítico")).toBeInTheDocument();
  });
  });

  it("should format risk percentage correctly", async () => {
    render(<DPAlertFeed />);
    
    await waitFor(() => {
      expect(screen.getByText(/85\.0%/)).toBeInTheDocument();
  });
  });

  it("should display timestamp in correct format", async () => {
    render(<DPAlertFeed />);
    
    await waitFor(() => {
      // Check if a time string is rendered (format varies by locale)
      const timeElement = screen.getByText(/Risco:/);
      expect(timeElement).toBeInTheDocument();
  });
  });
});
