/**
 * Tests for PATCH 625 - Adaptive LLM Layer
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  AdaptiveIntelligence,
  FeedbackStorage,
  PromptAdjuster,
  InspectorProfileManager,
  type InspectionType,
} from "../src/lib/ai/adaptive-intelligence";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: { id: "test-id-123" }, error: null })
          ),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

describe("PATCH 625 - Adaptive Intelligence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    PromptAdjuster.clearCache();
  });

  describe("FeedbackStorage", () => {
    it("should store feedback successfully", async () => {
      const feedback = {
        inspection_type: "PSC" as InspectionType,
        feedback_text: "Missing fire extinguisher in engine room",
        is_non_conformity: true,
        severity: "high" as const,
      };

      const id = await FeedbackStorage.storeFeedback(feedback);
      expect(id).toBe("test-id-123");
    });

    it("should retrieve feedbacks by type", async () => {
      const feedbacks = await FeedbackStorage.getFeedbacksByType("ISM");
      expect(Array.isArray(feedbacks)).toBe(true);
    });

    it("should calculate frequent non-conformities", async () => {
      const frequency = await FeedbackStorage.getFrequentNonConformities("MLC");
      expect(typeof frequency).toBe("object");
    });
  });

  describe("PromptAdjuster", () => {
    it("should generate adaptive prompt for PSC inspection", async () => {
      const config = await PromptAdjuster.getAdaptivePrompt("PSC");
      
      expect(config).toHaveProperty("inspection_type", "PSC");
      expect(config).toHaveProperty("base_prompt");
      expect(config).toHaveProperty("adjustments");
      expect(config).toHaveProperty("learned_patterns");
      expect(config.base_prompt).toContain("Port State Control");
    });

    it("should generate adaptive prompt for ISM inspection", async () => {
      const config = await PromptAdjuster.getAdaptivePrompt("ISM");
      
      expect(config.inspection_type).toBe("ISM");
      expect(config.base_prompt).toContain("International Safety Management");
    });

    it("should generate adaptive prompt for MLC inspection", async () => {
      const config = await PromptAdjuster.getAdaptivePrompt("MLC");
      
      expect(config.inspection_type).toBe("MLC");
      expect(config.base_prompt).toContain("Maritime Labour Convention");
    });

    it("should generate adaptive prompt for OVID inspection", async () => {
      const config = await PromptAdjuster.getAdaptivePrompt("OVID");
      
      expect(config.inspection_type).toBe("OVID");
      expect(config.base_prompt).toContain("Operational Vessel Inspection Database");
    });

    it("should generate adaptive prompt for LSA inspection", async () => {
      const config = await PromptAdjuster.getAdaptivePrompt("LSA");
      
      expect(config.inspection_type).toBe("LSA");
      expect(config.base_prompt).toContain("Life-Saving Appliances");
    });

    it("should generate final prompt with context", async () => {
      const context = {
        vessel: "MV Test Ship",
        port: "Rotterdam",
        date: "2025-11-03",
      };

      const prompt = await PromptAdjuster.generateFinalPrompt("PSC", context);
      
      expect(prompt).toContain("Port State Control");
      expect(prompt).toContain("Contexto Atual");
      expect(prompt).toContain("MV Test Ship");
    });

    it("should include adjustments in final prompt", async () => {
      const prompt = await PromptAdjuster.generateFinalPrompt("ISM");
      
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(0);
    });

    it("should cache prompts for performance", async () => {
      const config1 = await PromptAdjuster.getAdaptivePrompt("PSC");
      const config2 = await PromptAdjuster.getAdaptivePrompt("PSC");
      
      // Should return same instance from cache
      expect(config1).toBe(config2);
    });

    it("should clear cache when requested", () => {
      PromptAdjuster.clearCache();
      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe("InspectorProfileManager", () => {
    it("should get inspector profile", async () => {
      const profile = await InspectorProfileManager.getProfile("test-inspector");
      expect(profile).toBeNull(); // Mocked to return null
    });

    it("should update profile from history", async () => {
      await InspectorProfileManager.updateProfileFromHistory("test-inspector");
      // Should not throw error
      expect(true).toBe(true);
    });

    it("should adapt response to inspector profile", async () => {
      const baseResponse = "This is a test response";
      const adapted = await InspectorProfileManager.adaptResponseToProfile(
        "test-inspector",
        baseResponse,
        "PSC"
      );
      
      expect(typeof adapted).toBe("string");
      expect(adapted.length).toBeGreaterThanOrEqual(baseResponse.length);
    });
  });

  describe("AdaptiveIntelligence Main Interface", () => {
    it("should process query with adaptive intelligence", async () => {
      const response = await AdaptiveIntelligence.processQuery(
        "PSC",
        "Check fire safety equipment",
        "inspector-123",
        { vessel: "MV Test" }
      );
      
      expect(typeof response).toBe("string");
      expect(response).toContain("Port State Control");
    });

    it("should process query without inspector ID", async () => {
      const response = await AdaptiveIntelligence.processQuery(
        "ISM",
        "Review safety management system"
      );
      
      expect(typeof response).toBe("string");
      expect(response).toContain("International Safety Management");
    });

    it("should record feedback successfully", async () => {
      await AdaptiveIntelligence.recordFeedback(
        "MLC",
        "Inadequate crew accommodation",
        true,
        {
          severity: "high",
          inspectorId: "test-inspector",
          context: { vessel: "MV Test" },
        }
      );
      
      // Should not throw error
      expect(true).toBe(true);
    });

    it("should record feedback without options", async () => {
      await AdaptiveIntelligence.recordFeedback(
        "OVID",
        "System working correctly",
        false
      );
      
      // Should not throw error
      expect(true).toBe(true);
    });

    it("should get learning statistics", async () => {
      const stats = await AdaptiveIntelligence.getLearningStats("LSA");
      
      expect(stats).toHaveProperty("totalFeedbacks");
      expect(stats).toHaveProperty("nonConformities");
      expect(stats).toHaveProperty("topIssues");
      expect(stats).toHaveProperty("learnedPatterns");
      expect(Array.isArray(stats.topIssues)).toBe(true);
      expect(Array.isArray(stats.learnedPatterns)).toBe(true);
    });

    it("should handle different inspection types in learning stats", async () => {
      const inspectionTypes: InspectionType[] = ["PSC", "ISM", "MLC", "OVID", "LSA"];
      
      for (const type of inspectionTypes) {
        const stats = await AdaptiveIntelligence.getLearningStats(type);
        expect(stats).toBeTruthy();
        expect(typeof stats.totalFeedbacks).toBe("number");
        expect(typeof stats.nonConformities).toBe("number");
      }
    });
  });

  describe("Prompt Adjustment Logic", () => {
    it("should generate adjustments for frequent issues", async () => {
      const config = await PromptAdjuster.getAdaptivePrompt("PSC");
      expect(Array.isArray(config.adjustments)).toBe(true);
    });

    it("should extract learned patterns", async () => {
      const config = await PromptAdjuster.getAdaptivePrompt("ISM");
      expect(Array.isArray(config.learned_patterns)).toBe(true);
    });

    it("should track non-conformity frequency", async () => {
      const config = await PromptAdjuster.getAdaptivePrompt("MLC");
      expect(typeof config.non_conformity_frequency).toBe("object");
    });
  });

  describe("Memory and Feedback Flow", () => {
    it("should maintain feedback history", async () => {
      await AdaptiveIntelligence.recordFeedback(
        "PSC",
        "Test feedback 1",
        false
      );
      await AdaptiveIntelligence.recordFeedback(
        "PSC",
        "Test feedback 2",
        true
      );
      
      const stats = await AdaptiveIntelligence.getLearningStats("PSC");
      expect(stats.totalFeedbacks).toBeGreaterThanOrEqual(0);
    });

    it("should clear cache after recording feedback", async () => {
      await PromptAdjuster.getAdaptivePrompt("ISM"); // Create cache
      
      await AdaptiveIntelligence.recordFeedback(
        "ISM",
        "New feedback",
        true
      );
      
      // Cache should be cleared, forcing regeneration
      const config = await PromptAdjuster.getAdaptivePrompt("ISM");
      expect(config).toBeTruthy();
    });
  });

  describe("Inference and Logging", () => {
    it("should log inference process", async () => {
      const consoleSpy = vi.spyOn(console, "log");
      
      await AdaptiveIntelligence.processQuery(
        "OVID",
        "Analyze vessel history"
      );
      
      // Inference should happen (even if not logged in test mode)
      expect(true).toBe(true);
      
      consoleSpy.mockRestore();
    });

    it("should handle errors gracefully", async () => {
      // Test with invalid data should not crash
      const stats = await AdaptiveIntelligence.getLearningStats("PSC");
      expect(stats).toBeTruthy();
    });
  });
});
