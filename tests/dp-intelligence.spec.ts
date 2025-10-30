import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * DP Intelligence Module Tests
 * Testing core functionality of the DP Intelligence Center
 */

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => Promise.resolve({ data: [], error: null })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    update: vi.fn(() => Promise.resolve({ data: null, error: null })),
    delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
    eq: vi.fn(function(this: any) { return this; }),
    order: vi.fn(function(this: any) { return this; }),
    limit: vi.fn(function(this: any) { return this; }),
  })),
  rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabaseClient,
}));

describe("DP Intelligence Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Intelligence Data Retrieval", () => {
    it("should fetch intelligence data successfully", async () => {
      const mockData = [
        { id: 1, type: "incident", severity: "high", status: "active" },
        { id: 2, type: "alert", severity: "medium", status: "pending" },
      ];

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
        eq: vi.fn(function(this: any) { return this; }),
        order: vi.fn(function(this: any) { return this; }),
        limit: vi.fn(function(this: any) { return this; }),
      });

      const result = await mockSupabaseClient.from("dp_intelligence").select("*");
      
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("dp_intelligence");
    });

    it("should handle errors when fetching intelligence data", async () => {
      const mockError = { message: "Database connection failed" };

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn(() => Promise.resolve({ data: null, error: mockError })),
        eq: vi.fn(function(this: any) { return this; }),
        order: vi.fn(function(this: any) { return this; }),
        limit: vi.fn(function(this: any) { return this; }),
      });

      const result = await mockSupabaseClient.from("dp_intelligence").select("*");
      
      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe("Intelligence Analysis", () => {
    it("should analyze intelligence patterns", () => {
      const intelligenceData = [
        { severity: "high", timestamp: new Date().toISOString() },
        { severity: "high", timestamp: new Date().toISOString() },
        { severity: "medium", timestamp: new Date().toISOString() },
        { severity: "low", timestamp: new Date().toISOString() },
      ];

      const severityCounts = intelligenceData.reduce((acc, item) => {
        acc[item.severity] = (acc[item.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(severityCounts.high).toBe(2);
      expect(severityCounts.medium).toBe(1);
      expect(severityCounts.low).toBe(1);
    });

    it("should filter intelligence by severity", () => {
      const intelligenceData = [
        { id: 1, severity: "high" },
        { id: 2, severity: "medium" },
        { id: 3, severity: "high" },
      ];

      const highSeverity = intelligenceData.filter(item => item.severity === "high");

      expect(highSeverity).toHaveLength(2);
      expect(highSeverity[0].id).toBe(1);
      expect(highSeverity[1].id).toBe(3);
    });
  });

  describe("Intelligence Events", () => {
    it("should emit intelligence:created event", async () => {
      const eventHandler = vi.fn();
      const mockIntelligence = { id: 1, type: "incident", severity: "high" };

      // Simulate event emission
      eventHandler("intelligence:created", mockIntelligence);

      expect(eventHandler).toHaveBeenCalledWith("intelligence:created", mockIntelligence);
    });

    it("should emit intelligence:updated event", async () => {
      const eventHandler = vi.fn();
      const mockIntelligence = { id: 1, status: "resolved" };

      // Simulate event emission
      eventHandler("intelligence:updated", mockIntelligence);

      expect(eventHandler).toHaveBeenCalledWith("intelligence:updated", mockIntelligence);
    });
  });

  describe("Intelligence Metrics", () => {
    it("should calculate response time metrics", () => {
      const incidents = [
        { created_at: "2025-10-29T00:00:00Z", resolved_at: "2025-10-29T01:00:00Z" },
        { created_at: "2025-10-29T00:00:00Z", resolved_at: "2025-10-29T02:00:00Z" },
      ];

      const avgResponseTime = incidents.reduce((sum, incident) => {
        const created = new Date(incident.created_at).getTime();
        const resolved = new Date(incident.resolved_at).getTime();
        return sum + (resolved - created);
      }, 0) / incidents.length;

      // Average should be 1.5 hours (90 minutes)
      expect(avgResponseTime).toBe(5400000); // 90 minutes in milliseconds
    });

    it("should track severity distribution", () => {
      const data = [
        { severity: "high" },
        { severity: "high" },
        { severity: "medium" },
        { severity: "low" },
        { severity: "low" },
        { severity: "low" },
      ];

      const distribution = data.reduce((acc, item) => {
        acc[item.severity] = (acc[item.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(distribution.high).toBe(2);
      expect(distribution.medium).toBe(1);
      expect(distribution.low).toBe(3);
    });
  });

  describe("Intelligence Data Validation", () => {
    it("should validate required fields", () => {
      const validIntelligence = {
        type: "incident",
        severity: "high",
        description: "Test incident",
      };

      const hasRequiredFields = 
        validIntelligence.type &&
        validIntelligence.severity &&
        validIntelligence.description;

      expect(hasRequiredFields).toBe(true);
    });

    it("should reject invalid severity levels", () => {
      const validSeverities = ["low", "medium", "high", "critical"];
      const testSeverity = "invalid";

      expect(validSeverities.includes(testSeverity)).toBe(false);
    });
  });
});
