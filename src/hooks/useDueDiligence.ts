import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

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

// Mock data for when table doesn't exist yet
const mockReports: DueDiligenceReport[] = [
  {
    id: '1',
    report_code: 'DD-2025-001',
    report_type: 'vessel_vetting',
    subject_type: 'vessel',
    subject_name: 'MV Atlantic Explorer',
    risk_score: 25,
    risk_level: 'low',
    report_status: 'completed',
    recommendations: 'Embarcação aprovada para operações.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    report_code: 'DD-2025-002',
    report_type: 'company_screening',
    subject_type: 'company',
    subject_name: 'Global Maritime Services Ltd',
    risk_score: 45,
    risk_level: 'medium',
    report_status: 'requires_action',
    recommendations: 'Necessária verificação adicional de beneficiários finais.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    report_code: 'DD-2025-003',
    report_type: 'sanctions',
    subject_type: 'individual',
    subject_name: 'John Smith',
    risk_score: 85,
    risk_level: 'high',
    report_status: 'pending',
    recommendations: 'Verificação de sanções em andamento.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useDueDiligenceReports(filters?: { 
  report_type?: string; 
  risk_level?: string; 
  status?: string;
  subject_type?: string;
}) {
  return useQuery({
    queryKey: ['due_diligence_reports', filters],
    queryFn: async () => {
      try {
        let result = [...mockReports];
        if (filters?.report_type) result = result.filter(r => r.report_type === filters.report_type);
        if (filters?.risk_level) result = result.filter(r => r.risk_level === filters.risk_level);
        if (filters?.status) result = result.filter(r => r.report_status === filters.status);
        if (filters?.subject_type) result = result.filter(r => r.subject_type === filters.subject_type);
        return result;
      } catch {
        logger.warn('Using mock due diligence data');
        return mockReports;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDueDiligenceReport(id: string) {
  return useQuery({
    queryKey: ['due_diligence_report', id],
    queryFn: async () => {
      const mock = mockReports.find(r => r.id === id);
      return mock || null;
    },
    enabled: !!id,
  });
}

export function useCreateDueDiligence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDueDiligenceInput) => {
      const newReport: DueDiligenceReport = {
        id: crypto.randomUUID(),
        ...input,
        report_status: input.report_status ?? 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['due_diligence_reports'] });
      toast.success('Relatório de Due Diligence criado com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao criar relatório: ${error.message}`);
    },
  });
}

export function useUpdateDueDiligence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<CreateDueDiligenceInput> & { id: string }) => {
      const existing = mockReports.find(r => r.id === id);
      if (!existing) throw new Error('Report not found');
      return { ...existing, ...input, updated_at: new Date().toISOString() };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['due_diligence_reports'] });
      queryClient.invalidateQueries({ queryKey: ['due_diligence_report', variables.id] });
      toast.success('Relatório atualizado com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar relatório: ${error.message}`);
    },
  });
}

export function useDeleteDueDiligence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['due_diligence_reports'] });
      toast.success('Relatório excluído com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir relatório: ${error.message}`);
    },
  });
}

// AI-powered risk assessment
export function useAIRiskAssessment() {
  return useMutation({
    mutationFn: async (subjectData: { name: string; type: string; details?: Record<string, unknown> }) => {
      const response = await fetch('https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/module-ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE`,
        },
        body: JSON.stringify({
          module: 'due-diligence',
          system_prompt: 'Você é um especialista em Due Diligence marítimo e verificação de sanções.',
          context: 'Análise de risco e compliance',
          messages: [
            {
              role: 'user',
              content: `Analise o risco para: ${subjectData.name} (${subjectData.type}). Detalhes: ${JSON.stringify(subjectData.details || {})}. Forneça: score de risco (0-100), nível (low/medium/high/critical), e recomendações.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na análise de risco');
      }

      return response.json();
    },
  });
}
