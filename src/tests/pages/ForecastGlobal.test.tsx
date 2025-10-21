import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ForecastGlobal from "@/pages/ForecastGlobal";

// Mock MQTT client
vi.mock("mqtt", () => ({
  default: {
    connect: vi.fn(() => ({
      on: vi.fn(),
      subscribe: vi.fn(),
      publish: vi.fn(),
      end: vi.fn(),
    })),
  },
}));

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

describe("ForecastGlobal Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", async () => {
    render(<ForecastGlobal />);
    await waitFor(() => {
      expect(screen.getByText(/Forecast Global Intelligence/i)).toBeDefined();
    });
  });

  it("should have proper heading role and level", async () => {
    render(<ForecastGlobal />);
    await waitFor(() => {
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeDefined();
      expect(heading.textContent).toContain("Forecast Global Intelligence");
    });
  });
});
