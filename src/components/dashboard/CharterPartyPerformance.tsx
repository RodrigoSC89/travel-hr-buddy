/**
 * Charter Party Performance - Commercial Intelligence
 * Monitors TC/VC hire rates, off-hire days, and P&L performance
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

export function CharterPartyPerformance() {
  const { data: charters = [], isLoading } = useQuery({
    queryKey: ['charter-party-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('charter_parties')
        .select('id, charter_type, vessel_id, charterer_name, hire_rate, commencement_date, redelivery_date, status, freight_currency, total_revenue, total_costs, net_profit, tce_achieved')
        .order('commencement_date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: tcStatements = [] } = useQuery({
    queryKey: ['tc-hire-statements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tc_hire_statements')
        .select('id, charter_party_id, gross_hire, net_hire, off_hire_days, off_hire_amount, period_from, period_to, status')
        .order('period_to', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  if (isLoading) return <Skeleton className="h-80" />;

  const activeCharters = charters.filter(c => c.status === 'active' || c.status === 'in_force');
  const totalGrossHire = tcStatements.reduce((sum, s) => sum + (s.gross_hire || 0), 0);
  const totalOffHireAmount = tcStatements.reduce((sum, s) => sum + (s.off_hire_amount || 0), 0);
  const totalNetHire = tcStatements.reduce((sum, s) => sum + (s.net_hire || 0), 0);
  const avgHireRate = activeCharters.length > 0
    ? activeCharters.reduce((sum, c) => sum + (c.hire_rate || 0), 0) / activeCharters.length
    : 0;
  const totalOffHireDays = tcStatements.reduce((sum, s) => sum + (s.off_hire_days || 0), 0);

  const tcCount = charters.filter(c => c.charter_type === 'time_charter' || c.charter_type === 'TC').length;
  const vcCount = charters.filter(c => c.charter_type === 'voyage_charter' || c.charter_type === 'VC').length;
  const bbCount = charters.filter(c => c.charter_type === 'bareboat' || c.charter_type === 'BB').length;

  const utilizationRate = charters.length > 0
    ? Math.round((activeCharters.length / charters.length) * 100)
    : 0;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Charter Party Performance
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {activeCharters.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Gross Hire
            </p>
            <p className="text-lg font-bold text-success">${totalGrossHire.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <p className="text-xs text-muted-foreground">Net Hire</p>
            <p className="text-lg font-bold text-foreground">${totalNetHire.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Avg Rate/Day
            </p>
            <p className="text-lg font-bold text-primary">${avgHireRate.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Off-Hire Days
            </p>
            <p className="text-lg font-bold text-warning">{totalOffHireDays}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Charter Utilization Rate</span>
            <span className="font-medium">{utilizationRate}%</span>
          </div>
          <Progress value={utilizationRate} className="h-2" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Charter Mix</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground">Time Charter</p>
              <p className="text-sm font-semibold">{tcCount}</p>
            </div>
            <div className="p-2 rounded bg-accent/10 border border-accent/20">
              <p className="text-xs text-muted-foreground">Voyage Charter</p>
              <p className="text-sm font-semibold">{vcCount}</p>
            </div>
            <div className="p-2 rounded bg-muted/50 border border-border/30">
              <p className="text-xs text-muted-foreground">Bareboat</p>
              <p className="text-sm font-semibold">{bbCount}</p>
            </div>
          </div>
        </div>

        {totalOffHireAmount > 0 && (
          <div className="p-2 rounded bg-destructive/5 border border-destructive/10 text-xs">
            <span className="text-muted-foreground">Off-Hire Losses: </span>
            <span className="font-medium text-destructive">${totalOffHireAmount.toLocaleString()}</span>
            <span className="text-muted-foreground"> ({((totalOffHireAmount / Math.max(totalGrossHire, 1)) * 100).toFixed(1)}% of gross)</span>
          </div>
        )}

        {charters.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Cadastre charter parties para ver performance comercial.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default CharterPartyPerformance;
