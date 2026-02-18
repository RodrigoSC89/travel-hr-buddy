/**
 * Wave 25: Regulatory Change Tracker
 * Monitors IMO/Flag State regulatory changes and compliance deadlines
 */
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Calendar, Globe, Shield, TrendingUp, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface RegulatoryItem {
  id: string;
  framework: string;
  regulation: string;
  status: 'upcoming' | 'active' | 'overdue';
  deadline: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

const RegulatoryChangeTracker: React.FC = () => {
  const { data: auditData = [], isLoading } = useQuery({
    queryKey: ['regulatory-tracker'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internal_audits')
        .select('id, audit_type, status, scheduled_date, department, created_at')
        .order('scheduled_date', { ascending: true })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: ncData = [] } = useQuery({
    queryKey: ['regulatory-ncs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('non_conformities')
        .select('id, category, severity, status, due_date, source')
        .eq('status', 'open')
        .order('due_date', { ascending: true })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const regulations: RegulatoryItem[] = useMemo(() => {
    const items: RegulatoryItem[] = [];
    
    // Map audits to regulatory items
    auditData.forEach((audit) => {
      const deadline = audit.scheduled_date || audit.created_at || new Date().toISOString();
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const isOverdue = deadlineDate < now && audit.status !== 'completed';
      const isUpcoming = deadlineDate > now;
      
      items.push({
        id: audit.id,
        framework: (audit.audit_type || 'ISM').toUpperCase(),
        regulation: audit.department || `${audit.audit_type} Audit`,
        status: isOverdue ? 'overdue' : isUpcoming ? 'upcoming' : 'active',
        deadline: deadline!,
        impact: isOverdue ? 'high' : 'medium',
        description: `Auditoria ${audit.audit_type} - ${audit.status}`,
      });
    });

    // Map NCs to regulatory items
    ncData.forEach((nc) => {
      items.push({
        id: nc.id,
        framework: (nc.source || nc.category || 'QHSE').toUpperCase(),
        regulation: `NC ${nc.category}: ${nc.severity}`,
        status: 'active',
        deadline: nc.due_date || new Date().toISOString(),
        impact: nc.severity === 'major' ? 'high' : nc.severity === 'minor' ? 'low' : 'medium',
        description: `Non-conformity - ${nc.status}`,
      });
    });

    return items.sort((a, b) => {
      const priority = { overdue: 0, active: 1, upcoming: 2 };
      return priority[a.status] - priority[b.status];
    });
  }, [auditData, ncData]);

  const stats = useMemo(() => ({
    overdue: regulations.filter(r => r.status === 'overdue').length,
    active: regulations.filter(r => r.status === 'active').length,
    upcoming: regulations.filter(r => r.status === 'upcoming').length,
    highImpact: regulations.filter(r => r.impact === 'high').length,
  }), [regulations]);

  const statusConfig = {
    overdue: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertTriangle },
    active: { color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
    upcoming: { color: 'bg-primary/10 text-primary border-primary/20', icon: Calendar },
  };

  const impactColor = {
    high: 'bg-destructive/10 text-destructive',
    medium: 'bg-warning/10 text-warning',
    low: 'bg-muted text-muted-foreground',
  };

  if (isLoading) return <Skeleton className="h-[400px]" />;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Regulatory Change Tracker</CardTitle>
          </div>
          <div className="flex gap-1.5">
            {stats.overdue > 0 && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive text-xs">
                {stats.overdue} overdue
              </Badge>
            )}
            <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
              {stats.upcoming} upcoming
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary KPIs */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-destructive' },
            { label: 'Active', value: stats.active, icon: Shield, color: 'text-warning' },
            { label: 'Upcoming', value: stats.upcoming, icon: Calendar, color: 'text-primary' },
            { label: 'High Impact', value: stats.highImpact, icon: TrendingUp, color: 'text-destructive' },
          ].map((kpi) => (
            <div key={kpi.label} className="text-center p-2 rounded-lg bg-muted/30">
              <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
              <div className="text-xl font-bold">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Regulatory Items List */}
        <ScrollArea className="h-[260px]">
          <div className="space-y-2">
            {regulations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhuma regulamentação pendente encontrada
              </div>
            ) : (
              regulations.map((item) => {
                const config = statusConfig[item.status];
                const StatusIcon = config.icon;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors">
                    <StatusIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{item.regulation}</span>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${impactColor[item.impact]}`}>
                          {item.impact}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{item.framework}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.deadline).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${config.color}`}>
                      {item.status}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RegulatoryChangeTracker;
