/**
 * AI Meta-Architecture Modules (PATCHES 586-590)
 * 
 * Exports all advanced AI meta-modules for:
 * - Multi-level coordination
 * - Self-reflection
 * - Evolution tracking
 * - Auto-reconfiguration
 * - Self-diagnosis and recovery
 */

// PATCH 586: Multi-Level Coordination Engine
export {
  MultiLevelCoordinationEngine,
  multiLevelEngine,
  type Decision,
  type LevelContext,
  type Objective,
  type ConflictResolution,
  type CoordinationLog,
  type DecisionLevel,
} from "./coordination/multi-level-engine";

// PATCH 587: AI Reflective Core
export {
  ReflectiveCore,
  reflectiveCore,
  type DecisionRecord,
  type ReflectionInsight,
  type StrategyConfidence,
  type ReflectionReport,
} from "./meta/reflective-core";

// PATCH 588: Evolution Tracker
export {
  EvolutionTracker,
  evolutionTracker,
  type AIVersion,
  type PerformanceMetrics,
  type CognitiveProgress,
  type EvolutionTimeline,
  type ComparisonReport,
} from "./meta/evolution-tracker";

// PATCH 589: Auto-Reconfiguration Protocols
export {
  AutoReconfigurationEngine,
  autoReconfigEngine,
  type SystemConfiguration,
  type ReconfigurationTriggerEvent,
  type ReconfigurationAction,
  type PerformanceValidation,
  type ReconfigTrigger,
  type ConfigurationType,
} from "./self-adjustment/auto-reconfig";

// PATCH 590: Self-Diagnosis + Recovery Loop
export {
  SelfDiagnosisLoop,
  selfDiagnosisLoop,
  type AIModule,
  type DiagnosticScan,
  type Anomaly,
  type RecoveryPlan,
  type RecoveryExecution,
  type ModuleStatus,
  type AnomalyType,
  type RecoveryAction,
} from "./self-healing/self-diagnosis-loop";
