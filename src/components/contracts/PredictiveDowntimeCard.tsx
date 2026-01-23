/**
 * PredictiveDowntimeCard - Predição de Downtime com IA
 * Analisa padrões históricos e prevê downtimes futuros
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Brain, TrendingUp, AlertTriangle, Clock, Ship, 
  Zap, Calendar, BarChart3, ArrowRight, RefreshCw,
  Target, Lightbulb, ShieldCheck
} from "lucide-react";

interface Prediction {
  vessel_id: string;
  vessel_name: string;
  probability: number;
  estimated_date: string;
  predicted_duration_hours: number;
  predicted_cause: string;
  confidence: number;
  risk_factors: string[];
  preventive_actions: string[];
}

interface PredictiveDowntimeCardProps {
  contractId?: string;
  vesselId?: string;
}

export function PredictiveDowntimeCard({ contractId, vesselId }: PredictiveDowntimeCardProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);

  const runPrediction = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('contract-predict-downtime', {
        body: { contractId, vesselId }
      });

      if (error) throw error;

      if (data?.predictions) {
        setPredictions(data.predictions);
        setLastAnalysis(new Date().toISOString());
        toast.success('Análise preditiva concluída!');
      }
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error('Erro na análise preditiva');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (probability: number) => {
    if (probability >= 0.7) return 'text-red-500';
    if (probability >= 0.4) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskBadge = (probability: number) => {
    if (probability >= 0.7) return <Badge variant="destructive">Alto Risco</Badge>;
    if (probability >= 0.4) return <Badge className="bg-yellow-500">Risco Moderado</Badge>;
    return <Badge className="bg-green-500">Baixo Risco</Badge>;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Predição de Downtime</CardTitle>
              <p className="text-sm text-muted-foreground">
                IA analisa padrões e prevê paradas futuras
              </p>
            </div>
          </div>
          <Button onClick={runPrediction} disabled={loading} size="sm">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Executar Predição
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {predictions.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Execute a análise preditiva para identificar riscos de downtime
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              A IA analisa histórico de manutenções, clima, certificações e padrões operacionais
            </p>
          </div>
        ) : (
          <>
            {lastAnalysis && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Última análise: {new Date(lastAnalysis).toLocaleString('pt-BR')}
              </div>
            )}

            <div className="space-y-4">
              {predictions.map((pred, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Ship className="h-5 w-5 text-primary" />
                      <span className="font-medium">{pred.vessel_name}</span>
                    </div>
                    {getRiskBadge(pred.probability)}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Target className="h-3 w-3" />
                        Probabilidade
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={pred.probability * 100} className="h-2" />
                        <span className={`font-bold ${getRiskColor(pred.probability)}`}>
                          {(pred.probability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Data Estimada
                      </div>
                      <p className="font-medium">
                        {new Date(pred.estimated_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Duração Prevista
                      </div>
                      <p className="font-medium">{pred.predicted_duration_hours}h</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1 mb-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Causa Provável
                      </p>
                      <p className="text-sm text-muted-foreground">{pred.predicted_cause}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium flex items-center gap-1 mb-2">
                        <BarChart3 className="h-4 w-4 text-orange-500" />
                        Fatores de Risco
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {pred.risk_factors.map((factor, fIdx) => (
                          <Badge key={fIdx} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium flex items-center gap-1 mb-2">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        Ações Preventivas Recomendadas
                      </p>
                      <ul className="space-y-1">
                        {pred.preventive_actions.map((action, aIdx) => (
                          <li key={aIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Lightbulb className="h-3 w-3" />
                      Confiança do modelo: {(pred.confidence * 100).toFixed(0)}%
                    </div>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-1" />
                      Agendar Manutenção
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
