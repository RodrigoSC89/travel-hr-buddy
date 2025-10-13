"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import { toast } from "@/hooks/use-toast";
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

const ITEMS_PER_PAGE = 20;

/**
 * Restore Report Logs Page
 * Displays audit logs of automated restore report executions with infinite scroll
 */
export default function RestoreReportLogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<RestoreReportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Ref for intersection observer
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch logs with pagination
  const fetchLogs = useCallback(async (reset = false) => {
    if (!reset && !hasMore) return;
    
    const isInitialLoad = reset || currentPage === 0;
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    setError(null);
    
    try {
      const page = reset ? 0 : currentPage;
      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("restore_report_logs")
        .select("*", { count: "exact" })
        .order("executed_at", { ascending: false })
        .range(from, to);

      // Apply status filter
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      // Apply date range filters
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
      
      const newLogs = data || [];
      setLogs(reset ? newLogs : (prev) => [...prev, ...newLogs]);
      setTotalCount(count || 0);
      setHasMore(newLogs.length === ITEMS_PER_PAGE);
      
      if (!reset) {
        setCurrentPage(page + 1);
      } else {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar logs");
      toast({
        title: "Erro",
        description: "Erro ao carregar logs. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [statusFilter, startDate, endDate, currentPage, hasMore]);

  // Auto-fetch logs when filters change
  useEffect(() => {
    setCurrentPage(0);
    setHasMore(true);
    fetchLogs(true);
  }, [statusFilter, startDate, endDate]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
          fetchLogs(false);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [fetchLogs, loading, loadingMore, hasMore]);

  function handleClearFilters() {
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
  }

  function exportToCSV() {
    if (logs.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há logs para exportar.",
        variant: "default",
      });
      return;
    }

    const headers = ["Data/Hora", "Status", "Mensagem", "Detalhes do Erro", "Executado Por"];
    const rows = logs.map((log) => [
      format(new Date(log.executed_at), "dd/MM/yyyy HH:mm:ss"),
      log.status === "success" ? "Sucesso" : log.status === "error" ? "Erro" : "Pendente",
      log.message || "-",
      log.error_details || "-",
      log.triggered_by || "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const timestamp = format(new Date(), "yyyy-MM-dd-HHmmss");
    link.setAttribute("href", url);
    link.setAttribute("download", `restore-logs-${timestamp}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Sucesso",
      description: "CSV exportado com sucesso!",
    });
  }

  function exportToPDF() {
    if (logs.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há logs para exportar.",
        variant: "default",
      });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    
    // Add title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Auditoria de Relatórios Enviados", margin, 20);
    
    // Add metadata
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, margin, 28);
    doc.text(`Total de registros: ${totalCount}`, margin, 34);
    
    // Prepare table data
    const tableData = logs.map((log) => [
      format(new Date(log.executed_at), "dd/MM/yyyy HH:mm"),
      log.status === "success" ? "Sucesso" : log.status === "error" ? "Erro" : "Pendente",
      log.message || "-",
      log.error_details || "-",
      log.triggered_by || "-",
    ]);

    // Add table
    autoTable(doc, {
      head: [["Data/Hora", "Status", "Mensagem", "Erro", "Executado Por"]],
      body: tableData,
      startY: 40,
      styles: { 
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: { 
        fillColor: [79, 70, 229], // Indigo
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 20 },
        2: { cellWidth: 50 },
        3: { cellWidth: 40 },
        4: { cellWidth: 30 },
      },
      margin: { left: margin, right: margin },
    });

    const timestamp = format(new Date(), "yyyy-MM-dd-HHmmss");
    doc.save(`restore-logs-${timestamp}.pdf`);
    
    toast({
      title: "Sucesso",
      description: "PDF exportado com sucesso!",
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
                Logs de execução automática dos relatórios de restauração {totalCount > 0 && `(${totalCount} total)`}
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
                <Button 
                  onClick={handleClearFilters} 
                  variant="outline"
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
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
                  
                  {/* Infinite scroll trigger */}
                  <div ref={observerTarget} className="flex justify-center py-4">
                    {loadingMore && (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-muted-foreground">Carregando mais...</p>
                      </div>
                    )}
                    {!hasMore && logs.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Todos os logs foram carregados
                      </p>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
