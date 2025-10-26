/**
 * AI Module Exports
 * 
 * Exporta módulos de inteligência artificial:
 * - nautilus-inference: Inferência local com ONNX
 * - nautilus-core: Análise de logs e relatórios
 * - kernel: AI Context Runner for all modules (PATCH 74.0)
 * - engine: Core AI Engine with OpenAI integration (PATCH 131.0)
 * - contexts: Module context management (PATCH 131.0)
 * - hooks: React hooks for AI integration (PATCH 131.0)
 * - services: AI-powered services (PATCH 133.0, 134.0, 135.0)
 * 
 * @module ai
 * @updated 2025-01-24
 */

export { nautilusInference, type InferenceResult, type AnalysisResult } from "./nautilus-inference";
export * from "./nautilus-core";
export { 
  runAIContext, 
  getAIContextLogs, 
  clearAIContextLogs, 
  getAIContextStats,
  type AIContextRequest,
  type AIContextResponse
} from "./kernel";

// PATCH 131.0 - Core AI Engine with Module Context
export { 
  runOpenAI, 
  generateSystemPrompt,
  type AIEngineRequest,
  type AIEngineResponse 
} from "./engine";

export {
  getModuleContext,
  updateModuleContext,
  addContextHistory,
  clearModuleContext,
  getAllContexts,
  cleanupOldContexts,
  type ModuleContext,
  type ContextHistoryEntry
} from "./contexts/moduleContext";

export { useAIAssistant } from "./hooks/useAIAssistant";

// PATCH 133.0 - AI-based Incident Analyzer
export {
  analyzeIncident,
  storeIncidentAnalysis,
  getIncidentAnalysis,
  type IncidentAnalysis
} from "./services/incidentAnalyzer";

// PATCH 134.0 - Checklist Autocompletion
export {
  autoFillChecklist,
  saveChecklistCompletion,
  type ChecklistItem,
  type ChecklistHistory,
  type AutoFillResult
} from "./services/checklistAutoFill";

// PATCH 135.0 - AI Self-Healing + Logs Analyzer
export {
  analyzeSystemLogs,
  previewAutoFix,
  storeAutoFixHistory,
  type LogAnalysisResult,
  type Anomaly,
  type Recommendation,
  type AutoFixResult
} from "./services/logsAnalyzer";

// PATCH 206.0 - Predictive Engine
export {
  predictiveEngine,
  type ModuleRiskScore,
  type PredictiveMetrics,
  type TrainingData,
  type ForecastEvent,
  type RiskLevel
} from "./predictiveEngine";

// PATCH 207.0 - Tactical AI Core
export {
  tacticalAI,
  type TacticalDecision,
  type TacticalAction,
  type DecisionPriority,
  type DecisionRule,
  type TacticalContext
} from "./tacticalAI";

// PATCH 207.0 - Manual Override System
export {
  manualOverrideSystem,
  type ManualOverride
} from "./manual_override";

// PATCH 208.0 - Adaptive Metrics Engine
export {
  adaptiveMetricsEngine,
  type AdaptiveParameter,
  type MetricHistory,
  type ParameterConfig
} from "./adaptiveMetrics";

// PATCH 209.0 - Evolution AI Connector
export {
  evoAIConnector,
  type TrainingDelta,
  type PerformanceScore,
  type FeedbackInsight,
  type EvolutionReport
} from "./evoAIConnector";
