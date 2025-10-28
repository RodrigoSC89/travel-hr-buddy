/**
 * PATCH 426-430 - Mission Engine Types
 * Consolidated types for mission management, logs, and control
 */

export interface Mission {
  id: string;
  code: string;
  name: string;
  type: "emergency" | "routine" | "training" | "tactical" | "recon";
  status: "planned" | "in-progress" | "completed" | "cancelled" | "paused";
  priority: "low" | "medium" | "high" | "critical";
  description?: string;
  location?: {
    lat: number;
    lng: number;
    name?: string;
  };
  assignedVesselId?: string;
  assignedAgents?: string[];
  startTime: string;
  endTime?: string;
  metadata?: Record<string, any>;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MissionLog {
  id: string;
  missionId?: string;
  logType: "info" | "warning" | "error" | "critical" | "success";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  category: string;
  sourceModule: string;
  eventTimestamp: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface MissionExecution {
  id: string;
  missionId: string;
  phase: "planning" | "deployment" | "execution" | "review" | "complete";
  steps: ExecutionStep[];
  currentStepIndex: number;
  startedAt?: string;
  completedAt?: string;
  simulationMode: boolean;
}

export interface ExecutionStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "failed" | "skipped";
  assignedAgent?: string;
  duration?: number;
  startedAt?: string;
  completedAt?: string;
  output?: any;
}

export interface ModuleStatus {
  id: string;
  name: string;
  status: "operational" | "warning" | "critical" | "offline";
  health: number;
  lastUpdate: string;
  alerts: number;
}

export interface AgentSwarm {
  id: string;
  name: string;
  type: string;
  status: "idle" | "active" | "busy" | "error";
  capabilities: string[];
  currentMission?: string;
}

export interface MissionAlert {
  id: string;
  missionId?: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  createdAt: string;
}
