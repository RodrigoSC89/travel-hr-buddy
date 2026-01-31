/**
 * Hook para Due Diligence - integração real com Supabase
 * CRUD completo para relatórios de due diligence
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';

export interface DueDiligenceReport {
  id: string;
  report_code: string;
  report_type: string;
  subject_type: string;
  subject_id?: string;
  subject_name: string;
  subject_details?: Record<string, unknown>;
  screening_sources?: string[];
  risk_score?: number;
  risk_level?: string;
  findings?: Record<string, unknown>;
  sanctions_check?: Record<string, unknown>;
  pep_check?: Record<string, unknown>;
  adverse_media?: Record<string, unknown>;
  recommendations?: string;
  report_status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  valid_until?: string;
  ai_analysis?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateDueDiligenceInput {
  report_code: string;
  report_type: string;
  subject_type: string;
  subject_id?: string;
  subject_name: string;
  subject_details?: Record<string, unknown>;
  screening_sources?: string[];
  risk_score?: number;
  risk_level?: string;
  findings?: Record<string, unknown>;
  sanctions_check?: Record<string, unknown>;
  pep_check?: Record<string, unknown>;
  adverse_media?: Record<string, unknown>;
  recommendations?: string;
  report_status?: string;
  valid_until?: string;
}

export function useDueDiligenceReports(filters?: { 
  report_type?: string; 
  risk_level?: string; 
  status?: string;
  subject_type?: string;
}) {
  return useQuery({
    queryKey: ['due_diligence_reports', filters],
    queryFn: async (): Promise<DueDiligenceReport[]> => {
      let query = supabase
        .from('due_diligence_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.report_type) {
        query = query.eq('report_type', filters.report_type);
      }
      if (filters?.risk_level) {
        query = query.eq('risk_level', filters.risk_level);
      }
      if (filters?.status) {
        query = query.eq('report_status', filters.status);
      }
      if (filters?.subject_type) {
        query = query.eq('subject_type', filters.subject_type);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        logger.error('Error fetching due diligence reports:', error);
        // Return empty array - UI should show EmptyState
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map(report => ({
        id: report.id,
        report_code: report.report_code || `DD-${report.id.slice(0, 8)}`,
        report_type: report.report_type || 'general',
        subject_type: report.subject_type || 'company',
        subject_id: report.subject_id,
        subject_name: report.subject_name || 'N/A',
        subject_details: report.subject_details,
        screening_sources: report.screening_sources,
        risk_score: report.risk_score,
        risk_level: report.risk_level,
        findings: report.findings,
        sanctions_check: report.sanctions_check,
        pep_check: report.pep_check,
        adverse_media: report.adverse_media,
        recommendations: report.recommendations,
        report_status: report.report_status || 'pending',
        reviewed_by: report.reviewed_by,
        reviewed_at: report.reviewed_at,
        valid_until: report.valid_until,
        ai_analysis: report.ai_analysis,
        created_at: report.created_at,
        updated_at: report.updated_at,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDueDiligenceReport(id: string) {
  return useQuery({
    queryKey: ['due_diligence_report', id],
    queryFn: async (): Promise<DueDiligenceReport | null> => {
      const { data, error } = await supabase
        .from('due_diligence_reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error('Error fetching due diligence report:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        report_code: data.report_code || `DD-${data.id.slice(0, 8)}`,
        report_type: data.report_type || 'general',
        subject_type: data.subject_type || 'company',
        subject_id: data.subject_id,
        subject_name: data.subject_name || 'N/A',
        subject_details: data.subject_details,
        screening_sources: data.screening_sources,
        risk_score: data.risk_score,
        risk_level: data.risk_level,
        findings: data.findings,
        sanctions_check: data.sanctions_check,
        pep_check: data.pep_check,
        adverse_media: data.adverse_media,
        recommendations: data.recommendations,
        report_status: data.report_status || 'pending',
        reviewed_by: data.reviewed_by,
        reviewed_at: data.reviewed_at,
        valid_until: data.valid_until,
        ai_analysis: data.ai_analysis,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    },
    enabled: !!id,
  });
}

export function useCreateDueDiligence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDueDiligenceInput) => {
      const { data, error } = await supabase
        .from('due_diligence_reports')
        .insert({
          report_code: input.report_code,
          report_type: input.report_type,
          subject_type: input.subject_type,
          subject_id: input.subject_id,
          subject_name: input.subject_name,
          subject_details: input.subject_details,
          screening_sources: input.screening_sources,
          risk_score: input.risk_score,
          risk_level: input.risk_level,
          findings: input.findings,
          sanctions_check: input.sanctions_check,
          pep_check: input.pep_check,
          adverse_media: input.adverse_media,
          recommendations: input.recommendations,
          report_status: input.report_status || 'pending',
          valid_until: input.valid_until,
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating due diligence report:', error);
        throw new Error(`Erro ao criar relatório: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['due_diligence_reports'] });
      toast.success('Relatório de Due Diligence criado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateDueDiligence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<CreateDueDiligenceInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('due_diligence_reports')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating due diligence report:', error);
        throw new Error(`Erro ao atualizar relatório: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['due_diligence_reports'] });
      queryClient.invalidateQueries({ queryKey: ['due_diligence_report', variables.id] });
      toast.success('Relatório atualizado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteDueDiligence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('due_diligence_reports')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting due diligence report:', error);
        throw new Error(`Erro ao excluir relatório: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['due_diligence_reports'] });
      toast.success('Relatório excluído com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// AI-powered risk assessment using Supabase Edge Function
export function useAIRiskAssessment() {
  return useMutation({
    mutationFn: async (subjectData: { name: string; type: string; details?: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke('module-ai-chat', {
        body: {
          module: 'due-diligence',
          system_prompt: 'Você é um especialista em Due Diligence marítimo e verificação de sanções.',
          context: 'Análise de risco e compliance',
          messages: [
            {
              role: 'user',
              content: `Analise o risco para: ${subjectData.name} (${subjectData.type}). Detalhes: ${JSON.stringify(subjectData.details || {})}. Forneça: score de risco (0-100), nível (low/medium/high/critical), e recomendações.`,
            },
          ],
        },
      });

      if (error) {
        throw new Error(`Falha na análise de risco: ${error.message}`);
      }

      return data;
    },
  });
}
