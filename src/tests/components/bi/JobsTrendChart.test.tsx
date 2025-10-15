import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import JobsTrendChart from "@/components/bi/JobsTrendChart";

describe("JobsTrendChart Component", () => {
  const mockData = [
    { date: "Jan", count: 12 },
    { date: "Fev", count: 15 },
    { date: "Mar", count: 18 },
  ];

  it("should render the chart title", () => {
    render(<JobsTrendChart data={mockData} />);
    expect(screen.getByText(/Tendência de Jobs/i)).toBeDefined();
  });

  it("should render the component without errors", () => {
    const { container } = render(<JobsTrendChart data={mockData} />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });

  it("should render with empty data", () => {
    const { container } = render(<JobsTrendChart data={[]} />);
    expect(container).toBeDefined();
  });
});
