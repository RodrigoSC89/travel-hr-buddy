/**
 * Safety & Incident AI Page
 * Incident reporting, root cause analysis, safety analytics, drill management
 */
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, AlertTriangle, FileText, BarChart3, Target,
  TrendingDown, TrendingUp, CheckCircle, Loader2, Brain
} from 'lucide-react';
import { useSafetyIncidentAI, SafetyMetrics } from '@/hooks/useSafetyIncidentAI';
import { supabase } from '@/integrations/supabase/client';

// Fallback metrics when API is unavailable
const FALLBACK_METRICS = {
  ltifr: 0.42,
  trir: 1.8,
  nearMisses: 12,
  safetyObservations: 156,
  drillsCompleted: 8,
  drillsPlanned: 10,
  riskScore: 72,
  period: 'month',
  trainingHours: 240,
  inspectionsCompleted: 45,
  openActions: 8,
  trend: 'improving' as const
};

export default function SafetyIncidentAIPage() {
  const { 
    isLoading, 
    analyzeRootCause, 
    getSafetyMetrics, 
    generateDrillScenario,
    predictIncidents
  } = useSafetyIncidentAI();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<SafetyMetrics>(FALLBACK_METRICS);
  const [incidents, setIncidents] = useState<Array<{ id: string; title: string; severity: string; date: string; status: string }>>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load real metrics and incidents
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        // Try to get real metrics from AI
        const realMetrics = await getSafetyMetrics(undefined, 'month');
        if (realMetrics) {
          setMetrics(realMetrics);
        }

        // Load incidents from database
        const { data: incidentsData } = await supabase
          .from('safety_incidents')
          .select('id, title, severity, created_at, status')
          .order('created_at', { ascending: false })
          .limit(10);

        if (incidentsData && incidentsData.length > 0) {
          setIncidents(incidentsData.map(i => ({
            id: i.id,
            title: i.title || 'Incidente',
            severity: i.severity || 'medium',
            date: new Date(i.created_at).toISOString().split('T')[0],
            status: i.status || 'investigating'
          })));
        } else {
          // Fallback incidents
          setIncidents([
            { id: '1', title: 'Near Miss - Crane Operation', severity: 'medium', date: '2024-01-28', status: 'investigating' },
            { id: '2', title: 'Minor Injury - Slip on Deck', severity: 'low', date: '2024-01-25', status: 'closed' },
            { id: '3', title: 'Equipment Damage - Winch', severity: 'high', date: '2024-01-20', status: 'resolved' },
          ]);
        }
      } catch {
        // Use fallback data
        setIncidents([
          { id: '1', title: 'Near Miss - Crane Operation', severity: 'medium', date: '2024-01-28', status: 'investigating' },
          { id: '2', title: 'Minor Injury - Slip on Deck', severity: 'low', date: '2024-01-25', status: 'closed' },
          { id: '3', title: 'Equipment Damage - Winch', severity: 'high', date: '2024-01-20', status: 'resolved' },
        ]);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [getSafetyMetrics]);

  return (
    <>
      <Helmet>
        <title>Safety & Incident AI | Nautilus One</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Safety & Incident AI
            </h1>
            <p className="text-muted-foreground">
              Predição de incidentes, análise de causa raiz e KPIs de segurança
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 bg-success/10">
            <TrendingDown className="h-4 w-4 mr-2 text-success" />
            LTIFR: {metrics.ltifr}
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">LTIFR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{metrics.ltifr}</div>
              <div className="flex items-center text-xs text-success">
                <TrendingDown className="h-3 w-3 mr-1" />
                -15% vs último ano
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">TRIR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.trir}</div>
              <p className="text-xs text-muted-foreground">Por milhão horas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Near Misses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.nearMisses}</div>
              <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.safetyObservations}</div>
              <p className="text-xs text-muted-foreground">Comportamentais</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Drills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.drillsCompleted}/{metrics.drillsPlanned}</div>
              <Progress value={(metrics.drillsCompleted / metrics.drillsPlanned) * 100} className="h-2 mt-1" />
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="incidents">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Incidentes
            </TabsTrigger>
            <TabsTrigger value="analysis">
              <Brain className="h-4 w-4 mr-2" />
              Análise AI
            </TabsTrigger>
            <TabsTrigger value="drills">
              <Target className="h-4 w-4 mr-2" />
              Simulados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Score</CardTitle>
                  <CardDescription>Avaliação geral de risco da frota</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle 
                          className="text-muted stroke-current" 
                          strokeWidth="10" 
                          fill="transparent" 
                          r="40" 
                          cx="50" 
                          cy="50"
                        />
                        <circle 
                          className="text-primary stroke-current" 
                          strokeWidth="10" 
                          strokeLinecap="round" 
                          fill="transparent" 
                          r="40" 
                          cx="50" 
                          cy="50"
                          strokeDasharray={`${metrics.riskScore * 2.51} 251`}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">{metrics.riskScore}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-2">Score de Segurança</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Predição de Incidentes</CardTitle>
                  <CardDescription>IA identifica riscos potenciais</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => predictIncidents('vessel-1')}
                    disabled={isLoading}
                    className="w-full mb-4"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                    Analisar Riscos com IA
                  </Button>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-warning/10 rounded">
                      <span className="text-sm">Fadiga de tripulação</span>
                      <Badge variant="outline" className="text-warning">25% prob.</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-success/10 rounded">
                      <span className="text-sm">Falha de equipamento</span>
                      <Badge variant="outline" className="text-success">8% prob.</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Incidentes Recentes</CardTitle>
                <CardDescription>Registro e acompanhamento de ocorrências</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <AlertTriangle className={`h-6 w-6 ${
                          incident.severity === 'high' ? 'text-red-500' :
                          incident.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium">{incident.title}</p>
                          <p className="text-sm text-muted-foreground">{incident.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          incident.severity === 'high' ? 'destructive' :
                          incident.severity === 'medium' ? 'secondary' : 'outline'
                        }>
                          {incident.severity}
                        </Badge>
                        <Badge variant="outline">{incident.status}</Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => analyzeRootCause(incident.id)}
                          disabled={isLoading}
                        >
                          <Brain className="h-4 w-4 mr-1" />
                          RCA
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Causa Raiz com IA</CardTitle>
                <CardDescription>5 Whys, Fishbone e identificação de padrões</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Button variant="outline" onClick={() => analyzeRootCause('sample', '5_whys')}>
                    5 Whys Analysis
                  </Button>
                  <Button variant="outline" onClick={() => analyzeRootCause('sample', 'fishbone')}>
                    Fishbone Diagram
                  </Button>
                  <Button variant="outline" onClick={() => analyzeRootCause('sample', 'fault_tree')}>
                    Fault Tree
                  </Button>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    Selecione um incidente e método de análise para iniciar
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Simulados de Emergência</CardTitle>
                <CardDescription>Geração de cenários e avaliação de desempenho</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <Button onClick={() => generateDrillScenario('vessel-1', 'fire')} disabled={isLoading}>
                    🔥 Incêndio
                  </Button>
                  <Button onClick={() => generateDrillScenario('vessel-1', 'abandon_ship')} disabled={isLoading}>
                    🚢 Abandono
                  </Button>
                  <Button onClick={() => generateDrillScenario('vessel-1', 'man_overboard')} disabled={isLoading}>
                    🏊 Homem ao Mar
                  </Button>
                  <Button onClick={() => generateDrillScenario('vessel-1', 'spill')} disabled={isLoading}>
                    🛢️ Derramamento
                  </Button>
                  <Button onClick={() => generateDrillScenario('vessel-1', 'security')} disabled={isLoading}>
                    🔒 Segurança
                  </Button>
                  <Button onClick={() => generateDrillScenario('vessel-1', 'medical')} disabled={isLoading}>
                    🏥 Médico
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
