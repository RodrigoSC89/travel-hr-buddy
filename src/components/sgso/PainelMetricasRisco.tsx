"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logger } from '@/lib/logger';
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts";

interface MetricData {
  auditoria_id: string;
  nome_navio: string;
  falhas_criticas: number;
  data_auditoria: string;
}

interface TemporalData {
  mes: string;
  falhas_criticas: number;
}

export function PainelMetricasRisco() {
  const [dados, setDados] = useState<MetricData[]>([]);
  const [embarcacaoSelecionada, setEmbarcacaoSelecionada] = useState<string>("Todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchMetrics = async () => {
      try {
        const { data, error } = await supabase
          .from("internal_audits")
          .select("id, scheduled_date, findings_count")
          .order("scheduled_date", { ascending: false })
          .limit(200);

        if (error) throw error;

        const mapped: MetricData[] = (data || []).map((d) => ({
          auditoria_id: d.id,
          nome_navio: "N/A",
          falhas_criticas: d.findings_count || 0,
          data_auditoria: d.scheduled_date || "",
        }));
        setDados(mapped);
      } catch (error) {
        logger.error("Erro ao buscar métricas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  // Get unique vessel names for filter
  const embarcacoes = ["Todos", ...new Set(dados.map(d => d.nome_navio).filter(Boolean))];

  // Filter data by selected vessel
  const dadosFiltrados = embarcacaoSelecionada === "Todos" 
    ? dados 
    : dados.filter(d => d.nome_navio === embarcacaoSelecionada);

  // Calculate temporal evolution (monthly aggregation)
  const dadosTemporaisMap = dadosFiltrados.reduce((acc: Record<string, number>, item) => {
    if (!item.data_auditoria) return acc;
    
    const data = new Date(item.data_auditoria);
    const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
    
    if (!acc[mes]) {
      acc[mes] = 0;
    }
    acc[mes] += item.falhas_criticas;
    
    return acc;
  }, {});

  const dadosTemporaisArray: TemporalData[] = Object.entries(dadosTemporaisMap)
    .map(([mes, falhas_criticas]) => ({ mes, falhas_criticas }))
    .sort((a, b) => a.mes.localeCompare(b.mes));

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Carregando métricas...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">📊 Painel Métricas de Risco</CardTitle>
              <CardDescription className="mt-2">
                Visualização de falhas críticas por auditoria com evolução temporal
              </CardDescription>
            </div>
            <div className="w-64">
              <Select value={embarcacaoSelecionada} onValueChange={setEmbarcacaoSelecionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a embarcação" />
                </SelectTrigger>
                <SelectContent>
                  {embarcacoes.map((embarcacao) => (
                    <SelectItem key={embarcacao} value={embarcacao}>
                      {embarcacao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Critical Failures Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Falhas Críticas por Auditoria</CardTitle>
          <CardDescription>
            {embarcacaoSelecionada === "Todos" 
              ? "Todas as embarcações" 
              : `Embarcação: ${embarcacaoSelecionada}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dadosFiltrados.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum dado disponível para o filtro selecionado
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={dadosFiltrados} 
                margin={{ top: 10, right: 30, left: 10, bottom: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
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
                <Legend />
                <Bar 
                  dataKey="falhas_criticas" 
                  fill="hsl(var(--destructive))" 
                  name="Falhas Críticas" 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Temporal Evolution Line Chart */}
      {dadosTemporaisArray.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolução Temporal de Falhas Críticas</CardTitle>
            <CardDescription>
              Tendência mensal de falhas críticas
              {embarcacaoSelecionada !== "Todos" && ` - ${embarcacaoSelecionada}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart 
                data={dadosTemporaisArray}
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="falhas_criticas" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--destructive))", r: 4 }}
                  name="Falhas Críticas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PainelMetricasRisco;
