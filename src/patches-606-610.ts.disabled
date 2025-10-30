/**
 * PATCHES 606-610: AI & Voice Command Systems
 * 
 * Centralized exports for visual awareness, anomaly detection,
 * and voice command modules.
 */

// PATCH 606: Visual Situational Awareness Engine
export {
  visualAwarenessEngine,
  VisualSituationalAwarenessEngine,
  type VisualAlert,
  type VisualPattern,
  type AwarenessContext,
  type PerformanceMetrics as VisualPerformanceMetrics,
} from "./ai/visual/awareness-engine";

// PATCH 607: Anomaly Pattern Detector
export {
  anomalyDetector,
  AnomalyPatternDetector,
  type AnomalyDetection,
  type AnomalySeverity,
  type AnomalyType,
  type MetricData,
  type TrainingData,
  type DetectorConfig,
  type PerformanceStats as AnomalyPerformanceStats,
} from "./ai/anomaly/pattern-detector";

// PATCH 608: Distributed Voice Command Core
export {
  voiceCommandCore,
  DistributedVoiceCommandCore,
  type VoiceCommand,
  type CommandResult,
  type CommandIntent,
  type CommandStatus,
  type ModuleCommandMapping,
  type CommandDefinition,
  type CommandExecutionLog,
} from "./assistants/voice/distributed-commands";

// PATCH 609: Voice Command Tactical Fallback
export {
  tacticalFallback,
  VoiceCommandTacticalFallback,
  type TacticalCommand,
  type TacticalCommandType,
  type FallbackExecution,
  type WatchdogAlert,
} from "./assistants/voice/tactical-fallback";

// PATCH 610: Embedded Voice Feedback Reporter
export {
  voiceFeedbackReporter,
  EmbeddedVoiceFeedbackReporter,
  type VoiceFeedback,
  type FeedbackType,
  type VoiceProfile,
  type FeedbackTemplate,
  type TTSConfig,
  type FeedbackMetrics,
} from "./assistants/voice/voice-feedback";

/**
 * Initialize all systems
 */
export async function initializeAIVoiceSystems() {
  console.log("🚀 Initializing AI & Voice Command Systems...");
  
  try {
    // Import singleton instances
    const { visualAwarenessEngine } = await import("./ai/visual/awareness-engine");
    const { anomalyDetector } = await import("./ai/anomaly/pattern-detector");
    const { voiceCommandCore } = await import("./assistants/voice/distributed-commands");
    const { tacticalFallback } = await import("./assistants/voice/tactical-fallback");
    const { voiceFeedbackReporter } = await import("./assistants/voice/voice-feedback");
    
    // Initialize all systems
    await Promise.all([
      visualAwarenessEngine.initialize(),
      anomalyDetector.initialize(),
      voiceCommandCore.initialize(),
      tacticalFallback.initialize(),
      voiceFeedbackReporter.initialize(),
    ]);
    
    console.log("✅ All AI & Voice Command Systems initialized successfully");
    
    return {
      visualAwarenessEngine,
      anomalyDetector,
      voiceCommandCore,
      tacticalFallback,
      voiceFeedbackReporter,
    };
  } catch (error) {
    console.error("❌ Failed to initialize AI & Voice Command Systems:", error);
    throw error;
  }
}
