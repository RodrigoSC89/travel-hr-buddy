"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface MetricData {
  auditoria_id: string;
  falhas_criticas: number;
}

export function PainelMetricasRisco() {
  const [dados, setDados] = useState<MetricData[]>([]);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => res.json())
      .then((data) => setDados(data));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">📊 Métricas de Risco por Auditoria</h2>

      <Card>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dados} margin={{ top: 10, right: 30, left: 10, bottom: 100 }}>
              <XAxis 
                dataKey="auditoria_id" 
                tick={{ fontSize: 10 }} 
                angle={-45} 
                textAnchor="end" 
                interval={0} 
                height={100} 
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="falhas_criticas" fill="#dc2626" name="Falhas Críticas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
