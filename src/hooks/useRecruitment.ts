/**
 * Recruitment Hooks - v4.0
 * Connect recruitment pipeline to Supabase + AI
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  rank_applied: string;
  experience_years: number;
  certifications: string[];
  vessel_types?: string[];
  languages?: string[];
  match_score: number;
  status: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  cv_url?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  job_opening_id?: string;
  ai_analysis?: {
    strengths: string[];
    gaps: string[];
    recommendation: string;
  };
}

export interface JobOpening {
  id: string;
  title: string;
  vessel_type: string;
  rank_required: string;
  certifications_required: string[];
  experience_min: number;
  description?: string;
  salary_range?: string;
  status: 'open' | 'closed' | 'filled';
  applicants_count: number;
  created_at: string;
  deadline?: string;
}

// List all candidates
export function useCandidates(jobId?: string) {
  return useQuery({
    queryKey: ['candidates', jobId],
    queryFn: async () => {
      // For now, return mock data as recruitment_candidates table may not exist
      const mockCandidates: Candidate[] = [
        {
          id: '1',
          name: 'Carlos Mendes',
          email: 'carlos.mendes@email.com',
          rank_applied: 'Chief Officer',
          experience_years: 12,
          certifications: ['STCW', 'GMDSS', 'Advanced Firefighting', 'Medical First Aid'],
          match_score: 94,
          status: 'interview',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Ana Silva',
          email: 'ana.silva@email.com',
          rank_applied: '2nd Engineer',
          experience_years: 8,
          certifications: ['STCW', 'Engine Room Simulator', 'High Voltage'],
          match_score: 87,
          status: 'screening',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Pedro Santos',
          email: 'pedro.santos@email.com',
          rank_applied: 'Master',
          experience_years: 20,
          certifications: ['STCW', 'GMDSS', 'Ship Security Officer', 'ISM Lead Auditor'],
          match_score: 98,
          status: 'offer',
          created_at: new Date().toISOString(),
        },
      ];
      
      return mockCandidates;
    },
    staleTime: 30000,
  });
}

// List job openings
export function useJobOpenings() {
  return useQuery({
    queryKey: ['job-openings'],
    queryFn: async () => {
      const mockOpenings: JobOpening[] = [
        {
          id: '1',
          title: 'Chief Officer - Container Vessel',
          vessel_type: 'Container',
          rank_required: 'Chief Officer',
          certifications_required: ['STCW', 'GMDSS', 'Advanced Firefighting'],
          experience_min: 8,
          status: 'open',
          applicants_count: 12,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Master - Tanker Operations',
          vessel_type: 'Tanker',
          rank_required: 'Master',
          certifications_required: ['STCW', 'Tanker Familiarization', 'Ship Security Officer'],
          experience_min: 15,
          status: 'open',
          applicants_count: 5,
          created_at: new Date().toISOString(),
        },
      ];
      
      return mockOpenings;
    },
    staleTime: 60000,
  });
}

// Create job opening
export function useCreateJobOpening() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (opening: Omit<JobOpening, 'id' | 'created_at' | 'applicants_count'>) => {
      // Call AI to generate JD if description is empty
      if (!opening.description) {
        const { data } = await supabase.functions.invoke('ai-recruitment', {
          body: {
            action: 'generate_jd',
            jobData: opening,
          },
        });
        opening.description = data?.result?.description || '';
      }
      
      // For now, return mock
      return { ...opening, id: crypto.randomUUID(), created_at: new Date().toISOString(), applicants_count: 0 };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-openings'] });
      toast.success('Vaga criada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao criar vaga: ${error.message}`);
    },
  });
}

// Update candidate status
export function useUpdateCandidateStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Candidate['status'] }) => {
      // In real implementation, update in Supabase
      return { id, status };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success(`Status atualizado para: ${variables.status}`);
    },
  });
}

// AI CV Analysis
export function useAICVAnalysis() {
  return useMutation({
    mutationFn: async ({ cvText, jobId }: { cvText: string; jobId?: string }) => {
      const { data, error } = await supabase.functions.invoke('ai-recruitment', {
        body: {
          action: 'parse_cv',
          cvText,
          jobId,
        },
      });
      
      if (error) throw error;
      return data.result;
    },
    onSuccess: () => {
      toast.success('CV analisado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro na análise: ${error.message}`);
    },
  });
}

// Generate interview questions
export function useGenerateInterviewQuestions() {
  return useMutation({
    mutationFn: async (candidateData: { targetRank: string; vesselType: string; experience: number }) => {
      const { data, error } = await supabase.functions.invoke('ai-recruitment', {
        body: {
          action: 'generate_interview',
          candidateData,
        },
      });
      
      if (error) throw error;
      return data.result;
    },
  });
}
