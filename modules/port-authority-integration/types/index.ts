/**
 * Port Authority Integration - Type Definitions
 * PATCH 152.0 - Port Authority API Integration
 */

export interface VesselArrival {
  id: string;
  vesselId: string;
  vesselName: string;
  imoNumber: string;
  portCode: string;
  portName: string;
  eta: string;
  ata?: string; // Actual Time of Arrival
  etd?: string; // Estimated Time of Departure
  atd?: string; // Actual Time of Departure
  status: "scheduled" | "arrived" | "departed" | "delayed";
  createdAt: string;
  updatedAt: string;
}

export interface CrewMember {
  id: string;
  firstName: string;
  lastName: string;
  nationality: string;
  rank: string;
  passportNumber: string;
  seamanBookNumber?: string;
  visaStatus?: string;
  vaccinations: string[];
}

export interface PortSubmission {
  id: string;
  arrivalId: string;
  vesselId: string;
  portCode: string;
  submittedAt: string;
  status: "pending" | "accepted" | "rejected" | "requires_docs";
  crew: CrewMember[];
  documents: PortDocument[];
  missingDocuments: string[];
  notifications: PortNotification[];
}

export interface PortDocument {
  id: string;
  type: string;
  name: string;
  url: string;
  uploadedAt: string;
  verified: boolean;
}

export interface PortNotification {
  id: string;
  type: "missing_document" | "approval" | "rejection" | "status_update";
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface PortAuthorityAPI {
  name: string;
  endpoint: string;
  apiKey?: string;
  type: "ANTAQ" | "Portbase" | "OpenPort" | "Custom";
}

export interface SyncResult {
  success: boolean;
  message: string;
  submissionId?: string;
  errors?: string[];
  timestamp: string;
}
