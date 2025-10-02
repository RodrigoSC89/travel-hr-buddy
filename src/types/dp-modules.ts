// ============================================================================
// NAUTILUS ONE - DP MODULES TYPE DEFINITIONS
// Advanced Maritime Dynamic Positioning System Types
// ============================================================================

// ============================================================================
// MODULE 3: DP DOCUMENTATION MANAGEMENT
// ============================================================================

export type DocumentType = 
  | 'ASOG' | 'BIAS' | 'FMEA' | 'DP_ANNUAL_TRIAL'
  | 'CAPABILITY_PLOT' | 'CAMO' | 'TAM' | 'DPOM'
  | 'WCPS' | 'OPERATIONS_MANUAL';

export interface OCREngine {
  tesseract: boolean;
  awsTextract: boolean;
  googleVision: boolean;
  customML: boolean;
}

export interface FormData {
  [key: string]: string | number | boolean | Date;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
  score: number;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface Suggestion {
  field: string;
  currentValue: string;
  suggestedValue: string;
  confidence: number;
  reason: string;
}

export interface SmartFormFiller {
  recognizeDocumentType: (image: File) => Promise<DocumentType>;
  extractStructuredData: (documentType: DocumentType) => Promise<FormData>;
  validateAgainstIMCAStandards: (data: FormData) => Promise<ValidationResult>;
  suggestCorrections: (errors: ValidationError[]) => Promise<Suggestion[]>;
}

// Checklist Versioning
export interface IMCAStandard {
  code: string; // M190, M109, M182, M117
  version: string;
  effectiveDate: Date;
  requirements: string[];
}

export interface PEORequirements {
  standard: string; // PEOTRAM, PEO-DP
  year: number;
  version: string;
  requirements: string[];
}

export interface ChangeLog {
  id: string;
  date: Date;
  author: string;
  description: string;
  affectedSections: string[];
  impactLevel: 'minor' | 'major' | 'critical';
}

export interface ApprovalStatus {
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  comments?: string;
}

export interface ChecklistVersion {
  id: string;
  year: number;
  version: string;
  imcaStandard: IMCAStandard;
  petrobrasRequirements: PEORequirements;
  changes: ChangeLog[];
  approvalStatus: ApprovalStatus;
}

// Audit Management
export type AuditType = 'internal' | 'external' | 'certification' | 'spot_check';

export interface AuditSchedule {
  id: string;
  type: AuditType;
  scheduledDate: Date;
  auditors: string[];
  scope: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface AuditItem {
  id: string;
  reference: string;
  requirement: string;
  checkPoints: string[];
  evidenceRequired: string[];
}

export interface Evidence {
  id: string;
  type: 'document' | 'photo' | 'video' | 'log' | 'testimony';
  url: string;
  description: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface AuditResult {
  id: string;
  auditItemId: string;
  status: 'compliant' | 'non_compliant' | 'observation' | 'not_applicable';
  findings: string;
  evidence: Evidence[];
  recommendations: string[];
  severity?: 'critical' | 'major' | 'minor';
}

export interface AuditReport {
  id: string;
  auditId: string;
  generatedAt: Date;
  summary: string;
  overallScore: number;
  compliantItems: number;
  nonCompliantItems: number;
  observations: number;
  results: AuditResult[];
  recommendations: string[];
  actionPlan?: string;
}

// ============================================================================
// MODULE 4: DIGITAL TRAINING CENTER (DP COMPETENCE HUB)
// ============================================================================

export interface DPOperator {
  id: string;
  name: string;
  email: string;
  certificateNumber: string;
  dpClass: 'Unlimited' | 'Limited' | 'Trainee';
  experienceYears: number;
  vesselTypes: string[];
  currentVessel?: string;
}

export interface CPDRecord {
  id: string;
  operatorId: string;
  date: Date;
  hours: number;
  activity: string;
  category: 'simulation' | 'course' | 'on_the_job' | 'seminar' | 'other';
  evidence?: string;
  approvedBy?: string;
}

export interface TrainingCourse {
  id: string;
  title: string;
  provider: string;
  duration: number; // hours
  type: 'initial' | 'refresher' | 'advanced' | 'specialized';
  imcaApproved: boolean;
  syllabus: string[];
}

export interface CourseRecord {
  id: string;
  courseId: string;
  operatorId: string;
  startDate: Date;
  completionDate?: Date;
  score?: number;
  certificate?: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'failed';
}

export interface SimulationSession {
  id: string;
  operatorId: string;
  date: Date;
  duration: number;
  scenario: string;
  vesselType: string;
  conditions: EnvironmentalConditions;
  performanceScore: number;
  faultsHandled: SystemFault[];
  instructor?: string;
  notes?: string;
}

export interface SimulationRecord {
  id: string;
  sessionId: string;
  metrics: {
    responseTime: number;
    decisionAccuracy: number;
    communicationScore: number;
    safetyCompliance: number;
  };
  strengths: string[];
  areasForImprovement: string[];
}

export interface CPDReport {
  operatorId: string;
  period: DateRange;
  totalHours: number;
  breakdown: {
    simulation: number;
    courses: number;
    onTheJob: number;
    other: number;
  };
  compliance: boolean;
  requiredHours: number;
  gap?: number;
}

// Simulation Engine
export interface SystemFault {
  id: string;
  type: 'thruster' | 'generator' | 'sensor' | 'control' | 'power' | 'communication';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  symptoms: string[];
  correctActions: string[];
}

export interface VesselConfig {
  id: string;
  name: string;
  dpClass: 1 | 2 | 3;
  thrusters: number;
  generators: number;
  redundancy: string;
}

export interface EnvironmentalConditions {
  windSpeed: number; // knots
  windDirection: number; // degrees
  currentSpeed: number; // knots
  currentDirection: number; // degrees
  waveHeight: number; // meters
  visibility: number; // nautical miles
}

export interface SimulationResult {
  success: boolean;
  timeToResolve: number; // seconds
  actionsToken: string[];
  correctActions: number;
  incorrectActions: number;
  score: number;
  feedback: string[];
}

// Assessment System
export interface DPScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'basic' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // minutes
  objectives: string[];
  passingScore: number;
}

export interface Assessment {
  id: string;
  scenarioId: string;
  questions: AssessmentQuestion[];
  totalPoints: number;
  timeLimit?: number;
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'scenario_based' | 'practical';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation: string;
}

export interface OperatorResponse {
  questionId: string;
  answer: string | string[];
  timeSpent: number;
  confidence?: number;
}

export interface CompletedAssessment {
  id: string;
  assessmentId: string;
  operatorId: string;
  startedAt: Date;
  completedAt: Date;
  responses: OperatorResponse[];
  score: number;
  passed: boolean;
}

export interface Score {
  total: number;
  correct: number;
  incorrect: number;
  percentage: number;
}

export interface Feedback {
  overall: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextSteps: string[];
}

export interface ProgressReport {
  operatorId: string;
  period: DateRange;
  assessmentsCompleted: number;
  averageScore: number;
  improvement: number; // percentage
  areasOfExpertise: string[];
  developmentAreas: string[];
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  achievedAt: Date;
  description: string;
}

// Certificate Management
export interface STCWCert {
  id: string;
  type: string;
  number: string;
  issueDate: Date;
  expiryDate: Date;
  issuingAuthority: string;
}

export interface IMCACert {
  id: string;
  scheme: string; // DP Induction, DP Simulator, etc.
  number: string;
  issueDate: Date;
  expiryDate?: Date;
  provider: string;
}

export interface Certificate {
  id: string;
  operatorId: string;
  type: 'STCW' | 'IMCA' | 'Company' | 'Other';
  name: string;
  number: string;
  issueDate: Date;
  expiryDate?: Date;
  status: 'valid' | 'expiring_soon' | 'expired' | 'suspended';
  documentUrl?: string;
}

export interface CertificateStatus {
  certificate: Certificate;
  daysUntilExpiry?: number;
  requiresRenewal: boolean;
  renewalProcess?: string[];
}

export interface Alert {
  id: string;
  type: 'expiration' | 'renewal' | 'compliance' | 'training';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  dueDate?: Date;
  actionRequired: boolean;
  relatedItemId?: string;
}

export interface RenewalPlan {
  certificateId: string;
  expiryDate: Date;
  renewalDeadline: Date;
  steps: RenewalStep[];
  estimatedCost?: number;
  estimatedDuration?: number; // days
}

export interface RenewalStep {
  order: number;
  description: string;
  responsible: string;
  deadline: Date;
  status: 'pending' | 'in_progress' | 'completed';
  dependencies?: string[];
}

// Mentoring System
export interface SeniorDPO extends DPOperator {
  mentoringExperience: number; // years
  specializations: string[];
  availability: 'available' | 'limited' | 'unavailable';
  maxMentees: number;
  currentMentees: number;
}

export interface JuniorDPO extends DPOperator {
  needsMentor: boolean;
  developmentAreas: string[];
  careerGoals: string[];
}

export interface MatchResult {
  mentorId: string;
  menteeId: string;
  compatibilityScore: number;
  matchReason: string[];
  suggestedFocus: string[];
}

export interface MentoringSession {
  id: string;
  mentorshipId: string;
  date: Date;
  duration: number; // minutes
  topic: string;
  objectives: string[];
  outcomes: string[];
  nextSteps: string[];
  mentorNotes?: string;
  menteeNotes?: string;
}

export interface SessionRecord {
  id: string;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentoringEvaluation {
  id: string;
  mentorshipId: string;
  evaluatedBy: 'mentor' | 'mentee' | 'coordinator';
  date: Date;
  ratings: {
    communication: number;
    knowledge: number;
    effectiveness: number;
    professionalism: number;
  };
  comments: string;
  recommendations: string[];
}

export interface EvaluationResult {
  averageRating: number;
  strengths: string[];
  areasForImprovement: string[];
  continueMentorship: boolean;
}

export interface Mentorship {
  id: string;
  mentorId: string;
  menteeId: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'paused' | 'terminated';
  sessions: MentoringSession[];
  evaluations: MentoringEvaluation[];
}

export interface MentoringReport {
  mentorshipId: string;
  period: DateRange;
  totalSessions: number;
  averageSessionDuration: number;
  topicsDiscussed: string[];
  progressMade: string[];
  challenges: string[];
  overallEffectiveness: number;
  recommendations: string[];
}

// Knowledge Transfer
export interface OperationalExperience {
  id: string;
  operatorId: string;
  date: Date;
  vesselId: string;
  operation: string;
  conditions: EnvironmentalConditions;
  challenges: string[];
  solutions: string[];
  lessonsLearned: string[];
  tags: string[];
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: Date;
  views: number;
  helpful: number;
  attachments?: string[];
}

export interface LessonLearned {
  id: string;
  title: string;
  description: string;
  context: string;
  solution: string;
  outcome: string;
  applicability: string[];
  relatedEvents?: string[];
}

export interface SharedKnowledge {
  knowledgeItemId: string;
  sharedAt: Date;
  sharedBy: string;
  visibility: 'public' | 'company' | 'team' | 'private';
}

export interface KnowledgeResult {
  items: KnowledgeItem[];
  totalResults: number;
  relevanceScores: number[];
}

export interface LearningRecommendation {
  knowledgeItemId: string;
  relevance: number;
  reason: string;
  estimatedTime: number; // minutes
}

// ============================================================================
// MODULE 5: DP KNOWLEDGE CENTER (LESSONS LEARNED)
// ============================================================================

export interface IMCAEvent {
  id: string;
  reference: string;
  date: Date;
  vessel: string;
  summary: string;
  category: string;
  lessons: string[];
}

export interface InternalEvent {
  id: string;
  company: string;
  vessel: string;
  date: Date;
  description: string;
  classification: string;
  rootCause?: string;
  correctiveActions: string[];
}

export interface ClassifiedEvent {
  eventId: string;
  classification: EventClassification;
  severity: SeverityLevel;
  tags: string[];
}

export interface EventAnalytics {
  totalEvents: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  trends: EventTrend[];
}

export interface EventTrend {
  period: string;
  count: number;
  category: string;
}

export interface DPEvent {
  id: string;
  date: Date;
  vesselId: string;
  vesselName: string;
  operatorId: string;
  operation: string;
  conditions: EnvironmentalConditions;
  incident?: Incident;
  classification?: EventClassification;
  rootCause?: RootCauseAnalysis;
}

export interface Incident {
  type: 'drive_off' | 'drift_off' | 'loss_of_position' | 'system_failure' | 'near_miss' | 'other';
  severity: SeverityLevel;
  description: string;
  consequencesDescription?: string[];
  injuries: boolean;
  damage: boolean;
  environmentalImpact: boolean;
}

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface EventClassification {
  primary: FailureType;
  secondary?: FailureType[];
  systemsAffected: string[];
  humanFactors: boolean;
}

export type FailureType = 
  | 'human_error' | 'electrical_failure' | 'mechanical_failure'
  | 'sensor_failure' | 'software_issue' | 'environmental'
  | 'procedural' | 'communication' | 'design_limitation';

export interface FailureClassification {
  type: FailureType;
  subType: string;
  confidence: number;
  reasoning: string[];
}

export interface RootCauseAnalysis {
  primaryCause: string;
  contributingFactors: string[];
  methodology: '5_whys' | 'fishbone' | 'fault_tree' | 'barrier_analysis';
  analysis: string;
  preventiveMeasures: string[];
}

export interface SystemCategory {
  system: string;
  subsystem?: string;
  component?: string;
}

// ML Event Analysis
export interface Pattern {
  id: string;
  type: string;
  description: string;
  frequency: number;
  significance: number;
  relatedEvents: string[];
  recommendations: string[];
}

export interface OperationalConditions {
  weather: EnvironmentalConditions;
  operation: string;
  vesselType: string;
  dpClass: number;
  duration: number;
}

export interface ProbabilityScore {
  probability: number; // 0-1
  confidence: number; // 0-1
  factors: Factor[];
  mitigationMeasures: string[];
}

export interface Factor {
  name: string;
  impact: number; // -1 to 1
  description: string;
}

export interface EventCluster {
  id: string;
  name: string;
  events: DPEvent[];
  commonCharacteristics: string[];
  recommendations: string[];
}

export interface EventData {
  events: DPEvent[];
  period: DateRange;
  vessels: string[];
}

export interface Insight {
  id: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'prediction';
  description: string;
  confidence: number;
  actionable: boolean;
  recommendations: string[];
}

// AI Classification
export interface HumanErrorClassification {
  errorType: 'skill_based' | 'rule_based' | 'knowledge_based';
  contributingFactors: string[];
  trainingRecommendations: string[];
}

export interface ElectricalFailure {
  component: string;
  failureMode: string;
  systemAffected: string;
}

export interface ElectricalClassification {
  rootCause: string;
  affectedSystems: string[];
  redundancyImpact: string;
  maintenanceRecommendations: string[];
}

export interface SensorFailure {
  sensorType: string;
  failureMode: string;
  impact: string;
}

export interface SensorClassification {
  sensorSystem: string;
  failurePattern: string;
  replacementUrgency: 'immediate' | 'scheduled' | 'monitor';
  calibrationNeeded: boolean;
}

export interface SoftwareEvent {
  systemName: string;
  version: string;
  errorCode?: string;
  description: string;
}

export interface SoftwareClassification {
  category: 'bug' | 'configuration' | 'compatibility' | 'performance';
  severity: SeverityLevel;
  patchAvailable: boolean;
  workaround?: string;
}

// Pattern Recognition
export interface FailureChain {
  id: string;
  initialFailure: SystemFailure;
  subsequentFailures: SystemFailure[];
  timeToEscalation: number; // minutes
  preventionPoints: string[];
}

export interface SystemFailure {
  system: string;
  timestamp: Date;
  description: string;
  severity: SeverityLevel;
}

export interface OperationalData {
  timestamp: Date;
  values: Record<string, number>;
  normal: boolean;
}

export interface Anomaly {
  id: string;
  timestamp: Date;
  parameter: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  significance: number;
}

export interface CascadePrediction {
  probability: number;
  potentialFailures: SystemFailure[];
  timeframe: number; // minutes
  preventiveMeasures: string[];
  confidence: number;
}

export interface PreventiveMeasure {
  id: string;
  description: string;
  applicability: string[];
  effectiveness: number;
  implementationCost: 'low' | 'medium' | 'high';
  implementationTime: number; // days
}

// Intelligent Mitigation
export interface DPOMRecommendation {
  section: string;
  currentText?: string;
  suggestedAddition: string;
  priority: 'high' | 'medium' | 'low';
  justification: string;
}

export interface EventAnalysis {
  eventId: string;
  summary: string;
  findings: string[];
  recommendations: string[];
}

export interface ASAOGUpdate {
  operation: string;
  parameter: string;
  currentLimit?: number;
  suggestedLimit: number;
  justification: string;
  safety: boolean;
}

export interface MaintenanceEvent {
  equipmentId: string;
  date: Date;
  type: 'preventive' | 'corrective' | 'breakdown';
  description: string;
  downtime: number;
}

export interface CAMORecommendation {
  equipmentId: string;
  currentInterval?: number;
  suggestedInterval: number;
  additionalChecks: string[];
  priority: number;
}

export interface FailureData {
  failures: SystemFailure[];
  period: DateRange;
  systems: string[];
}

export interface FMEAUpdate {
  component: string;
  failureMode: string;
  currentRPN?: number;
  suggestedRPN: number;
  newControls: string[];
}

// Cross-Reference
export interface Recommendation {
  id: string;
  type: string;
  description: string;
  priority: number;
}

export interface IMCAReference {
  guideline: string;
  section: string;
  relevance: string;
  url?: string;
}

export interface ComplianceIssue {
  id: string;
  regulation: string;
  description: string;
  severity: SeverityLevel;
}

export interface RegulatoryReference {
  regulation: string;
  section: string;
  requirement: string;
  applicability: string;
}

export interface TrainingReference {
  course: string;
  module: string;
  relevance: string;
  duration?: number;
}

export interface Analysis {
  id: string;
  type: string;
  findings: string[];
  recommendations: string[];
}

export interface DocumentUpdate {
  documentType: DocumentType;
  section: string;
  suggestedChange: string;
  priority: number;
}

// ============================================================================
// MODULE 6: SMART DP LOGBOOK
// ============================================================================

export interface DPModeChange {
  timestamp: Date;
  fromMode: DPMode;
  toMode: DPMode;
  reason: string;
  operatorId: string;
  conditions: EnvironmentalConditions;
  validated: boolean;
}

export type DPMode = 'manual' | 'dp_auto' | 'dp_manual' | 'standby' | 'offline';

export interface WatchHandover {
  timestamp: Date;
  offgoingOfficer: string;
  oncomingOfficer: string;
  vesselStatus: VesselStatus;
  operations: OperationStatus[];
  concerns: string[];
  actionItems: string[];
  signature: string;
}

export interface VesselStatus {
  position: GeoPosition;
  heading: number;
  dpMode: DPMode;
  thrustersOnline: number;
  generatorsOnline: number;
  alarms: Alarm[];
}

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface OperationStatus {
  operation: string;
  status: 'planned' | 'ongoing' | 'completed' | 'suspended';
  progress: number;
  nextAction?: string;
}

export interface Alarm {
  id: string;
  timestamp: Date;
  system: string;
  severity: 'advisory' | 'caution' | 'warning' | 'alarm';
  description: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface DPIncident {
  timestamp: Date;
  type: Incident['type'];
  description: string;
  circumstances: string;
  immediateActions: string[];
  personsInvolved: string[];
  reportedTo: string[];
  investigationRequired: boolean;
}

export interface OperationalHours {
  date: Date;
  watch: string; // "00-04", "04-08", etc.
  dpMode: DPMode;
  operation: string;
  hours: number;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'mode_change' | 'handover' | 'incident' | 'operation' | 'system_event' | 'environmental';
  operatorId: string;
  content: string;
  data?: any;
  signed: boolean;
  signature?: string;
}

export interface HandoverEntry extends LogEntry {
  type: 'handover';
  data: WatchHandover;
}

export interface IncidentEntry extends LogEntry {
  type: 'incident';
  data: DPIncident;
}

export interface HoursEntry extends LogEntry {
  type: 'operation';
  data: OperationalHours;
}

export interface SignedEntry extends LogEntry {
  signed: true;
  signature: string;
  signedAt: Date;
}

// IMCA M117 Compliance
export interface FrequencyCheck {
  requiredFrequency: string;
  actualFrequency: number;
  compliant: boolean;
  gaps: DateRange[];
}

export interface SignatureVerification {
  totalEntries: number;
  signedEntries: number;
  unsignedEntries: number;
  complianceRate: number;
  missingSignatures: string[];
}

export interface ComplianceReport {
  period: DateRange;
  overallCompliance: number;
  requiredEntriesPresent: boolean;
  frequencyCompliance: FrequencyCheck[];
  signatureCompliance: SignatureVerification;
  issues: string[];
  recommendations: string[];
}

// Automated Logging
export interface TelemetryData {
  timestamp: Date;
  dpMode: DPMode;
  position: GeoPosition;
  heading: number;
  systemStatus: Record<string, any>;
}

export interface ModeChange {
  timestamp: Date;
  fromMode: DPMode;
  toMode: DPMode;
  automatic: boolean;
}

export interface ShiftData {
  startTime: Date;
  endTime: Date;
  officerId: string;
  activities: string[];
}

export interface WatchEntry {
  timestamp: Date;
  watch: string;
  officer: string;
  autoGenerated: boolean;
}

export interface AlarmData {
  timestamp: Date;
  alarms: Alarm[];
}

export interface AlarmEntry extends LogEntry {
  type: 'system_event';
  data: AlarmData;
}

export interface WeatherData {
  timestamp: Date;
  conditions: EnvironmentalConditions;
  forecast?: WeatherForecast;
}

export interface WeatherForecast {
  validFrom: Date;
  validTo: Date;
  conditions: EnvironmentalConditions[];
  warnings: string[];
}

export interface EnvironmentalEntry extends LogEntry {
  type: 'environmental';
  data: WeatherData;
}

// Log Analytics
export interface ShiftAnalysis {
  shift: string;
  vessel: string;
  totalOperations: number;
  incidentCount: number;
  modeChanges: number;
  averageWindSpeed: number;
  complianceScore: number;
  issues: string[];
}

export interface VesselEventSummary {
  vesselId: string;
  period: DateRange;
  totalEvents: number;
  byType: Record<string, number>;
  trends: string[];
}

export interface TrendReport {
  period: DateRange;
  metrics: TrendMetric[];
  insights: string[];
  predictions: string[];
}

export interface TrendMetric {
  name: string;
  values: number[];
  timestamps: Date[];
  trend: 'increasing' | 'decreasing' | 'stable';
  significance: number;
}

// Performance Metrics
export interface EfficiencyScore {
  operatorId: string;
  period: DateRange;
  score: number; // 0-100
  components: {
    responseTime: number;
    decisionQuality: number;
    procedureCompliance: number;
    communication: number;
  };
  ranking?: number;
}

export interface IncidentAnalysis {
  vessel: string;
  period: DateRange;
  totalIncidents: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  trend: 'improving' | 'stable' | 'worsening';
  contributingFactors: string[];
}

export interface ComplianceScore {
  overall: number;
  categories: {
    requiredEntries: number;
    frequency: number;
    signatures: number;
    quality: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface BenchmarkReport {
  period: DateRange;
  vessels: VesselBenchmark[];
  fleetAverage: number;
  bestPractices: string[];
  improvementAreas: string[];
}

export interface VesselBenchmark {
  vesselId: string;
  vesselName: string;
  score: number;
  ranking: number;
  strengths: string[];
  weaknesses: string[];
}

// ============================================================================
// MODULE 7: INTELLIGENT OPERATIONAL WINDOW
// ============================================================================

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  name: string;
  coordinates: GeoCoordinates;
  timezone: string;
}

export interface Duration {
  value: number;
  unit: 'hours' | 'days';
}

export interface WeatherAlert {
  id: string;
  type: 'gale' | 'storm' | 'fog' | 'ice' | 'other';
  severity: SeverityLevel;
  validFrom: Date;
  validTo: Date;
  description: string;
  affectedOperations: string[];
}

export interface OperabilityIndex {
  overall: number; // 0-100
  factors: {
    wind: number;
    current: number;
    wave: number;
    visibility: number;
  };
  status: 'excellent' | 'good' | 'marginal' | 'poor' | 'unsafe';
  limitations: string[];
}

export interface Operation {
  id: string;
  type: string;
  vessel: string;
  plannedStart: Date;
  plannedEnd: Date;
  requirements: OperationalRequirements;
}

export interface OperationalRequirements {
  maxWindSpeed: number;
  maxCurrentSpeed: number;
  maxWaveHeight: number;
  minVisibility: number;
  otherConstraints?: string[];
}

// Operational Window
export interface ASAOG {
  id: string;
  vesselId: string;
  version: string;
  approvedDate: Date;
  operations: ASAOGOperation[];
}

export interface ASAOGOperation {
  operation: string;
  limits: OperationalLimits;
  procedures: string[];
  contingencies: string[];
}

export interface OperationalLimits {
  maxWindSpeed: number;
  maxCurrentSpeed: number;
  maxWaveHeight: number;
  maxSignificantWaveHeight?: number;
  minVisibility: number;
  otherLimits?: Record<string, number>;
}

export interface Conditions {
  environmental: EnvironmentalConditions;
  operational: {
    dpMode: DPMode;
    systemsAvailable: string[];
    redundancyStatus: string;
  };
}

export interface SafetyMargin {
  parameter: string;
  currentValue: number;
  limit: number;
  margin: number; // percentage
  status: 'safe' | 'approaching' | 'exceeded';
}

export interface WeatherTrend {
  parameter: string;
  current: number;
  forecast: number[];
  timestamps: Date[];
  trend: 'improving' | 'stable' | 'deteriorating';
}

export interface WindowPrediction {
  willClose: boolean;
  predictedClosureTime?: Date;
  confidence: number;
  reasoningFactors: string[];
  recommendedAction: string;
}

export interface OptimizedSchedule {
  operation: Operation;
  recommendedStart: Date;
  recommendedEnd: Date;
  optimalityScore: number;
  reasoning: string[];
  alternatives?: ScheduleOption[];
}

export interface ScheduleOption {
  start: Date;
  end: Date;
  score: number;
  tradeoffs: string[];
}

// Monitoring
export interface RealTimeData {
  timestamp: Date;
  weather: EnvironmentalConditions;
  vessel: VesselStatus;
  operations: OperationStatus[];
}

export interface Limits {
  operational: OperationalLimits;
  vessel: VesselLimits;
}

export interface VesselLimits {
  maxHeading: number;
  maxPositionError: number;
  minThrusters: number;
  minGenerators: number;
}

export interface MonitoringResult {
  compliant: boolean;
  violations: LimitViolation[];
  warnings: Warning[];
  status: 'normal' | 'caution' | 'warning' | 'critical';
}

export interface LimitViolation {
  parameter: string;
  limit: number;
  actualValue: number;
  exceedance: number;
  timestamp: Date;
  severity: SeverityLevel;
}

export interface Warning {
  id: string;
  type: string;
  message: string;
  severity: SeverityLevel;
  timestamp: Date;
}

export interface VisualAlert {
  id: string;
  type: 'color' | 'icon' | 'flash' | 'text';
  display: string;
  duration?: number;
}

export type AlarmSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlarmType = 'continuous' | 'intermittent' | 'pulse';

export interface AudioAlarm {
  id: string;
  sound: string;
  volume: number;
  duration?: number;
  repeat: boolean;
}

export interface Violation {
  id: string;
  timestamp: Date;
  type: string;
  description: string;
  severity: SeverityLevel;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface ViolationLog {
  violations: Violation[];
  summary: {
    total: number;
    resolved: number;
    unresolved: number;
    bySeverity: Record<string, number>;
  };
}

// Operations Optimization
export interface ROVSpecs {
  type: string;
  maxDepth: number;
  currentRating: number;
  tether: boolean;
}

export interface ROVOptimization {
  launchWindow: DateRange;
  optimalConditions: EnvironmentalConditions;
  riskFactors: string[];
  safetyRecommendations: string[];
}

export interface Constraint {
  type: string;
  description: string;
  impact: 'hard' | 'soft';
}

export interface SIMOPSPlan {
  operations: Operation[];
  sequence: number[];
  bufferTimes: number[];
  riskMitigation: string[];
  expectedDuration: number;
}

export interface HeavyLiftOperation {
  item: string;
  weight: number; // tonnes
  liftHeight: number; // meters
  vessel: string;
  crane: string;
}

export interface Environment {
  weather: EnvironmentalConditions;
  waterDepth: number;
  seaState: number;
}

export interface LiftOptimization {
  recommendedTime: Date;
  maxLiftCapacity: number;
  derating: number; // percentage
  safetyFactors: string[];
  contingencies: string[];
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'extreme';
  riskFactors: RiskFactor[];
  mitigationMeasures: string[];
  residualRisk: string;
  acceptability: boolean;
}

export interface RiskFactor {
  category: string;
  description: string;
  probability: number; // 0-1
  impact: number; // 0-1
  riskLevel: number; // probability * impact
}

// Historical Analysis
export interface HistoricalAnalysis {
  period: DateRange;
  totalViolations: number;
  byType: Record<string, number>;
  byMonth: Record<string, number>;
  trends: string[];
  insights: string[];
}

export interface SeasonalPattern {
  season: string;
  months: string[];
  characteristics: Record<string, number>;
  commonEvents: string[];
  recommendations: string[];
}

export interface OperationalAnalysis {
  operation: string;
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  commonIssues: string[];
  bestPractices: string[];
}

export interface ASAOGRevision {
  operation: string;
  currentLimits: OperationalLimits;
  proposedLimits: OperationalLimits;
  justification: string;
  supportingData: string[];
  priority: number;
}

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface DateRange {
  start: Date;
  end: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface NotificationResult {
  sent: boolean;
  timestamp: Date;
  error?: string;
}

export interface EscalationResult {
  escalated: boolean;
  escalatedTo: string[];
  timestamp: Date;
}

export interface ComplianceStatusReport {
  overall: number;
  categories: Record<string, number>;
  issues: ComplianceIssue[];
  recommendations: string[];
  generatedAt: Date;
}

export interface InductionStatus {
  completed: boolean;
  completionDate?: Date;
  expiryDate?: Date;
  upToDate: boolean;
}

export interface Period {
  start: Date;
  end: Date;
  description?: string;
}

export interface RefresherTraining {
  id: string;
  type: string;
  dueDate: Date;
  completed: boolean;
  completionDate?: Date;
}

export interface TrainingRecord {
  id: string;
  trainingId: string;
  operatorId: string;
  date: Date;
  status: 'completed' | 'in_progress' | 'scheduled';
  certificate?: string;
}

export interface OverdueItem {
  id: string;
  type: string;
  description: string;
  dueDate: Date;
  daysOverdue: number;
  responsible: string;
}

// GainResult for DP controller gain testing
export interface GainResult {
  stable: boolean;
  responseTime: number;
  overshoot: number;
  settlingTime: number;
  recommendations: string[];
}

// ASAOGResult for ASAOG operation practice
export interface ASAOGResult {
  operationCompliant: boolean;
  limitsRespected: boolean;
  proceduresFollowed: number; // percentage
  suggestions: string[];
}

// WCFResult for worst case failure simulation
export interface WCFResult {
  systemsLost: string[];
  positionKept: boolean;
  timeToRecover: number;
  actionsRequired: string[];
  score: number;
}
