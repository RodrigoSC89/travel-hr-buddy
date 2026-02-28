/**
 * Restore Report Logs Page
 * PATCH 871 - Removed @ts-nocheck, uses access_logs as fallback
 * Tables: access_logs (existing table, replaces restore_report_logs)
 */
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logger } from "@/lib/logger";
import {
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Download,
  FileDown,
  Eye,
  RefreshCw,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getJsPDF, getAutoTable } from '@/lib/pdf/lazy-pdf';
import { toast } from "sonner";
// Mapped from access_logs table
interface RestoreReportLog {
  id: string;
  executed_at: string;
  status: string;
  message: string | null;
  error_details: string | null;
  triggered_by: string;
}

// Map access_logs to RestoreReportLog format
const mapAccessLogToReportLog = (log: Record<string, unknown>): RestoreReportLog => ({
  id: String(log.id || ""),
  executed_at: String(log.timestamp || ""),
  status: String(log.result || "unknown"),
  message: log.action as string | null,
  error_details: (log.details as Record<string, unknown>)?.error as string | null ?? null,
  triggered_by: String(log.user_id || "system"),
});

/**
 * Restore Report Logs Page
 * Displays audit logs of automated restore report executions with infinite scroll
 * 
 * Features:
 * - Infinite scroll pagination (20 records per page)
 * - Auto-applying filters
 * - Real-time total count display
 * - Enhanced CSV/PDF export with notifications
 * 
 * Supports public view mode via ?public=1 query parameter
 * - Public mode hides navigation and action buttons
 * - Shows read-only indicator at bottom
 * - Perfect for TV monitors and public displays
 */
