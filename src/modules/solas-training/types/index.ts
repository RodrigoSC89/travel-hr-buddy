export interface Drill {
  id: string;
  name: string;
  type: "fire" | "abandon" | "mob" | "blackout" | "collision" | "pollution" | "security" | "medical";
  frequency: "weekly" | "monthly" | "quarterly" | "semi-annual" | "annual";
  frequencyLabel: string;
  lastExecution: string | null;
  nextDue: string;
  status: "completed" | "due" | "overdue" | "scheduled";
  participants: string[];
  totalCrew: number;
  duration?: number; // minutes
  notes?: string;
  reportGenerated?: boolean;
  scheduledDate?: string;
  completedAt?: string;
}

export interface DrillExecution {
  id: string;
  drillId: string;
  drillName: string;
  drillType: Drill["type"];
  executedAt: string;
  duration: number;
  participants: CrewMember[];
  observations: string;
  nonConformities: string[];
  score: number;
  signedBy: string;
  reportUrl?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  position: string;
  department: "deck" | "engine" | "catering" | "hotel";
  joinDate: string;
  photoUrl?: string;
  certifications: Certification[];
  drillParticipation: DrillParticipation[];
  trainingStatus: "compliant" | "expiring" | "non-compliant";
}

export interface Certification {
  id: string;
  crewMemberId: string;
  name: string;
  code: string; // e.g., STCW A-VI/1
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  status: "valid" | "expiring" | "expired";
  documentUrl?: string;
  renewalScheduled?: boolean;
}

export interface DrillParticipation {
  drillId: string;
  drillName: string;
  drillType: Drill["type"];
  participatedAt: string;
  performance: "excellent" | "good" | "satisfactory" | "needs-improvement";
}

export interface TrainingAlert {
  id: string;
  type: "drill_overdue" | "cert_expiring" | "cert_expired" | "drill_due" | "training_gap";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  relatedId: string;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface TrainingReport {
  id: string;
  type: "drill_log" | "compliance" | "certification" | "annual_summary";
  title: string;
  generatedAt: string;
  generatedBy: string;
  period: {
    start: string;
    end: string;
  };
  content: string;
  pdfUrl?: string;
}

export interface DrillScheduleItem {
  date: string;
  drills: Drill[];
}

export interface TrainingStats {
  solasCompliance: number;
  completedDrills: number;
  pendingDrills: number;
  overdueDrills: number;
  expiringCerts: number;
  expiredCerts: number;
  totalCrew: number;
  crewCompliant: number;
}
