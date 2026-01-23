/**
 * Predictive Maintenance Dashboard - PATCH 1000
 * Visual interface for ML-powered maintenance predictions
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
  Thermometer,
  Activity,
  TrendingUp,
  Calendar,
  DollarSign,
  RefreshCw,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  predictiveMaintenanceEngine, 
  type PredictionResult, 
  type EquipmentMetrics 
} from '@/lib/ai/predictive-maintenance';

// Mock equipment data for demo
const MOCK_EQUIPMENT: EquipmentMetrics[] = [
  {
    equipmentId: 'eng-001',
    name: 'Main Engine #1',
    operatingHours: 12500,
    cycleCount: 8500,
    lastMaintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    avgTimeBetweenFailures: 5000,
    vibrationLevel: 3.2,
    temperature: 78,
    oilPressure: 42,
    fuelConsumption: 52,
  },
  {
    equipmentId: 'gen-001',
    name: 'Generator #1',
    operatingHours: 8200,
    cycleCount: 15000,
    lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    avgTimeBetweenFailures: 4000,
    vibrationLevel: 5.1,
    temperature: 92,
    oilPressure: 38,
  },
  {
    equipmentId: 'pump-001',
    name: 'Ballast Pump #1',
    operatingHours: 6500,
    cycleCount: 25000,
    lastMaintenance: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    avgTimeBetweenFailures: 3000,
    vibrationLevel: 2.8,
    temperature: 65,
  },
  {
    equipmentId: 'comp-001',
    name: 'Air Compressor',
    operatingHours: 4200,
    cycleCount: 12000,
    lastMaintenance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    avgTimeBetweenFailures: 2500,
    vibrationLevel: 4.8,
    temperature: 88,
    oilPressure: 28,
  },
];

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
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<PredictionResult | null>(null);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const results = await predictiveMaintenanceEngine.predictAll(
        MOCK_EQUIPMENT,
        new Map()
      );
      setPredictions(results);
    } catch (error) {
      console.error('Failed to load predictions:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
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

        <Card className="border-emerald-500/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Baixo</p>
                <p className="text-2xl font-bold text-emerald-500">{stats.low}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
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
                        <span className="text-sm text-muted-foreground">
                          Risco: {pred.riskScore.toFixed(0)}%
                        </span>
                      </div>
                      
                      <Progress 
                        value={pred.riskScore} 
                        className={cn(
                          "h-2",
                          pred.riskScore > 80 ? "[&>div]:bg-destructive" :
                          pred.riskScore > 60 ? "[&>div]:bg-orange-500" :
                          pred.riskScore > 40 ? "[&>div]:bg-amber-500" :
                          "[&>div]:bg-emerald-500"
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
                    {selectedEquipment.reasoning.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2">
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
                        <Badge key={i} variant="outline">{part}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button className="w-full">
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
    </div>
  );
}

export default PredictiveMaintenanceDashboard;
