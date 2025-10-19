/**
 * Unit Tests for PDF Export Utility
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportToPDF, formatPDFContent } from "@/lib/pdf";
import { toast } from "sonner";

// Mock html2pdf
vi.mock("html2pdf.js", () => {
  return {
    default: vi.fn(() => ({
      set: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      save: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("PDF Export Utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("formatPDFContent", () => {
    it("should format content with title and default footer", () => {
      const title = "Test Report";
      const content = "<p>Test content</p>";

      const result = formatPDFContent(title, content);

      expect(result).toContain(title);
      expect(result).toContain(content);
      expect(result).toContain("Gerado em:");
      expect(result).toContain("Sistema Nautilus One");
    });

    it("should use custom footer when provided", () => {
      const title = "Test Report";
      const content = "<p>Test content</p>";
      const footer = "<p>Custom footer</p>";

      const result = formatPDFContent(title, content, footer);

      expect(result).toContain(title);
      expect(result).toContain(content);
      expect(result).toContain(footer);
    });

    it("should include proper HTML structure", () => {
      const title = "Test Report";
      const content = "<p>Test content</p>";

      const result = formatPDFContent(title, content);

      expect(result).toContain("<div");
      expect(result).toContain("<h1");
      expect(result).toContain("color: #1e40af");
    });
  });

  describe("exportToPDF", () => {
    it("should show info toast when starting PDF generation", async () => {
      const content = "<p>Test content</p>";
      await exportToPDF(content);

      expect(toast.info).toHaveBeenCalledWith("Gerando PDF...");
    });

    it("should show success toast when PDF is generated", async () => {
      const content = "<p>Test content</p>";
      await exportToPDF(content);

      expect(toast.success).toHaveBeenCalledWith("PDF gerado com sucesso!");
    });

    it("should use default filename when not provided", async () => {
      const content = "<p>Test content</p>";
      const html2pdf = (await import("html2pdf.js")).default;

      await exportToPDF(content);

      const mockInstance = html2pdf();
      expect(mockInstance.set).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: "document.pdf",
        })
      );
    });

    it("should use provided filename", async () => {
      const content = "<p>Test content</p>";
      const filename = "custom-report.pdf";
      const html2pdf = (await import("html2pdf.js")).default;

      await exportToPDF(content, filename);

      const mockInstance = html2pdf();
      expect(mockInstance.set).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: filename,
        })
      );
    });

    it("should apply default PDF options", async () => {
      const content = "<p>Test content</p>";
      const html2pdf = (await import("html2pdf.js")).default;

      await exportToPDF(content);

      const mockInstance = html2pdf();
      expect(mockInstance.set).toHaveBeenCalledWith(
        expect.objectContaining({
          margin: 10,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
      );
    });

    it("should merge custom options with defaults", async () => {
      const content = "<p>Test content</p>";
      const customOptions = {
        margin: 20,
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" as const },
      };
      const html2pdf = (await import("html2pdf.js")).default;

      await exportToPDF(content, "test.pdf", customOptions);

      const mockInstance = html2pdf();
      expect(mockInstance.set).toHaveBeenCalledWith(
        expect.objectContaining({
          margin: 20,
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        })
      );
    });

    it("should show error toast on failure", async () => {
      const html2pdf = (await import("html2pdf.js")).default;
      const mockInstance = {
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        save: vi.fn().mockRejectedValue(new Error("PDF generation failed")),
      };
      vi.mocked(html2pdf).mockReturnValue(mockInstance);

      const content = "<p>Test content</p>";

      await expect(exportToPDF(content)).rejects.toThrow("PDF generation failed");
      expect(toast.error).toHaveBeenCalledWith("Erro ao gerar PDF");
    });

    it("should create temporary element with content", async () => {
      const content = "<p>Test content</p>";
      const html2pdf = (await import("html2pdf.js")).default;

      await exportToPDF(content);

      const mockInstance = html2pdf();
      expect(mockInstance.from).toHaveBeenCalled();
    });
  });
});
