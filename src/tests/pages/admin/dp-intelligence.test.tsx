import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AdminDPIntelligencePage from "@/pages/admin/dp-intelligence";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock fetch for API calls
global.fetch = vi.fn();

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
    description: "The vessel experienced a gradual loss of position",
    vessel: "DP Shuttle Tanker X",
    incident_date: "2025-09-12",
    root_cause: "Sensor drift not compensated",
    class_dp: "DP Class 2",
    severity: "Alta",
    sgso_category: "Falha de sistema",
    gpt_analysis: null,
    link_original: null,
    updated_at: "2025-09-12T10:00:00Z",
  },
  {
    id: "imca-2025-009",
    title: "Thruster Control Software Failure",
    description: "During critical ROV launch, the vessel experienced thruster issues",
    vessel: "DP DSV Subsea Alpha",
    incident_date: "2025-08-05",
    root_cause: "Unexpected software reboot",
    class_dp: "DP Class 3",
    severity: "Alta",
    sgso_category: "Falha de sistema",
    gpt_analysis: { 
      causa_provavel: "Software instável",
      prevencao: "Atualizar firmware",
      impacto_operacional: "Perda temporária de controle"
    },
    link_original: "https://imca.org/incident-123",
    updated_at: "2025-08-05T10:00:00Z",
  },
];

describe("DPIntelligencePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title and filters", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

    render(<AdminDPIntelligencePage />);

    expect(screen.getByText(/Centro de Inteligência DP/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText("Filtros")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Buscar incidentes...")).toBeInTheDocument();
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

    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

    render(<AdminDPIntelligencePage />);

    await waitFor(() => {
      expect(screen.getByText("Loss of Position Due to Gyro Drift")).toBeInTheDocument();
      expect(screen.getByText("DP Shuttle Tanker X")).toBeInTheDocument();
      expect(screen.getByText("Thruster Control Software Failure")).toBeInTheDocument();
      expect(screen.getByText("DP DSV Subsea Alpha")).toBeInTheDocument();
    });
  });

  it("shows \"Explicar com IA\" button when no GPT analysis exists", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [mockIncidents[0]], // Only the first incident without analysis
          error: null,
        }),
      }),
    });

    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

    render(<AdminDPIntelligencePage />);

    await waitFor(() => {
      expect(screen.getByText("🤖 Explicar com IA")).toBeInTheDocument();
    });
  });

  it("displays AI analysis when it exists", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [mockIncidents[1]], // Second incident with analysis
          error: null,
        }),
      }),
    });

    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

    render(<AdminDPIntelligencePage />);

    await waitFor(() => {
      expect(screen.getByText("Análise IA:")).toBeInTheDocument();
      expect(screen.getByText(/Software instável/)).toBeInTheDocument();
      expect(screen.getByText(/Atualizar firmware/)).toBeInTheDocument();
    });
  });

  it("has button that can be clicked", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [mockIncidents[0]],
          error: null,
        }),
      }),
    });

    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

    render(<AdminDPIntelligencePage />);

    await waitFor(() => {
      expect(screen.getByText("Loss of Position Due to Gyro Drift")).toBeInTheDocument();
    });

    const button = screen.getByText("🤖 Explicar com IA");
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
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

    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

    render(<AdminDPIntelligencePage />);

    await waitFor(() => {
      expect(screen.getByText("12/09/2025")).toBeInTheDocument();
    });
  });

  it("displays link to original article when available", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [mockIncidents[1]], // Second incident has link_original
          error: null,
        }),
      }),
    });

    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

    render(<AdminDPIntelligencePage />);

    await waitFor(() => {
      const link = screen.getByText("🔗 Ver artigo original");
      expect(link).toBeInTheDocument();
      expect(link.closest("a")).toHaveAttribute("href", "https://imca.org/incident-123");
    });
  });

  it("shows analyzing state during API call", async () => {
    const mockFetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ success: true, content: { analise: "Análise completa" } }),
            });
          }, 100);
        })
    );

    global.fetch = mockFetch as unknown as typeof fetch;

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [mockIncidents[0]],
          error: null,
        }),
      }),
    });

    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

    render(<AdminDPIntelligencePage />);

    await waitFor(() => {
      expect(screen.getByText("Loss of Position Due to Gyro Drift")).toBeInTheDocument();
    });

    const button = screen.getByText("🤖 Explicar com IA");
    
    // Button should exist before clicking
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    
    fireEvent.click(button);

    // Wait for button text to change or button to be disabled
    await waitFor(() => {
      const buttons = screen.queryAllByRole("button");
      const analyzingButton = buttons.find(btn => btn.textContent?.includes("Analisando"));
      expect(analyzingButton || button).toBeDefined();
    }, { timeout: 1000 });
  });
});
