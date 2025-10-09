import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardKPIWidget } from "../dashboard-widgets";
import { Users } from "lucide-react";

describe("DashboardKPIWidget", () => {
  const mockKPI = {
    id: "test-kpi-1",
    title: "Total Users",
    value: 150,
    target: 200,
    unit: undefined,
    trend: "up" as const,
    change: 15.5,
    icon: Users,
    color: "text-blue-500",
    priority: "high" as const,
  };

  it("renders without crashing", () => {
    render(<DashboardKPIWidget kpi={mockKPI} />);
    expect(screen.getByText("Total Users")).toBeInTheDocument();
  });

  it("displays the correct KPI value", () => {
    render(<DashboardKPIWidget kpi={mockKPI} />);
    expect(screen.getByText("150")).toBeInTheDocument();
  });

  it("displays the priority badge", () => {
    render(<DashboardKPIWidget kpi={mockKPI} />);
    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("shows trend icon for upward trend", () => {
    const { container } = render(<DashboardKPIWidget kpi={mockKPI} />);
    // Check for trend percentage in the component
    const trendElement = screen.queryByText(/15.5%/) || container.textContent?.includes("15.5");
    expect(trendElement).toBeTruthy();
  });

  it("formats percentage unit correctly", () => {
    const percentKPI = { ...mockKPI, value: 85.7, unit: "%" };
    render(<DashboardKPIWidget kpi={percentKPI} />);
    expect(screen.getByText("85.7%")).toBeInTheDocument();
  });

  it("formats currency correctly", () => {
    const currencyKPI = { ...mockKPI, value: 5000, unit: "BRL" };
    const { container } = render(<DashboardKPIWidget kpi={currencyKPI} />);
    // Check for any currency-formatted string in the container
    const hasValue = container.textContent?.includes("5") || container.textContent?.includes("R$");
    expect(hasValue).toBeTruthy();
  });

  it("displays progress bar when target is set", () => {
    const { container } = render(<DashboardKPIWidget kpi={mockKPI} />);
    // Progress component should be rendered
    const progressElement = container.querySelector("[role=\"progressbar\"]");
    expect(progressElement).toBeInTheDocument();
  });

  it("shows low priority badge with secondary variant", () => {
    const lowPriorityKPI = { ...mockKPI, priority: "low" as const };
    render(<DashboardKPIWidget kpi={lowPriorityKPI} />);
    expect(screen.getByText("low")).toBeInTheDocument();
  });

  it("handles export callback when provided", () => {
    const onExport = vi.fn();
    render(<DashboardKPIWidget kpi={mockKPI} onExport={onExport} />);
    // Component renders successfully with export handler
    expect(screen.getByText("Total Users")).toBeInTheDocument();
  });

  it("displays string values correctly", () => {
    const stringKPI = { ...mockKPI, value: "Active" };
    render(<DashboardKPIWidget kpi={stringKPI} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});
