"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface RestoreReportLog {
  id: string;
  executed_at: string;
  status: string;
  message: string | null;
  error_details: string | null;
}

export default function RestoreReportLogsPage() {
  const [logs, setLogs] = useState<RestoreReportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [statusFilter, dateStart, dateEnd]);

  async function fetchLogs() {
    try {
      setLoading(true);
      let query = supabase
        .from("restore_report_logs")
        .select("*")
        .order("executed_at", { ascending: false });

      if (statusFilter) query = query.eq("status", statusFilter);
      if (dateStart) query = query.gte("executed_at", dateStart);
      if (dateEnd) query = query.lte("executed_at", dateEnd);

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching restore report logs:", error);
        toast({
          title: "Erro ao carregar logs",
          description: "Não foi possível carregar os logs de envio de relatório.",
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

  function exportCSV() {
    if (logs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há logs para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const headers = ["Data", "Status", "Mensagem", "Erro"];
      const rows = logs.map((log) => [
        format(new Date(log.executed_at), "dd/MM/yyyy HH:mm"),
        log.status,
        log.message || "",
        log.error_details?.replace(/\n/g, " ") || ""
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `restore-report-logs-${format(new Date(), "yyyy-MM-dd")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "CSV exportado com sucesso",
        description: `${logs.length} registros foram exportados.`,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Erro ao exportar CSV",
        description: "Ocorreu um erro ao tentar exportar os dados.",
        variant: "destructive",
      });
    }
  }

  return (
    <ScrollArea className="p-6 h-[90vh] w-full">
      <h1 className="text-2xl font-bold mb-4">
        📊 Logs de Envio Diário de Relatório
      </h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Status (success, error...)"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        />
        <Input
          type="date"
          value={dateStart}
          onChange={(e) => setDateStart(e.target.value)}
        />
        <Input
          type="date"
          value={dateEnd}
          onChange={(e) => setDateEnd(e.target.value)}
        />
        <Button onClick={exportCSV} disabled={logs.length === 0}>
          📤 Exportar CSV
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando logs...</p>
          </div>
        </div>
      ) : logs.length === 0 ? (
        <Card className="p-8">
          <p className="text-center text-muted-foreground">
            Nenhum log encontrado. Os logs de envio de relatório aparecerão aqui.
          </p>
        </Card>
      ) : (
        logs.map((log) => (
          <Card key={log.id} className="mb-4">
            <CardContent className="space-y-1 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {format(new Date(log.executed_at), "dd/MM/yyyy HH:mm")}
                </span>
                <Badge
                  variant={
                    log.status === "success"
                      ? "success"
                      : log.status === "error"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {log.status.toUpperCase()}
                </Badge>
              </div>
              <div className="text-base">📝 {log.message || "Sem mensagem"}</div>
              {log.error_details && (
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-2 rounded">
                  {log.error_details}
                </pre>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </ScrollArea>
  );
}
