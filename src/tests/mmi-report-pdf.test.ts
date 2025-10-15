import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateMaintenanceReport } from "@/components/mmi/ReportPDF";
import type { Job } from "@/services/mmi/jobsApi";

// Mock html2pdf.js
vi.mock("html2pdf.js", () => {
  const mockSave = vi.fn();
  const mockFrom = vi.fn(() => ({
    save: mockSave,
  }));
  const mockHtml2pdf = vi.fn(() => ({
    from: mockFrom,
  }));

  return {
    default: mockHtml2pdf,
    mockSave,
    mockFrom,
    mockHtml2pdf,
  };
});

describe("ReportPDF - generateMaintenanceReport", () => {
  const mockJobs: Job[] = [
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
      resolved_history:
        "OS-2024-001 (Jan/2024): Troca de vedações - Concluída<br/>OS-2024-045 (Abr/2024): Manutenção preventiva - Concluída",
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
      can_postpone: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call html2pdf with correct content structure", async () => {
    const html2pdfModule = await import("html2pdf.js");
    const { mockHtml2pdf, mockFrom, mockSave } = html2pdfModule as unknown as {
      mockHtml2pdf: ReturnType<typeof vi.fn>;
      mockFrom: ReturnType<typeof vi.fn>;
      mockSave: ReturnType<typeof vi.fn>;
    };

    generateMaintenanceReport(mockJobs);

    expect(mockHtml2pdf).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalled();
    expect(mockSave).toHaveBeenCalled();
  });

  it("should handle jobs with resolved_history", async () => {
    const html2pdfModule = await import("html2pdf.js");
    const { mockFrom } = html2pdfModule as unknown as {
      mockFrom: ReturnType<typeof vi.fn>;
    };

    generateMaintenanceReport(mockJobs);

    const content = mockFrom.mock.calls[0][0];
    expect(content).toContain("Relatório Inteligente de Manutenção");
    expect(content).toContain("Manutenção preventiva do sistema hidráulico");
    expect(content).toContain("OS-2024-001");
    expect(content).toContain("Histórico de OS resolvidas");
  });

  it("should handle jobs without resolved_history", async () => {
    const html2pdfModule = await import("html2pdf.js");
    const { mockFrom } = html2pdfModule as unknown as {
      mockFrom: ReturnType<typeof vi.fn>;
    };

    generateMaintenanceReport([mockJobs[1]]);

    const content = mockFrom.mock.calls[0][0];
    expect(content).toContain("Inspeção de válvulas de segurança");
    expect(content).not.toContain("OS-2024-001");
  });

  it("should include total number of jobs in report", async () => {
    const html2pdfModule = await import("html2pdf.js");
    const { mockFrom } = html2pdfModule as unknown as {
      mockFrom: ReturnType<typeof vi.fn>;
    };

    generateMaintenanceReport(mockJobs);

    const content = mockFrom.mock.calls[0][0];
    expect(content).toContain("Total de Jobs:");
    expect(content).toContain("2");
  });

  it("should include job details in report", async () => {
    const html2pdfModule = await import("html2pdf.js");
    const { mockFrom } = html2pdfModule as unknown as {
      mockFrom: ReturnType<typeof vi.fn>;
    };

    generateMaintenanceReport(mockJobs);

    const content = mockFrom.mock.calls[0][0];
    expect(content).toContain("Manutenção preventiva do sistema hidráulico");
    expect(content).toContain("Sistema Hidráulico Principal");
    expect(content).toContain("Alta");
    expect(content).toContain("2025-10-20");
  });

  it("should generate PDF with correct filename format", async () => {
    const html2pdfModule = await import("html2pdf.js");
    const { mockSave } = html2pdfModule as unknown as {
      mockSave: ReturnType<typeof vi.fn>;
    };

    generateMaintenanceReport(mockJobs);

    expect(mockSave).toHaveBeenCalled();
    const filename = mockSave.mock.calls[0][0];
    expect(filename).toMatch(/^Relatorio-MMI-.*\.pdf$/);
  });
});
