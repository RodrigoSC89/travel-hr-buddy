/**
 * REVOLUTIONARY AI - Predictive Maintenance Scheduler
 * Funcionalidade 3: Roteirizador de Manutenção Preditiva + Inventário
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wrench, AlertTriangle, Calendar, Package, TrendingUp, 
  Brain, Clock, Ship, CheckCircle, Activity, Gauge,
  ArrowRight, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

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

const MOCK_PREDICTIONS: PredictedMaintenance[] = [
  {
    id: '1',
    equipment: 'Motor Principal #1',
    vessel: 'Navio Atlas',
    type: 'predictive',
    priority: 'high',
    predictedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    confidence: 87,
    estimatedCost: 15000,
    partsNeeded: [
      { name: 'Filtro de óleo', quantity: 2, inStock: true },
      { name: 'Junta do cabeçote', quantity: 1, inStock: true },
      { name: 'Sensor de temperatura', quantity: 1, inStock: false }
    ],
    reason: 'Padrão de vibração anômalo detectado. Histórico indica necessidade de manutenção em 7-10 dias.',
    healthScore: 72
  },
  {
    id: '2',
    equipment: 'Sistema Hidráulico',
    vessel: 'Navio Vega',
    type: 'preventive',
    priority: 'medium',
    predictedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    confidence: 92,
    estimatedCost: 8500,
    partsNeeded: [
      { name: 'Óleo hidráulico 20L', quantity: 4, inStock: true },
      { name: 'Filtro hidráulico', quantity: 2, inStock: true }
    ],
    reason: 'Manutenção preventiva programada baseada em 5000 horas de operação.',
    healthScore: 85
  },
  {
    id: '3',
    equipment: 'Gerador Auxiliar #2',
    vessel: 'Navio Sirius',
    type: 'corrective',
    priority: 'critical',
    predictedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    confidence: 95,
    estimatedCost: 25000,
    partsNeeded: [
      { name: 'Alternador', quantity: 1, inStock: false },
      { name: 'Regulador de tensão', quantity: 1, inStock: false },
      { name: 'Kit de vedação', quantity: 1, inStock: true }
    ],
    reason: 'Queda de tensão detectada. Falha iminente do alternador. AÇÃO URGENTE.',
    healthScore: 35
  },
  {
    id: '4',
    equipment: 'Bomba de Lastro',
    vessel: 'Navio Atlas',
    type: 'predictive',
    priority: 'low',
    predictedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    confidence: 78,
    estimatedCost: 5000,
    partsNeeded: [
      { name: 'Selo mecânico', quantity: 2, inStock: true },
      { name: 'Rolamento', quantity: 4, inStock: true }
    ],
    reason: 'Leve aumento de temperatura detectado. Manutenção recomendada em 30 dias.',
    healthScore: 88
  }
];

export function PredictiveMaintenanceScheduler() {
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedMaintenance, setSelectedMaintenance] = useState<PredictedMaintenance | null>(null);

  const filteredPredictions = useMemo(() => {
    if (selectedPriority === 'all') return MOCK_PREDICTIONS;
    return MOCK_PREDICTIONS.filter(p => p.priority === selectedPriority);
  }, [selectedPriority]);

  const stats = useMemo(() => ({
    critical: MOCK_PREDICTIONS.filter(p => p.priority === 'critical').length,
    high: MOCK_PREDICTIONS.filter(p => p.priority === 'high').length,
    medium: MOCK_PREDICTIONS.filter(p => p.priority === 'medium').length,
    low: MOCK_PREDICTIONS.filter(p => p.priority === 'low').length,
    totalCost: MOCK_PREDICTIONS.reduce((acc, p) => acc + p.estimatedCost, 0),
    avgConfidence: Math.round(MOCK_PREDICTIONS.reduce((acc, p) => acc + p.confidence, 0) / MOCK_PREDICTIONS.length),
    partsNeeded: MOCK_PREDICTIONS.flatMap(p => p.partsNeeded).filter(p => !p.inStock).length
  }), []);

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
              <div className="space-y-3">
                {filteredPredictions.map((prediction, index) => (
                  <motion.div
                    key={prediction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
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
                    <Button className="w-full" size="sm">
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
