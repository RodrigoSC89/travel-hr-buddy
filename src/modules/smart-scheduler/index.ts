/**
 * PATCH 603 - Smart Scheduler & Task Generator (Enhanced)
 * AI-powered intelligent task scheduling and generation system with risk-based scheduling
 */

export { SmartSchedulerEngine } from "./services/SmartSchedulerEngine";
export { RiskBasedScheduler } from "./services/RiskBasedScheduler";
export { LLMNextInspectionPredictor } from "./services/LLMNextInspectionPredictor";
export { useScheduler } from "./hooks/useScheduler";
export { useHistoricalFailurePattern } from "./hooks/useHistoricalFailurePattern";
export { SmartSchedulerDashboard } from "./components/SmartSchedulerDashboard";
export { CalendarView } from "./components/CalendarView";
export { AIGeneratedTaskPanel } from "./components/AIGeneratedTaskPanel";
export type { 
  ScheduledTask, 
  TaskPriority, 
  TaskStatus,
  SchedulerConfig,
  TaskRecommendation
} from "./types";
