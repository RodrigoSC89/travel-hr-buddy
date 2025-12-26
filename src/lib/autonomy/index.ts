/**
 * Autonomy Module Index - PATCH 851
 * Central export for autonomous systems
 */

export { autonomyEngine, type AutonomousAction, type DecisionContext } from './AutonomyEngine';
export { hotfixManager, type Hotfix } from './HotfixManager';
export { patternRecognition, type BehaviorPattern, type FailurePattern } from './PatternRecognition';
export { 
  autonomousAI,
  type AIDecision,
  type AIJustification,
  type DecisionFeedback,
  type LearningMetrics,
  type DecisionType,
  type DecisionStatus,
  type ConfidenceLevel
} from './AutonomousAI';
