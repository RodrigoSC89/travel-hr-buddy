// @ts-nocheck
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface MetricData {
  label: string;
  value: number;
  description: string;
  color: string;
}

const metrics: MetricData[] = [
  {
    label: "Confiabilidade do Modelo",
    value: 93,
    description: "Taxa de acertos do modelo ONNX em previsões históricas",
    color: "bg-blue-500",
  },
  {
    label: "Precisão em Tempo Real",
    value: 88,
    description: "Acurácia das previsões comparadas com dados reais",
    color: "bg-green-500",
  },
  {
    label: "Cobertura Global",
    value: 97,
    description: "Percentual de regiões marítimas monitoradas",
    color: "bg-purple-500",
  },
];

function MetricBar({ metric }: { metric: MetricData }) {
  return (
    <div className="space-y-2">
      {/* Label and Value */}
      <div className="flex justify-between items-center">
        <label htmlFor={`metric-${metric.label}`} className="text-sm font-medium text-gray-300">
          {metric.label}
        </label>
        <span className="text-sm font-semibold text-white" aria-label={`${metric.label}: ${metric.value}%`}>
          {metric.value}%
        </span>
      </div>

      {/* WCAG 2.1 Level AA Compliant Progress Bar */}
      <div
        className="w-full bg-gray-700 rounded-full h-3"
        role="progressbar"
        aria-valuenow={metric.value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={metric.label}
        aria-describedby={`metric-desc-${metric.label}`}
        id={`metric-${metric.label}`}
      >
        <div
          className={`h-3 rounded-full transition-all duration-700 ${metric.color}`}
          style={{ width: `${metric.value}%` }}
        />
      </div>

      {/* Description */}
      <p
        className="text-xs text-gray-500"
        id={`metric-desc-${metric.label}`}
      >
        {metric.description}
      </p>
    </div>
  );
}

export default function ForecastMetrics() {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <BarChart3 className="text-blue-400" aria-hidden="true" />
          <span>Métricas de Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6" role="region" aria-label="Métricas de performance do sistema de previsão">
          {metrics.map((metric) => (
            <MetricBar key={metric.label} metric={metric} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
