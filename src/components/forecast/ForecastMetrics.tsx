/**
 * ForecastMetrics Component
 * Displays system performance metrics with WCAG 2.1 Level AA compliant progress bars
 */

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity } from "lucide-react";

interface Metric {
  id: string;
  label: string;
  value: number;
  color: string;
}

const metrics: Metric[] = [
  {
    id: "confiabilidade-do-modelo",
    label: "Confiabilidade do Modelo",
    value: 93,
    color: "text-green-500",
  },
  {
    id: "precisao-tempo-real",
    label: "Precisão em Tempo Real",
    value: 88,
    color: "text-blue-500",
  },
  {
    id: "cobertura-global",
    label: "Cobertura Global",
    value: 97,
    color: "text-purple-500",
  },
];

export default function ForecastMetrics() {
  const getProgressColor = (value: number): string => {
    if (value >= 90) return "bg-green-500";
    if (value >= 70) return "bg-blue-500";
    if (value >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Activity className="text-blue-400" aria-hidden="true" />
          <span>Métricas de Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric) => (
          <div key={metric.id} className="space-y-2">
            {/* Metric Label */}
            <div className="flex items-center justify-between">
              <span
                id={`metric-${metric.id}`}
                className="text-sm text-gray-400"
              >
                {metric.label}
              </span>
              <span className={`text-xl font-bold ${metric.color}`}>
                {metric.value}%
              </span>
            </div>

            {/* Progress Bar with Full ARIA Support */}
            <Progress
              value={metric.value}
              className="h-2"
              aria-labelledby={`metric-${metric.id}`}
              aria-valuenow={metric.value}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        ))}

        {/* System Status */}
        <div className="pt-4 border-t border-gray-800">
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Sistema operando normalmente</p>
            <p>• Última atualização: {new Date().toLocaleTimeString("pt-BR")}</p>
            <p>• WCAG 2.1 Level AA compliant</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
