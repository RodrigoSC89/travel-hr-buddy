import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";
import { saveAs } from "file-saver";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SGSORiskData {
  embarcacao: string;
  risco: string;
  total: number;
  por_mes: Record<string, number>;
}

// Cores por nível de risco
const corPorRisco: Record<string, string> = {
  critico: "bg-red-600 text-white",
  alto: "bg-orange-500 text-white",
  medio: "bg-yellow-500 text-gray-900",
  baixo: "bg-green-600 text-white",
};

export const PainelSGSO: React.FC = () => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [dados, setDados] = useState<SGSORiskData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch SGSO risk assessments from database
      const { data: assessments, error } = await supabase
        .from('sgso_risk_assessments')
        .select('*')
        .eq('status', 'active')
        .order('assessment_date', { ascending: false });

      if (error) {
        console.error('Error loading SGSO data:', error);
        // Fallback to vessels if no SGSO data
        const { data: vessels } = await supabase
          .from('vessels')
          .select('id, name')
          .limit(10);

        if (vessels && vessels.length > 0) {
          const fallbackData = vessels.map((v) => ({
            embarcacao: v.name,
            risco: 'baixo',
            total: 0,
            por_mes: {},
          }));
          setDados(fallbackData);
        }
        return;
      }

      if (assessments && assessments.length > 0) {
        const mappedData: SGSORiskData[] = assessments.map((a) => ({
          embarcacao: a.vessel_name,
          risco: a.risk_level,
          total: a.total_failures || 0,
          por_mes: (a.failures_by_month as Record<string, number>) || {},
        }));
        setDados(mappedData);
      } else {
        // If no SGSO assessments, try to generate from vessels
        const { data: vessels } = await supabase
          .from('vessels')
          .select('id, name')
          .limit(10);

        if (vessels && vessels.length > 0) {
          const fallbackData = vessels.map((v) => ({
            embarcacao: v.name,
            risco: 'baixo',
            total: 0,
            por_mes: {},
          }));
          setDados(fallbackData);
        }
      }
    } catch (error) {
      console.error('Failed to load SGSO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = () => {
    const header = ["Embarcação", "Risco", "Total de Falhas"];
    const rows = dados.map((d) => [d.embarcacao, d.risco, d.total]);
    const csv = [header, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "relatorio_sgso.csv");
  };

  const exportarPDF = () => {
    if (!pdfRef.current) return;
    html2pdf()
      .from(pdfRef.current)
      .set({
        margin: 0.5,
        filename: "relatorio_sgso.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .save();
  };

  // Prepare chart data from monthly failures
  const chartData = dados.flatMap((d) =>
    Object.entries(d.por_mes).map(([mes, valor]) => ({
      embarcacao: d.embarcacao,
      mes,
      falhas: valor,
    }))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados SGSO...</span>
      </div>
    );
  }

  if (dados.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            🧭 Painel SGSO - Risco Operacional por Embarcação
          </h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhuma avaliação de risco SGSO encontrada.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Cadastre embarcações e avaliações de risco para visualizar os dados.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          🧭 Painel SGSO - Risco Operacional por Embarcação
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={exportarCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Exportar CSV
          </Button>
          <Button
            onClick={exportarPDF}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Exportar PDF
          </Button>
        </div>
      </div>

      <div ref={pdfRef} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dados.map((d) => (
            <Card key={d.embarcacao} className="shadow-md">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold">🚢 {d.embarcacao}</h3>
                <p
                  className={`inline-block px-2 py-1 rounded mt-2 text-sm font-medium ${corPorRisco[d.risco] || corPorRisco.baixo}`}
                >
                  Risco: {d.risco.toUpperCase()}
                </p>
                <p className="mt-2 text-sm">Falhas críticas: {d.total}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {chartData.length > 0 && (
          <div className="pt-6">
            <h3 className="text-lg font-semibold">
              📊 Comparativo Mensal de Falhas
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
              >
                <XAxis
                  dataKey="mes"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={100}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="falhas" fill="#ef4444" name="Falhas Críticas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default PainelSGSO;
