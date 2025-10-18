import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PlanStatusSelect } from "@/components/dp/PlanStatusSelect";

// Mock fetch
global.fetch = vi.fn();

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("PlanStatusSelect Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with initial status", () => {
    const incident = {
      id: "test-1",
      plan_status: "pendente",
    };

    render(<PlanStatusSelect incident={incident} />);
    
    const select = screen.getByRole("combobox");
    expect(select).toBeDefined();
    expect((select as HTMLSelectElement).value).toBe("pendente");
  });

  it("should display all status options", () => {
    const incident = {
      id: "test-1",
      plan_status: "pendente",
    };

    render(<PlanStatusSelect incident={incident} />);
    
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent("Pendente");
    expect(options[1]).toHaveTextContent("Em andamento");
    expect(options[2]).toHaveTextContent("Concluído");
  });

  it("should show updated date when available", () => {
    const incident = {
      id: "test-1",
      plan_status: "em andamento",
      plan_updated_at: "2025-10-17T19:00:00Z",
    };

    render(<PlanStatusSelect incident={incident} />);
    
    expect(screen.getByText(/Atualizado em/i)).toBeDefined();
  });

  it("should call API when status changes", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, message: "Status atualizado com sucesso." }),
    } as Response);

    const incident = {
      id: "test-1",
      plan_status: "pendente",
    };

    render(<PlanStatusSelect incident={incident} />);
    
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "em andamento" } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/dp-incidents/update-status",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: "test-1", status: "em andamento" }),
        })
      );
    });
  });

  it("should call onUpdate callback when provided", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, message: "Status atualizado com sucesso." }),
    } as Response);

    const onUpdate = vi.fn();
    const incident = {
      id: "test-1",
      plan_status: "pendente",
    };

    render(<PlanStatusSelect incident={incident} onUpdate={onUpdate} />);
    
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "concluído" } });

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith("concluído");
    });
  });

  it("should disable select while loading", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const incident = {
      id: "test-1",
      plan_status: "pendente",
    };

    render(<PlanStatusSelect incident={incident} />);
    
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "em andamento" } });

    await waitFor(() => {
      expect(select.disabled).toBe(true);
    });
  });
});
