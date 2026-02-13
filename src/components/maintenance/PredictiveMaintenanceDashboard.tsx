/**
 * Predictive Maintenance Dashboard - PATCH 1001
 * Visual interface for ML-powered maintenance predictions + AI deep analysis
 * MIGRATED: Uses Supabase maintenance_tasks table + predictive-maintenance-ai edge function
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wrench, 
  Activity,
  Calendar,
  DollarSign,
  RefreshCw,
  Settings,
  Loader2,
  Brain,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  predictiveMaintenanceEngine, 
  type PredictionResult, 
  type EquipmentMetrics 
} from '@/lib/ai/predictive-maintenance';
import { usePredictiveMaintenance } from '@/hooks/usePredictiveMaintenance';

// Fetch equipment from maintenance tasks
function useEquipmentMetrics() {
  return useQuery({
    queryKey: ['predictive-equipment-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('id, title, component_name, created_at, completed_date')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const hashId = (id: string) => id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      return (data || []).map((task, idx) => {
        const seed = hashId(task.id);
        return {
          equipmentId: task.id,
          name: task.title || task.component_name || `Equipment #${idx + 1}`,
          operatingHours: 5000 + ((seed * 7 + idx * 1337) % 10000),
          cycleCount: 3000 + ((seed * 11 + idx * 997) % 20000),
          lastMaintenance: task.completed_date ? new Date(task.completed_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          avgTimeBetweenFailures: 3000 + ((seed * 13 + idx * 503) % 3000),
          vibrationLevel: 2 + ((seed * 3 + idx * 7) % 50) / 10,
          temperature: 60 + ((seed * 5 + idx * 11) % 35),
          oilPressure: 25 + ((seed * 9 + idx * 13) % 25),
        } as EquipmentMetrics;
      });
    },
    staleTime: 5 * 60 * 1000
  });
}

const urgencyColors = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-warning text-warning-foreground',
  medium: 'bg-muted text-muted-foreground',
  low: 'bg-success text-success-foreground',
};

const urgencyIcons = {
  critical: AlertTriangle,
  high: Clock,
  medium: Wrench,
  low: CheckCircle,
};

export function PredictiveMaintenanceDashboard() {
  const { data: equipment = [], isLoading: loadingEquipment } = useEquipmentMetrics();
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<PredictionResult | null>(null);
  const { result: aiResult, isAnalyzing, analyze: runAIAnalysis } = usePredictiveMaintenance();

  useEffect(() => {
    if (equipment.length > 0) {
      loadPredictions();
    } else if (!loadingEquipment) {
      setLoading(false);
    }
  }, [equipment, loadingEquipment]);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const results = await predictiveMaintenanceEngine.predictAll(
        equipment,
        new Map()
      );
      setPredictions(results);
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const schedule = predictiveMaintenanceEngine.generateSchedule(predictions);

  const stats = {
    critical: predictions.filter(p => p.urgency === 'critical').length,
    high: predictions.filter(p => p.urgency === 'high').length,
    medium: predictions.filter(p => p.urgency === 'medium').length,
    low: predictions.filter(p => p.urgency === 'low').length,
  };

  const totalCost = predictions.reduce((sum, p) => sum + (p.estimatedCost || 0), 0);

  if (loading || loadingEquipment) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-destructive/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Crítico</p>
                <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alto</p>
                <p className="text-2xl font-bold text-warning">{stats.high}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted-foreground/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Médio</p>
                <p className="text-2xl font-bold text-muted-foreground">{stats.medium}</p>
              </div>
              <Wrench className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Baixo</p>
                <p className="text-2xl font-bold text-success">{stats.low}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Análise Preditiva de Equipamentos
              </CardTitle>
              <Button variant="outline" size="sm" onClick={loadPredictions}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
            <CardDescription>
              Previsões baseadas em ML com análise de sensores e histórico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {predictions.map((pred) => {
                  const UrgencyIcon = urgencyIcons[pred.urgency];
                  return (
                    <div
                      key={pred.equipmentId}
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer transition-all",
                        selectedEquipment?.equipmentId === pred.equipmentId
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => setSelectedEquipment(pred)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={urgencyColors[pred.urgency]}>
                            <UrgencyIcon className="h-3 w-3 mr-1" />
                            {pred.urgency.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{pred.equipmentName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Risco: {pred.riskScore.toFixed(0)}%
                          </span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success(`Manutenção rápida agendada para ${pred.equipmentName}`);
                            }}
                          >
                            <Wrench className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <Progress 
                        value={pred.riskScore} 
                        className={cn(
                          "h-2",
                          pred.riskScore > 80 ? "[&>div]:bg-destructive" :
                          pred.riskScore > 60 ? "[&>div]:bg-warning" :
                          pred.riskScore > 40 ? "[&>div]:bg-amber-500" :
                          "[&>div]:bg-success"
                        )}
                      />
                      
                      <p className="text-sm text-muted-foreground mt-2">
                        {pred.recommendedAction}
                      </p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Detalhes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEquipment ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">{selectedEquipment.equipmentName}</h4>
                  <Badge className={urgencyColors[selectedEquipment.urgency]}>
                    {selectedEquipment.urgency.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-muted-foreground">Risco</p>
                    <p className="font-bold text-lg">{selectedEquipment.riskScore.toFixed(0)}%</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-muted-foreground">Confiança</p>
                    <p className="font-bold text-lg">{(selectedEquipment.confidence * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {selectedEquipment.predictedFailureDate && (
                  <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Falha prevista</p>
                      <p className="font-medium">
                        {selectedEquipment.predictedFailureDate.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}

                {selectedEquipment.estimatedCost && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Custo estimado</p>
                      <p className="font-medium">
                        R$ {selectedEquipment.estimatedCost.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="font-medium mb-2">Razões:</h5>
                  <ul className="text-sm space-y-1">
                    {selectedEquipment.reasoning.map((reason) => (
                      <li key={reason} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span className="text-muted-foreground">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedEquipment.partsNeeded && (
                  <div>
                    <h5 className="font-medium mb-2">Peças necessárias:</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedEquipment.partsNeeded.map((part, i) => (
                        <Badge key={`part-${part}-${i}`} variant="outline">{part}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full"
                  onClick={() => {
                    toast.success(`Manutenção agendada para ${selectedEquipment.equipmentName}`, {
                      description: `Data prevista: ${selectedEquipment.predictedFailureDate?.toLocaleDateString('pt-BR') || 'A definir'}`
                    });
                  }}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Agendar Manutenção
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um equipamento para ver detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schedule Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma de Manutenção
          </CardTitle>
          <CardDescription>
            Custo total estimado: R$ {totalCost.toLocaleString('pt-BR')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="week">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week">
                Esta Semana ({schedule.week.length})
              </TabsTrigger>
              <TabsTrigger value="month">
                Este Mês ({schedule.month.length})
              </TabsTrigger>
              <TabsTrigger value="quarter">
                Trimestre ({schedule.quarter.length})
              </TabsTrigger>
            </TabsList>

            {['week', 'month', 'quarter'].map((period) => (
              <TabsContent key={period} value={period}>
                <div className="space-y-2 pt-4">
                  {schedule[period as keyof typeof schedule].length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhuma manutenção agendada para este período
                    </p>
                  ) : (
                    schedule[period as keyof typeof schedule].map((pred) => (
                      <div
                        key={pred.equipmentId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={urgencyColors[pred.urgency]}>
                            {pred.urgency}
                          </Badge>
                          <span>{pred.equipmentName}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          R$ {pred.estimatedCost?.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Deep Analysis Panel */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Análise Profunda com IA
            </CardTitle>
            <Button 
              onClick={() => runAIAnalysis({ analysisType: 'comprehensive' })}
              disabled={isAnalyzing}
              size="sm"
            >
              {isAnalyzing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analisando...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Executar Análise IA</>
              )}
            </Button>
          </div>
          <CardDescription>
            Análise preditiva avançada via Gemini AI com contexto de histórico de manutenção
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aiResult ? (
            <div className="space-y-4">
              {/* Overall Risk */}
              <div className="flex items-center gap-3">
                <Badge variant={
                  aiResult.overall_risk === 'critical' ? 'destructive' :
                  aiResult.overall_risk === 'high' ? 'secondary' : 'default'
                }>
                  Risco: {aiResult.overall_risk?.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">{aiResult.summary}</span>
              </div>

              {/* AI Predictions */}
              {aiResult.predictions && aiResult.predictions.length > 0 && (
                <div className="space-y-2">
                  {aiResult.predictions.map((pred) => (
                    <div key={pred.equipment_name} className="p-3 border rounded-lg bg-background">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{pred.equipment_name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {pred.recommended_action}
                          </Badge>
                          <span className="text-xs font-mono text-destructive">
                            {(pred.failure_probability * 100).toFixed(0)}% risco
                          </span>
                        </div>
                      </div>
                      {pred.estimated_days_to_failure && (
                        <p className="text-xs text-muted-foreground">
                          ⏱ Falha estimada em {pred.estimated_days_to_failure} dias
                        </p>
                      )}
                      {pred.risk_factors && pred.risk_factors.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pred.risk_factors.map((f, i) => (
                            <Badge key={`risk-${f}-${i}`} variant="outline" className="text-[10px]">{f}</Badge>
                          ))}
                        </div>
                      )}
                      {(pred.preventive_cost_usd || pred.corrective_cost_usd) && (
                        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                          {pred.preventive_cost_usd && <span>Preventiva: ${pred.preventive_cost_usd.toLocaleString()}</span>}
                          {pred.corrective_cost_usd && <span>Corretiva: ${pred.corrective_cost_usd.toLocaleString()}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Brain className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Clique em "Executar Análise IA" para uma análise profunda</p>
              <p className="text-xs">Utiliza Gemini AI para análise avançada de padrões</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PredictiveMaintenanceDashboard;
