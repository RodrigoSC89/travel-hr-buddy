/**
 * AI Module Index - v3.2.0 Final
 * Central export for all AI-powered functionalities
 * 16 Specialized AIs + Voice HD + Analytics
 */

// Smart Assistant
export { smartAssistant, useSmartAssistant } from './smart-assistant';

// Predictive Maintenance System
export {
  predictiveMaintenanceEngine,
  type MaintenanceHistory,
  type EquipmentMetrics,
  type PredictionResult,
  type AnomalyPattern,
} from './predictive-maintenance';

// Anomaly Detection System
export {
  anomalyDetectionEngine,
  startMetricCollection,
  type SystemMetric,
  type AnomalyAlert,
  type OperationalBaseline,
} from './anomaly-detection';

// Operational Efficiency Analysis
export {
  operationalEfficiencyEngine,
  type OperationalMetric,
  type EfficiencyInsight,
  type WorkflowStep,
  type EfficiencyReport,
} from './operational-efficiency';

// Self-Adjusting System
export {
  selfAdjustingSystem,
  type UsageMetrics,
  type PerformanceAdjustment,
  type SystemProfile,
} from './self-adjusting-system';

// Mini Wiki / Knowledge Base
export {
  miniWikiEngine,
  type WikiArticle,
  type FAQEntry,
  type WikiSearchResult,
} from './mini-wiki';

// Diagnostic Assistant
export {
  diagnosticAssistant,
  type DiagnosticStep,
  type DiagnosticFlow,
  type DiagnosticSession,
} from './diagnostic-assistant';

// Compliance Checker (ANTAQ, MARPOL, ESG)
export {
  complianceChecker,
  type ComplianceRule,
  type ComplianceCheckResult,
  type ComplianceReport,
} from './compliance-checker';

// AI Audit Logger
export {
  logAIInteraction,
  searchAuditLogs,
  getAuditStatistics,
  exportAuditLogsCSV,
  type AIAuditEntry,
  type AuditSearchFilters,
} from './audit-logger';

// Predictive Engine
export {
  generateMaintenancePredictions,
  analyzeCrewTrainingGaps,
  analyzeComplianceRisks,
  generateFullPredictiveAnalysis,
  usePredictiveEngine,
  type PredictiveRecommendation,
  type PredictiveAnalysis
} from './predictive-engine';

/**
 * AI Hub Configuration v3.2.0
 * 16 Specialized Maritime AIs
 */
export const AI_MODULES = [
  { id: 'command', name: 'Command Center AI', icon: '🎯' },
  { id: 'peotram', name: 'PEOTRAM AI', icon: '📋' },
  { id: 'peodp', name: 'PEO-DP AI', icon: '🎛️' },
  { id: 'aria', name: 'ARIA Voice', icon: '🎤' },
  { id: 'bunker', name: 'Bunker AI', icon: '⛽' },
  { id: 'safety', name: 'Safety AI', icon: '🛡️' },
  { id: 'compliance', name: 'Compliance AI', icon: '✅' },
  { id: 'fleet', name: 'Fleet AI', icon: '🚢' },
  { id: 'crew', name: 'Crew AI', icon: '👥' },
  { id: 'weather', name: 'Weather AI', icon: '🌤️' },
  { id: 'maintenance', name: 'Maintenance AI', icon: '🔧' },
  { id: 'cargo', name: 'Cargo AI', icon: '📦' },
  { id: 'training', name: 'Training AI', icon: '🎓' },
  { id: 'voyage', name: 'Voyage AI', icon: '🗺️' },
  { id: 'charter', name: 'Charter AI', icon: '📝' },
  { id: 'mlc', name: 'MLC AI', icon: '⚓' },
] as const;

export type AIModuleId = typeof AI_MODULES[number]['id'];
