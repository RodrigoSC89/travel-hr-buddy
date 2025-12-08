/**
 * PATCH 548 - AI Services Index
 * Centralized exports for all AI services
 * 
 * NOTE: These services have been UNIFIED into src/services/unified/ai-engines.service.ts
 * This file provides backward compatibility exports.
 */

// Re-export from unified module for backward compatibility
export { 
  DistributedAIService, 
  MissionCoordinationService,
  aiEngineService,
} from "../unified/ai-engines.service";

// Legacy direct exports (deprecated - use unified service)
export { DistributedAIService as DistributedAI } from "../unified/ai-engines.service";
export { MissionCoordinationService as MissionCoordination } from "../unified/ai-engines.service";
