"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  CartesianGrid
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MetricData {
  auditoria_id: string;
  embarcacao: string;
  falhas_criticas: number;
  data_auditoria: string;
}

interface TemporalData {
  mes: string;
  falhas_criticas: number;
}

export function PainelMetricasRisco() {
  const [dados, setDados] = useState<MetricData[]>([]);
  const [embarcacoes, setEmbarcacoes] = useState<string[]>([]);
  const [filtro, setFiltro] = useState<string>("Todos");
  const [dadosTemporais, setDadosTemporais] = useState<TemporalData[]>([]);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => res.json())
      .then((data: MetricData[]) => {
        setDados(data);
        
        // Extract unique vessel names
        const uniqueVessels = Array.from(new Set(data.map((d) => d.embarcacao)));
        setEmbarcacoes(["Todos", ...uniqueVessels]);
        
        // Calculate temporal evolution (monthly aggregation)
        const monthlyData = calculateTemporalEvolution(data);
        setDadosTemporais(monthlyData);
      })
      .catch((error) => {
        console.error("Erro ao buscar métricas:", error);
      });
  }, []);

  const calculateTemporalEvolution = (data: MetricData[]): TemporalData[] => {
    // Group by month and sum critical failures
    const monthlyMap = new Map<string, number>();
    
    data.forEach((item) => {
      const date = new Date(item.data_auditoria);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = monthlyMap.get(monthKey) || 0;
      monthlyMap.set(monthKey, current + item.falhas_criticas);
    });
    
    // Convert to array and sort
    return Array.from(monthlyMap.entries())
      .map(([mes, falhas_criticas]) => ({ mes, falhas_criticas }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  };

  // Filter data based on vessel selection
  const dadosFiltrados = filtro === "Todos" 
    ? dados 
    : dados.filter((d) => d.embarcacao === filtro);

  // Update temporal data based on filter
  useEffect(() => {
    if (dadosFiltrados.length > 0) {
      const monthlyData = calculateTemporalEvolution(dadosFiltrados);
      setDadosTemporais(monthlyData);
    }
  }, [filtro, dados]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📊 Painel Métricas de Risco</h2>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="vessel-filter">Filtrar por embarcação:</Label>
          <Select value={filtro} onValueChange={setFiltro}>
            <SelectTrigger id="vessel-filter" className="w-[200px]">
              <SelectValue placeholder="Selecione..." />
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

      {/* Critical Failures by Audit */}
      <Card>
        <CardHeader>
          <CardTitle>Falhas Críticas por Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosFiltrados} margin={{ top: 10, right: 30, left: 10, bottom: 100 }}>
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
              <Bar dataKey="falhas_criticas" fill="#dc2626" name="Falhas Críticas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Temporal Evolution */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Temporal de Falhas Críticas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosTemporais} margin={{ top: 10, right: 30, left: 10, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="falhas_criticas" 
                stroke="#dc2626" 
                strokeWidth={2}
                name="Falhas Críticas"
                dot={{ fill: '#dc2626', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
