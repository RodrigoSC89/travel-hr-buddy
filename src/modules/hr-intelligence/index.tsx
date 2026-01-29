/**
 * 👥 HR Intelligence Module - Revolutionary People Management
 * NAUTILUS ONE v5.0
 * 
 * AI-powered HR with talent matching, career development,
 * wellness monitoring, and predictive analytics
 */

// Components
export { TalentAnalyticsDashboard } from './components/TalentAnalyticsDashboard';

// AI Engines
export { talentMatchingEngine, type MatchResult, type CrewMemberProfile, type VesselRequirement } from './ai/TalentMatchingEngine';
export { careerPathEngine, type CareerPath, type CareerMilestone, type SkillGap } from './ai/CareerPathEngine';
export { wellnessMonitor, type WellnessReport, type WellnessData, type Intervention } from './ai/WellnessMonitor';

// React Hooks
export { 
  useTalentMatching,
  useQuickRecommendations,
  useCareerPath,
  useCareerProgress,
  useWellnessReport,
  useIndividualWellness,
  useGenerateCareerPath,
  useRefreshHRIntelligence
} from './hooks';

// Re-export component as default for lazy loading
export { default } from './components/TalentAnalyticsDashboard';

