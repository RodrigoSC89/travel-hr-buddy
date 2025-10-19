import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import DPIntelligencePage from "@/pages/DPIntelligencePage";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock date-fns
vi.mock("date-fns", () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === "dd/MM/yyyy") {
      return "12/09/2025";
    }
    return "2025-09-12";
  }),
}));

const mockIncidents = [
  {
    id: "imca-2025-014",
    title: "Loss of Position Due to Gyro Drift",
    vessel: "DP Shuttle Tanker X",
    date: "2025-09-12",
    root_cause: "Sensor drift not compensated",
    class_dp: "DP Class 2",
    severity: "Crítico",
    gpt_analysis: null,
    updated_at: "2025-09-12T10:00:00Z",
  },
  {
    id: "imca-2025-009",
    title: "Thruster Control Software Failure",
    vessel: "DP DSV Subsea Alpha",
    date: "2025-08-05",
    root_cause: "Unexpected software reboot",
    class_dp: "DP Class 3",
    severity: "Alto",
    gpt_analysis: { result: "Análise completa do incidente..." },
    updated_at: "2025-08-05T10:00:00Z",
  },
];

describe("DPIntelligencePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title and table headers", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    (supabase.from as unknown).mockImplementation(mockFrom);

    render(<DPIntelligencePage />);

    expect(screen.getByText(/Centro de Inteligência DP/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText("Título")).toBeInTheDocument();
      expect(screen.getByText("Navio")).toBeInTheDocument();
      expect(screen.getByText("Data")).toBeInTheDocument();
      expect(screen.getByText("Severidade")).toBeInTheDocument();
      expect(screen.getByText("IA")).toBeInTheDocument();
      expect(screen.getByText("Ações")).toBeInTheDocument();
    });
  });

  it("fetches and displays incidents correctly", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockIncidents,
          error: null,
        }),
      }),
    });

    (supabase.from as unknown).mockImplementation(mockFrom);

    render(<DPIntelligencePage />);

    await waitFor(() => {
      expect(screen.getByText("Loss of Position Due to Gyro Drift")).toBeInTheDocument();
      expect(screen.getByText("DP Shuttle Tanker X")).toBeInTheDocument();
      expect(screen.getByText("Thruster Control Software Failure")).toBeInTheDocument();
      expect(screen.getByText("DP DSV Subsea Alpha")).toBeInTheDocument();
    });
  });

  it("shows \"Não analisado\" when no GPT analysis exists", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [mockIncidents[0]], // Only the first incident without analysis
          error: null,
        }),
      }),
    });

    (supabase.from as unknown).mockImplementation(mockFrom);

    render(<DPIntelligencePage />);

    await waitFor(() => {
      expect(screen.getByText("Não analisado")).toBeInTheDocument();
    });
  });

  it("has \"Explicar com IA\" button for each incident", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockIncidents,
          error: null,
        }),
      }),
    });

    (supabase.from as unknown).mockImplementation(mockFrom);

    render(<DPIntelligencePage />);

    await waitFor(() => {
      const buttons = screen.getAllByText("Explicar com IA");
      expect(buttons.length).toBe(2);
    });
  });

  it("calls explain API when button is clicked", async () => {
    const mockInvoke = vi.fn().mockResolvedValue({
      data: { result: "Análise de IA completa" },
      error: null,
    });

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const mockFrom = vi.fn().mockImplementation((table) => {
      if (table === "dp_incidents") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockIncidents[0]],
              error: null,
            }),
          }),
          update: mockUpdate,
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      };
    });

    (supabase.from as unknown).mockImplementation(mockFrom);
    (supabase.functions.invoke as unknown).mockImplementation(mockInvoke);

    render(<DPIntelligencePage />);

    await waitFor(() => {
      expect(screen.getByText("Loss of Position Due to Gyro Drift")).toBeInTheDocument();
    });

    const button = screen.getByText("Explicar com IA");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("dp-intel-analyze", {
        body: expect.objectContaining({
          incident: expect.objectContaining({
            id: "imca-2025-014",
          }),
        }),
      });
    });
  });

  it("formats dates correctly (dd/MM/yyyy)", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [mockIncidents[0]],
          error: null,
        }),
      }),
    });

    (supabase.from as unknown).mockImplementation(mockFrom);

    render(<DPIntelligencePage />);

    await waitFor(() => {
      expect(screen.getByText("12/09/2025")).toBeInTheDocument();
    });
  });

  it("displays \"-\" when no date provided", async () => {
    const incidentWithoutDate = {
      ...mockIncidents[0],
      date: null,
    };

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [incidentWithoutDate],
          error: null,
        }),
      }),
    });

    (supabase.from as unknown).mockImplementation(mockFrom);

    render(<DPIntelligencePage />);

    await waitFor(() => {
      const cells = screen.getAllByText("-");
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  it("disables button during analysis", async () => {
    const mockInvoke = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: { result: "Análise de IA completa" },
              error: null,
            });
          }, 100);
        })
    );

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const mockFrom = vi.fn().mockImplementation((table) => {
      if (table === "dp_incidents") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockIncidents[0]],
              error: null,
            }),
          }),
          update: mockUpdate,
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      };
    });

    (supabase.from as unknown).mockImplementation(mockFrom);
    (supabase.functions.invoke as unknown).mockImplementation(mockInvoke);

    render(<DPIntelligencePage />);

    await waitFor(() => {
      expect(screen.getByText("Loss of Position Due to Gyro Drift")).toBeInTheDocument();
    });

    const button = screen.getByText("Explicar com IA");
    fireEvent.click(button);

    // Button should be disabled during analysis
    await waitFor(() => {
      expect(screen.getByText("Analisando...")).toBeInTheDocument();
    });
  });
});
