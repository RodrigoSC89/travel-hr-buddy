import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MMIForecastPage from "@/pages/admin/mmi/forecast/page";

describe("MMI Forecast Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Stub global fetch to prevent undici from trying to parse a relative URL
    // and to provide predictable response data for the component.
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (input: RequestInfo) => {
      const url = typeof input === "string" ? input : String((input as Request).url);
      if (url.includes("/api/mmi/forecast/all")) {
        return {
          ok: true,
          json: async () => ([
            {
              id: "1",
              vessel_name: "PSV Ocean STAR",
              system_name: "Motor Principal",
              hourmeter: 12500,
              last_maintenance: ["2025-01-15", "2025-02-20"],
              forecast_text: "Próxima manutenção recomendada",
              priority: "medium",
              created_at: "2025-10-19T00:00:00Z"
            }
          ]),
          status: 200,
        } as unknown as Response;
      }
      // default fallback
      return {
        ok: true,
        json: async () => ({}),
        status: 200,
      } as unknown as Response;
    }));
  });

  it("should render the page title", async () => {
    render(
      <MemoryRouter>
        <MMIForecastPage />
      </MemoryRouter>
    );

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByText(/Forecasts de Manutenção \(IA\)/i)).toBeDefined();
    });
  });

  it("should render filter fields", async () => {
    render(
      <MemoryRouter>
        <MMIForecastPage />
      </MemoryRouter>
    );

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByText(/🚢 Embarcação/i)).toBeDefined();
      expect(screen.getByText(/⚙️ Sistema/i)).toBeDefined();
      expect(screen.getByText(/⚠️ Risco/i)).toBeDefined();
    });
  });

  it("should render export button", async () => {
    render(
      <MemoryRouter>
        <MMIForecastPage />
      </MemoryRouter>
    );

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByText(/📤 Exportar CSV/i)).toBeDefined();
    });
  });

  it("should render forecast table with data", async () => {
    render(
      <MemoryRouter>
        <MMIForecastPage />
      </MemoryRouter>
    );

    // Wait for the component to finish loading and data to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Motor Principal/i)).toBeDefined();
      expect(screen.getByText(/PSV Ocean STAR/i)).toBeDefined();
      expect(screen.getByText(/➕ Gerar OS/i)).toBeDefined();
    });
  });
});
