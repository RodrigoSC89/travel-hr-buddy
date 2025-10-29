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
 * - collective: Collective Intelligence System (PATCH 216-220)
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

// PATCH 217 - Distributed Decision Core
export {
  distributedDecisionCore,
  type DecisionLevel,
  type DecisionStatus,
  type DecisionContext,
  type Decision,
  type SimulationResult,
  type DecisionRule as DistributedDecisionRule
} from "./distributedDecisionCore";

// PATCH 218 - Conscious Core
export {
  consciousCore,
  type ObservationType,
  type Severity,
  type SystemObservation,
  type ModuleHealth,
  type SystemState
} from "./consciousCore";

// PATCH 219 - Collective Loop Engine
export {
  collectiveLoopEngine,
  type FeedbackType,
  type FeedbackCategory,
  type FeedbackEvent,
  type AIMetrics,
  type LearningAdjustment,
  type FeedbackSummary
} from "./feedback/collectiveLoop";

// PATCH 231 - Meta-Strategy Engine
export {
  metaStrategyEngine,
  type Strategy,
  type StrategyContext,
  type StrategySelection
} from "./metaStrategyEngine";

// PATCH 232 - Auto Priority Balancer
export {
  autoPriorityBalancer,
  type Priority,
  type Task,
  type PriorityShift,
  type BalancingContext
} from "./autoPriorityBalancer";

// PATCH 233 - Collective Memory Hub
export {
  collectiveMemoryHub,
  type KnowledgeEntry,
  type SyncStatus,
  type RollbackResult
} from "./collectiveMemoryHub";

// PATCH 234 - Self-Evolution Model
export {
  selfEvolutionModel,
  type Failure,
  type BehaviorAlternative,
  type MutationResult
} from "./selfEvolutionModel";

// PATCH 235 - Multi-Agent Performance Scanner
export {
  multiAgentScanner,
  type AIAgent,
  type AgentMetrics,
  type AgentRanking,
  type FailoverEvent
} from "./multiAgentScanner";

// PATCH 591 - SocioCognitive Interaction Layer
export {
  socioCognitiveLayer,
  type UrgencyLevel,
  type ToneType,
  type OperationalLoad,
  type CommandInput,
  type CommandInterpretation,
  type SocialContext
} from "./interface/sociocognitive-layer";

// PATCH 592 - Empathy Core Engine
export {
  empathyCore,
  type EmotionalState,
  type StressLevel,
  type BiometricSource,
  type BiometricData,
  type EmotionalContext,
  type EmpathyResponse,
  type CognitiveReliefAction
} from "./emotion/empathy-core";

// PATCH 593 - Neuro-Human Interface Adapter
export {
  neuroHumanAdapter,
  type InputType,
  type InteractionState,
  type AdaptiveReaction,
  type UserInput,
  type HumanContext,
  type AdaptiveReactionOutput,
  type HesitationDetection
} from "./interface/neuro-adapter";

// PATCH 594 - Adaptive Joint Decision Engine
export {
  adaptiveJointDecision,
  type DecisionType,
  type DecisionStatus,
  type ConfidenceLevel,
  type DecisionOption,
  type DecisionProposal,
  type OperatorReview,
  type DecisionResult,
  type AIConfidenceAdjustment
} from "./decision/adaptive-joint-decision";

// PATCH 595 - Emotion-Aware Feedback System
export {
  feedbackResponder,
  type EmotionType,
  type InputModality,
  type FeedbackAdjustmentType,
  type EmotionDetection,
  type UserFeedback,
  type FeedbackAdjustment,
  type EmotionAwareResponse,
  type EmotionStats
} from "./emotion/feedback-responder";
