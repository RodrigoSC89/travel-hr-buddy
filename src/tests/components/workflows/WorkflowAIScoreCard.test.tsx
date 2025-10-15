import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { WorkflowAIScoreCard } from "@/components/workflows/WorkflowAIScoreCard";

// Mock the analytics function
vi.mock("@/lib/analytics/workflowAIMetrics", () => ({
  getWorkflowAISummary: vi.fn(),
}));

import { getWorkflowAISummary } from "@/lib/analytics/workflowAIMetrics";

describe("WorkflowAIScoreCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when summary is null", async () => {
    vi.mocked(getWorkflowAISummary).mockResolvedValue({
      total: 0,
      aceitas: 0,
      taxa: "0",
    });

    const { container } = render(<WorkflowAIScoreCard />);
    
    // Component returns null when summary is falsy
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it("renders AI score card with correct data", async () => {
    vi.mocked(getWorkflowAISummary).mockResolvedValue({
      total: 100,
      aceitas: 75,
      taxa: "75.0",
    });

    render(<WorkflowAIScoreCard />);

    await waitFor(() => {
      expect(screen.getByText("IA no Controle (Workflow)")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("75")).toBeInTheDocument();
      expect(screen.getByText("75.0%")).toBeInTheDocument();
    });
  });

  it("displays correct labels", async () => {
    vi.mocked(getWorkflowAISummary).mockResolvedValue({
      total: 50,
      aceitas: 30,
      taxa: "60.0",
    });

    render(<WorkflowAIScoreCard />);

    await waitFor(() => {
      expect(screen.getByText("Sugestões geradas:")).toBeInTheDocument();
      expect(screen.getByText("Aceitas pelos usuários:")).toBeInTheDocument();
      expect(screen.getByText("Adoção da IA:")).toBeInTheDocument();
    });
  });

  it("handles zero adoption rate", async () => {
    vi.mocked(getWorkflowAISummary).mockResolvedValue({
      total: 10,
      aceitas: 0,
      taxa: "0",
    });

    render(<WorkflowAIScoreCard />);

    await waitFor(() => {
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("0%")).toBeInTheDocument();
    });
  });

  it("handles 100% adoption rate", async () => {
    vi.mocked(getWorkflowAISummary).mockResolvedValue({
      total: 25,
      aceitas: 25,
      taxa: "100.0",
    });

    render(<WorkflowAIScoreCard />);

    await waitFor(() => {
      expect(screen.getAllByText("25")).toHaveLength(2);
      expect(screen.getByText("100.0%")).toBeInTheDocument();
    });
  });
});
