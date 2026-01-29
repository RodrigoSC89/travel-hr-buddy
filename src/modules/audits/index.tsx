/**
 * 🛡️ Audits Module - World-Class Audit Intelligence
 * NAUTILUS ONE v5.0
 * 
 * Comprehensive audit management with AI predictions,
 * ML risk analysis, and immersive 3D visualizations
 */

// Components
export { ExecutiveAuditDashboard } from './components/ExecutiveAuditDashboard';
export { AuditTimeline3D, type TimelineEvent } from './components/AuditTimeline3D';

// AI/ML Services
export { predictiveAuditEngine, type AuditPrediction, type Issue, type Action, type Pattern } from './services/PredictiveAuditEngine';
export { auditRiskAnalyzer, type RiskPrediction, type FeatureImpact, type Recommendation, type VesselRiskData } from './ml/RiskAnalysisModel';

// React Hooks
export { 
  useAuditPrediction, 
  useFleetPredictions, 
  useRiskPrediction, 
  useCustomRiskPrediction,
  useRefreshPredictions 
} from './hooks/useAuditPrediction';

// Re-export component as default for lazy loading
export { default } from './components/ExecutiveAuditDashboard';
