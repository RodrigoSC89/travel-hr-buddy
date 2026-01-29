/**
 * 🎓 Training LXP Module - Learning Experience Platform
 * NAUTILUS ONE v5.0
 * 
 * Revolutionary maritime training with adaptive learning,
 * gamification, microlearning, and VR/AR simulations
 */

// Components
export { TrainingDashboard } from './components/TrainingDashboard';

// AI Engines
export { adaptiveLearningEngine, type PersonalizedCurriculum, type LearnerProfile, type Adaptation } from './ai/AdaptiveLearningEngine';
export { microLearningEngine, type GameProgress, type MicroLesson, type Badge, type Achievement } from './ai/MicroLearningEngine';

// React Hooks
export {
  useGameProgress,
  useDailyLearning,
  useLeaderboard,
  useLearnerProfile,
  usePersonalizedCurriculum,
  useCompleteLesson,
  useAdaptContent,
  useGenerateCurriculum,
  useRefreshTrainingData
} from './hooks';

// Re-export component as default for lazy loading
export { default } from './components/TrainingDashboard';

