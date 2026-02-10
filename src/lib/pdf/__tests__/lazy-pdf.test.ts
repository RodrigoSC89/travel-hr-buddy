import { describe, it, expect, vi } from "vitest";

// Mock jspdf and jspdf-autotable
vi.mock("jspdf", () => ({
  default: class MockJsPDF {
    text() {}
    save() {}
    output() { return "mock-pdf"; }
  },
}));

vi.mock("jspdf-autotable", () => ({
  default: vi.fn(),
}));

describe("lazy-pdf", () => {
  it("should lazy load jsPDF on first call", async () => {
    const { getJsPDF } = await import("@/lib/pdf/lazy-pdf");
    const JsPDF = await getJsPDF();
    expect(JsPDF).toBeDefined();
  });

  it("should cache jsPDF on subsequent calls", async () => {
    const { getJsPDF } = await import("@/lib/pdf/lazy-pdf");
    const first = await getJsPDF();
    const second = await getJsPDF();
    expect(first).toBe(second);
  });

  it("should create PDF document via createPDF", async () => {
    const { createPDF } = await import("@/lib/pdf/lazy-pdf");
    const doc = await createPDF();
    expect(doc).toBeDefined();
    expect(typeof doc.text).toBe("function");
  });
});
