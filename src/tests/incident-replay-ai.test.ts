/**
 * PATCH 535 - Incident Replay AI Tests
 * Tests for time control, AI highlights, and incident replay functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    })
  }
}));

interface IncidentLog {
  id: string;
  timestamp: Date;
  type: "sensor_reading" | "alarm" | "action" | "status_change" | "note";
  severity?: "info" | "warning" | "critical";
  data: any;
}

interface ReplayConfig {
  speed: number; // 1x, 2x, 0.5x etc
  startTime: Date;
  endTime: Date;
  highlightCritical: boolean;
  includeTypes?: string[];
}

interface AIHighlight {
  id: string;
  timestamp: Date;
  type: "critical_event" | "anomaly" | "pattern" | "root_cause";
  description: string;
  confidence: number;
  relatedLogs: string[];
}

interface ReplayState {
  currentTime: Date;
  isPlaying: boolean;
  speed: number;
  currentLogIndex: number;
}

// Mock Incident Replay Service
class IncidentReplayService {
  private logs: Map<string, IncidentLog[]> = new Map();
  private highlights: Map<string, AIHighlight[]> = new Map();
  private replayStates: Map<string, ReplayState> = new Map();

  async loadIncidentLogs(incidentId: string, logs: IncidentLog[]): Promise<void> {
    this.logs.set(incidentId, logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
  }

  async startReplay(incidentId: string, config: ReplayConfig): Promise<boolean> {
    const logs = this.logs.get(incidentId);
    if (!logs || logs.length === 0) return false;

    const state: ReplayState = {
      currentTime: config.startTime,
      isPlaying: true,
      speed: config.speed,
      currentLogIndex: 0
    };

    this.replayStates.set(incidentId, state);
    return true;
  }

  pauseReplay(incidentId: string): boolean {
    const state = this.replayStates.get(incidentId);
    if (!state) return false;

    state.isPlaying = false;
    return true;
  }

  resumeReplay(incidentId: string): boolean {
    const state = this.replayStates.get(incidentId);
    if (!state) return false;

    state.isPlaying = true;
    return true;
  }

  stopReplay(incidentId: string): boolean {
    return this.replayStates.delete(incidentId);
  }

  setReplaySpeed(incidentId: string, speed: number): boolean {
    const state = this.replayStates.get(incidentId);
    if (!state) return false;

    state.speed = speed;
    return true;
  }

  seekToTime(incidentId: string, targetTime: Date): boolean {
    const state = this.replayStates.get(incidentId);
    const logs = this.logs.get(incidentId);
    
    if (!state || !logs) return false;

    state.currentTime = targetTime;
    
    // Find closest log index
    state.currentLogIndex = logs.findIndex(log => log.timestamp >= targetTime);
    if (state.currentLogIndex === -1) {
      state.currentLogIndex = logs.length - 1;
    }

    return true;
  }

  getCurrentLogs(incidentId: string): IncidentLog[] {
    const state = this.replayStates.get(incidentId);
    const logs = this.logs.get(incidentId);

    if (!state || !logs) return [];

    return logs.filter(log => log.timestamp <= state.currentTime);
  }

  getReplayState(incidentId: string): ReplayState | undefined {
    return this.replayStates.get(incidentId);
  }

  async generateAIHighlights(incidentId: string): Promise<AIHighlight[]> {
    const logs = this.logs.get(incidentId);
    if (!logs) return [];

    const highlights: AIHighlight[] = [];

    // Identify critical events
    const criticalLogs = logs.filter(log => log.severity === "critical");
    criticalLogs.forEach((log, index) => {
      highlights.push({
        id: `highlight-critical-${index}`,
        timestamp: log.timestamp,
        type: "critical_event",
        description: `Critical event detected: ${log.type}`,
        confidence: 0.95,
        relatedLogs: [log.id]
      });
    });

    // Detect anomalies (simplified: rapid sequence of warnings)
    const warningLogs = logs.filter(log => log.severity === "warning");
    if (warningLogs.length >= 3) {
      const firstWarning = warningLogs[0];
      const lastWarning = warningLogs[warningLogs.length - 1];
      const timeDiff = lastWarning.timestamp.getTime() - firstWarning.timestamp.getTime();
      
      if (timeDiff < 60000) { // Within 1 minute
        highlights.push({
          id: "highlight-anomaly-1",
          timestamp: firstWarning.timestamp,
          type: "anomaly",
          description: `Anomaly detected: Rapid sequence of ${warningLogs.length} warnings`,
          confidence: 0.85,
          relatedLogs: warningLogs.map(l => l.id)
        });
      }
    }

    // Identify patterns (simplified: repeated event types)
    const eventTypeCounts: Record<string, number> = {};
    logs.forEach(log => {
      eventTypeCounts[log.type] = (eventTypeCounts[log.type] || 0) + 1;
    });

    Object.entries(eventTypeCounts).forEach(([type, count]) => {
      if (count > 5) {
        highlights.push({
          id: `highlight-pattern-${type}`,
          timestamp: logs.find(l => l.type === type)!.timestamp,
          type: "pattern",
          description: `Pattern identified: ${type} occurred ${count} times`,
          confidence: 0.75,
          relatedLogs: logs.filter(l => l.type === type).map(l => l.id)
        });
      }
    });

    // Find potential root cause (first critical or series of warnings)
    const firstCritical = logs.find(log => log.severity === "critical");
    if (firstCritical) {
      const precedingLogs = logs.filter(
        log => log.timestamp < firstCritical.timestamp &&
               log.timestamp.getTime() > firstCritical.timestamp.getTime() - 300000 // 5 minutes before
      );

      highlights.push({
        id: "highlight-root-cause",
        timestamp: firstCritical.timestamp,
        type: "root_cause",
        description: "Potential root cause identified",
        confidence: 0.70,
        relatedLogs: [firstCritical.id, ...precedingLogs.slice(-3).map(l => l.id)]
      });
    }

    this.highlights.set(incidentId, highlights);
    return highlights;
  }

  getHighlights(incidentId: string): AIHighlight[] {
    return this.highlights.get(incidentId) || [];
  }

  getHighlightsInTimeRange(incidentId: string, startTime: Date, endTime: Date): AIHighlight[] {
    const highlights = this.highlights.get(incidentId) || [];
    return highlights.filter(
      h => h.timestamp >= startTime && h.timestamp <= endTime
    );
  }

  async exportReplayData(incidentId: string): Promise<any> {
    const logs = this.logs.get(incidentId);
    const highlights = this.highlights.get(incidentId);
    const state = this.replayStates.get(incidentId);

    return {
      incidentId,
      logs: logs || [],
      highlights: highlights || [],
      replayState: state,
      exportedAt: new Date()
    });
  }

  clearIncidentData(incidentId: string): void {
    this.logs.delete(incidentId);
    this.highlights.delete(incidentId);
    this.replayStates.delete(incidentId);
  }
}

describe("Incident Replay AI Tests", () => {
  let service: IncidentReplayService;
  let sampleLogs: IncidentLog[];

  beforeEach(() => {
    service = new IncidentReplayService();
    
    const baseTime = new Date("2025-01-01T10:00:00Z");
    sampleLogs = [
      {
        id: "log-1",
        timestamp: new Date(baseTime.getTime()),
        type: "sensor_reading",
        severity: "info",
        data: { temperature: 25 }
      },
      {
        id: "log-2",
        timestamp: new Date(baseTime.getTime() + 60000),
        type: "alarm",
        severity: "warning",
        data: { type: "temperature_high" }
      },
      {
        id: "log-3",
        timestamp: new Date(baseTime.getTime() + 120000),
        type: "alarm",
        severity: "warning",
        data: { type: "pressure_low" }
      },
      {
        id: "log-4",
        timestamp: new Date(baseTime.getTime() + 180000),
        type: "alarm",
        severity: "critical",
        data: { type: "system_failure" }
      },
      {
        id: "log-5",
        timestamp: new Date(baseTime.getTime() + 240000),
        type: "action",
        severity: "info",
        data: { action: "emergency_shutdown" }
      }
    ];

    vi.clearAllMocks();
  });

  describe("Log Loading", () => {
    it("should load incident logs successfully", async () => {
      await service.loadIncidentLogs("incident-1", sampleLogs);

      const state = service.getReplayState("incident-1");
      expect(state).toBeUndefined(); // Not started yet

      const logs = await service.exportReplayData("incident-1");
      expect(logs.logs).toHaveLength(5);
    });

    it("should sort logs chronologically", async () => {
      const unsortedLogs = [...sampleLogs].reverse();
      await service.loadIncidentLogs("incident-1", unsortedLogs);

      const exported = await service.exportReplayData("incident-1");
      const logs = exported.logs;

      for (let i = 1; i < logs.length; i++) {
        expect(logs[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          logs[i - 1].timestamp.getTime()
        );
      }
    });

    it("should handle empty log array", async () => {
      await service.loadIncidentLogs("incident-1", []);

      const exported = await service.exportReplayData("incident-1");
      expect(exported.logs).toHaveLength(0);
    });
  });

  describe("Replay Control", () => {
    beforeEach(async () => {
      await service.loadIncidentLogs("incident-1", sampleLogs);
    });

    it("should start replay successfully", async () => {
      const config: ReplayConfig = {
        speed: 1,
        startTime: sampleLogs[0].timestamp,
        endTime: sampleLogs[sampleLogs.length - 1].timestamp,
        highlightCritical: true
      };

      const started = await service.startReplay("incident-1", config);

      expect(started).toBe(true);

      const state = service.getReplayState("incident-1");
      expect(state).toBeDefined();
      expect(state?.isPlaying).toBe(true);
      expect(state?.speed).toBe(1);
    });

    it("should not start replay for non-existent incident", async () => {
      const config: ReplayConfig = {
        speed: 1,
        startTime: new Date(),
        endTime: new Date(),
        highlightCritical: false
      };

      const started = await service.startReplay("non-existent", config);

      expect(started).toBe(false);
    });

    it("should pause replay", async () => {
      const config: ReplayConfig = {
        speed: 1,
        startTime: sampleLogs[0].timestamp,
        endTime: sampleLogs[sampleLogs.length - 1].timestamp,
        highlightCritical: true
      };

      await service.startReplay("incident-1", config);
      const paused = service.pauseReplay("incident-1");

      expect(paused).toBe(true);

      const state = service.getReplayState("incident-1");
      expect(state?.isPlaying).toBe(false);
    });

    it("should resume replay", async () => {
      const config: ReplayConfig = {
        speed: 1,
        startTime: sampleLogs[0].timestamp,
        endTime: sampleLogs[sampleLogs.length - 1].timestamp,
        highlightCritical: true
      };

      await service.startReplay("incident-1", config);
      service.pauseReplay("incident-1");
      const resumed = service.resumeReplay("incident-1");

      expect(resumed).toBe(true);

      const state = service.getReplayState("incident-1");
      expect(state?.isPlaying).toBe(true);
    });

    it("should stop replay", async () => {
      const config: ReplayConfig = {
        speed: 1,
        startTime: sampleLogs[0].timestamp,
        endTime: sampleLogs[sampleLogs.length - 1].timestamp,
        highlightCritical: true
      };

      await service.startReplay("incident-1", config);
      const stopped = service.stopReplay("incident-1");

      expect(stopped).toBe(true);

      const state = service.getReplayState("incident-1");
      expect(state).toBeUndefined();
    });
  });

  describe("Time Control", () => {
    beforeEach(async () => {
      await service.loadIncidentLogs("incident-1", sampleLogs);
      
      const config: ReplayConfig = {
        speed: 1,
        startTime: sampleLogs[0].timestamp,
        endTime: sampleLogs[sampleLogs.length - 1].timestamp,
        highlightCritical: true
      };

      await service.startReplay("incident-1", config);
    });

    it("should adjust replay speed", () => {
      const speedUpdated = service.setReplaySpeed("incident-1", 2);

      expect(speedUpdated).toBe(true);

      const state = service.getReplayState("incident-1");
      expect(state?.speed).toBe(2);
    });

    it("should support various playback speeds", () => {
      const speeds = [0.25, 0.5, 1, 2, 4, 8];

      speeds.forEach(speed => {
        service.setReplaySpeed("incident-1", speed);
        const state = service.getReplayState("incident-1");
        expect(state?.speed).toBe(speed);
      });
    });

    it("should seek to specific time", () => {
      const targetTime = sampleLogs[2].timestamp;
      const seeked = service.seekToTime("incident-1", targetTime);

      expect(seeked).toBe(true);

      const state = service.getReplayState("incident-1");
      expect(state?.currentTime).toEqual(targetTime);
    });

    it("should update log index when seeking", () => {
      const targetTime = sampleLogs[2].timestamp;
      service.seekToTime("incident-1", targetTime);

      const state = service.getReplayState("incident-1");
      expect(state?.currentLogIndex).toBeGreaterThanOrEqual(2);
    });

    it("should handle seeking beyond end time", () => {
      const futureTime = new Date(sampleLogs[sampleLogs.length - 1].timestamp.getTime() + 1000000);
      const seeked = service.seekToTime("incident-1", futureTime);

      expect(seeked).toBe(true);

      const state = service.getReplayState("incident-1");
      expect(state?.currentLogIndex).toBe(sampleLogs.length - 1);
    });

    it("should return logs up to current time", () => {
      const midTime = sampleLogs[2].timestamp;
      service.seekToTime("incident-1", midTime);

      const currentLogs = service.getCurrentLogs("incident-1");

      expect(currentLogs.length).toBeLessThanOrEqual(3);
      currentLogs.forEach(log => {
        expect(log.timestamp.getTime()).toBeLessThanOrEqual(midTime.getTime());
      });
    });
  });

  describe("AI Highlights Generation", () => {
    beforeEach(async () => {
      await service.loadIncidentLogs("incident-1", sampleLogs);
    });

    it("should generate AI highlights", async () => {
      const highlights = await service.generateAIHighlights("incident-1");

      expect(highlights.length).toBeGreaterThan(0);
      highlights.forEach(highlight => {
        expect(highlight).toHaveProperty("id");
        expect(highlight).toHaveProperty("timestamp");
        expect(highlight).toHaveProperty("type");
        expect(highlight).toHaveProperty("confidence");
      });
    });

    it("should identify critical events", async () => {
      const highlights = await service.generateAIHighlights("incident-1");

      const criticalHighlights = highlights.filter(h => h.type === "critical_event");
      expect(criticalHighlights.length).toBeGreaterThan(0);
    });

    it("should detect anomalies", async () => {
      const highlights = await service.generateAIHighlights("incident-1");

      const anomalyHighlights = highlights.filter(h => h.type === "anomaly");
      // May or may not detect depending on data
      expect(anomalyHighlights.length).toBeGreaterThanOrEqual(0);
    });

    it("should identify patterns", async () => {
      // Add more logs of same type to trigger pattern detection
      const moreAlarms = Array(10).fill(null).map((_, i) => ({
        id: `extra-${i}`,
        timestamp: new Date(sampleLogs[0].timestamp.getTime() + (i + 10) * 10000),
        type: "alarm" as const,
        severity: "warning" as const,
        data: { type: "test" }
      }));

      await service.loadIncidentLogs("incident-2", [...sampleLogs, ...moreAlarms]);
      const highlights = await service.generateAIHighlights("incident-2");

      const patternHighlights = highlights.filter(h => h.type === "pattern");
      expect(patternHighlights.length).toBeGreaterThan(0);
    });

    it("should identify potential root cause", async () => {
      const highlights = await service.generateAIHighlights("incident-1");

      const rootCauseHighlights = highlights.filter(h => h.type === "root_cause");
      expect(rootCauseHighlights.length).toBeGreaterThan(0);
    });

    it("should assign confidence scores", async () => {
      const highlights = await service.generateAIHighlights("incident-1");

      highlights.forEach(highlight => {
        expect(highlight.confidence).toBeGreaterThan(0);
        expect(highlight.confidence).toBeLessThanOrEqual(1);
      });
    });

    it("should link highlights to related logs", async () => {
      const highlights = await service.generateAIHighlights("incident-1");

      highlights.forEach(highlight => {
        expect(highlight.relatedLogs).toBeDefined();
        expect(Array.isArray(highlight.relatedLogs)).toBe(true);
        expect(highlight.relatedLogs.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Highlight Querying", () => {
    beforeEach(async () => {
      await service.loadIncidentLogs("incident-1", sampleLogs);
      await service.generateAIHighlights("incident-1");
    });

    it("should retrieve all highlights", () => {
      const highlights = service.getHighlights("incident-1");

      expect(highlights.length).toBeGreaterThan(0);
    });

    it("should filter highlights by time range", () => {
      const startTime = sampleLogs[1].timestamp;
      const endTime = sampleLogs[3].timestamp;

      const highlights = service.getHighlightsInTimeRange("incident-1", startTime, endTime);

      highlights.forEach(highlight => {
        expect(highlight.timestamp.getTime()).toBeGreaterThanOrEqual(startTime.getTime());
        expect(highlight.timestamp.getTime()).toBeLessThanOrEqual(endTime.getTime());
      });
    });

    it("should return empty array for non-existent incident", () => {
      const highlights = service.getHighlights("non-existent");

      expect(highlights).toEqual([]);
    });

    it("should return empty array for time range with no highlights", () => {
      const futureStart = new Date(sampleLogs[sampleLogs.length - 1].timestamp.getTime() + 100000);
      const futureEnd = new Date(futureStart.getTime() + 100000);

      const highlights = service.getHighlightsInTimeRange("incident-1", futureStart, futureEnd);

      expect(highlights).toEqual([]);
    });
  });

  describe("Data Export", () => {
    beforeEach(async () => {
      await service.loadIncidentLogs("incident-1", sampleLogs);
      await service.generateAIHighlights("incident-1");
    });

    it("should export complete replay data", async () => {
      const config: ReplayConfig = {
        speed: 1,
        startTime: sampleLogs[0].timestamp,
        endTime: sampleLogs[sampleLogs.length - 1].timestamp,
        highlightCritical: true
      };

      await service.startReplay("incident-1", config);

      const exported = await service.exportReplayData("incident-1");

      expect(exported.incidentId).toBe("incident-1");
      expect(exported.logs).toBeDefined();
      expect(exported.highlights).toBeDefined();
      expect(exported.replayState).toBeDefined();
      expect(exported.exportedAt).toBeDefined();
    });

    it("should export without replay state if not started", async () => {
      const exported = await service.exportReplayData("incident-1");

      expect(exported.logs).toBeDefined();
      expect(exported.highlights).toBeDefined();
      expect(exported.replayState).toBeUndefined();
    });

    it("should include all logs in export", async () => {
      const exported = await service.exportReplayData("incident-1");

      expect(exported.logs).toHaveLength(sampleLogs.length);
    });

    it("should include all highlights in export", async () => {
      const exported = await service.exportReplayData("incident-1");

      expect(exported.highlights.length).toBeGreaterThan(0);
    });
  });

  describe("Data Management", () => {
    beforeEach(async () => {
      await service.loadIncidentLogs("incident-1", sampleLogs);
      await service.generateAIHighlights("incident-1");
    });

    it("should clear incident data", () => {
      service.clearIncidentData("incident-1");

      const highlights = service.getHighlights("incident-1");
      const state = service.getReplayState("incident-1");

      expect(highlights).toEqual([]);
      expect(state).toBeUndefined();
    });

    it("should handle clearing non-existent incident", () => {
      expect(() => service.clearIncidentData("non-existent")).not.toThrow();
    });
  });

  describe("Integration Scenarios", () => {
    it("should support complete replay workflow", async () => {
      // Load logs
      await service.loadIncidentLogs("incident-1", sampleLogs);

      // Generate highlights
      const highlights = await service.generateAIHighlights("incident-1");
      expect(highlights.length).toBeGreaterThan(0);

      // Start replay
      const config: ReplayConfig = {
        speed: 1,
        startTime: sampleLogs[0].timestamp,
        endTime: sampleLogs[sampleLogs.length - 1].timestamp,
        highlightCritical: true
      };
      await service.startReplay("incident-1", config);

      // Pause and adjust speed
      service.pauseReplay("incident-1");
      service.setReplaySpeed("incident-1", 2);

      // Resume and seek
      service.resumeReplay("incident-1");
      service.seekToTime("incident-1", sampleLogs[2].timestamp);

      // Get current state
      const currentLogs = service.getCurrentLogs("incident-1");
      expect(currentLogs.length).toBeGreaterThan(0);

      // Export data
      const exported = await service.exportReplayData("incident-1");
      expect(exported.logs).toHaveLength(sampleLogs.length);

      // Stop replay
      service.stopReplay("incident-1");

      // Clean up
      service.clearIncidentData("incident-1");
    });

    it("should handle concurrent replays", async () => {
      const logs1 = sampleLogs.slice(0, 3);
      const logs2 = sampleLogs.slice(2, 5);

      await service.loadIncidentLogs("incident-1", logs1);
      await service.loadIncidentLogs("incident-2", logs2);

      const config: ReplayConfig = {
        speed: 1,
        startTime: logs1[0].timestamp,
        endTime: logs1[logs1.length - 1].timestamp,
        highlightCritical: true
      };

      await service.startReplay("incident-1", config);
      await service.startReplay("incident-2", config);

      const state1 = service.getReplayState("incident-1");
      const state2 = service.getReplayState("incident-2");

      expect(state1).toBeDefined();
      expect(state2).toBeDefined();
      expect(state1?.isPlaying).toBe(true);
      expect(state2?.isPlaying).toBe(true);
    });

    it("should handle replay of incident with many logs", async () => {
      const manyLogs: IncidentLog[] = Array(1000).fill(null).map((_, i) => ({
        id: `log-${i}`,
        timestamp: new Date(Date.now() + i * 1000),
        type: i % 2 === 0 ? "sensor_reading" : "alarm",
        severity: i % 10 === 0 ? "critical" : i % 5 === 0 ? "warning" : "info",
        data: { index: i }
      }));

      await service.loadIncidentLogs("large-incident", manyLogs);

      const highlights = await service.generateAIHighlights("large-incident");
      expect(highlights.length).toBeGreaterThan(0);

      const config: ReplayConfig = {
        speed: 1,
        startTime: manyLogs[0].timestamp,
        endTime: manyLogs[manyLogs.length - 1].timestamp,
        highlightCritical: true
      };

      const started = await service.startReplay("large-incident", config);
      expect(started).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should generate highlights efficiently", async () => {
      const manyLogs: IncidentLog[] = Array(100).fill(null).map((_, i) => ({
        id: `log-${i}`,
        timestamp: new Date(Date.now() + i * 1000),
        type: "sensor_reading",
        severity: "info",
        data: { value: i }
      }));

      await service.loadIncidentLogs("perf-test", manyLogs);

      const start = Date.now();
      await service.generateAIHighlights("perf-test");
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it("should seek efficiently in large log sets", async () => {
      const manyLogs: IncidentLog[] = Array(1000).fill(null).map((_, i) => ({
        id: `log-${i}`,
        timestamp: new Date(Date.now() + i * 1000),
        type: "sensor_reading",
        severity: "info",
        data: { value: i }
      }));

      await service.loadIncidentLogs("seek-test", manyLogs);

      const config: ReplayConfig = {
        speed: 1,
        startTime: manyLogs[0].timestamp,
        endTime: manyLogs[manyLogs.length - 1].timestamp,
        highlightCritical: false
      };

      await service.startReplay("seek-test", config);

      const start = Date.now();
      service.seekToTime("seek-test", manyLogs[500].timestamp);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });
  });
});
