/**
 * Predictive Alerts Hub - Cross-module AI-powered alerting
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle, Bell, Brain, Sparkles, Loader2,
  Ship, Users, Wrench, Shield, Clock, CheckCircle,
  XCircle, ChevronRight, Filter, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface PredictiveAlert {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  modules: string[];
  vessel?: string;
  description: string;
  action: string;
  probability: number;
  status: 'active' | 'acknowledged' | 'resolved';
}

const SEVERITY_CONFIG = {
  critical: { color: 'bg-red-500/10 text-red-600 border-red-500/30', icon: XCircle, label: 'Crítico' },
  high: { color: 'bg-orange-500/10 text-orange-600 border-orange-500/30', icon: AlertTriangle, label: 'Alto' },
  medium: { color: 'bg-amber-500/10 text-amber-600 border-amber-500/30', icon: Clock, label: 'Médio' },
  low: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: Bell, label: 'Baixo' },
};

const MODULE_ICONS: Record<string, typeof Ship> = {
  operations: Ship,
  crew: Users,
  maintenance: Wrench,
  compliance: Shield,
  safety: AlertTriangle,
};

const MOCK_ALERTS: PredictiveAlert[] = [
  { id: '1', type: 'maintenance_crew_overlap', severity: 'critical', modules: ['maintenance', 'crew'], vessel: 'MV Nautilus One', description: 'Manutenção crítica no motor principal coincide com rotação de engenheiro-chefe. Risco de atraso operacional.', action: 'Antecipar rotação ou postergar manutenção não-crítica', probability: 85, status: 'active' },
  { id: '2', type: 'compliance_expiry_cluster', severity: 'high', modules: ['compliance', 'operations'], vessel: 'MV Atlantic Star', description: '3 certificados vencendo no mesmo mês. Risco de retenção em inspeção PSC.', action: 'Agendar renovação escalonada e preparar briefing PSC', probability: 72, status: 'active' },
  { id: '3', type: 'crew_fatigue_risk', severity: 'high', modules: ['crew', 'safety'], description: 'Padrão de horas extras detectado em 4 embarcações. Risco de fadiga conforme MLC 2006.', action: 'Revisar escalas e implementar rotação preventiva', probability: 68, status: 'active' },
  { id: '4', type: 'weather_maintenance_conflict', severity: 'medium', modules: ['operations', 'maintenance'], vessel: 'MV Pacific Runner', description: 'Previsão de mau tempo na rota coincide com janela de manutenção programada.', action: 'Reprogramar manutenção ou ajustar rota', probability: 55, status: 'acknowledged' },
  { id: '5', type: 'cost_anomaly', severity: 'medium', modules: ['operations', 'maintenance'], description: 'Custos de bunker 15% acima da média do trimestre. Possível ineficiência de rota.', action: 'Analisar rotas e consumo por embarcação', probability: 60, status: 'active' },
];

export function PredictiveAlertsHub() {
  const [alerts, setAlerts] = useState<PredictiveAlert[]>(MOCK_ALERTS);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<PredictiveAlert | null>(null);

  const filteredAlerts = alerts.filter(a =>
    filter === 'all' || a.severity === filter || (filter === 'active' && a.status === 'active')
  );

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' as const } : a));
    toast.success('Alerta reconhecido');
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' as const } : a));
    toast.success('Alerta resolvido');
  };

  const runPredictiveAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('cross-module-intelligence', {
        body: { analysisType: 'predictive_alerts' },
      });
      if (error) throw error;
      setAiInsight(data?.analysis || 'Análise não disponível');
      toast.success('Análise preditiva cross-module concluída');
    } catch (err) {
      toast.error('Erro na análise preditiva');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const activeCount = alerts.filter(a => a.status === 'active').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{criticalCount}</p>
            <p className="text-xs text-muted-foreground">Alertas Críticos</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Alertas Ativos</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{alerts.filter(a => a.status === 'resolved').length}</p>
            <p className="text-xs text-muted-foreground">Resolvidos</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{Math.round(alerts.reduce((a, b) => a + b.probability, 0) / alerts.length)}%</p>
            <p className="text-xs text-muted-foreground">Confiança Média</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={runPredictiveAnalysis} disabled={isAnalyzing} className="gap-2">
          {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
          Gerar Alertas Preditivos AI
        </Button>
        <div className="flex gap-1">
          {['all', 'critical', 'high', 'medium', 'active'].map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todos' : f === 'active' ? 'Ativos' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* AI Insight */}
      {aiInsight && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                Análise Preditiva Cross-Module
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[300px]">
                <p className="text-sm whitespace-pre-wrap">{aiInsight}</p>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Alerts List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Alertas Preditivos ({filteredAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="divide-y">
                <AnimatePresence>
                  {filteredAlerts.map((alert, i) => {
                    const config = SEVERITY_CONFIG[alert.severity];
                    const SevIcon = config.icon;
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${selectedAlert?.id === alert.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''} ${alert.status === 'resolved' ? 'opacity-50' : ''}`}
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${config.color}`}>
                            <SevIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge variant="outline" className={config.color}>{config.label}</Badge>
                              {alert.vessel && <Badge variant="secondary" className="text-xs">{alert.vessel}</Badge>}
                              <Badge variant="outline" className="text-xs">{alert.probability}% confiança</Badge>
                            </div>
                            <p className="text-sm font-medium mb-1">{alert.description}</p>
                            <div className="flex items-center gap-2">
                              {alert.modules.map(mod => {
                                const ModIcon = MODULE_ICONS[mod] || Ship;
                                return (
                                  <span key={mod} className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <ModIcon className="h-3 w-3" /> {mod}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalhes do Alerta</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAlert ? (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <Badge variant="outline" className={SEVERITY_CONFIG[selectedAlert.severity].color}>
                    {SEVERITY_CONFIG[selectedAlert.severity].label}
                  </Badge>
                  <p className="text-sm font-medium mt-2">{selectedAlert.description}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Módulos Afetados</p>
                  <div className="flex gap-2">
                    {selectedAlert.modules.map(mod => (
                      <Badge key={mod} variant="secondary">{mod}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ação Recomendada</p>
                  <p className="text-sm bg-primary/5 p-3 rounded-lg border border-primary/10">{selectedAlert.action}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Confiança</span>
                  <span className="font-bold">{selectedAlert.probability}%</span>
                </div>
                <Progress value={selectedAlert.probability} className="h-2" />

                {selectedAlert.status === 'active' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => acknowledgeAlert(selectedAlert.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Reconhecer
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => resolveAlert(selectedAlert.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Resolver
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Selecione um alerta para ver detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
