"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";

interface ComplianceData {
  navio: string;
  mes: string;
  conforme: number;
  nao_conforme: number;
  observacao: number;
}

export function PainelBI() {
  const [dados, setDados] = useState<ComplianceData[]>([]);
  const [filtroMes, setFiltroMes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/bi/conformidade");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setDados(data);
      } catch (err) {
        console.error("Error fetching compliance data:", err);
        setError("Erro ao carregar dados de conformidade");
        // Set sample data on error
        setDados([
          {
            navio: "Ocean Star",
            mes: "2025-09",
            conforme: 12,
            nao_conforme: 3,
            observacao: 1,
          },
          {
            navio: "Sea Pioneer",
            mes: "2025-09",
            conforme: 9,
            nao_conforme: 2,
            observacao: 4,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/bi/export");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio_conformidade.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      alert("Erro ao exportar relatório CSV");
    }
  };

  const dadosFiltrados = filtroMes 
    ? dados.filter((d) => d.mes === filtroMes) 
    : dados;

  const mesesDisponiveis = [...new Set(dados.map((d) => d.mes))].sort().reverse();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                📊 Painel de Conformidade - Auditoria Técnica IMCA
              </h2>
              {error && (
                <p className="text-sm text-yellow-600 mt-1">
                  {error} (exibindo dados de exemplo)
                </p>
              )}
            </div>
            <select
              className="border rounded-md p-2 bg-background text-foreground"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
            >
              <option value="">Todos os meses</option>
              {mesesDisponiveis.map((mes) => (
                <option key={mes} value={mes}>
                  {mes}
                </option>
              ))}
            </select>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={dadosFiltrados} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="navio" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="conforme" fill="#10b981" name="Conforme" />
              <Bar dataKey="nao_conforme" fill="#ef4444" name="Não Conforme" />
              <Bar dataKey="observacao" fill="#facc15" name="Observações" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          <p>
            Os dados representam o status de conformidade por embarcação com base nas auditorias técnicas aplicadas.
            Use o filtro para visualizar por mês ou gere relatórios gerenciais.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button 
          onClick={() => window.print()} 
          className="bg-zinc-700 text-white hover:bg-zinc-800"
        >
          🖨️ Imprimir
        </Button>
        <Button
          onClick={handleExportCSV}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          ⬇️ Exportar CSV
        </Button>
      </div>
    </div>
  );
}
