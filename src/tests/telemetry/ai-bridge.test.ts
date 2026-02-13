/**
 * Tests for AI Telemetry Bridge
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  analyzePerformanceMetrics,
  generatePerformanceReport,
} from "@/lib/AI/telemetryBridge";

interface ImportMetaEnvExtended {
  VITE_OPENAI_API_KEY?: string;
  [key: string]: string | undefined;
}

describe("AI Telemetry Bridge", () => {
  beforeEach(() => {
    // Clear any cached state
  });

  describe("analyzePerformanceMetrics", () => {
    it("should return insights when API key is missing", async () => {
      const originalKey = import.meta.env.VITE_OPENAI_API_KEY;
      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = undefined;

      const metrics = { cpu: 50, memory: 512, fps: 60 };
      const insights = await analyzePerformanceMetrics(metrics);

      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();
      expect(insights.severity).toBeDefined();
      expect(insights.recommendations).toBeInstanceOf(Array);

      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = originalKey;
    });

    it("should handle metrics with high CPU usage", async () => {
      const originalKey = import.meta.env.VITE_OPENAI_API_KEY;
      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = undefined;

      const metrics = { cpu: 95, memory: 1024, fps: 30 };
      const insights = await analyzePerformanceMetrics(metrics);

      expect(insights).toBeDefined();
      expect(insights.severity).toBe("low");

      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = originalKey;
    });

    it("should handle metrics with low memory", async () => {
      const originalKey = import.meta.env.VITE_OPENAI_API_KEY;
      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = undefined;

      const metrics = { cpu: 20, memory: 100, fps: 60 };
      const insights = await analyzePerformanceMetrics(metrics);

      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();

      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = originalKey;
    });

    it("should handle metrics with low FPS", async () => {
      const originalKey = import.meta.env.VITE_OPENAI_API_KEY;
      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = undefined;

      const metrics = { cpu: 50, memory: 512, fps: 15 };
      const insights = await analyzePerformanceMetrics(metrics);

      expect(insights).toBeDefined();
      expect(insights.recommendations).toBeInstanceOf(Array);

      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = originalKey;
    });

    it("should include timestamp in insights", async () => {
      const originalKey = import.meta.env.VITE_OPENAI_API_KEY;
      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = undefined;

      const metrics = { cpu: 50, memory: 512, fps: 60 };
      const insights = await analyzePerformanceMetrics(metrics);

      expect(insights.timestamp).toBeDefined();
      expect(new Date(insights.timestamp)).toBeInstanceOf(Date);

      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = originalKey;
    });

    it("should return consistent structure", async () => {
      const originalKey = import.meta.env.VITE_OPENAI_API_KEY;
      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = undefined;

      const metrics = { cpu: 50, memory: 512, fps: 60 };
      const insights = await analyzePerformanceMetrics(metrics);

      expect(insights).toHaveProperty("summary");
      expect(insights).toHaveProperty("recommendations");
      expect(insights).toHaveProperty("severity");
      expect(insights).toHaveProperty("timestamp");

      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = originalKey;
    });
  });

  describe("generatePerformanceReport", () => {
    it("should return message when client is not available", async () => {
      const originalKey = import.meta.env.VITE_OPENAI_API_KEY;
      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = undefined;

      const metricsHistory = [
        { cpu: 50, memory: 512, fps: 60 },
        { cpu: 60, memory: 600, fps: 55 },
      ];

      const report = await generatePerformanceReport(metricsHistory);

      expect(typeof report).toBe("string");
      expect(report.length).toBeGreaterThan(0);

      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = originalKey;
    });

    it("should return fallback message when history is empty", async () => {
      const originalKey = import.meta.env.VITE_OPENAI_API_KEY;
      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = "test-key";

      const report = await generatePerformanceReport([]);

      expect(report).toBe("Insufficient data for historical report");

      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = originalKey;
    });

    it("should handle single metric in history", async () => {
      const originalKey = import.meta.env.VITE_OPENAI_API_KEY;
      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = undefined;

      const metricsHistory = [{ cpu: 50, memory: 512, fps: 60 }];

      const report = await generatePerformanceReport(metricsHistory);

      expect(typeof report).toBe("string");

      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = originalKey;
    });

    it("should handle multiple metrics in history", async () => {
      const originalKey = import.meta.env.VITE_OPENAI_API_KEY;
      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = undefined;

      const metricsHistory = [
        { cpu: 50, memory: 512, fps: 60 },
        { cpu: 60, memory: 600, fps: 55 },
        { cpu: 55, memory: 550, fps: 58 },
      ];

      const report = await generatePerformanceReport(metricsHistory);

      expect(typeof report).toBe("string");

      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = originalKey;
    });

    it("should return string report", async () => {
      const originalKey = import.meta.env.VITE_OPENAI_API_KEY;
      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = undefined;

      const metricsHistory = [
        { cpu: 50, memory: 512, fps: 60 },
        { cpu: 60, memory: 600, fps: 55 },
      ];

      const report = await generatePerformanceReport(metricsHistory);

      expect(typeof report).toBe("string");
      expect(report.length).toBeGreaterThan(0);

      (import.meta.env as ImportMetaEnvExtended).VITE_OPENAI_API_KEY = originalKey;
    });
  });
});
