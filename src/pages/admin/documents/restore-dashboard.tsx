// ✅ Comprehensive Restore Audit Dashboard
// Path: /admin/documents/restore-dashboard
// Features: Interactive charts, CSV/PDF export, email reports, public view mode

"use client";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Mail, FileText, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Bar } from "react-chartjs-2";
import { format } from "date-fns";
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

export default function RestoreDashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPublicView = searchParams.get("public") === "1";
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterEmail, setFilterEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [summary, setSummary] = useState<RestoreSummary | null>(null);
  const [dailyData, setDailyData] = useState<RestoreDataPoint[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats(true); // silent refresh
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [searchEmail]);

  async function fetchStats(silent = false) {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    try {
      // For public view, don't require authentication
      let session = null;
      if (!isPublicView) {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        session = authSession;
        
        if (!session) {
          toast({
            title: "Não autenticado",
            description: "Você precisa estar autenticado para acessar esta página.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }
      }

      // Fetch summary statistics
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_restore_summary', {
          email_input: searchEmail || null,
        });

      if (summaryError) {
        throw summaryError;
      }

      if (summaryData && summaryData.length > 0) {
        setSummary(summaryData[0]);
      }

      // Fetch daily count data
      const { data: dailyCountData, error: dailyError } = await supabase
        .rpc('get_restore_count_by_day_with_email', {
          email_input: searchEmail || null,
        });

      if (dailyError) {
        throw dailyError;
      }

      setDailyData(dailyCountData || []);
      setLastUpdate(new Date());

    } catch (error) {
      console.error("Error fetching analytics:", error);
      if (!silent) {
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

  function handleSearch() {
    setSearchEmail(filterEmail);
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
      link.setAttribute("download", "restore-analytics.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "CSV exportado",
        description: "O arquivo CSV foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
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
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Restaurações", 14, 15);
      
      // Add date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 22);
      
      let yPosition = 30;
      
      // Add summary statistics
      if (summary) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Resumo:", 14, yPosition);
        yPosition += 7;
        
        doc.setFont("helvetica", "normal");
        doc.text(`Total de restaurações: ${summary.total}`, 14, yPosition);
        yPosition += 6;
        doc.text(`Documentos únicos restaurados: ${summary.unique_docs}`, 14, yPosition);
        yPosition += 6;
        doc.text(`Média por dia: ${summary.avg_per_day.toFixed(2)}`, 14, yPosition);
        yPosition += 10;
      }
      
      // Add table with daily data
      const tableData = dailyData.map((d) => [
        format(new Date(d.day), "dd/MM/yyyy"),
        d.count.toString(),
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [["Data", "Restaurações"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
      });
      
      // Save PDF
      const fileName = `restore-analytics-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF exportado",
        description: "O arquivo PDF foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
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

    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar autenticado para enviar relatórios.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-restore-dashboard`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: searchEmail || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send email report");
      }

      const result = await response.json();
      
      toast({
        title: "Relatório enviado",
        description: `Relatório enviado com sucesso para ${result.recipient}!`,
      });
    } catch (error) {
      console.error("Error sending email report:", error);
      toast({
        title: "Erro ao enviar relatório",
        description: "Não foi possível enviar o relatório por e-mail.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

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
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header - Hidden in public view */}
      {!isPublicView && (
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      )}

      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">
          📊 Painel de Auditoria - Restaurações
        </h1>
        {refreshing && (
          <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Controls - Hidden in public view */}
      {!isPublicView && (
        <div className="flex flex-col md:flex-row gap-2">
          <Input
            placeholder="Filtrar por e-mail (ex: user@example.com)"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={loading}>
              🔍 Buscar
            </Button>
            <Button 
              onClick={exportToCSV} 
              disabled={loading || dailyData.length === 0} 
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
            <Button 
              onClick={exportToPDF} 
              disabled={loading || dailyData.length === 0} 
              variant="outline"
              size="sm"
            >
              <FileText className="w-4 h-4 mr-1" />
              PDF
            </Button>
            <Button 
              onClick={sendEmailReport} 
              disabled={loading || dailyData.length === 0} 
              variant="outline"
              size="sm"
            >
              <Mail className="w-4 h-4 mr-1" />
              Email
            </Button>
          </div>
        </div>
      )}

      {/* Summary Statistics Card */}
      {summary && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">📈 Estatísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
                <div className="text-sm text-muted-foreground">Total de Restaurações</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{summary.unique_docs}</div>
                <div className="text-sm text-muted-foreground">Documentos Únicos</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {summary.avg_per_day.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Média por Dia</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📅 Restaurações nos Últimos 15 Dias</h2>
            <span className="text-xs text-muted-foreground">
              Última atualização: {format(lastUpdate, "HH:mm:ss")}
            </span>
          </div>
          <div className="h-64 md:h-80">
            {loading && !refreshing ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Carregando...</p>
                </div>
              </div>
            ) : dailyData.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
