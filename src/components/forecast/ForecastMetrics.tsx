/**
 * ForecastMetrics Component
 * Performance Metrics Display with WCAG 2.1 Accessibility
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Globe } from "lucide-react";

export default function ForecastMetrics() {
  const metrics = [
    {
      id: "metric-confiabilidade-do-modelo",
      label: "Confiabilidade do Modelo",
      value: 93,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      id: "metric-precisao-tempo-real",
      label: "Precisão em Tempo Real",
      value: 88,
      icon: Target,
      color: "text-blue-500",
    },
    {
      id: "metric-cobertura-global",
      label: "Cobertura Global",
      value: 97,
      icon: Globe,
      color: "text-purple-500",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Performance</CardTitle>
        <CardDescription>
          Indicadores de desempenho do sistema de previsão
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${metric.color}`} aria-hidden="true" />
                    <span 
                      id={metric.id}
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {metric.label}
                    </span>
                  </div>
                  <span 
                    className="text-sm font-bold text-gray-900 dark:text-gray-100"
                    aria-label={`${metric.value} por cento`}
                  >
                    {metric.value}%
                  </span>
                </div>
                <Progress 
                  value={metric.value}
                  aria-labelledby={metric.id}
                  aria-valuenow={metric.value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
