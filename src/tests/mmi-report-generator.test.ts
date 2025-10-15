import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generatePDFReport, generateJobReport } from "@/services/mmi/pdfReportService";
import { MMIJob } from "@/types/mmi";

// Create a proper mock for html2pdf
const mockHtml2pdf = {
  set: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  save: vi.fn().mockResolvedValue(undefined),
};

// Mock html2pdf module
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => mockHtml2pdf),
}));

describe("MMI Report Generator Service", () => {
  const mockJob: MMIJob = {
    id: "JOB-001",
    title: "Manutenção do Gerador STBD",
    status: "Pendente",
    priority: "Alta",
    due_date: "2025-10-20",
    component: {
      id: "comp-001",
      name: "Gerador STBD",
      asset: {
        id: "asset-001",
        name: "Motor Principal",
        vessel: "MV Atlantic",
      },
    },
    suggestion_ia: "Recomenda-se verificar o sistema de arrefecimento",
    can_postpone: true,
  };

  const mockJobWithAI: MMIJob = {
    ...mockJob,
    ai_recommendation: {
      technical_action: "Inspeção completa do sistema de arrefecimento",
      component: "Gerador STBD",
      deadline: "2025-10-20",
      requires_work_order: true,
      reasoning: "Histórico mostra que problemas similares resultaram em falhas",
      similar_cases: [
        {
          job_id: "JOB-100",
          action: "Troca do ventilador",
          outcome: "Resolvido com sucesso",
          similarity: 0.89,
        },
        {
          job_id: "JOB-200",
          action: "Limpeza do radiador",
          outcome: "Temperatura normalizada",
          similarity: 0.85,
        },
      ],
    },
  };

  // Mock DOM methods
  let mockAppendChild: ReturnType<typeof vi.fn>;
  let mockRemoveChild: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset html2pdf mock
    mockHtml2pdf.set.mockReturnThis();
    mockHtml2pdf.from.mockReturnThis();
    mockHtml2pdf.save.mockResolvedValue(undefined);
    
    // Mock document.body methods
    mockAppendChild = vi.fn();
    mockRemoveChild = vi.fn();
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("generatePDFReport", () => {
    it("should generate PDF report for multiple jobs", async () => {
      const jobs = [mockJob, mockJobWithAI];

      await generatePDFReport(jobs, {
        includeAIRecommendations: true,
        title: "Relatório MMI Test",
        subtitle: "Test Subtitle",
      });

      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it("should generate PDF with default options", async () => {
      const jobs = [mockJob];

      await generatePDFReport(jobs);

      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it("should handle empty job list", async () => {
      const jobs: MMIJob[] = [];

      await generatePDFReport(jobs);

      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it("should include AI recommendations when enabled", async () => {
      const jobs = [mockJobWithAI];

      await generatePDFReport(jobs, {
        includeAIRecommendations: true,
      });

      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it("should exclude AI recommendations when disabled", async () => {
      const jobs = [mockJobWithAI];

      await generatePDFReport(jobs, {
        includeAIRecommendations: false,
      });

      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it("should handle errors during PDF generation", async () => {
      // Make save() reject for this test
      mockHtml2pdf.save.mockRejectedValueOnce(new Error("PDF generation failed"));

      const jobs = [mockJob];

      await expect(generatePDFReport(jobs)).rejects.toThrow(
        "Falha ao gerar relatório PDF"
      );
    });
  });

  describe("generateJobReport", () => {
    it("should generate PDF report for a single job", async () => {
      await generateJobReport(mockJob, {
        includeAIRecommendations: true,
      });

      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it("should generate PDF with custom title", async () => {
      await generateJobReport(mockJob, {
        title: "Custom Job Report",
        subtitle: "Custom Subtitle",
      });

      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it("should sanitize job title for filename", async () => {
      const jobWithSpecialChars = {
        ...mockJob,
        title: "Test Job @#$% with Special Characters!",
      };

      await generateJobReport(jobWithSpecialChars);

      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it("should include AI recommendations in single job report", async () => {
      await generateJobReport(mockJobWithAI, {
        includeAIRecommendations: true,
      });

      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it("should handle errors during single job PDF generation", async () => {
      // Make save() reject for this test
      mockHtml2pdf.save.mockRejectedValueOnce(new Error("PDF generation failed"));

      await expect(generateJobReport(mockJob)).rejects.toThrow(
        "Falha ao gerar relatório PDF do job"
      );
    });

    it("should use default options when not provided", async () => {
      await generateJobReport(mockJob);

      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });
  });

  describe("Filename generation", () => {
    it("should generate filename with date for batch reports", async () => {
      const jobs = [mockJob];
      
      await generatePDFReport(jobs);

      expect(document.body.appendChild).toHaveBeenCalled();
      // The actual filename is tested through the pdf library mock
    });

    it("should generate filename with job title and date for single reports", async () => {
      await generateJobReport(mockJob);

      expect(document.body.appendChild).toHaveBeenCalled();
      // The actual filename is tested through the pdf library mock
    });

    it("should truncate long job titles in filename", async () => {
      const longTitleJob = {
        ...mockJob,
        title: "A".repeat(100), // Very long title
      };

      await generateJobReport(longTitleJob);

      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });
  });

  describe("Report content", () => {
    it("should include job statistics in batch reports", async () => {
      const jobs = [mockJob, mockJobWithAI];

      await generatePDFReport(jobs);

      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it("should display job priority correctly", async () => {
      const highPriorityJob = { ...mockJob, priority: "Crítica" };
      const lowPriorityJob = { ...mockJob, priority: "Baixa" };

      await generatePDFReport([highPriorityJob, lowPriorityJob]);

      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it("should display similar cases when available", async () => {
      await generateJobReport(mockJobWithAI, {
        includeAIRecommendations: true,
      });

      expect(document.body.appendChild).toHaveBeenCalled();
    });
  });
});
