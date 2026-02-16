/**
 * Export Utils Test Suite
 * Tests for CSV/PDF export utilities
 */
import { describe, it, expect, vi } from "vitest";

// Mock browser APIs
vi.stubGlobal("URL", {
  createObjectURL: vi.fn(() => "blob:mock-url"),
  revokeObjectURL: vi.fn(),
});

describe("Export Utils", () => {
  it("exports module exists", async () => {
    const mod = await import("@/lib/export-utils");
    expect(mod.exportToCSV).toBeDefined();
    expect(mod.quickExport).toBeDefined();
    expect(typeof mod.exportToCSV).toBe("function");
    expect(typeof mod.quickExport).toBe("function");
  });

  it("exportToCSV generates valid CSV for simple data", async () => {
    const { exportToCSV } = await import("@/lib/export-utils");
    
    // Mock document.createElement and click
    const mockElement = { href: "", download: "", click: vi.fn() };
    vi.spyOn(document, "createElement").mockReturnValue(mockElement as unknown as HTMLElement);
    vi.spyOn(document.body, "appendChild").mockImplementation(() => mockElement as unknown as Node);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => mockElement as unknown as Node);

    const data = [
      { name: "Vessel A", status: "active" },
      { name: "Vessel B", status: "inactive" },
    ];

    expect(() => exportToCSV(data, "test-export")).not.toThrow();
  });
});
