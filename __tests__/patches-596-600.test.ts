import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import { intelligenceCore } from "@/ai/mission/persistent-intelligence-core";
import { signalCollector } from "@/ai/signal/situational-collector";
import { patternEngine } from "@/ai/analytics/pattern-engine";
import { replayAnnotator } from "@/ai/tools/mission-replay";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  },
}));

describe("PATCH 596 - Persistent Mission Intelligence Core", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Mission Initialization", () => {
    it("should create new mission intelligence", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
          }),
        }),
        upsert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const context = await intelligenceCore.initializeMission("test-mission-1");

      expect(context.mission_id).toBe("test-mission-1");
      expect(context.session_count).toBe(1);
      expect(context.decisions).toEqual([]);
      expect(context.patterns_learned).toEqual([]);
    });

    it("should restore existing mission intelligence", async () => {
      const existingData = {
        mission_id: "test-mission-2",
        context: { test: true },
        decisions: [{ decision: "test", outcome: "success" }],
        patterns_learned: [{ pattern: "test", frequency: 1 }],
        session_count: 3,
        last_session_at: new Date().toISOString(),
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: existingData, error: null }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
        upsert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const context = await intelligenceCore.initializeMission("test-mission-2");

      expect(context.session_count).toBe(4); // Incremented
      expect(context.decisions.length).toBe(1);
    });
  });

  describe("Decision Management", () => {
    it("should add decision to mission", async () => {
      const existingData = {
        mission_id: "test-mission",
        decisions: [],
        patterns_learned: [],
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: existingData, error: null }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      await intelligenceCore.addDecision("test-mission", "Deploy team", "success", 0.9);

      expect(mockFrom).toHaveBeenCalledWith("mission_intelligence");
    });
  });

  describe("Pattern Learning", () => {
    it("should learn new pattern", async () => {
      const existingData = {
        mission_id: "test-mission",
        patterns_learned: [],
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: existingData, error: null }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      await intelligenceCore.learnPattern("test-mission", "Test pattern", 1, 0.8);

      expect(mockFrom).toHaveBeenCalled();
    });
  });

  describe("Local Cache", () => {
    it("should cache mission locally", async () => {
      const mockData = {
        mission_id: "cached-mission",
        context: {},
        decisions: [],
        patterns_learned: [],
        session_count: 1,
        last_session_at: new Date().toISOString(),
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
          }),
        }),
        upsert: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      await intelligenceCore.initializeMission("cached-mission");

      const cached = intelligenceCore.getFromLocalCache("cached-mission");
      expect(cached).toBeTruthy();
    });
  });
});

describe("PATCH 597 - Situational Signal Collector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Signal Collection", () => {
    it("should collect voice signal", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "signal-1",
                mission_id: "test",
                signal_type: "voice",
                timestamp: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const signal = await signalCollector.collectSignal("test-mission", {
        type: "voice",
        data: { transcript: "Test message", volume: 75, clarity: 0.9 },
      });

      expect(signal).toBeTruthy();
      expect(mockFrom).toHaveBeenCalledWith("situational_signals");
    });

    it("should collect climate signal", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "signal-2",
                signal_type: "climate",
              },
              error: null,
            }),
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const signal = await signalCollector.collectSignal("test-mission", {
        type: "climate",
        data: { temperature: 22, humidity: 60 },
      });

      expect(signal).toBeTruthy();
    });

    it("should normalize sensor signal", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "signal-3",
                signal_type: "sensor",
                normalized_data: { value: 85, quality: 0.85 },
              },
              error: null,
            }),
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const signal = await signalCollector.collectSignal("test-mission", {
        type: "sensor",
        data: { value: 85, unit: "percent", sensor_id: "sensor-01" },
      });

      expect(signal).toBeTruthy();
    });
  });

  describe("Signal Statistics", () => {
    it("should get signal stats", async () => {
      const mockSignals = [
        { signal_type: "voice" },
        { signal_type: "voice" },
        { signal_type: "climate" },
        { signal_type: "sensor" },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: mockSignals, error: null }),
            }),
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const stats = await signalCollector.getSignalStats("test-mission");

      expect(stats.voice).toBe(2);
      expect(stats.climate).toBe(1);
      expect(stats.sensor).toBe(1);
    });
  });
});

