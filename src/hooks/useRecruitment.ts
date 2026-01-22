/**
 * Recruitment Hooks - v4.0
 * Connected to Supabase recruitment_candidates and job_openings tables
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

export function useCandidates(jobId?: string) {
  return useQuery({
    queryKey: ['candidates', jobId],
    queryFn: async (): Promise<Candidate[]> => {
      let query = supabase
        .from('recruitment_candidates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (jobId) {
        query = query.eq('job_opening_id', jobId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone ?? undefined,
        rank_applied: row.rank_applied,
        experience_years: row.experience_years || 0,
        certifications: row.certifications || [],
        vessel_types: row.vessel_types || [],
        languages: row.languages || [],
        match_score: row.match_score || 0,
        status: row.status as Candidate['status'],
        cv_url: row.cv_url ?? undefined,
        notes: row.notes ?? undefined,
        created_at: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at ?? undefined,
        job_opening_id: row.job_opening_id ?? undefined,
        ai_analysis: row.ai_analysis as Candidate['ai_analysis'],
      }));
    },
    staleTime: 30000,
  });
}

export function useJobOpenings() {
  return useQuery({
    queryKey: ['job-openings'],
    queryFn: async (): Promise<JobOpening[]> => {
      const { data, error } = await supabase
        .from('job_openings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(row => ({
        id: row.id,
        title: row.title,
        vessel_type: row.vessel_type || '',
        rank_required: row.rank_required,
        certifications_required: row.certifications_required || [],
        experience_min: row.experience_min || 0,
        description: row.description ?? undefined,
        salary_range: row.salary_range ?? undefined,
        status: row.status as JobOpening['status'],
        applicants_count: row.applicants_count || 0,
        created_at: row.created_at || new Date().toISOString(),
        deadline: row.deadline ?? undefined,
      }));
    },
    staleTime: 60000,
  });
}

export function useCreateJobOpening() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (opening: Omit<JobOpening, 'id' | 'created_at' | 'applicants_count'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('job_openings')
        .insert({
          title: opening.title,
          vessel_type: opening.vessel_type,
          rank_required: opening.rank_required,
          certifications_required: opening.certifications_required,
          experience_min: opening.experience_min,
          description: opening.description,
          salary_range: opening.salary_range,
          status: opening.status,
          deadline: opening.deadline,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
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

export function useUpdateCandidateStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Candidate['status'] }) => {
      const { error } = await supabase
        .from('recruitment_candidates')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      return { id, status };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success(`Status atualizado para: ${variables.status}`);
    },
  });
}

export function useAICVAnalysis() {
  return useMutation({
    mutationFn: async ({ cvText, jobId }: { cvText: string; jobId?: string }) => {
      const { data, error } = await supabase.functions.invoke('ai-recruitment', {
        body: { action: 'parse_cv', cvText, jobId },
      });
      if (error) throw error;
      return data.result;
    },
    onSuccess: () => toast.success('CV analisado com sucesso!'),
    onError: (error) => toast.error(`Erro na análise: ${error.message}`),
  });
}

export function useGenerateInterviewQuestions() {
  return useMutation({
    mutationFn: async (candidateData: { targetRank: string; vesselType: string; experience: number }) => {
      const { data, error } = await supabase.functions.invoke('ai-recruitment', {
        body: { action: 'generate_interview', candidateData },
      });
      if (error) throw error;
      return data.result;
    },
  });
}
