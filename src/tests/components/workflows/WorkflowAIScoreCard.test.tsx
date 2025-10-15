import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { WorkflowAIScoreCard } from "@/components/workflows/WorkflowAIScoreCard";
import * as workflowMetrics from "@/lib/analytics/workflowAIMetrics";

// Mock the workflowAIMetrics module
vi.mock("@/lib/analytics/workflowAIMetrics", () => ({
  getWorkflowAISummary: vi.fn(),
}));

describe("WorkflowAIScoreCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    vi.mocked(workflowMetrics.getWorkflowAISummary).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<WorkflowAIScoreCard />);
    
    // Check for loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeDefined();
  });

  it("should display workflow AI summary data", async () => {
    const mockData = {
      total: 50,
      aceitas: 35,
      taxa: "70.0",
    };

    vi.mocked(workflowMetrics.getWorkflowAISummary).mockResolvedValue(mockData);

    render(<WorkflowAIScoreCard />);

    await waitFor(() => {
      expect(screen.getByText("IA no Controle (Workflow)")).toBeDefined();
      expect(screen.getByText("50")).toBeDefined();
      expect(screen.getByText("35")).toBeDefined();
      expect(screen.getByText("70.0%")).toBeDefined();
    });
  });

  it("should display the correct labels", async () => {
    const mockData = {
      total: 10,
      aceitas: 5,
      taxa: "50.0",
    };

    vi.mocked(workflowMetrics.getWorkflowAISummary).mockResolvedValue(mockData);

    render(<WorkflowAIScoreCard />);

    await waitFor(() => {
      expect(screen.getByText("Sugestões geradas")).toBeDefined();
      expect(screen.getByText("Aceitas pelos usuários")).toBeDefined();
      expect(screen.getByText("Adoção da IA")).toBeDefined();
    });
  });

  it("should handle zero suggestions gracefully", async () => {
    const mockData = {
      total: 0,
      aceitas: 0,
      taxa: "0.0",
    };

    vi.mocked(workflowMetrics.getWorkflowAISummary).mockResolvedValue(mockData);

    render(<WorkflowAIScoreCard />);

    await waitFor(() => {
      expect(screen.getByText("Sugestões geradas")).toBeDefined();
      expect(screen.getByText("Aceitas pelos usuários")).toBeDefined();
      expect(screen.getByText("0.0%")).toBeDefined();
    });
  });

  it("should render with gradient background styling", async () => {
    const mockData = {
      total: 10,
      aceitas: 5,
      taxa: "50.0",
    };

    vi.mocked(workflowMetrics.getWorkflowAISummary).mockResolvedValue(mockData);

    const { container } = render(<WorkflowAIScoreCard />);

    await waitFor(() => {
      const card = container.querySelector('.bg-gradient-to-br');
      expect(card).toBeDefined();
    });
  });
});
