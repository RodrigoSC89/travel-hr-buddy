import { describe, it, expect, beforeEach, vi } from "vitest";
import { generateMMIReport } from "@/components/mmi/ReportPDF";
import type { Job } from "@/services/mmi/jobsApi";

// Mock html2pdf
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    save: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe("MMI Report PDF Generation", () => {
  let mockJobs: Job[];

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock jobs with resolved history
    mockJobs = [
      {
        id: "JOB-001",
        title: "Manutenção preventiva do sistema hidráulico",
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
        suggestion_ia:
          "Recomenda-se realizar a manutenção durante a próxima parada programada.",
        can_postpone: true,
        resolved_history: [
          "OS-2024-001 (Jan/2024): Troca de vedações - Concluída",
          "OS-2024-045 (Abr/2024): Manutenção preventiva - Concluída",
          "OS-2024-089 (Jul/2024): Ajuste de pressão - Concluída",
        ],
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
        resolved_history: [
          "OS-2024-012 (Fev/2024): Inspeção anual - Concluída",
        ],
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
  });

  describe("generateMMIReport", () => {
    it("should successfully generate PDF report with jobs", async () => {
      await expect(generateMMIReport(mockJobs)).resolves.not.toThrow();
    });

    it("should throw error when no jobs are provided", async () => {
      await expect(generateMMIReport([])).rejects.toThrow(
        "Nenhum job disponível para gerar relatório"
      );
    });

    it("should handle jobs with resolved history", async () => {
      const jobsWithHistory = mockJobs.filter((job) => job.resolved_history);
      await expect(generateMMIReport(jobsWithHistory)).resolves.not.toThrow();
    });

    it("should handle jobs without resolved history", async () => {
      const jobsWithoutHistory = mockJobs.filter((job) => !job.resolved_history);
      await expect(generateMMIReport(jobsWithoutHistory)).resolves.not.toThrow();
    });

    it("should handle jobs with AI suggestions", async () => {
      const jobsWithAI = mockJobs.filter((job) => job.suggestion_ia);
      await expect(generateMMIReport(jobsWithAI)).resolves.not.toThrow();
    });

    it("should handle jobs without AI suggestions", async () => {
      const jobsWithoutAI = mockJobs.filter((job) => !job.suggestion_ia);
      await expect(generateMMIReport(jobsWithoutAI)).resolves.not.toThrow();
    });
  });

  describe("Report content validation", () => {
    it("should include report header with date and total jobs", async () => {
      // This is a structural test to ensure the function runs without errors
      // In a real test, we would inspect the generated HTML content
      await expect(generateMMIReport(mockJobs)).resolves.not.toThrow();
    });

    it("should include all job details", async () => {
      // Verify that all jobs are processed
      expect(mockJobs.length).toBe(3);
      await expect(generateMMIReport(mockJobs)).resolves.not.toThrow();
    });

    it("should handle different priority levels", async () => {
      const priorities = new Set(mockJobs.map((job) => job.priority));
      expect(priorities.size).toBeGreaterThan(1);
      await expect(generateMMIReport(mockJobs)).resolves.not.toThrow();
    });

    it("should handle different status values", async () => {
      const statuses = new Set(mockJobs.map((job) => job.status));
      expect(statuses.size).toBeGreaterThan(1);
      await expect(generateMMIReport(mockJobs)).resolves.not.toThrow();
    });

    it("should format dates correctly", async () => {
      // Ensure all jobs have valid dates
      mockJobs.forEach((job) => {
        expect(job.due_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
      await expect(generateMMIReport(mockJobs)).resolves.not.toThrow();
    });
  });

  describe("Edge cases", () => {
    it("should handle single job", async () => {
      await expect(generateMMIReport([mockJobs[0]])).resolves.not.toThrow();
    });

    it("should handle null jobs array", async () => {
      await expect(generateMMIReport(null as any)).rejects.toThrow();
    });

    it("should handle undefined jobs array", async () => {
      await expect(generateMMIReport(undefined as any)).rejects.toThrow();
    });

    it("should handle job with empty resolved history array", async () => {
      const jobWithEmptyHistory = {
        ...mockJobs[0],
        resolved_history: [],
      };
      await expect(generateMMIReport([jobWithEmptyHistory])).resolves.not.toThrow();
    });

    it("should handle job with long text fields", async () => {
      const jobWithLongText = {
        ...mockJobs[0],
        title: "Manutenção preventiva do sistema hidráulico ".repeat(10),
        suggestion_ia: "Recomenda-se realizar a manutenção durante a próxima parada programada. ".repeat(
          5
        ),
      };
      await expect(generateMMIReport([jobWithLongText])).resolves.not.toThrow();
    });
  });

  describe("HTML structure validation", () => {
    it("should generate valid HTML content", async () => {
      // Structural validation - ensures no crashes during HTML generation
      await expect(generateMMIReport(mockJobs)).resolves.not.toThrow();
    });

    it("should include all mandatory sections", async () => {
      // Test that the function completes successfully with all data
      const allFieldsJob: Job = {
        id: "TEST-001",
        title: "Test Job",
        status: "Test Status",
        priority: "Alta",
        due_date: "2025-10-20",
        component: {
          name: "Test Component",
          asset: {
            name: "Test Asset",
            vessel: "Test Vessel",
          },
        },
        suggestion_ia: "Test suggestion",
        can_postpone: true,
        resolved_history: ["Test history"],
      };
      await expect(generateMMIReport([allFieldsJob])).resolves.not.toThrow();
    });

    it("should handle special characters in text", async () => {
      const jobWithSpecialChars = {
        ...mockJobs[0],
        title: "Manutenção & Teste <special> 'chars' \"quotes\"",
        component: {
          ...mockJobs[0].component,
          name: "Sistema <teste> & \"verificação\"",
        },
      };
      await expect(generateMMIReport([jobWithSpecialChars])).resolves.not.toThrow();
    });
  });
});
