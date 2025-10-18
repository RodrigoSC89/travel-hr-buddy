/**
 * Tests for systemHealth utility functions
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { runAutomatedTests, getTestSuccessRate, formatDuration } from "@/lib/systemHealth";

describe("systemHealth utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("runAutomatedTests", () => {
    it("should return mock test results when Supabase URL is not configured", async () => {
      const result = await runAutomatedTests();
      
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("passed");
      expect(result).toHaveProperty("failed");
      expect(result).toHaveProperty("lastRun");
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.total).toBe("number");
      expect(typeof result.passed).toBe("number");
      expect(typeof result.failed).toBe("number");
      expect(typeof result.lastRun).toBe("string");
    });

    it("should return valid test result structure", async () => {
      const result = await runAutomatedTests();
      
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.passed).toBeGreaterThanOrEqual(0);
      expect(result.failed).toBeGreaterThanOrEqual(0);
      expect(result.passed + result.failed).toBeLessThanOrEqual(result.total);
    });
  });

  describe("getTestSuccessRate", () => {
    it("should calculate success rate correctly for all passing tests", () => {
      const result = {
        success: true,
        total: 100,
        passed: 100,
        failed: 0,
        lastRun: new Date().toISOString(),
      };
      
      expect(getTestSuccessRate(result)).toBe(100);
    });

    it("should calculate success rate correctly for partial passing tests", () => {
      const result = {
        success: false,
        total: 100,
        passed: 75,
        failed: 25,
        lastRun: new Date().toISOString(),
      };
      
      expect(getTestSuccessRate(result)).toBe(75);
    });

    it("should return 0 for no tests", () => {
      const result = {
        success: true,
        total: 0,
        passed: 0,
        failed: 0,
        lastRun: new Date().toISOString(),
      };
      
      expect(getTestSuccessRate(result)).toBe(0);
    });

    it("should round success rate to nearest integer", () => {
      const result = {
        success: true,
        total: 3,
        passed: 2,
        failed: 1,
        lastRun: new Date().toISOString(),
      };
      
      // 2/3 = 66.666... should round to 67
      expect(getTestSuccessRate(result)).toBe(67);
    });
  });

  describe("formatDuration", () => {
    it("should format duration in seconds for less than a minute", () => {
      expect(formatDuration(45000)).toBe("45s");
    });

    it("should format duration in minutes and seconds", () => {
      expect(formatDuration(125000)).toBe("2m 5s");
    });

    it("should handle exactly one minute", () => {
      expect(formatDuration(60000)).toBe("1m 0s");
    });

    it("should return N/A for undefined duration", () => {
      expect(formatDuration(undefined)).toBe("N/A");
    });

    it("should handle zero duration", () => {
      expect(formatDuration(0)).toBe("0s");
    });

    it("should handle large durations", () => {
      expect(formatDuration(3661000)).toBe("61m 1s");
    });
  });
});
