"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface RestoreLog {
  id: string;
  document_id: string;
  version_id: string;
  restored_by: string;
  restored_at: string;
  email: string | null;
}

export default function RestoreLogsPage() {
  const [logs, setLogs] = useState<RestoreLog[]>([]);
  const [filterEmail, setFilterEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase.rpc("get_restore_logs_with_profiles");
      setLogs(data || []);
    }
    fetchLogs();
  }, []);

  // Apply filters
  const filteredLogs = logs.filter((log) => {
    // Email filter
    if (filterEmail && !log.email?.toLowerCase().includes(filterEmail.toLowerCase())) {
      return false;
    }
    
    // Date range filter
    const logDate = new Date(log.restored_at);
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

  // Apply pagination
  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  // CSV Export
  function exportCSV() {
    // Validate there's data to export
    if (filteredLogs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há logs para exportar com os filtros aplicados.",
        variant: "destructive",
      });
      return;
    }

    try {
      const headers = ["Documento", "Versão Restaurada", "Restaurado por", "Data"];
      const rows = filteredLogs.map((log) => [
        log.document_id,
        log.version_id,
        log.email || "-",
        format(new Date(log.restored_at), "dd/MM/yyyy HH:mm"),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `restore-logs-${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "CSV exportado com sucesso",
        description: `${filteredLogs.length} registro(s) exportado(s).`,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Erro ao exportar CSV",
        description: "Ocorreu um erro ao tentar exportar o arquivo.",
        variant: "destructive",
      });
    }
  }

  // PDF Export
  function exportPDF() {
    // Validate there's data to export
    if (filteredLogs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há logs para exportar com os filtros aplicados.",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let y = margin;

      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Auditoria de Restauracoes", margin, y);
      y += 10;

      // Table headers
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Documento", margin, y);
      doc.text("Versao", margin + 50, y);
      doc.text("Email", margin + 80, y);
      doc.text("Data", margin + 130, y);
      y += 7;

      // Table rows
      doc.setFont("helvetica", "normal");
      filteredLogs.forEach((log) => {
        // Check if we need a new page
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        const docId = log.document_id.substring(0, 8) + "...";
        const versionId = log.version_id.substring(0, 8) + "...";
        const email = log.email ? log.email.substring(0, 20) : "-";
        const date = format(new Date(log.restored_at), "dd/MM/yyyy HH:mm");

        doc.text(docId, margin, y);
        doc.text(versionId, margin + 50, y);
        doc.text(email, margin + 80, y);
        doc.text(date, margin + 130, y);
        y += 7;
      });

      doc.save(`restore-logs-${format(new Date(), "yyyy-MM-dd")}.pdf`);

      toast({
        title: "PDF exportado com sucesso",
        description: `${filteredLogs.length} registro(s) exportado(s).`,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Ocorreu um erro ao tentar exportar o arquivo.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">📜 Auditoria de Restaurações</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Filtrar por e-mail"
          value={filterEmail}
          onChange={(e) => setFilterEmail(e.target.value)}
        />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          title="Data inicial"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          title="Data final"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>📤 CSV</Button>
          <Button variant="outline" onClick={exportPDF}>🧾 PDF</Button>
        </div>
      </div>

      {paginatedLogs.length === 0 && (
        <p className="text-muted-foreground">Nenhuma restauração encontrada.</p>
      )}

      <div className="grid gap-4">
        {paginatedLogs.map((log) => (
          <Card key={log.id}>
            <CardContent className="space-y-1 p-4">
              <p>
                <strong>Documento:</strong>{" "}
                <Link
                  to={`/admin/documents/view/${log.document_id}`}
                  className="underline text-blue-600 hover:text-blue-800"
                >
                  {log.document_id}
                </Link>
              </p>
              <p>
                <strong>Versão Restaurada:</strong> {log.version_id}
              </p>
              <p>
                <strong>Restaurado por:</strong> {log.email || "-"}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Data:</strong> {format(new Date(log.restored_at), "dd/MM/yyyy HH:mm")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-4">
        <Button
          variant="ghost"
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          ⬅️ Anterior
        </Button>
        <span className="text-sm text-muted-foreground">Página {page}</span>
        <Button
          variant="ghost"
          disabled={page * pageSize >= filteredLogs.length}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Próxima ➡️
        </Button>
      </div>
    </div>
  );
}
