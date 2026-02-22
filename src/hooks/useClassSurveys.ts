/**
 * Class Surveys Hook - Gestão de Vistorias de Classe
 * PATCH v3.0 - Integrado com tabela class_surveys real
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fromUntyped } from '@/integrations/supabase/untyped-client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface ClassSurvey {
  id: string;
  vessel_id: string;
  vessel_name?: string;
  vessel_imo?: string;
  survey_type: 'Annual' | 'Intermediate' | 'Special' | 'Renewal' | 'Bottom' | 'Drydock';
  classification_society: 'DNV' | "Lloyd's" | 'ABS' | 'BV' | 'ClassNK' | 'RINA';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue' | 'Pending';
  scheduled_date: string;
  completed_date?: string;
  findings_count: number;
  critical_findings: number;
  inspector?: string;
  location?: string;
  certificates: string[];
  next_due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSurveyInput {
  vessel_id: string;
  survey_type: ClassSurvey['survey_type'];
  classification_society: ClassSurvey['classification_society'];
  scheduled_date: string;
  location?: string;
  certificates?: string[];
}

/**
 * Fetch all class surveys with vessel info from real table
 */
export function useClassSurveys() {
  return useQuery({
    queryKey: ['class-surveys'],
    queryFn: async (): Promise<ClassSurvey[]> => {
      const { data: surveys, error } = await supabase
        .from('class_surveys')
        .select('*')
        .order('due_date', { ascending: true })
        .limit(100);

      if (error) {
        logger.error('Failed to fetch class_surveys', { error });
        throw error;
      }

      if (!surveys?.length) return [];

      // Fetch vessel info
      const vesselIds = [...new Set(surveys.map(s => s.vessel_id).filter((id): id is string => id != null))];
      let vesselMap: Record<string, { name: string; imo: string }> = {};

      if (vesselIds.length > 0) {
        const { data: vessels } = await supabase
          .from('vessels')
          .select('id, name, imo_number')
          .in('id', vesselIds);

        type VesselRow = { id: string; name: string; imo_number?: string };
        (vessels as VesselRow[] || []).forEach((v) => {
          vesselMap[v.id] = { name: v.name, imo: v.imo_number || '' };
        });
      }

      // Fetch classification society names
      const csIds = [...new Set(surveys.map(s => s.classification_society_id).filter((id): id is string => id != null))];
      let csMap: Record<string, string> = {};

      if (csIds.length > 0) {
        const { data: societies } = await supabase
          .from('classification_societies')
          .select('id, name')
          .in('id', csIds);

        type CSRow = { id: string; name: string };
        (societies as CSRow[] || []).forEach((cs) => {
          csMap[cs.id] = cs.name;
        });
      }

      const now = new Date();

      type SurveyRow = Record<string, unknown>;
      return (surveys as SurveyRow[]).map((s) => {
        const vessel = vesselMap[String(s.vessel_id)] || { name: 'Embarcação', imo: '' };
        const csName = csMap[String(s.classification_society_id)] || 'DNV';
        const findings = Array.isArray(s.findings) ? s.findings : [];
        type FindingItem = Record<string, unknown>;
        const criticalFindings = (findings as FindingItem[]).filter((f) => f?.severity === 'critical' || f?.priority === 'critical').length;

        // Determine status
        let status: ClassSurvey['status'] = 'Scheduled';
        if (s.status === 'completed' || s.completed_date) {
          status = 'Completed';
        } else if (s.status === 'in_progress') {
          status = 'In Progress';
        } else if (s.status === 'pending') {
          status = 'Pending';
        } else if (s.due_date && new Date(String(s.due_date)) < now && !s.completed_date) {
          status = 'Overdue';
        }

        return {
          id: String(s.id),
          vessel_id: String(s.vessel_id),
          vessel_name: vessel.name,
          vessel_imo: vessel.imo,
          survey_type: (s.survey_type as ClassSurvey['survey_type']) || 'Annual',
          classification_society: mapCSName(csName),
          status,
          scheduled_date: String(s.due_date || s.window_start || s.created_at),
          completed_date: s.completed_date ? String(s.completed_date) : undefined,
          findings_count: findings.length,
          critical_findings: criticalFindings,
          inspector: s.surveyor_name ? String(s.surveyor_name) : undefined,
          location: s.survey_location ? String(s.survey_location) : undefined,
          certificates: (s.certificates_issued as string[]) || [],
          next_due_date: s.window_end ? String(s.window_end) : undefined,
          created_at: String(s.created_at),
          updated_at: String(s.updated_at),
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get survey statistics
 */
export function useClassSurveyStats() {
  const { data: surveys } = useClassSurveys();
  
  return {
    total: surveys?.length || 0,
    scheduled: surveys?.filter(s => s.status === 'Scheduled').length || 0,
    inProgress: surveys?.filter(s => s.status === 'In Progress').length || 0,
    completed: surveys?.filter(s => s.status === 'Completed').length || 0,
    overdue: surveys?.filter(s => s.status === 'Overdue').length || 0,
    complianceRate: surveys?.length ? 
      Math.round((surveys.filter(s => s.status !== 'Overdue').length / surveys.length) * 100) : 100,
  };
}

/**
 * Create new class survey (real insert)
 */
export function useCreateClassSurvey() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateSurveyInput) => {
      const { data, error } = await fromUntyped('class_surveys')
        .insert({
          vessel_id: input.vessel_id,
          survey_type: input.survey_type,
          due_date: input.scheduled_date,
          survey_location: input.location,
          certificates_issued: input.certificates || [],
          status: 'scheduled',
          survey_name: `${input.survey_type} Survey`,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-surveys'] });
      toast({
        title: "Vistoria Agendada",
        description: "Nova vistoria de classe criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao Criar Vistoria",
        description: error.message || "Não foi possível criar a vistoria.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Update survey status (real update)
 */
export function useUpdateSurveyStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ surveyId, status }: { surveyId: string; status: ClassSurvey['status'] }) => {
      const dbStatus = status.toLowerCase().replace(' ', '_');
      const updates: Record<string, unknown> = { status: dbStatus };
      
      if (status === 'Completed') {
        updates.completed_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await fromUntyped('class_surveys')
        .update(updates)
        .eq('id', surveyId);

      if (error) throw error;
      return { surveyId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-surveys'] });
      toast({
        title: "Status Atualizado",
        description: "O status da vistoria foi atualizado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao Atualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Helper: map classification society name
function mapCSName(name: string): ClassSurvey['classification_society'] {
  const normalized = name.toLowerCase();
  if (normalized.includes('dnv')) return 'DNV';
  if (normalized.includes('lloyd')) return "Lloyd's";
  if (normalized.includes('abs')) return 'ABS';
  if (normalized.includes('bureau') || normalized.includes('bv')) return 'BV';
  if (normalized.includes('nk') || normalized.includes('nippon')) return 'ClassNK';
  if (normalized.includes('rina')) return 'RINA';
  return 'DNV';
}
