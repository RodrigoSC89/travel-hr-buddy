import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CVParseResult {
  name?: string;
  email?: string;
  phone?: string;
  currentRank?: string;
  targetRank?: string;
  experience?: number;
  certifications?: string[];
  vesselTypes?: string[];
  languages?: string[];
  skills?: string[];
  matchScore?: number;
  summary?: string;
}

interface CandidateMatchResult {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

interface InterviewQuestion {
  category: string;
  question: string;
}

export function useAIRecruitment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCV = useCallback(async (cvText: string): Promise<CVParseResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-recruitment', {
        body: { action: 'parse_cv', cvText }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to parse CV');
      }

      toast.success('CV parsed successfully');
      return data.result as CVParseResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`CV parsing failed: ${message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const matchCandidate = useCallback(async (
    jobRequirements: Record<string, unknown>,
    candidateData: Record<string, unknown>
  ): Promise<CandidateMatchResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-recruitment', {
        body: { action: 'match_candidate', jobRequirements, candidateData }
      });

      if (fnError) throw new Error(fnError.message);
      if (!data.success) throw new Error(data.error || 'Failed to match candidate');

      return data.result as CandidateMatchResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Matching failed: ${message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateInterviewQuestions = useCallback(async (
    candidateData: { targetRank: string; vesselType: string; experience: number }
  ): Promise<InterviewQuestion[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-recruitment', {
        body: { action: 'generate_interview', candidateData }
      });

      if (fnError) throw new Error(fnError.message);
      if (!data.success) throw new Error(data.error || 'Failed to generate questions');

      toast.success('Interview questions generated');
      return data.result?.questions || data.result as InterviewQuestion[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Generation failed: ${message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    parseCV,
    matchCandidate,
    generateInterviewQuestions,
    isLoading,
    error
  };
}
