import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ForecastPage from "@/pages/Forecast";

// Mock onnxruntime-web to prevent issues during testing
vi.mock("onnxruntime-web", () => ({
  InferenceSession: {
    create: vi.fn().mockResolvedValue({
      run: vi.fn().mockResolvedValue({
        output: { data: [0.85] }
      })
    })
  },
  Tensor: vi.fn()
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

// Mock MQTT publisher
vi.mock("@/lib/mqtt/publisher", () => ({
  publishEvent: vi.fn(),
  subscribeForecast: vi.fn()
}));

describe("Forecast Page", () => {
  it("should render the page heading", async () => {
    render(
      <MemoryRouter>
        <ForecastPage />
      </MemoryRouter>
    );

    // Check if the heading is rendered
    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("Forecast Global");
  });
});
