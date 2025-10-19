/**
 * PDF Export Utility Tests
 * 
 * Comprehensive test suite with proper test isolation to prevent
 * module caching issues and ensure each test has a fresh environment.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { toast } from "sonner";

// Mock dependencies
vi.mock("sonner");
vi.mock("html2pdf.js");

describe("PDF Export Utility", () => {
  // Fresh mock instances for each test
  let mockSave: ReturnType<typeof vi.fn>;
  let mockFrom: ReturnType<typeof vi.fn>;
  let mockSet: ReturnType<typeof vi.fn>;
  let mockHtml2pdf: ReturnType<typeof vi.fn>;
  let mockInstance: { set: typeof mockSet; from: typeof mockFrom; save: typeof mockSave };
  
  // Functions to be imported fresh each test
  let exportToPDF: (content: string, filename?: string, options?: any) => Promise<void>;
  let formatPDFContent: (title: string, content: string, footer?: string) => string;

  beforeEach(async () => {
    // Reset DOM
    document.body.innerHTML = "";
    
    // Clear all mocks
    vi.clearAllMocks();
    
    // Reset modules to clear import cache
    vi.resetModules();
    
    // Create fresh mock functions
    mockSave = vi.fn().mockResolvedValue(undefined);
    mockFrom = vi.fn().mockReturnValue({ save: mockSave });
    mockSet = vi.fn().mockReturnValue({ from: mockFrom });
    mockInstance = { set: mockSet, from: mockFrom, save: mockSave };
    
    // Re-import html2pdf module and set up mock
    const html2pdfModule = await import("html2pdf.js");
    mockHtml2pdf = html2pdfModule.default as any;
    vi.mocked(mockHtml2pdf).mockReturnValue(mockInstance);
    
    // Re-import production code to get fresh instance
    const pdfModule = await import("../../lib/pdf");
    exportToPDF = pdfModule.exportToPDF;
    formatPDFContent = pdfModule.formatPDFContent;
  });

  describe("formatPDFContent", () => {
    it("should format content with title", () => {
      const result = formatPDFContent("Test Title", "<p>Content</p>");
      
      expect(result).toContain("Test Title");
      expect(result).toContain("<p>Content</p>");
      expect(result).toContain("font-family: Arial, sans-serif");
      expect(result).toContain("color: #1e40af");
    });

    it("should include default footer when not provided", () => {
      const result = formatPDFContent("Title", "Content");
      
      expect(result).toContain("Gerado em:");
      expect(result).toContain("Sistema Nautilus One");
    });

    it("should use custom footer when provided", () => {
      const customFooter = "<div>Custom Footer</div>";
      const result = formatPDFContent("Title", "Content", customFooter);
      
      expect(result).toContain("Custom Footer");
      expect(result).not.toContain("Sistema Nautilus One");
    });
  });

  describe("exportToPDF", () => {
    it("should use default filename when not provided", async () => {
      await exportToPDF("<div>content</div>");
      
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: "document.pdf",
        })
      );
    });

    it("should use provided filename", async () => {
      await exportToPDF("<div>content</div>", "custom.pdf");
      
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: "custom.pdf",
        })
      );
    });

    it("should apply default PDF options", async () => {
      await exportToPDF("<div>content</div>");
      
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          margin: 10,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
      );
    });

    it("should merge custom options with defaults", async () => {
      await exportToPDF("<div>content</div>", "test.pdf", {
        margin: 20,
        jsPDF: { orientation: "landscape" },
      });
      
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          margin: 20,
          jsPDF: expect.objectContaining({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
          }),
        })
      );
    });

    it("should create temporary element with content", async () => {
      const content = "<div>Test Content</div>";
      await exportToPDF(content);
      
      expect(mockFrom).toHaveBeenCalled();
      const element = mockFrom.mock.calls[0][0];
      expect(element.innerHTML).toBe(content);
    });

    it("should clean up temporary element after success", async () => {
      const initialChildCount = document.body.children.length;
      await exportToPDF("<div>content</div>");
      
      expect(document.body.children.length).toBe(initialChildCount);
    });

    it("should clean up temporary element after error", async () => {
      mockSave.mockRejectedValueOnce(new Error("Test error"));
      
      const initialChildCount = document.body.children.length;
      
      await expect(exportToPDF("<div>content</div>")).rejects.toThrow("Test error");
      
      expect(document.body.children.length).toBe(initialChildCount);
    });

    it("should show generating toast", async () => {
      await exportToPDF("<div>content</div>");
      
      expect(toast.info).toHaveBeenCalledWith("Gerando PDF...");
    });

    it("should show success toast on completion", async () => {
      await exportToPDF("<div>content</div>");
      
      expect(toast.success).toHaveBeenCalledWith("PDF gerado com sucesso!");
    });

    it("should show error toast on failure", async () => {
      mockSave.mockRejectedValueOnce(new Error("Test error"));
      
      await expect(exportToPDF("<div>content</div>")).rejects.toThrow();
      
      expect(toast.error).toHaveBeenCalledWith("Erro ao gerar PDF");
    });

    it("should call html2pdf chain correctly", async () => {
      await exportToPDF("<div>content</div>");
      
      expect(mockHtml2pdf).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
    });

    it("should re-throw error for test assertions", async () => {
      const testError = new Error("Test error");
      mockSave.mockRejectedValueOnce(testError);
      
      await expect(exportToPDF("<div>content</div>")).rejects.toThrow("Test error");
    });
  });
});
