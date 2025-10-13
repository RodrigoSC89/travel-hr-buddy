"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";

interface RestoreReportLog {
  id: string
  executed_at: string
  status: string
  message: string | null
  error_details: string | null
  triggered_by: string
}

export default function RestoreLogsPage() {
  const [logs, setLogs] = useState<RestoreReportLog[]>([]);
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef(null);

  const limit = 20;

  const fetchLogs = useCallback(async (reset = false) => {
    if (loading || (!reset && !hasMore)) return;
    
    setLoading(true);
    try {
      let query = supabase.from("restore_report_logs").select("*", { count: "exact" });

      if (status) query = query.eq("status", status);
      if (startDate) query = query.gte("executed_at", new Date(startDate).toISOString());
      if (endDate) query = query.lte("executed_at", new Date(endDate).toISOString());

      const currentPage = reset ? 0 : page;
      const { data, count, error } = await query
        .order("executed_at", { ascending: false })
        .range(currentPage * limit, (currentPage + 1) * limit - 1);

      if (error) {
        console.error("Error fetching logs:", error);
        toast({
          title: "Erro ao carregar logs",
          description: "Não foi possível carregar os registros.",
          variant: "destructive",
        });
        return;
      }

      if (reset) {
        setLogs(data || []);
        setPage(1);
      } else {
        setLogs((prev) => [...prev, ...(data || [])]);
        setPage((prev) => prev + 1);
      }
      
      setTotalCount(count || 0);
      setHasMore((data || []).length === limit);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar os logs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [status, startDate, endDate, page, loading, hasMore]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchLogs(true);
  }, [status, startDate, endDate]);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    
    const callback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        fetchLogs();
      }
    };
    
    observer.current = new IntersectionObserver(callback);
    if (loadMoreRef.current) observer.current.observe(loadMoreRef.current);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [fetchLogs, loading, hasMore]);

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
      const rows = logs.map(l => [
        format(new Date(l.executed_at), "yyyy-MM-dd HH:mm:ss"),
        l.status,
        l.message || "",
        l.error_details || ""
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `logs-relatorio-${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = "hidden";
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

  function exportPDF() {
    if (logs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há logs para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      const margin = 20;
      let y = margin;

      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Logs de Relatorios Automaticos", margin, y);
      y += 10;

      // Metadata
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, margin, y);
      y += 5;
      doc.text(`Total de registros: ${logs.length}`, margin, y);
      y += 10;

      // Table headers
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Data", margin, y);
      doc.text("Status", margin + 40, y);
      doc.text("Mensagem", margin + 70, y);
      doc.text("Erro", margin + 130, y);
      y += 7;

      // Table rows
      doc.setFont("helvetica", "normal");
      logs.forEach((log) => {
        if (y > 280) {
          doc.addPage();
          y = margin;
        }

        const dateStr = format(new Date(log.executed_at), "dd/MM HH:mm");
        const statusStr = log.status.substring(0, 10);
        const messageStr = (log.message || "-").substring(0, 30);
        const errorStr = (log.error_details || "-").substring(0, 30);

        doc.text(dateStr, margin, y);
        doc.text(statusStr, margin + 40, y);
        doc.text(messageStr, margin + 70, y);
        doc.text(errorStr, margin + 130, y);
        y += 7;
      });

      doc.save(`logs-relatorio-${format(new Date(), "yyyy-MM-dd")}.pdf`);

      toast({
        title: "PDF exportado com sucesso",
        description: `${logs.length} registros foram exportados.`,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Ocorreu um erro ao tentar exportar os dados.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">🧠 Auditoria de Relatórios Enviados</h1>
      <div className="text-sm text-muted-foreground">
        🔢 Total de registros encontrados: <strong>{totalCount}</strong>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Status (success/error)" value={status} onChange={e => setStatus(e.target.value)} />
        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <Button onClick={() => fetchLogs(true)}>🔍 Buscar</Button>
        <Button onClick={exportCSV}>📤 Exportar CSV</Button>
        <Button onClick={exportPDF}>📄 Exportar PDF</Button>
      </div>

      {logs.map((log) => (
        <Card key={log.id} className="p-4 border border-gray-300">
          <div><strong>Status:</strong> {log.status}</div>
          <div><strong>Mensagem:</strong> {log.message || "-"}</div>
          <div><strong>Data:</strong> {new Date(log.executed_at).toLocaleString()}</div>
          {log.error_details && <div className="text-red-600"><strong>Erro:</strong> {log.error_details}</div>}
        </Card>
      ))}

      {loading && <div className="text-center py-4">Carregando...</div>}
      <div ref={loadMoreRef} className="h-12" />
    </div>
  );
}
