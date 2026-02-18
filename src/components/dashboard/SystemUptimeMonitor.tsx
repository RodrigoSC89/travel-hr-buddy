/**
 * System Uptime Monitor - Wave 21
 * Service health matrix with uptime percentages
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server, CheckCircle2, AlertTriangle, XCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface ServiceHealth {
  id: string;
  name: string;
  status: string;
  uptime: number;
  responseTime: number;
  lastCheck: string;
}

export default function SystemUptimeMonitor() {
  const { data: services = [] } = useQuery({
    queryKey: ['sum-system-status'],
    queryFn: async () => {
      const { data } = await supabase
        .from('system_status')
        .select('id, service_name, status, uptime_percentage, response_time, last_check')
        .order('service_name');
      return (data || []).map((s): ServiceHealth => ({
        id: s.id,
        name: s.service_name || 'Service',
        status: s.status || 'healthy',
        uptime: s.uptime_percentage || 99.9,
        responseTime: s.response_time || 0,
        lastCheck: s.last_check || new Date().toISOString(),
      }));
    },
    staleTime: 30000,
  });

  const globalUptime = useMemo(() => {
    if (!services.length) return 99.9;
    return Math.round(services.reduce((s, svc) => s + svc.uptime, 0) / services.length * 100) / 100;
  }, [services]);

  const healthyCount = services.filter((s) => s.status === 'healthy').length;
  const degradedCount = services.filter((s) => s.status === 'degraded').length;
  const downCount = services.filter((s) => s.status === 'down').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'down': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.5) return 'text-success';
    if (uptime >= 95) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            System Uptime
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className={`text-xs ${getUptimeColor(globalUptime)}`}>
              {globalUptime}% uptime
            </Badge>
            {downCount > 0 && <Badge variant="destructive" className="text-xs">{downCount} down</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary strip */}
        <div className="flex gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1 text-success">
            <CheckCircle2 className="h-3 w-3" /> {healthyCount} Healthy
          </span>
          {degradedCount > 0 && (
            <span className="flex items-center gap-1 text-warning">
              <AlertTriangle className="h-3 w-3" /> {degradedCount} Degraded
            </span>
          )}
          {downCount > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <XCircle className="h-3 w-3" /> {downCount} Down
            </span>
          )}
        </div>

        {services.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Server className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum serviço monitorado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {services.map((svc, i) => (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors"
              >
                {getStatusIcon(svc.status)}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">{svc.name}</span>
                  <span className="text-[10px] text-muted-foreground">{svc.responseTime}ms latency</span>
                </div>
                <div className="w-20 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${svc.uptime >= 99.5 ? 'bg-success' : svc.uptime >= 95 ? 'bg-warning' : 'bg-destructive'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${svc.uptime}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04 }}
                  />
                </div>
                <span className={`text-xs font-bold w-14 text-right ${getUptimeColor(svc.uptime)}`}>
                  {svc.uptime}%
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
