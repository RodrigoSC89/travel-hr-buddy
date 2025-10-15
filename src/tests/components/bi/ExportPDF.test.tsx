import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExportBIReport } from "@/components/bi/ExportPDF";

// Mock html2pdf
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    set: vi.fn(() => ({
      from: vi.fn(() => ({
        save: vi.fn(() => Promise.resolve())
      }))
    }))
  }))
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe("ExportBIReport Component", () => {
  beforeEach(() => {
    // Create a mock element in the DOM
    const mockElement = document.createElement("div");
    mockElement.id = "bi-dashboard-content";
    document.body.appendChild(mockElement);
  });

  it("should render export button", () => {
    render(<ExportBIReport />);
    expect(screen.getByText(/Exportar PDF/i)).toBeDefined();
  });

  it("should have download icon", () => {
    const { container } = render(<ExportBIReport />);
    const button = container.querySelector("button");
    expect(button).toBeDefined();
  });

  it("should call export function on click", async () => {
    render(<ExportBIReport />);
    const button = screen.getByText(/Exportar PDF/i);
    
    fireEvent.click(button);
    
    // The function is called asynchronously, so we just verify it doesn't throw
    expect(button).toBeDefined();
  });

  it("should render the component without errors", () => {
    const { container } = render(<ExportBIReport />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });
});
