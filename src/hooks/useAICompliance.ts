/**
 * useAICompliance - Hook de IA para Monitoramento de Compliance 24/7
 * Alertas em tempo real, conformidade automática, evidências
 */
import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ComplianceStatus {
  module: string;
  score: number;
  status: 'compliant' | 'at_risk' | 'non_compliant';
  last_check: string;
  open_items: number;
  critical_items: number;
}

interface ComplianceAlert {
  id: string;
  type: 'deadline' | 'expiry' | 'non_conformity' | 'audit_due' | 'document_missing';
  severity: 'info' | 'warning' | 'critical';
  module: string;
  title: string;
  description: string;
  due_date?: string;
  vessel_id?: string;
  vessel_name?: string;
  assigned_to?: string;
  resolved: boolean;
  created_at: string;
}

interface ComplianceEvidence {
  id: string;
  module: string;
  item_reference: string;
  evidence_type: string;
  content: string;
  attachments: string[];
  generated_by_ai: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface ComplianceMetrics {
  overall_score: number;
  modules_compliant: number;
  modules_at_risk: number;
  modules_non_compliant: number;
  open_alerts: number;
  critical_alerts: number;
  trend: 'improving' | 'stable' | 'declining';
}

export function useAICompliance(vesselId?: string) {
  const queryClient = useQueryClient();
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Query: Status de compliance por módulo
  const statusQuery = useQuery({
    queryKey: ['compliance-status', vesselId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_status')
        .select('*')
        .order('score', { ascending: true });

      if (error) return getMockComplianceStatus();
      return data?.length ? data : getMockComplianceStatus();
    },
    refetchInterval: 60000, // Verificar a cada minuto
  });

  // Query: Alertas ativos
  const alertsQuery = useQuery({
    queryKey: ['compliance-alerts', vesselId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_alerts')
        .select('*')
        .eq('resolved', false)
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) return getMockAlerts();
      return data || getMockAlerts();
    },
    refetchInterval: 30000, // Verificar a cada 30s
  });

  // Query: Métricas gerais
  const metricsQuery = useQuery({
    queryKey: ['compliance-metrics', vesselId],
    queryFn: async () => {
      const status = statusQuery.data || [];
      const alerts = alertsQuery.data || [];

      const metrics: ComplianceMetrics = {
        overall_score: status.length
          ? Math.round(status.reduce((sum: number, s: any) => sum + s.score, 0) / status.length)
          : 0,
        modules_compliant: status.filter((s: any) => s.status === 'compliant').length,
        modules_at_risk: status.filter((s: any) => s.status === 'at_risk').length,
        modules_non_compliant: status.filter((s: any) => s.status === 'non_compliant').length,
        open_alerts: alerts.length,
        critical_alerts: alerts.filter((a: any) => a.severity === 'critical').length,
        trend: 'stable',
      };

      return metrics;
    },
    enabled: !!statusQuery.data && !!alertsQuery.data,
  });

  // Mutation: Verificar conformidade com IA
  const checkComplianceMutation = useMutation({
    mutationFn: async (module?: string) => {
      const { data, error } = await supabase.functions.invoke('compliance-ai', {
        body: {
          action: 'check_compliance',
          module,
          vesselId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-status'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-alerts'] });
      toast.success('✅ Verificação de compliance concluída!');
    },
  });

  // Mutation: Gerar evidência automática
  const generateEvidenceMutation = useMutation({
    mutationFn: async (params: { module: string; itemReference: string }): Promise<ComplianceEvidence> => {
      const { data, error } = await supabase.functions.invoke('compliance-ai', {
        body: {
          action: 'generate_evidence',
          ...params,
          vesselId,
        },
      });

      if (error) throw error;
      return data.evidence as ComplianceEvidence;
    },
    onSuccess: () => {
      toast.success('📄 Evidência gerada com sucesso!');
    },
  });

  // Mutation: Resolver alerta
  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('compliance_alerts')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-alerts'] });
      toast.success('✅ Alerta resolvido!');
    },
  });

  // Real-time subscription para alertas críticos
  useEffect(() => {
    if (!isMonitoring) return;

    const channel = supabase
      .channel('compliance-alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'compliance_alerts',
        },
        (payload) => {
          const alert = payload.new as ComplianceAlert;
          if (alert.severity === 'critical') {
            toast.error(`🚨 ALERTA CRÍTICO: ${alert.title}`);
          } else if (alert.severity === 'warning') {
            toast.warning(`⚠️ ${alert.title}`);
          }
          queryClient.invalidateQueries({ queryKey: ['compliance-alerts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isMonitoring, queryClient]);

  // Actions
  const checkCompliance = useCallback(
    async (module?: string) => {
      return checkComplianceMutation.mutateAsync(module);
    },
    [checkComplianceMutation]
  );

  const generateEvidence = useCallback(
    async (module: string, itemReference: string) => {
      return generateEvidenceMutation.mutateAsync({ module, itemReference });
    },
    [generateEvidenceMutation]
  );

  const resolveAlert = useCallback(
    async (alertId: string) => {
      return resolveAlertMutation.mutateAsync(alertId);
    },
    [resolveAlertMutation]
  );

  return {
    // Data
    status: statusQuery.data || [],
    alerts: alertsQuery.data || [],
    metrics: metricsQuery.data,

    // Monitoring
    isMonitoring,
    setIsMonitoring,

    // Actions
    checkCompliance,
    generateEvidence,
    resolveAlert,

    // Loading
    isLoading: statusQuery.isLoading,
    isChecking: checkComplianceMutation.isPending,

    // Refetch
    refetch: () => {
      statusQuery.refetch();
      alertsQuery.refetch();
    },
  };
}

function getMockComplianceStatus(): ComplianceStatus[] {
  return [
    { module: 'PEOTRAM', score: 87, status: 'compliant', last_check: new Date().toISOString(), open_items: 2, critical_items: 0 },
    { module: 'PEO-DP', score: 92, status: 'compliant', last_check: new Date().toISOString(), open_items: 1, critical_items: 0 },
    { module: 'MLC 2006', score: 78, status: 'at_risk', last_check: new Date().toISOString(), open_items: 5, critical_items: 1 },
    { module: 'SGSO', score: 95, status: 'compliant', last_check: new Date().toISOString(), open_items: 0, critical_items: 0 },
    { module: 'ISM Code', score: 65, status: 'at_risk', last_check: new Date().toISOString(), open_items: 8, critical_items: 2 },
    { module: 'STCW', score: 88, status: 'compliant', last_check: new Date().toISOString(), open_items: 3, critical_items: 0 },
  ];
}

function getMockAlerts(): ComplianceAlert[] {
  return [
    {
      id: '1',
      type: 'expiry',
      severity: 'critical',
      module: 'STCW',
      title: 'Certificado STCW expirando',
      description: 'Certificado de João Silva expira em 7 dias',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      vessel_name: 'Nauti Alpha',
      resolved: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'audit_due',
      severity: 'warning',
      module: 'PEOTRAM',
      title: 'Auditoria PEOTRAM pendente',
      description: 'Auditoria do ciclo 2024 deve ser realizada em 15 dias',
      due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      resolved: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      type: 'document_missing',
      severity: 'warning',
      module: 'MLC 2006',
      title: 'Documento faltando',
      description: 'Contrato de trabalho de Maria Costa não encontrado',
      assigned_to: 'RH',
      resolved: false,
      created_at: new Date().toISOString(),
    },
  ];
}

export default useAICompliance;
