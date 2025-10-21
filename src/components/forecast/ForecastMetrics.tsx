// @ts-nocheck
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Target, Globe } from "lucide-react";

/**
 * ForecastMetrics Component
 * Displays system performance with WCAG 2.1 Level AA compliant progress bars
 * All progress bars include proper ARIA attributes for accessibility
 */
export default function ForecastMetrics() {
  const metrics = [
    {
      id: "model-reliability",
      label: "Confiabilidade do Modelo",
      value: 93,
      icon: Activity,
      color: "text-green-500",
      bgColor: "bg-green-500"
    },
    {
      id: "realtime-accuracy",
      label: "Precisão em Tempo Real",
      value: 88,
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-500"
    },
    {
      id: "global-coverage",
      label: "Cobertura Global",
      value: 97,
      icon: Globe,
      color: "text-purple-500",
      bgColor: "bg-purple-500"
    }
  ];

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Activity className="text-blue-400" aria-hidden="true" />
          <span>Métricas do Sistema</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Desempenho e estatísticas em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.id} className="space-y-2">
              {/* Metric Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 ${metric.color}`} aria-hidden="true" />
                  <span 
                    className="text-sm font-medium text-gray-300"
                    id={`metric-${metric.id}`}
                  >
                    {metric.label}
                  </span>
                </div>
                <span className={`text-lg font-bold ${metric.color}`}>
                  {metric.value}%
                </span>
              </div>

              {/* WCAG 2.1 Compliant Progress Bar */}
              <Progress
                value={metric.value}
                className="h-3"
                aria-labelledby={`metric-${metric.id}`}
                aria-valuenow={metric.value}
                aria-valuemin={0}
                aria-valuemax={100}
              />

              {/* Optional: Visual indicator */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          );
        })}

        {/* Summary Stats */}
        <div className="pt-4 border-t border-gray-800">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-xs text-gray-400">Disponibilidade</div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-white">&lt;100ms</div>
              <div className="text-xs text-gray-400">Latência</div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="pt-3 border-t border-gray-800">
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <strong>Última atualização:</strong> {new Date().toLocaleTimeString('pt-BR')}
            </p>
            <p>
              <strong>Status:</strong> <span className="text-green-500">Operacional</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
