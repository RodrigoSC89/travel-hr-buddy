/**
 * Consolidated AI Engines Export
 * Central export for all advanced AI engines
 * v4.2.0 - 20 AI Engines Complete
 */

// Predictive Maintenance (ONNX)
export {
  predictiveMaintenanceONNX,
  type EquipmentTelemetry,
  type FailurePrediction,
  type MaintenanceSchedule
} from './predictive-maintenance-onnx';

// Route Optimization
export {
  routeOptimizationEngine,
  type VesselPosition,
  type WeatherCondition,
  type OceanCurrent,
  type BunkerPrice,
  type RouteWaypoint,
  type OptimizedRoute,
  type BunkerRecommendation,
  type SpeedAdjustment
} from './route-optimization';

// Crew Turnover Prediction
export {
  turnoverPredictionEngine,
  type CrewMemberProfile,
  type TurnoverPrediction,
  type RiskFactor,
  type RetentionAction,
  type TeamTurnoverAnalysis
} from './turnover-prediction';

// Compliance Audit
export {
  complianceAuditEngine,
  type ComplianceFramework,
  type ComplianceRule,
  type ComplianceCheck,
  type ComplianceFinding,
  type VesselComplianceStatus,
  type CertificationStatus,
  type AuditResult
} from './compliance-audit';

// Fraud Detection
export {
  fraudDetectionEngine,
  type Transaction,
  type FraudAlert,
  type FraudAlertType,
  type FraudIndicator,
  type VendorRiskProfile,
  type FraudAnalytics
} from './fraud-detection';

// Multi-Agent Orchestrator
export {
  multiAgentOrchestrator,
  type AgentRole,
  type Agent,
  type Decision,
  type DecisionType,
  type DecisionOption,
  type ConsensusResult,
  type DecisionOutcome,
  type AuditEntry,
  type Situation
} from './multi-agent-orchestrator';

// Wellbeing NLP Analysis
export {
  wellbeingNLPEngine,
  type CommunicationEntry,
  type WellbeingAnalysis,
  type StressIndicator,
  type EmotionalState,
  type WellbeingRecommendation,
  type WellbeingAlert,
  type TeamWellbeingReport
} from './wellbeing-nlp';

// Cost Forecasting
export {
  costForecastingEngine,
  type HistoricalCost,
  type CostCategory,
  type CostForecast,
  type CostRisk,
  type SavingsOpportunity,
  type BunkerOptimization
} from './cost-forecasting';

// IoT Anomaly Detection
export {
  anomalyDetectionIoT,
  type SensorReading,
  type SensorType,
  type AnomalyDetection,
  type AnomalyType,
  type CorrectiveAction,
  type SensorBaseline,
  type IoTHealthStatus
} from './anomaly-detection-iot';
