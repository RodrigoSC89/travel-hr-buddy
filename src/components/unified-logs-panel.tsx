/**
 * PATCH 413 - Unified Log Panel
 * Consolidates access_logs, ai_logs (assistant_logs), and system_logs
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Download, 
  Filter, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  RefreshCw,
  FileText,
  Search,
  Shield,
  Brain,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AccessLog {
  id: string;
  user_id?: string;
  module_accessed: string;
  timestamp: string;
  action: string;
  result: string;
  ip_address?: string;
  severity: string;
  details?: any;
}

interface AssistantLog {
  id: string;
  user_id?: string;
  message: string;
  response: string;
  timestamp: string;
  tokens_used?: number;
  model_used?: string;
}

interface SystemLog {
  id: string;
  level: string;
  message: string;
  origin: string;
  timestamp: string;
  metadata?: any;
}

type LogSource = "access" | "ai" | "system" | "all";
type LogSeverity = "info" | "warning" | "critical" | "error" | "all";

export const UnifiedLogsPanel: React.FC = () => {
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [aiLogs, setAiLogs] = useState<AssistantLog[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [logSource, setLogSource] = useState<LogSource>("all");
  const [severity, setSeverity] = useState<LogSeverity>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("week");

  useEffect(() => {
    fetchAllLogs();
  }, []);

  const fetchAllLogs = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAccessLogs(),
        fetchAILogs(),
        fetchSystemLogs()
      ]);
      toast.success("Logs carregados com sucesso");
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Erro ao carregar logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("access_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) throw error;
      setAccessLogs(data || []);
    } catch (error) {
      console.error("Error fetching access logs:", error);
    }
  };

  const fetchAILogs = async () => {
    try {
      const { data, error } = await supabase
        .from("assistant_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) throw error;
      setAiLogs(data || []);
    } catch (error) {
      console.error("Error fetching AI logs:", error);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) throw error;
      setSystemLogs(data || []);
    } catch (error) {
      console.error("Error fetching system logs:", error);
    }
  };

  const getDateFilterPredicate = (timestamp: string) => {
    const logDate = new Date(timestamp);
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    switch (dateFilter) {
      case "today":
        return now.getTime() - logDate.getTime() < dayMs;
      case "week":
        return now.getTime() - logDate.getTime() < 7 * dayMs;
      case "month":
        return now.getTime() - logDate.getTime() < 30 * dayMs;
      default:
        return true;
    }
  };

  const filterLogs = () => {
    let filtered: any[] = [];

    if (logSource === "all" || logSource === "access") {
      const accessFiltered = accessLogs
        .filter((log) => getDateFilterPredicate(log.timestamp))
        .filter((log) => severity === "all" || log.severity === severity)
        .filter((log) => 
          searchTerm === "" || 
          log.module_accessed.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((log) => ({
          ...log,
          type: "access",
          icon: Shield,
          color: "blue"
        }));
      filtered = [...filtered, ...accessFiltered];
    }

    if (logSource === "all" || logSource === "ai") {
      const aiFiltered = aiLogs
        .filter((log) => getDateFilterPredicate(log.timestamp))
        .filter((log) => 
          searchTerm === "" || 
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.response.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((log) => ({
          ...log,
          type: "ai",
          icon: Brain,
          color: "purple",
          severity: "info"
        }));
      filtered = [...filtered, ...aiFiltered];
    }

    if (logSource === "all" || logSource === "system") {
      const systemFiltered = systemLogs
        .filter((log) => getDateFilterPredicate(log.timestamp))
        .filter((log) => severity === "all" || log.level === severity)
        .filter((log) => 
          searchTerm === "" || 
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.origin.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((log) => ({
          ...log,
          type: "system",
          icon: Activity,
          color: "green",
          severity: log.level
        }));
      filtered = [...filtered, ...systemFiltered];
    }

    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const getSeverityBadge = (severity: string) => {
    const variants: { [key: string]: "destructive" | "default" | "secondary" | "outline" } = {
      critical: "destructive",
      error: "destructive",
      warning: "default",
      info: "secondary",
    };
    return (
      <Badge variant={variants[severity] || "outline"}>
        {severity}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const filtered = filterLogs();
    const csvData = filtered.map((log) => ({
      Timestamp: format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
      Type: log.type,
      Severity: log.severity || "N/A",
      Message: log.message || log.action || log.module_accessed || "",
      Origin: log.origin || log.module_accessed || "N/A",
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).map(v => `"${v}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `unified-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Logs exportados para CSV");
  };

  const exportToPDF = () => {
    const filtered = filterLogs();
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Unified Logs Report", 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 14, 30);
    doc.text(`Total Logs: ${filtered.length}`, 14, 36);

    const tableData = filtered.map((log) => [
      format(new Date(log.timestamp), "dd/MM HH:mm", { locale: ptBR }),
      log.type,
      log.severity || "N/A",
      (log.message || log.action || log.module_accessed || "").substring(0, 50),
      (log.origin || log.module_accessed || "N/A").substring(0, 30),
    ]);

    autoTable(doc, {
      head: [["Timestamp", "Type", "Severity", "Message", "Origin"]],
      body: tableData,
      startY: 42,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [71, 85, 105] },
    });

    doc.save(`unified-logs-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("Logs exportados para PDF");
  };

  const filteredLogs = filterLogs();

  const stats = {
    total: filteredLogs.length,
    access: filteredLogs.filter(l => l.type === "access").length,
    ai: filteredLogs.filter(l => l.type === "ai").length,
    system: filteredLogs.filter(l => l.type === "system").length,
    critical: filteredLogs.filter(l => l.severity === "critical" || l.severity === "error").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Unified Log Panel</h2>
          <p className="text-muted-foreground">
            Logs centralizados de múltiplas fontes do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchAllLogs}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              Acesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.access}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ai}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.system}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fonte</label>
              <Select value={logSource} onValueChange={(v: LogSource) => setLogSource(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Fontes</SelectItem>
                  <SelectItem value="access">Logs de Acesso</SelectItem>
                  <SelectItem value="ai">Logs de IA</SelectItem>
                  <SelectItem value="system">Logs do Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Severidade</label>
              <Select value={severity} onValueChange={(v: LogSeverity) => setSeverity(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select 
                value={dateFilter} 
                onValueChange={(v: "today" | "week" | "month" | "all") => setDateFilter(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mês</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Busca</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Logs ({filteredLogs.length})</CardTitle>
          <CardDescription>
            Visualização consolidada de todos os logs do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Mensagem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhum log encontrado com os filtros aplicados
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.slice(0, 50).map((log) => {
                      const Icon = log.icon;
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">
                            {format(new Date(log.timestamp), "dd/MM HH:mm:ss", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 text-${log.color}-500`} />
                              <span className="capitalize">{log.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getSeverityBadge(log.severity)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.origin || log.module_accessed || "N/A"}
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {log.message || log.action || log.module_accessed || ""}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
