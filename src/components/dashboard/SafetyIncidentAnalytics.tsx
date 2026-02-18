/**
 * Safety Incident Analytics
 * Trend analysis of safety incidents by type, severity and status
 * Uses safety_incidents for real data
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, TrendingDown, Users } from 'lucide-react';

export function SafetyIncidentAnalytics() {
  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['safety-incident-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('safety_incidents')
        .select('id, title, incident_type, severity, status, incident_date, injuries_count')
        .order('incident_date', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  let openCount = 0;
  let totalInjuries = 0;

  incidents.forEach(i => {
    byType[i.incident_type || 'other'] = (byType[i.incident_type || 'other'] || 0) + 1;
    bySeverity[i.severity || 'low'] = (bySeverity[i.severity || 'low'] || 0) + 1;
    if (i.status === 'open' || i.status === 'investigating') openCount++;
    totalInjuries += i.injuries_count || 0;
  });

  // Monthly trend (last 6 months)
  const now = new Date();
  const months: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('pt-BR', { month: 'short' });
    const count = incidents.filter(inc => {
      const id = new Date(inc.incident_date);
      return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear();
    }).length;
    months.push({ label, count });
  }

  const maxMonth = Math.max(...months.map(m => m.count), 1);
  const trend = months.length >= 2 ? months[months.length - 1].count - months[months.length - 2].count : 0;

  const sevColors: Record<string, string> = {
    critical: 'bg-destructive/15 text-destructive border-destructive/20',
    high: 'bg-warning/15 text-warning border-warning/20',
    medium: 'bg-primary/15 text-primary border-primary/20',
    low: 'bg-success/15 text-success border-success/20',
  };

  if (isLoading) {
    return <Card><CardContent className="p-6"><div className="h-64 animate-pulse bg-muted rounded" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Safety Incident Analytics
          </CardTitle>
          <div className="flex gap-2">
            {openCount > 0 && <Badge variant="destructive" className="text-xs">{openCount} open</Badge>}
            <Badge variant="outline" className="text-xs">{incidents.length} total</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: incidents.length, icon: AlertTriangle, color: 'text-warning' },
            { label: 'Open', value: openCount, icon: Shield, color: 'text-destructive' },
            { label: 'Injuries', value: totalInjuries, icon: Users, color: 'text-destructive' },
            { label: 'Trend', value: `${trend > 0 ? '+' : ''}${trend}`, icon: TrendingDown, color: trend > 0 ? 'text-destructive' : 'text-success' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="text-center p-2 rounded-lg bg-muted/50">
              <Icon className={`h-4 w-4 mx-auto mb-1 ${color}`} />
              <div className="text-lg font-bold">{value}</div>
              <div className="text-[10px] text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* Monthly bar chart */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">6-Month Trend</h4>
          <div className="flex items-end gap-1.5 h-16">
            {months.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-semibold">{m.count}</span>
                <div className="w-full bg-warning/60 rounded-t transition-all" style={{ height: `${(m.count / maxMonth) * 48}px`, minHeight: m.count > 0 ? '4px' : '0' }} />
                <span className="text-[9px] text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Severity breakdown */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">By Severity</h4>
          <div className="flex gap-2">
            {['critical', 'high', 'medium', 'low'].map(sev => (
              <div key={sev} className={`flex-1 text-center p-2 rounded-lg border ${sevColors[sev] || 'bg-muted'}`}>
                <div className="text-lg font-bold">{bySeverity[sev] || 0}</div>
                <div className="text-[10px] capitalize">{sev}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top types */}
        {Object.keys(byType).length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">By Type</h4>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(byType)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([type, count]) => (
                  <Badge key={type} variant="secondary" className="text-xs capitalize">
                    {type.replace(/_/g, ' ')}: {count}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {incidents.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Nenhum incidente de segurança registrado
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SafetyIncidentAnalytics;
