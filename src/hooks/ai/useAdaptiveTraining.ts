/**
 * useAdaptiveTraining Hook
 * React interface for adaptive training engine
 */

import { useState, useCallback } from 'react';
import { 
  adaptiveTrainingEngine, 
  type CrewCompetencyProfile, 
  type AdaptiveCourse,
  type TrainingRecommendation
} from '@/lib/ai/engines/adaptive-training';

export interface UseAdaptiveTrainingReturn {
  isProcessing: boolean;
  recommendations: TrainingRecommendation[];
  generateRecommendations: (profile: CrewCompetencyProfile) => TrainingRecommendation[];
  getAvailableCourses: () => AdaptiveCourse[];
}

export function useAdaptiveTraining(): UseAdaptiveTrainingReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recommendations, setRecommendations] = useState<TrainingRecommendation[]>([]);

  const generateRecommendations = useCallback((profile: CrewCompetencyProfile): TrainingRecommendation[] => {
    setIsProcessing(true);
    try {
      const result = adaptiveTrainingEngine.generateRecommendations(profile);
      setRecommendations([result]);
      return [result];
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const getAvailableCourses = useCallback((): AdaptiveCourse[] => {
    return adaptiveTrainingEngine.getAllCourses();
  }, []);

  return {
    isProcessing,
    recommendations,
    generateRecommendations,
    getAvailableCourses
  };
}
