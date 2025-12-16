/**
 * AI Module Index - PATCH 960
 * Central export for all AI-powered functionalities
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

// AI Audit Logger (PATCH 850)
export {
  logAIInteraction,
  searchAuditLogs,
  getAuditStatistics,
  exportAuditLogsCSV,
  type AIAuditEntry,
  type AuditSearchFilters,
} from './audit-logger';
