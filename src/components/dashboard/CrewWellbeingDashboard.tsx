/**
 * Crew Wellbeing Intelligence Dashboard v3
 * Real-time fatigue & burnout risk matrix + trend charts + predictive alerts
 */
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Heart, AlertTriangle, Shield, TrendingDown, Brain, Activity, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

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
  });

  const metrics = useMemo(() => {
    if (!wellbeingData?.length) return null;
    const latest = new Map<string, typeof wellbeingData[0]>();
    wellbeingData.forEach(w => { if (!latest.has(w.crew_member_id || '')) latest.set(w.crew_member_id || '', w); });
    const records = Array.from(latest.values());
    const avgFatigue = records.reduce((s, r) => s + (r.fatigue_risk_score || 0), 0) / records.length;
    const avgBurnout = records.reduce((s, r) => s + (r.burnout_risk_score || 0), 0) / records.length;
    const avgMental = records.reduce((s, r) => s + (r.mental_health_score || 0), 0) / records.length;
    const avgWellbeing = records.reduce((s, r) => s + (r.overall_wellbeing_score || 0), 0) / records.length;
    const critical = records.filter(r => (r.fatigue_risk_score || 0) >= 80 || (r.burnout_risk_score || 0) >= 80).length;
    const high = records.filter(r => {
      const f = r.fatigue_risk_score || 0; const b = r.burnout_risk_score || 0;
      return (f >= 60 && f < 80) || (b >= 60 && b < 80);
    }).length;

    // Radar data
    const radarData = [
      { dim: 'Fatigue', value: Math.round(100 - avgFatigue), fullMark: 100 },
      { dim: 'Burnout', value: Math.round(100 - avgBurnout), fullMark: 100 },
      { dim: 'Mental', value: Math.round(avgMental), fullMark: 100 },
      { dim: 'Wellbeing', value: Math.round(avgWellbeing), fullMark: 100 },
      { dim: 'Morale', value: Math.round((avgMental + avgWellbeing) / 2), fullMark: 100 },
      { dim: 'Resilience', value: Math.round(100 - (avgFatigue + avgBurnout) / 2), fullMark: 100 },
    ];

    // Risk distribution for bar chart
    const riskDist = [
      { level: 'Low', count: records.filter(r => (r.fatigue_risk_score || 0) < 40).length, fill: 'hsl(var(--success))' },
      { level: 'Moderate', count: records.filter(r => (r.fatigue_risk_score || 0) >= 40 && (r.fatigue_risk_score || 0) < 60).length, fill: 'hsl(var(--warning))' },
      { level: 'High', count: records.filter(r => (r.fatigue_risk_score || 0) >= 60 && (r.fatigue_risk_score || 0) < 80).length, fill: 'hsl(210, 70%, 55%)' },
      { level: 'Critical', count: records.filter(r => (r.fatigue_risk_score || 0) >= 80).length, fill: 'hsl(var(--destructive))' },
    ];

    // Top risk crew
    const topRisk = records
      .map(r => {
        const crew = crewMembers?.find(c => c.id === r.crew_member_id);
        return { name: crew?.full_name || 'Unknown', rank: crew?.rank || '', fatigue: r.fatigue_risk_score || 0, burnout: r.burnout_risk_score || 0 };
      })
      .sort((a, b) => (b.fatigue + b.burnout) - (a.fatigue + a.burnout))
      .slice(0, 5);

    return { total: records.length, avgFatigue, avgBurnout, avgMental, avgWellbeing, critical, high, radarData, riskDist, topRisk };
  }, [wellbeingData, crewMembers]);

  if (loadingWellbeing || loadingCrew) return <Skeleton className="h-[500px]" />;

  if (!metrics) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-8 text-center">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nenhum dado de bem-estar disponível.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg">Crew Wellbeing Intelligence v3</CardTitle>
          </div>
          <div className="flex gap-1.5">
            {metrics.critical > 0 && <Badge variant="destructive">{metrics.critical} Critical</Badge>}
            {metrics.high > 0 && <Badge className="bg-warning/20 text-warning border-warning/30">{metrics.high} High</Badge>}
            <Badge variant="outline">{metrics.total} crew</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Avg Fatigue', value: metrics.avgFatigue.toFixed(0), icon: Activity, color: getRiskColor(metrics.avgFatigue) },
            { label: 'Avg Burnout', value: metrics.avgBurnout.toFixed(0), icon: Brain, color: getRiskColor(metrics.avgBurnout) },
            { label: 'Mental Health', value: metrics.avgMental.toFixed(0), icon: Shield, color: metrics.avgMental > 60 ? 'text-success' : 'text-warning' },
            { label: 'Overall', value: metrics.avgWellbeing.toFixed(0), icon: Heart, color: metrics.avgWellbeing > 60 ? 'text-success' : 'text-warning' },
          ].map(k => (
            <div key={k.label} className="bg-muted/50 rounded-lg p-3 text-center">
              <k.icon className={`h-4 w-4 mx-auto mb-1 ${k.color}`} />
              <p className="text-lg font-bold">{k.value}%</p>
              <p className="text-[10px] text-muted-foreground">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Radar + Risk Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium mb-2 text-muted-foreground">Wellbeing Radar</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={metrics.radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-xs font-medium mb-2 text-muted-foreground">Fatigue Risk Distribution</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={metrics.riskDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="level" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Crew">
                  {metrics.riskDist.map((entry, i) => (
                    <motion.rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Risk Crew */}
        {metrics.topRisk.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2 text-muted-foreground">⚠️ Highest Risk Crew</p>
            <div className="space-y-2">
              {metrics.topRisk.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className={`flex items-center justify-between p-2 rounded-lg border ${getRiskBg(Math.max(c.fatigue, c.burnout))}`}>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{c.name}</span>
                    {c.rank && <Badge variant="outline" className="text-[9px]">{c.rank}</Badge>}
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span>Fatigue: <strong className={getRiskColor(c.fatigue)}>{c.fatigue}%</strong></span>
                    <span>Burnout: <strong className={getRiskColor(c.burnout)}>{c.burnout}%</strong></span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
