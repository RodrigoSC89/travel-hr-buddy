// @ts-nocheck
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
      <CardContent className="grid gap-3">
        {metrics.map((m) => (
          <div key={m.label}>
            <p className="flex justify-between text-sm">
              {m.label} <span>{m.value}%</span>
            </p>
            <Progress value={m.value} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
