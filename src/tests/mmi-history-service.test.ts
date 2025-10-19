import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  fetchMMIHistory,
  getMMIHistoryStats,
  createMMIHistory,
  updateMMIHistory,
  deleteMMIHistory,
  type MMIHistoryFilters,
} from "@/services/mmi/historyService";
import type { MMIHistory } from "@/types/mmi";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          eq: vi.fn(() => ({ data: [], error: null })),
          data: [],
          error: null,
        })),
        eq: vi.fn(() => ({ data: [], error: null })),
        data: [],
        error: null,
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: null, error: null })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
    })),
  },
}));

describe("MMI History Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchMMIHistory", () => {
    it("should fetch all history records without filters", async () => {
      const mockData: MMIHistory[] = [
        {
          id: "1",
          vessel_id: "vessel-1",
          system_name: "Engine System",
          task_description: "Regular maintenance",
          status: "executado",
          executed_at: "2025-10-19T10:00:00Z",
          created_at: "2025-10-19T09:00:00Z",
          vessel: {
            id: "vessel-1",
            name: "Ship A",
          },
        },
      ];

      const { supabase } = await import("@/integrations/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => ({ data: mockData, error: null })),
        })),
      }));
      supabase.from = mockFrom;

      const result = await fetchMMIHistory();

      expect(result).toEqual(mockData);
      expect(mockFrom).toHaveBeenCalledWith("mmi_history");
    });

    it("should fetch history records with status filter", async () => {
      const filters: MMIHistoryFilters = { status: "executado" };
      const mockData: MMIHistory[] = [
        {
          id: "1",
          vessel_id: "vessel-1",
          system_name: "Engine System",
          task_description: "Regular maintenance",
          status: "executado",
          executed_at: "2025-10-19T10:00:00Z",
          created_at: "2025-10-19T09:00:00Z",
          vessel: {
            id: "vessel-1",
            name: "Ship A",
          },
        },
      ];

      const { supabase } = await import("@/integrations/supabase/client");
      const mockEq = vi.fn(() => ({ data: mockData, error: null }));
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            eq: mockEq,
          })),
        })),
      }));
      supabase.from = mockFrom;

      const result = await fetchMMIHistory(filters);

      expect(result).toEqual(mockData);
      expect(mockEq).toHaveBeenCalledWith("status", "executado");
    });

    it("should handle errors when fetching history", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => ({ data: null, error: { message: "Database error" } })),
        })),
      }));
      supabase.from = mockFrom;

      await expect(fetchMMIHistory()).rejects.toThrow("Failed to fetch MMI history");
    });
  });

  describe("getMMIHistoryStats", () => {
    it("should calculate statistics correctly", async () => {
      const mockData = [
        { status: "executado" },
        { status: "executado" },
        { status: "pendente" },
        { status: "atrasado" },
      ];

      const { supabase } = await import("@/integrations/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({ data: mockData, error: null })),
      }));
      supabase.from = mockFrom;

      const result = await getMMIHistoryStats();

      expect(result).toEqual({
        total: 4,
        executado: 2,
        pendente: 1,
        atrasado: 1,
      });
    });

    it("should return zero stats when no data", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({ data: [], error: null })),
      }));
      supabase.from = mockFrom;

      const result = await getMMIHistoryStats();

      expect(result).toEqual({
        total: 0,
        executado: 0,
        pendente: 0,
        atrasado: 0,
      });
    });

    it("should handle errors when fetching stats", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({ data: null, error: { message: "Database error" } })),
      }));
      supabase.from = mockFrom;

      await expect(getMMIHistoryStats()).rejects.toThrow("Failed to fetch MMI history stats");
    });
  });

  describe("createMMIHistory", () => {
    it("should create a new history record", async () => {
      const newHistory = {
        vessel_id: "vessel-1",
        system_name: "Engine System",
        task_description: "Regular maintenance",
        status: "pendente" as const,
      };

      const mockCreated: MMIHistory = {
        id: "new-id",
        ...newHistory,
        created_at: "2025-10-19T09:00:00Z",
        vessel: {
          id: "vessel-1",
          name: "Ship A",
        },
      };

      const { supabase } = await import("@/integrations/supabase/client");
      const mockFrom = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: mockCreated, error: null })),
          })),
        })),
      }));
      supabase.from = mockFrom;

      const result = await createMMIHistory(newHistory);

      expect(result).toEqual(mockCreated);
    });

    it("should handle errors when creating history", async () => {
      const newHistory = {
        vessel_id: "vessel-1",
        system_name: "Engine System",
        task_description: "Regular maintenance",
        status: "pendente" as const,
      };

      const { supabase } = await import("@/integrations/supabase/client");
      const mockFrom = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: null, error: { message: "Insert error" } })),
          })),
        })),
      }));
      supabase.from = mockFrom;

      await expect(createMMIHistory(newHistory)).rejects.toThrow("Failed to create MMI history");
    });
  });

  describe("updateMMIHistory", () => {
    it("should update an existing history record", async () => {
      const updates = {
        status: "executado" as const,
        executed_at: "2025-10-19T10:00:00Z",
      };

      const mockUpdated: MMIHistory = {
        id: "1",
        vessel_id: "vessel-1",
        system_name: "Engine System",
        task_description: "Regular maintenance",
        status: "executado",
        executed_at: "2025-10-19T10:00:00Z",
        created_at: "2025-10-19T09:00:00Z",
        vessel: {
          id: "vessel-1",
          name: "Ship A",
        },
      };

      const { supabase } = await import("@/integrations/supabase/client");
      const mockFrom = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({ data: mockUpdated, error: null })),
            })),
          })),
        })),
      }));
      supabase.from = mockFrom;

      const result = await updateMMIHistory("1", updates);

      expect(result).toEqual(mockUpdated);
    });

    it("should handle errors when updating history", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const mockFrom = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({ data: null, error: { message: "Update error" } })),
            })),
          })),
        })),
      }));
      supabase.from = mockFrom;

      await expect(updateMMIHistory("1", { status: "executado" })).rejects.toThrow(
        "Failed to update MMI history"
      );
    });
  });

  describe("deleteMMIHistory", () => {
    it("should delete a history record", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const mockFrom = vi.fn(() => ({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({ error: null })),
        })),
      }));
      supabase.from = mockFrom;

      await expect(deleteMMIHistory("1")).resolves.toBeUndefined();
    });

    it("should handle errors when deleting history", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const mockFrom = vi.fn(() => ({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({ error: { message: "Delete error" } })),
        })),
      }));
      supabase.from = mockFrom;

      await expect(deleteMMIHistory("1")).rejects.toThrow("Failed to delete MMI history");
    });
  });
});
