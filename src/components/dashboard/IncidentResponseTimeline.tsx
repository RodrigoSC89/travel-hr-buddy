/**
 * Incident Response Timeline - Wave 21
 * Real-time SOC/NOC incident feed with severity classification
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, AlertTriangle, CheckCircle2, Clock, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function IncidentResponseTimeline() {
  const { data: alerts = [] } = useQuery({
    queryKey: ['irt-soc-alerts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('soc_alerts')
        .select('id, title, message, severity, source_module, is_acknowledged, acknowledged_at, created_at')
        .order('created_at', { ascending: false })
        .limit(30);
      return data || [];
    },
    staleTime: 20000,
  });

  const stats = useMemo(() => ({
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    unacked: alerts.filter((a) => !a.is_acknowledged).length,
    resolved: alerts.filter((a) => a.is_acknowledged).length,
  }), [alerts]);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return { bg: 'bg-destructive/10 border-l-destructive', icon: <AlertTriangle className="h-4 w-4 text-destructive" />, badge: 'destructive' as const };
      case 'warning': return { bg: 'bg-warning/10 border-l-warning', icon: <Bell className="h-4 w-4 text-warning" />, badge: 'outline' as const };
      default: return { bg: 'bg-muted/30 border-l-muted-foreground', icon: <Clock className="h-4 w-4 text-muted-foreground" />, badge: 'outline' as const };
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Incident Response
          </CardTitle>
          <div className="flex gap-2">
            {stats.critical > 0 && <Badge variant="destructive" className="text-xs">{stats.critical} Críticos</Badge>}
            {stats.unacked > 0 && <Badge variant="outline" className="text-xs bg-warning/10 text-warning">{stats.unacked} Pendentes</Badge>}
            <Badge variant="outline" className="text-xs">{stats.total} total</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
            <p className="text-sm">Nenhum incidente ativo — sistema operacional</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {alerts.slice(0, 15).map((alert, i) => {
              const style = getSeverityStyle(alert.severity || 'info');
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${style.bg} transition-all hover:shadow-sm`}
                >
                  <div className="mt-0.5">{style.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{alert.title || 'Alerta'}</span>
                      {alert.is_acknowledged && <CheckCircle2 className="h-3 w-3 text-success shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      {alert.source_module && <span className="capitalize">{alert.source_module}</span>}
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: ptBR })}</span>
                    </div>
                  </div>
                  <Badge variant={style.badge} className="text-[10px] h-4 shrink-0 capitalize">
                    {alert.severity || 'info'}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
