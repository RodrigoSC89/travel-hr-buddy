
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DPSyncDashboard from "@/components/dp/DPSyncDashboard";

// Mock the MQTT publisher module
vi.mock("@/lib/mqtt/publisher", () => ({
  publishEvent: vi.fn(),
  subscribeForecast: vi.fn((callback) => {
    setTimeout(() => {
      callback({
        wind: 15,
        wave: 2.5,
        temp: 22,
      });
    }, 0);
    return { end: vi.fn() };
  }),
}));

// Mock ONNX runtime
vi.mock("onnxruntime-web", () => ({
  InferenceSession: {
    create: vi.fn(() =>
      Promise.resolve({
        run: vi.fn(() =>
          Promise.resolve({
            result: {
              data: [0.35], // Mock risk prediction of 35%
            },
          })
        ),
      })
    ),
  },
  Tensor: vi.fn((type, data, dims) => ({ type, data, dims })),
}));

describe("DPSyncDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the synchronization title", () => {
    render(<DPSyncDashboard />);
    expect(screen.getByText(/Sincronização DP ↔ Forecast/)).toBeInTheDocument();
  });

  it("should display the force sync button", () => {
    render(<DPSyncDashboard />);
    expect(screen.getByText(/Forçar Sincronização/)).toBeInTheDocument();
  });

  it("should render the Brain icon", () => {
    const { container } = render(<DPSyncDashboard />);
    
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("should render within a card component", () => {
    const { container } = render(<DPSyncDashboard />);
    
    const card = container.querySelector("[class*=\"card\"]");
    expect(card).toBeTruthy();
  });

  it("should handle force sync button click", async () => {
    const { publishEvent } = await React.lazy(() => import(import("@/lib/mqtt/publisher")));
    render(<DPSyncDashboard />);
    
    const syncButton = screen.getByText(/Forçar Sincronização/);
    fireEvent.click(syncButton);
    
    expect(publishEvent).toHaveBeenCalledWith(
      "nautilus/dp/manual-sync",
      expect.objectContaining({
        timestamp: expect.any(String),
      })
    );
  });

  it("should display sync status message", () => {
    render(<DPSyncDashboard />);
    
    // Should display either "Sincronizando..." or "Última sync: <time>"
    expect(
      screen.getByText(/Sincronizando.../) || screen.getByText(/Última sync:/)
    ).toBeInTheDocument();
  });
};
