/**
 * Predictive Maintenance Card - ONNX-powered failure prediction
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Wrench, AlertTriangle, TrendingUp, Calendar, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FailurePrediction {
  equipmentId: string;
  equipmentName: string;
  failureProbability: number;
  predictedFailureDate?: Date;
  remainingUsefulLife: number; // hours
  riskFactors: Array<{ factor: string; contribution: number }>;
  recommendedActions: string[];
  confidence: number;
  lastAnalysis: Date;
}

interface PredictiveMaintenanceCardProps {
  prediction?: FailurePrediction;
  isLoading?: boolean;
  onRunAnalysis?: () => void;
  className?: string;
}

export function PredictiveMaintenanceCard({ 
  prediction, 
  isLoading,
  onRunAnalysis,
  className 
}: PredictiveMaintenanceCardProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
            <div className="h-24 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            ONNX Predictive Maintenance
          </CardTitle>
          <CardDescription>Modelo ML embarcado para predição offline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecione um equipamento para análise</p>
            {onRunAnalysis && (
              <Button onClick={onRunAnalysis} className="mt-4">
                Iniciar Análise
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const probabilityColor = prediction.failureProbability < 30 ? 'text-green-500' :
                          prediction.failureProbability < 60 ? 'text-yellow-500' :
                          prediction.failureProbability < 80 ? 'text-orange-500' : 'text-red-500';

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{prediction.equipmentName}</CardTitle>
            <CardDescription>Análise Preditiva ONNX</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            {prediction.confidence}% confiança
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Failure Probability */}
        <div className="text-center py-4 bg-muted/50 rounded-lg">
          <div className={cn("text-4xl font-bold", probabilityColor)}>
            {prediction.failureProbability}%
          </div>
          <p className="text-sm text-muted-foreground">Probabilidade de Falha</p>
          <Progress 
            value={prediction.failureProbability} 
            className="h-2 mt-2 max-w-[200px] mx-auto"
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-medium">{prediction.remainingUsefulLife}h</div>
            <p className="text-xs text-muted-foreground">Vida Útil Restante</p>
          </div>
          {prediction.predictedFailureDate && (
            <div className="text-center p-3 bg-muted/30 rounded">
              <Calendar className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-sm font-medium">
                {format(prediction.predictedFailureDate, 'dd/MM', { locale: ptBR })}
              </div>
              <p className="text-xs text-muted-foreground">Falha Prevista</p>
            </div>
          )}
        </div>

        {/* Risk Factors */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Fatores de Risco</p>
          {prediction.riskFactors.slice(0, 3).map((factor, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs flex-1 truncate">{factor.factor}</span>
              <Progress value={factor.contribution} className="h-1.5 w-16" />
              <span className="text-xs w-8 text-right">{factor.contribution}%</span>
            </div>
          ))}
        </div>

        {/* Recommended Actions */}
        {prediction.recommendedActions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Ações Recomendadas
            </p>
            <ul className="text-xs space-y-1">
              {prediction.recommendedActions.slice(0, 3).map((action, i) => (
                <li key={i} className="text-muted-foreground">• {action}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            Agendar Manutenção
          </Button>
          {onRunAnalysis && (
            <Button size="sm" variant="outline" onClick={onRunAnalysis}>
              <TrendingUp className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Última análise: {format(prediction.lastAnalysis, 'dd/MM HH:mm', { locale: ptBR })}
        </p>
      </CardContent>
    </Card>
  );
}

export default PredictiveMaintenanceCard;
