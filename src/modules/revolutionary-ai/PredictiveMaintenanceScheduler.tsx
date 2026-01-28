/**
 * REVOLUTIONARY AI - Predictive Maintenance Scheduler
 * Funcionalidade 3: Roteirizador de Manutenção Preditiva + Inventário
 * PATCH: Integrated with Supabase ai_maintenance_predictions table
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wrench, AlertTriangle, Calendar, Package, TrendingUp, 
  Brain, Clock, Ship, CheckCircle, Activity, Gauge,
  ArrowRight, Zap, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PredictedMaintenance {
  id: string;
  equipment: string;
  vessel: string;
  type: 'predictive' | 'preventive' | 'corrective';
  priority: 'critical' | 'high' | 'medium' | 'low';
  predictedDate: Date;
  confidence: number;
  estimatedCost: number;
  partsNeeded: Array<{ name: string; quantity: number; inStock: boolean }>;
  reason: string;
  healthScore: number;
}

export function PredictiveMaintenanceScheduler() {
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedMaintenance, setSelectedMaintenance] = useState<PredictedMaintenance | null>(null);
  const [predictions, setPredictions] = useState<PredictedMaintenance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch maintenance predictions from database
  useEffect(() => {
    const fetchPredictions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('ai_maintenance_predictions')
          .select(`
            id,
            equipment_id,
            equipment_name,
            failure_probability,
            predicted_failure_date,
            recommended_action,
            risk_factors,
            confidence,
            status,
            vessel_id,
            vessels(name)
          `)
          .order('failure_probability', { ascending: false })
          .limit(50);

        if (error) throw error;

        // Transform database records to component format
        const transformedData: PredictedMaintenance[] = (data || []).map((item) => {
          const riskFactors = item.risk_factors as Record<string, unknown> || {};
          const partsFromRisk = riskFactors.parts_needed as Array<{ name: string; quantity: number; inStock: boolean }> || [];
          
          // Determine priority based on failure probability
          let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';
          if (item.failure_probability >= 0.8) priority = 'critical';
          else if (item.failure_probability >= 0.6) priority = 'high';
          else if (item.failure_probability >= 0.4) priority = 'medium';
          
          // Determine type based on status
          let type: 'predictive' | 'preventive' | 'corrective' = 'predictive';
          if (item.status === 'urgent') type = 'corrective';
          else if (item.status === 'scheduled') type = 'preventive';

          return {
            id: item.id,
            equipment: item.equipment_name,
            vessel: (item.vessels as { name: string } | null)?.name || 'N/A',
            type,
            priority,
            predictedDate: item.predicted_failure_date 
              ? new Date(item.predicted_failure_date)
              : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            confidence: Math.round((item.confidence || item.failure_probability) * 100),
            estimatedCost: (riskFactors.estimated_cost as number) || 5000,
            partsNeeded: partsFromRisk.length > 0 ? partsFromRisk : [
              { name: 'Peça padrão', quantity: 1, inStock: true }
            ],
            reason: item.recommended_action || 'Manutenção preventiva recomendada.',
            healthScore: Math.round((1 - item.failure_probability) * 100)
          };
        });

        setPredictions(transformedData);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        toast({
          title: "Erro ao carregar previsões",
          description: "Não foi possível carregar as previsões de manutenção.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, [toast]);

  const filteredPredictions = useMemo(() => {
    if (selectedPriority === 'all') return predictions;
    return predictions.filter(p => p.priority === selectedPriority);
  }, [selectedPriority, predictions]);

  const stats = useMemo(() => ({
    critical: predictions.filter(p => p.priority === 'critical').length,
    high: predictions.filter(p => p.priority === 'high').length,
    medium: predictions.filter(p => p.priority === 'medium').length,
    low: predictions.filter(p => p.priority === 'low').length,
    totalCost: predictions.reduce((acc, p) => acc + p.estimatedCost, 0),
    avgConfidence: predictions.length > 0 
      ? Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length)
      : 0,
    partsNeeded: predictions.flatMap(p => p.partsNeeded).filter(p => !p.inStock).length
  }), [predictions]);

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[priority as keyof typeof colors] || 'bg-muted';
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-amber-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const handleScheduleMaintenance = async (prediction: PredictedMaintenance) => {
    try {
      // Update the prediction status in the database
      const { error } = await supabase
        .from('ai_maintenance_predictions')
        .update({ status: 'scheduled' })
        .eq('id', prediction.id);

      if (error) throw error;

      toast({
        title: "Manutenção agendada",
        description: `Manutenção para ${prediction.equipment} foi agendada com sucesso.`
      });

      // Update local state
      setPredictions(prev => prev.map(p => 
        p.id === prediction.id ? { ...p, type: 'preventive' as const } : p
      ));
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      toast({
        title: "Erro ao agendar",
        description: "Não foi possível agendar a manutenção.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando previsões...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-sm text-muted-foreground">Críticas</span>
            </div>
            <p className="text-3xl font-bold text-red-400 mt-2">{stats.critical}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-400" />
              <span className="text-sm text-muted-foreground">Confiança IA</span>
            </div>
            <p className="text-3xl font-bold text-amber-400 mt-2">{stats.avgConfidence}%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-muted-foreground">Peças Faltando</span>
            </div>
            <p className="text-3xl font-bold text-blue-400 mt-2">{stats.partsNeeded}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              <span className="text-sm text-muted-foreground">Custo Estimado</span>
            </div>
            <p className="text-2xl font-bold text-green-400 mt-2">
              R$ {stats.totalCost.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predictions List */}
        <div className="lg:col-span-2">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span>Previsões de Manutenção</span>
                  <Badge variant="secondary">{predictions.length} registros</Badge>
                </div>
                <div className="flex gap-2">
                  {['all', 'critical', 'high', 'medium', 'low'].map(priority => (
                    <Button
                      key={priority}
                      variant={selectedPriority === priority ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPriority(priority)}
                      className="text-xs"
                    >
                      {priority === 'all' ? 'Todas' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPredictions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma previsão de manutenção encontrada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPredictions.map((prediction, index) => (
                    <motion.div
                      key={prediction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all hover:border-primary/50 ${
                          selectedMaintenance?.id === prediction.id ? 'border-primary ring-2 ring-primary/20' : ''
                        }`}
                        onClick={() => setSelectedMaintenance(prediction)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Wrench className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{prediction.equipment}</span>
                                <Badge variant="outline" className={getPriorityColor(prediction.priority)}>
                                  {prediction.priority}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Ship className="h-3 w-3" />
                                {prediction.vessel}
                                <span>•</span>
                                <Calendar className="h-3 w-3" />
                                {prediction.predictedDate.toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <Gauge className={`h-4 w-4 ${getHealthColor(prediction.healthScore)}`} />
                                <span className={`font-bold ${getHealthColor(prediction.healthScore)}`}>
                                  {prediction.healthScore}%
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">Saúde</span>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">{prediction.reason}</p>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Brain className="h-3 w-3 text-primary" />
                                {prediction.confidence}% confiança
                              </span>
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {prediction.partsNeeded.length} peças
                              </span>
                            </div>
                            <span className="font-semibold">
                              R$ {prediction.estimatedCost.toLocaleString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detail Panel */}
        <div>
          <Card className="border-border/50 sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {selectedMaintenance ? 'Detalhes' : 'Selecione uma manutenção'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMaintenance ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">{selectedMaintenance.equipment}</h3>
                    <Badge variant="outline" className={getPriorityColor(selectedMaintenance.priority)}>
                      {selectedMaintenance.priority}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Saúde do Equipamento</p>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedMaintenance.healthScore} className="h-2 flex-1" />
                      <span className={`font-bold ${getHealthColor(selectedMaintenance.healthScore)}`}>
                        {selectedMaintenance.healthScore}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Confiança da Previsão</p>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedMaintenance.confidence} className="h-2 flex-1" />
                      <span className="font-bold text-primary">{selectedMaintenance.confidence}%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Peças Necessárias</p>
                    <div className="space-y-2">
                      {selectedMaintenance.partsNeeded.map((part, i) => (
                        <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                          <span>{part.name} (x{part.quantity})</span>
                          <Badge variant={part.inStock ? 'default' : 'destructive'} className="text-xs">
                            {part.inStock ? 'Em estoque' : 'Faltando'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => handleScheduleMaintenance(selectedMaintenance)}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Agendar Manutenção
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Package className="h-4 w-4 mr-2" />
                      Reservar Peças
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Clique em uma previsão para ver detalhes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PredictiveMaintenanceScheduler;
