/**
 * Risk Score Gauge - Visual risk score display with 50+ factors
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskScore {
  overallScore: number;
  trend: 'improving' | 'stable' | 'worsening';
  categories: Array<{
    name: string;
    score: number;
    weight: number;
    factors: number;
  }>;
  topRisks: string[];
  lastUpdated: Date;
}

interface RiskScoreGaugeProps {
  riskScore?: RiskScore;
  className?: string;
}

export function RiskScoreGauge({ riskScore, className }: RiskScoreGaugeProps) {
  if (!riskScore) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Gauge className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Calcular score de risco</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = riskScore.trend === 'improving' ? TrendingDown : 
                   riskScore.trend === 'worsening' ? TrendingUp : Minus;

  const trendColor = riskScore.trend === 'improving' ? 'text-green-500' :
                    riskScore.trend === 'worsening' ? 'text-red-500' : 'text-gray-500';

  const scoreColor = riskScore.overallScore <= 25 ? 'text-green-500' :
                    riskScore.overallScore <= 50 ? 'text-yellow-500' :
                    riskScore.overallScore <= 75 ? 'text-orange-500' : 'text-red-500';

  // Calculate gauge rotation (0-180 degrees)
  const rotation = (riskScore.overallScore / 100) * 180;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Dynamic Risk Score
            </CardTitle>
            <CardDescription>50+ fatores analisados</CardDescription>
          </div>
          <Badge variant="outline" className={cn("flex items-center gap-1", trendColor)}>
            <TrendIcon className="h-3 w-3" />
            {riskScore.trend === 'improving' ? 'Melhorando' : 
             riskScore.trend === 'worsening' ? 'Piorando' : 'Estável'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gauge Visualization */}
        <div className="relative h-32 flex items-end justify-center">
          {/* Gauge background */}
          <div className="absolute bottom-0 w-48 h-24 overflow-hidden">
            <div className="w-48 h-48 rounded-full border-[16px] border-gradient-to-r from-green-500 via-yellow-500 to-red-500"
              style={{
                background: `conic-gradient(from 180deg, 
                  #22c55e 0deg, 
                  #eab308 90deg, 
                  #f97316 135deg, 
                  #ef4444 180deg, 
                  transparent 180deg)`
              }}
            />
          </div>
          
          {/* Gauge needle */}
          <div 
            className="absolute bottom-0 w-1 h-20 bg-foreground origin-bottom transition-transform duration-1000"
            style={{ transform: `rotate(${rotation - 90}deg)` }}
          />
          
          {/* Score display */}
          <div className="absolute bottom-4 text-center">
            <div className={cn("text-4xl font-bold", scoreColor)}>
              {riskScore.overallScore}
            </div>
            <p className="text-xs text-muted-foreground">/ 100</p>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="space-y-2">
          {riskScore.categories.slice(0, 4).map((cat, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{cat.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      cat.score <= 25 ? "bg-green-500" :
                      cat.score <= 50 ? "bg-yellow-500" :
                      cat.score <= 75 ? "bg-orange-500" : "bg-red-500"
                    )}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <span className="w-8 text-right">{cat.score}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top Risks */}
        {riskScore.topRisks.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">Principais Riscos</p>
            <div className="flex flex-wrap gap-1">
              {riskScore.topRisks.slice(0, 4).map((risk, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {risk}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RiskScoreGauge;
