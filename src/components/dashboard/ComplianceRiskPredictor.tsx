/**
 * Compliance Risk Predictor - Wave 18
 * Predictive risk scoring across all 12 maritime standards
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface FrameworkRisk {
  name: string;
  code: string;
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  openNCs: number;
  lastAudit: string | null;
  daysSinceAudit: number;
}

const FRAMEWORKS = [
  { code: 'ism', name: 'ISM Code' },
  { code: 'isps', name: 'ISPS Code' },
  { code: 'mlc', name: 'MLC 2006' },
  { code: 'solas', name: 'SOLAS' },
  { code: 'marpol', name: 'MARPOL' },
  { code: 'psc', name: 'PSC Ready' },
  { code: 'sire', name: 'SIRE 2.0' },
  { code: 'tmsa', name: 'TMSA' },
  { code: 'ovid', name: 'OVID' },
  { code: 'sgso', name: 'SGSO/ANP' },
  { code: 'peodp', name: 'PEO-DP' },
  { code: 'peotram', name: 'PEOTRAM' },
];

export default function ComplianceRiskPredictor() {
  const { data: audits = [] } = useQuery({
    queryKey: ['crp-audits'],
    queryFn: async () => {
      const { data } = await supabase
        .from('internal_audits')
        .select('audit_type, status, created_at, findings_count')
        .order('created_at', { ascending: false })
        .limit(200);
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: ncs = [] } = useQuery({
    queryKey: ['crp-ncs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('non_conformities')
        .select('category, status, severity, created_at')
        .limit(200);
      return data || [];
    },
    staleTime: 60000,
  });

  const frameworks: FrameworkRisk[] = useMemo(() => {
    const now = Date.now();
    return FRAMEWORKS.map((fw) => {
      const fwAudits = audits.filter((a) =>
        (a.audit_type || '').toLowerCase().includes(fw.code)
      );
      const fwNCs = ncs.filter((nc) =>
        (nc.category || '').toLowerCase().includes(fw.code) && nc.status === 'open'
      );
      const lastAuditDate = fwAudits[0]?.created_at || null;
      const daysSince = lastAuditDate
        ? Math.floor((now - new Date(lastAuditDate).getTime()) / 86400000)
        : 999;

      // Score: 100 base, penalized by open NCs, old audits, findings
      let score = 100;
      score -= fwNCs.length * 8;
      if (daysSince > 365) score -= 20;
      else if (daysSince > 180) score -= 10;
      const totalFindings = fwAudits.reduce((s, a) => s + (a.findings_count || 0), 0);
      score -= Math.min(totalFindings * 2, 15);
      score = Math.max(0, Math.min(100, score));

      const trend: FrameworkRisk['trend'] =
        fwNCs.length === 0 && daysSince < 180
          ? 'improving'
          : fwNCs.length > 2 || daysSince > 365
            ? 'declining'
            : 'stable';

      return {
        name: fw.name,
        code: fw.code,
        score,
        trend,
        openNCs: fwNCs.length,
        lastAudit: lastAuditDate,
        daysSinceAudit: daysSince,
      };
    });
  }, [audits, ncs]);

  const avgScore = useMemo(() => {
    if (!frameworks.length) return 0;
    return Math.round(frameworks.reduce((s, f) => s + f.score, 0) / frameworks.length);
  }, [frameworks]);

  const criticalCount = frameworks.filter((f) => f.score < 60).length;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-success/10 border-success/20';
    if (score >= 60) return 'bg-warning/10 border-warning/20';
    return 'bg-destructive/10 border-destructive/20';
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Compliance Risk Predictor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getScoreBg(avgScore)}>
              <span className={getScoreColor(avgScore)}>Score Global: {avgScore}%</span>
            </Badge>
            {criticalCount > 0 && (
              <Badge variant="destructive">{criticalCount} Críticos</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {frameworks.map((fw, i) => (
            <motion.div
              key={fw.code}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-lg border p-3 ${getScoreBg(fw.score)} transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold truncate">{fw.name}</span>
                {fw.trend === 'improving' && <TrendingUp className="h-3.5 w-3.5 text-success" />}
                {fw.trend === 'declining' && <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
                {fw.trend === 'stable' && <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>

              {/* Score bar */}
              <div className="h-2 rounded-full bg-muted/50 mb-2 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    fw.score >= 85 ? 'bg-success' : fw.score >= 60 ? 'bg-warning' : 'bg-destructive'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${fw.score}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className={`font-bold text-sm ${getScoreColor(fw.score)}`}>{fw.score}%</span>
                <div className="flex items-center gap-1">
                  {fw.openNCs > 0 && (
                    <span className="flex items-center gap-0.5 text-destructive">
                      <AlertTriangle className="h-2.5 w-2.5" />{fw.openNCs}
                    </span>
                  )}
                  {fw.daysSinceAudit < 999 && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />{fw.daysSinceAudit}d
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
