/**
 * PATCH 547+ - AI Hooks Index
 * Central export for all AI-related hooks
 */

export { useAIPerformanceLog } from "./useAIPerformanceLog";
export { useAISuggestionsLog } from "./useAISuggestionsLog";
export { useWatchdogAlerts } from "./useWatchdogAlerts";
export { useSystemHealth } from "./useSystemHealth";

// Level 3 Autonomous AI
export { 
  useAILevel3, 
  type AIMemoryEntry, 
  type AIProactiveSuggestion, 
  type AISelfCorrection, 
  type AIExplanation 
} from "./useAILevel3";
