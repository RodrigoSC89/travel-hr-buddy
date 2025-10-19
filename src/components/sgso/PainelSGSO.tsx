import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";
import { saveAs } from "file-saver";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Dados mockados para o painel SGSO
const dados = [
  {
    embarcacao: "PSV Atlântico",
    risco: "crítico",
    total: 12,
    por_mes: {
      "Jan/25": 3,
      "Fev/25": 2,
      "Mar/25": 4,
      "Abr/25": 1,
      "Mai/25": 2,
      "Jun/25": 0,
    },
  },
  {
    embarcacao: "AHTS Pacífico",
    risco: "alto",
    total: 8,
    por_mes: {
      "Jan/25": 2,
      "Fev/25": 1,
      "Mar/25": 2,
      "Abr/25": 1,
      "Mai/25": 1,
      "Jun/25": 1,
    },
  },
  {
    embarcacao: "OSV Caribe",
    risco: "médio",
    total: 4,
    por_mes: {
      "Jan/25": 1,
      "Fev/25": 0,
      "Mar/25": 1,
      "Abr/25": 1,
      "Mai/25": 1,
      "Jun/25": 0,
    },
  },
  {
    embarcacao: "PLSV Mediterrâneo",
    risco: "baixo",
    total: 2,
    por_mes: {
      "Jan/25": 0,
      "Fev/25": 0,
      "Mar/25": 1,
      "Abr/25": 0,
      "Mai/25": 1,
      "Jun/25": 0,
    },
  },
];

// Cores por nível de risco
const corPorRisco: Record<string, string> = {
  crítico: "bg-red-600 text-white",
  alto: "bg-orange-500 text-white",
  médio: "bg-yellow-500 text-gray-900",
  baixo: "bg-green-600 text-white",
};

export const PainelSGSO: React.FC = () => {
  const pdfRef = useRef<HTMLDivElement>(null);

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
            className="bg-zinc-800 hover:bg-zinc-900 text-white"
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
                  className={`inline-block px-2 py-1 rounded mt-2 text-sm font-medium ${corPorRisco[d.risco]}`}
                >
                  Risco: {d.risco.toUpperCase()}
                </p>
                <p className="mt-2 text-sm">Falhas críticas: {d.total}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pt-6">
          <h3 className="text-lg font-semibold">
            📊 Comparativo Mensal de Falhas
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={dados.flatMap((d) =>
                Object.entries(d.por_mes).map(([mes, valor]: [string, unknown]) => ({
                  embarcacao: d.embarcacao,
                  mes,
                  falhas: valor,
                }))
              )}
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
      </div>
    </div>
  );
};

export default PainelSGSO;
