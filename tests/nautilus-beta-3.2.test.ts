/**
 * Nautilus One Beta 3.2 - Module Tests
 * Tests for ForecastEngine, AdaptiveAI, and ControlHub2
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ForecastEngine } from "@/modules/forecast/ForecastEngine";
import { AdaptiveAI } from "@/modules/ai/AdaptiveAI";

describe("Nautilus One Beta 3.2 - Core Modules", () => {
  describe("ForecastEngine", () => {
    let engine: ForecastEngine;

    beforeEach(() => {
      engine = new ForecastEngine();
    });

    it("should create a forecast engine instance", () => {
      expect(engine).toBeDefined();
      expect(engine.getForecast).toBeDefined();
    });

    it("should generate forecast data", async () => {
      const forecast = await engine.getForecast();
      
      expect(forecast).toBeDefined();
      expect(forecast.timestamp).toBeDefined();
      expect(forecast.forecast).toBeDefined();
      expect(typeof forecast.forecast).toBe("object");
    });

    it("should have valid forecast structure", async () => {
      const forecast = await engine.getForecast();
      
      expect(forecast).toHaveProperty("timestamp");
      expect(forecast).toHaveProperty("forecast");
      expect(Object.keys(forecast.forecast).length).toBeGreaterThan(0);
    });

    it("should get module forecast", async () => {
      const moduleForecast = await engine.getModuleForecast("DP System");
      
      expect(moduleForecast).toBeDefined();
      if (moduleForecast) {
        expect(moduleForecast.module).toBe("DP System");
        expect(moduleForecast.status).toBeDefined();
        expect(moduleForecast.trend).toBeDefined();
      }
    });

    it("should register and call update callbacks", () => {
      let callbackCalled = false;
      
      const unsubscribe = engine.onUpdate(() => {
        callbackCalled = true;
      });

      expect(typeof unsubscribe).toBe("function");
    });

    it("should update and retrieve config", () => {
      const newConfig = { model: "Prophet" as const, interval: 5000, historicalDays: 60 };
      engine.setConfig(newConfig);
      
      const config = engine.getConfig();
      expect(config.model).toBe("Prophet");
      expect(config.interval).toBe(5000);
      expect(config.historicalDays).toBe(60);
    });
  });

  describe("AdaptiveAI", () => {
    let ai: AdaptiveAI;

    beforeEach(() => {
      ai = new AdaptiveAI();
      ai.clearLogs(); // Start fresh
    });

    it("should create an adaptive AI instance", () => {
      expect(ai).toBeDefined();
      expect(ai.advise).toBeDefined();
      expect(ai.learn).toBeDefined();
    });

    it("should provide advice based on context", () => {
      const advice = ai.advise("drift detected in DP system");
      
      expect(advice).toBeDefined();
      expect(advice.message).toBeDefined();
      expect(advice.confidence).toBeDefined();
      expect(advice.confidence).toBeGreaterThan(0);
      expect(advice.confidence).toBeLessThanOrEqual(1);
    });

    it("should learn from logs", () => {
      const initialStats = ai.getStats();
      const initialCount = initialStats.totalLogs;
      
      ai.learn({
        timestamp: new Date().toISOString(),
        message: "Test log entry",
        severity: "info",
      });
      
      const newStats = ai.getStats();
      expect(newStats.totalLogs).toBe(initialCount + 1);
    });

    it("should provide context-specific advice for drift", () => {
      const advice = ai.advise("drift probability increased");
      
      expect(advice.message.toLowerCase()).toContain("gyro");
      expect(advice.priority).toBe("high");
      expect(advice.recommendations).toBeDefined();
      expect(advice.recommendations?.length).toBeGreaterThan(0);
    });

    it("should provide context-specific advice for thruster", () => {
      const advice = ai.advise("thruster vibration detected");
      
      expect(advice.message.toLowerCase()).toContain("thruster");
      expect(advice.priority).toBe("high");
    });

    it("should provide stable advice for normal conditions", () => {
      const advice = ai.advise("all systems normal");
      
      expect(advice.message.toLowerCase()).toContain("estáveis");
      expect(advice.priority).toBe("low");
    });

    it("should get logs by severity", () => {
      ai.learn({ timestamp: new Date().toISOString(), message: "Info log", severity: "info" });
      ai.learn({ timestamp: new Date().toISOString(), message: "Warning log", severity: "warning" });
      ai.learn({ timestamp: new Date().toISOString(), message: "Error log", severity: "error" });
      
      const infoLogs = ai.getLogsBySeverity("info");
      const warningLogs = ai.getLogsBySeverity("warning");
      
      expect(infoLogs.length).toBeGreaterThan(0);
      expect(warningLogs.length).toBeGreaterThan(0);
    });

    it("should export logs as JSON", () => {
      ai.learn({ timestamp: new Date().toISOString(), message: "Test log", severity: "info" });
      
      const exported = ai.exportLogs();
      expect(typeof exported).toBe("string");
      
      const parsed = JSON.parse(exported);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it("should get model info", () => {
      const modelInfo = ai.getModelInfo();
      
      expect(modelInfo).toBeDefined();
      expect(modelInfo.name).toBe("NautilusAI");
      expect(modelInfo.version).toBe("2.0.0");
      expect(modelInfo.type).toBe("GGUF");
    });

    it("should update model accuracy", () => {
      ai.updateAccuracy(0.95);
      const modelInfo = ai.getModelInfo();
      
      expect(modelInfo.accuracy).toBe(0.95);
    });

    it("should maintain max logs limit", () => {
      // Add more than max logs
      for (let i = 0; i < 1100; i++) {
        ai.learn({
          timestamp: new Date().toISOString(),
          message: `Log ${i}`,
          severity: "info",
        });
      }
      
      const stats = ai.getStats();
      expect(stats.totalLogs).toBeLessThanOrEqual(1000);
    });
  });

  describe("Integration Tests", () => {
    it("should integrate ForecastEngine with AdaptiveAI", async () => {
      const engine = new ForecastEngine();
      const ai = new AdaptiveAI();
      
      const forecast = await engine.getForecast();
      const context = JSON.stringify(forecast.forecast);
      const advice = ai.advise(context);
      
      expect(forecast).toBeDefined();
      expect(advice).toBeDefined();
      expect(advice.confidence).toBeGreaterThan(0);
    });

    it("should learn from forecast data", async () => {
      const engine = new ForecastEngine();
      const ai = new AdaptiveAI();
      
      const forecast = await engine.getForecast();
      
      ai.learn({
        timestamp: new Date().toISOString(),
        message: `Forecast processed: ${Object.keys(forecast.forecast).length} modules`,
        context: JSON.stringify(forecast.forecast),
        severity: "info",
      });
      
      const stats = ai.getStats();
      expect(stats.totalLogs).toBeGreaterThan(0);
    });
  });
});
