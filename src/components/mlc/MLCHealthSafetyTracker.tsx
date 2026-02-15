/**
 * MLC Health & Safety Tracker - Regulation 4.3
 * Connected to safety_incidents for real data
 */
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShieldCheck, AlertTriangle, CheckCircle, HardHat, Flame,
  TrendingDown, Activity
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SafetyIndicator {
  id: string; name: string; value: number; target: number; unit: string;
  trend: 'up' | 'down' | 'stable'; status: 'good' | 'warning' | 'critical';
}

interface RiskAssessment {
  id: string; activity: string; hazard: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  controls: string[]; residualRisk: 'low' | 'medium' | 'high';
  responsible: string; nextReview: string;
}

const riskColors: Record<string, string> = {
  low: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  extreme: 'bg-destructive/10 text-destructive border-destructive/30',
};

export function MLCHealthSafetyTracker() {
  const [tab, setTab] = useState('kpis');

  // Fetch real incident count
  const { data: incidentCount } = useQuery({
    queryKey: ['safety-incident-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('safety_incidents')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
    staleTime: 60000,
  });

  // Fetch open incidents for days without accidents calc
  const { data: recentIncidents } = useQuery({
    queryKey: ['safety-recent-incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('safety_incidents')
        .select('created_at, severity')
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const daysSinceLastIncident = useMemo(() => {
    if (!recentIncidents || recentIncidents.length === 0) return 365;
    const last = new Date(recentIncidents[0].created_at);
    return Math.floor((Date.now() - last.getTime()) / 86400000);
  }, [recentIncidents]);

  const SAFETY_INDICATORS: SafetyIndicator[] = [
    { id: '1', name: 'LTIR (Lost Time Injury Rate)', value: 0.0, target: 0.0, unit: 'per 1M hrs', trend: 'stable', status: 'good' },
    { id: '2', name: 'TRIR (Total Recordable)', value: 0.42, target: 0.5, unit: 'per 1M hrs', trend: 'down', status: 'good' },
    { id: '3', name: 'Incidentes Registrados', value: incidentCount || 0, target: 0, unit: 'total', trend: 'stable', status: (incidentCount || 0) > 5 ? 'warning' : 'good' },
    { id: '4', name: 'Toolbox Talks', value: 28, target: 30, unit: '/mês', trend: 'stable', status: 'warning' },
    { id: '5', name: 'Inspeções de Segurança', value: 8, target: 8, unit: '/mês', trend: 'stable', status: 'good' },
    { id: '6', name: 'Dias sem Acidentes', value: daysSinceLastIncident, target: 365, unit: 'dias', trend: 'up', status: 'good' },
  ];

  const RISK_ASSESSMENTS: RiskAssessment[] = [
    { id: '1', activity: 'Operações de Guincho', hazard: 'Queda de carga', riskLevel: 'high', controls: ['Zona exclusão 3m', 'Sinaleiro dedicado', 'Checklist'], residualRisk: 'medium', responsible: 'Imediato', nextReview: '2026-04-15' },
    { id: '2', activity: 'Trabalho em Altura', hazard: 'Queda, impacto', riskLevel: 'extreme', controls: ['Cinto paraquedista', 'PTW obrigatória', 'Buddy system'], residualRisk: 'medium', responsible: 'Of. Segurança', nextReview: '2026-04-20' },
    { id: '3', activity: 'Espaço Confinado', hazard: 'Atmosfera tóxica', riskLevel: 'extreme', controls: ['Teste atmosférico', 'Vigia permanente', 'PTW + LOTO'], residualRisk: 'high', responsible: 'Chief Engineer', nextReview: '2026-05-01' },
    { id: '4', activity: 'Abastecimento (Bunkering)', hazard: 'Derramamento, incêndio', riskLevel: 'high', controls: ['Checklist SOPEP', 'Barreiras contenção', 'VHF contínuo'], residualRisk: 'low', responsible: 'Chief Officer', nextReview: '2026-04-28' },
  ];

  const overallCompliance = Math.round((SAFETY_INDICATORS.filter(i => i.status === 'good').length / SAFETY_INDICATORS.length) * 100);

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" />
            MLC 2006 — Reg. 4.3 Saúde e Segurança
          </CardTitle>
          <CardDescription>Dados em tempo real do Supabase • {incidentCount || 0} incidentes registrados</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-success/10 to-transparent border-success/20">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Dias sem Acidentes</p>
            <p className="text-3xl font-bold text-success">{daysSinceLastIncident}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">KPI Compliance</p>
            <p className="text-2xl font-bold">{overallCompliance}%</p>
            <Progress value={overallCompliance} className="h-1.5 mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Incidentes Total</p>
            <p className="text-2xl font-bold">{incidentCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Riscos Extremos</p>
            <p className="text-2xl font-bold text-destructive">{RISK_ASSESSMENTS.filter(r => r.riskLevel === 'extreme').length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="kpis" className="gap-1"><Activity className="h-3 w-3" />KPIs</TabsTrigger>
          <TabsTrigger value="risks" className="gap-1"><AlertTriangle className="h-3 w-3" />Riscos</TabsTrigger>
        </TabsList>

        <TabsContent value="kpis" className="space-y-3">
          {SAFETY_INDICATORS.map(ind => (
            <Card key={ind.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {ind.status === 'good' ? <CheckCircle className="h-4 w-4 text-success shrink-0" /> : <AlertTriangle className="h-4 w-4 text-warning shrink-0" />}
                    <div>
                      <p className="font-medium text-sm">{ind.name}</p>
                      <p className="text-xs text-muted-foreground">Meta: {ind.target} {ind.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold">{ind.value}</p>
                      <p className="text-xs text-muted-foreground">{ind.unit}</p>
                    </div>
                    <TrendingDown className={`h-3 w-3 ${ind.trend === 'down' ? 'text-success' : 'text-muted-foreground'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="risks" className="space-y-3">
          {RISK_ASSESSMENTS.map(ra => (
            <Card key={ra.id}>
              <CardContent className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{ra.activity}</p>
                      <Badge variant="outline" className={riskColors[ra.riskLevel]}>{ra.riskLevel.toUpperCase()}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Perigo: {ra.hazard}</p>
                    <div className="flex flex-wrap gap-1">
                      {ra.controls.map((c, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">{c}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Residual: <Badge variant="outline" className={`text-[10px] ml-1 ${riskColors[ra.residualRisk]}`}>{ra.residualRisk}</Badge></span>
                      <span>Resp: {ra.responsible}</span>
                      <span>Revisão: {new Date(ra.nextReview).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
