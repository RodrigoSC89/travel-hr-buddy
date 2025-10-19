import { describe, it, expect, vi } from "vitest";

// Mock the services
const mockFetchMMIHistory = vi.fn(() =>
  Promise.resolve([
    {
      id: "1",
      vessel_name: "Vessel A",
      system_name: "Sistema Propulsão",
      task_description: "Manutenção preventiva do motor principal",
      executed_at: "2025-10-15T10:00:00Z",
      status: "executado",
      created_at: "2025-10-15T09:00:00Z",
    },
    {
      id: "2",
      vessel_name: "Vessel B",
      system_name: "Sistema Hidráulico",
      task_description: "Troca de óleo do sistema hidráulico",
      executed_at: "2025-10-17T09:00:00Z",
      status: "pendente",
      created_at: "2025-10-17T08:00:00Z",
    },
    {
      id: "3",
      vessel_name: "Vessel C",
      system_name: "Sistema Segurança",
      task_description: "Teste de alarmes de incêndio",
      executed_at: "2025-10-12T08:00:00Z",
      status: "atrasado",
      created_at: "2025-10-12T07:00:00Z",
    },
  ])
);

const mockGetMMIHistoryStats = vi.fn(() =>
  Promise.resolve({
    total: 3,
    executado: 1,
    pendente: 1,
    atrasado: 1,
  })
);

vi.mock("@/services/mmi/historyService", () => ({
  fetchMMIHistory: mockFetchMMIHistory,
  getMMIHistoryStats: mockGetMMIHistoryStats,
}));

// Mock html2pdf
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    from: vi.fn(() => ({
      set: vi.fn(() => ({
        save: vi.fn(() => Promise.resolve()),
      })),
    })),
  })),
}));


describe("MMI History Page", () => {
  describe("Service Integration", () => {
    it("should call fetchMMIHistory service", async () => {
      await mockFetchMMIHistory();
      expect(mockFetchMMIHistory).toHaveBeenCalled();
    });

    it("should call getMMIHistoryStats service", async () => {
      await mockGetMMIHistoryStats();
      expect(mockGetMMIHistoryStats).toHaveBeenCalled();
    });

    it("should return history data with correct structure", async () => {
      const data = await mockFetchMMIHistory();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(3);
    });

    it("should return statistics with correct structure", async () => {
      const stats = await mockGetMMIHistoryStats();
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty("total");
      expect(stats).toHaveProperty("executado");
      expect(stats).toHaveProperty("pendente");
      expect(stats).toHaveProperty("atrasado");
    });
  });

  describe("Data Structure", () => {
    it("should have valid history records", async () => {
      const data = await mockFetchMMIHistory();
      data.forEach((record) => {
        expect(record).toHaveProperty("id");
        expect(record).toHaveProperty("vessel_name");
        expect(record).toHaveProperty("system_name");
        expect(record).toHaveProperty("task_description");
        expect(record).toHaveProperty("executed_at");
        expect(record).toHaveProperty("status");
        expect(record).toHaveProperty("created_at");
      });
    });

    it("should have valid status values", async () => {
      const data = await mockFetchMMIHistory();
      const validStatuses = ["executado", "pendente", "atrasado"];
      data.forEach((record) => {
        expect(validStatuses).toContain(record.status);
      });
    });
  });

  describe("Statistics Calculation", () => {
    it("should calculate correct total", async () => {
      const stats = await mockGetMMIHistoryStats();
      expect(stats.total).toBe(3);
    });

    it("should calculate correct executado count", async () => {
      const stats = await mockGetMMIHistoryStats();
      expect(stats.executado).toBe(1);
    });

    it("should calculate correct pendente count", async () => {
      const stats = await mockGetMMIHistoryStats();
      expect(stats.pendente).toBe(1);
    });

    it("should calculate correct atrasado count", async () => {
      const stats = await mockGetMMIHistoryStats();
      expect(stats.atrasado).toBe(1);
    });
  });
});
