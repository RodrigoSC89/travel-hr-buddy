/**
 * useAIPEODP - Hook de IA para PEO-DP (622 linhas mapeadas)
 * Análise de conformidade, relatórios, voice chat
 */
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PEODPSection {
  id: string;
  section_number: string;
  title: string;
  description: string;
  requirements: PEODPRequirement[];
  compliance_status?: 'compliant' | 'non_compliant' | 'partial' | 'pending';
}

interface PEODPRequirement {
  id: string;
  requirement_number: string;
  description: string;
  criteria: string;
  evidence_required: string[];
  status?: 'met' | 'not_met' | 'partial';
}

interface ComplianceReport {
  id: string;
  vessel_id: string;
  vessel_name: string;
  audit_date: string;
  overall_score: number;
  sections_analyzed: number;
  compliant_sections: number;
  non_conformities: string[];
  recommendations: string[];
  generated_by_ai: boolean;
}

export function useAIPEODP(vesselId?: string) {
  const queryClient = useQueryClient();
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Query: Buscar seções PEO-DP
  const sectionsQuery = useQuery({
    queryKey: ['peo-dp-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('peo_dp_sections')
        .select('*')
        .order('section_number');

      if (error) {
        // Fallback com dados locais
        return getPEODPLocalData();
      }
      return data || getPEODPLocalData();
    },
    staleTime: 60000,
  });

  // Query: Buscar auditorias
  const auditsQuery = useQuery({
    queryKey: ['peo-dp-audits', vesselId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('peo_dp_audits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) return [];
      return data || [];
    },
  });

  // Mutation: Analisar conformidade com IA
  const analyzeComplianceMutation = useMutation({
    mutationFn: async (params: { vesselId: string; vesselName: string; documentData?: any }) => {
      setAnalysisProgress(0);

      const { data, error } = await supabase.functions.invoke('peo-dp-ai', {
        body: {
          action: 'analyze_compliance',
          vesselId: params.vesselId,
          vesselName: params.vesselName,
          documentData: params.documentData,
        },
      });

      if (error) throw error;

      // Simular progresso
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 100));
        setAnalysisProgress(i);
      }

      return data.report as ComplianceReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peo-dp-audits'] });
      toast.success('✅ Análise de conformidade concluída!');
    },
    onError: (error) => {
      toast.error(`Erro na análise: ${error.message}`);
    },
  });

  // Mutation: Gerar relatório PEO-DP
  const generateReportMutation = useMutation({
    mutationFn: async (auditId: string) => {
      const { data, error } = await supabase.functions.invoke('peo-dp-ai', {
        body: {
          action: 'generate_report',
          auditId,
        },
      });

      if (error) throw error;
      return data.report;
    },
    onSuccess: () => {
      toast.success('📄 Relatório gerado com sucesso!');
    },
  });

  // Mutation: Voice chat contextualizado
  const voiceChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const { data, error } = await supabase.functions.invoke('peo-dp-ai', {
        body: {
          action: 'voice_chat',
          message,
          context: 'peo-dp',
        },
      });

      if (error) throw error;
      return data.response as string;
    },
  });

  // Analisar conformidade
  const analyzeCompliance = useCallback(
    async (vesselName: string, documentData?: any) => {
      if (!vesselId) {
        toast.error('Selecione uma embarcação');
        return null;
      }
      return analyzeComplianceMutation.mutateAsync({ vesselId, vesselName, documentData });
    },
    [vesselId, analyzeComplianceMutation]
  );

  // Gerar relatório
  const generateReport = useCallback(
    async (auditId: string) => {
      return generateReportMutation.mutateAsync(auditId);
    },
    [generateReportMutation]
  );

  // Voice chat
  const sendVoiceMessage = useCallback(
    async (message: string) => {
      return voiceChatMutation.mutateAsync(message);
    },
    [voiceChatMutation]
  );

  // Export PDF
  const exportToPDF = useCallback(async (report: ComplianceReport) => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text('Relatório PEO-DP', 20, 20);

      doc.setFontSize(14);
      doc.text(`Embarcação: ${report.vessel_name}`, 20, 40);
      doc.text(`Data: ${new Date(report.audit_date).toLocaleDateString('pt-BR')}`, 20, 50);
      doc.text(`Score: ${report.overall_score}%`, 20, 60);

      doc.setFontSize(12);
      doc.text(`Seções Analisadas: ${report.sections_analyzed}`, 20, 80);
      doc.text(`Seções Conformes: ${report.compliant_sections}`, 20, 90);

      if (report.non_conformities.length > 0) {
        doc.text('Não-Conformidades:', 20, 110);
        report.non_conformities.forEach((nc, i) => {
          doc.text(`- ${nc}`, 25, 120 + i * 10);
        });
      }

      doc.save(`PEO-DP_${report.vessel_name}_${report.audit_date}.pdf`);
      toast.success('PDF exportado!');
    } catch (error) {
      toast.error('Erro ao exportar PDF');
    }
  }, []);

  return {
    // Data
    sections: sectionsQuery.data || [],
    audits: auditsQuery.data || [],

    // Loading
    isLoading: sectionsQuery.isLoading || auditsQuery.isLoading,
    isAnalyzing: analyzeComplianceMutation.isPending,
    analysisProgress,

    // Actions
    analyzeCompliance,
    generateReport,
    sendVoiceMessage,
    exportToPDF,

    // Refetch
    refetch: () => {
      sectionsQuery.refetch();
      auditsQuery.refetch();
    },
  };
}

// Dados locais de fallback
function getPEODPLocalData(): PEODPSection[] {
  return [
    {
      id: '1',
      section_number: '1',
      title: 'Sistema de Gerenciamento de Segurança',
      description: 'Requisitos para SGS conforme ISM Code',
      requirements: [
        { id: '1.1', requirement_number: '1.1', description: 'Política de segurança documentada', criteria: 'Documento assinado pela alta direção', evidence_required: ['Política assinada', 'Comunicação à tripulação'] },
      ],
    },
    {
      id: '2',
      section_number: '2',
      title: 'Responsabilidades da Companhia',
      description: 'Definição de responsabilidades e autoridades',
      requirements: [],
    },
    // ... mais seções
  ];
}

export default useAIPEODP;
