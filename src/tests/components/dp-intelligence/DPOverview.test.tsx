import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DPOverview from "@/modules/intelligence/dp-intelligence/components/DPOverview";

describe("DPOverview Component", () => {
  it("should render the operational summary title", () => {
    render(<DPOverview />);
    expect(screen.getByText("Resumo Operacional")).toBeInTheDocument();
  });

  it("should display all system metrics", () => {
    render(<DPOverview />);
    
    // Check all metrics are displayed
    expect(screen.getByText("Bus A")).toBeInTheDocument();
    expect(screen.getByText("Bus B")).toBeInTheDocument();
    expect(screen.getByText("Gyro Drift")).toBeInTheDocument();
    expect(screen.getByText("DP Confidence")).toBeInTheDocument();
  });

  it("should show correct status for each metric", () => {
    render(<DPOverview />);
    
    // Check statuses
    const okStatuses = screen.getAllByText("OK");
    expect(okStatuses).toHaveLength(2); // Bus A and Bus B
    expect(screen.getByText("0.02°/min")).toBeInTheDocument();
    expect(screen.getByText("98%")).toBeInTheDocument();
  });

  it("should render within a card component", () => {
    const { container } = render(<DPOverview />);
    
    // Check that the component renders inside a card
    const card = container.querySelector("[class*=\"card\"]");
    expect(card).toBeTruthy();
  });
});
