"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

interface MetricsData {
  auditoria_id: string;
  embarcacao: string;
  falhas_criticas: number;
  mes: string;
  data: string;
}

export function PainelMetricasRisco() {
  const [dados, setDados] = useState<MetricsData[]>([]);
  const [embarcacoes, setEmbarcacoes] = useState<string[]>([]);
  const [filtro, setFiltro] = useState<string>("Todos");

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => res.json())
      .then((data: MetricsData[]) => {
        setDados(data);
        const unique = Array.from(new Set(data.map((d) => d.embarcacao)));
        setEmbarcacoes(["Todos", ...unique]);
      })
      .catch((error) => {
        console.error("Erro ao carregar métricas:", error);
      });
  }, []);

  const dadosFiltrados = filtro === "Todos" ? dados : dados.filter((d) => d.embarcacao === filtro);

  // Aggregate data by month for temporal evolution
  const dadosTemporais = dadosFiltrados.reduce((acc, item) => {
    const existing = acc.find(d => d.mes === item.mes);
    if (existing) {
      existing.falhas_criticas += item.falhas_criticas;
    } else {
      acc.push({ mes: item.mes, falhas_criticas: item.falhas_criticas });
    }
    return acc;
  }, [] as Array<{ mes: string; falhas_criticas: number }>);

  // Sort by date
  dadosTemporais.sort((a, b) => {
    const dateA = new Date(a.mes);
    const dateB = new Date(b.mes);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📊 Métricas de Risco</h2>

      <div className="flex items-center space-x-4">
        <label className="text-sm">Filtrar por embarcação:</label>
        <select
          className="border rounded px-2 py-1"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          {embarcacoes.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">📊 Falhas Críticas por Auditoria</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosFiltrados} margin={{ top: 10, right: 30, left: 10, bottom: 100 }}>
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
              <Bar dataKey="falhas_criticas" fill="#dc2626" name="Falhas Críticas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">📈 Evolução Temporal de Risco</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosTemporais}>
              <XAxis dataKey="mes" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="falhas_criticas" stroke="#dc2626" name="Falhas Críticas" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
