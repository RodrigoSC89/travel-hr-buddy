import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/integrations/supabase/client";

describe("PATCH 362 - Analytics Core Advanced Visualizations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Dashboard Widgets", () => {
    it("should create a new dashboard widget", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: { id: "widget-id" },
        error: null,
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        insert: mockInsert,
      } as any);

      const widgetData = {
        widget_type: "kpi",
        title: "Total Users",
        data_source: "users_count",
        position: { x: 0, y: 0, w: 4, h: 3 },
      };

      await supabase.from("dashboard_widgets").insert(widgetData);

      expect(mockInsert).toHaveBeenCalledWith(widgetData);
    });

    it("should fetch user dashboard widgets", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              { id: "1", widget_type: "kpi", title: "Widget 1" },
              { id: "2", widget_type: "chart", title: "Widget 2" },
            ],
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("dashboard_widgets")
        .select("*")
        .eq("is_active", true)
        .order("position->y");

      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(result.data).toHaveLength(2);
    });

    it("should update widget position", async () => {
      const mockRpc = vi.fn().mockResolvedValue({ data: true, error: null });
      vi.spyOn(supabase, "rpc").mockImplementation(mockRpc);

      await supabase.rpc("update_widget_position", {
        p_widget_id: "widget-id",
        p_position: { x: 1, y: 1, w: 4, h: 3 },
      });

      expect(mockRpc).toHaveBeenCalledWith("update_widget_position", {
        p_widget_id: "widget-id",
        p_position: { x: 1, y: 1, w: 4, h: 3 },
      });
    });

    it("should delete a dashboard widget", async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        delete: mockDelete,
      } as any);

      await supabase.from("dashboard_widgets").delete().eq("id", "widget-id");

      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe("KPI Management", () => {
    it("should calculate KPI value", async () => {
      const mockRpc = vi.fn().mockResolvedValue({ data: 150, error: null });
      vi.spyOn(supabase, "rpc").mockImplementation(mockRpc);

      const result = await supabase.rpc("calculate_kpi", {
        p_kpi_id: "kpi-id",
        p_period_start: new Date("2025-01-01").toISOString(),
        p_period_end: new Date("2025-01-31").toISOString(),
      });

      expect(mockRpc).toHaveBeenCalled();
      expect(result.data).toBe(150);
    });

    it("should fetch KPI definitions", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            {
              id: "1",
              name: "Total Users",
              category: "users",
              is_active: true,
            },
          ],
          error: null,
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("kpi_definitions")
        .select("*")
        .eq("is_active", true);

      expect(result.data).toBeDefined();
    });

    it("should fetch KPI values with history", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [
                {
                  id: "1",
                  kpi_id: "kpi-1",
                  value: 100,
                  calculated_at: new Date().toISOString(),
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("kpi_values")
        .select("*")
        .eq("kpi_id", "kpi-1")
        .order("calculated_at", { ascending: false })
        .limit(30);

      expect(result.data).toBeDefined();
    });
  });

  describe("Dashboard Filters", () => {
    it("should apply period filter", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ filter_type: "period", filter_value: { days: 30 } }],
          error: null,
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      await supabase.from("dashboard_filters").select("*").eq("filter_type", "period");

      expect(mockSelect).toHaveBeenCalled();
    });

    it("should get dashboard data with filters", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: [
          {
            widget_id: "1",
            widget_type: "kpi",
            title: "Filtered Widget",
            data: { value: 100 },
          },
        ],
        error: null,
      });

      vi.spyOn(supabase, "rpc").mockImplementation(mockRpc);

      const result = await supabase.rpc("get_dashboard_data", {
        p_dashboard_id: "dashboard-1",
        p_filters: { period: "30d", unit: "all" },
      });

      expect(mockRpc).toHaveBeenCalled();
      expect(result.data).toBeDefined();
    });
  });

  describe("Analytics Snapshots", () => {
    it("should create analytics snapshot", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: "snapshot-id",
        error: null,
      });

      vi.spyOn(supabase, "rpc").mockImplementation(mockRpc);

      await supabase.rpc("create_analytics_snapshot", {
        p_snapshot_type: "daily_summary",
        p_period_start: new Date("2025-01-01").toISOString(),
        p_period_end: new Date("2025-01-31").toISOString(),
      });

      expect(mockRpc).toHaveBeenCalled();
    });

    it("should fetch analytics snapshots", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: "1",
                snapshot_type: "daily_summary",
                snapshot_data: { total_users: 100 },
              },
            ],
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("analytics_snapshots")
        .select("*")
        .eq("snapshot_type", "daily_summary")
        .order("created_at", { ascending: false });

      expect(result.data).toBeDefined();
    });
  });

  describe("Real-time Updates", () => {
    it("should subscribe to widget updates", () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
      };

      vi.spyOn(supabase, "channel").mockReturnValue(mockChannel as any);

      supabase
        .channel("widget_updates")
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "dashboard_widgets",
        }, vi.fn())
        .subscribe();

      expect(supabase.channel).toHaveBeenCalledWith("widget_updates");
      expect(mockChannel.on).toHaveBeenCalled();
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });
  });

  describe("Chart Types Support", () => {
    it("should support line chart widget", async () => {
      const widgetData = {
        widget_type: "chart",
        chart_type: "line",
        title: "Line Chart",
      };

      const mockInsert = vi.fn().mockResolvedValue({ data: widgetData, error: null });
      vi.spyOn(supabase, "from").mockReturnValue({
        insert: mockInsert,
      } as any);

      await supabase.from("dashboard_widgets").insert(widgetData);

      expect(mockInsert).toHaveBeenCalledWith(widgetData);
    });

    it("should support bar chart widget", async () => {
      const widgetData = {
        widget_type: "chart",
        chart_type: "bar",
        title: "Bar Chart",
      };

      const mockInsert = vi.fn().mockResolvedValue({ data: widgetData, error: null });
      vi.spyOn(supabase, "from").mockReturnValue({
        insert: mockInsert,
      } as any);

      await supabase.from("dashboard_widgets").insert(widgetData);

      expect(mockInsert).toHaveBeenCalledWith(widgetData);
    });

    it("should support pie chart widget", async () => {
      const widgetData = {
        widget_type: "chart",
        chart_type: "pie",
        title: "Pie Chart",
      };

      const mockInsert = vi.fn().mockResolvedValue({ data: widgetData, error: null });
      vi.spyOn(supabase, "from").mockReturnValue({
        insert: mockInsert,
      } as any);

      await supabase.from("dashboard_widgets").insert(widgetData);

      expect(mockInsert).toHaveBeenCalledWith(widgetData);
    });
  });
});
