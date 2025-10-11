"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";
import { 
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  Download, 
  Loader2,
  AlertTriangle 
} from "lucide-react";

interface ReportLog {
  id: string;
  executed_at: string;
  status: string;
  message: string | null;
  error_details: string | null;
  triggered_by: string;
}

export default function ReportLogsPage() {
  const [logs, setLogs] = useState<ReportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
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
          console.error("Error fetching report logs:", error);
          toast({
            title: "Erro ao carregar logs",
            description: "Não foi possível carregar os registros de relatórios.",
            variant: "destructive",
          });
          throw error;
        }

        setLogs(data || []);
      } catch (error) {
        console.error("Error fetching report logs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, dateStart, dateEnd]);

  // Validate date range
  useEffect(() => {
    if (dateStart && dateEnd) {
      const start = new Date(dateStart);
      const end = new Date(dateEnd);
      if (start > end) {
        setDateError("A data inicial não pode ser posterior à data final");
      } else {
        setDateError("");
      }
    } else {
      setDateError("");
    }
  }, [dateStart, dateEnd]);

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

  // Calculate chart data
  const { chartData, pieData } = useMemo(() => {
    // Bar chart - last 7 days
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      return {
        day: format(date, "dd/MM"),
        count: 0,
      };
    });

    filteredLogs.forEach(log => {
      const logDate = new Date(log.executed_at);
      const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < 7) {
        last7Days[6 - daysDiff].count++;
      }
    });

    // Pie chart - by status
    const statusCounts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      statusCounts[log.status] = (statusCounts[log.status] || 0) + 1;
    });

    const pieChartData = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      chartData: last7Days,
      pieData: pieChartData,
    };
  }, [filteredLogs]);

  // CSV Export
  function exportCSV() {
    if (filteredLogs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há registros de relatórios para exportar.",
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
      
      const headers = ["Data/Hora", "Status", "Mensagem", "Erro"];
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
      link.setAttribute("download", `report-logs-${format(new Date(), "yyyy-MM-dd")}.csv`);
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

  // PDF Export
  function exportPDF() {
    if (filteredLogs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há registros de relatórios para exportar.",
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
      setExportingPdf(true);
      
      const doc = new jsPDF();
      const margin = 20;
      let y = margin;

      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Logs de Envio Diario de Relatorio", margin, y);
      y += 10;

      // Metadata
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, margin, y);
      y += 5;
      doc.text(`Total de registros: ${filteredLogs.length}`, margin, y);
      y += 10;

      // Table headers
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Data/Hora", margin, y);
      doc.text("Status", margin + 50, y);
      doc.text("Mensagem", margin + 80, y);
      y += 7;

      // Table rows
      doc.setFont("helvetica", "normal");
      filteredLogs.forEach((log) => {
        if (y > 280) {
          doc.addPage();
          y = margin;
        }

        const date = format(new Date(log.executed_at), "dd/MM HH:mm");
        const status = log.status.substring(0, 15);
        const message = (log.message || "-").substring(0, 50);

        doc.text(date, margin, y);
        doc.text(status, margin + 50, y);
        doc.text(message, margin + 80, y);
        y += 7;
      });

      doc.save(`report-logs-${format(new Date(), "yyyy-MM-dd")}.pdf`);

      toast({
        title: "PDF exportado com sucesso",
        description: `${filteredLogs.length} registros foram exportados.`,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Ocorreu um erro ao tentar exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setExportingPdf(false);
    }
  }

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <Badge className="bg-green-500">SUCCESS</Badge>;
      case "error":
        return <Badge variant="destructive">ERROR</Badge>;
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  const COLORS = ["#4ade80", "#facc15", "#f87171"];

  return (
    <ScrollArea className="p-6 h-[90vh] w-full">
      <h1 className="text-2xl font-bold mb-4">📊 Logs de Envio Diário de Relatório</h1>

      {/* Filters */}
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
          className={dateError ? "border-red-500" : ""}
        />
        <Input 
          type="date" 
          value={dateEnd} 
          onChange={(e) => setDateEnd(e.target.value)}
          className={dateError ? "border-red-500" : ""}
        />
        <Button 
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
              📤 Exportar CSV
            </>
          )}
        </Button>
        <Button 
          onClick={exportPDF}
          disabled={filteredLogs.length === 0 || exportingPdf || !!dateError}
        >
          {exportingPdf ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              📄 Exportar PDF
            </>
          )}
        </Button>
      </div>

      {/* Date Error Message */}
      {dateError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm mb-6">
          <AlertTriangle className="h-4 w-4 inline mr-2" />
          {dateError}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="p-4">
          <h2 className="font-semibold mb-2">📈 Gráfico por Dia</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-2">📊 Por Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                {pieData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando registros...</span>
        </div>
      ) : paginatedLogs.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-muted-foreground">
              {logs.length === 0 
                ? "Nenhum log de relatório encontrado" 
                : "Nenhum log corresponde aos filtros aplicados"}
            </p>
            <p className="text-sm text-muted-foreground">
              {logs.length === 0 
                ? "Quando relatórios forem enviados, eles aparecerão aqui." 
                : "Tente ajustar os filtros para ver mais resultados."}
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
                  {getStatusBadge(log.status)}
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

      {/* Pagination */}
      {!loading && filteredLogs.length > pageSize && (
        <div className="flex justify-between mt-6">
          <Button 
            disabled={page <= 1} 
            onClick={() => setPage(page - 1)}
            variant="ghost"
          >
            ⬅️ Anterior
          </Button>
          <span className="text-sm text-muted-foreground self-center">
            Página {page} de {Math.ceil(filteredLogs.length / pageSize)}
          </span>
          <Button 
            disabled={page * pageSize >= filteredLogs.length}
            onClick={() => setPage(page + 1)}
            variant="ghost"
          >
            Próximo ➡️
          </Button>
        </div>
      )}
    </ScrollArea>
  );
}
