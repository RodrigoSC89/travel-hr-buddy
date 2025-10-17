import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SGSOTrendChart } from "@/components/sgso/SGSOTrendChart";

// Mock recharts
vi.mock("recharts", () => ({
  LineChart: vi.fn(({ children }) => <div data-testid="line-chart">{children}</div>),
  Line: vi.fn(() => <div />),
  XAxis: vi.fn(() => <div />),
  YAxis: vi.fn(() => <div />),
  CartesianGrid: vi.fn(() => <div />),
  Tooltip: vi.fn(() => <div />),
  Legend: vi.fn(() => <div />),
  ResponsiveContainer: vi.fn(({ children }) => <div>{children}</div>),
}));

describe("SGSOTrendChart", () => {
  it("should render the trend chart", () => {
    render(<SGSOTrendChart />);
    expect(screen.getByTestId("line-chart")).toBeDefined();
  });

  it("should render with custom data", () => {
    const customData = [
      { month: "Jan", critical: 1, high: 2, medium: 3, low: 4 },
      { month: "Feb", critical: 2, high: 3, medium: 4, low: 5 },
    ];
    render(<SGSOTrendChart data={customData} />);
    expect(screen.getByTestId("line-chart")).toBeDefined();
  });

  it("should render with default data when no data provided", () => {
    render(<SGSOTrendChart />);
    expect(screen.getByTestId("line-chart")).toBeDefined();
  });
});
