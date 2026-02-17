// ✅ Página /admin/reports/restore-analytics.tsx - Painel de Auditoria com Gráficos

"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getEdgeFunctionUrl, getEdgeFunctionHeaders } from "@/lib/supabase/edge-function-helper";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { logger } from "@/lib/logger";
import { getJsPDF, getAutoTable } from '@/lib/pdf/lazy-pdf';

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

interface RestoreDataPoint {
  day: string;
  count: number;
}

export default function RestoreAnalyticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [filterEmail, setFilterEmail] = useState("");
  const [summary, setSummary] = useState<RestoreSummary | null>(null);
  const [dailyData, setDailyData] = useState<RestoreDataPoint[]>([]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats();
    }, 10000);
    return () => clearInterval(interval);
  }, [filterEmail]);

  async function fetchStats() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Não autenticado", description: "Você precisa estar autenticado para acessar esta página.", variant: "destructive" });
        navigate("/auth");
        return;
      }
      const params = new URLSearchParams();
      if (filterEmail) params.append("email", filterEmail);
      const response = await fetch(`${getEdgeFunctionUrl("restore-analytics")}?${params.toString()}`, { headers: getEdgeFunctionHeaders(session.access_token) });
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setSummary(data.summary);
      setDailyData(data.dailyData);
    } catch (error) {
      logger.error("Error fetching analytics:", error);
      toast({ title: "Erro ao carregar estatísticas", description: "Não foi possível carregar as estatísticas de restauração.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function exportToCSV() {
    if (dailyData.length === 0) { toast({ title: "Sem dados", description: "Não há dados para exportar.", variant: "destructive" }); return; }
    try {
      const csvHeader = "Data,Restaurações\n";
      const csvRows = dailyData.map((d) => `${format(new Date(d.day), "dd/MM/yyyy")},${d.count}`).join("\n");
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `restauracoes_${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "CSV exportado", description: "O arquivo CSV foi baixado com sucesso." });
    } catch (error) {
      logger.error("Error exporting CSV:", error);
      toast({ title: "Erro ao exportar CSV", description: "Não foi possível exportar o arquivo CSV.", variant: "destructive" });
    }
  }

  async function exportToPDF() {
    if (dailyData.length === 0) { toast({ title: "Sem dados", description: "Não há dados para exportar.", variant: "destructive" }); return; }
    try {
      const JsPDF = await getJsPDF();
      const autoTable = await getAutoTable();
      const doc = new JsPDF();
      doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.text("Relatório de Restaurações", 14, 15);
      doc.setFontSize(12); doc.setFont("helvetica", "normal");
      let yPosition = 25;
      if (summary) {
        doc.text(`Total de restaurações: ${summary.total}`, 14, yPosition); yPosition += 7;
        doc.text(`Documentos únicos restaurados: ${summary.unique_docs}`, 14, yPosition); yPosition += 7;
        doc.text(`Média por dia: ${summary.avg_per_day.toFixed(2)}`, 14, yPosition); yPosition += 10;
      }
      const tableData = dailyData.map((d) => [format(new Date(d.day), "dd/MM/yyyy"), d.count.toString()]);
      autoTable(doc, { startY: yPosition, head: [["Data", "Restaurações"]], body: tableData, theme: "grid", headStyles: { fillColor: [59, 130, 246] } });
      doc.save(`restauracoes_${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast({ title: "PDF exportado", description: "O arquivo PDF foi baixado com sucesso." });
    } catch (error) {
      logger.error("Error exporting PDF:", error);
      toast({ title: "Erro ao exportar PDF", description: "Não foi possível exportar o arquivo PDF.", variant: "destructive" });
    }
  }

  const chartData = dailyData.map((d) => ({
    name: format(new Date(d.day), "dd/MM"),
    restaurações: d.count,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>
      <h1 className="text-2xl font-bold">📊 Painel de Auditoria - Restaurações</h1>
      <div className="flex gap-2">
        <Input placeholder="Filtrar por e-mail" value={filterEmail} onChange={(e) => setFilterEmail(e.target.value)} />
        <Button onClick={fetchStats} disabled={loading}>🔍 Buscar</Button>
        <Button onClick={exportToCSV} disabled={loading || dailyData.length === 0} variant="outline">📤 CSV</Button>
        <Button onClick={exportToPDF} disabled={loading || dailyData.length === 0} variant="outline">📄 PDF</Button>
      </div>
      {summary && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold">📈 Estatísticas</h2>
          <ul className="text-sm mt-2 space-y-1">
            <li>🔢 Total de restaurações: {summary.total}</li>
            <li>📄 Documentos únicos restaurados: {summary.unique_docs}</li>
            <li>📆 Média por dia: {summary.avg_per_day}</li>
          </ul>
        </Card>
      )}
      <Card className="p-4">
        <h2 className="text-lg font-semibold">📅 Gráfico de Restaurações</h2>
        <div className="h-64">
          {loading ? (
            <div className="flex items-center justify-center h-full"><p>Carregando...</p></div>
          ) : dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="restaurações" fill="hsl(var(--primary))" name="Restaurações por dia" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground"><p>Nenhum dado disponível</p></div>
          )}
        </div>
      </Card>
    </div>
  );
}
