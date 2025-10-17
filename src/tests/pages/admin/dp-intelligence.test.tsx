import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import DPIntelligencePage from "@/pages/admin/DPIntelligencePage";

// Mock fetch
global.fetch = vi.fn();

describe("DPIntelligencePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => [],
    });

    render(<DPIntelligencePage />);
    
    expect(screen.getByText("🧠 Centro de Inteligência DP")).toBeInTheDocument();
  });

  it("should render table headers", () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => [],
    });

    render(<DPIntelligencePage />);
    
    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(screen.getByText("Navio")).toBeInTheDocument();
    expect(screen.getByText("Data")).toBeInTheDocument();
    expect(screen.getByText("Severidade")).toBeInTheDocument();
    expect(screen.getByText("IA")).toBeInTheDocument();
    expect(screen.getByText("Ações")).toBeInTheDocument();
  });

  it("should fetch and display incidents", async () => {
    const mockIncidents = [
      {
        id: "test-1",
        title: "Test Incident",
        description: "Test description",
        vessel: "Test Vessel",
        incident_date: "2025-01-01",
        severity: "high",
        gpt_analysis: null,
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockIncidents,
    });

    render(<DPIntelligencePage />);

    await waitFor(() => {
      expect(screen.getByText("Test Incident")).toBeInTheDocument();
      expect(screen.getByText("Test Vessel")).toBeInTheDocument();
      expect(screen.getByText("high")).toBeInTheDocument();
    });
  });

  it("should display 'Não analisado' when no GPT analysis exists", async () => {
    const mockIncidents = [
      {
        id: "test-1",
        title: "Test Incident",
        description: "Test description",
        vessel: "Test Vessel",
        incident_date: "2025-01-01",
        severity: "high",
        gpt_analysis: null,
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockIncidents,
    });

    render(<DPIntelligencePage />);

    await waitFor(() => {
      expect(screen.getByText("Não analisado")).toBeInTheDocument();
    });
  });

  it("should have 'Explicar com IA' button for each incident", async () => {
    const mockIncidents = [
      {
        id: "test-1",
        title: "Test Incident",
        description: "Test description",
        vessel: "Test Vessel",
        incident_date: "2025-01-01",
        severity: "high",
        gpt_analysis: null,
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockIncidents,
    });

    render(<DPIntelligencePage />);

    await waitFor(() => {
      expect(screen.getByText("Explicar com IA")).toBeInTheDocument();
    });
  });

  it("should call explain API when button is clicked", async () => {
    const mockIncidents = [
      {
        id: "test-1",
        title: "Test Incident",
        description: "Test description",
        vessel: "Test Vessel",
        incident_date: "2025-01-01",
        severity: "high",
        gpt_analysis: null,
      },
    ];

    (global.fetch as any)
      .mockResolvedValueOnce({
        json: async () => mockIncidents,
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true }),
      })
      .mockResolvedValueOnce({
        json: async () => [
          {
            ...mockIncidents[0],
            gpt_analysis: "AI Analysis Result",
          },
        ],
      });

    render(<DPIntelligencePage />);

    await waitFor(() => {
      expect(screen.getByText("Explicar com IA")).toBeInTheDocument();
    });

    const button = screen.getByText("Explicar com IA");
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/dp-incidents/explain",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: "test-1" }),
        })
      );
    });
  });

  it("should format date correctly", async () => {
    const mockIncidents = [
      {
        id: "test-1",
        title: "Test Incident",
        description: "Test description",
        vessel: "Test Vessel",
        incident_date: "2025-10-17",
        severity: "high",
        gpt_analysis: null,
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockIncidents,
    });

    render(<DPIntelligencePage />);

    await waitFor(() => {
      expect(screen.getByText("17/10/2025")).toBeInTheDocument();
    });
  });

  it("should display '-' when no date is provided", async () => {
    const mockIncidents = [
      {
        id: "test-1",
        title: "Test Incident",
        description: "Test description",
        vessel: "Test Vessel",
        incident_date: null,
        severity: "high",
        gpt_analysis: null,
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockIncidents,
    });

    render(<DPIntelligencePage />);

    await waitFor(() => {
      // Check that there's a '-' in the date column
      const cells = screen.getAllByText("-");
      expect(cells.length).toBeGreaterThan(0);
    });
  });
});
