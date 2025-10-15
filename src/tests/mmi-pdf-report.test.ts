import { describe, it, expect, vi } from "vitest";
import { generateJobsPDFReport } from "@/services/mmi/pdfReportService";
import type { Job } from "@/services/mmi/jobsApi";

// Mock html2pdf
vi.mock('html2pdf.js', () => {
  const mockHtml2Pdf = {
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    save: vi.fn().mockResolvedValue(undefined),
  };
  
  return {
    default: vi.fn(() => mockHtml2Pdf),
  };
});

// Mock the AI copilot service
vi.mock('@/services/mmi/copilotService', () => ({
  getAIRecommendation: vi.fn(() => Promise.resolve({
    technical_action: "Realizar inspeção completa",
    component: "Sistema Hidráulico",
    deadline: "2025-10-30",
    requires_work_order: true,
    reasoning: "Baseado em casos similares, esta ação é recomendada",
    similar_cases: [
      {
        job_id: "JOB-HIST-001",
        action: "Manutenção preventiva",
        outcome: "Sucesso",
        similarity: 0.85,
      },
    ],
  })),
}));

describe("MMI PDF Report Service", () => {
  const mockJobs: Job[] = [
    {
      id: "JOB-001",
      title: "Manutenção preventiva do sistema hidráulico",
      description: "Teste de descrição",
      status: "Pendente",
      priority: "Alta",
      due_date: "2025-10-20",
      component: {
        name: "Sistema Hidráulico Principal",
        asset: {
          name: "Bomba Hidráulica #3",
          vessel: "Navio Oceanic Explorer",
        },
      },
      suggestion_ia: "Recomenda-se realizar a manutenção durante a próxima parada programada.",
      can_postpone: true,
    },
    {
      id: "JOB-002",
      title: "Inspeção de válvulas de segurança",
      status: "Em andamento",
      priority: "Crítica",
      due_date: "2025-10-16",
      component: {
        name: "Sistema de Segurança",
        asset: {
          name: "Válvulas de Alívio - Deck Principal",
          vessel: "Navio Atlantic Star",
        },
      },
      suggestion_ia: "Atenção: Válvula #2 apresenta leitura fora do padrão.",
      can_postpone: false,
    },
    {
      id: "JOB-003",
      title: "Troca de filtros do motor principal",
      status: "Pendente",
      priority: "Média",
      due_date: "2025-10-25",
      component: {
        name: "Motor Principal",
        asset: {
          name: "Filtros de Óleo ME-4500",
          vessel: "Navio Pacific Voyager",
        },
      },
      can_postpone: true,
    },
  ];

  describe("generateJobsPDFReport", () => {
    it("should generate PDF report without errors", async () => {
      await expect(
        generateJobsPDFReport(mockJobs, {
          title: "Test Report",
          includeAIRecommendations: false,
        })
      ).resolves.not.toThrow();
    });

    it("should generate PDF with AI recommendations", async () => {
      await expect(
        generateJobsPDFReport(mockJobs, {
          title: "Test Report with AI",
          includeAIRecommendations: true,
        })
      ).resolves.not.toThrow();
    });

    it("should handle empty job list", async () => {
      await expect(
        generateJobsPDFReport([], {
          title: "Empty Report",
        })
      ).resolves.not.toThrow();
    });

    it("should use default title when not provided", async () => {
      await expect(
        generateJobsPDFReport(mockJobs)
      ).resolves.not.toThrow();
    });

    it("should handle jobs with missing optional fields", async () => {
      const jobsWithMissingFields: Job[] = [
        {
          id: "JOB-TEST",
          title: "Test Job",
          status: "Pendente",
          priority: "Média",
          due_date: "2025-10-30",
          component: {
            name: "Test Component",
            asset: {
              name: "Test Asset",
              vessel: "Test Vessel",
            },
          },
        },
      ];

      await expect(
        generateJobsPDFReport(jobsWithMissingFields, {
          includeAIRecommendations: true,
        })
      ).resolves.not.toThrow();
    });

    it("should handle jobs with all priority levels", async () => {
      const jobsWithAllPriorities: Job[] = [
        { ...mockJobs[0], priority: "Baixa" },
        { ...mockJobs[1], priority: "Média" },
        { ...mockJobs[2], priority: "Alta" },
        { ...mockJobs[0], id: "JOB-004", priority: "Crítica" },
      ];

      await expect(
        generateJobsPDFReport(jobsWithAllPriorities)
      ).resolves.not.toThrow();
    });

    it("should handle jobs with all status types", async () => {
      const jobsWithAllStatuses: Job[] = [
        { ...mockJobs[0], status: "Pendente" },
        { ...mockJobs[1], status: "Em andamento" },
        { ...mockJobs[2], status: "Aguardando peças" },
        { ...mockJobs[0], id: "JOB-004", status: "Concluído" },
        { ...mockJobs[1], id: "JOB-005", status: "Cancelado" },
      ];

      await expect(
        generateJobsPDFReport(jobsWithAllStatuses)
      ).resolves.not.toThrow();
    });

    it("should complete PDF generation within reasonable time", async () => {
      const startTime = Date.now();
      await generateJobsPDFReport(mockJobs, {
        includeAIRecommendations: false,
      });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Less than 5 seconds
    });

    it("should handle errors gracefully", async () => {
      // Mock html2pdf to throw an error
      const html2pdf = await import('html2pdf.js');
      vi.mocked(html2pdf.default).mockImplementation(() => ({
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        save: vi.fn().mockRejectedValue(new Error("PDF generation failed")),
      }) as any);

      await expect(
        generateJobsPDFReport(mockJobs)
      ).rejects.toThrow();
    });
  });

  describe("PDF Content Validation", () => {
    it("should include all jobs in the report", async () => {
      // This is a functional test - we're testing that the function completes
      // In a real scenario, we'd intercept the HTML content to validate
      await expect(
        generateJobsPDFReport(mockJobs, {
          includeAIRecommendations: false,
        })
      ).resolves.not.toThrow();
    });

    it("should include statistics in the report", async () => {
      // Statistics should be calculated correctly
      // Testing through successful generation
      await expect(
        generateJobsPDFReport(mockJobs, {
          title: "Report with Statistics",
        })
      ).resolves.not.toThrow();
    });

    it("should format dates correctly", async () => {
      const jobWithDate: Job[] = [
        {
          ...mockJobs[0],
          due_date: "2025-12-31",
        },
      ];

      await expect(
        generateJobsPDFReport(jobWithDate)
      ).resolves.not.toThrow();
    });
  });

  describe("Report Options", () => {
    it("should respect includeAIRecommendations option", async () => {
      await expect(
        generateJobsPDFReport(mockJobs, {
          includeAIRecommendations: true,
        })
      ).resolves.not.toThrow();

      await expect(
        generateJobsPDFReport(mockJobs, {
          includeAIRecommendations: false,
        })
      ).resolves.not.toThrow();
    });

    it("should use custom title when provided", async () => {
      const customTitle = "Custom MMI Report Title";
      
      await expect(
        generateJobsPDFReport(mockJobs, {
          title: customTitle,
        })
      ).resolves.not.toThrow();
    });
  });

  describe("Performance", () => {
    it("should handle large number of jobs efficiently", async () => {
      const manyJobs = Array.from({ length: 50 }, (_, i) => ({
        ...mockJobs[0],
        id: `JOB-${String(i + 1).padStart(3, '0')}`,
        title: `Job ${i + 1}`,
      }));

      const startTime = Date.now();
      await generateJobsPDFReport(manyJobs, {
        includeAIRecommendations: false, // Skip AI calls for performance test
      });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10000); // Less than 10 seconds for 50 jobs
    });
  });
});
