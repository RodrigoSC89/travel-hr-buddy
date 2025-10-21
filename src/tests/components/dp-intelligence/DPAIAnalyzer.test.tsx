import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DPAIAnalyzer from "@/components/dp-intelligence/DPAIAnalyzer";

// Mock onnxruntime-web
vi.mock("onnxruntime-web", () => ({
  InferenceSession: {
    create: vi.fn(() => Promise.resolve({
      run: vi.fn(() => Promise.resolve({
        output: { data: [0.5] } // Normal operation (< 0.7)
      }))
    }))
  },
  Tensor: vi.fn((type, data, dims) => ({ type, data, dims }))
}));

// Mock MQTT publisher
vi.mock("@/lib/mqtt/publisher", () => ({
  publishEvent: vi.fn()
}));

describe("DPAIAnalyzer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the AI Analyzer title", () => {
    render(<DPAIAnalyzer />);
    expect(screen.getByText("DP AI Analyzer")).toBeInTheDocument();
  });

  it("should show initialization message", () => {
    render(<DPAIAnalyzer />);
    expect(screen.getByText("Inicializando IA...")).toBeInTheDocument();
  });

  it("should show stable system when no fault detected", async () => {
    render(<DPAIAnalyzer />);
    
    await waitFor(() => {
      expect(screen.getByText("Sistema estável")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("should show analysis complete status", async () => {
    render(<DPAIAnalyzer />);
    
    await waitFor(() => {
      expect(screen.getByText("Análise concluída")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("should render within a card with accent border", () => {
    const { container } = render(<DPAIAnalyzer />);
    
    const card = container.querySelector('[class*="border-\\[var\\(--nautilus-accent\\)\\]"]');
    expect(card).toBeTruthy();
  });
});
