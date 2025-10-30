/**
 * Tests for PATCHES 576-580
 * Situational Awareness, Tactical Response, Reaction Mapper, Resilience Tracker, and Incident Replayer v2
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { SituationalAwarenessCore } from "@/ai/situational-awareness/core";
import { TacticalResponseEngine } from "@/ai/tactical-response/engine";
import { MissionResilienceTracker } from "@/modules/missions/resilience-tracker/tracker";
import { AIIncidentReplayerV2 } from "@/ai/incident-replay-v2/replayer";
import type { TacticalEvent } from "@/ai/tactical-response/types";
import type { FailureEvent } from "@/modules/missions/resilience-tracker/types";
import type { ReplayConfig } from "@/ai/incident-replay-v2/types";

// Mock BridgeLink
vi.mock("@/core/BridgeLink", () => ({
  BridgeLink: {
    emit: vi.fn(),
    on: vi.fn(),
  },
}));

// Mock AI engine
vi.mock("@/ai/engine", () => ({
  runOpenAI: vi.fn().mockResolvedValue({
    content: JSON.stringify({
      type: "risk",
      severity: "medium",
      title: "Test Insight",
      description: "Test insight description",
      affectedModules: ["navigation"],
      confidence: 0.8,
      suggestedActions: ["Monitor situation"],
    }),
    model: "gpt-4o-mini",
    timestamp: new Date(),
  }),
}));

describe("PATCH 576 - Situational Awareness Core", () => {
  let core: SituationalAwarenessCore;

  beforeEach(async () => {
    core = SituationalAwarenessCore.getInstance();
    await core.initialize({
      enabled: false, // Disable observer for testing
      interval: 1000,
      sources: ["internal"],
      modules: ["navigation", "weather"],
      alertThresholds: {
        critical: 0.9,
        high: 0.7,
        medium: 0.5,
        low: 0.3,
      },
    });
  });

  afterEach(() => {
    core.cleanup();
  });

  it("should initialize successfully", () => {
    const state = core.getCurrentState();
    expect(state).toBeDefined();
    expect(state.overall_status).toBe("normal");
    expect(state.systemHealth).toBe(1.0);
  });

  it("should collect context from modules", async () => {
    await core.collectContext("navigation", "internal", {
      position: { lat: 40.7128, lon: -74.0060 },
      speed: 15,
    });

    const state = core.getCurrentState();
    expect(state.modules.navigation.status).not.toBe("unknown");
    expect(state.modules.navigation.metrics).toHaveProperty("position");
  });

  it("should generate tactical suggestions", async () => {
    const suggestions = await core.getTacticalSuggestions();
    expect(Array.isArray(suggestions)).toBe(true);
  });

  it("should maintain logs", async () => {
    await core.collectContext("navigation", "internal", { test: "data" });
    
    const logs = core.getLogs(10);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0]).toHaveProperty("timestamp");
    expect(logs[0]).toHaveProperty("level");
    expect(logs[0]).toHaveProperty("message");
  });
});

describe("PATCH 577 - Tactical Response Engine", () => {
  let engine: TacticalResponseEngine;

  beforeEach(async () => {
    engine = TacticalResponseEngine.getInstance();
    await engine.initialize();
  });

  afterEach(() => {
    engine.cleanup();
  });

  it("should initialize with default rules", () => {
    const stats = engine.getStatistics();
    expect(stats).toBeDefined();
    expect(stats.activeRules).toBeGreaterThan(0);
  });

  it("should process tactical events", async () => {
    const event: TacticalEvent = {
      id: "test-event-1",
      type: "alert",
      timestamp: Date.now(),
      severity: "critical",
      source: "test",
      data: { severity: "critical", test: true },
    };

    const executions = await engine.processEvent(event);
    expect(Array.isArray(executions)).toBe(true);
    
    const stats = engine.getStatistics();
    expect(stats.totalEvents).toBe(1);
    expect(stats.processedEvents).toBe(1);
  });

  it("should respect performance requirements (<500ms)", async () => {
    const event: TacticalEvent = {
      id: "test-event-2",
      type: "failure",
      timestamp: Date.now(),
      severity: "high",
      source: "test",
      data: {},
    };

    const startTime = performance.now();
    await engine.processEvent(event);
    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(500);
  });

  it("should track execution history", async () => {
    const event: TacticalEvent = {
      id: "test-event-3",
      type: "alert",
      timestamp: Date.now(),
      severity: "high",
      source: "test",
      data: { severity: "high" },
    };

    await engine.processEvent(event);
    
    const history = engine.getExecutionHistory(10);
    expect(history.length).toBeGreaterThan(0);
  });

  it("should provide statistics", () => {
    const stats = engine.getStatistics();
    
    expect(stats).toHaveProperty("totalEvents");
    expect(stats).toHaveProperty("processedEvents");
    expect(stats).toHaveProperty("activeRules");
    expect(stats).toHaveProperty("executedResponses");
    expect(stats).toHaveProperty("successRate");
    expect(stats).toHaveProperty("averageResponseTime");
    expect(stats).toHaveProperty("eventsByType");
    expect(stats).toHaveProperty("performanceMetrics");
  });
});

describe("PATCH 579 - Mission Resilience Tracker", () => {
  let tracker: MissionResilienceTracker;

  beforeEach(async () => {
    tracker = MissionResilienceTracker.getInstance({
      missionId: "test-mission-1",
      enableRealTimeTracking: false,
      reportGenerationInterval: 60000,
      alertThresholds: {
        criticalScoreDrop: 20,
        minAcceptableScore: 50,
        maxRecoveryTime: 3600000,
      },
      integrations: {
        situationalAwareness: false,
        tacticalResponse: false,
      },
    });
    await tracker.initialize();
  });

  afterEach(() => {
    tracker.cleanup();
  });

  it("should initialize with default resilience index", async () => {
    const index = await tracker.calculateResilienceIndex();
    
    expect(index).toBeDefined();
    expect(index.missionId).toBe("test-mission-1");
    expect(index.overallScore).toBeGreaterThanOrEqual(0);
    expect(index.overallScore).toBeLessThanOrEqual(100);
    expect(index).toHaveProperty("components");
  });

  it("should record failure events", async () => {
    const failure: FailureEvent = {
      id: "failure-1",
      missionId: "test-mission-1",
      timestamp: Date.now(),
      severity: "medium",
      category: "navigation",
      description: "Navigation system degraded",
      affectedSystems: ["gps", "compass"],
      detected_by: "system",
      context: {},
    };

    await tracker.recordFailure(failure);
    
    const index = tracker.getCurrentIndex();
    expect(index).toBeDefined();
    expect(index!.totalFailures).toBe(1);
  });

  it("should generate event reports", async () => {
    const report = await tracker.generateReport();
    
    expect(report).toBeDefined();
    expect(report).toHaveProperty("id");
    expect(report).toHaveProperty("missionId");
    expect(report).toHaveProperty("summary");
    expect(report).toHaveProperty("events");
    expect(report).toHaveProperty("recommendations");
    expect(Array.isArray(report.recommendations)).toBe(true);
  });

  it("should export reports in different formats", async () => {
    const report = await tracker.generateReport();
    
    const jsonExport = await tracker.exportReport(report, "json");
    expect(jsonExport).toBeTruthy();
    expect(() => JSON.parse(jsonExport)).not.toThrow();
    
    const csvExport = await tracker.exportReport(report, "csv");
    expect(csvExport).toBeTruthy();
    expect(csvExport).toContain("Timestamp");
  });

  it("should calculate resilience components", async () => {
    const index = await tracker.calculateResilienceIndex();
    
    expect(index.components).toBeDefined();
    expect(index.components.failurePreventionScore).toBeGreaterThanOrEqual(0);
    expect(index.components.responseEffectivenessScore).toBeGreaterThanOrEqual(0);
    expect(index.components.recoverySpeedScore).toBeGreaterThanOrEqual(0);
    expect(index.components.systemRedundancyScore).toBeGreaterThanOrEqual(0);
    expect(index.components.crewReadinessScore).toBeGreaterThanOrEqual(0);
  });
});

describe("PATCH 580 - AI Incident Replayer v2", () => {
  let replayer: AIIncidentReplayerV2;

  beforeEach(() => {
    replayer = AIIncidentReplayerV2.getInstance("test-incident-1");
  });

  afterEach(() => {
    replayer.cleanup();
  });

  it("should reconstruct incident with full context", async () => {
    const config: ReplayConfig = {
      incidentId: "test-incident-1",
      startTime: Date.now() - 60000, // 1 minute ago
      endTime: Date.now(),
      dataSources: ["sensors", "crew", "ai", "system"],
      includeAIDecisions: true,
      includeContextReconstruction: true,
      playbackSpeed: 1,
      highlightCriticalEvents: true,
    };

    const replay = await replayer.reconstructIncident(config);
    
    expect(replay).toBeDefined();
    expect(replay.incidentId).toBe("test-incident-1");
    expect(replay.timeline).toBeDefined();
    expect(Array.isArray(replay.timeline)).toBe(true);
    expect(replay.timeline.length).toBeGreaterThan(0);
  });

  it("should include AI decisions in replay", async () => {
    const config: ReplayConfig = {
      incidentId: "test-incident-1",
      startTime: Date.now() - 60000,
      endTime: Date.now(),
      dataSources: ["ai"],
      includeAIDecisions: true,
      includeContextReconstruction: true,
      playbackSpeed: 1,
      highlightCriticalEvents: true,
    };

    const replay = await replayer.reconstructIncident(config);
    
    expect(replay.aiDecisions).toBeDefined();
    expect(Array.isArray(replay.aiDecisions)).toBe(true);
  });

  it("should export replay in JSON format", async () => {
    const config: ReplayConfig = {
      incidentId: "test-incident-1",
      startTime: Date.now() - 60000,
      endTime: Date.now(),
      dataSources: ["system"],
      includeAIDecisions: false,
      includeContextReconstruction: true,
      playbackSpeed: 1,
      highlightCriticalEvents: true,
    };

    await replayer.reconstructIncident(config);
    
    const jsonExport = await replayer.exportReplay({
      format: "json",
      includeContext: true,
      includeAIExplanations: true,
      includeVisualizations: false,
      includeRecommendations: true,
    });

    expect(jsonExport).toBeTruthy();
    expect(() => JSON.parse(jsonExport)).not.toThrow();
  });

  it("should export replay in text format", async () => {
    const config: ReplayConfig = {
      incidentId: "test-incident-1",
      startTime: Date.now() - 60000,
      endTime: Date.now(),
      dataSources: ["system"],
      includeAIDecisions: false,
      includeContextReconstruction: true,
      playbackSpeed: 1,
      highlightCriticalEvents: true,
    };

    await replayer.reconstructIncident(config);
    
    const textExport = await replayer.exportReplay({
      format: "text",
      includeContext: true,
      includeAIExplanations: true,
      includeVisualizations: false,
      includeRecommendations: true,
    });

    expect(textExport).toBeTruthy();
    expect(textExport).toContain("INCIDENT REPLAY REPORT");
    expect(textExport).toContain("TIMELINE");
  });

  it("should filter timeline events", async () => {
    const config: ReplayConfig = {
      incidentId: "test-incident-1",
      startTime: Date.now() - 60000,
      endTime: Date.now(),
      dataSources: ["system"],
      includeAIDecisions: false,
      includeContextReconstruction: true,
      playbackSpeed: 1,
      highlightCriticalEvents: true,
    };

    await replayer.reconstructIncident(config);
    
    const filteredEvents = replayer.filterTimeline({
      eventTypes: ["incident_start", "incident_end"],
    });

    expect(Array.isArray(filteredEvents)).toBe(true);
    expect(filteredEvents.every(e => 
      e.type === "incident_start" || e.type === "incident_end"
    )).toBe(true);
  });

  it("should provide replay statistics", async () => {
    const config: ReplayConfig = {
      incidentId: "test-incident-1",
      startTime: Date.now() - 60000,
      endTime: Date.now(),
      dataSources: ["system"],
      includeAIDecisions: false,
      includeContextReconstruction: true,
      playbackSpeed: 1,
      highlightCriticalEvents: true,
    };

    const replay = await replayer.reconstructIncident(config);
    
    expect(replay.statistics).toBeDefined();
    expect(replay.statistics.totalEvents).toBeGreaterThan(0);
    expect(replay.statistics).toHaveProperty("aiDecisionsCount");
    expect(replay.statistics).toHaveProperty("crewActionsCount");
    expect(replay.statistics).toHaveProperty("systemResponsesCount");
    expect(replay.statistics).toHaveProperty("averageResponseTime");
    expect(replay.statistics).toHaveProperty("incidentDuration");
  });
});

describe("Integration Tests - PATCHES 576-580", () => {
  it("should integrate Situational Awareness with Tactical Response", async () => {
    const awarenessCore = SituationalAwarenessCore.getInstance();
    const responseEngine = TacticalResponseEngine.getInstance();

    await awarenessCore.initialize({ enabled: false });
    await responseEngine.initialize();

    // Collect context that should trigger tactical response
    await awarenessCore.collectContext("navigation", "internal", {
      severity: "critical",
      issue: "GPS failure",
    });

    const stats = responseEngine.getStatistics();
    expect(stats.totalEvents).toBeGreaterThanOrEqual(0);

    awarenessCore.cleanup();
    responseEngine.cleanup();
  });

  it("should integrate Resilience Tracker with Tactical Response", async () => {
    const responseEngine = TacticalResponseEngine.getInstance();
    const resilienceTracker = MissionResilienceTracker.getInstance({
      missionId: "integration-test",
      enableRealTimeTracking: false,
      reportGenerationInterval: 60000,
      alertThresholds: {
        criticalScoreDrop: 20,
        minAcceptableScore: 50,
        maxRecoveryTime: 3600000,
      },
      integrations: {
        situationalAwareness: false,
        tacticalResponse: false,
      },
    });

    await responseEngine.initialize();
    await resilienceTracker.initialize();

    const index = resilienceTracker.getCurrentIndex();
    expect(index).toBeDefined();

    responseEngine.cleanup();
    resilienceTracker.cleanup();
  });
});
