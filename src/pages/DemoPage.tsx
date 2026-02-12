/**
 * DemoPage - Public Dashboard Demo (no auth required)
 * Shows real data from Supabase via SECURITY DEFINER RPC
 */
import React from 'react';
import { logger } from '@/lib/logger';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Ship, Users, Shield, FileText, Wrench, Brain,
  AlertTriangle, Award, Activity, CheckCircle,
  Heart, TrendingUp, ArrowLeft, Compass, Satellite,
  Briefcase, Database, Globe, Cpu, BarChart3, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import nautiLogo from '@/assets/nauti-one-logo.png';

interface DemoVessel {
  id: string;
  name: string;
  vessel_type?: string;
  imo_number?: string;
  status?: string;
}

interface DemoCrew {
  id: string;
  full_name: string;
  rank?: string;
  nationality?: string;
  status?: string;
}

interface DemoAudit {
  id: string;
  title: string;
  audit_type?: string;
  status?: string;
}

interface DemoAgent {
  id: string;
  name: string;
  agent_id?: string;
  status?: string;
}

interface DemoCertificate {
  id: string;
  certificate_name: string;
  certificate_type?: string;
  status?: string;
}

interface DemoVoyage {
  id: string;
  voyage_number: string;
  origin_port?: string;
  destination_port?: string;
  status?: string;
}

interface DemoData {
  vessels: DemoVessel[];
  vessels_count: number;
  crew: DemoCrew[];
  crew_count: number;
  audits: DemoAudit[];
  audits_count: number;
  agents: DemoAgent[];
  agents_count: number;
  certificates: DemoCertificate[];
  certificates_count: number;
  voyages: DemoVoyage[];
  voyages_count: number;
  maintenance: Record<string, unknown>[];
  documents_count: number;
  maintenance_count: number;
  ncs_count: number;
  ai_conversations_count: number;
  compliance_count: number;
  medical_count: number;
  courses_count: number;
  insights_count: number;
  contracts_count: number;
  checklists_count: number;
}

function useDemoData() {
  return useQuery({
    queryKey: ['demo-full-data'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_demo_data');
      if (error || !data) {
        logger.error('Demo data error', error as Error);
        return null;
      }
      return data as unknown as DemoData;
    },
    staleTime: 60000,
  });
}

const HUBS = [
  { name: 'Central de Comando', desc: 'NOC, SOC, Alertas', icon: Compass, color: 'text-primary', bgColor: 'bg-primary/10', modules: 7 },
  { name: 'Hub de Operações', desc: 'Frota, Viagens, Logística', icon: Ship, color: 'text-success', bgColor: 'bg-success/10', modules: 7 },
  { name: 'Hub de Manutenção', desc: 'Preditiva, ESG, Digital Twin', icon: Wrench, color: 'text-warning', bgColor: 'bg-warning/10', modules: 8 },
  { name: 'Hub de IA', desc: '10 Agentes, Chat, Workflows', icon: Brain, color: 'text-accent-foreground', bgColor: 'bg-accent/10', modules: 11 },
  { name: 'Hub de Rastreamento', desc: 'AIS, SATCOM, IoT', icon: Satellite, color: 'text-info', bgColor: 'bg-info/10', modules: 8 },
  { name: 'Hub de Compliance', desc: '12 Auditorias, 10 AI Agents', icon: Shield, color: 'text-destructive', bgColor: 'bg-destructive/10', modules: 22 },
  { name: 'Área de Trabalho', desc: 'Docs, Pessoas, Finanças', icon: Briefcase, color: 'text-muted-foreground', bgColor: 'bg-muted/10', modules: 12 },
];

