import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import IncidentCards from "@/components/dp/IncidentCards";

describe("IncidentCards Component", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock fetch to return demo data
    global.fetch = vi.fn(() =>
      Promise.reject(new Error("API not available"))
    ) as any;
  });

  it("should render incident cards", async () => {
    render(<IncidentCards />);
    
    await waitFor(() => {
      expect(screen.getByText(/Perda de posição durante operação de perfuração/i)).toBeInTheDocument();
    });
  });

  it("should display incident details correctly", async () => {
    render(<IncidentCards />);
    
    await waitFor(() => {
      // Check for vessel name
      expect(screen.getByText(/Drillship Alpha/i)).toBeInTheDocument();
      
      // Check for DP class
      expect(screen.getByText(/Classe: DP3/i)).toBeInTheDocument();
      
      // Check for location
      expect(screen.getByText(/Local: Golfo do México/i)).toBeInTheDocument();
    });
  });

  it("should render multiple incident cards", async () => {
    render(<IncidentCards />);
    
    await waitFor(() => {
      // Check for multiple incident titles
      expect(screen.getByText(/Perda de posição durante operação de perfuração/i)).toBeInTheDocument();
      expect(screen.getByText(/Falha de redundância em sistema DP2/i)).toBeInTheDocument();
      expect(screen.getByText(/Perda temporária de referência de posição/i)).toBeInTheDocument();
    });
  });

  it("should display tags as badges", async () => {
    render(<IncidentCards />);
    
    await waitFor(() => {
      expect(screen.getByText("Propulsion")).toBeInTheDocument();
      expect(screen.getByText("Critical")).toBeInTheDocument();
      expect(screen.getByText("Weather")).toBeInTheDocument();
    });
  });

  it("should have Ver relatório button with correct link", async () => {
    render(<IncidentCards />);
    
    await waitFor(() => {
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toHaveAttribute("target", "_blank");
      expect(links[0]).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("should have Analisar com IA button", async () => {
    render(<IncidentCards />);
    
    await waitFor(() => {
      const aiButtons = screen.getAllByText(/Analisar com IA/i);
      expect(aiButtons.length).toBeGreaterThan(0);
    });
  });
});
