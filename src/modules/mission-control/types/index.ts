/**
 * PATCH 452 - Mission Control Types
 * Consolidated types for mission operations
 */

export interface Mission {
  id: string;
  code: string;
  name: string;
  type: "operation" | "maintenance" | "inspection" | "emergency" | "training";
  status: "planned" | "in-progress" | "completed" | "cancelled" | "paused";
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  objectives: string[];
  startDate: string;
  endDate: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  metadata: Record<string, any>;
}

export interface MissionTask {
  id: string;
  missionId: string;
  name: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  metadata: Record<string, any>;
}

export interface MissionLog {
  id: string;
  missionId: string;
  eventType: string;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  timestamp: string;
  metadata: Record<string, any>;
}