export default function DemoPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useDemoData();

  const kpis = data ? [
    { label: 'Embarcações', value: data.vessels_count, icon: Ship, color: 'text-primary' },
    { label: 'Tripulantes', value: data.crew_count, icon: Users, color: 'text-success' },
    { label: 'Auditorias', value: data.audits_count, icon: Shield, color: 'text-destructive' },
    { label: 'Documentos IA', value: data.documents_count, icon: FileText, color: 'text-warning' },
    { label: 'Manutenções', value: data.maintenance_count, icon: Wrench, color: 'text-warning' },
    { label: 'Agentes IA', value: data.agents_count, icon: Brain, color: 'text-accent-foreground' },
    { label: 'NCs', value: data.ncs_count, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Certificados', value: data.certificates_count, icon: Award, color: 'text-success' },
    { label: 'Viagens', value: data.voyages_count, icon: Activity, color: 'text-primary' },
    { label: 'Conversas IA', value: data.ai_conversations_count, icon: Brain, color: 'text-accent-foreground' },
    { label: 'Compliance', value: data.compliance_count, icon: CheckCircle, color: 'text-success' },
    { label: 'Médico', value: data.medical_count, icon: Heart, color: 'text-destructive' },
    { label: 'Cursos', value: data.courses_count, icon: Award, color: 'text-primary' },
    { label: 'Insights IA', value: data.insights_count, icon: TrendingUp, color: 'text-info' },
    { label: 'Contratos IA', value: data.contracts_count, icon: FileText, color: 'text-success' },
  ] : [];

  const totalRecords = kpis.reduce((sum, k) => sum + k.value, 0);

  const dataCards = data ? [
    { title: 'Embarcações', icon: Ship, iconColor: 'text-primary', count: data.vessels_count, items: data.vessels, nameKey: 'name' as const, subtitleFn: (v: DemoVessel) => `${v.vessel_type || 'N/A'} • IMO: ${v.imo_number || 'N/A'}`, emptyMsg: 'Nenhuma embarcação cadastrada' },
    { title: 'Tripulação', icon: Users, iconColor: 'text-success', count: data.crew_count, items: data.crew, nameKey: 'full_name' as const, subtitleFn: (c: DemoCrew) => `${c.rank || 'N/A'} • ${c.nationality || 'N/A'}`, emptyMsg: 'Nenhum tripulante cadastrado' },
    { title: 'Auditorias', icon: Shield, iconColor: 'text-destructive', count: data.audits_count, items: data.audits, nameKey: 'title' as const, subtitleFn: (a: DemoAudit) => a.audit_type || 'N/A', emptyMsg: 'Nenhuma auditoria registrada' },
    { title: 'Agentes IA', icon: Brain, iconColor: 'text-accent-foreground', count: data.agents_count, items: data.agents, nameKey: 'name' as const, subtitleFn: (ag: DemoAgent) => `ID: ${ag.agent_id || 'N/A'}`, emptyMsg: 'Nenhum agente registrado' },
    { title: 'Certificados', icon: Award, iconColor: 'text-success', count: data.certificates_count, items: data.certificates, nameKey: 'certificate_name' as const, subtitleFn: (c: DemoCertificate) => c.certificate_type || 'N/A', emptyMsg: 'Nenhum certificado registrado' },
    { title: 'Viagens', icon: Activity, iconColor: 'text-primary', count: data.voyages_count, items: data.voyages, nameKey: 'voyage_number' as const, subtitleFn: (v: DemoVoyage) => `${v.origin_port || '?'} → ${v.destination_port || '?'}`, emptyMsg: 'Nenhuma viagem registrada' },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/auth')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="w-10 h-10 rounded-lg bg-card p-1.5 border border-border shadow-sm">
              <img src={nautiLogo} alt="Nauti One" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold">NAUTI ONE — Demo Dashboard</h1>
              <p className="text-xs text-muted-foreground">Dados reais do Supabase • Modo somente leitura</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <Database className="h-3 w-3 mr-1" /> Live Data
            </Badge>
            <Button onClick={() => navigate('/auth')} size="sm">
              <Lock className="h-3.5 w-3.5 mr-1.5" />
              Fazer Login
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-8">
        {/* Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Visão Geral do Sistema</h2>
          </div>
          {!isLoading && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-3 py-1">
              {totalRecords.toLocaleString('pt-BR')} registros totais no banco
            </Badge>
          )}
        </div>

        {/* KPIs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 15 }).map((_, i) => (
              <Skeleton key={`demo-skeleton-${i}`} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {kpis.map((kpi) => (
              <Card key={kpi.label} className="border-border/50 hover:border-primary/30 transition-all hover:shadow-sm group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                      <p className="text-2xl font-bold tracking-tight">{kpi.value.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                      <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Separator />

        {/* Real Data Tables */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dataCards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <card.icon className={cn("h-4 w-4", card.iconColor)} />
                    {card.title} ({card.count})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {card.items.length > 0 ? (
                    <div className="space-y-2">
                      {card.items.slice(0, 6).map((item) => {
                        const rec = item as unknown as Record<string, unknown>;
                        return (
                          <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div>
                              <p className="text-sm font-medium">{String(rec[card.nameKey] || 'N/A')}</p>
                              <p className="text-xs text-muted-foreground">{card.subtitleFn(item as never)}</p>
                            </div>
                            <Badge variant={rec.status === 'active' || rec.status === 'operational' ? 'default' : 'secondary'} className="text-xs">
                              {String(rec.status || 'N/A')}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-6">{card.emptyMsg}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Separator />

        {/* 7 Mega-Hubs */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            7 Mega-Hubs • 75+ Módulos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {HUBS.map((hub) => (
              <Card key={hub.name} className={cn("border-border/50 transition-all hover:shadow-md", hub.bgColor)}>
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-background/80 shadow-sm">
                      <hub.icon className={cn("h-5 w-5", hub.color)} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{hub.name}</h3>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 mt-0.5">
                        {hub.modules} módulos
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{hub.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Tech Stack */}
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              Integrações Backend ↔ Frontend Ativas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {[
                { label: 'Tabelas Supabase', value: '150+', icon: Database },
                { label: 'Edge Functions', value: '10+', icon: Cpu },
                { label: 'React Queries', value: '50+', icon: BarChart3 },
                { label: 'RLS Policies', value: '100+', icon: Shield },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 p-3 bg-background rounded-lg border border-border/50">
                  <item.icon className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-bold text-lg">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Para acessar todas as funcionalidades, faça login no sistema</p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            <Lock className="h-4 w-4 mr-2" />
            Fazer Login para Acesso Completo
          </Button>
        </div>
      </main>
    </div>
  );
}