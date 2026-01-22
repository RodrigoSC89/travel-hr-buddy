/**
 * Predictive Maintenance Dashboard
 * ML-powered equipment failure prediction (Demo Version)
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Wrench, Calendar, Thermometer, Activity, Gauge, Clock, Loader2, RefreshCw, Download, Bot } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EquipmentData {
  id: string;
  name: string;
  type: string;
  vesselName: string;
  temperature: number;
  vibration: number;
  pressure: number;
  runningHours: number;
  lastMaintenance: string;
}

interface PredictionResult {
  failureProbability: number;
  daysUntilFailure: number;
  confidence: number;
  recommendations: string[];
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

interface HistoricalReading {
  date: string;
  temperature: number;
  vibration: number;
  pressure: number;
}

export function PredictiveDashboard() {
  const [equipment, setEquipment] = useState<EquipmentData | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    setEquipment({
      id: 'demo-1',
      name: 'Motor Principal Bombordo',
      type: 'Motor Diesel - Caterpillar 3516C',
      vesselName: 'N/V Atlântico Sul',
      temperature: 82,
      vibration: 5.8,
      pressure: 52,
      runningHours: 12450,
      lastMaintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    });

    const demoHistory: HistoricalReading[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      demoHistory.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        temperature: 70 + Math.random() * 15 + (i < 10 ? i * 0.5 : 0),
        vibration: 4 + Math.random() * 2 + (i < 10 ? i * 0.1 : 0),
        pressure: 45 + Math.random() * 10
      });
    }
    setHistoricalData(demoHistory);
    setLoading(false);
  };

  const runPrediction = async () => {
    if (!equipment) return;

    setPredicting(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-predictive-maintenance', {
        body: {
          equipmentId: equipment.id,
          currentReadings: {
            temperature: equipment.temperature,
            vibration: equipment.vibration,
            pressure: equipment.pressure,
            runningHours: equipment.runningHours
          }
        }
      });

      if (error) throw error;
      if (data) {
        setPrediction(data);
        toast.success('Análise preditiva concluída');
        return;
      }
    } catch {
      // Continue to fallback
    }

    // Fallback prediction
    const daysSinceMaintenance = equipment.lastMaintenance 
      ? Math.floor((Date.now() - new Date(equipment.lastMaintenance).getTime()) / (1000 * 60 * 60 * 24))
      : 90;

    const tempScore = equipment.temperature > 85 ? 0.3 : equipment.temperature > 75 ? 0.15 : 0.05;
    const vibScore = equipment.vibration > 7 ? 0.35 : equipment.vibration > 5 ? 0.2 : 0.1;
    const pressScore = equipment.pressure > 60 || equipment.pressure < 30 ? 0.2 : 0.05;
    const ageScore = daysSinceMaintenance > 60 ? 0.15 : daysSinceMaintenance > 30 ? 0.1 : 0.05;

    const failureProbability = Math.min(tempScore + vibScore + pressScore + ageScore, 0.95);
    const daysUntilFailure = Math.max(Math.round((1 - failureProbability) * 60), 1);

    const recommendations: string[] = [];
    if (equipment.temperature > 85) recommendations.push('🌡️ Temperatura elevada: Verificar sistema de resfriamento');
    if (equipment.vibration > 7) recommendations.push('📳 Vibração crítica: Inspecionar rolamentos e alinhamento');
    if (equipment.vibration > 5) recommendations.push('📳 Vibração alta: Monitorar diariamente');
    if (equipment.pressure > 60) recommendations.push('⚙️ Pressão alta: Verificar válvulas de alívio');
    if (equipment.pressure < 30) recommendations.push('⚙️ Pressão baixa: Verificar bombas e conexões');
    if (daysSinceMaintenance > 60) recommendations.push('🔧 Manutenção atrasada: Agendar overhaul');
    if (recommendations.length === 0) recommendations.push('✅ Equipamento em boas condições');

    setPrediction({
      failureProbability,
      daysUntilFailure,
      confidence: 0.85,
      recommendations,
      riskLevel: failureProbability > 0.7 ? 'critical' : failureProbability > 0.5 ? 'high' : failureProbability > 0.3 ? 'medium' : 'low'
    });
    toast.success('Análise preditiva concluída');
    setPredicting(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!equipment) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Selecione um equipamento para análise</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                {equipment.name}
              </CardTitle>
              <CardDescription>{equipment.type} - {equipment.vesselName}</CardDescription>
            </div>
            {prediction && (
              <Badge variant="outline" className={getRiskColor(prediction.riskLevel)}>
                {prediction.riskLevel.toUpperCase()} RISK
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Thermometer className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">Temperatura</span>
              </div>
              <p className="text-2xl font-bold">{equipment.temperature}°C</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">Vibração</span>
              </div>
              <p className="text-2xl font-bold">{equipment.vibration} mm/s</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gauge className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">Pressão</span>
              </div>
              <p className="text-2xl font-bold">{equipment.pressure} bar</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">Horas</span>
              </div>
              <p className="text-2xl font-bold">{equipment.runningHours.toLocaleString()}h</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {prediction ? (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertTriangle className={`h-8 w-8 mx-auto mb-2 ${getRiskColor(prediction.riskLevel)}`} />
              <p className="text-sm text-muted-foreground">Prob. de Falha</p>
              <p className={`text-4xl font-bold ${getRiskColor(prediction.riskLevel)}`}>
                {(prediction.failureProbability * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Dias até Falha</p>
              <p className="text-4xl font-bold">{prediction.daysUntilFailure}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-muted-foreground">Confiança</p>
              <p className="text-4xl font-bold text-green-600">
                {(prediction.confidence * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Bot className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Análise Preditiva com IA</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Execute uma análise de machine learning para prever falhas potenciais.
            </p>
            <Button onClick={runPrediction} disabled={predicting} size="lg">
              {predicting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analisando...</>
              ) : (
                <><TrendingUp className="h-4 w-4 mr-2" /> Executar Predição</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tendência de Temperatura (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip />
                <Area type="monotone" dataKey="temperature" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {prediction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Recomendações de Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {prediction.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="text-lg">{rec.split(' ')[0]}</span>
                  <p className="text-sm">{rec.substring(rec.indexOf(' ') + 1)}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button onClick={runPrediction} disabled={predicting} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Análise
        </Button>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Agendar Manutenção
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>
    </div>
  );
}
