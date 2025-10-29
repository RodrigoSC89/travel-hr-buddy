/**
 * Tests for PATCH 547 - AI Trust Analysis Engine
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { calculateTrustScore, getTrustScoreHistory } from "../calculateTrustScore";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      error: null,
    })),
  })),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

describe("calculateTrustScore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a trust score object with all required fields", async () => {
    const input = {
      entityId: "test-user-123",
      entityType: "user" as const,
      eventType: "incident_resolved" as const,
    };

    const result = await calculateTrustScore(input);

    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("level");
    expect(result).toHaveProperty("factors");
    expect(result).toHaveProperty("recommendation");
    expect(typeof result.score).toBe("number");
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("returns different scores for different event types", async () => {
    const positiveEvent = {
      entityId: "test-user-123",
      entityType: "user" as const,
      eventType: "incident_resolved" as const,
    };

    const negativeEvent = {
      entityId: "test-user-123",
      entityType: "user" as const,
      eventType: "breach_detected" as const,
    };

    const positiveResult = await calculateTrustScore(positiveEvent);
    const negativeResult = await calculateTrustScore(negativeEvent);

    expect(positiveResult.score).toBeGreaterThan(negativeResult.score);
  });

  it("returns appropriate trust level based on score", async () => {
    const input = {
      entityId: "test-user-123",
      entityType: "user" as const,
      eventType: "validation_success" as const,
    };

    const result = await calculateTrustScore(input);

    const validLevels = ["very_low", "low", "medium", "high", "excellent"];
    expect(validLevels).toContain(result.level);
  });

  it("includes all factor scores", async () => {
    const input = {
      entityId: "test-user-123",
      entityType: "user" as const,
      eventType: "audit_passed" as const,
    };

    const result = await calculateTrustScore(input);

    expect(result.factors).toHaveProperty("recentActivity");
    expect(result.factors).toHaveProperty("historicalPerformance");
    expect(result.factors).toHaveProperty("complianceRecord");
    expect(result.factors).toHaveProperty("incidentHistory");
  });

  it("handles errors gracefully and returns default score", async () => {
    // Use helper to mock error
    mockSupabaseError();

    const input = {
      entityId: "test-user-123",
      entityType: "user" as const,
      eventType: "validation_success" as const,
    };

    const result = await calculateTrustScore(input);

    // Should still return a valid score object
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("level");
    expect(result.level).toBe("medium"); // Default level on error
  });
});

describe("getTrustScoreHistory", () => {
  it("returns an array of trust score history", async () => {
    const result = await getTrustScoreHistory("test-entity-123");

    expect(Array.isArray(result)).toBe(true);
  });

  it("returns empty array on error", async () => {
    // Use helper to mock error
    mockSupabaseError();

    const result = await getTrustScoreHistory("test-entity-123");

    expect(result).toEqual([]);
  });
});

// Helper function to mock Supabase errors
function mockSupabaseError() {
  mockSupabase.from = vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: null,
            error: new Error("Database error"),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      error: null,
    })),
  }));
}
