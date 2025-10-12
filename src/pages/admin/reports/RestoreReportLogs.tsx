"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Download, Loader2, AlertCircle } from "lucide-react";

interface RestoreReportLog {
  id: string;
  executed_at: string;
  status: string;
  message: string | null;
  error_details: string | null;
  triggered_by: string | null;
}

export default function RestoreReportLogs() {
  const [logs, setLogs] = useState<RestoreReportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportingCsv, setExportingCsv] = useState(false);
  const [dateError, setDateError] = useState("");

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
    if (filterStatus !== "all" && log.status !== filterStatus) {
      return false;
    }
    
    // Date range filter
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
    
    return true;
  });

  // CSV Export
  function exportCSV() {
    if (filteredLogs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há registros para exportar.",
        variant: "destructive",
      });
      return;
    }

    if (dateError) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros de data antes de exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setExportingCsv(true);
      
      const headers = ["Data/Hora", "Status", "Mensagem", "Detalhes do Erro"];
      const rows = filteredLogs.map((log) => [
        format(new Date(log.executed_at), "dd/MM/yyyy HH:mm:ss"),
        log.status,
        log.message || "-",
        log.error_details || "-",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `restore-report-logs-${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "CSV exportado com sucesso",
        description: `${filteredLogs.length} registros foram exportados.`,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Erro ao exportar CSV",
        description: "Ocorreu um erro ao tentar exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setExportingCsv(false);
    }
  }

  function getStatusBadge(status: string) {
    const statusConfig = {
      success: { label: "🟢 Sucesso", variant: "default" as const },
      error: { label: "🔴 Erro", variant: "destructive" as const },
      pending: { label: "⚪ Pendente", variant: "secondary" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "outline" as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs de Relatórios de Restauração</h1>
          <p className="text-muted-foreground mt-2">
            Monitore as execuções do envio diário de relatórios por e-mail
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Exportar</label>
                <Button
                  onClick={exportCSV}
                  disabled={exportingCsv || filteredLogs.length === 0}
                  className="w-full"
                >
                  {exportingCsv ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  CSV
                </Button>
              </div>
            </div>

            {dateError && (
              <div className="flex items-center gap-2 text-sm text-destructive mt-4">
                <AlertCircle className="h-4 w-4" />
                {dateError}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Registros ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum registro encontrado</p>
                <p className="text-sm">Ajuste os filtros para ver mais resultados</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <Card key={log.id} className="border-l-4 border-l-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusBadge(log.status)}
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(log.executed_at), "dd/MM/yyyy HH:mm:ss")}
                              </span>
                            </div>
                            {log.message && (
                              <p className="text-sm font-medium">{log.message}</p>
                            )}
                            {log.triggered_by && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Iniciado por: {log.triggered_by}
                              </p>
                            )}
                          </div>
                        </div>
                        {log.error_details && (
                          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-xs font-medium text-destructive mb-1">
                              Detalhes do Erro:
                            </p>
                            <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
                              {log.error_details}
                            </pre>
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
