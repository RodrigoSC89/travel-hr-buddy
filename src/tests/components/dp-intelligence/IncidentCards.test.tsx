import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { IncidentCards } from "@/components/dp-intelligence/IncidentCards";

describe("IncidentCards", () => {
  const mockIncidents = [
    {
      id: "test-001",
      title: "Test Drive Off Incident",
      date: "2025-01-15",
      vessel: "Test Vessel",
      location: "Test Location",
      root_cause: "Test root cause",
      class_dp: "DP-2",
      source: "IMCA M190",
      link: "https://example.com",
      summary: "Test summary for the incident",
      tags: ["drive-off", "position-reference"],
    },
  ];

  const mockOnAnalyzeClick = vi.fn();
  const mockOnViewReport = vi.fn();

  it("renders incident cards correctly", () => {
    render(
      <IncidentCards
        incidents={mockIncidents}
        onAnalyzeClick={mockOnAnalyzeClick}
        onViewReport={mockOnViewReport}
      />
    );

    expect(screen.getByText("Test Drive Off Incident")).toBeInTheDocument();
    expect(screen.getByText("DP-2")).toBeInTheDocument();
    expect(screen.getByText("IMCA M190")).toBeInTheDocument();
    expect(screen.getByText("Test Vessel")).toBeInTheDocument();
  });

  it("displays tags correctly", () => {
    render(
      <IncidentCards
        incidents={mockIncidents}
        onAnalyzeClick={mockOnAnalyzeClick}
        onViewReport={mockOnViewReport}
      />
    );

    expect(screen.getByText("drive-off")).toBeInTheDocument();
    expect(screen.getByText("position-reference")).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    render(
      <IncidentCards
        incidents={mockIncidents}
        onAnalyzeClick={mockOnAnalyzeClick}
        onViewReport={mockOnViewReport}
      />
    );

    expect(screen.getByText("Ver Relatório")).toBeInTheDocument();
    expect(screen.getByText("Analisar com IA")).toBeInTheDocument();
  });

  it("handles empty incidents array", () => {
    const { container } = render(
      <IncidentCards
        incidents={[]}
        onAnalyzeClick={mockOnAnalyzeClick}
        onViewReport={mockOnViewReport}
      />
    );

    // Should render empty grid
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid?.children.length).toBe(0);
  });
});
