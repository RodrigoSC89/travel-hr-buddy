"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

type ChartData = {
  name: string
  total: number
}

export default function BIForecastsPage() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase.functions.invoke("jobs-forecast", { body: { action: "list" } })
      .then(({ data: forecasts, error }) => {
        if (error) throw error;
        const items = Array.isArray(forecasts) ? forecasts : (forecasts?.items || []);
        const grouped = items.reduce((acc: Record<string, number>, item: Record<string, unknown>) => {
          const key = String(item.system_name || 'unknown');
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.keys(grouped).map((key) => ({
          name: key,
          total: grouped[key]
        }));
        setData(chartData);
      })
      .catch((err) => {
        logger.error("Error loading forecast data:", err);
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">📊 Forecasts por Sistema</CardTitle>
          <CardDescription>
            Análise de distribuição de forecasts de manutenção por sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">
                Nenhum dado disponível. Gere forecasts para visualizar estatísticas.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
