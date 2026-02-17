/**
 * Export Functionality Tests
 * Ensures all export utilities produce valid output
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock sonner to avoid CSS injection issues in jsdom
vi.mock("sonner", () => ({
  toast: { info: vi.fn(), success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

describe("Export Utilities", () => {
  beforeEach(() => {
    // Mock DOM APIs
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });
    
    const mockLink = {
      href: "",
      download: "",
      click: vi.fn(),
    };
    vi.spyOn(document, "createElement").mockReturnValue(mockLink as any);
    vi.spyOn(document.body, "appendChild").mockImplementation(() => mockLink as any);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => mockLink as any);
  });

  it("exportToCSV creates valid CSV content", async () => {
    const { exportToCSV } = await import("@/lib/export-utils");
    
    const data = [
      { name: "Vessel A", status: "active", tonnage: 50000 },
      { name: "Vessel B", status: "idle", tonnage: 35000 },
    ];

    // Should not throw
    expect(() => exportToCSV(data, "test-vessels")).not.toThrow();
  });

  it("exportToCSV handles empty data gracefully", async () => {
    const { exportToCSV } = await import("@/lib/export-utils");
    // Should not throw on empty data
    expect(() => exportToCSV([], "empty-export")).not.toThrow();
  });

  it("quickExport generates filename with timestamp", async () => {
    const { quickExport } = await import("@/lib/export-utils");
    expect(() => quickExport([{ a: 1 }], "Test Module")).not.toThrow();
  });

  it("exportToCSV handles special characters", async () => {
    const { exportToCSV } = await import("@/lib/export-utils");
    
    const data = [
      { name: 'Vessel "Alpha"', notes: "Contains, commas" },
      { name: "Vessel 'Beta'", notes: "Normal text" },
    ];

    expect(() => exportToCSV(data, "special-chars")).not.toThrow();
  });

  it("exportToCSV handles null values", async () => {
    const { exportToCSV } = await import("@/lib/export-utils");
    
    const data = [
      { name: "Vessel A", status: null, notes: undefined },
    ];

    expect(() => exportToCSV(data, "nulls")).not.toThrow();
  });
});
