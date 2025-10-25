/**
 * PATCH 173.0 - SurfaceBot Autonomy Layer
 * Main export for autonomous surface vehicle control
 */

export { surfaceBotCore } from "./surfaceBotCore";
export { sensorIntegration } from "./sensorIntegration";
export { pathPlanner } from "./pathPlanner";
export { MissionHandler } from "./missionHandler";

export type {
  SurfaceBotPosition,
  NavigationState,
  SurfaceBotStatus,
  NavigationDecision,
  AINavigationParams
} from "./surfaceBotCore";

export type {
  SensorReading,
  SonarReading,
  ProximitySensorReading,
  CollisionSensorReading,
  SensorData
} from "./sensorIntegration";

export type {
  Waypoint,
  SafePath
} from "./pathPlanner";
