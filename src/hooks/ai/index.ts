/**
 * AI Hooks Module Index
 * Central export for all AI-related hooks
 */

// Generic AI hook for all 16 specialized AIs
export {
  useAI,
  useCommandCenterAI,
  usePeotramAI,
  usePeoDpAI,
  useCrewAI,
  useFleetAI,
  useSafetyAI,
  useComplianceAI,
  useWeatherAI,
  useMaintenanceAI,
  useCargoAI,
  useTrainingAI,
  useVoyageAI,
  useCharterAI,
  useMlcAI,
  useBunkerAI,
  useAriaAI,
  type AIProvider,
  type AIMessage,
  type AIConfig,
  type UseAIReturn,
} from "./useAI";

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
