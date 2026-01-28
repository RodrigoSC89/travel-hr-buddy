/**
 * Consolidated AI Engines Export
 * Central export for all advanced AI engines
 * v5.0 - Complete Maritime AI Suite
 */

// === OPERATIONS & FLEET ===

// ONNX Predictive Maintenance (primary)
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
  type VesselSpecs,
  type WeatherData as RouteWeatherData,
  type OptimizedRoute,
  type RouteWaypoint,
  type RouteAlert,
  type BunkerPrice
} from './realtime-route-optimizer';

// IoT Anomaly Detection
export * from './anomaly-detection-iot';

// === HR & CREW ===

// Turnover Prediction
export {
  turnoverPredictionEngine,
  type CrewMemberProfile,
  type TurnoverPrediction,
  type RiskFactor as TurnoverRiskFactor,
  type RetentionAction,
  type TeamTurnoverAnalysis
} from './turnover-prediction';

// Crew Matching
export * from './crew-matching';

// Wellbeing NLP
export * from './wellbeing-nlp';

// Adaptive Training
export * from './adaptive-training';

// === COMPLIANCE & SECURITY ===

// Compliance Audit
export * from './compliance-audit';

// Dynamic Risk Scoring
export * from './risk-scoring';

// Access Anomaly Detection
export * from './access-anomaly';

// NC Prediction
export * from './nc-prediction';

// === FINANCIAL & COSTS ===

// OPEX Forecasting
export * from './opex-forecasting';

// Bunker Optimization
export * from './bunker-optimization';

// Contract Analysis NLP
export * from './contract-analysis';

// Fraud Detection
export * from './fraud-detection';

// Cost Forecasting
export * from './cost-forecasting';

// === ADVANCED AGENTIC AI ===

// Multi-Agent Orchestrator
export * from './multi-agent-orchestrator';

// Self-Healing System
export * from './self-healing-system';

// Blockchain Audit Trail
export * from './blockchain-audit';
