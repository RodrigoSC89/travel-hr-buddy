/**
 * 👥 HR Intelligence Module - Revolutionary People Management
 * NAUTILUS ONE v5.0
 * 
 * AI-powered HR with talent matching, career development,
 * wellness monitoring, and predictive analytics
 */

export { TalentAnalyticsDashboard } from './components/TalentAnalyticsDashboard';
export { talentMatchingEngine, type MatchResult, type CrewMemberProfile, type VesselRequirement } from './ai/TalentMatchingEngine';
export { careerPathEngine, type CareerPath, type CareerMilestone, type SkillGap } from './ai/CareerPathEngine';
export { wellnessMonitor, type WellnessReport, type WellnessData, type Intervention } from './ai/WellnessMonitor';

// Re-export component as default for lazy loading
export { default } from './components/TalentAnalyticsDashboard';
