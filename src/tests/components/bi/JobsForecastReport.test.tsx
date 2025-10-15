import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import JobsForecastReport from "@/components/bi/JobsForecastReport";

describe("JobsForecastReport Component", () => {
  it("should render the forecast title", () => {
    render(<JobsForecastReport forecastText="Test forecast" />);
    expect(screen.getByText(/Previsão de Manutenção/i)).toBeDefined();
  });

  it("should render forecast text", () => {
    const forecastText = "Expected maintenance increase by 15%";
    render(<JobsForecastReport forecastText={forecastText} />);
    expect(screen.getByText(forecastText)).toBeDefined();
  });

  it("should render default message when no forecast text", () => {
    render(<JobsForecastReport forecastText="" />);
    expect(screen.getByText(/Sem dados de previsão disponíveis/i)).toBeDefined();
  });

  it("should render the component without errors", () => {
    const { container } = render(<JobsForecastReport forecastText="Test" />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });
});
