import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MMIForecastPage from "@/pages/admin/mmi/forecast/page";

describe("MMI Forecast Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    render(
      <MemoryRouter>
        <MMIForecastPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Forecast IA - Manutenção Inteligente/i)).toBeDefined();
  });

  it("should render input fields", () => {
    render(
      <MemoryRouter>
        <MMIForecastPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/🚢 Embarcação/i)).toBeDefined();
    expect(screen.getByText(/⚙️ Sistema/i)).toBeDefined();
    expect(screen.getByText(/⏱ Horímetro atual/i)).toBeDefined();
    expect(screen.getByText(/🧾 Datas das últimas manutenções/i)).toBeDefined();
  });

  it("should render submit button", () => {
    render(
      <MemoryRouter>
        <MMIForecastPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/📡 Gerar Forecast/i)).toBeDefined();
  });

  it("should render forecast result textarea", () => {
    render(
      <MemoryRouter>
        <MMIForecastPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/📈 Previsão IA/i)).toBeDefined();
  });
});
