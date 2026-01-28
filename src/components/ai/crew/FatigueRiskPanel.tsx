/**
 * Fatigue Risk Panel - Shows fatigue risk assessment
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Moon, AlertTriangle, Clock, TrendingDown, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FatigueAssessment {
  crewMemberId: string;
  crewMemberName: string;
  fatigueScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  factors: Array<{ factor: string; impact: number; trend: string }>;
  predictions: Array<{ hours: number; predictedScore: number }>;
  alerts: Array<{ priority: string; title: string; message: string }>;
  mlcCompliant: boolean;
  stcwCompliant: boolean;
}

interface FatigueRiskPanelProps {
  assessment?: FatigueAssessment;
  isLoading?: boolean;
  className?: string;
}

const RISK_STYLES = {
  low: { color: 'text-green-500', bg: 'bg-green-500', label: 'Baixo' },
  moderate: { color: 'text-yellow-500', bg: 'bg-yellow-500', label: 'Moderado' },
  high: { color: 'text-orange-500', bg: 'bg-orange-500', label: 'Alto' },
  critical: { color: 'text-red-500', bg: 'bg-red-500', label: 'Crítico' },
};

export function FatigueRiskPanel({ assessment, isLoading, className }: FatigueRiskPanelProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assessment) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Moon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecione um tripulante para análise de fadiga</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskStyle = RISK_STYLES[assessment.riskLevel];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Fatigue Risk AI
            </CardTitle>
            <CardDescription>{assessment.crewMemberName}</CardDescription>
          </div>
          <Badge className={cn(riskStyle.bg, "text-white")}>
            Risco {riskStyle.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fatigue Score */}
        <div className="text-center py-4">
          <div className={cn(
            "text-5xl font-bold",
            assessment.fatigueScore <= 30 ? "text-green-500" :
            assessment.fatigueScore <= 50 ? "text-yellow-500" :
            assessment.fatigueScore <= 75 ? "text-orange-500" : "text-red-500"
          )}>
            {assessment.fatigueScore}%
          </div>
          <p className="text-sm text-muted-foreground">Nível de Fadiga</p>
          <Progress 
            value={assessment.fatigueScore} 
            className={cn("h-3 mt-2", assessment.fatigueScore > 75 && "bg-red-200")}
          />
        </div>

        {/* Compliance Badges */}
        <div className="flex justify-center gap-2">
          <Badge variant={assessment.mlcCompliant ? "default" : "destructive"} className="flex items-center gap-1">
            {assessment.mlcCompliant ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
            MLC 2006
          </Badge>
          <Badge variant={assessment.stcwCompliant ? "default" : "destructive"} className="flex items-center gap-1">
            {assessment.stcwCompliant ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
            STCW
          </Badge>
        </div>

        {/* Critical Alerts */}
        {assessment.alerts.filter(a => a.priority === 'critical' || a.priority === 'high').map((alert, i) => (
          <Alert key={i} variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        ))}

        {/* Fatigue Factors */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Fatores de Risco</p>
          {assessment.factors.slice(0, 4).map((factor, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                {factor.trend === 'worsening' ? (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                ) : factor.trend === 'improving' ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <Clock className="h-3 w-3 text-gray-400" />
                )}
                {factor.factor}
              </span>
              <Badge variant="outline" className={cn(
                factor.impact > 60 && "border-red-500 text-red-500",
                factor.impact > 30 && factor.impact <= 60 && "border-yellow-500 text-yellow-500"
              )}>
                {factor.impact}%
              </Badge>
            </div>
          ))}
        </div>

        {/* Predictions */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Previsão de Fadiga</p>
          <div className="flex justify-between text-xs text-muted-foreground">
            {assessment.predictions.slice(0, 4).map((p, i) => (
              <div key={i} className="text-center">
                <div className={cn(
                  "text-lg font-medium",
                  p.predictedScore <= 50 ? "text-green-500" : 
                  p.predictedScore <= 75 ? "text-yellow-500" : "text-red-500"
                )}>
                  {p.predictedScore}%
                </div>
                <div>+{p.hours}h</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FatigueRiskPanel;
