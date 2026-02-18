/**
 * Wave 26: Port Performance Analytics
 * Port call efficiency, turnaround times, and cost analysis
 */
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, Clock, DollarSign, TrendingUp, Anchor, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const PortPerformanceAnalytics: React.FC = () => {
  const { data: portCalls = [], isLoading } = useQuery({
    queryKey: ['port-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('port_calls')
        .select('id, port_name, ata, atd, status, purpose, vessel_id, eta')
        .order('arrival_date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: portCosts = [] } = useQuery({
    queryKey: ['port-cost-estimates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('port_cost_estimates')
        .select('id, port_name, total_estimated, currency, created_at')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const portMetrics = useMemo(() => {
    // Port frequency analysis
    const portFrequency: Record<string, { count: number; totalHours: number; costs: number }> = {};
    
    portCalls.forEach((pc) => {
      const port = pc.port_name || 'Unknown';
      if (!portFrequency[port]) portFrequency[port] = { count: 0, totalHours: 0, costs: 0 };
      portFrequency[port].count++;
      
      if (pc.ata && pc.atd) {
        const hours = (new Date(pc.atd).getTime() - new Date(pc.ata).getTime()) / (1000 * 60 * 60);
        if (hours > 0 && hours < 720) portFrequency[port].totalHours += hours;
      }
    });

    // Add cost data
    portCosts.forEach((cost) => {
      const port = cost.port_name || 'Unknown';
      if (portFrequency[port]) {
        portFrequency[port].costs += cost.total_estimated || 0;
      }
    });

    const sortedPorts = Object.entries(portFrequency)
      .map(([name, data]) => ({
        name,
        calls: data.count,
        avgTurnaround: data.count > 0 ? +(data.totalHours / data.count).toFixed(1) : 0,
        totalCost: data.costs,
      }))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 12);

    const totalCalls = portCalls.length;
    const avgTurnaround = sortedPorts.length > 0
      ? +(sortedPorts.reduce((s, p) => s + p.avgTurnaround, 0) / sortedPorts.filter(p => p.avgTurnaround > 0).length || 0).toFixed(1)
      : 0;
    const totalCosts = portCosts.reduce((s, c) => s + (c.total_estimated || 0), 0);

    return { sortedPorts, totalCalls, avgTurnaround, totalCosts, uniquePorts: Object.keys(portFrequency).length };
  }, [portCalls, portCosts]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Port Performance Analytics</CardTitle>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
            {portMetrics.uniquePorts} ports
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Total Calls', value: portMetrics.totalCalls, icon: Anchor, color: 'text-primary' },
            { label: 'Unique Ports', value: portMetrics.uniquePorts, icon: Building2, color: 'text-blue-400' },
            { label: 'Avg Turn (h)', value: portMetrics.avgTurnaround, icon: Clock, color: 'text-warning' },
            { label: 'Total Cost', value: `$${(portMetrics.totalCosts / 1000).toFixed(0)}k`, icon: DollarSign, color: 'text-success' },
          ].map((kpi) => (
            <div key={kpi.label} className="text-center p-2 rounded-lg bg-muted/30">
              <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
              <div className="text-sm font-bold">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Port Rankings */}
        <ScrollArea className="h-[260px]">
          <div className="space-y-1.5">
            {portMetrics.sortedPorts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum dado de porto disponível
              </div>
            ) : (
              portMetrics.sortedPorts.map((port, idx) => {
                const maxCalls = portMetrics.sortedPorts[0]?.calls || 1;
                const barWidth = (port.calls / maxCalls) * 100;
                
                return (
                  <div key={port.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="text-xs text-muted-foreground w-5 text-right font-mono">#{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">{port.name}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                          <span>{port.calls} calls</span>
                          {port.avgTurnaround > 0 && (
                            <span className="text-warning">{port.avgTurnaround}h avg</span>
                          )}
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary/60 rounded-full transition-all"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Bottom */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Port call frequency analysis</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-success" />
            <span>Real-time data</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortPerformanceAnalytics;
