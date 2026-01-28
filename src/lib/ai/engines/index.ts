/**
 * Consolidated AI Engines Export
 * Central export for all advanced AI engines
 * v5.0 - Complete Maritime AI Suite
 */

// === OPERATIONS & FLEET ===

// ONNX Predictive Maintenance
export {
  onnxPredictiveMaintenanceEngine,
  type TelemetryReading,
  type FailurePrediction,
  type MaintenanceSchedule
} from './onnx-predictive-maintenance';

// Real-time Route Optimization
export {
  realtimeRouteOptimizer,
  type VesselPosition,
  type WeatherData as RouteWeatherData,
  type OptimizedRoute,
  type RouteWaypoint,
  type RouteAlert,
  type VesselSpecs
} from './realtime-route-optimizer';

// Route Optimization (existing)
export * from './route-optimization';

// IoT Anomaly Detection
export * from './anomaly-detection-iot';

// === HR & CREW ===

// Turnover Prediction
export * from './turnover-prediction';

// Crew Matching
export * from './crew-matching';

// Wellbeing NLP
export * from './wellbeing-nlp';

// Adaptive Training
export {
  adaptiveTrainingEngine,
  type CrewCompetency,
  type CompetencyScore,
  type PersonalizedLearningPath,
  type ModuleRecommendation,
  type TrainingModule
} from './adaptive-training';

// === COMPLIANCE & SECURITY ===

// Compliance Audit
export * from './compliance-audit';

// Dynamic Risk Scoring
export {
  dynamicRiskScoringEngine,
  type RiskInput,
  type RiskScore,
  type CategoryScore,
  type RiskRecommendation,
  type ProtocolAdjustment
} from './risk-scoring';

// Access Anomaly Detection
export {
  accessAnomalyEngine,
  type AccessEvent,
  type AccessAnomaly,
  type AnomalyType,
  type UserBehaviorProfile,
  type AccessSecurityReport
} from './access-anomaly';

// NC Prediction
export {
  ncPredictionEngine,
  type InspectionHistory,
  type InspectionFinding,
  type VesselProfile,
  type NCPrediction,
  type RiskArea,
  type PreparationAction
} from './nc-prediction';

// === FINANCIAL & COSTS ===

// OPEX Forecasting
export {
  opexForecastingEngine,
  type HistoricalExpense,
  type ForecastResult,
  type CategoryForecast,
  type OPEXForecast,
  type BudgetRecommendation
} from './opex-forecasting';

// Bunker Optimization
export {
  bunkerOptimizationEngine,
  type BunkerPort,
  type VesselFuelRequirement,
  type BunkerRecommendation,
  type BunkerPlan,
  type MarketAnalysis
} from './bunker-optimization';

// Contract Analysis NLP
export {
  contractAnalysisEngine,
  type ContractDocument,
  type ContractAnalysis,
  type RiskClause,
  type NegotiationOpportunity,
  type ContractRecommendation
} from './contract-analysis';

// Fraud Detection
export * from './fraud-detection';

// Cost Forecasting
export * from './cost-forecasting';

// === ADVANCED AGENTIC AI ===

// Multi-Agent Orchestrator
export * from './multi-agent-orchestrator';

// Self-Healing System
export {
  selfHealingSystemEngine,
  type SystemComponent,
  type ComponentMetrics,
  type HealthIssue,
  type HealingAttempt,
  type SystemHealth,
  type HealingRule,
  type HealingReport
} from './self-healing-system';

// Blockchain Audit Trail
export {
  blockchainAuditEngine,
  type AuditBlock,
  type AuditData,
  type ChainValidation,
  type AuditReport,
  type AuditQuery
} from './blockchain-audit';

// === LEGACY EXPORTS ===
export * from './predictive-maintenance-onnx';
