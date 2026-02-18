/**
 * Wave 45 - SATCOM Performance Monitor
 * Uses satcom_links (provider, bandwidth_kbps, latency_ms, signal_strength, status, vessel_id)
 * and satcom_connection_status (bandwidth_available_kbps, latency_ms, signal_quality, is_connected, vessel_id)
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Radio, Wifi, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

export default function SATCOMPerformanceMonitor() {
  const { data: satcomLinks = [], isLoading } = useQuery({
    queryKey: ['satcom-links-perf'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('satcom_links')
        .select('id, vessel_id, provider, bandwidth_kbps, latency_ms, signal_strength, status, name, is_primary')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: connStatus = [] } = useQuery({
    queryKey: ['satcom-conn-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('satcom_connection_status')
        .select('id, vessel_id, bandwidth_available_kbps, latency_ms, signal_quality, is_connected')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const metrics = useMemo(() => {
    if (satcomLinks.length === 0 && connStatus.length === 0) return null;

    const avgLatency = satcomLinks.filter(l => l.latency_ms).reduce((s, l) => s + (l.latency_ms || 0), 0) / (satcomLinks.filter(l => l.latency_ms).length || 1);
    const avgSignal = satcomLinks.filter(l => l.signal_strength).reduce((s, l) => s + (l.signal_strength || 0), 0) / (satcomLinks.filter(l => l.signal_strength).length || 1);
    const avgBandwidth = satcomLinks.filter(l => l.bandwidth_kbps).reduce((s, l) => s + (l.bandwidth_kbps || 0), 0) / (satcomLinks.filter(l => l.bandwidth_kbps).length || 1);

    const connectedCount = connStatus.filter(c => c.is_connected).length;
    const uptimePercent = connStatus.length > 0 ? (connectedCount / connStatus.length) * 100 : 0;

    // Provider breakdown
    const providers: Record<string, number> = {};
    satcomLinks.forEach(l => {
      providers[l.provider] = (providers[l.provider] || 0) + 1;
    });

    // Status breakdown
    const statuses: Record<string, number> = {};
    satcomLinks.forEach(l => {
      statuses[l.status] = (statuses[l.status] || 0) + 1;
    });

    return {
      avgLatency: Math.round(avgLatency),
      avgSignal: Math.round(avgSignal),
      avgBandwidth: Math.round(avgBandwidth),
      uptimePercent: Math.round(uptimePercent),
      providers,
      statuses,
      totalLinks: satcomLinks.length,
      uniqueVessels: new Set([...satcomLinks.map(l => l.vessel_id), ...connStatus.map(c => c.vessel_id)].filter(Boolean)).size,
    };
  }, [satcomLinks, connStatus]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-hub-tracking" />
            <CardTitle className="text-lg">SATCOM Performance</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {metrics?.uniqueVessels || 0} embarcações
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!metrics ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado SATCOM disponível.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Wifi className="h-3.5 w-3.5 text-success" />
                  <span className="text-[10px] text-muted-foreground">Uptime</span>
                </div>
                <p className="text-xl font-bold">{metrics.uptimePercent}%</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Activity className="h-3.5 w-3.5 text-warning" />
                  <span className="text-[10px] text-muted-foreground">Latência</span>
                </div>
                <p className="text-xl font-bold">{metrics.avgLatency} ms</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Bandwidth Médio</p>
                <p className="text-lg font-bold">{metrics.avgBandwidth} kbps</p>
              </div>
              <div className="flex-1 bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Sinal Médio</p>
                <p className="text-lg font-bold">{metrics.avgSignal}%</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium mb-2 text-muted-foreground">Provedores</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(metrics.providers).map(([provider, count]) => (
                  <Badge key={provider} variant="secondary" className="text-[10px]">
                    {provider}: {count}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium mb-2 text-muted-foreground">Status dos Links</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(metrics.statuses).map(([status, count]) => (
                  <Badge
                    key={status}
                    variant="outline"
                    className={`text-[10px] ${
                      status === 'active' || status === 'online' ? 'border-success/40 text-success' :
                      status === 'degraded' ? 'border-warning/40 text-warning' :
                      'border-destructive/40 text-destructive'
                    }`}
                  >
                    {status}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
