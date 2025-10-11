"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";
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
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Zap, 
  Download, 
  Loader2,
  AlertTriangle 
} from "lucide-react";

interface AutomationExecution {
  id: string;
  workflow_id: string;
  workflow_name?: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  triggered_by: string | null;
  trigger_data: any;
  execution_log: any;
}

export default function ExecutionLogsPage() {
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [workflows, setWorkflows] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterWorkflow, setFilterWorkflow] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [dateError, setDateError] = useState("");
  const pageSize = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch workflows
        const { data: workflowData, error: workflowError } = await supabase
          .from("automation_workflows")
          .select("id, name")
          .order("name");

        if (workflowError) {
          console.error("Error fetching workflows:", workflowError);
        } else {
          setWorkflows(workflowData || []);
        }

        // Fetch executions with workflow names
        const { data: executionData, error: executionError } = await supabase
          .from("automation_executions")
          .select(`
            *,
            automation_workflows (
              name
            )
          `)
          .order("started_at", { ascending: false });

        if (executionError) {
          console.error("Error fetching executions:", executionError);
          toast({
            title: "Erro ao carregar logs",
            description: "Não foi possível carregar os registros de execução.",
            variant: "destructive",
          });
          throw executionError;
        }

        // Transform data to include workflow name
        const transformedData = (executionData || []).map((execution: any) => ({
          ...execution,
          workflow_name: execution.automation_workflows?.name || "Workflow Desconhecido"
        }));

        setExecutions(transformedData);
      } catch (error) {
        console.error("Error fetching execution logs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterWorkflow, startDate, endDate]);

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
  const filteredExecutions = executions.filter((execution) => {
    // Status filter
    if (filterStatus !== "all" && execution.status !== filterStatus) {
      return false;
    }

    // Workflow filter
    if (filterWorkflow !== "all" && execution.workflow_id !== filterWorkflow) {
      return false;
    }
    
    // Date range filter
    const executionDate = new Date(execution.started_at);
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (executionDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (executionDate > end) return false;
    }
    
    return true;
  });

  // Apply pagination
  const paginatedExecutions = filteredExecutions.slice((page - 1) * pageSize, page * pageSize);

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);

    const thisWeek = filteredExecutions.filter(exec => new Date(exec.started_at) >= weekStart).length;
    const thisMonth = filteredExecutions.filter(exec => new Date(exec.started_at) >= monthStart).length;

    // Success rate
    const completed = filteredExecutions.filter(exec => exec.status === "completed").length;
    const failed = filteredExecutions.filter(exec => exec.status === "failed").length;
    const successRate = filteredExecutions.length > 0 
      ? Math.round((completed / filteredExecutions.length) * 100) 
      : 0;

    // Average duration
    const completedWithDuration = filteredExecutions.filter(exec => 
      exec.status === "completed" && exec.duration_ms !== null
    );
    const avgDuration = completedWithDuration.length > 0
      ? Math.round(
          completedWithDuration.reduce((sum, exec) => sum + (exec.duration_ms || 0), 0) / 
          completedWithDuration.length / 1000
        )
      : 0;

    // Prepare chart data (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      return {
        date: format(date, "dd/MM"),
        success: 0,
        failed: 0,
      };
    });

    filteredExecutions.forEach(exec => {
      const execDate = new Date(exec.started_at);
      const daysDiff = Math.floor((now.getTime() - execDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < 7) {
        if (exec.status === "completed") {
          last7Days[6 - daysDiff].success++;
        } else if (exec.status === "failed") {
          last7Days[6 - daysDiff].failed++;
        }
      }
    });

    // Count by workflow
    const workflowCounts = filteredExecutions.reduce((acc, exec) => {
      const name = exec.workflow_name || "Desconhecido";
      if (!acc[name]) {
        acc[name] = { name, count: 0, success: 0, failed: 0 };
      }
      acc[name].count++;
      if (exec.status === "completed") acc[name].success++;
      if (exec.status === "failed") acc[name].failed++;
      return acc;
    }, {} as Record<string, { name: string; count: number; success: number; failed: number }>);

    // Top workflows (top 5)
    const topWorkflows = Object.values(workflowCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total: filteredExecutions.length,
      thisWeek,
      thisMonth,
      successRate,
      avgDuration,
      completed,
      failed,
      trendData: last7Days,
      workflowDistribution: topWorkflows,
    };
  }, [filteredExecutions]);

  // CSV Export
  function exportCSV() {
    if (filteredExecutions.length === 0) {
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
      
      const headers = ["Workflow", "Status", "Iniciado em", "Concluído em", "Duração (s)", "Erro"];
      const rows = filteredExecutions.map((exec) => [
        exec.workflow_name || "-",
        exec.status,
        format(new Date(exec.started_at), "dd/MM/yyyy HH:mm:ss"),
        exec.completed_at ? format(new Date(exec.completed_at), "dd/MM/yyyy HH:mm:ss") : "-",
        exec.duration_ms ? (exec.duration_ms / 1000).toFixed(2) : "-",
        exec.error_message || "-",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `automation-execution-logs-${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "CSV exportado com sucesso",
        description: `${filteredExecutions.length} registros foram exportados.`,
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
    if (filteredExecutions.length === 0) {
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
      setExportingPdf(true);
      
      const doc = new jsPDF();
      const margin = 20;
      let y = margin;

      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Auditoria de Execucoes de Automacao", margin, y);
      y += 10;

      // Metadata
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, margin, y);
      y += 5;
      doc.text(`Total de registros: ${filteredExecutions.length}`, margin, y);
      y += 5;
      doc.text(`Taxa de sucesso: ${metrics.successRate}%`, margin, y);
      y += 10;

      // Table headers
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Workflow", margin, y);
      doc.text("Status", margin + 60, y);
      doc.text("Data", margin + 85, y);
      doc.text("Dur.(s)", margin + 130, y);
      y += 7;

      // Table rows
      doc.setFont("helvetica", "normal");
      filteredExecutions.forEach((exec) => {
        if (y > 280) {
          doc.addPage();
          y = margin;
        }

        const workflowName = (exec.workflow_name || "?").substring(0, 25);
        const status = exec.status.substring(0, 10);
        const date = format(new Date(exec.started_at), "dd/MM HH:mm");
        const duration = exec.duration_ms ? (exec.duration_ms / 1000).toFixed(1) : "-";

        doc.text(workflowName, margin, y);
        doc.text(status, margin + 60, y);
        doc.text(date, margin + 85, y);
        doc.text(duration, margin + 130, y);
        y += 7;
      });

      doc.save(`automation-execution-logs-${format(new Date(), "yyyy-MM-dd")}.pdf`);

      toast({
        title: "PDF exportado com sucesso",
        description: `${filteredExecutions.length} registros foram exportados.`,
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
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Sucesso</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Falha</Badge>;
      case "running":
        return <Badge className="bg-blue-500"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Em Execução</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-8 w-8 text-purple-500" />
        <h1 className="text-2xl font-bold">Auditoria de Execuções de Automação</h1>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Execuções</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.completed} sucesso, {metrics.failed} falhas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">Execuções completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.thisWeek}</div>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgDuration}s</div>
            <p className="text-xs text-muted-foreground">Tempo de execução</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Execuções (Últimos 7 Dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={metrics.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} name="Sucesso" />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Falha" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 Workflows Mais Executados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.workflowDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="success" fill="#10b981" stackId="a" name="Sucesso" />
                <Bar dataKey="failed" fill="#ef4444" stackId="a" name="Falha" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="completed">Sucesso</SelectItem>
            <SelectItem value="failed">Falha</SelectItem>
            <SelectItem value="running">Em execução</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterWorkflow} onValueChange={setFilterWorkflow}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por workflow" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os workflows</SelectItem>
            {workflows.map((workflow) => (
              <SelectItem key={workflow.id} value={workflow.id}>
                {workflow.name}
              </SelectItem>
            ))}
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

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportCSV}
            disabled={filteredExecutions.length === 0 || exportingCsv || !!dateError}
            className="flex-1"
          >
            {exportingCsv ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                CSV
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
            disabled={filteredExecutions.length === 0 || exportingPdf || !!dateError}
            className="flex-1"
          >
            {exportingPdf ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                PDF
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </>
            )}
          </Button>
        </div>
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
      ) : paginatedExecutions.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-2">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-lg font-semibold text-muted-foreground">
              {executions.length === 0 
                ? "Nenhuma execução encontrada" 
                : "Nenhuma execução corresponde aos filtros aplicados"}
            </p>
            <p className="text-sm text-muted-foreground">
              {executions.length === 0 
                ? "Quando automações forem executadas, elas aparecerão aqui." 
                : "Tente ajustar os filtros para ver mais resultados."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {paginatedExecutions.map((execution) => (
            <Card key={execution.id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{execution.workflow_name}</p>
                      {getStatusBadge(execution.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Iniciado:</strong> {format(new Date(execution.started_at), "dd/MM/yyyy HH:mm:ss")}
                    </p>
                    {execution.completed_at && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Concluído:</strong> {format(new Date(execution.completed_at), "dd/MM/yyyy HH:mm:ss")}
                      </p>
                    )}
                    {execution.duration_ms && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Duração:</strong> {(execution.duration_ms / 1000).toFixed(2)}s
                      </p>
                    )}
                    {execution.triggered_by && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Iniciado por:</strong> {execution.triggered_by}
                      </p>
                    )}
                    {execution.error_message && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">
                          <strong>Erro:</strong> {execution.error_message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredExecutions.length > pageSize && (
        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant="ghost"
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            ⬅️ Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {Math.ceil(filteredExecutions.length / pageSize)}
          </span>
          <Button
            variant="ghost"
            disabled={page * pageSize >= filteredExecutions.length}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Próxima ➡️
          </Button>
        </div>
      )}
    </div>
  );
}
