import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import DPIntelligenceCenter from "@/components/dp-intelligence/dp-intelligence-center";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe("DPIntelligenceCenter Component", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock fetch to simulate API failure (will use demo data)
    global.fetch = vi.fn(() =>
      Promise.reject(new Error("API not available"))
    ) as any;
  });

  describe("Component Rendering", () => {
    it("should render statistics dashboard with correct metrics", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        // Check for statistics cards
        expect(screen.getByText("Total de Incidentes")).toBeInTheDocument();
        expect(screen.getAllByText("Analisados").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Pendentes").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Críticos").length).toBeGreaterThan(0);
      });
    });

    it("should render search input", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Buscar por título, embarcação, local ou tags/i);
        expect(searchInput).toBeInTheDocument();
      });
    });

    it("should render DP class filter buttons", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getByText("DP-1")).toBeInTheDocument();
        expect(screen.getByText("DP-2")).toBeInTheDocument();
        expect(screen.getByText("DP-3")).toBeInTheDocument();
      });
    });

    it("should display loading state initially", () => {
      render(<DPIntelligenceCenter />);
      
      expect(screen.getByText("Carregando incidentes...")).toBeInTheDocument();
    });
  });

  describe("Data Loading", () => {
    it("should load and display demo incidents", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getByText(/Loss of Position Due to Gyro Drift/i)).toBeInTheDocument();
        expect(screen.getByText(/Thruster Control Software Failure/i)).toBeInTheDocument();
      });
    });

    it("should display incident details correctly", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        // Check for vessel information
        expect(screen.getByText(/DP Shuttle Tanker X/i)).toBeInTheDocument();
        expect(screen.getByText(/DP DSV Subsea Alpha/i)).toBeInTheDocument();
        
        // Check for location
        expect(screen.getByText(/Campos Basin/i)).toBeInTheDocument();
        expect(screen.getByText(/North Sea/i)).toBeInTheDocument();
      });
    });

    it("should calculate statistics correctly", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        // Total should be 4 (demo data has 4 incidents)
        const totalCards = screen.getAllByText(/^4$/);
        expect(totalCards.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Filtering Functionality", () => {
    it("should filter incidents by search query", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getByText(/Loss of Position Due to Gyro Drift/i)).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/Buscar por título, embarcação, local ou tags/i);
      fireEvent.change(searchInput, { target: { value: "gyro" } });
      
      await waitFor(() => {
        // Should still show the gyro incident
        expect(screen.getByText(/Loss of Position Due to Gyro Drift/i)).toBeInTheDocument();
      });
    });

    it("should filter by DP class when button is clicked", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getByText(/Loss of Position Due to Gyro Drift/i)).toBeInTheDocument();
      });
      
      const dp3Button = screen.getByText("DP-3");
      fireEvent.click(dp3Button);
      
      await waitFor(() => {
        // Should show DP-3 incidents
        expect(screen.getByText(/Thruster Control Software Failure/i)).toBeInTheDocument();
      });
    });

    it("should display filter count when filters are applied", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getByText(/Loss of Position Due to Gyro Drift/i)).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/Buscar por título, embarcação, local ou tags/i);
      fireEvent.change(searchInput, { target: { value: "gyro" } });
      
      await waitFor(() => {
        expect(screen.getByText(/Mostrando.*de.*incidentes/i)).toBeInTheDocument();
      });
    });

    it("should show clear filter button when filters are active", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getByText(/Loss of Position Due to Gyro Drift/i)).toBeInTheDocument();
      });
      
      const dp2Button = screen.getByText("DP-2");
      fireEvent.click(dp2Button);
      
      await waitFor(() => {
        expect(screen.getByText(/Limpar/i)).toBeInTheDocument();
      });
    });

    it("should clear filters when clear button is clicked", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getByText(/Loss of Position Due to Gyro Drift/i)).toBeInTheDocument();
      });
      
      const dp2Button = screen.getByText("DP-2");
      fireEvent.click(dp2Button);
      
      await waitFor(() => {
        expect(screen.getByText(/Limpar/i)).toBeInTheDocument();
      });
      
      const clearButton = screen.getByText(/Limpar/i);
      fireEvent.click(clearButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/Limpar/i)).not.toBeInTheDocument();
      });
    });

    it("should filter by status (analyzed/pending)", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getByText(/Loss of Position Due to Gyro Drift/i)).toBeInTheDocument();
      });
      
      const analyzedElements = screen.getAllByText("Analisados");
      const analyzedCard = analyzedElements[0].closest("div")?.parentElement;
      if (analyzedCard) {
        fireEvent.click(analyzedCard);
        
        await waitFor(() => {
          // Should show status filter in the count message
          expect(screen.getAllByText(/Analisados/i).length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe("Incident Cards", () => {
    it("should display severity badges", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getAllByText("critical").length).toBeGreaterThan(0);
        expect(screen.getAllByText("high").length).toBeGreaterThan(0);
      });
    });

    it("should display status badges", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getAllByText("Analisado").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Pendente").length).toBeGreaterThan(0);
      });
    });

    it("should display tags as badges", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getByText("gyro")).toBeInTheDocument();
        expect(screen.getByText("thruster")).toBeInTheDocument();
        expect(screen.getByText("pms")).toBeInTheDocument();
      });
    });

    it("should have Relatório button for each incident", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        const relatorioButtons = screen.getAllByText(/Relatório/i);
        expect(relatorioButtons.length).toBeGreaterThan(0);
      });
    });

    it("should have Analisar IA button for each incident", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        const analyzeButtons = screen.getAllByText(/Analisar IA/i);
        expect(analyzeButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no incidents match filters", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getByText(/Loss of Position Due to Gyro Drift/i)).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/Buscar por título, embarcação, local ou tags/i);
      fireEvent.change(searchInput, { target: { value: "nonexistent-search-term-xyz" } });
      
      await waitFor(() => {
        expect(screen.getByText("Nenhum incidente encontrado")).toBeInTheDocument();
        expect(screen.getByText("Tente ajustar os filtros de busca")).toBeInTheDocument();
      });
    });
  });

  describe("Modal Interactions", () => {
    it("should open modal when Analisar IA button is clicked", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getByText(/Loss of Position Due to Gyro Drift/i)).toBeInTheDocument();
      });
      
      const analyzeButtons = screen.getAllByText(/Analisar IA/i);
      fireEvent.click(analyzeButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(/Análise IA –/i)).toBeInTheDocument();
      });
    });
  });

  describe("New Filter Features", () => {
    it("should render vessel filter input", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        const vesselFilter = screen.getByPlaceholderText(/Filtrar por navio/i);
        expect(vesselFilter).toBeInTheDocument();
      });
    });

    it("should render severity filter dropdown", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getByText(/Todas as severidades/i)).toBeInTheDocument();
      });
    });

    it("should filter incidents by vessel name", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getByText(/DP Shuttle Tanker X/i)).toBeInTheDocument();
      });
      
      const vesselFilter = screen.getByPlaceholderText(/Filtrar por navio/i);
      fireEvent.change(vesselFilter, { target: { value: "Tanker" } });
      
      await waitFor(() => {
        expect(screen.getByText(/DP Shuttle Tanker X/i)).toBeInTheDocument();
      });
    });

    it("should render CSV export button", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        const exportButton = screen.getByText(/Exportar CSV/i);
        expect(exportButton).toBeInTheDocument();
      });
    });

    it("should disable CSV export button when no incidents", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getByText(/Loss of Position Due to Gyro Drift/i)).toBeInTheDocument();
      });
      
      // Filter to show no results
      const searchInput = screen.getByPlaceholderText(/Buscar por título, embarcação, local ou tags/i);
      fireEvent.change(searchInput, { target: { value: "nonexistent-xyz-123" } });
      
      await waitFor(() => {
        const exportButton = screen.getByText(/Exportar CSV/i);
        expect(exportButton).toBeDisabled();
      });
    });

    it("should clear all filters including vessel and severity", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getByText(/Loss of Position Due to Gyro Drift/i)).toBeInTheDocument();
      });
      
      // Apply vessel filter
      const vesselFilter = screen.getByPlaceholderText(/Filtrar por navio/i);
      fireEvent.change(vesselFilter, { target: { value: "Tanker" } });
      
      // Apply DP class filter
      const dp2Button = screen.getByText("DP-2");
      fireEvent.click(dp2Button);
      
      await waitFor(() => {
        expect(screen.getByText(/Limpar/i)).toBeInTheDocument();
      });
      
      const clearButton = screen.getByText(/Limpar/i);
      fireEvent.click(clearButton);
      
      await waitFor(() => {
        expect(vesselFilter).toHaveValue("");
      });
    });

    it("should show filter count with vessel filter info", async () => {
      render(<DPIntelligenceCenter />);
      
      await waitFor(() => {
        expect(screen.getByText(/Loss of Position Due to Gyro Drift/i)).toBeInTheDocument();
      });
      
      const vesselFilter = screen.getByPlaceholderText(/Filtrar por navio/i);
      fireEvent.change(vesselFilter, { target: { value: "Tanker" } });
      
      await waitFor(() => {
        expect(screen.getByText(/Navio: Tanker/i)).toBeInTheDocument();
      });
    });
  });
});
