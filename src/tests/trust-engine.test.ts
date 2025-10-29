/**
 * PATCH 547 - Trust Engine Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase before imports
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: { trust_score: 50 }, error: null })
          ),
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

import {
  calculateTrustScore,
  getTrustScoreInfo,
  getTrustHistory,
} from "@/ai/trust-engine";

describe("Trust Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateTrustScore", () => {
    it("should calculate trust score for incident resolution", async () => {
      const score = await calculateTrustScore({
        entityId: "user-123",
        entityType: "user",
        eventType: "incident_resolved",
      });

      expect(score).toBeGreaterThan(50);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should decrease trust score for failed login", async () => {
      const score = await calculateTrustScore({
        entityId: "user-123",
        entityType: "user",
        eventType: "failed_login",
      });

      expect(score).toBeLessThan(50);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it("should use custom impact value when provided", async () => {
      const score = await calculateTrustScore({
        entityId: "user-123",
        entityType: "user",
        eventType: "custom_event",
        impact: 20,
      });

      expect(score).toBeGreaterThan(50);
    });

    it("should handle entity types correctly", async () => {
      const entityTypes = ["user", "incident", "token", "system"] as const;

      for (const type of entityTypes) {
        const score = await calculateTrustScore({
          entityId: `${type}-123`,
          entityType: type,
          eventType: "successful_action",
        });

        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    });
  });

  describe("getTrustScoreInfo", () => {
    it("should return correct info for high trust score", () => {
      const info = getTrustScoreInfo(85);

      expect(info.label).toBe("Confiável");
      expect(info.color).toBe("text-green-600");
      expect(info.score).toBe(85);
    });

    it("should return correct info for low trust score", () => {
      const info = getTrustScoreInfo(15);

      expect(info.label).toBe("Crítico");
      expect(info.color).toBe("text-red-600");
      expect(info.score).toBe(15);
    });

    it("should return correct info for moderate trust score", () => {
      const info = getTrustScoreInfo(50);

      expect(info.label).toBe("Moderado");
      expect(info.color).toBe("text-yellow-600");
    });

    it("should provide tooltip for each score range", () => {
      const scores = [10, 30, 50, 70, 90];

      scores.forEach((score) => {
        const info = getTrustScoreInfo(score);
        expect(info.tooltip).toBeTruthy();
        expect(info.tooltip.length).toBeGreaterThan(10);
      });
    });
  });

  describe("getTrustHistory", () => {
    it("should fetch trust history for entity", async () => {
      const history = await getTrustHistory("user-123");

      expect(history).toEqual([]);
    });

    it("should respect limit parameter", async () => {
      const history = await getTrustHistory("user-123", 20);
      expect(history).toEqual([]);
    });
  });
});
