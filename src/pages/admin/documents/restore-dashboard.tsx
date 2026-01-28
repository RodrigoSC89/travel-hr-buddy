/**
 * Comprehensive Restore Audit Dashboard - PATCH 874
 * PATCH 881: Removed @ts-nocheck - Uses RPC functions with proper type casting
 */

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
  ChartOptions,
  ChartData,
} from "chart.js";
import { QRCodeSVG } from "qrcode.react";
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

interface DepartmentSummary {
  department: string;
  count: number;
}

// Dynamic RPC caller for functions not in generated types
async function callRpc<T>(
  functionName: string, 
  params: Record<string, unknown> = {}
): Promise<T | null> {
  const { data, error } = await (supabase.rpc as (name: string, params: Record<string, unknown>) => ReturnType<typeof supabase.rpc>)(
    functionName,
    params
  );
  if (error) {
    logger.error(`RPC ${functionName} failed:`, error);
    return null;
  }
  return data as T;
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
  const [departmentSummary, setDepartmentSummary] = useState<DepartmentSummary[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [emailSending, setEmailSending] = useState(false);

  // Generate public URL
  const publicUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/admin/documents/restore-dashboard?public=1`
    : "";

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [filterEmail]);

  async function fetchStats(isAutoRefresh = false) {
    if (isAutoRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Get summary statistics using dynamic RPC call
      const summaryResult = await callRpc<RestoreSummary[]>("get_restore_summary", { 
        email_input: filterEmail || null 
      });
      setSummary(summaryResult?.[0] || { total: 0, unique_docs: 0, avg_per_day: 0 });

      // Get daily data for the last 15 days
      const dailyResult = await callRpc<RestoreDataPoint[]>("get_restore_count_by_day_with_email", { 
        email_input: filterEmail || null 
      });
      setDailyData(dailyResult || []);

      // Get monthly department summary
      const deptResult = await callRpc<DepartmentSummary[]>("get_monthly_restore_summary_by_department", {});
      if (deptResult) {
        setDepartmentSummary(deptResult);
      }

      setLastUpdate(new Date());
    } catch (error) {
      logger.error("Error fetching stats:", error as Error);
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
      const csvHeader = "Data,Restaurações\n";
      const csvRows = dailyData
        .map((d) => `${format(new Date(d.day), "dd/MM/yyyy")},${d.count}`)
        .join("\n");
      const csvContent = csvHeader + csvRows;
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
      
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
      logger.error("Error exporting CSV:", error as Error);
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
      
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Restore Analytics Dashboard", 14, 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 28);
      
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
      
      const filename = `restore-analytics-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      doc.save(filename);
      
      toast({
        title: "PDF exportado",
        description: `Arquivo ${filename} foi baixado com sucesso.`,
      });
    } catch (error) {
      logger.error("Error exporting PDF:", error as Error);
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar autenticado para enviar relatórios por email.",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke("send-restore-dashboard", {
        body: { summary, dailyData },
      });

      if (response.error) {
        throw new Error("Failed to send email");
      }

      toast({
        title: "Email enviado",
        description: "O relatório foi enviado por email com sucesso.",
      });
    } catch (error) {
      logger.error("Error sending email:", error as Error);
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

  const chartData: ChartData<"bar", number[], string> = {
    labels: dailyData.map((d) => format(new Date(d.day), "dd/MM")),
    datasets: [
      {
        label: "Restaurações por dia",
        data: dailyData.map((d) => d.count),
        backgroundColor: "hsl(var(--primary) / 0.8)",
        borderColor: "hsl(var(--primary))",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  const departmentChartData: ChartData<"bar", number[], string> = {
    labels: departmentSummary.map(d => d.department),
    datasets: [
      {
        label: "Restaurações",
        data: departmentSummary.map(d => d.count),
        backgroundColor: "hsl(142 76% 36% / 0.8)",
        borderColor: "hsl(142 76% 36%)",
        borderWidth: 1,
      },
    ],
  };

  const departmentChartOptions: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {!isPublicView && (
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel Admin
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Última atualização: {format(lastUpdate, "HH:mm:ss")}
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="w-8 h-8" />
          Restore Audit Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Painel completo de auditoria e monitoramento de restaurações de documentos
        </p>
      </div>

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
              <Button onClick={exportToCSV} disabled={loading || dailyData.length === 0} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={exportToPDF} disabled={loading || dailyData.length === 0} variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button onClick={sendEmailReport} disabled={loading || dailyData.length === 0 || emailSending} variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                {emailSending ? "Enviando..." : "Email"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-primary">Total de Restaurações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Todas as restaurações registradas</p>
            </CardContent>
          </Card>

          <Card className="bg-green-500/5 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Documentos Únicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.unique_docs}</div>
              <p className="text-xs text-muted-foreground mt-1">Documentos diferentes restaurados</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-500/5 border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">Média por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.avg_per_day.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">Restaurações em média diária</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Atividade de Restauração (Últimos 15 Dias)
          </CardTitle>
          <CardDescription>Visualização das restaurações realizadas por dia</CardDescription>
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

      {departmentSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              📆 Comparativo Mensal por Departamento
            </CardTitle>
            <CardDescription>Restaurações do mês atual agrupadas por departamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={departmentChartData} options={departmentChartOptions} />
            </div>
          </CardContent>
        </Card>
      )}

      {!isPublicView && publicUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">🔗 Link Público com QR Code</CardTitle>
            <CardDescription>Compartilhe este painel com acesso de leitura em TV Walls ou monitores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Link de acesso público (somente leitura):</p>
              <p className="text-sm text-primary font-mono bg-muted p-3 rounded-md break-all">{publicUrl}</p>
            </div>
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <QRCodeSVG value={publicUrl} size={128} level="H" />
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              🖥️ TV Wall Ready - Escaneie o QR Code ou use o link para visualização pública
            </p>
          </CardContent>
        </Card>
      )}

      {isPublicView && (
        <Card className="border-warning bg-warning/10">
          <CardContent className="pt-6">
            <p className="text-sm text-center font-medium">
              🔒 Modo público somente leitura (TV Wall Ativado) - Atualização automática a cada 10 segundos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