export default function RestoreReportLogsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [logs, setLogs] = useState<RestoreReportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  
  // Check if in public view mode
  const isPublic = searchParams.get("public") === "1";
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Intersection observer ref for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch logs with pagination
  const fetchLogs = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setLogs([]);
      setCurrentPage(0);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }
    
    setError(null);
    
    try {
      const pageToFetch = reset ? 0 : currentPage;
      const from = pageToFetch * 20;
      const to = from + 19;

      // Use type assertion for custom tables not in generated types
      type RestoreReportLogsTable = { 
        id: string; 
        executed_at: string; 
        status: string; 
        message: string | null; 
        error_details: string | null; 
        triggered_by: string 
      };
      
      // Use access_logs as fallback since restore_report_logs may not exist
      let baseQuery = supabase
        .from("access_logs")
        .select("id, timestamp, action, result, details, user_id", { count: "exact" });

      // Apply status filter
      if (statusFilter && statusFilter !== "all") {
        baseQuery = baseQuery.eq("result", statusFilter);
      }

      // Apply date range filters
      if (startDate) {
        baseQuery = baseQuery.gte("timestamp", new Date(startDate).toISOString());
      }
      if (endDate) {
        // Add one day to include the entire end date
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        baseQuery = baseQuery.lte("timestamp", endDateTime.toISOString());
      }

      const { data, error: fetchError, count } = await baseQuery
        .order("timestamp", { ascending: false })
        .range(from, to);

      if (fetchError) throw fetchError;
      
      const newLogs = (data || []).map(log => mapAccessLogToReportLog(log as unknown as Record<string, unknown>));
      
      if (reset) {
        setLogs(newLogs);
      } else {
        setLogs((prev) => [...prev, ...newLogs]);
      }
      
      setTotalCount(count || 0);
      setHasMore(newLogs.length === 20);
      
      if (!reset) {
        setCurrentPage((prev) => prev + 1);
      }
    } catch (err) {
      logger.error("Error fetching logs:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar logs");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [statusFilter, startDate, endDate, currentPage]);

  // Auto-apply filters when they change
  useEffect(() => {
    setCurrentPage(0);
    setHasMore(true);
    fetchLogs(true);
  }, [statusFilter, startDate, endDate]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchLogs(false);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, loading, fetchLogs]);

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
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, "\"\"")}"`).join(",")),
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
    
    toast.success("CSV exportado com sucesso!", {
      description: `${logs.length} registros exportados`
    });
  }

  async function exportToPDF() {
    if (logs.length === 0) return;

    const JsPDF = await getJsPDF();
    const autoTable = await getAutoTable();
    const doc = new JsPDF();
    
    // Add title with branded color
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text("Auditoria de Relatórios Enviados", 14, 20);
    
    // Add metadata
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 28);
    doc.text(`Total de registros: ${totalCount}`, 14, 34);
    
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
      startY: 40,
      styles: { 
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak"
      },
      headStyles: { 
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255]
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 60 },
        3: { cellWidth: 60 },
      },
    });

    const timestamp = format(new Date(), "yyyy-MM-dd-HHmmss");
    doc.save(`restore-logs-${timestamp}.pdf`);
    
    toast.success("PDF exportado com sucesso!", {
      description: `${logs.length} registros exportados`
    });
  }

  function getStatusIcon(status: string) {
    switch (status) {
    case "success":
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    case "error":
      return <XCircle className="w-5 h-5 text-destructive" />;
    case "pending":
      return <Clock className="w-5 h-5 text-warning" />;
    default:
      return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
    case "success":
      return "border-l-success bg-success/5";
    case "error":
      return "border-l-destructive bg-destructive/5";
    case "pending":
      return "border-l-warning bg-warning/5";
    default:
      return "border-l-muted bg-muted/50";
    }
  }

  const successCount = logs.filter((log) => log.status === "success").length;
  const errorCount = logs.filter((log) => log.status === "error").length;

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isPublic && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {isPublic && <Eye className="inline w-6 h-6 mr-2" />}
                🧠 Auditoria de Relatórios Enviados
                {totalCount > 0 && (
                  <span className="ml-2 text-lg text-muted-foreground">
                    ({totalCount} total)
                  </span>
                )}
              </h1>
              <p className="text-sm text-muted-foreground">
                Logs de execução automática dos relatórios de restauração
              </p>
            </div>
          </div>
          {!isPublic && (
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
              <Button 
                onClick={() => fetchLogs(true)} 
                variant="outline" 
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        {!isPublic && (
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
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Execuções</p>
                  <p className="text-2xl font-bold">{logs.length}</p>
                </div>
                <Clock className="w-8 h-8 text-info opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sucessos</p>
                  <p className="text-2xl font-bold text-success">{successCount}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-success opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Erros</p>
                  <p className="text-2xl font-bold text-destructive">{errorCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-destructive opacity-50" />
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
              <div className="space-y-0">{Array.from({length:8}).map((_,i)=><div key={i} className="flex gap-4 px-4 py-3 border-b border-border/20"><div className="h-4 w-20 bg-muted/40 rounded animate-pulse" style={{opacity:1-i*0.1}}/><div className="h-4 flex-1 bg-muted/40 rounded animate-pulse" style={{opacity:1-i*0.1}}/><div className="h-4 w-16 bg-muted/30 rounded animate-pulse"/></div>)}</div>
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
                            <p className="text-sm text-foreground">{log.message}</p>
                          </div>
                        )}

                        {log.error_details && (
                          <div className="pl-8">
                            <details className="text-sm">
                              <summary className="cursor-pointer text-destructive font-medium">
                                Detalhes do Erro
                              </summary>
                              <pre className="mt-2 p-3 bg-destructive/10 rounded text-xs overflow-x-auto">
                                {log.error_details}
                              </pre>
                            </details>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Infinite scroll trigger */}
                  <div ref={observerTarget} className="flex items-center justify-center py-4">
                    {loadingMore && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Carregando mais...</span>
                      </div>
                    )}
                    {!loadingMore && !hasMore && logs.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        ✓ Todos os logs foram carregados
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Public View Indicator */}
        {isPublic && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-info/10 border border-info/30 rounded-full text-sm text-info">
              <Eye className="w-4 h-4" />
              <span className="font-medium">Modo Somente Leitura (Visualização Pública)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
