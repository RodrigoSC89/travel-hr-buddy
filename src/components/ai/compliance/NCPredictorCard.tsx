/**
 * NC Predictor Card - Non-conformity prediction for PSC inspections
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Shield, CheckCircle, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";

interface NCPrediction {
  vesselId: string;
  vesselName: string;
  overallRisk: number;
  predictedNCs: Array<{
    area: string;
    probability: number;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
  }>;
  inspectionReadiness: number;
  lastAnalysis: Date;
}

interface NCPredictorCardProps {
  prediction?: NCPrediction;
  isLoading?: boolean;
  className?: string;
}

export function NCPredictorCard({ prediction, isLoading, className }: NCPredictorCardProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded" />)}
            </div>
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
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecione uma embarcação para análise PSC</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskColor = prediction.overallRisk < 30 ? 'text-green-500' :
                   prediction.overallRisk < 60 ? 'text-yellow-500' : 'text-red-500';

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileWarning className="h-5 w-5" />
              NC Predictor
            </CardTitle>
            <CardDescription>Previsão de não-conformidades PSC</CardDescription>
          </div>
          <Badge variant="outline" className={cn(
            prediction.inspectionReadiness >= 80 ? "bg-green-500/10 text-green-500" :
            prediction.inspectionReadiness >= 60 ? "bg-yellow-500/10 text-yellow-500" :
            "bg-red-500/10 text-red-500"
          )}>
            {prediction.inspectionReadiness}% preparado
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Risk */}
        <div className="text-center py-3 bg-muted/50 rounded-lg">
          <div className={cn("text-4xl font-bold", riskColor)}>
            {prediction.overallRisk}%
          </div>
          <p className="text-sm text-muted-foreground">Risco de NC</p>
        </div>

        {/* Predicted NCs */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Áreas de Risco</p>
          {prediction.predictedNCs.slice(0, 5).map((nc, i) => (
            <div 
              key={i}
              className={cn(
                "p-3 rounded-lg border",
                nc.severity === 'high' && "bg-red-500/10 border-red-500/20",
                nc.severity === 'medium' && "bg-yellow-500/10 border-yellow-500/20",
                nc.severity === 'low' && "bg-green-500/10 border-green-500/20"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{nc.area}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {nc.probability}%
                  </Badge>
                  {nc.severity === 'high' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{nc.recommendation}</p>
            </div>
          ))}
        </div>

        {/* Inspection Readiness */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Prontidão para Inspeção</span>
            <span>{prediction.inspectionReadiness}%</span>
          </div>
          <Progress value={prediction.inspectionReadiness} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

export default NCPredictorCard;
