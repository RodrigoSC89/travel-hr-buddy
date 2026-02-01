/**
 * useAICompliance - Hook de IA para Monitoramento de Compliance 24/7
 * Alertas em tempo real, conformidade automática, evidências
 * PATCH: Removed mock fallbacks and as any casts
 */
import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

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

export interface UseAIComplianceReturn {
  status: ComplianceStatus[];
  alerts: ComplianceAlert[];
  metrics: ComplianceMetrics | undefined;
  isMonitoring: boolean;
  setIsMonitoring: (value: boolean) => void;
  checkCompliance: (module?: string) => Promise<unknown>;
  generateEvidence: (module: string, itemReference: string) => Promise<ComplianceEvidence>;
  resolveAlert: (alertId: string) => Promise<void>;
  isLoading: boolean;
  isChecking: boolean;
  isEmpty: boolean;
  hasError: boolean;
  refetch: () => void;
}

export function useAICompliance(vesselId?: string): UseAIComplianceReturn {
  const queryClient = useQueryClient();
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Query: Status de compliance por módulo - usando tabela existente
  const statusQuery = useQuery({
    queryKey: ['compliance-status', vesselId],
    queryFn: async (): Promise<ComplianceStatus[]> => {
      // Try to get from ai_behavior_snapshots as compliance metrics source
      const { data, error } = await supabase
        .from('ai_behavior_snapshots')
        .select('module_name, accuracy_score, behavior_type, snapshot_date')
        .order('snapshot_date', { ascending: false })
        .limit(20);

      if (error) {
        logger.warn('[useAICompliance] Error fetching compliance status', { error: error.message });
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Transform AI behavior data into compliance status
      const moduleMap = new Map<string, ComplianceStatus>();
      
      for (const record of data) {
        if (!moduleMap.has(record.module_name)) {
          const score = Math.round((record.accuracy_score || 0.75) * 100);
          moduleMap.set(record.module_name, {
            module: record.module_name,
            score,
            status: score >= 85 ? 'compliant' : score >= 60 ? 'at_risk' : 'non_compliant',
            last_check: record.snapshot_date,
            open_items: score < 85 ? Math.floor((100 - score) / 10) : 0,
            critical_items: score < 60 ? 1 : 0,
          });
        }
      }

      return Array.from(moduleMap.values());
    },
    refetchInterval: 60000,
  });

  // Query: Alertas ativos - usando soc_alerts
  const alertsQuery = useQuery({
    queryKey: ['compliance-alerts', vesselId],
    queryFn: async (): Promise<ComplianceAlert[]> => {
      let query = supabase
        .from('soc_alerts')
        .select('*')
        .eq('status', 'open')
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (vesselId) {
        query = query.eq('vessel_id', vesselId);
      }

      const { data, error } = await query;

      if (error) {
        logger.warn('[useAICompliance] Error fetching alerts', { error: error.message });
        return [];
      }

      if (!data) return [];

      type SocAlertRow = typeof data[number];

      return data.map((alert: SocAlertRow) => ({
        id: alert.id,
        type: (alert.alert_type as ComplianceAlert['type']) || 'non_conformity',
        severity: (alert.severity as ComplianceAlert['severity']) || 'warning',
        module: alert.source_module || 'general',
        title: alert.title,
        description: alert.message || '',
        vessel_id: alert.vessel_id || undefined,
        resolved: alert.is_acknowledged || false,
        created_at: alert.created_at,
      }));
    },
    refetchInterval: 30000,
  });

  // Query: Métricas gerais
  const metricsQuery = useQuery({
    queryKey: ['compliance-metrics', vesselId],
    queryFn: async (): Promise<ComplianceMetrics> => {
      const status = statusQuery.data || [];
      const alerts = alertsQuery.data || [];

      return {
        overall_score: status.length
          ? Math.round(status.reduce((sum, s) => sum + s.score, 0) / status.length)
          : 0,
        modules_compliant: status.filter((s) => s.status === 'compliant').length,
        modules_at_risk: status.filter((s) => s.status === 'at_risk').length,
        modules_non_compliant: status.filter((s) => s.status === 'non_compliant').length,
        open_alerts: alerts.length,
        critical_alerts: alerts.filter((a) => a.severity === 'critical').length,
        trend: 'stable',
      };
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
    onError: (error) => {
      logger.error('[useAICompliance] Check compliance failed', error);
      toast.error('Erro ao verificar compliance');
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
    onError: (error) => {
      logger.error('[useAICompliance] Generate evidence failed', error);
      toast.error('Erro ao gerar evidência');
    },
  });

  // Mutation: Resolver alerta
  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('soc_alerts')
        .update({ 
          status: 'resolved', 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-alerts'] });
      toast.success('✅ Alerta resolvido!');
    },
    onError: (error) => {
      logger.error('[useAICompliance] Resolve alert failed', error);
      toast.error('Erro ao resolver alerta');
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
          table: 'soc_alerts',
        },
        (payload) => {
          const alert = payload.new as { severity?: string; title?: string };
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

    // Status flags
    isEmpty: (statusQuery.data?.length || 0) === 0,
    hasError: !!statusQuery.error || !!alertsQuery.error,

    // Refetch
    refetch: () => {
      statusQuery.refetch();
      alertsQuery.refetch();
    },
  };
}

export default useAICompliance;
