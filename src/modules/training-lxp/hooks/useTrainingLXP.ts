/**
 * 🎓 useTrainingLXP Hook
 * React hooks for Training LXP module
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  microLearningEngine, 
  type GameProgress, 
  type DailyLearning,
  type LeaderboardEntry 
} from '../ai/MicroLearningEngine';
import { 
  adaptiveLearningEngine, 
  type PersonalizedCurriculum,
  type LearnerProfile,
  type LearningObjective,
  type Adaptation,
  type LearningPerformance
} from '../ai/AdaptiveLearningEngine';
import { toast } from 'sonner';

/**
 * Hook to get current game progress
 */
export function useGameProgress(learnerId: string | null) {
  return useQuery<GameProgress>({
    queryKey: ['game-progress', learnerId],
    queryFn: async () => {
      if (!learnerId) throw new Error('No learner ID');
      return microLearningEngine.getCurrentProgress(learnerId);
    },
    enabled: !!learnerId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get daily learning recommendation
 */
export function useDailyLearning(learnerId: string | null) {
  return useQuery<DailyLearning>({
    queryKey: ['daily-learning', learnerId],
    queryFn: async () => {
      if (!learnerId) throw new Error('No learner ID');
      return microLearningEngine.generateDailyLearning(learnerId);
    },
    enabled: !!learnerId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to get leaderboard
 */
export function useLeaderboard(limit: number = 10) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', limit],
    queryFn: () => microLearningEngine.getLeaderboard(limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get learner profile
 */
export function useLearnerProfile(learnerId: string | null) {
  return useQuery<LearnerProfile>({
    queryKey: ['learner-profile', learnerId],
    queryFn: async () => {
      if (!learnerId) throw new Error('No learner ID');
      return adaptiveLearningEngine.buildLearnerProfile(learnerId);
    },
    enabled: !!learnerId,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to get personalized curriculum
 */
export function usePersonalizedCurriculum(
  learnerId: string | null, 
  objective: LearningObjective | null
) {
  return useQuery<PersonalizedCurriculum | null>({
    queryKey: ['curriculum', learnerId, objective?.id],
    queryFn: async () => {
      if (!learnerId || !objective) return null;
      return adaptiveLearningEngine.createPersonalizedCurriculum(learnerId, objective);
    },
    enabled: !!learnerId && !!objective,
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Mutation to complete a lesson
 */
export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation<GameProgress, Error, { learnerId: string; lessonId: string; score: number }>({
    mutationFn: async ({ learnerId, lessonId, score }) => {
      return microLearningEngine.updateGameProgress(learnerId, lessonId, score);
    },
    onSuccess: (newProgress, variables) => {
      queryClient.setQueryData(['game-progress', variables.learnerId], newProgress);
      queryClient.invalidateQueries({ queryKey: ['daily-learning'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      
      // Calculate XP gained (simplified)
      const xpGained = Math.round(variables.score * 0.5);
      toast.success(`🎉 Lesson completed! +${xpGained} XP`);
      
      // Check for level up
      // Would compare with previous progress
    },
    onError: (error) => {
      toast.error(`Failed to complete lesson: ${error.message}`);
    }
  });
}

/**
 * Mutation to adapt content in real-time
 */
export function useAdaptContent() {
  return useMutation<Adaptation, Error, { learnerId: string; moduleId: string; performance: LearningPerformance }>({
    mutationFn: async ({ learnerId, moduleId, performance }) => {
      return adaptiveLearningEngine.adaptInRealTime(learnerId, moduleId, performance);
    },
    onSuccess: (adaptation) => {
      if (adaptation.action === 'increase_difficulty') {
        toast.info('🚀 Great progress! Adjusting difficulty...');
      } else if (adaptation.action === 'simplify') {
        toast.info('📚 Adding more examples to help...');
      }
    }
  });
}

/**
 * Mutation to generate curriculum
 */
export function useGenerateCurriculum() {
  const queryClient = useQueryClient();

  return useMutation<PersonalizedCurriculum, Error, { learnerId: string; objective: LearningObjective }>({
    mutationFn: async ({ learnerId, objective }) => {
      return adaptiveLearningEngine.createPersonalizedCurriculum(learnerId, objective);
    },
    onSuccess: (curriculum, variables) => {
      queryClient.setQueryData(
        ['curriculum', variables.learnerId, variables.objective.id], 
        curriculum
      );
      toast.success('📚 Personalized curriculum created!');
    },
    onError: (error) => {
      toast.error(`Failed to create curriculum: ${error.message}`);
    }
  });
}

/**
 * Hook to refresh all training data
 */
export function useRefreshTrainingData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['game-progress'] }),
        queryClient.invalidateQueries({ queryKey: ['daily-learning'] }),
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] }),
        queryClient.invalidateQueries({ queryKey: ['learner-profile'] }),
        queryClient.invalidateQueries({ queryKey: ['curriculum'] })
      ]);
    },
    onSuccess: () => {
      toast.success('Training data refreshed');
    }
  });
}
