/**
 * PATCHES 596-600 - Mission Intelligence System
 * 
 * Main export file for the complete mission intelligence system.
 * This module provides a unified interface for:
 * - Persistent Intelligence Core (596)
 * - Situational Signal Collector (597)
 * - Global Pattern Recognition Engine (598)
 * - Mission Replay Annotator (599)
 * - Global Mission Awareness Dashboard (600)
 */

// Core exports
export {
  intelligenceCore,
  PersistentIntelligenceCore,
  demonstrateIntelligenceCore,
  type MissionContext,
  type MissionIntelligence,
} from "./mission/persistent-intelligence-core";

export {
  signalCollector,
  SituationalSignalCollector,
  demonstrateSituationalCollector,
  type SignalType,
  type RawSignal,
  type NormalizedSignal,
  type SignalRecord,
} from "./signal/situational-collector";

export {
  patternEngine,
  PatternRecognitionEngine,
  demonstratePatternEngine,
  type PatternType,
  type PatternData,
  type MissionPattern,
  type PatternAlert,
} from "./analytics/pattern-engine";

export {
  replayAnnotator,
  MissionReplayAnnotator,
  demonstrateReplayAnnotator,
  type EventType,
  type ReplayEvent,
  type TimelineEvent,
  type MissionReplay,
} from "./tools/mission-replay";

/**
 * Complete mission intelligence workflow example
 */
export async function runCompleteWorkflow(missionId: string) {
  console.log("🚀 Starting complete mission intelligence workflow...");
  console.log(`Mission ID: ${missionId}\n`);

  // Step 1: Initialize mission intelligence
  console.log("📋 Step 1: Initializing mission intelligence...");
  const context = await intelligenceCore.initializeMission(missionId);
  console.log(`✅ Mission initialized - Session #${context.session_count}\n`);

  // Step 2: Collect situational signals
  console.log("📡 Step 2: Collecting situational signals...");
  
  // Voice signal
  await signalCollector.collectSignal(missionId, {
    type: "voice",
    data: {
      transcript: "Mission control, all systems operational",
      volume: 80,
      clarity: 0.95,
      source: "radio-alpha",
    },
  });

  // Climate signal
  await signalCollector.collectSignal(missionId, {
    type: "climate",
    data: {
      temperature: 22,
      humidity: 60,
      pressure: 1013,
      unit: "celsius",
      source: "weather-station",
    },
  });

  // Sensor signal
  await signalCollector.collectSignal(missionId, {
    type: "sensor",
    data: {
      value: 92,
      unit: "percent",
      sensor_id: "fuel-sensor-01",
      quality: 0.98,
    },
  });

  // Navigation signal
  await signalCollector.collectSignal(missionId, {
    type: "navigation",
    data: {
      latitude: -23.5505,
      longitude: -46.6333,
      altitude: 760,
      speed: 45,
      heading: 270,
      source: "gps-primary",
    },
  });

  const stats = await signalCollector.getSignalStats(missionId);
  console.log(`✅ Collected signals:`, stats);
  console.log();

  // Step 3: Record mission decisions
  console.log("🎯 Step 3: Recording mission decisions...");
  
  await intelligenceCore.addDecision(
    missionId,
    "Deploy emergency response team",
    "success",
    0.92
  );

  await intelligenceCore.addDecision(
    missionId,
    "Activate backup communication systems",
    "success",
    0.88
  );

  await intelligenceCore.addDecision(
    missionId,
    "Establish perimeter security",
    "success",
    0.90
  );

  console.log("✅ Decisions recorded\n");

  // Step 4: Learn patterns from mission
  console.log("🎓 Step 4: Learning patterns from mission data...");
  
  await intelligenceCore.learnPattern(
    missionId,
    "Emergency response protocols are most effective when deployed early",
    3,
    0.94
  );

  await intelligenceCore.learnPattern(
    missionId,
    "Communication quality improves with redundant systems",
    5,
    0.89
  );

  console.log("✅ Patterns learned\n");

  // Step 5: Analyze and detect patterns
  console.log("🔍 Step 5: Analyzing mission for global patterns...");
  
  const patterns = await patternEngine.analyzeAndDetectPatterns(missionId);
  console.log(`✅ Detected ${patterns.length} patterns:`);
  patterns.forEach((pattern, i) => {
    console.log(`   ${i + 1}. ${pattern.pattern_type.toUpperCase()}: ${pattern.pattern_data.description}`);
  });
  console.log();

  // Step 6: Generate alerts
  console.log("🚨 Step 6: Generating preventive alerts...");
  
  const alerts: any[] = [];
  for (const pattern of patterns) {
    if (pattern.confidence_score > 0.7) {
      const alert = await patternEngine.emitAlert(pattern);
      alerts.push(alert);
    }
  }
  
  console.log(`✅ Generated ${alerts.length} alerts:`);
  alerts.forEach((alert, i) => {
    console.log(`   ${i + 1}. ${alert.severity.toUpperCase()}: ${alert.message}`);
  });
  console.log();

  // Step 7: Record replay events
  console.log("🎬 Step 7: Recording mission replay events...");
  
  await replayAnnotator.recordEvent(missionId, "info", {
    description: "Mission initiated",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  });

  await replayAnnotator.recordEvent(missionId, "success", {
    description: "Team deployed successfully",
    timestamp: new Date(Date.now() - 2400000).toISOString(),
  });

  await replayAnnotator.recordEvent(missionId, "success", {
    description: "All objectives completed",
    timestamp: new Date().toISOString(),
  });

  console.log("✅ Replay events recorded\n");

  // Step 8: Build mission replay
  console.log("📹 Step 8: Building mission replay...");
  
  const replay = await replayAnnotator.buildReplay(missionId);
  if (replay) {
    console.log(`✅ Replay built with ${replay.events.length} events`);
    console.log(`   Duration: ${replay.duration_minutes} minutes`);
    console.log(`   Success rate: ${(replay.summary.successes / replay.summary.total_events * 100).toFixed(0)}%`);
  }
  console.log();

  // Step 9: Get AI suggestions
  console.log("💡 Step 9: Getting AI suggestions for future missions...");
  
  const suggestions = await intelligenceCore.getSuggestions(missionId);
  console.log("✅ AI Suggestions:");
  suggestions.forEach((suggestion, i) => {
    console.log(`   ${i + 1}. ${suggestion}`);
  });
  console.log();

  // Summary
  console.log("=" .repeat(60));
  console.log("✅ WORKFLOW COMPLETE - Mission Intelligence System Active");
  console.log("=" .repeat(60));
  console.log(`Mission ID: ${missionId}`);
  console.log(`Session Count: ${context.session_count}`);
  console.log(`Signals Collected: ${Object.values(stats).reduce((a, b) => a + b, 0)}`);
  console.log(`Decisions Made: 3`);
  console.log(`Patterns Detected: ${patterns.length}`);
  console.log(`Alerts Generated: ${alerts.length}`);
  console.log(`Replay Events: ${replay?.events.length || 0}`);
  console.log("=" .repeat(60));

  return {
    context,
    stats,
    patterns,
    alerts,
    replay,
    suggestions,
  };
}

