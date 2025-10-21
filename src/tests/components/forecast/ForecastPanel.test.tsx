import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ForecastPanel from "@/components/forecast/ForecastPanel";

// Mock MQTT publisher
vi.mock("@/lib/mqtt/publisher", () => ({
  subscribeForecast: vi.fn((callback) => {
    // Simulate receiving data after a short delay
    setTimeout(() => {
      callback({
        wind: 12.5,
        wave: 2.3,
        temp: 27.8,
        visibility: 8.2
      });
    }, 100);
    
    return {
      end: vi.fn()
    };
  })
}));

describe("ForecastPanel Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the panel title", async () => {
    render(<ForecastPanel />);
    await waitFor(() => {
      expect(screen.getByText(/Condições Atuais/i)).toBeDefined();
    });
  });

  it("should render all metric labels", async () => {
    render(<ForecastPanel />);
    await waitFor(() => {
      expect(screen.getByText(/Vento/i)).toBeDefined();
      expect(screen.getByText(/Ondas/i)).toBeDefined();
      expect(screen.getByText(/Temperatura/i)).toBeDefined();
      expect(screen.getByText(/Visibilidade/i)).toBeDefined();
    });
  });

  it("should display metric values in correct format", async () => {
    render(<ForecastPanel />);
    await waitFor(() => {
      expect(screen.getByText(/12.5 kn/i)).toBeDefined();
      expect(screen.getByText(/2.3 m/i)).toBeDefined();
      expect(screen.getByText(/27.8 °C/i)).toBeDefined();
      expect(screen.getByText(/8.2 km/i)).toBeDefined();
    }, { timeout: 2000 });
  });
});
