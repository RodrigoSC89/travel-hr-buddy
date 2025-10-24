"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Mail, FileDown, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RestoreSummary {
  total: number
  unique_docs: number
  avg_per_day: number
}

interface RestoreDataPoint {
  day: string
  count: number
}

export default function PersonalRestoreDashboard() {
  const [summary, setSummary] = useState<RestoreSummary | null>(null);
  const [trend, setTrend] = useState<RestoreDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [trendIndicator, setTrendIndicator] = useState<"up" | "down" | "stable">("stable");

  async function fetchStats() {
    try {
      const session = await supabase.auth.getSession();
      const email = session.data.session?.user?.email;
      if (!email) {
        setLoading(false);
        return;
      }

      const { data: trendData } = await supabase.rpc("get_restore_count_by_day_with_email", {
        email_input: email,
      });

      const { data: summaryData } = await supabase.rpc("get_restore_summary", {
        email_input: email,
      });

      setTrend(trendData || []);
      setSummary(summaryData?.[0] || null);
      setLastUpdate(new Date());
      
      // Calculate trend indicator
      if (trendData && trendData.length >= 2) {
        const recent = trendData.slice(-3);
        const earlier = trendData.slice(-6, -3);
        if (earlier.length > 0 && recent.length > 0) {
          const recentAvg = recent.reduce((sum, d) => sum + d.count, 0) / recent.length;
          const earlierAvg = earlier.reduce((sum, d) => sum + d.count, 0) / earlier.length;
          if (recentAvg > earlierAvg * 1.1) setTrendIndicator("up");
          else if (recentAvg < earlierAvg * 0.9) setTrendIndicator("down");
          else setTrendIndicator("stable");
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  async function exportAndSendEmail() {
    if (!summary || trend.length === 0) {
      alert("Não há dados para exportar");
      return;
    }

    try {
      const session = await supabase.auth.getSession();
      const email = session.data.session?.user?.email;
      
      if (!session.data.session) {
        alert("❌ Você precisa estar autenticado");
        return;
      }

      const confirmed = confirm("Deseja gerar PDF e enviar por e-mail?");
      if (!confirmed) return;

      // Call the Supabase Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-restore-dashboard`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.data.session.access_token}`,
          },
          body: JSON.stringify({
            email_input: email,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("✅ " + (result.message || "Relatório enviado por e-mail com sucesso!"));
      } else {
        alert("❌ Falha ao enviar relatório: " + (result.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Error sending report:", error);
      alert("❌ Erro ao enviar relatório");
    }
  }

  function exportToPDF() {
    if (!summary || trend.length === 0) {
      alert("Não há dados para exportar");
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("📈 Painel Pessoal de Restaurações", 14, 16);
    
    // Add summary
    doc.setFontSize(12);
    doc.text(`Total de restaurações: ${summary.total}`, 14, 30);
    doc.text(`Documentos únicos: ${summary.unique_docs}`, 14, 38);
    doc.text(`Média por dia: ${summary.avg_per_day}`, 14, 46);
    doc.text(`Data de geração: ${format(new Date(), "dd/MM/yyyy HH:mm:ss")}`, 14, 54);
    
    // Prepare table data
    const tableData = trend.map((point) => [
      format(new Date(point.day), "dd/MM/yyyy"),
      point.count.toString(),
    ]);
    
    // Add table
    autoTable(doc, {
      startY: 62,
      head: [["Data", "Restaurações"]],
      body: tableData,
      styles: { 
        fontSize: 10, 
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [99, 102, 241], // Indigo color
        textColor: 255,
        fontStyle: "bold",
      },
    });
    
    // Save the PDF
    doc.save(`restauracoes-pessoais-${format(new Date(), "yyyy-MM-dd-HHmmss")}.pdf`);
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">📈 Seu Painel de Restaurações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Última atualização: {format(lastUpdate, "HH:mm:ss")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToPDF} variant="outline" size="sm">
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button onClick={exportAndSendEmail} variant="default" size="sm">
            <Mail className="w-4 h-4 mr-2" />
            📤 Exportar e Enviar
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-sm text-muted-foreground">Total de restaurações</div>
            <div className="text-2xl font-bold">{summary.total}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-sm text-muted-foreground">Docs únicos</div>
            <div className="text-2xl font-bold">{summary.unique_docs}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-sm text-muted-foreground">Média por dia</div>
            <div className="flex items-center justify-center gap-2 text-2xl font-bold">
              {summary.avg_per_day}
              {trendIndicator === "up" && <TrendingUp className="w-5 h-5 text-green-500" />}
              {trendIndicator === "down" && <TrendingDown className="w-5 h-5 text-red-500" />}
              {trendIndicator === "stable" && <Minus className="w-5 h-5 text-gray-500" />}
            </div>
          </Card>
        </div>
      )}

      {trend.length > 0 && (
        <Card className="p-4">
          <h2 className="font-semibold mb-2">📊 Restaurações por Dia (Últimos 15 dias)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trend.slice().reverse()}>
              <XAxis
                dataKey="day"
                tickFormatter={(d) => format(new Date(d), "dd/MM")}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
