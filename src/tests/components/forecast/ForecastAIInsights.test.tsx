import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ForecastAIInsights from "@/components/forecast/ForecastAIInsights";

// Mock ONNX Runtime
vi.mock("onnxruntime-web", () => ({
  InferenceSession: {
    create: vi.fn(() => Promise.resolve({
      run: vi.fn(() => Promise.resolve({
        result: { data: [0.42] }
      }))
    }))
  },
  Tensor: vi.fn((type, data, dims) => ({ type, data, dims }))
}));

describe("ForecastAIInsights Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the component title", async () => {
    render(<ForecastAIInsights />);
    await waitFor(() => {
      expect(screen.getByText(/Previsão IA/i)).toBeDefined();
    });
  });

  it("should show loading state initially", async () => {
    render(<ForecastAIInsights />);
    expect(screen.getByText(/Processando previsão.../i)).toBeDefined();
  });

  it("should display AI prediction percentage after processing", async () => {
    render(<ForecastAIInsights />);
    await waitFor(() => {
      expect(screen.getByText(/42.00%/i)).toBeDefined();
    }, { timeout: 2000 });
  });

  it("should display probability label", async () => {
    render(<ForecastAIInsights />);
    await waitFor(() => {
      expect(screen.getByText(/Probabilidade de instabilidade operacional/i)).toBeDefined();
    }, { timeout: 2000 });
  });
});
