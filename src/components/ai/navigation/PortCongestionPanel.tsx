/**
 * Port Congestion Panel - Port congestion prediction
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Anchor, Clock, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CongestionPrediction {
  portName: string;
  currentOccupancy: number;
  currentWaitTime: number;
  predictions: Array<{
    time: Date;
    occupancy: number;
    waitTime: number;
    level: 'low' | 'moderate' | 'high' | 'critical';
  }>;
  peakTime: Date;
  peakOccupancy: number;
  bestArrivalWindow: {
    start: Date;
    end: Date;
    expectedWait: number;
  };
  alerts: string[];
}

interface PortCongestionPanelProps {
  prediction?: CongestionPrediction;
  isLoading?: boolean;
  className?: string;
}

const LEVEL_STYLES = {
  low: { color: 'text-green-500', bg: 'bg-green-500' },
  moderate: { color: 'text-yellow-500', bg: 'bg-yellow-500' },
  high: { color: 'text-orange-500', bg: 'bg-orange-500' },
  critical: { color: 'text-red-500', bg: 'bg-red-500' },
};

export function PortCongestionPanel({ prediction, isLoading, className }: PortCongestionPanelProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Anchor className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecione um porto para previsão</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentLevel = prediction.currentOccupancy >= 90 ? 'critical' :
                      prediction.currentOccupancy >= 75 ? 'high' :
                      prediction.currentOccupancy >= 50 ? 'moderate' : 'low';

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Anchor className="h-5 w-5" />
              {prediction.portName}
            </CardTitle>
            <CardDescription>Previsão de Congestionamento</CardDescription>
          </div>
          <Badge className={cn(LEVEL_STYLES[currentLevel].bg, "text-white")}>
            {currentLevel === 'low' ? 'Baixo' :
             currentLevel === 'moderate' ? 'Moderado' :
             currentLevel === 'high' ? 'Alto' : 'Crítico'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded">
            <div className={cn("text-3xl font-bold", LEVEL_STYLES[currentLevel].color)}>
              {prediction.currentOccupancy}%
            </div>
            <p className="text-xs text-muted-foreground">Ocupação Atual</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded">
            <div className="text-3xl font-bold flex items-center justify-center gap-1">
              <Clock className="h-5 w-5" />
              {prediction.currentWaitTime}h
            </div>
            <p className="text-xs text-muted-foreground">Tempo de Espera</p>
          </div>
        </div>

        {/* Timeline visualization */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Previsão 72h</p>
          <div className="flex gap-0.5">
            {prediction.predictions.slice(0, 24).map((p, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-6 rounded-sm transition-all",
                  LEVEL_STYLES[p.level].bg,
                  "opacity-80 hover:opacity-100"
                )}
                title={`${format(p.time, 'HH:mm')}: ${p.occupancy}%`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Agora</span>
            <span>+24h</span>
          </div>
        </div>

        {/* Best Arrival Window */}
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm font-medium flex items-center gap-1 mb-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Melhor Janela de Chegada
          </p>
          <div className="flex items-center justify-between text-sm">
            <span>
              {format(prediction.bestArrivalWindow.start, 'dd/MM HH:mm', { locale: ptBR })} - 
              {format(prediction.bestArrivalWindow.end, 'HH:mm', { locale: ptBR })}
            </span>
            <Badge variant="outline" className="text-green-500">
              ~{prediction.bestArrivalWindow.expectedWait}h espera
            </Badge>
          </div>
        </div>

        {/* Peak Warning */}
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm font-medium flex items-center gap-1 mb-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Pico Previsto
          </p>
          <div className="flex items-center justify-between text-sm">
            <span>{format(prediction.peakTime, 'dd/MM HH:mm', { locale: ptBR })}</span>
            <Badge variant="outline" className="text-red-500">
              {prediction.peakOccupancy}% ocupação
            </Badge>
          </div>
        </div>

        {/* Alerts */}
        {prediction.alerts.length > 0 && (
          <div className="space-y-1">
            {prediction.alerts.slice(0, 2).map((alert, i) => (
              <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                {alert}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PortCongestionPanel;
