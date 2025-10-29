/**
 * PATCH 471 - Coordination AI v1
 * Multi-agent coordination system with UI
 * Previous: PATCH 175.0 - AI-Driven Surface Coordination Core
 */

export { coordinationAI } from "./coordinationAI";
export { fallbackLayer } from "./fallbackLayer";
export { AIFleetStatus } from "./aiFleetStatus";
export { CoordinationAIPanel } from "./CoordinationAIPanel";

export type { DeviceStatus, TaskAssignment } from "./coordinationAI";
export type { FallbackAction } from "./fallbackLayer";

// Re-export service and types for external use
export { coordinationService } from "./services/coordinationService";
export type { Agent, Task, CoordinationLog, AgentType, AgentStatus, TaskPriority, TaskStatus } from "./services/coordinationService";
