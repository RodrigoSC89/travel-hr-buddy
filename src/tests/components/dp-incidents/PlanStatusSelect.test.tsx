import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlanStatusSelect } from "@/components/dp-incidents/PlanStatusSelect";

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe("PlanStatusSelect Component", () => {
  const mockIncident = {
    id: "test-incident-1",
    plan_status: "pendente",
    plan_updated_at: "2025-10-18T14:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with initial status", () => {
    render(<PlanStatusSelect incident={mockIncident} />);
    
    expect(screen.getByText(/Status do Plano/i)).toBeInTheDocument();
    expect(screen.getByText(/🕒 Pendente/i)).toBeInTheDocument();
  });

  it("should render combobox with correct role", () => {
    render(<PlanStatusSelect incident={mockIncident} />);
    
    const combobox = screen.getByRole("combobox");
    expect(combobox).toBeInTheDocument();
    expect(combobox).not.toBeDisabled();
  });

  it("should display updated timestamp when available", () => {
    render(<PlanStatusSelect incident={mockIncident} />);
    
    // Check if the timestamp is displayed
    expect(screen.getByText(/Atualizado em/i)).toBeInTheDocument();
    expect(screen.getByText(/18\/10\/2025/i)).toBeInTheDocument();
  });

  it("should not display timestamp when not available", () => {
    const incidentWithoutTimestamp = {
      id: "test-incident-2",
      plan_status: "pendente",
    };
    
    render(<PlanStatusSelect incident={incidentWithoutTimestamp} />);
    
    // Check that timestamp is not displayed
    expect(screen.queryByText(/Atualizado em/i)).not.toBeInTheDocument();
  });

  it("should render with different initial status", () => {
    const incidentInProgress = {
      ...mockIncident,
      plan_status: "em andamento",
    };
    
    render(<PlanStatusSelect incident={incidentInProgress} />);
    
    expect(screen.getByText(/🔄 Em andamento/i)).toBeInTheDocument();
  });

  it("should render with completed status", () => {
    const incidentCompleted = {
      ...mockIncident,
      plan_status: "concluído",
    };
    
    render(<PlanStatusSelect incident={incidentCompleted} />);
    
    expect(screen.getByText(/✅ Concluído/i)).toBeInTheDocument();
  });

  it("should have proper label association", () => {
    render(<PlanStatusSelect incident={mockIncident} />);
    
    const label = screen.getByText(/Status do Plano/i);
    const combobox = screen.getByRole("combobox");
    
    expect(label).toHaveAttribute("for", "plan-status");
    expect(combobox).toHaveAttribute("id", "plan-status");
  });
});
