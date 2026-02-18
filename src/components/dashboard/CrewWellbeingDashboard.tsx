/**
 * Crew Wellbeing Intelligence Dashboard
 * Wave 17 - Real-time fatigue & burnout risk matrix
 * Data source: crew_wellbeing_predictions + crew_members
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Heart, AlertTriangle, Shield, TrendingDown, Brain, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const getRiskColor = (score: number) => {
  if (score >= 80) return 'text-destructive';
  if (score >= 60) return 'text-warning';
  if (score >= 40) return 'text-amber-500';
  return 'text-success';
};

const getRiskBg = (score: number) => {
  if (score >= 80) return 'bg-destructive/10 border-destructive/30';
  if (score >= 60) return 'bg-warning/10 border-warning/30';
  if (score >= 40) return 'bg-amber-500/10 border-amber-500/30';
  return 'bg-success/10 border-success/30';
};

const getRiskLabel = (score: number) => {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
};

export default function CrewWellbeingDashboard() {
  const { data: wellbeingData, isLoading: loadingWellbeing } = useQuery({
    queryKey: ['crew-wellbeing-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_wellbeing_predictions')
        .select('id, crew_member_id, fatigue_risk_score, burnout_risk_score, mental_health_score, overall_wellbeing_score, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: crewMembers, isLoading: loadingCrew } = useQuery({
    queryKey: ['crew-members-wellbeing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, status');
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const analytics = useMemo(() => {
    if (!wellbeingData || wellbeingData.length === 0) {
      return {
        avgFatigue: 0, avgBurnout: 0, criticalCount: 0, healthyCount: 0,
        crewRisks: [] as { name: string; rank: string; fatigue: number; burnout: number }[],
      };
    }

    const latestByMember = new Map<string, typeof wellbeingData[0]>();
    wellbeingData.forEach(r => {
      const key = r.crew_member_id || r.id;
      if (!latestByMember.has(key)) latestByMember.set(key, r);
    });

    const records = Array.from(latestByMember.values());
    const avgFatigue = records.reduce((s, r) => s + (r.fatigue_risk_score || 0), 0) / records.length;
    const avgBurnout = records.reduce((s, r) => s + (r.burnout_risk_score || 0), 0) / records.length;
    const criticalCount = records.filter(r => (r.fatigue_risk_score || 0) >= 80 || (r.burnout_risk_score || 0) >= 80).length;
    const healthyCount = records.filter(r => (r.fatigue_risk_score || 0) < 40 && (r.burnout_risk_score || 0) < 40).length;

    const crewMap = new Map(crewMembers?.map(c => [c.id, c]) || []);
    const crewRisks = records
      .map(r => {
        const member = crewMap.get(r.crew_member_id || '');
        return {
          name: member?.full_name || 'Unknown',
          rank: member?.rank || 'N/A',
          fatigue: r.fatigue_risk_score || 0,
          burnout: r.burnout_risk_score || 0,
        };
      })
      .sort((a, b) => (b.fatigue + b.burnout) - (a.fatigue + a.burnout));

    return { avgFatigue, avgBurnout, criticalCount, healthyCount, crewRisks };
  }, [wellbeingData, crewMembers]);

  const isLoading = loadingWellbeing || loadingCrew;

  if (isLoading) return <Skeleton className="h-[500px] w-full rounded-xl" />;

  const kpis = [
    { label: 'Avg Fatigue Risk', value: analytics.avgFatigue, icon: TrendingDown, color: getRiskColor(analytics.avgFatigue) },
    { label: 'Avg Burnout Risk', value: analytics.avgBurnout, icon: Brain, color: getRiskColor(analytics.avgBurnout) },
    { label: 'Critical Alerts', value: analytics.criticalCount, icon: AlertTriangle, color: analytics.criticalCount > 0 ? 'text-destructive' : 'text-success', isCount: true },
    { label: 'Healthy Crew', value: analytics.healthyCount, icon: Shield, color: 'text-success', isCount: true },
  ];

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg">Crew Wellbeing Intelligence</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">{analytics.crewRisks.length} monitored</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="text-center p-3 rounded-lg bg-muted/30 border border-border/30">
              <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
              <div className={`text-xl font-bold ${kpi.color}`}>{kpi.isCount ? kpi.value : `${kpi.value.toFixed(0)}%`}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-2 max-h-[280px] overflow-y-auto">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">Risk Matrix by Crew Member</div>
          {analytics.crewRisks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No wellbeing data available yet
            </div>
          ) : (
            analytics.crewRisks.slice(0, 8).map((crew, i) => (
              <motion.div key={`${crew.name}-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-2.5 rounded-lg border ${getRiskBg(Math.max(crew.fatigue, crew.burnout))}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{crew.name}</span>
                    <Badge variant="secondary" className="text-[10px] h-4">{crew.rank}</Badge>
                  </div>
                  <div className="flex gap-4 mt-1.5">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                        <span>Fatigue</span><span className={getRiskColor(crew.fatigue)}>{crew.fatigue}%</span>
                      </div>
                      <Progress value={crew.fatigue} className="h-1.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                        <span>Burnout</span><span className={getRiskColor(crew.burnout)}>{crew.burnout}%</span>
                      </div>
                      <Progress value={crew.burnout} className="h-1.5" />
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] ${getRiskColor(Math.max(crew.fatigue, crew.burnout))}`}>
                  {getRiskLabel(Math.max(crew.fatigue, crew.burnout))}
                </Badge>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
