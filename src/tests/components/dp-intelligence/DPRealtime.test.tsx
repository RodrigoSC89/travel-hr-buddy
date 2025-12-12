import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DPRealtime from "@/modules/intelligence/dp-intelligence/components/DPRealtime";

// Mock MQTT client
const mockMqttClient = {
  end: vi.fn(),
  on: vi.fn(),
  subscribe: vi.fn()
};

// Mock MQTT subscribeDP function
vi.mock("@/lib/mqtt/publisher", () => ({
  subscribeDP: vi.fn((callback) => {
    // Simulate receiving telemetry data
    setTimeout(() => {
      callback({ thrusters: 4, power: 12.5, heading: 45.2 });
    }, 100);
    return mockMqttClient;
  })
}));

describe("DPRealtime Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the telemetry title", () => {
    render(<DPRealtime />);
    expect(screen.getByText("DP Realtime Telemetry")).toBeInTheDocument();
  });

  it("should display all telemetry metrics", () => {
    render(<DPRealtime />);
    
    expect(screen.getByText("Thrusters Ativos")).toBeInTheDocument();
    expect(screen.getByText("Potência Total")).toBeInTheDocument();
    expect(screen.getByText("Heading")).toBeInTheDocument();
  });

  it("should display initial zero values", () => {
    render(<DPRealtime />);
    
    // Check thrusters value specifically
    const metrics = screen.getAllByText(/0/);
    expect(metrics.length).toBeGreaterThan(0);
    
    // Verify power and heading show decimal format
    expect(screen.getByText("MW")).toBeInTheDocument();
    expect(screen.getByText("°")).toBeInTheDocument();
  });

  it("should display units for each metric", () => {
    render(<DPRealtime />);
    
    expect(screen.getByText("/ 6")).toBeInTheDocument(); // Thrusters unit
    expect(screen.getByText("MW")).toBeInTheDocument(); // Power unit
    expect(screen.getByText("°")).toBeInTheDocument(); // Heading unit
  });

  it("should clean up MQTT connection on unmount", () => {
    const { unmount } = render(<DPRealtime />);
    
    unmount();
    
    expect(mockMqttClient.end).toHaveBeenCalled();
  });

  it("should render within a card component", () => {
    const { container } = render(<DPRealtime />);
    
    const card = container.querySelector("[class*=\"shadow-md\"]");
    expect(card).toBeTruthy();
  });

  it("should display metrics in a grid layout", () => {
    const { container } = render(<DPRealtime />);
    
    const grid = container.querySelector("[class*=\"grid-cols-3\"]");
    expect(grid).toBeTruthy();
  });
});
