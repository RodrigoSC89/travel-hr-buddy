/**
 * Test suite for generateOrderPDF function
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock html2pdf.js before importing the function
vi.mock("html2pdf.js", () => {
  const mockSave = vi.fn();
  const mockFrom = vi.fn(() => ({ save: mockSave }));
  const mockSet = vi.fn(() => ({ from: mockFrom }));
  const mockHtml2pdf = vi.fn(() => ({ set: mockSet }));
  
  return {
    default: mockHtml2pdf,
  };
});

describe("generateOrderPDF", () => {
  const mockOrder = {
    id: "OS-20250001",
    vessel_name: "Navio Teste",
    system_name: "Sistema Hidráulico",
    status: "open",
    priority: "high",
    description: "Manutenção preventiva do sistema hidráulico",
    executed_at: "2025-10-20",
    technician_comment: "Verificar vazamentos",
    created_at: "2025-10-15T10:00:00Z",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should generate PDF without errors", async () => {
    const { generateOrderPDF } = await import("@/lib/pdf/generateOrderPDF");
    expect(() => generateOrderPDF(mockOrder)).not.toThrow();
  });

  it("should handle order without optional fields", async () => {
    const { generateOrderPDF } = await import("@/lib/pdf/generateOrderPDF");
    const minimalOrder = {
      id: "OS-20250002",
      vessel_name: "Navio Teste 2",
      system_name: "Sistema Elétrico",
      status: "in_progress",
      priority: "medium",
      description: "Verificação geral",
      created_at: "2025-10-16T10:00:00Z",
    };

    expect(() => generateOrderPDF(minimalOrder)).not.toThrow();
  });

  it("should handle order with all fields", async () => {
    const { generateOrderPDF } = await import("@/lib/pdf/generateOrderPDF");
    const completeOrder = {
      id: "OS-20250003",
      vessel_name: "Navio Completo",
      system_name: "Sistema Completo",
      status: "completed",
      priority: "critical",
      description: "Teste completo",
      executed_at: "2025-10-22",
      technician_comment: "Todos os campos preenchidos",
      created_at: "2025-10-15T10:00:00Z",
    };

    expect(() => generateOrderPDF(completeOrder)).not.toThrow();
  });
});
