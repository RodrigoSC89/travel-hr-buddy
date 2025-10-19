// src/tests/lib/pdf.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock html2pdf.js
let mockSave: any;
let mockFrom: any;
let mockSet: any;
let mockInstance: any;
let mockHtml2pdf: any;

vi.mock("html2pdf.js", () => ({
  default: vi.fn(),
}));

describe("pdf utility", () => {
  let exportToPDF: any;
  let formatPDFContent: any;

  beforeEach(async () => {
    // Reset DOM
    document.body.innerHTML = "";
    
    // Reset modules to clear import cache
    vi.resetModules();
    
    // Reset mock implementation for each test
    mockSave = vi.fn().mockResolvedValue(undefined);
    mockFrom = vi.fn().mockReturnValue({ save: mockSave });
    mockSet = vi.fn().mockReturnValue({ from: mockFrom });
    mockInstance = {
      set: mockSet,
      from: mockFrom,
      save: mockSave,
    };
    
    // Get the mocked html2pdf and set its implementation
    const html2pdfModule = await import("html2pdf.js");
    mockHtml2pdf = html2pdfModule.default;
    vi.mocked(mockHtml2pdf).mockReturnValue(mockInstance);
    
    // Re-import the production code after resetting modules
    const pdfModule = await import("../../lib/pdf");
    exportToPDF = pdfModule.exportToPDF;
    formatPDFContent = pdfModule.formatPDFContent;
  });

  describe("formatPDFContent", () => {
    it("should format content with title", () => {
      const result = formatPDFContent("Test Title", "<p>Content</p>");
      expect(result).toContain("Test Title");
      expect(result).toContain("<p>Content</p>");
    });

    it("should include default footer", () => {
      const result = formatPDFContent("Title", "Content");
      expect(result).toContain("Gerado em:");
      expect(result).toContain("Sistema Nautilus One");
    });

    it("should use custom footer when provided", () => {
      const result = formatPDFContent("Title", "Content", "<div>Custom Footer</div>");
      expect(result).toContain("Custom Footer");
      expect(result).not.toContain("Sistema Nautilus One");
    });

    it("should apply styles", () => {
      const result = formatPDFContent("Title", "Content");
      expect(result).toContain("font-family: Arial");
      expect(result).toContain("color: #1e40af");
    });
  });

  describe("exportToPDF", () => {
    it("should use default filename when not provided", async () => {
      await exportToPDF("<div>Test</div>");
      
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: "document.pdf",
        })
      );
    });

    it("should use provided filename", async () => {
      await exportToPDF("<div>Test</div>", "custom.pdf");
      
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: "custom.pdf",
        })
      );
    });

    it("should apply default PDF options", async () => {
      await exportToPDF("<div>Test</div>");
      
      expect(mockSet).toHaveBeenLastCalledWith({
        filename: "document.pdf",
        margin: 10,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      });
    });

    it("should merge custom options with defaults", async () => {
      await exportToPDF("<div>Test</div>", "test.pdf", {
        margin: 20,
        jsPDF: { orientation: "landscape" },
      });
      
      expect(mockSet).toHaveBeenCalledWith({
        filename: "test.pdf",
        margin: 20,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      });
    });

    it("should create temporary element with content", async () => {
      await exportToPDF("<div>Test Content</div>");
      
      expect(mockFrom).toHaveBeenCalled();
      const element = mockFrom.mock.calls[0][0];
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.innerHTML).toContain("Test Content");
    });

    it("should remove temporary element after generation", async () => {
      await exportToPDF("<div>Test</div>");
      
      const elements = document.querySelectorAll('[style*="-9999px"]');
      expect(elements.length).toBe(0);
    });

    it("should show toast messages", async () => {
      await exportToPDF("<div>Test</div>");
      
      expect(toast.info).toHaveBeenCalledWith("Gerando PDF...");
      expect(toast.success).toHaveBeenCalledWith("PDF gerado com sucesso!");
    });

    it("should show error toast on failure", async () => {
      const error = new Error("PDF generation failed");
      mockSave.mockRejectedValueOnce(error);
      
      await expect(exportToPDF("<div>Test</div>")).rejects.toThrow("PDF generation failed");
      
      expect(toast.error).toHaveBeenCalledWith("Erro ao gerar PDF");
    });

    it("should remove temporary element even on error", async () => {
      mockSave.mockRejectedValueOnce(new Error("Test error"));
      
      try {
        await exportToPDF("<div>Test</div>");
      } catch (e) {
        // Expected to throw
      }
      
      const elements = document.querySelectorAll('[style*="-9999px"]');
      expect(elements.length).toBe(0);
    });
  });
});
