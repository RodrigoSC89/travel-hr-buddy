import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import JobsTrendChart from "@/components/bi/JobsTrendChart";

describe("JobsTrendChart Component", () => {
  const mockTrendData = [
    { month: "Mai", total_jobs: 23 },
    { month: "Jun", total_jobs: 28 },
    { month: "Jul", total_jobs: 31 },
  ];

  it("should render the chart title", () => {
    render(<JobsTrendChart data={mockTrendData} />);
    expect(screen.getByText(/Tendência de Jobs/i)).toBeDefined();
  });

  it("should show loading skeleton when loading prop is true", () => {
    const { container } = render(<JobsTrendChart data={[]} loading={true} />);
    const skeleton = container.querySelector('.h-64');
    expect(skeleton).toBeDefined();
  });

  it("should render the component without errors", () => {
    const { container } = render(<JobsTrendChart data={mockTrendData} />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });

  it("should display no data message when data is empty", () => {
    render(<JobsTrendChart data={[]} />);
    expect(screen.getByText(/Nenhum dado disponível/i)).toBeDefined();
  });

  it("should render chart when data is provided", () => {
    const { container } = render(<JobsTrendChart data={mockTrendData} />);
    // Check if the chart container is rendered
    expect(container.querySelector('.recharts-wrapper')).toBeDefined();
  });
});
