import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DPStatusBoard from "@/components/dp/DPStatusBoard";

// Mock the MQTT publisher module
vi.mock("@/lib/mqtt/publisher", () => ({
  subscribeBridgeStatus: vi.fn((callback) => {
    // Simulate MQTT callback with mock data
    setTimeout(() => {
      callback({
        dp: {
          position: "N 10° 30.000' W 020° 15.500'",
          status: "OK",
          integrity: 98,
        },
      });
    }, 0);
    return { end: vi.fn() };
  }),
}));

describe("DPStatusBoard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the DP system status title", () => {
    render(<DPStatusBoard />);
    expect(screen.getByText("Estado do Sistema DP")).toBeInTheDocument();
  });

  it("should display all metric labels", () => {
    render(<DPStatusBoard />);
    
    expect(screen.getByText("Posição Atual")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Integridade")).toBeInTheDocument();
  });

  it("should render within a card component", () => {
    const { container } = render(<DPStatusBoard />);
    
    const card = container.querySelector("[class*=\"card\"]");
    expect(card).toBeTruthy();
  });

  it("should display the anchor icon", () => {
    const { container } = render(<DPStatusBoard />);
    
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("should have grid layout for metrics", () => {
    const { container } = render(<DPStatusBoard />);
    
    const gridContainer = container.querySelector(".grid.grid-cols-3");
    expect(gridContainer).toBeTruthy();
  });
};
