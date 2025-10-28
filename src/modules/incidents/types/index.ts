/**
 * PATCH 454 - Incident Types
 */

export interface Incident {
  id: string;
  code: string;
  title: string;
  description: string;
  type: "safety" | "environmental" | "operational" | "security" | "other";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "closed";
  reportedBy: string;
  assignedTo?: string;
  reportedAt: string;
  closedAt?: string;
  location: string;
  evidence: IncidentEvidence[];
  metadata: Record<string, any>;
}

export interface IncidentEvidence {
  id: string;
  incidentId: string;
  type: "photo" | "video" | "document" | "audio";
  url: string;
  description: string;
  uploadedAt: string;
}
