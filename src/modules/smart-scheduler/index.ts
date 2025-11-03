/**
 * PATCH 597 - Smart Scheduler & Task Generator
 * AI-powered intelligent task scheduling and generation system
 */

export { SmartSchedulerEngine } from "./services/SmartSchedulerEngine";
export { useScheduler } from "./hooks/useScheduler";
export { SmartSchedulerDashboard } from "./components/SmartSchedulerDashboard";
export { CalendarView } from "./components/CalendarView";
export { AIGeneratedTaskPanel } from "./components/AIGeneratedTaskPanel";
export type { 
  ScheduledTask, 
  TaskPriority, 
  TaskStatus,
  SchedulerConfig 
} from "./types";
