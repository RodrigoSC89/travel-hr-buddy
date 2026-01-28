/**
 * OPEX Forecast Chart - Time series cost prediction visualization
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Calendar, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OPEXForecast {
  periodStart: Date;
  periodEnd: Date;
  totalProjected: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  byCategory: Array<{
    category: string;
    current: number;
    projected: number;
    change: number;
  }>;
  anomalies: Array<{
    category: string;
    message: string;
    impact: number;
  }>;
  confidence: number;
}

interface OPEXForecastChartProps {
  forecast?: OPEXForecast;
  isLoading?: boolean;
  className?: string;
}

export function OPEXForecastChart({ forecast, isLoading, className }: OPEXForecastChartProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!forecast) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Carregar previsão de OPEX</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const trendColor = forecast.trend === 'decreasing' ? 'text-green-500' :
                    forecast.trend === 'increasing' ? 'text-red-500' : 'text-gray-500';

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              OPEX Forecasting
            </CardTitle>
            <CardDescription>
              {format(forecast.periodStart, 'dd/MM', { locale: ptBR })} - {format(forecast.periodEnd, 'dd/MM', { locale: ptBR })}
            </CardDescription>
          </div>
          <Badge variant="outline" className={cn("flex items-center gap-1", trendColor)}>
            {forecast.trend === 'decreasing' ? '↓' : forecast.trend === 'increasing' ? '↑' : '→'}
            {forecast.trend === 'decreasing' ? 'Reduzindo' : 
             forecast.trend === 'increasing' ? 'Aumentando' : 'Estável'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Projected */}
        <div className="text-center py-4 bg-muted/50 rounded-lg">
          <DollarSign className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
          <div className="text-3xl font-bold">
            ${(forecast.totalProjected / 1000).toFixed(0)}K
          </div>
          <p className="text-sm text-muted-foreground">Total Projetado</p>
        </div>

        {/* Category breakdown */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Por Categoria</p>
          {forecast.byCategory.slice(0, 5).map((cat, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground capitalize">{cat.category}</span>
              <div className="flex items-center gap-2">
                <span>${(cat.projected / 1000).toFixed(0)}K</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    cat.change < 0 ? "text-green-500" : cat.change > 0 ? "text-red-500" : ""
                  )}
                >
                  {cat.change > 0 ? '+' : ''}{cat.change}%
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Simple bar chart visualization */}
        <div className="space-y-1">
          {forecast.byCategory.slice(0, 4).map((cat, i) => {
            const maxValue = Math.max(...forecast.byCategory.map(c => c.projected));
            const width = (cat.projected / maxValue) * 100;
            
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs w-16 truncate capitalize">{cat.category}</span>
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      cat.change < 0 ? "bg-green-500" : 
                      cat.change > 5 ? "bg-red-500" : "bg-blue-500"
                    )}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Anomalies */}
        {forecast.anomalies.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium flex items-center gap-1 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Anomalias Detectadas
            </p>
            {forecast.anomalies.slice(0, 2).map((anomaly, i) => (
              <div key={i} className="text-xs text-muted-foreground p-2 bg-yellow-500/10 rounded mb-1">
                <span className="font-medium capitalize">{anomaly.category}:</span> {anomaly.message}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Confiança: {forecast.confidence}%
        </p>
      </CardContent>
    </Card>
  );
}

export default OPEXForecastChart;
