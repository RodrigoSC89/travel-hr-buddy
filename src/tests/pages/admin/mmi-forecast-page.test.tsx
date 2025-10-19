import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MMIForecastPage from "@/pages/admin/mmi/forecast/page";

describe("MMI Forecast Page", () => {
  it("should render the page title", () => {
    render(<MMIForecastPage />);
    expect(screen.getByText(/Forecast IA - Manutenção Inteligente/i)).toBeDefined();
  });

  it("should render all input fields", () => {
    render(<MMIForecastPage />);
    
    // Check for labels
    expect(screen.getByText(/🚢 Embarcação/i)).toBeDefined();
    expect(screen.getByText(/⚙️ Sistema/i)).toBeDefined();
    expect(screen.getByText(/⏱ Horímetro atual/i)).toBeDefined();
    expect(screen.getByText(/🧾 Datas das últimas manutenções/i)).toBeDefined();
    expect(screen.getByText(/📈 Previsão IA/i)).toBeDefined();
  });

  it("should render the submit button", () => {
    render(<MMIForecastPage />);
    expect(screen.getByRole("button", { name: /Gerar Forecast/i })).toBeDefined();
  });

  it("should have proper input types", () => {
    render(<MMIForecastPage />);
    
    // Check that hourmeter input is of type number
    const numberInputs = screen.getAllByRole("spinbutton");
    expect(numberInputs.length).toBeGreaterThan(0);
  });
});
