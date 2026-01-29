/**
 * 🎓 Training LXP Module - Learning Experience Platform
 * NAUTILUS ONE v5.0
 * 
 * Revolutionary maritime training with adaptive learning,
 * gamification, microlearning, and VR/AR simulations
 */

export { TrainingDashboard } from './components/TrainingDashboard';
export { adaptiveLearningEngine, type PersonalizedCurriculum, type LearnerProfile, type Adaptation } from './ai/AdaptiveLearningEngine';
export { microLearningEngine, type GameProgress, type MicroLesson, type Badge, type Achievement } from './ai/MicroLearningEngine';

// Re-export component as default for lazy loading
export { default } from './components/TrainingDashboard';
