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
// MODULE SUMMARY
// ============================================
export const REVOLUTIONARY_MODULES = {
  hrIntelligence: {
    name: 'HR Intelligence',
    path: '/hr-intelligence',
    description: 'AI-powered talent matching, career development, wellness monitoring',
    engines: ['TalentMatchingEngine', 'CareerPathEngine', 'WellnessMonitor']
  },
  operationsIntelligence: {
    name: 'Operations Intelligence',
    path: '/operations-intelligence',
    description: 'AI-powered voyage optimization with 3D fleet visualization',
    engines: ['OperationalIntelligenceEngine']
  },
  predictiveMaintenance: {
    name: 'Predictive Maintenance ML',
    path: '/predictive-maintenance-ml',
    description: 'TensorFlow.js ML-powered failure prediction and maintenance planning',
    engines: ['PredictiveMaintenanceMLEngine']
  },
  trainingLXP: {
    name: 'Training LXP',
    path: '/training-lxp',
    description: 'Gamified adaptive learning with XP, badges, and personalized curriculum',
    engines: ['AdaptiveLearningEngine', 'MicroLearningEngine']
  }
} as const;

export type RevolutionaryModuleKey = keyof typeof REVOLUTIONARY_MODULES;
