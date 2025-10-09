export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  type:
    | "boolean"
    | "text"
    | "number"
    | "select"
    | "multiselect"
    | "file"
    | "photo"
    | "signature"
    | "measurement";
  required: boolean;
  category: string;
  order: number;
  value?: any;
  options?: string[];
  unit?: string;
  minValue?: number;
  maxValue?: number;
  validationRules?: ValidationRule[];
  evidence?: Evidence[];
  notes?: string;
  timestamp?: string;
  inspector?: string;
  status: "pending" | "completed" | "failed" | "na" | "review_required";
  aiSuggestion?: string;
  historicalData?: HistoricalDataPoint[];
  dependencies?: string[]; // IDs of items that must be completed first
  qrCode?: string;
  iotSensorId?: string;
  autoValue?: any; // Value from IoT sensor or previous data
}

export interface ValidationRule {
  type: "range" | "regex" | "custom" | "ai_validation";
  value: any;
  message: string;
  severity: "error" | "warning" | "info";
}

export interface Evidence {
  id: string;
  type: "photo" | "video" | "document" | "audio";
  url: string;
  filename: string;
  uploadedAt: string;
  size: number;
  metadata?: any;
  ocrText?: string;
  aiAnalysis?: string;
  verified: boolean;
}

export interface HistoricalDataPoint {
  value: any;
  timestamp: string;
  vessel: string;
  inspector: string;
}

export interface Checklist {
  id: string;
  title: string;
  type: "dp" | "machine_routine" | "nautical_routine" | "safety" | "environmental" | "custom";
  version: string;
  description: string;
  vessel: VesselInfo;
  inspector: InspectorInfo;
  status: "draft" | "in_progress" | "pending_review" | "approved" | "rejected" | "completed";
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  priority: "low" | "medium" | "high" | "critical";
  scheduledFor?: string;
  dueDate?: string;
  estimatedDuration: number; // minutes
  actualDuration?: number;
  complianceScore?: number;
  aiAnalysis?: ChecklistAIAnalysis;
  workflow: WorkflowStep[];
  tags: string[];
  location?: Location;
  weather?: WeatherConditions;
  template: boolean;
  parentChecklistId?: string; // For dependencies
  offlineData?: boolean;
  syncStatus: "synced" | "pending_sync" | "sync_failed";
}

export interface VesselInfo {
  id: string;
  name: string;
  type: string;
  imo: string;
  flag: string;
  classification: string;
  operator: string;
  location?: Location;
}

export interface InspectorInfo {
  id: string;
  name: string;
  license: string;
  company: string;
  email: string;
  phone: string;
  certifications: string[];
}

export interface ChecklistAIAnalysis {
  overallScore: number;
  anomalies: Anomaly[];
  suggestions: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  missingItems: string[];
  inconsistencies: string[];
  comparisonWithHistory: HistoricalComparison;
  predictiveInsights: string[];
}

export interface Anomaly {
  itemId: string;
  type:
    | "missing_value"
    | "unexpected_value"
    | "out_of_range"
    | "pattern_deviation"
    | "evidence_mismatch";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  suggestion: string;
  confidence: number;
}

export interface HistoricalComparison {
  similarChecklists: number;
  averageScore: number;
  trendAnalysis: "improving" | "stable" | "declining";
  deviations: string[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: "creation" | "inspection" | "review" | "approval" | "completion";
  status: "pending" | "in_progress" | "completed" | "skipped";
  assignedTo?: string;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
  requiredRole: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  port?: string;
  anchorage?: string;
}

export interface WeatherConditions {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  seaState: number;
  weather: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  type: "dp" | "machine_routine" | "nautical_routine" | "safety" | "environmental" | "custom";
  version: string;
  description: string;
  items: Omit<
    ChecklistItem,
    "value" | "evidence" | "notes" | "timestamp" | "inspector" | "status"
  >[];
  estimatedDuration: number;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annually" | "custom";
  applicableVesselTypes: string[];
  requiredCertifications: string[];
  dependencies: string[];
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistSchedule {
  id: string;
  templateId: string;
  vesselId: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annually" | "custom";
  nextDueDate: string;
  lastCompleted?: string;
  autoAssign: boolean;
  assignedTo?: string;
  reminderSettings: ReminderSettings;
  active: boolean;
}

export interface ReminderSettings {
  enabled: boolean;
  daysBeforeDue: number[];
  emailNotification: boolean;
  pushNotification: boolean;
  smsNotification: boolean;
}

export interface QRCodeMapping {
  id: string;
  code: string;
  type: "equipment" | "area" | "checklist" | "item";
  targetId: string;
  name: string;
  description: string;
  location: string;
  vesselId: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface IoTSensor {
  id: string;
  name: string;
  type: string;
  unit: string;
  vesselId: string;
  location: string;
  status: "active" | "inactive" | "maintenance" | "error";
  lastReading?: number;
  lastReadingAt?: string;
  calibrationDate: string;
  nextCalibrationDue: string;
  connectedChecklistItems: string[];
  thresholds: {
    min?: number;
    max?: number;
    warning?: number;
    critical?: number;
  };
}

export interface ChecklistReport {
  id: string;
  title: string;
  type:
    | "vessel_summary"
    | "compliance_report"
    | "anomaly_report"
    | "trend_analysis"
    | "comparative_analysis";
  filters: ReportFilters;
  data: any;
  generatedAt: string;
  generatedBy: string;
  format: "pdf" | "excel" | "json";
  status: "generating" | "ready" | "error";
  url?: string;
  expiresAt?: string;
}

export interface ReportFilters {
  vessels?: string[];
  checklistTypes?: string[];
  dateRange: {
    start: string;
    end: string;
  };
  status?: string[];
  inspectors?: string[];
  complianceThreshold?: number;
  includeEvidence?: boolean;
  includeAIAnalysis?: boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  frequency: "immediate" | "hourly" | "daily" | "weekly";
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  defaultView: "grid" | "list" | "kanban";
  autoSave: boolean;
  offlineMode: boolean;
  aiAssistance: boolean;
  qualityControl: "strict" | "moderate" | "flexible";
}
