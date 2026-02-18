/**
 * Integration Health Dashboard — Full real-time monitoring panel
 * Shows event outbox stats, integration health, and audit activity
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, CheckCircle, AlertTriangle, XCircle, Zap, Clock, RefreshCw, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface HealthRecord {
  id: string;
  service_name: string;
  status: string;
  last_check_at: string;
  error_count: number;
  metadata: Record<string, unknown> | null;
}

const statusConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  healthy: { icon: <CheckCircle className="h-4 w-4 text-primary" />, label: 'Saudável' },
  degraded: { icon: <AlertTriangle className="h-4 w-4 text-destructive" />, label: 'Degradado' },
  down: { icon: <XCircle className="h-4 w-4 text-destructive" />, label: 'Offline' },
};

export default function IntegrationHealthDashboard() {
  // Fetch integration health records
  const { data: healthRecords = [], refetch: refetchHealth } = useQuery({
    queryKey: ['integration-health'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('integration_health')
        .select('*')
        .order('last_check_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as HealthRecord[];
    },
    refetchInterval: 30000,
  });

  // Fetch event outbox stats
  const { data: outboxStats } = useQuery({
    queryKey: ['outbox-stats'],
    queryFn: async () => {
      const [pending, processed, failed] = await Promise.all([
        (supabase.from as Function)('event_outbox').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        (supabase.from as Function)('event_outbox').select('id', { count: 'exact', head: true }).eq('status', 'processed'),
        (supabase.from as Function)('event_outbox').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
      ]);
      return {
        pending: pending.count ?? 0,
        processed: processed.count ?? 0,
        failed: failed.count ?? 0,
        total: (pending.count ?? 0) + (processed.count ?? 0) + (failed.count ?? 0),
      };
    },
    refetchInterval: 15000,
  });

  // Fetch recent audit events
  const { data: recentAudits = [] } = useQuery({
    queryKey: ['recent-audit-events-dashboard'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('audit_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30000,
  });

  // Fetch event subscriptions
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['event-subscriptions'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('event_subscriptions')
        .select('*')
        .eq('enabled', true);
      if (error) throw error;
      return data ?? [];
    },
  });

  const handleTriggerDispatcher = async () => {
    try {
      const { error } = await supabase.functions.invoke('event-dispatcher', { method: 'POST' });
      if (error) throw error;
      toast.success('Event dispatcher executado com sucesso');
      refetchHealth();
    } catch {
      toast.error('Falha ao executar event dispatcher');
    }
  };

  const healthyCount = healthRecords.filter(r => r.status === 'healthy').length;
  const totalServices = healthRecords.length;
  const healthPercent = totalServices > 0 ? Math.round((healthyCount / totalServices) * 100) : 100;
  const processRate = outboxStats?.total ? Math.round((outboxStats.processed / outboxStats.total) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saúde Geral</p>
                <p className="text-2xl font-bold">{healthPercent}%</p>
              </div>
              <Activity className="h-8 w-8 text-primary opacity-80" />
            </div>
            <Progress value={healthPercent} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eventos Pendentes</p>
                <p className="text-2xl font-bold">{outboxStats?.pending ?? 0}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {outboxStats?.processed ?? 0} processados · {outboxStats?.failed ?? 0} falhos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Processamento</p>
                <p className="text-2xl font-bold">{processRate}%</p>
              </div>
              <Zap className="h-8 w-8 text-primary opacity-80" />
            </div>
            <Progress value={processRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consumers Ativos</p>
                <p className="text-2xl font-bold">{subscriptions.length}</p>
              </div>
              <Database className="h-8 w-8 text-primary opacity-80" />
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={handleTriggerDispatcher}>
              <RefreshCw className="h-3 w-3 mr-1" /> Executar Dispatcher
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integration Services Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" /> Status dos Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum serviço registrado ainda. Execute o dispatcher para iniciar.</p>
            ) : (
              <div className="space-y-3">
                {healthRecords.map((record) => {
                  const config = statusConfig[record.status] || statusConfig.down;
                  return (
                    <div key={record.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        {config.icon}
                        <span className="text-sm font-medium">{record.service_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{config.label}</Badge>
                        {record.error_count > 0 && (
                          <Badge variant="destructive" className="text-xs">{record.error_count} erros</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Audit Trail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4" /> Audit Trail Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAudits.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum evento de auditoria registrado ainda.</p>
            ) : (
              <div className="space-y-2">
                {recentAudits.map((audit: Record<string, unknown>) => (
                  <div key={audit.id as string} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
                    <div>
                      <span className="font-medium">{audit.action as string}</span>
                      <span className="text-muted-foreground ml-2">
                        {audit.entity_type as string}{audit.entity_id ? ` #${(audit.entity_id as string).slice(0, 8)}` : ''}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(audit.created_at as string).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
