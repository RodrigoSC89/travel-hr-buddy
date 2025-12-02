/**
 * PATCH 172.0 - Drone Commander Module
 * Main export for UAV control and coordination
 */

import DroneCommanderPage from "./page";

export { droneCommander } from "./droneCommander";
export { missionUploader } from "./missionUploader";
export { DroneTelemetryStream } from "./droneTelemetryStream";

export type {
  DronePosition,
  DroneWaypoint,
  DroneRoute,
  DroneCommand,
  DroneStatus,
  DroneCommandResult
} from "./droneCommander";

export type {
  MissionMetadata,
  MissionConfig,
  Mission,
  MissionUploadResult,
  MissionValidationResult
} from "./missionUploader";

export { DroneCommanderPage };
export default DroneCommanderPage;
