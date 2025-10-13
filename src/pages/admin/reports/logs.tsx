"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Download,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [logs, setLogs] = useState<RestoreReportLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  // Filters
  const [status, setStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const observerTarget = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 20;

  const fetchLogs = useCallback(async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const currentPage = reset ? 0 : page;
      const from = currentPage * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("restore_report_logs")
        .select("*", { count: "exact" })
        .order("executed_at", { ascending: false })
        .range(from, to);

      // Apply filters
      if (status && status !== "all") {
        query = query.eq("status", status);
      }
      if (startDate) {
        query = query.gte("executed_at", new Date(startDate).toISOString());
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query = query.lte("executed_at", endDateTime.toISOString());
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      if (reset) {
        setLogs(data || []);
        setPage(1);
      } else {
        setLogs(prev => [...prev, ...(data || [])]);
        setPage(prev => prev + 1);
      }

      setTotalCount(count || 0);
      setHasMore(data && data.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar logs");
      toast({
        title: "Erro ao carregar logs",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [loading, page, status, startDate, endDate, toast]);

  useEffect(() => {
    fetchLogs(true);
  }, [status, startDate, endDate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchLogs(false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, fetchLogs]);

  function exportToCSV() {
    if (logs.length === 0) {
      toast({
        title: "Não há dados para exportar",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Data/Hora", "Status", "Mensagem", "Detalhes do Erro", "Acionado Por"];
    
    const rows = logs.map((log) => {
      const date = format(new Date(log.executed_at), "dd/MM/yyyy HH:mm:ss");
      const statusText = log.status === "success" ? "Sucesso" : 
                         log.status === "error" ? "Erro" : 
                         log.status === "pending" ? "Pendente" : log.status;
      const message = `"${(log.message || "").replace(/"/g, '""')}"`;
      const errorDetails = `"${(log.error_details || "").replace(/"/g, '""')}"`;
      const triggeredBy = `"${log.triggered_by}"`;
      return [date, statusText, message, errorDetails, triggeredBy].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `restore-logs-${format(new Date(), "yyyy-MM-dd-HHmmss")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "CSV exportado com sucesso",
      description: `${logs.length} registros exportados`,
    });
  }

  function exportToPDF() {
    if (logs.length === 0) {
      toast({
        title: "Não há dados para exportar",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("🧠 Auditoria de Relatórios Enviados", 14, 16);
    
    doc.setFontSize(10);
    doc.text(`Total de registros: ${logs.length}`, 14, 24);
    doc.text(`Data de geração: ${format(new Date(), "dd/MM/yyyy HH:mm:ss")}`, 14, 30);
    
    const tableData = logs.map((log) => [
      format(new Date(log.executed_at), "dd/MM/yyyy HH:mm"),
      log.status === "success" ? "Sucesso" : 
        log.status === "error" ? "Erro" : 
        log.status === "pending" ? "Pendente" : log.status,
      log.message || "",
      log.error_details || "",
    ]);
    
    autoTable(doc, {
      startY: 36,
      head: [["Data/Hora", "Status", "Mensagem", "Erro"]],
      body: tableData,
      styles: { 
        fontSize: 8, 
        cellPadding: 2,
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 65 },
        3: { cellWidth: 55 },
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: "bold",
      },
    });
    
    doc.save(`restore-logs-${format(new Date(), "yyyy-MM-dd-HHmmss")}.pdf`);

    toast({
      title: "PDF exportado com sucesso",
      description: `${logs.length} registros exportados`,
    });
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
                Logs de execução automática dos relatórios de restauração • Total: {totalCount} registros
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} disabled={logs.length === 0} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button onClick={exportToPDF} disabled={logs.length === 0} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
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
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Final</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
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
            {error ? (
              <Alert variant="destructive" className="m-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : logs.length === 0 && !loading ? (
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
                  
                  {/* Infinite scroll trigger */}
                  {hasMore && (
                    <div ref={observerTarget} className="flex items-center justify-center py-4">
                      {loading && (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-sm text-muted-foreground">Carregando mais logs...</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!hasMore && logs.length > 0 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Todos os logs foram carregados
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
