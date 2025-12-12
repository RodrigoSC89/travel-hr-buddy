/**
 * Types for Medical Infirmary Module
 */

export interface CrewMember {
  id: string;
  name: string;
  position: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  lastCheckup: string;
  nextCheckup: string;
  vaccinations: Vaccination[];
  status: "fit" | "restricted" | "unfit";
  photoUrl?: string;
}

export interface Vaccination {
  name: string;
  date: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired";
}

export interface MedicalSupply {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  expiryDate: string;
  batchNumber: string;
  location: string;
  status: "ok" | "low" | "expiring" | "critical";
  lastRestock: string;
}

export interface MedicalRecord {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  date: string;
  time: string;
  type: "consultation" | "emergency" | "routine" | "telemedicine";
  chiefComplaint: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  medications: PrescribedMedication[];
  vitalSigns: VitalSigns;
  notes: string;
  followUp?: string;
  status: "resolved" | "monitoring" | "referred" | "pending";
  aiSuggestions?: string[];
}

export interface PrescribedMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
}

export interface MedicalReport {
  id: string;
  type: "mlc" | "port_state" | "incident" | "monthly" | "inventory";
  title: string;
  generatedAt: string;
  period: string;
  status: "draft" | "completed" | "submitted";
  data: Record<string, any>;
}

export interface AIAnalysis {
  riskLevel: "low" | "medium" | "high";
  recommendations: string[];
  predictedIssues: string[];
  confidence: number;
}
