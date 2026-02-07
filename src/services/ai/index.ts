/**
 * AI Services Index
 * Centralized exports for all AI services
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

// M001 - Hierarchical Agent Architecture
export { agentHierarchy, AGENT_HIERARCHY } from "./agent-hierarchy.service";
export type { AgentNode, AgentLevel, EscalationRequest, AgentDecisionPath } from "./agent-hierarchy.service";

// M002 - Agent Memory
export { agentMemory } from "./agent-memory.service";
export type { MemoryEntry, MemoryEvent, MemoryQueryResult } from "./agent-memory.service";

// M003 - Adaptive Weights
export { adaptiveWeights } from "./adaptive-weights.service";
export type { AgentPerformance, ConsensusVote, ConsensusResult } from "./adaptive-weights.service";

// M009 - Swarm Formation
export { swarmFormation } from "./swarm-formation.service";
export type { MissionType, SwarmFormation, SwarmResult } from "./swarm-formation.service";
