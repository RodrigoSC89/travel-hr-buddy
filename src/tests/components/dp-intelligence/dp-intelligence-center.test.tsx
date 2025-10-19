import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DPIntelligenceCenter from "@/components/dp-intelligence/dp-intelligence-center";

/**
 * Tests for DPIntelligenceCenter Placeholder Component
 * 
 * This component is a placeholder that requires the dp_incidents table.
 * These tests verify the placeholder renders correctly and shows appropriate messaging.
 */
describe("DPIntelligenceCenter Component (Placeholder)", () => {

  it("should render placeholder component", () => {
    render(<DPIntelligenceCenter />);
    
    expect(screen.getByText(/Centro de Inteligência DP - Em Desenvolvimento/i)).toBeInTheDocument();
  });

  it("should show unavailable feature message", () => {
    render(<DPIntelligenceCenter />);
    
    expect(screen.getByText(/Recurso Indisponível/i)).toBeInTheDocument();
    expect(screen.getAllByText(/dp_incidents/i).length).toBeGreaterThan(0);
  });

  it("should show instructions for enabling the feature", () => {
    render(<DPIntelligenceCenter />);
    
    expect(screen.getByText(/Criar a migração da tabela dp_incidents/i)).toBeInTheDocument();
    expect(screen.getByText(/supabase gen types/i)).toBeInTheDocument();
  });
});

