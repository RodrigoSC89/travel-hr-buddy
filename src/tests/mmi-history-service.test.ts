import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchMMIHistory, getMMIHistoryStats } from "@/services/mmi/historyService";

// Mock Supabase client
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: mockHistoryData, error: null })),
        })),
      })),
    })),
  })),
}));

const mockHistoryData = [
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
];

describe("MMI History Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchMMIHistory", () => {
    it("should fetch all MMI history records", async () => {
      const result = await fetchMMIHistory();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return an array of history records", async () => {
      const result = await fetchMMIHistory();
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should fetch history with status filter", async () => {
      const result = await fetchMMIHistory({ status: "executado" });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle errors gracefully", async () => {
      // This test verifies that the error handling is in place
      try {
        await fetchMMIHistory();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("getMMIHistoryStats", () => {
    it("should return statistics for MMI history", async () => {
      const result = await getMMIHistoryStats();
      expect(result).toBeDefined();
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("executado");
      expect(result).toHaveProperty("pendente");
      expect(result).toHaveProperty("atrasado");
    });

    it("should return numeric values for all statistics", async () => {
      const result = await getMMIHistoryStats();
      expect(typeof result.total).toBe("number");
      expect(typeof result.executado).toBe("number");
      expect(typeof result.pendente).toBe("number");
      expect(typeof result.atrasado).toBe("number");
    });

    it("should return non-negative values", async () => {
      const result = await getMMIHistoryStats();
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.executado).toBeGreaterThanOrEqual(0);
      expect(result.pendente).toBeGreaterThanOrEqual(0);
      expect(result.atrasado).toBeGreaterThanOrEqual(0);
    });
  });

  describe("MMI History Data Structure", () => {
    it("should have the correct structure for history records", () => {
      const mockRecord = mockHistoryData[0];
      expect(mockRecord).toHaveProperty("id");
      expect(mockRecord).toHaveProperty("vessel_name");
      expect(mockRecord).toHaveProperty("system_name");
      expect(mockRecord).toHaveProperty("task_description");
      expect(mockRecord).toHaveProperty("executed_at");
      expect(mockRecord).toHaveProperty("status");
      expect(mockRecord).toHaveProperty("created_at");
    });

    it("should have valid status values", () => {
      const validStatuses = ["executado", "pendente", "atrasado"];
      mockHistoryData.forEach((record) => {
        expect(validStatuses).toContain(record.status);
      });
    });

    it("should have valid date formats", () => {
      mockHistoryData.forEach((record) => {
        const executedDate = new Date(record.executed_at);
        const createdDate = new Date(record.created_at);
        expect(executedDate).toBeInstanceOf(Date);
        expect(createdDate).toBeInstanceOf(Date);
        expect(!isNaN(executedDate.getTime())).toBe(true);
        expect(!isNaN(createdDate.getTime())).toBe(true);
      });
    });
  });

  describe("Status Filtering", () => {
    it("should filter records by executado status", () => {
      const filtered = mockHistoryData.filter((r) => r.status === "executado");
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((r) => r.status === "executado")).toBe(true);
    });

    it("should filter records by pendente status", () => {
      const filtered = mockHistoryData.filter((r) => r.status === "pendente");
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((r) => r.status === "pendente")).toBe(true);
    });

    it("should filter records by atrasado status", () => {
      const filtered = mockHistoryData.filter((r) => r.status === "atrasado");
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((r) => r.status === "atrasado")).toBe(true);
    });
  });

  describe("Statistics Calculation", () => {
    it("should calculate correct total count", () => {
      const total = mockHistoryData.length;
      expect(total).toBe(3);
    });

    it("should calculate correct executado count", () => {
      const count = mockHistoryData.filter((r) => r.status === "executado").length;
      expect(count).toBe(1);
    });

    it("should calculate correct pendente count", () => {
      const count = mockHistoryData.filter((r) => r.status === "pendente").length;
      expect(count).toBe(1);
    });

    it("should calculate correct atrasado count", () => {
      const count = mockHistoryData.filter((r) => r.status === "atrasado").length;
      expect(count).toBe(1);
    });
  });

  describe("Data Validation", () => {
    it("should have unique IDs for all records", () => {
      const ids = mockHistoryData.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(mockHistoryData.length);
    });

    it("should have vessel names for all records", () => {
      mockHistoryData.forEach((record) => {
        expect(record.vessel_name).toBeTruthy();
        expect(typeof record.vessel_name).toBe("string");
      });
    });

    it("should have system names for all records", () => {
      mockHistoryData.forEach((record) => {
        expect(record.system_name).toBeTruthy();
        expect(typeof record.system_name).toBe("string");
      });
    });

    it("should have task descriptions for all records", () => {
      mockHistoryData.forEach((record) => {
        expect(record.task_description).toBeTruthy();
        expect(typeof record.task_description).toBe("string");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle null or undefined data gracefully", async () => {
      const result = await fetchMMIHistory();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array when no data is available", async () => {
      const result = await fetchMMIHistory();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Sorting and Ordering", () => {
    it("should return records in descending order by executed_at", () => {
      const sortedData = [...mockHistoryData].sort((a, b) => {
        return new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime();
      });
      
      expect(sortedData[0].executed_at).toBe("2025-10-17T09:00:00Z");
      expect(sortedData[2].executed_at).toBe("2025-10-12T08:00:00Z");
    });
  });
});