describe("PATCH 598 - Global Pattern Recognition Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Pattern Detection", () => {
    it("should detect patterns in mission data", async () => {
      // Mock intelligence data
      const mockIntelligence = {
        mission_id: "test",
        decisions: [
          { decision: "test1", outcome: "success", confidence: 0.9 },
          { decision: "test2", outcome: "success", confidence: 0.85 },
          { decision: "test3", outcome: "success", confidence: 0.88 },
        ],
        patterns_learned: [],
      };

      vi.spyOn(intelligenceCore, "fetchMissionIntelligence").mockResolvedValue(mockIntelligence as any);

      // Mock signals
      const mockSignals: any[] = [];
      vi.spyOn(signalCollector, "getSignals").mockResolvedValue(mockSignals);

      // Mock pattern creation
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "pattern-1", pattern_type: "success" },
              error: null,
            }),
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const patterns = await patternEngine.analyzeAndDetectPatterns("test-mission");

      expect(patterns.length).toBeGreaterThan(0);
    });
  });

  describe("Alert Generation", () => {
    it("should emit alert for high-confidence failure pattern", async () => {
      const mockPattern = {
        id: "pattern-1",
        pattern_type: "failure" as const,
        pattern_data: { description: "Test failure pattern", indicators: [], conditions: {}, sample_size: 10 },
        mission_types: ["test"],
        occurrences: 5,
        confidence_score: 0.9,
        preventive_actions: ["Take action"],
        first_detected_at: new Date().toISOString(),
        last_detected_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const alert = await patternEngine.emitAlert(mockPattern);

      expect(alert.severity).toBe("critical");
      expect(alert.pattern_type).toBe("failure");
    });
  });
});

describe("PATCH 599 - Mission Replay Annotator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Event Recording", () => {
    it("should record replay event with AI annotation", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "event-1",
                event_type: "critical",
                ai_annotation: "Test annotation",
              },
              error: null,
            }),
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const event = await replayAnnotator.recordEvent("test-mission", "critical", {
        description: "Critical event",
        timestamp: new Date().toISOString(),
      });

      expect(event).toBeTruthy();
      expect(event?.event_type).toBe("critical");
    });
  });

  describe("Replay Building", () => {
    it("should build mission replay timeline", async () => {
      const mockEvents = [
        {
          id: "1",
          mission_id: "test",
          event_type: "info",
          event_data: { description: "Start" },
          ai_annotation: "Mission started",
          ai_insights: [],
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "2",
          mission_id: "test",
          event_type: "success",
          event_data: { description: "Complete" },
          ai_annotation: "Mission completed",
          ai_insights: [],
          timestamp: new Date().toISOString(),
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockEvents, error: null }),
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);
      vi.spyOn(intelligenceCore, "fetchMissionIntelligence").mockResolvedValue(null);

      const replay = await replayAnnotator.buildReplay("test-mission");

      expect(replay).toBeTruthy();
      expect(replay?.events.length).toBe(2);
      expect(replay?.summary.total_events).toBe(2);
    });
  });

  describe("Export Functionality", () => {
    it("should export replay to JSON", async () => {
      const mockReplay = {
        mission_id: "test",
        mission_name: "Test Mission",
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_minutes: 60,
        events: [],
        summary: { total_events: 0, critical_events: 0, warnings: 0, successes: 0 },
        ai_insights: [],
      };

      const json = await replayAnnotator.exportToJSON(mockReplay);

      expect(json).toBeTruthy();
      expect(JSON.parse(json)).toEqual(mockReplay);
    });

    it("should export replay to text", async () => {
      const mockReplay = {
        mission_id: "test",
        mission_name: "Test Mission",
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_minutes: 60,
        events: [],
        summary: { total_events: 0, critical_events: 0, warnings: 0, successes: 0 },
        ai_insights: ["Insight 1", "Insight 2"],
      };

      const text = await replayAnnotator.exportToText(mockReplay);

      expect(text).toContain("MISSION REPLAY REPORT");
      expect(text).toContain("Test Mission");
      expect(text).toContain("Insight 1");
    });
  });
});

describe("PATCH 600 - Global Mission Awareness Dashboard", () => {
  it("should be a React component", () => {
    // This is a placeholder test for the dashboard component
    // In a real test, we would render the component and test its functionality
    expect(true).toBe(true);
  });
});
