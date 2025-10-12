"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Download, 
  Loader2
} from "lucide-react";

interface RestoreReportLog {
  id: string;
  executed_at: string;
  status: string;
  message: string | null;
  error_details: string | null;
  triggered_by: string;
}

export default function RestoreReportLogsPage() {
  const [logs, setLogs] = useState<RestoreReportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [dateError, setDateError] = useState("");
  const pageSize = 10;

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("restore_report_logs")
          .select("*")
          .order("executed_at", { ascending: false });

        if (error) {
          console.error("Error fetching restore report logs:", error);
          toast({
            title: "Erro ao carregar logs",
            description: "Não foi possível carregar os registros de execução.",
            variant: "destructive",
          });
          throw error;
        }
        setLogs(data || []);
      } catch (error) {
        console.error("Error fetching restore report logs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterStatus, startDate, endDate]);

  // Validate date range
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        setDateError("A data inicial não pode ser posterior à data final");
      } else {
        setDateError("");
      }
    } else {
      setDateError("");
    }
  }, [startDate, endDate]);

  // Apply filters
  const filteredLogs = logs.filter((log) => {
    // Status filter
    if (filterStatus && !log.status.toLowerCase().includes(filterStatus.toLowerCase())) {
      return false;
    }
    
    // Date range filter
    if (startDate || endDate) {
      const logDate = new Date(log.executed_at);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (logDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (logDate > end) return false;
      }
    }
    
    return true;
  });

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  // Export functions
  const exportToCSV = () => {
    if (filteredLogs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há logs que correspondam aos filtros aplicados.",
        variant: "destructive",
      });
      return;
    }

    setExportingCsv(true);
    try {
      const headers = ["ID", "Data/Hora", "Status", "Mensagem", "Detalhes do Erro", "Acionado Por"];
      const rows = filteredLogs.map(log => [
        log.id,
        format(new Date(log.executed_at), "dd/MM/yyyy HH:mm:ss"),
        log.status,
        log.message || "",
        log.error_details || "",
        log.triggered_by
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `restore_report_logs_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída",
        description: `${filteredLogs.length} registros exportados com sucesso.`,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setExportingCsv(false);
    }
  };

  const exportToPDF = () => {
    if (filteredLogs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há logs que correspondam aos filtros aplicados.",
        variant: "destructive",
      });
      return;
    }

    setExportingPdf(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      let yPosition = 20;

      // Title
      doc.setFontSize(16);
      doc.text("Relatório de Logs de Restore Report", margin, yPosition);
      yPosition += 10;

      // Generation date
      doc.setFontSize(10);
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm:ss")}`, margin, yPosition);
      yPosition += 10;

      // Summary
      doc.text(`Total de registros: ${filteredLogs.length}`, margin, yPosition);
      yPosition += 10;

      // Logs
      doc.setFontSize(8);
      filteredLogs.forEach((log, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(9);
        doc.text(`#${index + 1} - ${format(new Date(log.executed_at), "dd/MM/yyyy HH:mm:ss")}`, margin, yPosition);
        yPosition += 5;

        doc.setFontSize(8);
        doc.text(`Status: ${log.status}`, margin + 5, yPosition);
        yPosition += 5;
        
        if (log.message) {
          const messageLines = doc.splitTextToSize(`Mensagem: ${log.message}`, pageWidth - 2 * margin - 5);
          doc.text(messageLines, margin + 5, yPosition);
          yPosition += messageLines.length * 5;
        }

        if (log.error_details) {
          const errorLines = doc.splitTextToSize(`Erro: ${log.error_details}`, pageWidth - 2 * margin - 5);
          doc.text(errorLines, margin + 5, yPosition);
          yPosition += errorLines.length * 5;
        }

        doc.text(`Acionado por: ${log.triggered_by}`, margin + 5, yPosition);
        yPosition += 8;
      });

      doc.save(`restore_report_logs_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.pdf`);

      toast({
        title: "Exportação concluída",
        description: `${filteredLogs.length} registros exportados com sucesso.`,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setExportingPdf(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <Badge className="bg-green-600 hover:bg-green-700">Sucesso</Badge>;
      case "error":
        return <Badge variant="destructive">Erro</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-gray-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="h-8 w-8" />
          Logs de Relatórios de Restore
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualize e gerencie logs de execução do relatório automático diário de restore
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Input
                placeholder="Filtrar por status (ex: success, error, pending)"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Inicial</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Final</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          {dateError && (
            <p className="text-sm text-red-600 mt-2">{dateError}</p>
          )}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={exportingCsv || filteredLogs.length === 0}
            >
              {exportingCsv ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={exportToPDF}
              disabled={exportingPdf || filteredLogs.length === 0}
            >
              {exportingPdf ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Logs</p>
                <p className="text-2xl font-bold">{filteredLogs.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sucessos</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredLogs.filter(l => l.status.toLowerCase() === "success").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Erros</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredLogs.filter(l => l.status.toLowerCase() === "error").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Execução</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log encontrado com os filtros aplicados.
            </div>
          ) : (
            <>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {paginatedLogs.map((log) => (
                    <Card key={log.id} className="border">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="mt-1">{getStatusIcon(log.status)}</div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getStatusBadge(log.status)}
                                <span className="text-sm text-muted-foreground">
                                  <Clock className="inline h-3 w-3 mr-1" />
                                  {format(new Date(log.executed_at), "dd/MM/yyyy HH:mm:ss")}
                                </span>
                              </div>
                            </div>
                            {log.message && (
                              <p className="text-sm">{log.message}</p>
                            )}
                            {log.error_details && (
                              <details className="text-sm">
                                <summary className="cursor-pointer text-red-600 font-medium">
                                  Detalhes do Erro
                                </summary>
                                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                                  {log.error_details}
                                </pre>
                              </details>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Acionado por: {log.triggered_by}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages} ({filteredLogs.length} registros)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
