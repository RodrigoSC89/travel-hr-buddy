/**
 * 🚀 Revolutionary Modules Index
 * NAUTILUS ONE v6.0 - Central exports for all revolutionary AI modules
 * 
 * This file provides a unified export point for all the revolutionary
 * AI-powered modules that make Nauti One a world-class maritime platform.
 */

// ============================================
// HR INTELLIGENCE MODULE
// AI-powered talent matching, career development, wellness monitoring
// ============================================
export {
  TalentAnalyticsDashboard,
  talentMatchingEngine,
  careerPathEngine,
  wellnessMonitor,
  useTalentMatching,
  useQuickRecommendations,
  useCareerPath,
  useCareerProgress,
  useWellnessReport,
  useIndividualWellness,
  useGenerateCareerPath,
  useRefreshHRIntelligence,
  type MatchResult,
  type CrewMemberProfile,
  type VesselRequirement,
  type CareerPath,
  type CareerMilestone,
  type SkillGap,
  type WellnessReport,
  type WellnessData,
  type Intervention
} from './hr-intelligence';

// ============================================
// OPERATIONS INTELLIGENCE MODULE
// AI-powered voyage optimization, 3D fleet visualization
// ============================================
export {
  OperationsDashboard3D,
  operationalIntelligenceEngine,
  useOperationsIntelligence,
  type VoyageOptimization,
  type VoyageData,
  type RouteWaypoint,
  type UseOperationsIntelligenceOptions
} from './operations-intelligence';

// ============================================
// PREDICTIVE MAINTENANCE MODULE
// TensorFlow.js ML-powered failure prediction
// ============================================
export {
  MaintenanceDashboardML,
  predictiveMaintenanceMLEngine,
  usePredictiveMaintenance,
  type FailurePrediction,
  type MaintenancePlan,
  type EquipmentHealth,
  type SensorReading,
  type UsePredictiveMaintenanceOptions
} from './predictive-maintenance';

// ============================================
// TRAINING LXP MODULE
// Gamified adaptive learning platform
// ============================================
export {
  TrainingDashboard,
  adaptiveLearningEngine,
  microLearningEngine,
  useGameProgress,
  useDailyLearning,
  useLeaderboard,
  useLearnerProfile,
  usePersonalizedCurriculum,
  useCompleteLesson,
  useAdaptContent,
  useGenerateCurriculum,
  useRefreshTrainingData,
  type PersonalizedCurriculum,
  type LearnerProfile,
  type Adaptation,
  type GameProgress,
  type MicroLesson,
  type Badge,
  type Achievement
} from './training-lxp';

// ============================================
// PREDICTIVE AUDIT MODULE
// AI/ML-powered audit predictions with 3D visualization
// ============================================
export {
  ExecutiveAuditDashboard,
  AuditTimeline3D,
  predictiveAuditEngine,
  auditRiskAnalyzer,
  useAuditPrediction,
  useFleetPredictions,
  useRiskPrediction,
  useCustomRiskPrediction,
  useRefreshPredictions,
  type AuditPrediction,
  type Issue,
  type Action,
  type Pattern,
  type RiskPrediction,
  type FeatureImpact,
  type Recommendation,
  type VesselRiskData,
  type TimelineEvent
} from './audits';

// ============================================
// FINANCE AI MODULE
// Predictive accounting, fraud detection, budget optimization
// ============================================
export {
  FinanceHub,
  predictiveAccountingEngine,
  useFinanceAI,
  useCashFlowPrediction,
  useFinancialMetrics,
  useFinancialRisk,
  useFraudDetection,
  useBudgetOptimization,
  useRefreshFinanceData,
  type CashFlowPrediction,
  type FraudAlert,
  type BudgetOptimization,
  type FinancialRiskAssessment,
  type FinancialMetrics,
  type UseFinanceAIOptions
} from './finance';

// ============================================
// SMART LOGISTICS MODULE
// Autonomous supply chain, predictive inventory
// ============================================
export {
  autonomousLogisticsEngine,
  useLogisticsAI,
  useInventoryPrediction,
  useSupplyChainOptimization,
  useDemandForecast,
  useLogisticsMetrics,
  useAutoOrderGeneration,
  useRefreshLogisticsData,
  type InventoryPrediction,
  type SupplyChainOptimization,
  type DemandForecast,
  type AutoOrderRecommendation,
  type LogisticsMetrics,
  type UseLogisticsAIOptions
} from './smart-logistics';

// ============================================
// MODULE SUMMARY
// ============================================
export const REVOLUTIONARY_MODULES = {
  hrIntelligence: {
    name: 'HR Intelligence',
    path: '/hr-intelligence',
    description: 'AI-powered talent matching, career development, wellness monitoring',
    engines: ['TalentMatchingEngine', 'CareerPathEngine', 'WellnessMonitor'],
    badge: 'TALENT AI'
  },
  operationsIntelligence: {
    name: 'Operations Intelligence',
    path: '/operations-intelligence',
    description: 'AI-powered voyage optimization with 3D fleet visualization',
    engines: ['OperationalIntelligenceEngine'],
    badge: 'AI+3D'
  },
  predictiveMaintenance: {
    name: 'Predictive Maintenance ML',
    path: '/predictive-maintenance-ml',
    description: 'TensorFlow.js ML-powered failure prediction and maintenance planning',
    engines: ['PredictiveMaintenanceMLEngine'],
    badge: 'TensorFlow.js'
  },
  trainingLXP: {
    name: 'Training LXP',
    path: '/training-lxp',
    description: 'Gamified adaptive learning with XP, badges, and personalized curriculum',
    engines: ['AdaptiveLearningEngine', 'MicroLearningEngine'],
    badge: 'GAMIFICATION'
  },
  predictiveAudit: {
    name: 'Predictive Audit',
    path: '/predictive-audit',
    description: 'AI predictions for audits with ML risk analysis and 3D timeline',
    engines: ['PredictiveAuditEngine', 'RiskAnalysisModel'],
    badge: 'AI+ML+3D'
  },
  financeAI: {
    name: 'Finance AI',
    path: '/finance-hub',
    description: 'Predictive accounting, fraud detection, budget optimization',
    engines: ['PredictiveAccountingEngine'],
    badge: 'PREDICTIVE'
  },
  smartLogistics: {
    name: 'Smart Logistics',
    path: '/smart-logistics',
    description: 'Autonomous supply chain with predictive inventory management',
    engines: ['AutonomousLogisticsEngine'],
    badge: 'AUTONOMOUS'
  }
} as const;

export type RevolutionaryModuleKey = keyof typeof REVOLUTIONARY_MODULES;

// Total count of revolutionary modules
export const REVOLUTIONARY_MODULES_COUNT = Object.keys(REVOLUTIONARY_MODULES).length;
