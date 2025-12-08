/**
 * Safety Guardian Module Types
 * Tipos para o sistema de segurança com IA preditiva e generativa
 */

export interface SafetyIncident {
  id: string;
  type: 'incident' | 'near_miss' | 'unsafe_condition' | 'unsafe_act';
  title: string;
  description: string;
  vessel_id?: string;
  vessel_name: string;
  location: string;
  incident_date: string;
  reported_by?: string;
  reporter_name?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'action_pending' | 'resolved' | 'closed';
  root_cause?: string;
  corrective_actions?: CorrectiveAction[];
  ai_analysis?: AIIncidentAnalysis;
  attachments?: string[];
  witnesses?: string[];
  created_at: string;
  updated_at: string;
}

export interface CorrectiveAction {
  id: string;
  description: string;
  responsible: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completion_date?: string;
  evidence?: string[];
}

export interface AIIncidentAnalysis {
  rootCauseAnalysis: string;
  riskAssessment: string;
  recommendations: string[];
  preventiveMeasures: string[];
  regulatoryCompliance: string;
  lessonsLearned: string;
  similarIncidents: string[];
  riskScore: number;
  predictedRecurrence: number;
}

export interface SafetyAlert {
  id: string;
  type: 'prediction' | 'pattern' | 'recommendation' | 'warning' | 'critical';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  module?: string;
  read: boolean;
  created_at: string;
  expires_at?: string;
}

export interface SafetyTraining {
  id: string;
  crew_member_id: string;
  crew_member_name: string;
  training_type: string;
  course_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  completion_date?: string;
  expiry_date?: string;
  score?: number;
  certificate_url?: string;
  ai_recommended: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SafetyMetrics {
  daysWithoutLTI: number;
  totalIncidentsYTD: number;
  nearMissesYTD: number;
  unsafeConditionsYTD: number;
  trir: number;
  trirTarget: number;
  ddsCompliance: number;
  totalDDS: number;
  openInvestigations: number;
  pendingActions: number;
  trainingCompliance: number;
  criticalAlerts: number;
}

export interface DDSRecord {
  id: string;
  date: string;
  topic: string;
  vessel_id: string;
  vessel_name: string;
  conductor: string;
  participants_count: number;
  participants: string[];
  duration_minutes: number;
  notes?: string;
  attachments?: string[];
  created_at: string;
}

export interface SafetySettings {
  ltiGoal: number;
  trirTarget: number;
  ddsRequiredDaily: boolean;
  autoAlertThresholds: {
    certification_expiry_days: number;
    training_overdue_days: number;
    incident_escalation_hours: number;
  };
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  aiSettings: {
    predictiveAnalysisEnabled: boolean;
    autoRecommendationsEnabled: boolean;
    riskAssessmentEnabled: boolean;
  };
}

export interface CrewTrainingDashboard {
  crewMemberId: string;
  crewMemberName: string;
  role: string;
  vessel: string;
  totalTrainings: number;
  completedTrainings: number;
  pendingTrainings: number;
  expiredCertifications: number;
  upcomingExpirations: number;
  overallCompliance: number;
  aiRecommendations: SafetyTraining[];
}

export interface SafetyFilter {
  dateRange?: { start: string; end: string };
  vessels?: string[];
  types?: string[];
  severities?: string[];
  statuses?: string[];
  searchTerm?: string;
}
