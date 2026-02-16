import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";
import { saveAs } from "file-saver";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SGSOVesselRisk {
  embarcacao: string;
  risco: string;
  total: number;
  monthly: { mes: string; falhas: number }[];
}

const corPorRisco: Record<string, string> = {
  crítico: "bg-destructive text-destructive-foreground",
  alto: "bg-warning text-warning-foreground",
  médio: "bg-warning/70 text-warning-foreground",
  baixo: "bg-success text-success-foreground",
};

function getRiskLevel(count: number): string {
  if (count >= 10) return "crítico";
  if (count >= 6) return "alto";
  if (count >= 3) return "médio";
  return "baixo";
}

export const PainelSGSO: React.FC = () => {
  const pdfRef = useRef<HTMLDivElement>(null);

  const { data: dados = [], isLoading } = useQuery({
    queryKey: ["sgso-risk-panel"],
    queryFn: async () => {
      // Fetch non-conformities grouped by vessel
      const { data: ncs, error } = await supabase
        .from("non_conformities")
        .select("id, vessel_id, severity, created_at, vessels(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!ncs || ncs.length === 0) return [];

      // Group by vessel
      const vesselMap = new Map<string, { name: string; ncs: typeof ncs }>();
      for (const nc of ncs) {
        const vesselId = nc.vessel_id || "unknown";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase joined relation returns dynamic shape
        const vesselName = (nc.vessels as Record<string, unknown>)?.name as string || "Embarcação Desconhecida";
        if (!vesselMap.has(vesselId)) {
          vesselMap.set(vesselId, { name: vesselName, ncs: [] });
        }
        vesselMap.get(vesselId)!.ncs.push(nc);
      }

      // Build risk data per vessel
      const result: SGSOVesselRisk[] = [];
      for (const [, vessel] of vesselMap) {
        const total = vessel.ncs.length;
        
      // Group by month
        const monthlyMap = new Map<string, number>();
        for (const nc of vessel.ncs) {
          const date = new Date(nc.created_at || Date.now());
          const key = `${date.toLocaleString("pt-BR", { month: "short" })}/${String(date.getFullYear()).slice(2)}`;
          monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
        }

        const monthly = Array.from(monthlyMap.entries())
          .map(([mes, falhas]) => ({ mes, falhas }))
          .slice(-6);

        result.push({
          embarcacao: vessel.name,
          risco: getRiskLevel(total),
          total,
          monthly,
        });
      }

      return result.sort((a, b) => b.total - a.total).slice(0, 6);
    },
    staleTime: 120_000,
  });

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

  const chartData = dados.flatMap((d) =>
    d.monthly.map((m) => ({
      embarcacao: d.embarcacao,
      mes: m.mes,
      falhas: m.falhas,
    }))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <Button onClick={exportarCSV} variant="outline">
            Exportar CSV
          </Button>
          <Button onClick={exportarPDF}>
            Exportar PDF
          </Button>
        </div>
      </div>

      <div ref={pdfRef} className="space-y-6">
        {dados.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhuma não-conformidade registrada. O painel será preenchido automaticamente com dados reais.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dados.map((d) => (
                <Card key={d.embarcacao} className="shadow-md">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">🚢 {d.embarcacao}</h3>
                    <Badge className={`mt-2 ${corPorRisco[d.risco] || "bg-muted"}`}>
                      Risco: {d.risco.toUpperCase()}
                    </Badge>
                    <p className="mt-2 text-sm text-muted-foreground">NCs registradas: {d.total}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="pt-6">
              <h3 className="text-lg font-semibold">📊 Comparativo Mensal de NCs</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
                >
                  <XAxis dataKey="mes" angle={-45} textAnchor="end" interval={0} height={100} stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="falhas" fill="hsl(var(--destructive))" name="Não-Conformidades" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PainelSGSO;
