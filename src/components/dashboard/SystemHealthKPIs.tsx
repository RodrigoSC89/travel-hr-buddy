/**
 * SystemHealthKPIs v2 - World-Class Animated Health Dashboard
 * Real-time KPI grid with animated counters, sparkline trends, and cinematic entrance
 */
import React, { memo, useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Ship, Users, Shield, FileText, Wrench, Brain,
  AlertTriangle, Award, Activity, CheckCircle,
  TrendingUp, Heart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/* ─── Animated Counter ─── */
const AnimatedNumber = memo(({ value, duration = 1200 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (ref.current !== null) cancelAnimationFrame(ref.current);
    const start = performance.now();
    const from = display;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span>{display.toLocaleString('pt-BR')}</span>;
});
AnimatedNumber.displayName = 'AnimatedNumber';

/* ─── Mini Sparkline ─── */
const MiniSparkline = memo(({ value, color }: { value: number; color: string }) => {
  // Generate a simple visual bar based on value magnitude
  const bars = 5;
  const maxH = 16;
  return (
    <div className="flex items-end gap-[2px] h-4">
      {Array.from({ length: bars }).map((_, i) => {
        const h = Math.max(3, Math.min(maxH, (value / Math.max(1, bars - 1)) * (i + 1) * 0.6));
        return (
          <motion.div
            key={i}
            className={cn("w-[3px] rounded-full", color)}
            initial={{ height: 0 }}
            animate={{ height: `${h}px` }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
});
MiniSparkline.displayName = 'MiniSparkline';

/* ─── KPI Card ─── */
const KPICard = memo(({ item, index }: { item: KPIItem; index: number }) => {
  const hasData = item.value > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className={cn(
              "p-2 rounded-lg transition-colors duration-300",
              hasData ? "bg-primary/10 group-hover:bg-primary/20" : "bg-muted/50"
            )}>
              <item.icon className={cn("h-4 w-4", item.color)} />
            </div>
            {hasData && <MiniSparkline value={item.value} color={item.sparkColor} />}
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">
              <AnimatedNumber value={item.value} />
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
              {hasData && (
                <div className="flex items-center gap-0.5 text-[10px] font-medium text-success">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Ativo</span>
                </div>
              )}
            </div>
          </div>
          {/* Animated bottom accent */}
          <motion.div
            className={cn(
              "absolute bottom-0 left-0 right-0 h-[2px]",
              hasData ? "bg-gradient-to-r from-primary/60 via-primary to-primary/60" : "bg-muted-foreground/20"
            )}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: index * 0.05 + 0.3, duration: 0.5 }}
            style={{ transformOrigin: 'left' }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
});
KPICard.displayName = 'KPICard';

interface KPIItem {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  sparkColor: string;
}

export function SystemHealthKPIs() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['system-health-kpis'],
    queryFn: async () => {
      const queries = await Promise.all([
        supabase.from('vessels').select('id', { count: 'exact', head: true }),
        supabase.from('crew_members').select('id', { count: 'exact', head: true }),
        supabase.from('internal_audits').select('id', { count: 'exact', head: true }),
        supabase.from('ai_documents').select('id', { count: 'exact', head: true }),
        supabase.from('mmi_maintenance_jobs').select('id', { count: 'exact', head: true }),
        supabase.from('agent_registry').select('id', { count: 'exact', head: true }),
        supabase.from('non_conformities').select('id', { count: 'exact', head: true }),
        supabase.from('certificates').select('id', { count: 'exact', head: true }),
        supabase.from('voyage_plans').select('id', { count: 'exact', head: true }),
        supabase.from('ai_chat_conversations').select('id', { count: 'exact', head: true }),
        supabase.from('compliance_items').select('id', { count: 'exact', head: true }),
        supabase.from('medical_records').select('id', { count: 'exact', head: true }),
      ]);

      return {
        vessels: queries[0].count ?? 0,
        crew: queries[1].count ?? 0,
        audits: queries[2].count ?? 0,
        documents: queries[3].count ?? 0,
        maintenance: queries[4].count ?? 0,
        aiAgents: queries[5].count ?? 0,
        nonConformities: queries[6].count ?? 0,
        certificates: queries[7].count ?? 0,
        voyages: queries[8].count ?? 0,
        aiConversations: queries[9].count ?? 0,
        compliance: queries[10].count ?? 0,
        medical: queries[11].count ?? 0,
      };
    },
    staleTime: 60000,
    refetchInterval: 120000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={`health-kpi-skel-${i}`} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  const kpiItems: KPIItem[] = [
    { label: 'Embarcações', value: kpis?.vessels ?? 0, icon: Ship, color: 'text-primary', sparkColor: 'bg-primary' },
    { label: 'Tripulantes', value: kpis?.crew ?? 0, icon: Users, color: 'text-success', sparkColor: 'bg-success' },
    { label: 'Auditorias', value: kpis?.audits ?? 0, icon: Shield, color: 'text-destructive', sparkColor: 'bg-destructive' },
    { label: 'Documentos', value: kpis?.documents ?? 0, icon: FileText, color: 'text-warning', sparkColor: 'bg-warning' },
    { label: 'Manutenções', value: kpis?.maintenance ?? 0, icon: Wrench, color: 'text-accent-foreground', sparkColor: 'bg-accent-foreground' },
    { label: 'Agentes IA', value: kpis?.aiAgents ?? 0, icon: Brain, color: 'text-primary', sparkColor: 'bg-primary' },
    { label: 'NCs', value: kpis?.nonConformities ?? 0, icon: AlertTriangle, color: 'text-warning', sparkColor: 'bg-warning' },
    { label: 'Certificados', value: kpis?.certificates ?? 0, icon: Award, color: 'text-success', sparkColor: 'bg-success' },
    { label: 'Viagens', value: kpis?.voyages ?? 0, icon: Activity, color: 'text-primary', sparkColor: 'bg-primary' },
    { label: 'Conversas IA', value: kpis?.aiConversations ?? 0, icon: Brain, color: 'text-accent-foreground', sparkColor: 'bg-accent-foreground' },
    { label: 'Compliance', value: kpis?.compliance ?? 0, icon: CheckCircle, color: 'text-success', sparkColor: 'bg-success' },
    { label: 'Médico', value: kpis?.medical ?? 0, icon: Heart, color: 'text-destructive', sparkColor: 'bg-destructive' },
  ];

  const totalRecords = kpiItems.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      {/* Animated Summary Bar */}
      <motion.div
        className="flex items-center justify-between px-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-success rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-medium">Visão Geral do Sistema</span>
          <span className="text-[10px] text-muted-foreground">• Tempo real</span>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 tabular-nums">
          <AnimatedNumber value={totalRecords} /> registros
        </Badge>
      </motion.div>

      {/* Animated KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {kpiItems.map((item, index) => (
          <KPICard key={item.label} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