/**
 * Quick start example for new users
 */
export async function quickStartExample() {
  console.log("🚀 Mission Intelligence System - Quick Start Example\n");
  
  const missionId = `quickstart-${Date.now()}`;
  
  // 1. Initialize
  await intelligenceCore.initializeMission(missionId);
  console.log("✅ Mission initialized\n");
  
  // 2. Collect a signal
  await signalCollector.collectSignal(missionId, {
    type: "voice",
    data: { transcript: "Systems online", volume: 75, clarity: 0.9 },
  });
  console.log("✅ Signal collected\n");
  
  // 3. Record a decision
  await intelligenceCore.addDecision(missionId, "Start mission", "success", 0.9);
  console.log("✅ Decision recorded\n");
  
  // 4. Record an event
  await replayAnnotator.recordEvent(missionId, "success", {
    description: "Mission started successfully",
  });
  console.log("✅ Event recorded\n");
  
  console.log("✨ Quick start complete! Your mission is being tracked.\n");
}

/**
 * Health check for all systems
 */
export async function systemHealthCheck() {
  console.log("🏥 Running Mission Intelligence System Health Check...\n");
  
  const results = {
    intelligenceCore: false,
    signalCollector: false,
    patternEngine: false,
    replayAnnotator: false,
  };
  
  try {
    // Test intelligence core
    const testMissionId = `health-check-${Date.now()}`;
    await intelligenceCore.initializeMission(testMissionId);
    results.intelligenceCore = true;
    console.log("✅ Intelligence Core: Operational");
  } catch (err) {
    console.log("❌ Intelligence Core: Error");
  }
  
  try {
    // Test signal collector
    const stats = await signalCollector.getSignalStats("test");
    results.signalCollector = true;
    console.log("✅ Signal Collector: Operational");
  } catch (err) {
    console.log("❌ Signal Collector: Error");
  }
  
  try {
    // Test pattern engine
    const patterns = await patternEngine.getPatterns();
    results.patternEngine = true;
    console.log("✅ Pattern Engine: Operational");
  } catch (err) {
    console.log("❌ Pattern Engine: Error");
  }
  
  try {
    // Test replay annotator
    const events = await replayAnnotator.getRecentEvents("test", 1);
    results.replayAnnotator = true;
    console.log("✅ Replay Annotator: Operational");
  } catch (err) {
    console.log("❌ Replay Annotator: Error");
  }
  
  const allHealthy = Object.values(results).every((r) => r);
  console.log("\n" + "=".repeat(60));
  console.log(allHealthy ? "✅ All Systems Operational" : "⚠️ Some Systems Have Issues");
  console.log("=".repeat(60));
  
  return results;
}
