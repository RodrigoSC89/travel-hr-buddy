"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";

interface ComplianceData {
  navio: string;
  mes: string;
  conforme: number;
  nao_conforme: number;
  observacao: number;
}

interface ExportData {
  vessel: string;
  total: number;
  concluido: number;
  andamento: number;
  pendente: number;
}

export function PainelBI() {
  const [dados, setDados] = useState<ComplianceData[]>([]);
  const [filtroMes, setFiltroMes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

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

  // Transform data to export format
  const prepareExportData = (): ExportData[] => {
    const dadosAgrupados = dadosFiltrados.reduce((acc, item) => {
      if (!acc[item.navio]) {
        acc[item.navio] = {
          vessel: item.navio,
          total: 0,
          concluido: 0,
          andamento: 0,
          pendente: 0,
        };
      }
      
      acc[item.navio].concluido += item.conforme;
      acc[item.navio].andamento += item.observacao;
      acc[item.navio].pendente += item.nao_conforme;
      acc[item.navio].total = acc[item.navio].concluido + acc[item.navio].andamento + acc[item.navio].pendente;
      
      return acc;
    }, {} as Record<string, ExportData>);

    return Object.values(dadosAgrupados);
  };

  const exportToCSV = () => {
    try {
      const data = prepareExportData();
      
      const csvContent = [
        ["Navio", "Total", "Concluído", "Em Andamento", "Pendente"],
        ...data.map((row) => [
          row.vessel,
          row.total,
          row.concluido,
          row.andamento,
          row.pendente,
        ]),
      ]
        .map((e) => e.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "conformidade_dp.csv");
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success("CSV exportado com sucesso!");
    } catch (err) {
      console.error("Error exporting CSV:", err);
      toast.error("Erro ao exportar CSV");
    }
  };

  const exportToPDF = () => {
    if (!reportRef.current) {
      toast.error("Erro ao gerar PDF: conteúdo não encontrado");
      return;
    }

    try {
      toast.info("Gerando PDF...");
      
      html2pdf()
        .set({
          margin: 0.5,
          filename: "relatorio-conformidade-dp.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        })
        .from(reportRef.current)
        .save()
        .then(() => {
          toast.success("PDF exportado com sucesso!");
        })
        .catch((error) => {
          console.error("Error generating PDF:", error);
          toast.error("Erro ao gerar PDF");
        });
    } catch (err) {
      console.error("Error in exportToPDF:", err);
      toast.error("Erro ao gerar PDF");
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
      <div ref={reportRef}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  📊 Painel de Conformidade DP - Auditoria Técnica
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
                <Bar dataKey="conforme" fill="#10b981" name="Concluído" />
                <Bar dataKey="observacao" fill="#facc15" name="Em Andamento" />
                <Bar dataKey="nao_conforme" fill="#ef4444" name="Pendente" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">📋 Tabela Detalhada</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-2 text-left">Navio</th>
                    <th className="border p-2 text-center">Total</th>
                    <th className="border p-2 text-center">Concluído</th>
                    <th className="border p-2 text-center">Em Andamento</th>
                    <th className="border p-2 text-center">Pendente</th>
                  </tr>
                </thead>
                <tbody>
                  {prepareExportData().map((row) => (
                    <tr key={row.vessel} className="hover:bg-muted/50">
                      <td className="border p-2">{row.vessel}</td>
                      <td className="border p-2 text-center font-semibold">{row.total}</td>
                      <td className="border p-2 text-center text-green-600">{row.concluido}</td>
                      <td className="border p-2 text-center text-yellow-600">{row.andamento}</td>
                      <td className="border p-2 text-center text-red-600">{row.pendente}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            <p>
              Os dados representam o status de conformidade por embarcação com base nas auditorias técnicas DP aplicadas.
              Use o filtro para visualizar por mês ou exporte relatórios para Excel, PowerBI ou impressão.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mt-4">
        <Button 
          onClick={exportToCSV}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          📥 Exportar CSV
        </Button>
        <Button
          onClick={exportToPDF}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          🧾 Exportar PDF
        </Button>
      </div>
    </div>
  );
}
