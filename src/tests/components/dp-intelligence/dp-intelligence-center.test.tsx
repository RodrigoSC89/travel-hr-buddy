import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DPIntelligenceCenter from "@/components/dp-intelligence/dp-intelligence-center";

describe("DPIntelligenceCenter Component", () => {
  describe("Component Rendering", () => {
    it("should render the stub message", () => {
      render(<DPIntelligenceCenter />);
      
      expect(screen.getByText("Centro de Inteligência DP em desenvolvimento")).toBeInTheDocument();
    });
  });
});
