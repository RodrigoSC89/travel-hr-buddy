/**
 * ETA Prediction Card - High accuracy arrival prediction
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, MapPin, Navigation, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ETAPrediction {
  voyageId: string;
  destination: string;
  originalETA: Date;
  predictedETA: Date;
  confidence: number;
  accuracy: number;
  factors: Array<{
    factor: string;
    impact: number; // minutes, positive = delay
    confidence: number;
  }>;
  alternativeETAs: Array<{
    scenario: string;
    eta: Date;
    probability: number;
  }>;
  lastUpdated: Date;
}

interface ETAPredictionCardProps {
  prediction?: ETAPrediction;
  isLoading?: boolean;
  className?: string;
}

export function ETAPredictionCard({ prediction, isLoading, className }: ETAPredictionCardProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded w-2/3 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
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
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecione uma viagem para previsão ETA</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const etaDiff = prediction.predictedETA.getTime() - prediction.originalETA.getTime();
  const etaDiffHours = etaDiff / (1000 * 60 * 60);
  const isDelayed = etaDiff > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              ETA Predictor
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {prediction.destination}
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {prediction.accuracy}% acurácia
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main ETA */}
        <div className="text-center py-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">ETA Previsto</p>
          <div className="text-3xl font-bold">
            {format(prediction.predictedETA, 'dd/MM HH:mm', { locale: ptBR })}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(prediction.predictedETA, { addSuffix: true, locale: ptBR })}
          </p>
          
          {/* Delay indicator */}
          {Math.abs(etaDiffHours) > 0.5 && (
            <Badge 
              className={cn(
                "mt-2",
                isDelayed ? "bg-red-500" : "bg-green-500"
              )}
            >
              {isDelayed ? '+' : ''}{etaDiffHours.toFixed(1)}h vs original
            </Badge>
          )}
        </div>

        {/* Confidence */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Confiança da Previsão</span>
            <span>{prediction.confidence}%</span>
          </div>
          <Progress value={prediction.confidence} className="h-2" />
        </div>

        {/* Impact Factors */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Fatores de Impacto</p>
          {prediction.factors.slice(0, 4).map((factor, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{factor.factor}</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  factor.impact > 0 ? "text-red-500" : factor.impact < 0 ? "text-green-500" : ""
                )}
              >
                {factor.impact > 0 ? '+' : ''}{factor.impact} min
              </Badge>
            </div>
          ))}
        </div>

        {/* Alternative Scenarios */}
        {prediction.alternativeETAs.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Cenários Alternativos
            </p>
            {prediction.alternativeETAs.slice(0, 2).map((alt, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded mb-1">
                <span>{alt.scenario}</span>
                <div className="flex items-center gap-2">
                  <span>{format(alt.eta, 'dd/MM HH:mm')}</span>
                  <Badge variant="outline">{alt.probability}%</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Atualizado: {format(prediction.lastUpdated, 'HH:mm', { locale: ptBR })}
        </p>
      </CardContent>
    </Card>
  );
}

export default ETAPredictionCard;
