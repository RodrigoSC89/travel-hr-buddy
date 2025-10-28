/**
 * CONSOLIDATED Mission Control Services Exports
 * Combines mission-engine, mission-logs, and missions functionality
 */

// Mission Engine
export { missionEngine } from "./index";
export { 
  setupAutoCompleteChecklistMission,
  setupAutoEscalateIncidentMission,
  initializeAutonomousMissions
} from "./examples";

export type {
  Mission,
  MissionStep,
  MissionLog,
  MissionCondition
} from "./index";

// Mission Logs Service
export { missionLogsService } from "./mission-logs-service";
export type { MissionLog as MissionLogEntry } from "./mission-logs-service";

// Joint Tasking
export * from "./jointTasking";

// Mission Logging
export * from "./mission-logging";

