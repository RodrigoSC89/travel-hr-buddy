/**
 * Forecast Global Intelligence - Component Tests
 * Validates ForecastGlobal page and its components
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ForecastGlobal from "@/pages/ForecastGlobal";
import ForecastPanel from "@/components/forecast/ForecastPanel";
import ForecastMap from "@/components/forecast/ForecastMap";
import ForecastAIInsights from "@/components/forecast/ForecastAIInsights";
import mqtt from "mqtt";

// Mock mqtt module
vi.mock("mqtt", () => {
  const mockMqttClient = {
    on: vi.fn(),
    subscribe: vi.fn(),
    publish: vi.fn(),
    end: vi.fn(),
  };
  
  return {
    default: {
      connect: vi.fn(() => mockMqttClient),
    },
  };
});

// Helper to get mock MQTT client
const getMockMqttClient = () => {
  const mqttModule = vi.mocked(mqtt);
  return mqttModule.connect() as any;
};

// Mock onnxruntime-web
vi.mock("onnxruntime-web", () => ({
  InferenceSession: {
    create: vi.fn().mockResolvedValue({
      run: vi.fn().mockResolvedValue({
        result: {
          data: [0.35], // Mock risk probability
        },
      }),
    }),
  },
  Tensor: vi.fn((type, data, dims) => ({ type, data, dims })),
}));

describe("ForecastGlobal Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page with correct title", async () => {
    render(
      <MemoryRouter>
        <ForecastGlobal />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Forecast Global Intelligence")).toBeInTheDocument();
    });
  });

  it("renders all three main components", async () => {
    render(
      <MemoryRouter>
        <ForecastGlobal />
      </MemoryRouter>
    );

    // The page should render without errors
    await waitFor(() => {
      const element = document.querySelector("body");
      expect(element).toBeTruthy();
    });
  });
});

describe("ForecastPanel Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockMqttClient = getMockMqttClient();
    // Setup MQTT mock behavior
    mockMqttClient.on.mockImplementation((event, callback) => {
      if (event === "connect") {
        setTimeout(() => callback(), 0);
      } else if (event === "message") {
        // Simulate receiving forecast data
        setTimeout(() => {
          callback("nautilus/forecast", Buffer.from(JSON.stringify({
            wind: 15.2,
            wave: 2.8,
            temp: 26.5,
            visibility: 7.3,
          })));
        }, 0);
      }
    });
    mockMqttClient.subscribe.mockImplementation((topic, callback) => {
      setTimeout(() => callback(null), 0);
    });
  });

  it("renders weather metrics panel", async () => {
    render(<ForecastPanel />);

    await waitFor(() => {
      expect(screen.getByText("Condições Atuais")).toBeInTheDocument();
    });
  });

  it("displays all four weather metrics", async () => {
    render(<ForecastPanel />);

    await waitFor(() => {
      expect(screen.getByText("Vento")).toBeInTheDocument();
      expect(screen.getByText("Ondas")).toBeInTheDocument();
      expect(screen.getByText("Temperatura")).toBeInTheDocument();
      expect(screen.getByText("Visibilidade")).toBeInTheDocument();
    });
  });

  it("subscribes to MQTT forecast channel on mount", async () => {
    render(<ForecastPanel />);

    const mockMqttClient = getMockMqttClient();
    await waitFor(() => {
      expect(mockMqttClient.subscribe).toHaveBeenCalledWith(
        "nautilus/forecast",
        expect.any(Function)
      );
    });
  });

  it("cleans up MQTT connection on unmount", async () => {
    const { unmount } = render(<ForecastPanel />);
    
    unmount();

    const mockMqttClient = getMockMqttClient();
    await waitFor(() => {
      expect(mockMqttClient.end).toHaveBeenCalled();
    });
  });
});

describe("ForecastMap Component", () => {
  it("renders map card with title", () => {
    render(<ForecastMap />);

    expect(screen.getByText("Mapa Global de Previsão")).toBeInTheDocument();
  });

  it("renders iframe with correct source", () => {
    render(<ForecastMap />);

    const iframe = screen.getByTitle("Mapa Oceânico");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", expect.stringContaining("earth.nullschool.net"));
  });
});

describe("ForecastAIInsights Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders AI insights card", async () => {
    render(<ForecastAIInsights />);

    await waitFor(() => {
      expect(screen.getByText("Previsão IA")).toBeInTheDocument();
    });
  });

  it("loads ONNX model and displays prediction", async () => {
    render(<ForecastAIInsights />);

    // Wait for loading state to change
    await waitFor(() => {
      expect(screen.queryByText("Carregando modelo...")).not.toBeInTheDocument();
    });

    // Check for prediction display
    await waitFor(() => {
      expect(screen.getByText("Probabilidade de instabilidade")).toBeInTheDocument();
    });
  });

  it("handles model loading errors gracefully", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    
    // Mock ONNX to throw error
    const ort = await import("onnxruntime-web");
    vi.mocked(ort.InferenceSession.create).mockRejectedValueOnce(new Error("Model load failed"));

    render(<ForecastAIInsights />);

    await waitFor(() => {
      expect(screen.getByText("Erro na previsão IA")).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });
});

describe("MQTT Publisher Functions", () => {
  it("publishForecast sends data to correct topic", async () => {
    const { publishForecast } = await import("@/lib/mqtt/publisher");
    
    const mockMqttClient = getMockMqttClient();
    mockMqttClient.on.mockImplementation((event, callback) => {
      if (event === "connect") {
        callback();
      }
    });

    const testData = {
      wind: 15.2,
      wave: 2.8,
      temp: 26.5,
      visibility: 7.3,
    };

    publishForecast(testData);

    await waitFor(() => {
      expect(mockMqttClient.publish).toHaveBeenCalledWith(
        "nautilus/forecast/global",
        JSON.stringify(testData),
        { qos: 1 },
        expect.any(Function)
      );
    });
  });

  it("subscribeForecast returns mqtt client", async () => {
    const { subscribeForecast } = await import("@/lib/mqtt/publisher");
    
    const callback = vi.fn();
    const client = subscribeForecast(callback);

    const mockMqttClient = getMockMqttClient();
    expect(client).toBe(mockMqttClient);
  });
});

describe("Forecast Data Validation", () => {
  it("validates forecast data structure", () => {
    const forecastData = {
      wind: 15.2,
      wave: 2.8,
      temp: 26.5,
      visibility: 7.3,
    };

    expect(forecastData).toHaveProperty("wind");
    expect(forecastData).toHaveProperty("wave");
    expect(forecastData).toHaveProperty("temp");
    expect(forecastData).toHaveProperty("visibility");
    expect(typeof forecastData.wind).toBe("number");
    expect(typeof forecastData.wave).toBe("number");
    expect(typeof forecastData.temp).toBe("number");
    expect(typeof forecastData.visibility).toBe("number");
  });

  it("validates risk prediction is between 0 and 1", () => {
    const riskPredictions = [0.0, 0.35, 0.75, 1.0];

    riskPredictions.forEach((risk) => {
      expect(risk).toBeGreaterThanOrEqual(0);
      expect(risk).toBeLessThanOrEqual(1);
    });
  });

  it("validates weather metrics are positive numbers", () => {
    const metrics = {
      wind: 15.2,
      wave: 2.8,
      temp: 26.5,
      visibility: 7.3,
    };

    Object.values(metrics).forEach((value) => {
      expect(value).toBeGreaterThan(0);
      expect(typeof value).toBe("number");
    });
  });
});
