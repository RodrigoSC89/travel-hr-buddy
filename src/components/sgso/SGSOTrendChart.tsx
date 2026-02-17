"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { logger } from '@/lib/logger';
import { supabase } from "@/integrations/supabase/client";

interface RawDataEntry {
  mes: string; // YYYY-MM or YYYY-MM-DD format
  risco: string;
  total: number;
}

interface ChartDataEntry {
  mes: string;
  baixo?: number;
  moderado?: number;
  alto?: number;
  crítico?: number;
}

/**
 * Formats raw API data into chart-ready format
 * Groups by month and creates separate series for each risk level
 */
function formatData(rawData: RawDataEntry[]): ChartDataEntry[] {
  const grouped: Record<string, ChartDataEntry> = {};

  rawData.forEach(({ mes, risco, total }) => {
    // Extract just YYYY-MM from date if it includes day
    const monthKey = mes.substring(0, 7);
    
    // Format month for display (e.g., "out 2025")
    const date = new Date(monthKey + "-01");
    const displayMonth = date.toLocaleDateString("pt-BR", { 
      month: "short", 
      year: "numeric" 
    });

    if (!grouped[monthKey]) {
      grouped[monthKey] = { mes: displayMonth };
    }

    // Normalize risk level name
    const normalizedRisk = risco.toLowerCase();
    grouped[monthKey][normalizedRisk as keyof Omit<ChartDataEntry, "mes">] = total;
  });

  // Convert to array and sort by month chronologically
  return Object.keys(grouped)
    .sort()
    .map((key) => grouped[key]);
}

interface SGSOTrendChartProps {
  data?: RawDataEntry[];
}

export function SGSOTrendChart({ data: customData }: SGSOTrendChartProps = {}) {
  const [data, setData] = useState<RawDataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If custom data is provided, use it directly
    if (customData && customData.length > 0) {
      setData(customData);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchTrend = async () => {
      try {
        const { data: incidents, error: dbError } = await supabase
          .from("incident_reports")
          .select("reported_at, severity")
          .order("reported_at", { ascending: false })
          .limit(500);

        if (dbError) throw dbError;

        // Aggregate incidents by month and severity
        const aggregated: Record<string, Record<string, number>> = {};
        for (const inc of incidents || []) {
          if (!inc.reported_at) continue;
          const month = inc.reported_at.substring(0, 7);
          const risk = inc.severity === "critical" ? "crítico" : inc.severity === "high" ? "alto" : inc.severity === "medium" ? "moderado" : "baixo";
          if (!aggregated[month]) aggregated[month] = {};
          aggregated[month][risk] = (aggregated[month][risk] || 0) + 1;
        }

        const result: RawDataEntry[] = [];
        for (const [mes, risks] of Object.entries(aggregated)) {
          for (const [risco, total] of Object.entries(risks)) {
            result.push({ mes, risco, total });
          }
        }

        setData(result.length > 0 ? result : []);
      } catch (err) {
        logger.error("Erro ao buscar dados de tendência SGSO:", err);
        setError("Falha ao carregar dados de tendência");
      } finally {
        setLoading(false);
      }
    };
    fetchTrend();
  }, [customData]);

  const chartData = formatData(data);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Carregando dados de tendência...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">📈 Evolução dos Riscos SGSO (por mês)</CardTitle>
        </div>
        <CardDescription>
          Tendência mensal dos incidentes classificados por nível de severidade SGSO
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum dado disponível para exibição
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart 
              data={chartData}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                allowDecimals={false}
                label={{ value: "Total de Incidentes", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="baixo"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                name="Baixo"
                dot={{ fill: "hsl(var(--success))", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="moderado"
                stroke="hsl(var(--warning))"
                strokeWidth={2}
                name="Moderado"
                dot={{ fill: "hsl(var(--warning))", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="alto"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                name="Alto"
                dot={{ fill: "hsl(var(--destructive))", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="crítico"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                name="Crítico"
                dot={{ fill: "hsl(var(--destructive))", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default SGSOTrendChart;
