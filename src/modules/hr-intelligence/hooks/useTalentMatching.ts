/**
 * 🎯 useTalentMatching Hook
 * React hook for AI-powered crew matching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { talentMatchingEngine, type MatchResult, type VesselRequirement } from '../ai/TalentMatchingEngine';
import { careerPathEngine, type CareerPath, type ProgressReport } from '../ai/CareerPathEngine';
import { wellnessMonitor, type WellnessReport, type WellnessData } from '../ai/WellnessMonitor';
import { toast } from 'sonner';

/**
 * Hook to find perfect crew matches for a vessel
 */
export function useTalentMatching(requirement: VesselRequirement | null) {
  return useQuery<MatchResult[]>({
    queryKey: ['talent-matching', requirement?.vesselId],
    queryFn: async () => {
      if (!requirement) return [];
      return talentMatchingEngine.findPerfectCrew(requirement);
    },
    enabled: !!requirement,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get quick recommendations for a position
 */
export function useQuickRecommendations(positionId: string | null, vesselId: string | null) {
  return useQuery<MatchResult[]>({
    queryKey: ['quick-recommendations', positionId, vesselId],
    queryFn: async () => {
      if (!positionId || !vesselId) return [];
      return talentMatchingEngine.getQuickRecommendations(positionId, vesselId);
    },
    enabled: !!positionId && !!vesselId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to create/get career path for a crew member
 */
export function useCareerPath(crewMemberId: string | null) {
  return useQuery<CareerPath | null>({
    queryKey: ['career-path', crewMemberId],
    queryFn: async () => {
      if (!crewMemberId) return null;
      return careerPathEngine.createCareerPath(crewMemberId);
    },
    enabled: !!crewMemberId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to monitor career progress
 */
export function useCareerProgress(crewMemberId: string | null) {
  return useQuery<ProgressReport | null>({
    queryKey: ['career-progress', crewMemberId],
    queryFn: async () => {
      if (!crewMemberId) return null;
      return careerPathEngine.monitorProgress(crewMemberId);
    },
    enabled: !!crewMemberId,
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Hook to get fleet wellness report
 */
export function useWellnessReport() {
  return useQuery<WellnessReport>({
    queryKey: ['wellness-report'],
    queryFn: () => wellnessMonitor.monitorCrewWellness(),
    staleTime: 1000 * 60 * 15, // 15 min cache
    refetchInterval: false, // DISABLED - prevent infinite loading
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * Hook to get individual wellness
 */
export function useIndividualWellness(crewMemberId: string | null) {
  return useQuery<WellnessData | null>({
    queryKey: ['individual-wellness', crewMemberId],
    queryFn: async () => {
      if (!crewMemberId) return null;
      return wellnessMonitor.getIndividualWellness(crewMemberId);
    },
    enabled: !!crewMemberId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Mutation to generate new career path
 */
export function useGenerateCareerPath() {
  const queryClient = useQueryClient();

  return useMutation<CareerPath, Error, string>({
    mutationFn: (crewMemberId) => careerPathEngine.createCareerPath(crewMemberId),
    onSuccess: (result, crewMemberId) => {
      queryClient.setQueryData(['career-path', crewMemberId], result);
      toast.success('Career path generated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to generate career path: ${error.message}`);
    }
  });
}

/**
 * Hook to refresh all HR intelligence data
 */
export function useRefreshHRIntelligence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['talent-matching'] }),
        queryClient.invalidateQueries({ queryKey: ['career-path'] }),
        queryClient.invalidateQueries({ queryKey: ['wellness-report'] }),
        queryClient.invalidateQueries({ queryKey: ['crew-analytics'] })
      ]);
    },
    onSuccess: () => {
      toast.success('HR Intelligence data refreshed');
    }
  });
}
