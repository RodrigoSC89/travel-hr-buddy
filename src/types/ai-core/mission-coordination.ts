/**
 * PATCH 548 - Mission Coordination Types
 * Type definitions for multi-vessel mission coordination
 */

export type MissionType = 
  | 'sar'
  | 'evacuation'
  | 'transport'
  | 'patrol'
  | 'training'
  | 'emergency'
  | 'custom';

export type MissionStatus = 
  | 'planned'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type MissionPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'critical';

export type VesselRole = 
  | 'primary'
  | 'support'
  | 'backup'
  | 'observer';

export interface Mission {
  id: string;
  name: string;
  type: MissionType;
  status: MissionStatus;
  priority: MissionPriority;
  description: string;
  startTime: string;
  endTime?: string;
  vessels: VesselAssignment[];
  objectives: MissionObjective[];
  constraints: MissionConstraint[];
  plan?: CoordinationPlan;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface VesselAssignment {
  vesselId: string;
  vesselName: string;
  role: VesselRole;
  status: 'assigned' | 'en_route' | 'on_scene' | 'completed' | 'unavailable';
  assignedTasks: string[];
  position?: GeoPosition;
  eta?: string;
  metadata: Record<string, unknown>;
}

export interface GeoPosition {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

export interface MissionObjective {
  id: string;
  description: string;
  priority: MissionPriority;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedTo?: string[];
  deadline?: string;
  metrics?: Record<string, number>;
}

export interface MissionConstraint {
  type: 'time' | 'resource' | 'weather' | 'safety' | 'regulation';
  description: string;
  severity: 'advisory' | 'warning' | 'critical';
  impact: string;
  mitigation?: string;
}

export interface CoordinationPlan {
  missionId: string;
  vessels: VesselAssignment[];
  timeline: TimelineEvent[];
  communicationProtocol: string;
  fallbackPlans: FallbackPlan[];
  successCriteria: string[];
  riskAssessment: RiskAssessment;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  type: 'departure' | 'arrival' | 'waypoint' | 'action' | 'checkpoint';
  description: string;
  vesselId?: string;
  location?: GeoPosition;
  dependencies?: string[];
  status: 'pending' | 'completed' | 'missed';
}

export interface FallbackPlan {
  id: string;
  trigger: string;
  description: string;
  actions: string[];
  priority: number;
  automated: boolean;
}

export interface RiskAssessment {
  overall: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  mitigations: string[];
  updatedAt: string;
}

export interface RiskFactor {
  type: 'weather' | 'technical' | 'crew' | 'logistics' | 'external';
  description: string;
  probability: number;
  impact: number;
  riskScore: number;
}

export interface CoordinationUpdate {
  updateType: 'status' | 'position' | 'resource' | 'emergency';
  vesselId: string;
  data: Record<string, unknown>;
  timestamp: string;
  priority: MissionPriority;
}
