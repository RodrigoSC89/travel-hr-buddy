/**
 * Shared Hooks Index
 * Export all consolidated hooks from one place
 */

// AI Hooks
export { 
  useAIChat, 
  useAIMemory, 
  useAIDecisions, 
  useAIInsights,
  useAITelemetry 
} from "./useAI";

// Re-export types
export type { 
  AIMessage, 
  AIResponse, 
  AIMemoryEntry, 
  AIDecision 
} from "./useAI";
