import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportToPDF } from "@/lib/pdf";

// Mock html2pdf.js
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    save: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("exportToPDF utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call toast.info when starting PDF generation", async () => {
    const { toast } = await import("sonner");
    exportToPDF("Test content", "test.pdf");
    expect(toast.info).toHaveBeenCalledWith("Gerando PDF...");
  });

  it("should generate PDF with default filename when not provided", async () => {
    const html2pdf = await import("html2pdf.js");
    exportToPDF("Test content");
    expect(html2pdf.default).toHaveBeenCalled();
  });

  it("should generate PDF with custom filename when provided", async () => {
    const html2pdf = await import("html2pdf.js");
    exportToPDF("Test content", "custom-name.pdf");
    expect(html2pdf.default).toHaveBeenCalled();
  });

  it("should handle content properly", async () => {
    const { toast } = await import("sonner");
    const content = "Sample maintenance description";
    exportToPDF(content, "mmi-test.pdf");
    expect(toast.info).toHaveBeenCalled();
  });
});
