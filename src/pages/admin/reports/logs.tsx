"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

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
  const [statusFilter, setStatusFilter] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [page, setPage] = useState(1);
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
            description: "Não foi possível carregar os logs de envio diário.",
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

  // Apply filters
  const filteredLogs = logs.filter((log) => {
    // Status filter
    if (statusFilter && !log.status.toLowerCase().includes(statusFilter.toLowerCase())) {
      return false;
    }

    // Date range filter
    const logDate = new Date(log.executed_at);
    if (dateStart) {
      const start = new Date(dateStart);
      start.setHours(0, 0, 0, 0);
      if (logDate < start) return false;
    }
    if (dateEnd) {
      const end = new Date(dateEnd);
      end.setHours(23, 59, 59, 999);
      if (logDate > end) return false;
    }

    return true;
  });

  // Apply pagination
  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, dateStart, dateEnd]);

  function exportCSV() {
    if (filteredLogs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há logs para exportar.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Data/Hora", "Status", "Mensagem", "Detalhes do Erro", "Acionado por"];
    const rows = filteredLogs.map((log) => [
      format(new Date(log.executed_at), "dd/MM/yyyy HH:mm"),
      log.status,
      log.message || "",
      log.error_details || "",
      log.triggered_by,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `restore_logs_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV exportado com sucesso",
      description: `${filteredLogs.length} registros foram exportados.`,
    });
  }

  function exportPDF() {
    if (filteredLogs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há logs para exportar.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Restore Logs Report", 14, 20);

    filteredLogs.forEach((log, index) => {
      const y = 30 + index * 30;
      doc.setFontSize(10);
      doc.text(`Data: ${format(new Date(log.executed_at), "dd/MM/yyyy HH:mm")}`, 14, y);
      doc.text(`Status: ${log.status}`, 14, y + 6);
      doc.text(`Mensagem: ${log.message}`, 14, y + 12);
      if (log.error_details) doc.text(`Erro: ${log.error_details.substring(0, 80)}...`, 14, y + 18);
    });

    doc.save("restore_logs.pdf");

    toast({
      title: "PDF exportado com sucesso",
      description: `${filteredLogs.length} registros foram exportados.`,
    });
  }

  return (
    <ScrollArea className="p-6 h-[90vh] w-full">
      <h1 className="text-2xl font-bold mb-4">📊 Logs de Envio Diário de Relatório</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <Input placeholder="Status (success, error...)" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-48" />
        <Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
        <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
        <Button onClick={exportCSV}>📤 Exportar CSV</Button>
        <Button onClick={exportPDF}>📄 Exportar PDF</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <span className="text-muted-foreground">Carregando logs...</span>
        </div>
      ) : paginatedLogs.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-muted-foreground">
              {logs.length === 0
                ? "Nenhum log encontrado"
                : "Nenhum log corresponde aos filtros aplicados"}
            </p>
          </div>
        </Card>
      ) : (
        <>
          {paginatedLogs.map((log) => (
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
                <div className="text-base">📝 {log.message}</div>
                {log.error_details && (
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-2 rounded">
                    {log.error_details}
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </>
      )}

      <div className="flex justify-between mt-6">
        <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>⬅️ Anterior</Button>
        <Button disabled={page * pageSize >= filteredLogs.length} onClick={() => setPage(page + 1)}>Próximo ➡️</Button>
      </div>
    </ScrollArea>
  );
}
