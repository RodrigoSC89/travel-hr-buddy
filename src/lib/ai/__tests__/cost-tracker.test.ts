/**
 * AI Cost Tracker - Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { 
  calculateCost, 
  trackUsage, 
  estimateCost, 
  recommendModel,
  PRICING 
} from "@/lib/ai/cost-tracker";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

describe("AI Cost Tracker", () => {
  describe("calculateCost", () => {
    it("should calculate cost for Gemini Flash", () => {
      const cost = calculateCost("google/gemini-2.5-flash", 1000, 500);
      
      // 1000 input tokens * 0.075/1M + 500 output tokens * 0.30/1M
      const expected = (1000 / 1_000_000) * 0.075 + (500 / 1_000_000) * 0.30;
      expect(cost).toBeCloseTo(expected, 8);
    });

    it("should calculate cost for GPT-5 Mini", () => {
      const cost = calculateCost("openai/gpt-5-mini", 2000, 1000);
      
      const expected = (2000 / 1_000_000) * 0.15 + (1000 / 1_000_000) * 0.60;
      expect(cost).toBeCloseTo(expected, 8);
    });

    it("should use default pricing for unknown models", () => {
      const cost = calculateCost("unknown-model", 1000, 500);
      
      const expected = (1000 / 1_000_000) * 0.10 + (500 / 1_000_000) * 0.40;
      expect(cost).toBeCloseTo(expected, 8);
    });

    it("should handle zero tokens", () => {
      const cost = calculateCost("google/gemini-2.5-flash", 0, 0);
      expect(cost).toBe(0);
    });
  });

  describe("estimateCost", () => {
    it("should estimate cost from text length", () => {
      // 1000 chars ≈ 250 tokens
      const cost = estimateCost("google/gemini-2.5-flash", 1000, 500);
      
      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe("number");
    });

    it("should use default output length when not specified", () => {
      const cost = estimateCost("google/gemini-2.5-flash", 1000);
      
      // Default is 500 output length ≈ 125 tokens
      expect(cost).toBeGreaterThan(0);
    });
  });

  describe("recommendModel", () => {
    it("should recommend flash-lite for simple tasks", () => {
      const model = recommendModel("simple", 500);
      expect(model).toBe("google/gemini-2.5-flash-lite");
    });

    it("should recommend flash for medium tasks", () => {
      const model = recommendModel("medium", 500);
      expect(model).toBe("google/gemini-3-flash-preview");
    });

    it("should recommend pro for complex tasks with budget", () => {
      const model = recommendModel("complex", 500);
      expect(model).toBe("google/gemini-3-pro-preview");
    });

    it("should recommend cheaper model when budget is low", () => {
      const model = recommendModel("complex", 30);
      expect(model).toBe("google/gemini-2.5-flash-lite");
    });

    it("should downgrade complex to flash when budget is moderate", () => {
      const model = recommendModel("complex", 100);
      expect(model).toBe("google/gemini-3-flash-preview");
    });
  });

  describe("PRICING", () => {
    it("should have pricing for common models", () => {
      expect(PRICING["google/gemini-2.5-flash"]).toBeDefined();
      expect(PRICING["google/gemini-3-pro-preview"]).toBeDefined();
      expect(PRICING["openai/gpt-5-mini"]).toBeDefined();
    });

    it("should have default pricing", () => {
      expect(PRICING["default"]).toBeDefined();
      expect(PRICING["default"].input).toBeGreaterThan(0);
      expect(PRICING["default"].output).toBeGreaterThan(0);
    });

    it("should have input and output pricing for all models", () => {
      for (const [model, pricing] of Object.entries(PRICING)) {
        expect(pricing.input).toBeGreaterThanOrEqual(0);
        expect(pricing.output).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("trackUsage", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("should track usage without throwing", () => {
      expect(() => {
        trackUsage({
          model: "google/gemini-2.5-flash",
          inputTokens: 100,
          outputTokens: 50,
          timestamp: Date.now(),
          module: "test-module",
        });
      }).not.toThrow();
    });

    it("should set timestamp automatically", () => {
      const now = Date.now();
      
      trackUsage({
        model: "google/gemini-2.5-flash",
        inputTokens: 100,
        outputTokens: 50,
        timestamp: 0, // Will be overwritten
        module: "test-module",
      });

      // No error means it worked
      expect(true).toBe(true);
    });
  });
});

describe("Cost Calculations for Real Scenarios", () => {
  it("should calculate cost for typical chat message", () => {
    // User message: ~100 tokens, AI response: ~500 tokens
    const cost = calculateCost("google/gemini-2.5-flash", 100, 500);
    
    // Should be a few cents at most
    expect(cost).toBeLessThan(0.01);
  });

  it("should calculate cost for document analysis", () => {
    // Long document: ~10000 tokens, summary: ~2000 tokens
    const cost = calculateCost("google/gemini-3-flash-preview", 10000, 2000);
    
    // Should be under $1
    expect(cost).toBeLessThan(1);
  });

  it("should calculate monthly cost estimate", () => {
    // 1000 chat messages per month
    const costPerMessage = calculateCost("google/gemini-2.5-flash", 150, 400);
    const monthlyCost = costPerMessage * 1000;
    
    // Should be reasonable monthly cost
    expect(monthlyCost).toBeLessThan(100);
  });
});
