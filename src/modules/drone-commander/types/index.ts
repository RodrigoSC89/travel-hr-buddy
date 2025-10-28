/**
 * PATCH 427 - Drone Commander Types
 */

export interface DronePosition {
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
}

export interface DroneStatus {
  id: string;
  name: string;
  status: "idle" | "flying" | "hovering" | "landing" | "takeoff" | "emergency" | "offline";
  position: DronePosition;
  battery: number;
  signal: number;
  speed: number;
  altitude: number;
  connectedSince: string;
  lastUpdate: string;
  activeFlightId?: string;
  metadata?: Record<string, any>;
}

export interface DroneFlight {
  id: string;
  droneId: string;
  name: string;
  status: "scheduled" | "in-flight" | "completed" | "cancelled";
  scheduledStart: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  waypoints: Waypoint[];
  trajectory?: TrajectoryPoint[];
  metadata?: Record<string, any>;
  createdBy?: string;
  createdAt: string;
}

export interface Waypoint {
  id: string;
  order: number;
  position: DronePosition;
  action?: "hover" | "capture_image" | "scan" | "wait";
  duration?: number;
}

export interface TrajectoryPoint {
  timestamp: string;
  position: DronePosition;
  battery: number;
  signal: number;
}

export interface DroneTask {
  id: string;
  droneId: string;
  flightId?: string;
  type: "patrol" | "survey" | "inspection" | "delivery" | "emergency";
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in-progress" | "completed" | "failed";
  assignedAt: string;
  completedAt?: string;
  result?: any;
  metadata?: Record<string, any>;
}

export interface DroneCommand {
  id: string;
  droneId: string;
  type: "takeoff" | "land" | "goto" | "hover" | "return_home" | "emergency_stop" | "follow_route";
  timestamp: string;
  parameters?: Record<string, any>;
  status: "pending" | "executing" | "completed" | "failed";
}
