"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Download, FileText, Loader2, Mail } from "lucide-react";
import { Bar } from "react-chartjs-2";
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
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AssistantReportLog {
  id: string;
  sent_at: string;
  status: string;
  message: string;
  user_email: string;
  logs_count: number;
  recipient_email?: string;
}

export default function AssistantReportsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AssistantReportLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      let query = supabase
        .from("assistant_report_logs")
        .select("*")
        .order("sent_at", { ascending: false });

      if (startDate) {
        query = query.gte("sent_at", startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query = query.lte("sent_at", endDateTime.toISOString());
      }
      if (email.trim()) {
        query = query.ilike("user_email", `%${email}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    if (logs.length === 0) {
      alert("Não há dados para exportar");
      return;
    }

    const headers = ["Data", "Usuário", "Status", "Mensagem"];
    const rows = logs.map((log) => [
      format(new Date(log.sent_at), "dd/MM/yyyy HH:mm:ss"),
      log.user_email,
      log.status,
      log.message || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-assistente-${format(new Date(), "yyyy-MM-dd-HHmmss")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    if (logs.length === 0) {
      alert("Não há dados para exportar");
      return;
    }

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text("📬 Logs de Envio de Relatórios — Assistente IA", 14, 16);

    // Add metadata
    doc.setFontSize(10);
    doc.text(`Total de registros: ${logs.length}`, 14, 24);
    doc.text(`Data de geração: ${format(new Date(), "dd/MM/yyyy HH:mm:ss")}`, 14, 30);

    // Prepare table data
    const tableData = logs.map((log) => [
      format(new Date(log.sent_at), "dd/MM/yyyy HH:mm"),
      log.user_email,
      log.status,
      log.message || "",
    ]);

    // Add table
    autoTable(doc, {
      startY: 36,
      head: [["Data/Hora", "Usuário", "Status", "Mensagem"]],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 65 },
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
      },
    });

    // Save the PDF
    doc.save(`logs-assistente-${format(new Date(), "yyyy-MM-dd-HHmmss")}.pdf`);
  }

  // Prepare chart data
  const groupedByDate = logs.reduce((acc, log) => {
    const date = format(new Date(log.sent_at), "dd/MM/yyyy");
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = {
    labels: Object.keys(groupedByDate),
    datasets: [
      {
        label: "Relatórios Enviados por Dia",
        data: Object.values(groupedByDate),
        backgroundColor: "#2563eb",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Relatórios Enviados por Dia",
      },
    },
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/assistant-logs")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-xl font-bold">📬 Logs de Envio de Relatórios — Assistente IA</h1>
              <p className="text-sm text-muted-foreground">
                Total de {logs.length} registros
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
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
              <Button onClick={fetchLogs} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                🔍 Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button onClick={exportCSV} disabled={logs.length === 0} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            📤 Exportar CSV
          </Button>
          <Button onClick={exportPDF} disabled={logs.length === 0} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            📄 Exportar PDF
          </Button>
        </div>

        {/* Chart */}
        {logs.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <Bar data={chartData} options={chartOptions} />
            </CardContent>
          </Card>
        )}

        {/* Logs List */}
        <Card>
          <CardContent className="p-4">
            <ScrollArea className="max-h-[70vh]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-2">Carregando...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum log encontrado
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <Card key={log.id} className="p-4">
                      <p className="text-xs text-muted-foreground">
                        📅 {format(new Date(log.sent_at), "dd/MM/yyyy HH:mm:ss")}
                      </p>
                      <p>
                        <strong>👤 Usuário:</strong> {log.user_email}
                      </p>
                      <p>
                        <strong>📦 Status:</strong>{" "}
                        <span
                          className={
                            log.status === "success"
                              ? "text-green-600"
                              : log.status === "error"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }
                        >
                          {log.status}
                        </span>
                      </p>
                      <p>
                        <strong>💬 Mensagem:</strong> {log.message}
                      </p>
                      {log.logs_count > 0 && (
                        <p>
                          <strong>📊 Interações:</strong> {log.logs_count}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
