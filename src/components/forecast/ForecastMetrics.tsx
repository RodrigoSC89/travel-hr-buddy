import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface MetricData {
  label: string;
  value: number;
  description: string;
  colorClass: string;
}

const metrics: MetricData[] = [
  {
    label: "Confiabilidade do Modelo",
    value: 93,
    description: "Taxa de acertos do modelo ONNX em previsões históricas",
    colorClass: "bg-primary",
  },
  {
    label: "Precisão em Tempo Real",
    value: 88,
    description: "Acurácia das previsões comparadas com dados reais",
    colorClass: "bg-success",
  },
  {
    label: "Cobertura Global",
    value: 97,
    description: "Percentual de regiões marítimas monitoradas",
    colorClass: "bg-info",
  },
];

function MetricBar({ metric }: { metric: MetricData }) {
  return (
    <div className="space-y-2">
      {/* Label and Value */}
      <div className="flex justify-between items-center">
        <label htmlFor={`metric-${metric.label}`} className="text-sm font-medium text-foreground">
          {metric.label}
        </label>
        <span className="text-sm font-semibold text-foreground" aria-label={`${metric.label}: ${metric.value}%`}>
          {metric.value}%
        </span>
      </div>

      {/* WCAG 2.1 Level AA Compliant Progress Bar */}
      <div
        className="w-full bg-secondary rounded-full h-3"
        role="progressbar"
        aria-valuenow={metric.value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={metric.label}
        aria-describedby={`metric-desc-${metric.label}`}
        id={`metric-${metric.label}`}
      >
        <div
          className={`h-3 rounded-full transition-all duration-700 ${metric.colorClass}`}
          style={{ width: `${metric.value}%` }}
        />
      </div>

      {/* Description */}
      <p
        className="text-xs text-muted-foreground"
        id={`metric-desc-${metric.label}`}
      >
        {metric.description}
      </p>
    </div>
  );
}

export default function ForecastMetrics() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center space-x-2">
          <BarChart3 className="text-primary" aria-hidden="true" />
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
