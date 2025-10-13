"use client";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Mail, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Bar } from "react-chartjs-2";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

interface RestoreDataPoint {
  day: string;
  count: number;
}

export default function RestoreDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPublicMode = searchParams.get("public") === "1";
  
  const [loading, setLoading] = useState(false);
  const [filterEmail, setFilterEmail] = useState("");
  const [summary, setSummary] = useState<RestoreSummary | null>(null);
  const [dailyData, setDailyData] = useState<RestoreDataPoint[]>([]);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [filterEmail]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch daily data
      const { data: dailyResult, error: dailyError } = await supabase.rpc(
        "get_restore_count_by_day_with_email",
        { email_input: filterEmail || null }
      );

      if (dailyError) throw dailyError;

      // Fetch summary statistics
      const { data: summaryResult, error: summaryError } = await supabase.rpc(
        "get_restore_summary",
        { email_input: filterEmail || null }
      );

      if (summaryError) throw summaryError;

      setDailyData(dailyResult || []);
      setSummary(summaryResult?.[0] || null);
    } catch (error) {
      console.error("Error fetching restore data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados de restauração.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function exportToCSV() {
    if (dailyData.length === 0) {
      alert("Não há dados para exportar");
      return;
    }

    // Create CSV content with UTF-8 BOM for Excel compatibility
    const BOM = "\uFEFF";
    const headers = ["Data", "Quantidade de Restaurações"];
    const rows = dailyData.map((d) => [
      format(new Date(d.day), "dd/MM/yyyy"),
      d.count.toString(),
    ]);

    const csvContent =
      BOM +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "restore-analytics.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "✅ CSV exportado",
      description: "O arquivo foi baixado com sucesso.",
    });
  }

  function exportToPDF() {
    if (dailyData.length === 0) {
      alert("Não há dados para exportar");
      return;
    }

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text("📊 Painel de Auditoria - Restaurações", 14, 16);

    // Add metadata
    doc.setFontSize(10);
    doc.text(`Data de geração: ${format(new Date(), "dd/MM/yyyy HH:mm:ss")}`, 14, 24);
    
    if (summary) {
      doc.text(`Total de restaurações: ${summary.total}`, 14, 30);
      doc.text(`Documentos únicos: ${summary.unique_docs}`, 14, 36);
      doc.text(`Média diária: ${summary.avg_per_day}`, 14, 42);
    }

    // Prepare table data
    const tableData = dailyData.map((d) => [
      format(new Date(d.day), "dd/MM/yyyy"),
      d.count.toString(),
    ]);

    // Add table
    autoTable(doc, {
      startY: 48,
      head: [["Data", "Quantidade de Restaurações"]],
      body: tableData,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue color
        textColor: 255,
        fontStyle: "bold",
      },
    });

    // Save the PDF
    doc.save(`restore-analytics-${format(new Date(), "yyyy-MM-dd")}.pdf`);

    toast({
      title: "✅ PDF exportado",
      description: "O arquivo foi baixado com sucesso.",
    });
  }

  async function sendReportByEmail() {
    if (dailyData.length === 0) {
      alert("Não há dados para enviar");
      return;
    }

    try {
      // Get Supabase session for authorization
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("❌ Você precisa estar autenticado para enviar relatórios");
        return;
      }

      // Show confirmation dialog
      const confirmed = confirm(
        `Deseja enviar relatório com ${dailyData.length} registros por e-mail?`
      );
      if (!confirmed) return;

      // Prepare report data
      const reportData = {
        summary,
        dailyData,
        filterEmail,
        generatedAt: new Date().toISOString(),
      };

      // Call Supabase Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-restore-dashboard`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(reportData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      const result = await response.json();

      toast({
        title: "✅ E-mail enviado",
        description: result.message || "O relatório foi enviado com sucesso.",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "❌ Erro ao enviar e-mail",
        description: "Não foi possível enviar o relatório por e-mail.",
        variant: "destructive",
      });
    }
  }

  const chartData = {
    labels: dailyData.map((d) => format(new Date(d.day), "dd/MM")),
    datasets: [
      {
        label: "Restaurações por dia",
        data: dailyData.map((d) => d.count),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      {!isPublicMode && (
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/documents")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          📊 Painel de Auditoria - Restaurações
        </h1>
        {!isPublicMode && (
          <div className="text-sm text-muted-foreground">
            Atualização automática a cada 10s
          </div>
        )}
      </div>

      {!isPublicMode && (
        <>
          <div className="flex gap-2">
            <Input
              placeholder="Filtrar por e-mail do restaurador"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
            />
            <Button onClick={fetchData} disabled={loading}>
              🔍 Buscar
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={loading || dailyData.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              onClick={exportToPDF}
              disabled={loading || dailyData.length === 0}
            >
              <FileText className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              onClick={sendReportByEmail}
              disabled={loading || dailyData.length === 0}
            >
              <Mail className="w-4 h-4 mr-2" />
              Enviar por E-mail
            </Button>
          </div>
        </>
      )}

      {summary && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3">📈 Estatísticas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {summary.total}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Total de Restaurações
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {summary.unique_docs}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Documentos únicos
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {summary.avg_per_day}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Média diária
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">
          📅 Gráfico de Restaurações (Últimos 15 dias)
        </h2>
        <div className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando...</p>
              </div>
            </div>
          ) : dailyData.length > 0 ? (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                  },
                  tooltip: {
                    enabled: true,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Nenhum dado disponível</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
