/**
 * STCW Competency Gap Analyzer
 * Wave 17 - Certification & skill gap tracking
 * Data source: crew_certifications + crew_competency_matrix
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, AlertCircle, CheckCircle2, Clock, Award, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInDays } from 'date-fns';

// Map string levels to numeric for gap calculation
const levelToNum = (level: string | null): number => {
  if (!level) return 0;
  const map: Record<string, number> = {
    'none': 0, 'basic': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4,
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
  };
  return map[level.toLowerCase()] ?? (parseInt(level) || 0);
};

export default function CompetencyGapAnalyzer() {
  const { data: certifications, isLoading: loadingCerts } = useQuery({
    queryKey: ['crew-certs-gap-analyzer'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_certifications')
        .select('id, crew_member_id, certification_name, expiry_date, status')
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
  });

  const { data: competencies, isLoading: loadingComp } = useQuery({
    queryKey: ['crew-competency-gap'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_competency_matrix')
        .select('id, crew_member_id, competency_name, current_level, required_level, assessment_date')
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
  });

  const analytics = useMemo(() => {
    const now = new Date();
    const certs = certifications || [];
    const comps = competencies || [];

    const expiredCerts = certs.filter(c => c.expiry_date && new Date(c.expiry_date) < now);
    const expiringSoon = certs.filter(c => {
      if (!c.expiry_date) return false;
      const days = differenceInDays(new Date(c.expiry_date), now);
      return days >= 0 && days <= 90;
    });
    const validCerts = certs.filter(c => c.expiry_date && new Date(c.expiry_date) > now);
    const certCompliance = certs.length > 0 ? (validCerts.length / certs.length) * 100 : 100;

    const gapRecords = comps.filter(c => levelToNum(c.current_level) < levelToNum(c.required_level));
    const criticalGaps = gapRecords.filter(c => (levelToNum(c.required_level) - levelToNum(c.current_level)) >= 2);
    const avgCoverage = comps.length > 0
      ? comps.reduce((s, c) => s + Math.min((levelToNum(c.current_level) / Math.max(levelToNum(c.required_level), 1)) * 100, 100), 0) / comps.length
      : 100;

    const gapsByCompetency = new Map<string, { gap: number; count: number }>();
    gapRecords.forEach(g => {
      const name = g.competency_name || 'Unknown';
      const existing = gapsByCompetency.get(name) || { gap: 0, count: 0 };
      existing.gap += levelToNum(g.required_level) - levelToNum(g.current_level);
      existing.count++;
      gapsByCompetency.set(name, existing);
    });

    const topGaps = Array.from(gapsByCompetency.entries())
      .map(([name, data]) => ({ name, avgGap: data.gap / data.count, count: data.count }))
      .sort((a, b) => b.avgGap - a.avgGap)
      .slice(0, 6);

    return {
      totalCerts: certs.length, expiredCount: expiredCerts.length,
      expiringCount: expiringSoon.length, certCompliance,
      criticalGaps: criticalGaps.length, avgCoverage, topGaps,
    };
  }, [certifications, competencies]);

  const isLoading = loadingCerts || loadingComp;
  if (isLoading) return <Skeleton className="h-[500px] w-full rounded-xl" />;

  const kpis = [
    { label: 'Cert Compliance', value: `${analytics.certCompliance.toFixed(0)}%`, icon: Award, color: analytics.certCompliance >= 90 ? 'text-success' : 'text-warning' },
    { label: 'Expired Certs', value: analytics.expiredCount, icon: ShieldAlert, color: analytics.expiredCount > 0 ? 'text-destructive' : 'text-success' },
    { label: 'Expiring ≤90d', value: analytics.expiringCount, icon: Clock, color: analytics.expiringCount > 0 ? 'text-warning' : 'text-success' },
    { label: 'Skill Coverage', value: `${analytics.avgCoverage.toFixed(0)}%`, icon: GraduationCap, color: analytics.avgCoverage >= 80 ? 'text-success' : 'text-warning' },
  ];

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">STCW Competency & Certification Analyzer</CardTitle>
          </div>
          <div className="flex gap-1.5">
            {analytics.criticalGaps > 0 && (
              <Badge variant="destructive" className="text-[10px] animate-pulse">{analytics.criticalGaps} Critical Gaps</Badge>
            )}
            <Badge variant="outline" className="text-xs">{analytics.totalCerts} certs</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="text-center p-3 rounded-lg bg-muted/30 border border-border/30">
              <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
              <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-2 max-h-[280px] overflow-y-auto">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">Top Competency Gaps (STCW)</div>
          {analytics.topGaps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success opacity-60" />
              All competency requirements met
            </div>
          ) : (
            analytics.topGaps.map((gap, i) => {
              const severity = gap.avgGap >= 2 ? 'critical' : gap.avgGap >= 1 ? 'high' : 'moderate';
              const colors = {
                critical: 'border-destructive/30 bg-destructive/5',
                high: 'border-warning/30 bg-warning/5',
                moderate: 'border-amber-500/30 bg-amber-500/5',
              };
              return (
                <motion.div key={gap.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border ${colors[severity]}`}>
                  <AlertCircle className={`h-4 w-4 shrink-0 ${severity === 'critical' ? 'text-destructive' : severity === 'high' ? 'text-warning' : 'text-amber-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{gap.name}</span>
                      <span className="text-xs text-muted-foreground">{gap.count} crew</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={Math.max(100 - gap.avgGap * 25, 10)} className="h-1.5 flex-1" />
                      <Badge variant="outline" className={`text-[10px] ${severity === 'critical' ? 'text-destructive' : severity === 'high' ? 'text-warning' : 'text-amber-500'}`}>
                        Gap: {gap.avgGap.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
