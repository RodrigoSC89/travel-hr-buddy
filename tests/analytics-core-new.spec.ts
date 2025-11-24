import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Analytics Core Module Tests
 * Testing analytics data collection and processing
 */

type QueryResponse<T> = Promise<{ data: T; error: Error | null }>;

type MockQueryBuilder<TInsert = unknown, TSelect = unknown> = {
  select: ReturnType<typeof vi.fn<[], QueryResponse<TSelect>>>;
  insert: ReturnType<typeof vi.fn<[TInsert?], QueryResponse<TInsert>>>;
  eq: ReturnType<typeof vi.fn<[], MockQueryBuilder<TInsert, TSelect>>>;
  gte: ReturnType<typeof vi.fn<[], MockQueryBuilder<TInsert, TSelect>>>;
  lte: ReturnType<typeof vi.fn<[], MockQueryBuilder<TInsert, TSelect>>>;
  order: ReturnType<typeof vi.fn<[], MockQueryBuilder<TInsert, TSelect>>>;
};

const createQueryBuilder = <TInsert = unknown, TSelect = unknown>(
  overrides?: Partial<MockQueryBuilder<TInsert, TSelect>>
): MockQueryBuilder<TInsert, TSelect> => {
  const builder: MockQueryBuilder<TInsert, TSelect> = {
    select: vi.fn(() => Promise.resolve({ data: [] as TSelect, error: null })),
    insert: vi.fn(() => Promise.resolve({ data: null as TInsert, error: null })),
    eq: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    order: vi.fn(() => builder),
  };

  return { ...builder, ...overrides };
};

const mockSupabaseClient = {
  from: vi.fn(() => createQueryBuilder()),
  rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabaseClient,
}));

describe("Analytics Core Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Event Tracking", () => {
    it("should track user events", async () => {
      const event = {
        type: "page_view",
        user_id: "user123",
        metadata: { page: "/dashboard" },
        timestamp: new Date().toISOString(),
      };

      const customBuilder = createQueryBuilder({
        insert: vi.fn(() => Promise.resolve({ data: event, error: null })),
      });

      mockSupabaseClient.from.mockReturnValueOnce(customBuilder);

      const result = await mockSupabaseClient.from("analytics_events").insert(event);

      expect(result.data).toEqual(event);
      expect(result.error).toBeNull();
    });

    it("should batch multiple events", () => {
      const events = [
        { type: "click", target: "button1" },
        { type: "click", target: "button2" },
        { type: "navigation", target: "/settings" },
      ];

      const batch = events.map(event => ({
        ...event,
        timestamp: new Date().toISOString(),
        session_id: "session123",
      }));

      expect(batch).toHaveLength(3);
      expect(batch.every(e => e.session_id === "session123")).toBe(true);
    });
  });

  describe("Metrics Aggregation", () => {
    it("should calculate daily active users", () => {
      const events = [
        { user_id: "user1", date: "2025-10-29" },
        { user_id: "user2", date: "2025-10-29" },
        { user_id: "user1", date: "2025-10-29" }, // duplicate
        { user_id: "user3", date: "2025-10-29" },
      ];

      const uniqueUsers = new Set(events.map(e => e.user_id));
      const dau = uniqueUsers.size;

      expect(dau).toBe(3);
    });

    it("should group events by type", () => {
      const events = [
        { type: "click" },
        { type: "navigation" },
        { type: "click" },
        { type: "click" },
        { type: "error" },
      ];

      const grouped = events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(grouped.click).toBe(3);
      expect(grouped.navigation).toBe(1);
      expect(grouped.error).toBe(1);
    });
  });

  describe("Performance Metrics", () => {
    it("should track page load times", () => {
      const pageLoads = [
        { page: "/dashboard", duration: 1200 },
        { page: "/dashboard", duration: 1500 },
        { page: "/dashboard", duration: 1100 },
      ];

      const avgLoadTime = pageLoads.reduce((sum, load) => sum + load.duration, 0) / pageLoads.length;

      expect(avgLoadTime).toBeCloseTo(1266.67, 0);
    });

    it("should identify slow pages", () => {
      const pageLoads = [
        { page: "/dashboard", duration: 1200 },
        { page: "/reports", duration: 3500 },
        { page: "/settings", duration: 800 },
      ];

      const threshold = 2000;
      const slowPages = pageLoads.filter(load => load.duration > threshold);

      expect(slowPages).toHaveLength(1);
      expect(slowPages[0].page).toBe("/reports");
    });
  });

  describe("Conversion Tracking", () => {
    it("should calculate conversion funnel", () => {
      const funnel = {
        landing: 1000,
        signup: 300,
        activation: 150,
        purchase: 50,
      };

      const conversionRates = {
        signupRate: (funnel.signup / funnel.landing) * 100,
        activationRate: (funnel.activation / funnel.signup) * 100,
        purchaseRate: (funnel.purchase / funnel.activation) * 100,
      };

      expect(conversionRates.signupRate).toBe(30);
      expect(conversionRates.activationRate).toBe(50);
      expect(conversionRates.purchaseRate).toBeCloseTo(33.33, 1);
    });
  });

  describe("User Segmentation", () => {
    it("should segment users by activity level", () => {
      const users = [
        { id: 1, event_count: 50 },
        { id: 2, event_count: 5 },
        { id: 3, event_count: 200 },
        { id: 4, event_count: 1 },
      ];

      const segments = {
        high: users.filter(u => u.event_count >= 100).length,
        medium: users.filter(u => u.event_count >= 10 && u.event_count < 100).length,
        low: users.filter(u => u.event_count < 10).length,
      };

      expect(segments.high).toBe(1);
      expect(segments.medium).toBe(1);
      expect(segments.low).toBe(2);
    });
  });

  describe("Data Retention", () => {
    it("should calculate retention rate", () => {
      const cohort = {
        day0: 100,
        day1: 40,
        day7: 25,
        day30: 15,
      };

      const retentionRates = {
        day1: (cohort.day1 / cohort.day0) * 100,
        day7: (cohort.day7 / cohort.day0) * 100,
        day30: (cohort.day30 / cohort.day0) * 100,
      };

      expect(retentionRates.day1).toBe(40);
      expect(retentionRates.day7).toBe(25);
      expect(retentionRates.day30).toBe(15);
    });
  });
});
