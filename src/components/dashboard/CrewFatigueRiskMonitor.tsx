/**
 * Crew Fatigue Risk Monitor
 * MLC 2006 Reg 2.3 work/rest compliance with fatigue risk scoring
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Clock, Users, Shield } from 'lucide-react';

export function CrewFatigueRiskMonitor() {
  const { data: workRestRecords = [] } = useQuery({
    queryKey: ['crew-fatigue-risk'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mlc_work_rest_records')
        .select('crew_member_id, work_hours, rest_hours, record_date, has_violation, vessel_id')
        .order('record_date', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: crewMembers = [] } = useQuery({
    queryKey: ['fatigue-crew-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, vessel_id')
        .eq('status', 'on_board')
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const metrics = React.useMemo(() => {
    const totalRecords = workRestRecords.length;
    const compliant = workRestRecords.filter(r => r.has_violation === false).length;
    const nonCompliant = workRestRecords.filter(r => r.has_violation === true).length;
    const complianceRate = totalRecords > 0 ? Math.round((compliant / totalRecords) * 100) : 100;

    const crewWorkMap = new Map<string, { totalWork: number; totalRest: number; count: number }>();
    workRestRecords.forEach(r => {
      const id = r.crew_member_id || 'unknown';
      const entry = crewWorkMap.get(id) || { totalWork: 0, totalRest: 0, count: 0 };
      entry.totalWork += Number(r.work_hours || 0);
      entry.totalRest += Number(r.rest_hours || 0);
      entry.count += 1;
      crewWorkMap.set(id, entry);
    });

    let highFatigueCount = 0;
    const fatigueAlerts: Array<{ name: string; avgWork: number; avgRest: number; risk: string }> = [];
    crewWorkMap.forEach((val, crewId) => {
      const avgWork = val.totalWork / val.count;
      const avgRest = val.totalRest / val.count;
      if (avgWork > 14 || avgRest < 10) {
        highFatigueCount++;
        const crew = crewMembers.find(c => c.id === crewId);
        fatigueAlerts.push({
          name: crew?.full_name || crewId.slice(0, 8),
          avgWork: Math.round(avgWork * 10) / 10,
          avgRest: Math.round(avgRest * 10) / 10,
          risk: avgWork > 16 || avgRest < 6 ? 'critical' : 'high',
        });
      }
    });

    return { totalRecords, compliant, nonCompliant, complianceRate, highFatigueCount, fatigueAlerts: fatigueAlerts.slice(0, 5), crewOnBoard: crewMembers.length };
  }, [workRestRecords, crewMembers]);

  const riskColor = metrics.complianceRate >= 95 ? 'text-success' : metrics.complianceRate >= 80 ? 'text-warning' : 'text-destructive';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Crew Fatigue Risk Monitor
          </CardTitle>
          <Badge variant="outline" className={`${riskColor} border-current/20`}>
            MLC Reg 2.3
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Shield className="h-4 w-4 mx-auto mb-1 text-primary" />
            <div className={`text-lg font-bold ${riskColor}`}>{metrics.complianceRate}%</div>
            <div className="text-[10px] text-muted-foreground">Compliance</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Users className="h-4 w-4 mx-auto mb-1 text-info" />
            <div className="text-lg font-bold">{metrics.crewOnBoard}</div>
            <div className="text-[10px] text-muted-foreground">On Board</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-destructive" />
            <div className="text-lg font-bold text-destructive">{metrics.highFatigueCount}</div>
            <div className="text-[10px] text-muted-foreground">High Fatigue</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Clock className="h-4 w-4 mx-auto mb-1 text-warning" />
            <div className="text-lg font-bold text-warning">{metrics.nonCompliant}</div>
            <div className="text-[10px] text-muted-foreground">Violations</div>
          </div>
        </div>

        {metrics.fatigueAlerts.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">⚠ Fatigue Alerts</h4>
            {metrics.fatigueAlerts.map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                <div>
                  <span className="text-sm font-medium">{alert.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    Avg {alert.avgWork}h work / {alert.avgRest}h rest
                  </span>
                </div>
                <Badge variant={alert.risk === 'critical' ? 'destructive' : 'outline'} className="text-[10px]">
                  {alert.risk}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            ✅ No fatigue alerts — all crew within MLC limits
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CrewFatigueRiskMonitor;
