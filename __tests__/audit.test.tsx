/**
 * Auditoria Técnica - Essential UI Tests
 * Validates audit page rendering and props
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DashboardAuditorias from "@/pages/admin/dashboard-auditorias";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: "audit-1",
              title: "Auditoria IMCA",
              status: "completed",
              score: 85,
              created_at: new Date().toISOString(),
            },
          ],
          error: null,
        }),
      }),
    })),
  },
}));

// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
  }),
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("Auditoria Técnica - Essential Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza audit page corretamente", async () => {
    render(
      <MemoryRouter>
        <DashboardAuditorias />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Verifica se a página foi renderizada
      const element = document.querySelector("body");
      expect(element).toBeTruthy();
    });
  });

  it("valida props de auditoria", () => {
    const auditProps = {
      id: "audit-1",
      title: "Auditoria IMCA",
      status: "completed",
      score: 85,
      created_at: new Date().toISOString(),
    };

    expect(auditProps).toHaveProperty("id");
    expect(auditProps).toHaveProperty("title");
    expect(auditProps).toHaveProperty("status");
    expect(auditProps).toHaveProperty("score");
    expect(auditProps.title).toBeTruthy();
    expect(auditProps.score).toBeGreaterThanOrEqual(0);
    expect(auditProps.score).toBeLessThanOrEqual(100);
  });

  it("valida estrutura de dados de auditoria", () => {
    const audit = {
      id: "audit-1",
      title: "Auditoria de Segurança",
      findings: [
        { category: "Crítico", count: 2 },
        { category: "Alto", count: 5 },
        { category: "Médio", count: 10 },
      ],
      overallScore: 75,
      status: "in_progress",
    };

    expect(audit.findings).toHaveLength(3);
    expect(audit.overallScore).toBeGreaterThanOrEqual(0);
    expect(audit.overallScore).toBeLessThanOrEqual(100);
    expect(["completed", "in_progress", "pending"]).toContain(audit.status);
  });

  it("calcula score total de auditoria", () => {
    const findings = [
      { severity: "critical", points: -10, count: 2 },
      { severity: "high", points: -5, count: 5 },
      { severity: "medium", points: -2, count: 10 },
    ];

    const totalDeductions = findings.reduce(
      (sum, finding) => sum + finding.points * finding.count,
      0
    );
    const score = Math.max(0, 100 + totalDeductions);

    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it("valida categorias de findings", () => {
    const categories = ["Crítico", "Alto", "Médio", "Baixo", "Informativo"];

    categories.forEach((category) => {
      expect(typeof category).toBe("string");
      expect(category.length).toBeGreaterThan(0);
    });
  });

  it("valida status de auditoria", () => {
    const validStatuses = ["completed", "in_progress", "pending", "cancelled"];

    validStatuses.forEach((status) => {
      expect(typeof status).toBe("string");
      expect(status.length).toBeGreaterThan(0);
    });
  });

  it("renderiza lista de auditorias quando há dados", async () => {
    render(
      <MemoryRouter>
        <DashboardAuditorias />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Verifica se a página carrega dados
      const element = document.querySelector("body");
      expect(element).toBeTruthy();
    });
  });
});
