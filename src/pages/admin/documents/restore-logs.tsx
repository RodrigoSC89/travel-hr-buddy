"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useRestoreLogsMetrics } from "@/hooks/use-restore-logs-metrics";
import { exportRestoreLogsToCSV, exportRestoreLogsToPDF } from "@/utils/restore-logs-export";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { TrendingUp, Users, FileText, Calendar, Download, Loader2, Mail } from "lucide-react";
import html2canvas from "html2canvas";

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
  const [loading, setLoading] = useState(true);
  const [filterEmail, setFilterEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [dateError, setDateError] = useState("");
  const pageSize = 10;

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc("get_restore_logs_with_profiles");
        if (error) {
          console.error("Error fetching restore logs:", error);
          toast({
            title: "Erro ao carregar logs",
            description: "Não foi possível carregar os registros de restauração.",
            variant: "destructive",
          });
          throw error;
        }
        setLogs(data || []);
      } catch (error) {
        console.error("Error fetching restore logs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterEmail, startDate, endDate]);

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

  // Calculate metrics using custom hook
  const metrics = useRestoreLogsMetrics(filteredLogs);

  // CSV Export
  function exportCSV() {
    if (filteredLogs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há registros de restauração para exportar.",
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
      exportRestoreLogsToCSV(filteredLogs);
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
        description: "Não há registros de restauração para exportar.",
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
      exportRestoreLogsToPDF(filteredLogs);
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

  // Email Report
  async function sendEmailWithChart() {
    // Validate data exists
    if (filteredLogs.length === 0) {
      toast({
        title: "Nenhum dado para enviar",
        description: "Não há registros de restauração para enviar.",
        variant: "destructive",
      });
      return;
    }

    // Validate date range
    if (dateError) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros de data antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    const node = document.getElementById("restore-logs-dashboard");
    if (!node) {
      toast({
        title: "Erro ao capturar dashboard",
        description: "Não foi possível encontrar o dashboard para captura.",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);
    try {
      // Capture dashboard as image at 2x scale for quality
      const canvas = await html2canvas(node, { scale: 2 });
      const imageBase64 = canvas.toDataURL("image/png");

      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error("VITE_SUPABASE_URL não configurado");
      }

      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não autenticado");
      }

      // Send to backend edge function
      const response = await fetch(
        `${supabaseUrl}/functions/v1/send-chart-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            imageBase64,
            chartType: "Restore Logs Audit",
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "E-mail enviado com sucesso",
          description: "Relatório de auditoria enviado por e-mail.",
        });
      } else {
        toast({
          title: "Erro ao enviar e-mail",
          description: result.error || "Erro desconhecido ao enviar e-mail.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending email with chart:", error);
      toast({
        title: "Erro ao enviar e-mail",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">📜 Auditoria de Restaurações</h1>

      {/* Dashboard Container for Email Capture */}
      <div id="restore-logs-dashboard">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Restaurações</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
              <p className="text-xs text-muted-foreground">Todas as restaurações</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.thisWeek}</div>
              <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.thisMonth}</div>
              <p className="text-xs text-muted-foreground">Mês atual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuário Mais Ativo</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold truncate">{metrics.mostActiveUser}</div>
              <p className="text-xs text-muted-foreground">{metrics.mostActiveCount} restaurações</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tendência de Restaurações (Últimos 7 Dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={metrics.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top 5 Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={metrics.userDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Filtrar por e-mail"
          value={filterEmail}
          onChange={(e) => setFilterEmail(e.target.value)}
        />
        <div>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            title="Data inicial"
            className={dateError ? "border-red-500" : ""}
          />
        </div>
        <div>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            title="Data final"
            className={dateError ? "border-red-500" : ""}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportCSV}
            disabled={filteredLogs.length === 0 || exportingCsv || !!dateError}
            className="flex-1"
          >
            {exportingCsv ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={exportPDF}
            disabled={filteredLogs.length === 0 || exportingPdf || !!dateError}
            className="flex-1"
          >
            {exportingPdf ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={sendEmailWithChart}
            disabled={filteredLogs.length === 0 || sendingEmail || !!dateError}
            className="flex-1"
          >
            {sendingEmail ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                E-mail
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Date Error Message */}
      {dateError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
          ⚠️ {dateError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando registros...</span>
        </div>
      ) : paginatedLogs.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-2">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-lg font-semibold text-muted-foreground">
              {logs.length === 0 
                ? "Nenhuma restauração encontrada" 
                : "Nenhuma restauração corresponde aos filtros aplicados"}
            </p>
            <p className="text-sm text-muted-foreground">
              {logs.length === 0 
                ? "Quando documentos forem restaurados, eles aparecerão aqui." 
                : "Tente ajustar os filtros para ver mais resultados."}
            </p>
          </div>
        </Card>
      ) : (
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
      )}

      {!loading && filteredLogs.length > pageSize && (
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
      )}
    </div>
  );
}
