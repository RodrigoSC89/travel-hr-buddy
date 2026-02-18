/**
 * Crew Wellness Command - Wave 12
 * Real-time crew health intelligence with fatigue risk scoring,
 * certification health, rotation status, and wellbeing indicators
 */
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Users, Heart, AlertTriangle, Clock, Award, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface CrewStat {
  label: string;
  value: number;
  total: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const AnimatedRing = ({ value, max, size = 56, strokeWidth = 5, color }: { value: number; max: number; size?: number; strokeWidth?: number; color: string }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-muted/15" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
};

export default function CrewWellnessCommand() {
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['crew-wellness-command'],
    queryFn: async () => {
      const [crew, certs, wellbeing] = await Promise.all([
        supabase.from('crew_members').select('id, status, nationality, rank', { count: 'exact' }),
        supabase.from('crew_certifications').select('id, expiry_date, crew_member_id', { count: 'exact' }),
        supabase.from('crew_wellbeing_predictions').select('id, fatigue_risk_score, burnout_risk_score', { count: 'exact' }).order('created_at', { ascending: false }).limit(100),
      ]);

      const now = new Date();
      const activeCrew = (crew.data || []).filter(c => c.status === 'active' || c.status === 'onboard').length;
      const expiring30 = (certs.data || []).filter(c => {
        if (!c.expiry_date) return false;
        const diff = new Date(c.expiry_date).getTime() - now.getTime();
        return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
      }).length;
      const expiring90 = (certs.data || []).filter(c => {
        if (!c.expiry_date) return false;
        const diff = new Date(c.expiry_date).getTime() - now.getTime();
        return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
      }).length;
      const expired = (certs.data || []).filter(c => {
        if (!c.expiry_date) return false;
        return new Date(c.expiry_date).getTime() < now.getTime();
      }).length;

      const highFatigue = (wellbeing.data || []).filter(w => (w.fatigue_risk_score || 0) > 70).length;
      const avgFatigue = (wellbeing.data || []).length > 0
        ? (wellbeing.data || []).reduce((s, w) => s + (w.fatigue_risk_score || 0), 0) / (wellbeing.data || []).length
        : 0;

      const nationalities = new Set((crew.data || []).map(c => c.nationality).filter(Boolean));

      return {
        totalCrew: crew.count || 0,
        activeCrew,
        totalCerts: certs.count || 0,
        expiring30,
        expiring90,
        expired,
        highFatigue,
        avgFatigue,
        nationalities: nationalities.size,
        wellbeingRecords: (wellbeing.data || []).length,
      };
    },
    staleTime: 120_000,
    refetchInterval: 120_000,
  });

  const d = data || { totalCrew: 0, activeCrew: 0, totalCerts: 0, expiring30: 0, expiring90: 0, expired: 0, highFatigue: 0, avgFatigue: 0, nationalities: 0, wellbeingRecords: 0 };

  const crewReadiness = d.totalCrew > 0 ? Math.round((d.activeCrew / d.totalCrew) * 60 + Math.max(0, 40 - (d.expired * 5))) : 0;
  const certHealth = d.totalCerts > 0 ? Math.round(Math.max(0, 100 - ((d.expired + d.expiring30) / d.totalCerts) * 100)) : 100;
  const fatigueScore = d.avgFatigue > 0 ? Math.round(100 - d.avgFatigue * 10) : 85;

  const stats: CrewStat[] = [
    { label: 'Active Crew', value: d.activeCrew, total: d.totalCrew, icon: Users, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Cert Health', value: certHealth, total: 100, icon: Award, color: 'text-success', bgColor: 'bg-success/10' },
    { label: 'Fatigue Index', value: fatigueScore, total: 100, icon: Activity, color: fatigueScore > 70 ? 'text-success' : 'text-warning', bgColor: fatigueScore > 70 ? 'bg-success/10' : 'bg-warning/10' },
    { label: 'Readiness', value: crewReadiness, total: 100, icon: ShieldCheck, color: crewReadiness > 80 ? 'text-success' : 'text-warning', bgColor: crewReadiness > 80 ? 'bg-success/10' : 'bg-warning/10' },
  ];

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-500/10 rounded-lg">
              <Heart className="h-5 w-5 text-rose-500" />
            </div>
            <CardTitle className="text-lg">Crew Wellness Command</CardTitle>
          </div>
          <button onClick={() => navigate('/workbench?section=people')} className="flex items-center gap-1 text-xs text-primary hover:underline">
            Full Hub <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Gauge Row */}
        <div className="grid grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="relative">
                <AnimatedRing value={s.value} max={s.total} color={s.color.includes('success') ? 'hsl(var(--success, 142 76% 36%))' : s.color.includes('warning') ? 'hsl(var(--warning, 48 96% 53%))' : 'hsl(var(--primary))'} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-foreground">{s.value}</span>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Alerts Strip */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Expired Certs', value: d.expired, severity: d.expired > 0 ? 'critical' : 'ok' },
            { label: 'Expiring <30d', value: d.expiring30, severity: d.expiring30 > 3 ? 'warning' : 'ok' },
            { label: 'High Fatigue', value: d.highFatigue, severity: d.highFatigue > 0 ? 'warning' : 'ok' },
          ].map((alert) => (
            <div
              key={alert.label}
              className={`p-2.5 rounded-lg border text-center ${
                alert.severity === 'critical' ? 'bg-destructive/10 border-destructive/20' :
                alert.severity === 'warning' ? 'bg-warning/10 border-warning/20' :
                'bg-muted/20 border-border/40'
              }`}
            >
              <div className={`text-xl font-bold ${
                alert.severity === 'critical' ? 'text-destructive' :
                alert.severity === 'warning' ? 'text-warning' : 'text-foreground'
              }`}>
                {alert.value}
              </div>
              <div className="text-[10px] text-muted-foreground">{alert.label}</div>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="flex items-center justify-between p-2 rounded-md bg-muted/10 text-[10px] text-muted-foreground">
          <span>{d.nationalities} nationalities</span>
          <span>{d.totalCerts} certificates tracked</span>
          <span>{d.wellbeingRecords} wellness records</span>
        </div>
      </CardContent>
    </Card>
  );
}
