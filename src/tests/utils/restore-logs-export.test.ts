import { describe, it, expect, beforeEach, vi } from "vitest";
import { exportLogsToCSV, exportLogsToPDF } from "@/utils/restore-logs-export";

// Mock jsPDF
const mockSave = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetFont = vi.fn();
const mockText = vi.fn();
const mockAddPage = vi.fn();

vi.mock("jspdf", () => ({
  default: vi.fn().mockImplementation(() => ({
    setFontSize: mockSetFontSize,
    setFont: mockSetFont,
    text: mockText,
    addPage: mockAddPage,
    save: mockSave,
  })),
}));

describe("restore-logs-export utilities", () => {
  let createElementSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();

    // Mock DOM methods
    createElementSpy = vi.spyOn(document, "createElement");

    const mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: {},
    } as any;

    createElementSpy.mockReturnValue(mockLink);

    // Mock appendChild and removeChild
    vi.spyOn(document.body, "appendChild").mockImplementation(() => mockLink);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => mockLink);
  });

  describe("exportLogsToCSV", () => {
    it("should not export when logs array is empty", () => {
      exportLogsToCSV([]);
      expect(createElementSpy).not.toHaveBeenCalled();
    });

    it("should create CSV blob and download link", () => {
      const logs = [
        {
          id: "1",
          document_id: "doc-123",
          version_id: "ver-456",
          restored_by: "user-789",
          restored_at: "2025-10-11T12:00:00Z",
          email: "user@example.com",
        },
      ];

      exportLogsToCSV(logs);

      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("should handle logs with null email", () => {
      const logs = [
        {
          id: "1",
          document_id: "doc-123",
          version_id: "ver-456",
          restored_by: "user-789",
          restored_at: "2025-10-11T12:00:00Z",
          email: null,
        },
      ];

      exportLogsToCSV(logs);

      expect(createElementSpy).toHaveBeenCalled();
    });

    it("should create link element with correct attributes", () => {
      const logs = [
        {
          id: "1",
          document_id: "doc-123",
          version_id: "ver-456",
          restored_by: "user-789",
          restored_at: "2025-10-11T12:00:00Z",
          email: "user@example.com",
        },
      ];

      const mockLink = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: {},
      };

      createElementSpy.mockReturnValue(mockLink as any);

      exportLogsToCSV(logs);

      expect(mockLink.setAttribute).toHaveBeenCalledWith("href", "blob:mock-url");
      expect(mockLink.setAttribute).toHaveBeenCalledWith("download", "restore-logs.csv");
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe("exportLogsToPDF", () => {
    it("should not export when logs array is empty", () => {
      exportLogsToPDF([]);
      expect(mockSave).not.toHaveBeenCalled();
    });

    it("should create PDF document when logs exist", () => {
      const logs = [
        {
          id: "1",
          document_id: "doc-123",
          version_id: "ver-456",
          restored_by: "user-789",
          restored_at: "2025-10-11T12:00:00Z",
          email: "user@example.com",
        },
      ];

      exportLogsToPDF(logs);

      expect(mockSetFontSize).toHaveBeenCalled();
      expect(mockSetFont).toHaveBeenCalled();
      expect(mockText).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalledWith("restore-logs.pdf");
    });

    it("should handle multiple logs", () => {
      const logs = Array.from({ length: 5 }, (_, i) => ({
        id: `${i}`,
        document_id: `doc-${i}`,
        version_id: `ver-${i}`,
        restored_by: `user-${i}`,
        restored_at: "2025-10-11T12:00:00Z",
        email: `user${i}@example.com`,
      }));

      exportLogsToPDF(logs);

      expect(mockSave).toHaveBeenCalledWith("restore-logs.pdf");
    });

    it("should handle logs with null email", () => {
      const logs = [
        {
          id: "1",
          document_id: "doc-123",
          version_id: "ver-456",
          restored_by: "user-789",
          restored_at: "2025-10-11T12:00:00Z",
          email: null,
        },
      ];

      exportLogsToPDF(logs);

      expect(mockSave).toHaveBeenCalledWith("restore-logs.pdf");
    });
  });
});
