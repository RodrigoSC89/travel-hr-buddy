import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompliancePanel } from "@/components/admin/ConformidadePanel";

describe("CompliancePanel", () => {
  const mockData = [
    {
      vessel: "Navio Alpha",
      norms: [
        { name: "IMCA", score: 85 },
        { name: "IBAMA", score: 92 },
        { name: "MTS", score: 78 },
        { name: "PEO-DP", score: 88 }
      ]
    },
    {
      vessel: "Navio Beta",
      norms: [
        { name: "IMCA", score: 91 },
        { name: "IBAMA", score: 87 }
      ]
    }
  ];

  it("should render the panel title", () => {
    render(<CompliancePanel data={mockData} />);
    expect(screen.getByText(/Conformidade Normativa/i)).toBeDefined();
  });

  it("should render vessel names", () => {
    render(<CompliancePanel data={mockData} />);
    expect(screen.getByText("Navio Alpha")).toBeDefined();
    expect(screen.getByText("Navio Beta")).toBeDefined();
  });

  it("should render norm names and scores", () => {
    render(<CompliancePanel data={mockData} />);
    expect(screen.getAllByText("IMCA").length).toBeGreaterThan(0);
    expect(screen.getAllByText("IBAMA").length).toBeGreaterThan(0);
    expect(screen.getByText("MTS")).toBeDefined();
    expect(screen.getByText("PEO-DP")).toBeDefined();
    expect(screen.getByText("85%")).toBeDefined();
    expect(screen.getByText("92%")).toBeDefined();
  });

  it("should apply green color for scores >= 80", () => {
    const { container } = render(<CompliancePanel data={mockData} />);
    const score85 = screen.getByText("85%");
    const score92 = screen.getByText("92%");
    
    expect(score85.className).toContain("text-green-600");
    expect(score92.className).toContain("text-green-600");
  });

  it("should apply red color for scores < 80", () => {
    const { container } = render(<CompliancePanel data={mockData} />);
    const score78 = screen.getByText("78%");
    
    expect(score78.className).toContain("text-red-500");
  });

  it("should render empty when no data provided", () => {
    render(<CompliancePanel data={[]} />);
    expect(screen.getByText(/Conformidade Normativa/i)).toBeDefined();
  });
});
