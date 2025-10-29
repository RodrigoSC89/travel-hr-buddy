/**
 * PATCH 524 - Incident Replay AI Types
 */

export interface TelemetrySnapshot {
  timestamp: string;
  speed: number;
  heading: number;
  temperature: number;
  pressure: number;
  depth: number;
  gps: {
    latitude: number;
    longitude: number;
  };
}

export interface IncidentEvent {
  id: string;
  timestamp: string;
  eventType: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  telemetry: TelemetrySnapshot;
  aiInsight?: string;
}

export interface IncidentReplay {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  events: IncidentEvent[];
  vesselId?: string;
  vesselName?: string;
}

export interface ReplayState {
  currentEventIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  totalDuration: number;
  currentTime: number;
}
