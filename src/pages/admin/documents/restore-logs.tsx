"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
import { TrendingUp, Users, FileText, Calendar } from "lucide-react";
import { useRestoreLogsMetrics } from "@/hooks/use-restore-logs-metrics";
import { exportLogsToCSV, exportLogsToPDF } from "@/utils/restore-logs-export";

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
  const pageSize = 10;

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc("get_restore_logs_with_profiles");
        if (error) throw error;
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
    exportLogsToCSV(filteredLogs);
  }

  // PDF Export
  function exportPDF() {
    exportLogsToPDF(filteredLogs);
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">📜 Auditoria de Restaurações</h1>

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

      {/* Filters */}
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
          <Button 
            variant="outline" 
            onClick={exportCSV}
            disabled={filteredLogs.length === 0}
          >
            📤 CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={exportPDF}
            disabled={filteredLogs.length === 0}
          >
            🧾 PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : paginatedLogs.length === 0 ? (
        <p className="text-muted-foreground">
          {logs.length === 0 
            ? "Nenhuma restauração encontrada." 
            : "Nenhuma restauração corresponde aos filtros aplicados."}
        </p>
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
