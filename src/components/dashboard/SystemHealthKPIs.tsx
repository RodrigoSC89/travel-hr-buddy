/**
 * SystemHealthKPIs - Real-time system health dashboard
 * Shows actual data counts from Supabase tables
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Ship, Users, Shield, FileText, Wrench, Brain,
  Satellite, DollarSign, AlertTriangle, Award,
  Activity, CheckCircle, TrendingUp, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIItem {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: string;
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
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const kpiItems: KPIItem[] = [
    { label: 'Embarcações', value: kpis?.vessels ?? 0, icon: Ship, color: 'text-primary' },
    { label: 'Tripulantes', value: kpis?.crew ?? 0, icon: Users, color: 'text-success' },
    { label: 'Auditorias', value: kpis?.audits ?? 0, icon: Shield, color: 'text-destructive' },
    { label: 'Documentos', value: kpis?.documents ?? 0, icon: FileText, color: 'text-warning' },
    { label: 'Manutenções', value: kpis?.maintenance ?? 0, icon: Wrench, color: 'text-accent-foreground' },
    { label: 'Agentes IA', value: kpis?.aiAgents ?? 0, icon: Brain, color: 'text-primary' },
    { label: 'NCs', value: kpis?.nonConformities ?? 0, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Certificados', value: kpis?.certificates ?? 0, icon: Award, color: 'text-success' },
    { label: 'Viagens', value: kpis?.voyages ?? 0, icon: Activity, color: 'text-primary' },
    { label: 'Conversas IA', value: kpis?.aiConversations ?? 0, icon: Brain, color: 'text-accent-foreground' },
    { label: 'Compliance', value: kpis?.compliance ?? 0, icon: CheckCircle, color: 'text-success' },
    { label: 'Médico', value: kpis?.medical ?? 0, icon: Heart, color: 'text-destructive' },
  ];

  const totalRecords = kpiItems.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Visão Geral do Sistema</span>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {totalRecords.toLocaleString('pt-BR')} registros totais
        </Badge>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {kpiItems.map((item) => (
          <Card
            key={item.label}
            className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-sm group"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{item.value.toLocaleString('pt-BR')}</p>
                </div>
                <div className={cn(
                  "p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors",
                )}>
                  <item.icon className={cn("h-4 w-4", item.color)} />
                </div>
              </div>
              {/* Subtle bottom accent */}
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
                item.value > 0 ? "bg-primary" : "bg-muted-foreground/30"
              )} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
