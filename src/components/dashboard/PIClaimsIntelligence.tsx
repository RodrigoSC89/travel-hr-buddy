/**
 * P&I Claims Intelligence Panel
 * Insurance claims tracking and financial exposure
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Shield, DollarSign, AlertTriangle } from 'lucide-react';

export function PIClaimsIntelligence() {
  const { data: claims = [] } = useQuery({
    queryKey: ['pi-claims-intelligence'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pi_claims')
        .select('id, claim_number, claim_type, status, estimated_amount, paid_amount, recovered_amount, incident_date, vessel_id, priority')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const metrics = React.useMemo(() => {
    const totalClaims = claims.length;
    const openClaims = claims.filter(c => c.status === 'open' || c.status === 'pending' || c.status === 'under_review').length;
    const settledClaims = claims.filter(c => c.status === 'settled' || c.status === 'closed').length;
    const rejectedClaims = claims.filter(c => c.status === 'rejected' || c.status === 'denied').length;

    const totalExposure = claims
      .filter(c => c.status !== 'settled' && c.status !== 'closed' && c.status !== 'rejected')
      .reduce((sum, c) => sum + Number(c.estimated_amount || 0), 0);

    const totalRecovered = claims.reduce((sum, c) => sum + Number(c.recovered_amount || 0), 0);
    const totalEstimated = claims.reduce((sum, c) => sum + Number(c.estimated_amount || 0), 0);
    const recoveryRate = totalEstimated > 0 ? Math.round((totalRecovered / totalEstimated) * 100) : 0;

    const typeMap = new Map<string, number>();
    claims.forEach(c => {
      const type = c.claim_type || 'Other';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    const byType = Array.from(typeMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const severityCounts = {
      critical: claims.filter(c => c.priority === 'critical' || c.priority === 'high').length,
      medium: claims.filter(c => c.priority === 'medium').length,
      low: claims.filter(c => c.priority === 'low' || !c.priority).length,
    };

    return { totalClaims, openClaims, settledClaims, rejectedClaims, totalExposure, totalRecovered, recoveryRate, byType, severityCounts };
  }, [claims]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-info" />
            P&I Claims Intelligence
          </CardTitle>
          <Badge variant="outline" className={metrics.openClaims > 0 ? 'text-warning border-warning/20' : 'text-success border-success/20'}>
            {metrics.openClaims} open
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 text-center">
            <DollarSign className="h-4 w-4 mx-auto mb-1 text-destructive" />
            <div className="text-lg font-bold text-destructive">{formatCurrency(metrics.totalExposure)}</div>
            <div className="text-[10px] text-muted-foreground">Open Exposure</div>
          </div>
          <div className="p-3 rounded-lg bg-success/5 border border-success/10 text-center">
            <DollarSign className="h-4 w-4 mx-auto mb-1 text-success" />
            <div className="text-lg font-bold text-success">{formatCurrency(metrics.totalRecovered)}</div>
            <div className="text-[10px] text-muted-foreground">Recovered</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Total', value: metrics.totalClaims, color: 'text-foreground' },
            { label: 'Open', value: metrics.openClaims, color: 'text-warning' },
            { label: 'Settled', value: metrics.settledClaims, color: 'text-success' },
            { label: 'Rejected', value: metrics.rejectedClaims, color: 'text-destructive' },
          ].map(item => (
            <div key={item.label} className="p-2 rounded-lg bg-muted/30">
              <div className={`text-sm font-bold ${item.color}`}>{item.value}</div>
              <div className="text-[10px] text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
          <span className="text-xs text-muted-foreground">Recovery Rate</span>
          <span className={`text-sm font-bold ${metrics.recoveryRate >= 70 ? 'text-success' : metrics.recoveryRate >= 40 ? 'text-warning' : 'text-destructive'}`}>
            {metrics.recoveryRate}%
          </span>
        </div>

        <div className="flex gap-2">
          {metrics.severityCounts.critical > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {metrics.severityCounts.critical} Critical
            </Badge>
          )}
          {metrics.severityCounts.medium > 0 && (
            <Badge variant="outline" className="text-[10px] text-warning border-warning/20">
              {metrics.severityCounts.medium} Medium
            </Badge>
          )}
          {metrics.severityCounts.low > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {metrics.severityCounts.low} Low
            </Badge>
          )}
        </div>

        {metrics.byType.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">By Type</h4>
            {metrics.byType.map(([type, count]) => (
              <div key={type} className="flex justify-between items-center text-xs">
                <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PIClaimsIntelligence;
