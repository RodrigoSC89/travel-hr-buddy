import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ForecastMetrics() {
  const metrics = [
    { label: "Confiabilidade do modelo", value: 93 },
    { label: "Precisão em tempo real", value: 88 },
    { label: "Cobertura global", value: 97 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                id={`metric-${m.label.replace(/\s+/g, "-")}`}
                className="text-sm font-medium"
              >
                {m.label}
              </label>
              <span className="text-sm font-semibold">{m.value}%</span>
            </div>
            <Progress
              value={m.value}
              aria-labelledby={`metric-${m.label.replace(/\s+/g, "-")}`}
              aria-valuenow={m.value}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
