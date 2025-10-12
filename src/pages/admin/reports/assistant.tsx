"use client";

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Download, FileText, BarChart3 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/hooks/use-toast";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
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

interface AssistantReportLog {
  id: string;
  user_email: string;
  status: string;
  message: string | null;
  sent_at: string;
  user_id: string | null;
  report_type: string | null;
  logs_count?: number | null;
}

export default function AssistantReportLogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AssistantReportLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [email, setEmail] = useState("");
  const [healthStatus, setHealthStatus] = useState<{
    isHealthy: boolean;
    lastExecutionHoursAgo: number | null;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchLogs();
    checkHealthStatus();
  }, []);

  // Prepare chart data from logs
  const chartData = useMemo(() => {
    if (logs.length === 0) return null;

    // Group logs by date
    const dateGroups = logs.reduce((acc, log) => {
      const date = new Date(log.sent_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort dates and prepare chart data
    const sortedDates = Object.keys(dateGroups).sort((a, b) => {
      const [dayA, monthA] = a.split('/');
      const [dayB, monthB] = b.split('/');
      return new Date(`2024-${monthA}-${dayA}`).getTime() - new Date(`2024-${monthB}-${dayB}`).getTime();
    });

    return {
      labels: sortedDates,
      datasets: [
        {
          label: 'Relatórios Enviados',
          data: sortedDates.map((date) => dateGroups[date]),
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1,
        },
      ],
    };
  }, [logs]);

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Volume de Relatórios Enviados por Dia',
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

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start", startDate);
      if (endDate) params.append("end", endDate);
      if (email) params.append("email", email);

      // Get session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar autenticado para acessar esta página.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant-report-logs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }

      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: "Erro ao carregar logs",
        description: "Não foi possível carregar os logs de envio de relatórios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function checkHealthStatus() {
    try {
      // Check last successful automated execution (within last 36 hours)
      const { data: recentLogs, error } = await supabase
        .from('assistant_report_logs')
        .select('sent_at')
        .eq('status', 'success')
        .eq('triggered_by', 'automated')
        .order('sent_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error checking health status:", error);
        return;
      }

      if (!recentLogs || recentLogs.length === 0) {
        setHealthStatus({
          isHealthy: false,
          lastExecutionHoursAgo: null,
          message: "Nenhum relatório automatizado foi enviado ainda",
        });
        return;
      }

      const lastExecution = new Date(recentLogs[0].sent_at);
      const hoursAgo = Math.floor((Date.now() - lastExecution.getTime()) / (1000 * 60 * 60));
      
      setHealthStatus({
        isHealthy: hoursAgo <= 36,
        lastExecutionHoursAgo: hoursAgo,
        message: hoursAgo <= 36 
          ? `Último envio há ${hoursAgo}h` 
          : `⚠️ Último envio detectado há ${hoursAgo}h — revisar logs`,
      });
    } catch (error) {
      console.error("Error checking health status:", error);
    }
  }

  function exportPDF() {
    if (logs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há logs para exportar.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    doc.text("📬 Logs de Envio de Relatórios do Assistente IA", 14, 16);
    autoTable(doc, {
      startY: 24,
      head: [["Data", "Usuário", "Status", "Mensagem", "Interações"]],
      body: logs.map((log) => [
        new Date(log.sent_at).toLocaleString(),
        log.user_email,
        log.status,
        log.message || "-",
        log.logs_count?.toString() || "-"
      ]),
      styles: { fontSize: 8 },
    });
    doc.save("logs-assistente.pdf");

    toast({
      title: "PDF exportado",
      description: "O PDF foi baixado com sucesso.",
    });
  }

  function exportCSV() {
    if (logs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há logs para exportar.",
        variant: "destructive",
      });
      return;
    }

    // Include logs_count in export
    const csv = [
      ["Data", "Usuário", "Status", "Mensagem", "Interações"],
      ...logs.map((log) => [
        new Date(log.sent_at).toLocaleString(),
        log.user_email,
        log.status,
        log.message || "-",
        log.logs_count?.toString() || "-"
      ])
    ].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    // Add UTF-8 BOM for Excel compatibility
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "logs-assistente.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV exportado",
      description: "O CSV foi baixado com sucesso.",
    });
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <h1 className="text-xl font-bold mb-4">📬 Logs de Envio de Relatórios — Assistente IA</h1>
        
        {/* Health Status Alert */}
        {healthStatus && (
          <div className={`p-4 rounded-lg mb-4 ${
            healthStatus.isHealthy 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`text-sm font-medium ${
              healthStatus.isHealthy ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {healthStatus.isHealthy ? '✅ ' : '⚠️ '}
              {healthStatus.message}
            </p>
            {!healthStatus.isHealthy && healthStatus.lastExecutionHoursAgo && healthStatus.lastExecutionHoursAgo > 36 && (
              <p className="text-xs text-yellow-600 mt-2">
                O sistema esperava um envio nas últimas 36 horas. Verifique os logs e a configuração do cron.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <Input 
          type="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Data inicial"
        />
        <Input 
          type="date" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="Data final"
        />
        <Input 
          placeholder="E-mail do usuário" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <Button onClick={fetchLogs}>🔍 Buscar</Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Button onClick={exportCSV} disabled={logs.length === 0} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          📤 Exportar CSV
        </Button>
        <Button onClick={exportPDF} disabled={logs.length === 0} variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          📄 Exportar PDF
        </Button>
      </div>

      {/* Chart Section */}
      {chartData && logs.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Análise de Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      )}

      <ScrollArea className="max-h-[70vh] border rounded-md p-4 bg-white">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p>Carregando...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <p>Nenhum log encontrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, i) => (
              <Card key={i} className="p-4">
                <p className="text-xs text-muted-foreground">
                  📅 {new Date(log.sent_at).toLocaleString()}
                </p>
                <p><strong>👤 Usuário:</strong> {log.user_email}</p>
                <p>
                  <strong>📦 Status:</strong>{" "}
                  <span 
                    className={`px-2 py-0.5 rounded text-xs ${
                      log.status === "success" 
                        ? "bg-green-100 text-green-800" 
                        : log.status === "error"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {log.status}
                  </span>
                </p>
                <p><strong>💬 Mensagem:</strong> {log.message || "-"}</p>
                {log.logs_count && (
                  <p className="text-xs text-muted-foreground mt-1">
                    📊 Interações: {log.logs_count}
                  </p>
                )}
                {log.report_type && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Tipo: {log.report_type}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
