/**
 * useCrewMatching Hook
 * React interface for intelligent crew roster matching
 */

import { useState, useCallback } from 'react';
import { 
  crewMatchingEngine, 
  type CrewCandidate, 
  type CrewVesselPosition, 
  type MatchResult, 
  type RosterSuggestion 
} from '@/lib/ai/engines/crew-matching';

export interface UseCrewMatchingReturn {
  isProcessing: boolean;
  lastResults: MatchResult[] | null;
  lastRoster: RosterSuggestion | null;
  findMatches: (position: CrewVesselPosition, candidates: CrewCandidate[]) => MatchResult[];
  buildRoster: (vessel: { id: string; name: string; positions: CrewVesselPosition[] }, candidates: CrewCandidate[]) => RosterSuggestion;
  evaluateCandidate: (candidate: CrewCandidate, position: CrewVesselPosition) => MatchResult;
}

export function useCrewMatching(): UseCrewMatchingReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResults, setLastResults] = useState<MatchResult[] | null>(null);
  const [lastRoster, setLastRoster] = useState<RosterSuggestion | null>(null);

  const findMatches = useCallback((
    position: CrewVesselPosition,
    candidates: CrewCandidate[]
  ): MatchResult[] => {
    setIsProcessing(true);
    try {
      const results = crewMatchingEngine.findBestMatches(position, candidates);
      setLastResults(results);
      return results;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const buildRoster = useCallback((
    vessel: { id: string; name: string; positions: CrewVesselPosition[] },
    candidates: CrewCandidate[]
  ): RosterSuggestion => {
    setIsProcessing(true);
    try {
      const roster = crewMatchingEngine.buildOptimalRoster(vessel, candidates);
      setLastRoster(roster);
      return roster;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const evaluateCandidate = useCallback((
    candidate: CrewCandidate,
    position: CrewVesselPosition
  ): MatchResult => {
    return crewMatchingEngine.evaluateMatch(candidate, position, []);
  }, []);

  return {
    isProcessing,
    lastResults,
    lastRoster,
    findMatches,
    buildRoster,
    evaluateCandidate
  };
}
