"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface MetricData {
  auditoria_id: string;
  falhas_criticas: number;
}

export function PainelMetricasRisco() {
  const [dados, setDados] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        const { data, error } = await (supabase.from as Function)("sgso_audits")
          .select("id, score, findings_count")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) {
          logger.warn("sgso_audits not available:", error);
          setDados([]);
          return;
        }

        const metrics: MetricData[] = (data || []).map((audit: any) => ({
          auditoria_id: audit.id?.slice(0, 8) || "N/A",
          falhas_criticas: audit.findings_count || 0,
        }));
        setDados(metrics);
      } catch (err) {
        logger.error("Erro ao buscar métricas de risco:", err);
        setDados([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">📊 Métricas de Risco por Auditoria</h2>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              Carregando métricas...
            </div>
          ) : dados.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              Nenhuma auditoria encontrada. Crie auditorias no módulo SGSO.
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
