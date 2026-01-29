/**
 * Tests for AI Telemetry Bridge
 * Uses mock helpers for environment testing
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  analyzePerformanceMetrics,
  generatePerformanceReport,
} from "@/lib/AI/telemetryBridge";
import { setupMockEnv, setMockEnvVar, isApiKeyConfigured } from "../helpers/test-env";

describe("AI Telemetry Bridge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockEnv({ VITE_OPENAI_API_KEY: undefined });
  });

  describe("analyzePerformanceMetrics", () => {
    it("should return fallback insights when API key is missing", async () => {
      const metrics = { cpu: 50, memory: 512, fps: 60 };
      const insights = await analyzePerformanceMetrics(metrics);

      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();
      expect(insights.severity).toBeDefined();
      expect(insights.recommendations).toBeInstanceOf(Array);
    });

    it("should handle metrics with high CPU usage", async () => {
      const metrics = { cpu: 95, memory: 1024, fps: 30 };
      const insights = await analyzePerformanceMetrics(metrics);

      expect(insights).toBeDefined();
      expect(insights.severity).toBe("low");
    });

    it("should handle metrics with low memory", async () => {
      const metrics = { cpu: 20, memory: 100, fps: 60 };
      const insights = await analyzePerformanceMetrics(metrics);

      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();
    });

    it("should handle metrics with low FPS", async () => {
      const metrics = { cpu: 50, memory: 512, fps: 15 };
      const insights = await analyzePerformanceMetrics(metrics);

      expect(insights).toBeDefined();
      expect(insights.recommendations).toBeInstanceOf(Array);
    });

    it("should include timestamp in insights", async () => {
      const metrics = { cpu: 50, memory: 512, fps: 60 };
      const insights = await analyzePerformanceMetrics(metrics);

      expect(insights.timestamp).toBeDefined();
      expect(new Date(insights.timestamp)).toBeInstanceOf(Date);
    });

    it("should return consistent structure", async () => {
      const metrics = { cpu: 50, memory: 512, fps: 60 };
      const insights = await analyzePerformanceMetrics(metrics);

      expect(insights).toHaveProperty("summary");
      expect(insights).toHaveProperty("recommendations");
      expect(insights).toHaveProperty("severity");
      expect(insights).toHaveProperty("timestamp");
    });
  });

  describe("generatePerformanceReport", () => {
    it("should return fallback message when client is not available", async () => {
      const metricsHistory = [
        { cpu: 50, memory: 512, fps: 60 },
        { cpu: 60, memory: 600, fps: 55 },
      ];

      const report = await generatePerformanceReport(metricsHistory);

      expect(typeof report).toBe("string");
      expect(report.length).toBeGreaterThan(0);
    });

    it("should return fallback message when history is empty", async () => {
      setMockEnvVar("VITE_OPENAI_API_KEY", "test-key");

      const report = await generatePerformanceReport([]);

      expect(report).toBe("Insufficient data for historical report");
    });

    it("should handle single metric in history", async () => {
      const metricsHistory = [{ cpu: 50, memory: 512, fps: 60 }];

      const report = await generatePerformanceReport(metricsHistory);

      expect(typeof report).toBe("string");
    });

    it("should handle multiple metrics in history", async () => {
      const metricsHistory = [
        { cpu: 50, memory: 512, fps: 60 },
        { cpu: 60, memory: 600, fps: 55 },
        { cpu: 55, memory: 550, fps: 58 },
      ];

      const report = await generatePerformanceReport(metricsHistory);

      expect(typeof report).toBe("string");
    });

    it("should return string report", async () => {
      const metricsHistory = [
        { cpu: 50, memory: 512, fps: 60 },
        { cpu: 60, memory: 600, fps: 55 },
      ];

      const report = await generatePerformanceReport(metricsHistory);

      expect(typeof report).toBe("string");
      expect(report.length).toBeGreaterThan(0);
    });
  });

  describe("API key validation", () => {
    it("should correctly identify configured API keys", () => {
      setupMockEnv({ VITE_OPENAI_API_KEY: "sk-real-api-key" });
      expect(isApiKeyConfigured("VITE_OPENAI_API_KEY")).toBe(true);
    });

    it("should correctly identify missing API keys", () => {
      setupMockEnv({ VITE_OPENAI_API_KEY: "" });
      expect(isApiKeyConfigured("VITE_OPENAI_API_KEY")).toBe(false);
    });

    it("should correctly identify placeholder API keys", () => {
      setupMockEnv({ VITE_OPENAI_API_KEY: "your_openai_api_key_here" });
      expect(isApiKeyConfigured("VITE_OPENAI_API_KEY")).toBe(false);
    });
  });
});
