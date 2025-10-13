"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Download,
  FileDown 
} from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface RestoreReportLog {
  id: string;
  executed_at: string;
  status: string;
  message: string | null;
  error_details: string | null;
  triggered_by: string;
}

/**
 * Restore Report Logs Page
 * Displays audit logs of automated restore report executions
 */
export default function RestoreReportLogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<RestoreReportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("restore_report_logs")
        .select("*");

      // Apply status filter
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      // Apply date range filters
      if (startDate) {
        query = query.gte("executed_at", new Date(startDate).toISOString());
      }
      if (endDate) {
        // Add one day to include the entire end date
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query = query.lte("executed_at", endDateTime.toISOString());
      }

      const { data, error: fetchError } = await query
        .order("executed_at", { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setLogs(data || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar logs");
    } finally {
      setLoading(false);
    }
  }

  function handleApplyFilters() {
    fetchLogs();
  }

  function handleClearFilters() {
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
  }

  function exportToCSV() {
    if (logs.length === 0) return;

    const headers = ["Data", "Status", "Mensagem", "Erro"];
    const rows = logs.map((log) => [
      format(new Date(log.executed_at), "yyyy-MM-dd HH:mm:ss"),
      log.status,
      log.message || "",
      log.error_details || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `restore-logs-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportToPDF() {
    if (logs.length === 0) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("Auditoria de Relatórios Enviados", 14, 20);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 28);
    
    // Prepare table data
    const tableData = logs.map((log) => [
      format(new Date(log.executed_at), "dd/MM/yyyy HH:mm"),
      log.status === "success" ? "Sucesso" : log.status === "error" ? "Erro" : "Pendente",
      log.message || "",
      log.error_details || "",
    ]);

    // Add table
    autoTable(doc, {
      head: [["Data", "Status", "Mensagem", "Erro"]],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 60 },
        3: { cellWidth: 60 },
      },
    });

    doc.save(`restore-logs-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  }

  function getStatusIcon(status: string) {
    switch (status) {
    case "success":
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    case "error":
      return <XCircle className="w-5 h-5 text-red-600" />;
    case "pending":
      return <Clock className="w-5 h-5 text-yellow-600" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
    case "success":
      return "border-l-green-500 bg-green-50/50";
    case "error":
      return "border-l-red-500 bg-red-50/50";
    case "pending":
      return "border-l-yellow-500 bg-yellow-50/50";
    default:
      return "border-l-gray-500 bg-gray-50/50";
    }
  }

  const successCount = logs.filter((log) => log.status === "success").length;
  const errorCount = logs.filter((log) => log.status === "error").length;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">🧠 Auditoria de Relatórios Enviados</h1>
              <p className="text-sm text-muted-foreground">
                Logs de execução automática dos relatórios de restauração
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={exportToCSV} 
              variant="outline" 
              size="sm"
              disabled={logs.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button 
              onClick={exportToPDF} 
              variant="outline" 
              size="sm"
              disabled={logs.length === 0}
            >
              <FileDown className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="success">Sucesso</SelectItem>
                    <SelectItem value="error">Erro</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Inicial</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Selecione"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Final</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Selecione"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium invisible">Actions</label>
                <div className="flex gap-2">
                  <Button onClick={handleApplyFilters} className="flex-1">
                    Buscar
                  </Button>
                  <Button 
                    onClick={handleClearFilters} 
                    variant="outline"
                    className="flex-1"
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Execuções</p>
                  <p className="text-2xl font-bold">{logs.length}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sucessos</p>
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Erros</p>
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Execuções</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Carregando logs...</p>
                </div>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Nenhum log de execução registrado ainda
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="p-4 space-y-4">
                  {logs.map((log) => (
                    <Card 
                      key={log.id} 
                      className={`border-l-4 ${getStatusColor(log.status)}`}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(log.status)}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold capitalize">
                                  {log.status === "success" ? "Sucesso" : 
                                    log.status === "error" ? "Erro" : 
                                      log.status === "pending" ? "Pendente" : log.status}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  • {log.triggered_by}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(log.executed_at), "dd/MM/yyyy 'às' HH:mm:ss")}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {log.message && (
                          <div className="pl-8">
                            <p className="text-sm text-gray-700">{log.message}</p>
                          </div>
                        )}

                        {log.error_details && (
                          <div className="pl-8">
                            <details className="text-sm">
                              <summary className="cursor-pointer text-red-600 font-medium">
                                Detalhes do Erro
                              </summary>
                              <pre className="mt-2 p-3 bg-red-50 rounded text-xs overflow-x-auto">
                                {log.error_details}
                              </pre>
                            </details>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
