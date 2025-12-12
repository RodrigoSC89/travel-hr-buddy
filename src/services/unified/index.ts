/**
 * UNIFIED Services Index
 * Centralized exports for all unified/fused services
 * 
 * Consolidates modules:
 * - Offline Cache Services
 * - OpenAI Client Services
 * - AI Engine Services
 */

// ===== Offline Cache =====
export { 
  indexedDBCache, 
  localStorageCache,
  offlineCacheService,
  offlineCache,
} from "./offline-cache.service";

// ===== OpenAI Client =====
export {
  getOpenAIApiKey,
  isOpenAIConfigured,
  getOpenAIClient,
  chatCompletion,
  chatCompletionJSON,
  simpleCompletion,
  simpleCompletionJSON,
  generateEmbedding,
  generateMockEmbedding,
  testOpenAIConnection,
  generateReportSummary,
  generateDrillScenario,
  generateComplianceExplanation,
  // Types
  type OpenAIConfig,
  type OpenAITestResult,
  type ChatMessage,
} from "./openai-client.service";

// ===== AI Engines =====
export {
  aiEngineService,
  UnifiedAIEngineService,
  DistributedAIService,
  MissionCoordinationService,
  // Types
  type SimpleMission,
  type AIEngineMetrics,
  type AIContextCache,
} from "./ai-engines.service";
