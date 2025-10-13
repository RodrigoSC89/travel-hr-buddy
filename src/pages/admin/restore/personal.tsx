// ✅ Personal Restore Dashboard
// Path: /admin/restore/personal
// Features: Personal daily dashboard with graph, PDF export, email send

"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Mail, BarChart3, FileText, TrendingUp } from "lucide-react";
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

export default function PersonalRestoreDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [summary, setSummary] = useState<RestoreSummary | null>(null);
  const [dailyData, setDailyData] = useState<RestoreDataPoint[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [emailSending, setEmailSending] = useState(false);
  const [trendDirection, setTrendDirection] = useState<"up" | "down" | "stable">("stable");

  // Get current user email on mount
  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    }
    getCurrentUser();
  }, []);

  // Fetch stats when user email is available
  useEffect(() => {
    if (userEmail) {
      fetchStats();
      const interval = setInterval(() => {
        fetchStats(true);
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [userEmail]);

  async function fetchStats(isAutoRefresh = false) {
    if (!userEmail) return;

    if (isAutoRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Get summary statistics for current user
      const { data: summaryData, error: summaryError } = await supabase
        .rpc("get_restore_summary", { email_input: userEmail });

      if (summaryError) throw summaryError;

      const summaryResult = summaryData?.[0] || { total: 0, unique_docs: 0, avg_per_day: 0 };
      setSummary(summaryResult);

      // Get daily data for the last 15 days for current user
      const { data: dailyDataResult, error: dailyError } = await supabase
        .rpc("get_restore_count_by_day_with_email", { email_input: userEmail });

      if (dailyError) throw dailyError;

      const dataPoints = dailyDataResult || [];
      setDailyData(dataPoints);
      
      // Calculate trend
      if (dataPoints.length >= 2) {
        const recent = dataPoints.slice(-3).reduce((sum, d) => sum + d.count, 0) / 3;
        const older = dataPoints.slice(0, 3).reduce((sum, d) => sum + d.count, 0) / 3;
        
        if (recent > older * 1.1) setTrendDirection("up");
        else if (recent < older * 0.9) setTrendDirection("down");
        else setTrendDirection("stable");
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching stats:", error);
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

  // ✅ 1. Exportar PDF + Enviar por E-mail (no painel individual)
  async function exportAndSend() {
    if (dailyData.length === 0) {
      toast({
        title: "Sem dados",
        description: "Não há dados para exportar e enviar.",
        variant: "destructive",
      });
      return;
    }

    setEmailSending(true);
    
    try {
      // Generate PDF
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("📦 Painel Pessoal de Restaurações", 14, 20);
      
      // Add user info
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Usuário: ${userEmail}`, 14, 28);
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 34);
      
      // Add summary statistics
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("📊 Resumo Pessoal", 14, 46);
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      let yPosition = 54;
      
      if (summary) {
        doc.text(`Total de Restaurações: ${summary.total}`, 14, yPosition);
        yPosition += 7;
        doc.text(`Documentos Únicos: ${summary.unique_docs}`, 14, yPosition);
        yPosition += 7;
        doc.text(`Média Diária: ${summary.avg_per_day.toFixed(2)}`, 14, yPosition);
        yPosition += 7;
        
        // Add trend indicator
        const trendEmoji = trendDirection === "up" ? "📈" : trendDirection === "down" ? "📉" : "➡️";
        const trendText = trendDirection === "up" ? "Tendência de Alta" : 
          trendDirection === "down" ? "Tendência de Baixa" : "Tendência Estável";
        doc.text(`${trendEmoji} ${trendText}`, 14, yPosition);
        yPosition += 12;
      }
      
      // Add table with daily data
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("📅 Histórico Diário", 14, yPosition);
      yPosition += 8;
      
      const tableData = dailyData.map((d) => [
        format(new Date(d.day), "dd/MM/yyyy"),
        d.count.toString(),
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [["Data", "Restaurações"]],
        body: tableData,
        theme: "grid",
        headStyles: { 
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
      });
      
      // Save PDF
      const filename = `painel-pessoal-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      doc.save(filename);
      
      // Send by email
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "PDF exportado",
          description: "PDF salvo, mas você precisa estar autenticado para enviar por email.",
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
        title: "✅ Exportado e Enviado",
        description: "PDF exportado e relatório enviado por email com sucesso!",
      });
    } catch (error) {
      console.error("Error exporting and sending:", error);
      toast({
        title: "Erro ao enviar",
        description: "PDF foi exportado, mas houve erro ao enviar o email.",
        variant: "destructive",
      });
    } finally {
      setEmailSending(false);
    }
  }

  const chartData = {
    labels: dailyData.map((d) => format(new Date(d.day), "dd/MM")),
    datasets: [
      {
        label: "Minhas Restaurações por dia",
        data: dailyData.map((d) => d.count),
        backgroundColor: "rgba(124, 58, 237, 0.8)",
        borderColor: "rgba(124, 58, 237, 1)",
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
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Última atualização: {format(lastUpdate, "HH:mm:ss")}
        </div>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-purple-600" />
          📦 Painel Pessoal de Restaurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Seu painel diário com gráfico de progresso e estatísticas pessoais
        </p>
        {userEmail && (
          <p className="text-sm text-muted-foreground mt-1">
            Usuário: <span className="font-medium">{userEmail}</span>
          </p>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Restaurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Documentos Únicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.unique_docs}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Média Diária
                {trendDirection === "up" && <TrendingUp className="w-4 h-4 text-green-600" />}
                {trendDirection === "down" && <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.avg_per_day.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {trendDirection === "up" && "Tendência de alta 📈"}
                {trendDirection === "down" && "Tendência de baixa 📉"}
                {trendDirection === "stable" && "Tendência estável ➡️"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">📊 Gráfico de Restaurações</CardTitle>
              <CardDescription>
                Últimos 15 dias de atividade pessoal
              </CardDescription>
            </div>
            {/* ✅ Botão: Exportar e Enviar */}
            <Button 
              onClick={exportAndSend} 
              disabled={loading || dailyData.length === 0 || emailSending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {emailSending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  📤 Exportar e Enviar
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : dailyData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível para exibir
            </div>
          ) : (
            <div className="h-[400px]">
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">⚡ Ações Rápidas</CardTitle>
          <CardDescription>
            Ferramentas para exportar e compartilhar seus dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => {
                if (dailyData.length > 0) {
                  const doc = new jsPDF();
                  doc.setFontSize(16);
                  doc.text("Painel Pessoal de Restaurações", 14, 16);
                  
                  const tableData = dailyData.map((d) => [
                    format(new Date(d.day), "dd/MM/yyyy"),
                    d.count.toString(),
                  ]);
                  
                  autoTable(doc, {
                    startY: 25,
                    head: [["Data", "Restaurações"]],
                    body: tableData,
                    theme: "grid",
                  });
                  
                  doc.save(`painel-pessoal-${format(new Date(), "yyyy-MM-dd")}.pdf`);
                  
                  toast({
                    title: "PDF exportado",
                    description: "Arquivo baixado com sucesso!",
                  });
                }
              }} 
              disabled={dailyData.length === 0} 
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            
            <Button 
              onClick={() => fetchStats()} 
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar Dados
            </Button>
            
            <Button 
              onClick={() => navigate("/admin/documents/restore-dashboard")}
              variant="outline"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Ver Dashboard Completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
