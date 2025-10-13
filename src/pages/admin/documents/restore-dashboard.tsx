// ✅ Comprehensive Restore Audit Dashboard
// Path: /admin/documents/restore-dashboard
// Features: Interactive charts, CSV/PDF export, email reports, public view mode

"use client";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Download, Mail, BarChart3, FileText, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Bar } from "react-chartjs-2";
import { format } from "date-fns";
import { logger } from "@/lib/logger";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const isPublicView = searchParams.get("public") === "1";
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterEmail, setFilterEmail] = useState("");
  const [summary, setSummary] = useState<RestoreSummary | null>(null);
  const [dailyData, setDailyData] = useState<RestoreDataPoint[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [emailSending, setEmailSending] = useState(false);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats(true);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [filterEmail]);

  async function fetchStats(isAutoRefresh = false) {
    if (isAutoRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Get summary statistics
      const { data: summaryData, error: summaryError } = await supabase
        .rpc("get_restore_summary", { email_input: filterEmail || null });

      if (summaryError) throw summaryError;

      setSummary(summaryData?.[0] || { total: 0, unique_docs: 0, avg_per_day: 0 });

      // Get daily data for the last 15 days
      const { data: dailyDataResult, error: dailyError } = await supabase
        .rpc("get_restore_count_by_day_with_email", { email_input: filterEmail || null });

      if (dailyError) throw dailyError;

      setDailyData(dailyDataResult || []);
      setLastUpdate(new Date());
    } catch (error) {
      logger.error("Error fetching stats:", error);
      if (!isAutoRefresh) {
        toast({
          title: "Erro ao carregar estatísticas",
          description: "Não foi possível carregar as estatísticas de restauração.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function exportToCSV() {
    if (dailyData.length === 0) {
      toast({
        title: "Sem dados",
        description: "Não há dados para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create CSV header
      const csvHeader = "Data,Restaurações\n";
      
      // Create CSV rows
      const csvRows = dailyData
        .map((d) => `${format(new Date(d.day), "dd/MM/yyyy")},${d.count}`)
        .join("\n");
      
      const csvContent = csvHeader + csvRows;
      
      // Create blob with UTF-8 BOM for proper encoding
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
      
      // Download file
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `restore-analytics.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "CSV exportado",
        description: "O arquivo CSV foi baixado com sucesso.",
      });
    } catch (error) {
      logger.error("Error exporting CSV:", error);
      toast({
        title: "Erro ao exportar CSV",
        description: "Não foi possível exportar o arquivo CSV.",
        variant: "destructive",
      });
    }
  }

  function exportToPDF() {
    if (dailyData.length === 0) {
      toast({
        title: "Sem dados",
        description: "Não há dados para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Restore Analytics Dashboard", 14, 20);
      
      // Add generation date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 28);
      
      // Add summary statistics
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Estatísticas Resumidas", 14, 40);
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      let yPosition = 48;
      
      if (summary) {
        doc.text(`Total de Restaurações: ${summary.total}`, 14, yPosition);
        yPosition += 7;
        doc.text(`Documentos Únicos Restaurados: ${summary.unique_docs}`, 14, yPosition);
        yPosition += 7;
        doc.text(`Média de Restaurações por Dia: ${summary.avg_per_day.toFixed(2)}`, 14, yPosition);
        yPosition += 12;
      }
      
      // Add table with daily data
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Restaurações Diárias", 14, yPosition);
      yPosition += 8;
      
      const tableData = dailyData.map((d) => [
        format(new Date(d.day), "dd/MM/yyyy"),
        d.count.toString(),
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [["Data", "Número de Restaurações"]],
        body: tableData,
        theme: "grid",
        headStyles: { 
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
      });
      
      // Save PDF with date-stamped filename
      const filename = `restore-analytics-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      doc.save(filename);
      
      toast({
        title: "PDF exportado",
        description: `Arquivo ${filename} foi baixado com sucesso.`,
      });
    } catch (error) {
      logger.error("Error exporting PDF:", error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Não foi possível exportar o arquivo PDF.",
        variant: "destructive",
      });
    }
  }

  async function sendEmailReport() {
    if (dailyData.length === 0) {
      toast({
        title: "Sem dados",
        description: "Não há dados para enviar.",
        variant: "destructive",
      });
      return;
    }

    setEmailSending(true);
    
    try {
      // Get session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar autenticado para enviar relatórios por email.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-restore-dashboard`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            summary,
            dailyData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      toast({
        title: "Email enviado",
        description: "O relatório foi enviado por email com sucesso.",
      });
    } catch (error) {
      logger.error("Error sending email:", error);
      toast({
        title: "Erro ao enviar email",
        description: "Não foi possível enviar o relatório por email.",
        variant: "destructive",
      });
    } finally {
      setEmailSending(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      fetchStats();
    }
  };

  const chartData = {
    labels: dailyData.map((d) => format(new Date(d.day), "dd/MM")),
    datasets: [
      {
        label: "Restaurações por dia",
        data: dailyData.map((d) => d.count),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: false,
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
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with navigation */}
      {!isPublicView && (
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel Admin
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Última atualização: {format(lastUpdate, "HH:mm:ss")}
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="w-8 h-8" />
          Restore Audit Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Painel completo de auditoria e monitoramento de restaurações de documentos
        </p>
      </div>

      {/* Search and Export Controls - Hidden in public view */}
      {!isPublicView && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Filtros e Exportação
            </CardTitle>
            <CardDescription>
              Filtre por email ou exporte os dados para análise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Filtrar por e-mail (pressione Enter)"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={() => fetchStats()} disabled={loading} variant="default">
                🔍 Buscar
              </Button>
              <Button 
                onClick={exportToCSV} 
                disabled={loading || dailyData.length === 0} 
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button 
                onClick={exportToPDF} 
                disabled={loading || dailyData.length === 0} 
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button 
                onClick={sendEmailReport} 
                disabled={loading || dailyData.length === 0 || emailSending} 
                variant="outline"
              >
                <Mail className="w-4 h-4 mr-2" />
                {emailSending ? "Enviando..." : "Email"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Total de Restaurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {summary.total}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Todas as restaurações registradas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Documentos Únicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                {summary.unique_docs}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Documentos diferentes restaurados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Média por Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {summary.avg_per_day.toFixed(1)}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Restaurações em média diária
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Atividade de Restauração (Últimos 15 Dias)
          </CardTitle>
          <CardDescription>
            Visualização das restaurações realizadas por dia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 md:h-96">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Carregando dados...</p>
                </div>
              </div>
            ) : dailyData.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto opacity-50" />
                  <p className="mt-2">Nenhum dado disponível para o período selecionado</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Public view indicator */}
      {isPublicView && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
              📺 Modo de Visualização Pública - Atualização automática a cada 10 segundos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
