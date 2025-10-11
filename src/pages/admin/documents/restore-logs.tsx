"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  const chartRef = useRef<HTMLDivElement>(null);

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

  // Chart data: Group logs by date
  const chartData = useMemo(() => {
    const dateMap: Record<string, number> = {};
    
    filteredLogs.forEach((log) => {
      const date = format(new Date(log.restored_at), "dd/MM/yyyy");
      dateMap[date] = (dateMap[date] || 0) + 1;
    });

    return Object.entries(dateMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split("/").map(Number);
        const [dayB, monthB, yearB] = b.date.split("/").map(Number);
        return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
      })
      .slice(-15); // Show last 15 dates
  }, [filteredLogs]);

  // Export chart as PNG
  function exportChartAsImage() {
    if (!chartRef.current) return;

    html2canvas(chartRef.current).then((canvas) => {
      const link = document.createElement("a");
      link.download = "restore-chart.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  }

  // Export chart as PDF
  function exportChartAsPDF() {
    if (!chartRef.current) return;

    html2canvas(chartRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("restore-chart.pdf");
    });
  }

  // CSV Export
  function exportCSV() {
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
    link.setAttribute("download", "restore-logs.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // PDF Export
  function exportPDF() {
    const doc = new jsPDF();
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
      if (y > 280) {
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

    doc.save("restore-logs.pdf");
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

      {/* Chart Section */}
      {filteredLogs.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">📊 Gráfico de Restaurações</h2>
              <div className="flex gap-2">
                <Button onClick={exportChartAsImage} variant="outline" size="sm">
                  📷 PNG
                </Button>
                <Button onClick={exportChartAsPDF} variant="outline" size="sm">
                  🧾 PDF
                </Button>
              </div>
            </div>
            <div ref={chartRef}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
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
