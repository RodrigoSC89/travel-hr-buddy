import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SGSOEffectivenessChart } from "@/components/sgso/SGSOEffectivenessChart";
import { getEffectivenessStatus } from "@/types/sgso-effectiveness";

describe("SGSO Effectiveness Monitoring", () => {
  describe("getEffectivenessStatus helper", () => {
    it("should return Excelente for >= 90%", () => {
      const status = getEffectivenessStatus(95);
      expect(status.label).toBe("Excelente");
      expect(status.color).toBe("text-green-600");
    });

    it("should return Bom for 75-89%", () => {
      const status = getEffectivenessStatus(80);
      expect(status.label).toBe("Bom");
      expect(status.color).toBe("text-yellow-600");
    });

    it("should return Regular for 50-74%", () => {
      const status = getEffectivenessStatus(60);
      expect(status.label).toBe("Regular");
      expect(status.color).toBe("text-orange-600");
    });

    it("should return Crítico for < 50%", () => {
      const status = getEffectivenessStatus(40);
      expect(status.label).toBe("Crítico");
      expect(status.color).toBe("text-red-600");
    });
  });

  describe("SGSOEffectivenessChart component", () => {
    it("should render loading state initially", () => {
      render(<SGSOEffectivenessChart />);
      expect(screen.getByText(/Carregando dados de efetividade/i)).toBeInTheDocument();
    });

    it("should render component without errors", () => {
      const { container } = render(<SGSOEffectivenessChart />);
      expect(container).toBeTruthy();
    });
  });
});
