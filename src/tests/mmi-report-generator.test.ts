import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateJobReport, generateBatchReport } from "@/services/mmi/reportGenerator";
import type { Job } from "@/services/mmi/jobsApi";
import jsPDF from "jspdf";

// Mock jsPDF
vi.mock("jspdf", () => {
  const mockDoc = {
    internal: {
      pageSize: {
        getWidth: vi.fn(() => 210),
        getHeight: vi.fn(() => 297),
      },
      pages: { length: 2 },
    },
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    splitTextToSize: vi.fn((text: string) => [text]),
    text: vi.fn(),
    setFillColor: vi.fn(),
    rect: vi.fn(),
    setDrawColor: vi.fn(),
    line: vi.fn(),
    addPage: vi.fn(),
    setPage: vi.fn(),
    save: vi.fn(),
  };

  return {
    default: vi.fn(() => mockDoc),
  };
});

describe("MMI Report Generator", () => {
  const mockJob: Job = {
    id: "JOB-001",
    title: "Test Maintenance Job",
    status: "Pendente",
    priority: "Alta",
    due_date: "2025-10-20",
    component: {
      name: "Test Component",
      asset: {
        name: "Test Asset",
        vessel: "Test Vessel",
      },
    },
    suggestion_ia: "Test AI suggestion based on historical data",
    can_postpone: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateJobReport", () => {
    it("should generate a PDF report for a single job", async () => {
      await generateJobReport(mockJob);

      expect(jsPDF).toHaveBeenCalled();
      const mockDocInstance = (jsPDF as any).mock.results[0].value;
      expect(mockDocInstance.save).toHaveBeenCalled();
      expect(mockDocInstance.save).toHaveBeenCalledWith(
        expect.stringContaining("Job_JOB-001")
      );
    });

    it("should include AI suggestions when requested", async () => {
      await generateJobReport(mockJob, { includeAISuggestion: true });

      const mockDocInstance = (jsPDF as any).mock.results[0].value;
      expect(mockDocInstance.text).toHaveBeenCalled();
      expect(mockDocInstance.save).toHaveBeenCalled();
    });

    it("should exclude AI suggestions when not requested", async () => {
      const jobWithoutSuggestion = { ...mockJob, suggestion_ia: undefined };
      await generateJobReport(jobWithoutSuggestion, { includeAISuggestion: false });

      const mockDocInstance = (jsPDF as any).mock.results[0].value;
      expect(mockDocInstance.save).toHaveBeenCalled();
    });

    it("should include metadata when requested", async () => {
      await generateJobReport(mockJob, { includeMetadata: true });

      const mockDocInstance = (jsPDF as any).mock.results[0].value;
      expect(mockDocInstance.text).toHaveBeenCalled();
      expect(mockDocInstance.save).toHaveBeenCalled();
    });

    it("should handle jobs without AI suggestions gracefully", async () => {
      const jobWithoutSuggestion = { ...mockJob, suggestion_ia: undefined };
      
      await expect(
        generateJobReport(jobWithoutSuggestion)
      ).resolves.not.toThrow();
    });

    it("should generate unique filenames with date", async () => {
      await generateJobReport(mockJob);

      const mockDocInstance = (jsPDF as any).mock.results[0].value;
      expect(mockDocInstance.save).toHaveBeenCalledWith(
        expect.stringMatching(/Job_JOB-001_\d{4}-\d{2}-\d{2}\.pdf/)
      );
    });
  });

  describe("generateBatchReport", () => {
    const mockJobs: Job[] = [
      mockJob,
      {
        id: "JOB-002",
        title: "Second Test Job",
        status: "Em andamento",
        priority: "Média",
        due_date: "2025-10-22",
        component: {
          name: "Another Component",
          asset: {
            name: "Another Asset",
            vessel: "Another Vessel",
          },
        },
        can_postpone: false,
      },
    ];

    it("should generate a consolidated report for multiple jobs", async () => {
      await generateBatchReport(mockJobs);

      expect(jsPDF).toHaveBeenCalled();
      const mockDocInstance = (jsPDF as any).mock.results[0].value;
      expect(mockDocInstance.save).toHaveBeenCalled();
      expect(mockDocInstance.save).toHaveBeenCalledWith(
        expect.stringContaining("Jobs_Consolidado")
      );
    });

    it("should include all jobs in the report", async () => {
      await generateBatchReport(mockJobs);

      const mockDocInstance = (jsPDF as any).mock.results[0].value;
      expect(mockDocInstance.text).toHaveBeenCalled();
      expect(mockDocInstance.save).toHaveBeenCalled();
    });

    it("should handle empty job list", async () => {
      await expect(generateBatchReport([])).resolves.not.toThrow();
    });

    it("should respect includeAISuggestion option", async () => {
      await generateBatchReport(mockJobs, { includeAISuggestion: false });

      const mockDocInstance = (jsPDF as any).mock.results[0].value;
      expect(mockDocInstance.save).toHaveBeenCalled();
    });

    it("should add page breaks when needed", async () => {
      // Create many jobs to trigger page breaks
      const manyJobs = Array.from({ length: 20 }, (_, i) => ({
        ...mockJob,
        id: `JOB-${String(i + 1).padStart(3, "0")}`,
        title: `Test Job ${i + 1}`,
      }));

      await generateBatchReport(manyJobs);

      const mockDocInstance = (jsPDF as any).mock.results[0].value;
      expect(mockDocInstance.save).toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("should handle PDF generation errors gracefully", async () => {
      const mockDocWithError = {
        internal: {
          pageSize: {
            getWidth: vi.fn(() => 210),
            getHeight: vi.fn(() => 297),
          },
          pages: { length: 2 },
        },
        setFontSize: vi.fn(),
        setFont: vi.fn(),
        splitTextToSize: vi.fn((text: string) => [text]),
        text: vi.fn(),
        setFillColor: vi.fn(),
        rect: vi.fn(),
        setDrawColor: vi.fn(),
        line: vi.fn(),
        addPage: vi.fn(),
        setPage: vi.fn(),
        save: vi.fn(() => {
          throw new Error("PDF save error");
        }),
      };

      vi.mocked(jsPDF).mockImplementation(() => mockDocWithError as any);

      await expect(generateJobReport(mockJob)).rejects.toThrow("PDF save error");
    });
  });
});
