/**
 * Cross-Module Intelligence Dashboard
 * Unified analytics, predictive alerts, and operational correlations
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Brain, Sparkles, Loader2, AlertTriangle, Activity,
  Ship, Users, Wrench, Shield, TrendingUp, Network,
  Zap, Target, BarChart3, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { crossModuleIntelligence, type CrossModuleAnalysisType, type CrossModuleResult } from '@/services/cross-module';

const ANALYSIS_TYPES: { id: CrossModuleAnalysisType; label: string; icon: typeof Brain; description: string }[] = [
  { id: 'correlation', label: 'Correlações', icon: Network, description: 'Relações entre módulos operacionais' },
  { id: 'predictive_alerts', label: 'Alertas Preditivos', icon: Zap, description: 'Alertas AI cruzando dados de múltiplos módulos' },
  { id: 'fleet_optimization', label: 'Otimização de Frota', icon: Target, description: 'Otimização integrada de recursos' },
  { id: 'unified_analytics', label: 'Analytics Unificado', icon: BarChart3, description: 'Relatório executivo cross-module' },
];

export function CrossModuleIntelligenceDashboard() {
  const [selectedType, setSelectedType] = useState<CrossModuleAnalysisType>('unified_analytics');
  const [analysisResult, setAnalysisResult] = useState<CrossModuleResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: kpis, isLoading: kpisLoading, refetch: refetchKPIs } = useQuery({
    queryKey: ['cross-module-kpis'],
    queryFn: () => crossModuleIntelligence.getUnifiedKPIs(),
    staleTime: 60_000,
  });

  const runAnalysis = async (type: CrossModuleAnalysisType) => {
    setIsAnalyzing(true);
    setSelectedType(type);
    try {
      const result = await crossModuleIntelligence.analyze(type);
      setAnalysisResult(result);
      toast.success(`Análise ${ANALYSIS_TYPES.find(t => t.id === type)?.label} concluída`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      if (msg.includes('429')) {
        toast.error('Rate limit excedido. Aguarde um momento.');
      } else if (msg.includes('402')) {
        toast.error('Créditos de IA insuficientes.');
      } else {
        toast.error('Erro na análise: ' + msg);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Ship className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{kpis?.totalVessels ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Embarcações ({kpis?.activeVessels ?? 0} ativas)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10"><Users className="h-5 w-5 text-info" /></div>
            <div>
              <p className="text-2xl font-bold">{kpis?.totalCrew ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Tripulantes Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10"><Wrench className="h-5 w-5 text-warning" /></div>
            <div>
              <p className="text-2xl font-bold">{kpis?.openMaintenanceJobs ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Manutenções Abertas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
            <div>
              <p className="text-2xl font-bold">{kpis?.criticalAlerts ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Alertas Críticos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-500" /> Compliance</span>
              <span className="font-bold text-emerald-600">{kpis?.complianceRate ?? 0}%</span>
            </div>
            <Progress value={kpis?.complianceRate ?? 0} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2"><Activity className="h-4 w-4 text-info" /> Safety Score</span>
              <span className="font-bold text-info">{kpis?.safetyScore ?? 0}%</span>
            </div>
            <Progress value={kpis?.safetyScore ?? 0} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Overall Health</span>
              <span className="font-bold text-primary">{kpis?.overallHealth ?? 0}%</span>
            </div>
            <Progress value={kpis?.overallHealth ?? 0} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Analysis Types */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Inteligência Cross-Module
              </CardTitle>
              <CardDescription>Análises AI que cruzam dados de todos os módulos operacionais</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchKPIs()}>
              <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {ANALYSIS_TYPES.map(type => {
              const Icon = type.icon;
              const isActive = selectedType === type.id;
              return (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${isActive ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : ''}`}
                  onClick={() => runAnalysis(type.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/20' : 'bg-muted'}`}>
                        <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Analysis Result */}
          <AnimatePresence mode="wait">
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12"
              >
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Analisando dados de todos os módulos...</p>
                  <p className="text-xs text-muted-foreground mt-1">Embarcações, tripulação, manutenção, compliance, segurança</p>
                </div>
              </motion.div>
            )}

            {!isAnalyzing && analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2 text-primary">
                        <Sparkles className="h-4 w-4" />
                        {ANALYSIS_TYPES.find(t => t.id === analysisResult.analysisType)?.label}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {analysisResult.summary.vesselCount} embarcações
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {analysisResult.summary.crewCount} tripulantes
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {analysisResult.summary.maintenanceCount} manutenções
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[500px]">
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                        {analysisResult.analysis}
                      </div>
                    </ScrollArea>
                    <p className="text-xs text-muted-foreground mt-4">
                      Gerado em: {new Date(analysisResult.generatedAt).toLocaleString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!isAnalyzing && !analysisResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-muted-foreground">
                <Network className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Selecione um tipo de análise</p>
                <p className="text-sm">Clique em uma das opções acima para gerar insights cross-module</p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
