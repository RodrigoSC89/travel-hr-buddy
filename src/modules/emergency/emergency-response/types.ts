/**
 * Emergency Response Types - PATCH 69.0
 */

export type EmergencyType = 
  | "sar"           // Search and Rescue
  | "fire"          // Fire Emergency
  | "medical"       // Medical Emergency
  | "abandon_ship"  // Abandon Ship
  | "pollution"     // Pollution Incident
  | "collision"     // Collision
  | "grounding"     // Vessel Grounding
  | "flooding"      // Flooding
  | "piracy"        // Piracy/Security
  | "other";        // Other Emergency

export type EmergencySeverity = "low" | "medium" | "high" | "critical";

export type IncidentStatus = "reported" | "active" | "responding" | "resolved" | "cancelled";

export interface EmergencyIncident {
  id: string;
  type: EmergencyType;
  severity: EmergencySeverity;
  status: IncidentStatus;
  title: string;
  description?: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  reportedBy: string;
  personnelInvolved: number;
  responseTeams?: string[];
  aiRecommendation?: string;
  timeline?: EmergencyTimelineEvent[];
  metadata?: Record<string, unknown>;
}

export interface EmergencyTimelineEvent {
  timestamp: string;
  action: string;
  performedBy: string;
  notes?: string;
}

export interface EvacuationPlan {
  vesselId: string;
  vesselName: string;
  totalPersonnel: number;
  crew: number;
  passengers: number;
  musterStations: MusterStation[];
  lifeboats: number;
  liferafts: number;
  estimatedEvacuationTime: number; // minutes
  lastDrillDate: string;
  lastUpdated: string;
}

export interface MusterStation {
  id: string;
  name: string;
  location: string;
  capacity: number;
  assignedPersonnel: string[];
  lifesavingEquipment: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  organization: string;
  contactType: "phone" | "radio" | "satellite" | "email";
  contactInfo: string;
  priority: number;
  available24h: boolean;
}

export interface SAROperation {
  id: string;
  incidentId: string;
  searchArea: string;
  searchPattern: "expanding_square" | "sector" | "parallel" | "creeping_line";
  assetsDeployed: string[];
  weatherConditions: string;
  visibility: string;
  seaState: number;
  startTime: string;
  estimatedDuration: number;
  coordinatingAuthority: string;
}

export interface EmergencyProtocolResult {
  crewStatus: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  vessel: string;
  incident: string;
  lastCheck: string;
  severity: EmergencySeverity;
  recommendedActions: string[];
}
