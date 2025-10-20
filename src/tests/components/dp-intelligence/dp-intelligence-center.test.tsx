import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DPIntelligenceCenter from "@/components/dp-intelligence/dp-intelligence-center";

describe("DPIntelligenceCenter Component", () => {
  it("should render stub component message", () => {
    render(<DPIntelligenceCenter />);
    
    // The component is currently a stub showing a development message
    expect(screen.getByText("Centro de Inteligência DP em desenvolvimento")).toBeInTheDocument();
  });
});
