import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PlanStatusSelect } from "@/components/dp-incidents/PlanStatusSelect";
import * as sonner from "sonner";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe("PlanStatusSelect", () => {
  const mockIncident = {
    id: "test-incident-1",
    title: "Test Incident",
    date: "2025-01-01",
    vessel: "Test Vessel",
    location: "Test Location",
    classDP: "DP-2",
    rootCause: "Test cause",
    tags: ["test"],
    summary: "Test summary",
    link: "https://test.com",
    plan_status: "pendente",
    plan_updated_at: "2025-01-15T10:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with initial status", () => {
    render(<PlanStatusSelect incident={mockIncident} />);
    
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("pendente");
    expect(screen.getByText("Status do Plano")).toBeInTheDocument();
  });

  it("should display all status options", () => {
    render(<PlanStatusSelect incident={mockIncident} />);
    
    const select = screen.getByRole("combobox");
    const options = select.querySelectorAll("option");
    
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent("Pendente");
    expect(options[1]).toHaveTextContent("Em andamento");
    expect(options[2]).toHaveTextContent("Concluído");
  });

  it("should display updated date when available", () => {
    render(<PlanStatusSelect incident={mockIncident} />);
    
    expect(screen.getByText(/Atualizado em/)).toBeInTheDocument();
  });

  it("should not display updated date when not available", () => {
    const incidentWithoutDate = { ...mockIncident, plan_updated_at: undefined };
    render(<PlanStatusSelect incident={incidentWithoutDate} />);
    
    expect(screen.queryByText(/Atualizado em/)).not.toBeInTheDocument();
  });

  it("should call API when status changes", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(<PlanStatusSelect incident={mockIncident} />);
    
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "em andamento" } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/dp-incidents/update-status",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: "test-incident-1", status: "em andamento" }),
        })
      );
    });
  });

  it("should show success toast on successful update", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(<PlanStatusSelect incident={mockIncident} />);
    
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "concluído" } });

    await waitFor(() => {
      expect(sonner.toast.success).toHaveBeenCalledWith("Status atualizado com sucesso");
    });
  });

  it("should show error toast on failed update", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Erro ao atualizar" }),
    });

    render(<PlanStatusSelect incident={mockIncident} />);
    
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "concluído" } });

    await waitFor(() => {
      expect(sonner.toast.error).toHaveBeenCalledWith("Erro ao atualizar");
    });
  });

  it("should revert status on error", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Erro ao atualizar" }),
    });

    render(<PlanStatusSelect incident={mockIncident} />);
    
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "concluído" } });

    await waitFor(() => {
      expect(select).toHaveValue("pendente");
    });
  });

  it("should disable select while loading", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<PlanStatusSelect incident={mockIncident} />);
    
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "concluído" } });

    // Select should be disabled immediately after change
    expect(select).toBeDisabled();
  });

  it("should call onStatusUpdate callback when provided", async () => {
    const onStatusUpdate = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(<PlanStatusSelect incident={mockIncident} onStatusUpdate={onStatusUpdate} />);
    
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "em andamento" } });

    await waitFor(() => {
      expect(onStatusUpdate).toHaveBeenCalledWith("em andamento");
    });
  });
});
