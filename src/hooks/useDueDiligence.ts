/**
 * Hook para Due Diligence - integração real com Supabase
 * CRUD completo para relatórios de due diligence
 * PATCH v28: Fixed types - using proper null coalescing for optional fields
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';

type DueDiligenceRow = Database['public']['Tables']['due_diligence_reports']['Row'];

// Helper to safely cast Json to Record
function jsonToRecord(value: Json | null): Record<string, unknown> | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

export interface DueDiligenceReport {
  id: string;
  report_code: string;
  report_type: string;
  subject_type: string;
  subject_id: string | null;
  subject_name: string;
  subject_details: Json | null;
  screening_sources: string[] | null;
  risk_score: number | null;
  risk_level: string | null;
  findings: Json | null;
  sanctions_check: Json | null;
  pep_check: Json | null;
  adverse_media: Json | null;
  recommendations: string | null;
  report_status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  valid_until: string | null;
  ai_analysis: Json | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDueDiligenceInput {
  report_code: string;
  report_type: string;
  subject_type: string;
  subject_id?: string | null;
  subject_name: string;
  subject_details?: Json | null;
  screening_sources?: string[] | null;
  risk_score?: number | null;
  risk_level?: string | null;
  findings?: Json | null;
  sanctions_check?: Json | null;
  pep_check?: Json | null;
  adverse_media?: Json | null;
  recommendations?: string | null;
  report_status?: string;
  valid_until?: string | null;
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
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((report: DueDiligenceRow): DueDiligenceReport => ({
        id: report.id,
        report_code: report.report_code ?? `DD-${report.id.slice(0, 8)}`,
        report_type: report.report_type ?? 'general',
        subject_type: report.subject_type ?? 'company',
        subject_id: report.subject_id,
        subject_name: report.subject_name ?? 'N/A',
        subject_details: report.subject_details,
        screening_sources: report.screening_sources,
        risk_score: report.risk_score,
        risk_level: report.risk_level,
        findings: report.findings,
        sanctions_check: report.sanctions_check,
        pep_check: report.pep_check,
        adverse_media: report.adverse_media,
        recommendations: report.recommendations,
        report_status: report.report_status ?? 'pending',
        reviewed_by: report.reviewed_by,
        reviewed_at: report.reviewed_at,
        valid_until: report.valid_until,
        ai_analysis: report.ai_analysis,
        created_at: report.created_at ?? new Date().toISOString(),
        updated_at: report.updated_at ?? new Date().toISOString(),
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

      const report = data as DueDiligenceRow;
      return {
        id: report.id,
        report_code: report.report_code ?? `DD-${report.id.slice(0, 8)}`,
        report_type: report.report_type ?? 'general',
        subject_type: report.subject_type ?? 'company',
        subject_id: report.subject_id,
        subject_name: report.subject_name ?? 'N/A',
        subject_details: report.subject_details,
        screening_sources: report.screening_sources,
        risk_score: report.risk_score,
        risk_level: report.risk_level,
        findings: report.findings,
        sanctions_check: report.sanctions_check,
        pep_check: report.pep_check,
        adverse_media: report.adverse_media,
        recommendations: report.recommendations,
        report_status: report.report_status ?? 'pending',
        reviewed_by: report.reviewed_by,
        reviewed_at: report.reviewed_at,
        valid_until: report.valid_until,
        ai_analysis: report.ai_analysis,
        created_at: report.created_at ?? new Date().toISOString(),
        updated_at: report.updated_at ?? new Date().toISOString(),
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
          subject_id: input.subject_id ?? null,
          subject_name: input.subject_name,
          subject_details: input.subject_details ?? null,
          screening_sources: input.screening_sources ?? null,
          risk_score: input.risk_score ?? null,
          risk_level: input.risk_level ?? null,
          findings: input.findings ?? null,
          sanctions_check: input.sanctions_check ?? null,
          pep_check: input.pep_check ?? null,
          adverse_media: input.adverse_media ?? null,
          recommendations: input.recommendations ?? null,
          report_status: input.report_status ?? 'pending',
          valid_until: input.valid_until ?? null,
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
      // Build update object with only defined fields
      const updateData: Record<string, unknown> = {};
      if (input.report_code !== undefined) updateData.report_code = input.report_code;
      if (input.report_type !== undefined) updateData.report_type = input.report_type;
      if (input.subject_type !== undefined) updateData.subject_type = input.subject_type;
      if (input.subject_id !== undefined) updateData.subject_id = input.subject_id;
      if (input.subject_name !== undefined) updateData.subject_name = input.subject_name;
      if (input.subject_details !== undefined) updateData.subject_details = input.subject_details;
      if (input.screening_sources !== undefined) updateData.screening_sources = input.screening_sources;
      if (input.risk_score !== undefined) updateData.risk_score = input.risk_score;
      if (input.risk_level !== undefined) updateData.risk_level = input.risk_level;
      if (input.findings !== undefined) updateData.findings = input.findings;
      if (input.sanctions_check !== undefined) updateData.sanctions_check = input.sanctions_check;
      if (input.pep_check !== undefined) updateData.pep_check = input.pep_check;
      if (input.adverse_media !== undefined) updateData.adverse_media = input.adverse_media;
      if (input.recommendations !== undefined) updateData.recommendations = input.recommendations;
      if (input.report_status !== undefined) updateData.report_status = input.report_status;
      if (input.valid_until !== undefined) updateData.valid_until = input.valid_until;

      const { data, error } = await supabase
        .from('due_diligence_reports')
        .update(updateData)
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
