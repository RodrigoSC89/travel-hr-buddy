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
import { 
  Mail,
  CheckCircle, 
  XCircle, 
  Clock,
  Download, 
  Loader2,
  AlertTriangle,
  Activity
} from "lucide-react";

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
  const [dateError, setDateError] = useState("");
  const [exportingCsv, setExportingCsv] = useState(false);

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
        description: "Não há registros de execução para exportar.",
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

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
    case "success":
      return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Sucesso</Badge>;
    case "error":
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Erro</Badge>;
    case "pending":
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-8 w-8 text-blue-500" />
        <h1 className="text-2xl font-bold">Logs de Relatórios de Restauração</h1>
      </div>

      <p className="text-muted-foreground">
        Monitore as execuções diárias do sistema de envio de relatórios de restauração por e-mail.
      </p>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="success">Sucesso</SelectItem>
            <SelectItem value="error">Erro</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Data inicial"
          className={dateError ? "border-red-500" : ""}
        />

        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="Data final"
          className={dateError ? "border-red-500" : ""}
        />

        <Button 
          variant="outline" 
          onClick={exportCSV}
          disabled={filteredLogs.length === 0 || exportingCsv || !!dateError}
        >
          {exportingCsv ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </>
          )}
        </Button>
      </div>
      
      {/* Date Error Message */}
      {dateError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
          <AlertTriangle className="h-4 w-4 inline mr-2" />
          {dateError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando registros...</span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-2">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-lg font-semibold text-muted-foreground">
              {logs.length === 0 
                ? "Nenhum log de execução encontrado" 
                : "Nenhum log corresponde aos filtros aplicados"}
            </p>
            <p className="text-sm text-muted-foreground">
              {logs.length === 0 
                ? "Quando relatórios forem enviados, os logs aparecerão aqui." 
                : "Tente ajustar os filtros para ver mais resultados."}
            </p>
          </div>
        </Card>
      ) : (
        <ScrollArea className="h-[600px] rounded-md border p-4">
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <Card key={log.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {format(new Date(log.executed_at), "dd/MM/yyyy HH:mm:ss")}
                    </CardTitle>
                    {getStatusBadge(log.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {log.message && (
                    <p className="text-sm">
                      <strong>Mensagem:</strong> {log.message}
                    </p>
                  )}
                  {log.error_details && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800 font-mono whitespace-pre-wrap">
                        <strong>Detalhes do Erro:</strong><br />
                        {log.error_details}
                      </p>
                    </div>
                  )}
                  {log.triggered_by && (
                    <p className="text-xs text-muted-foreground">
                      Iniciado por: {log.triggered_by}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
