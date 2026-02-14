/**
 * Audit Trail System - Phase 6
 * Connected to useAuditLog for real action traceability
 */

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuditLog } from "@/hooks/use-audit-log";
import { 
  History, Search, Download, FileText, User, 
  Clock, CheckCircle2, AlertTriangle, XCircle, Eye,
  Database, Loader2, Calendar
} from "lucide-react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { logger } from '@/lib/logger';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  resource: string;
  resourceId: string;
  status: "success" | "failure" | "warning";
  ipAddress: string;
  details: Record<string, unknown>;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

export const AuditTrailSystem = () => {
  const { logSuccess } = useAuditLog();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [generating, setGenerating] = useState(false);

  // Fetch real audit logs from Supabase audit_trail table
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("audit_trail")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;

        const mappedLogs: AuditLogEntry[] = (data || []).map((row: any) => ({
          id: row.id,
          timestamp: new Date(row.created_at),
          userId: row.user_id || "system",
          userName: row.user_email || row.user_role || "Sistema",
          userRole: row.user_role || "N/A",
          action: row.action || "UNKNOWN",
          module: row.module || row.resource_type || "Sistema",
          resource: row.resource_type || "",
          resourceId: row.resource_name || row.resource_id || "",
          status: row.severity === "critical" || row.severity === "warning" ? "warning" as const : "success" as const,
          ipAddress: "—",
          details: (row.changes as Record<string, unknown>) || {},
          changes: undefined,
        }));

        setLogs(mappedLogs);
      } catch (error) {
        logger.error("Error fetching audit logs:", error);
        toast.error("Erro ao carregar logs de auditoria");
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = searchTerm === "" || 
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resourceId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesModule = filterModule === "all" || log.module === filterModule;
      const matchesAction = filterAction === "all" || log.action === filterAction;
      const matchesStatus = filterStatus === "all" || log.status === filterStatus;

      return matchesSearch && matchesModule && matchesAction && matchesStatus;
    });
  }, [logs, searchTerm, filterModule, filterAction, filterStatus]);

  const modules = [...new Set(logs.map(l => l.module))];
  const actions = [...new Set(logs.map(l => l.action))];

  const stats = useMemo(() => ({
    total: logs.length,
    success: logs.filter(l => l.status === "success").length,
    warning: logs.filter(l => l.status === "warning").length,
    failure: logs.filter(l => l.status === "failure").length,
    today: logs.filter(l => 
      format(l.timestamp, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
    ).length
  }), [logs]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "failure": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('insert')) 
      return "bg-success/10 text-success border-success/30";
    if (actionLower.includes('update') || actionLower.includes('edit')) 
      return "bg-primary/10 text-primary border-primary/30";
    if (actionLower.includes('delete') || actionLower.includes('remove')) 
      return "bg-destructive/10 text-destructive border-destructive/30";
    if (actionLower.includes('approve') || actionLower.includes('confirm')) 
      return "bg-secondary/10 text-secondary border-secondary/30";
    if (actionLower.includes('export') || actionLower.includes('download')) 
      return "bg-primary/10 text-primary border-primary/30";
    if (actionLower.includes('login') || actionLower.includes('auth')) 
      return "bg-success/10 text-success border-success/30";
    return "bg-muted text-muted-foreground";
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    toast.info("Gerando relatório de auditoria...");
    
    try {
      // Generate PDF report
      const reportData = {
        generatedAt: new Date().toISOString(),
        period: {
          from: format(subDays(new Date(), 30), "yyyy-MM-dd"),
          to: format(new Date(), "yyyy-MM-dd")
        },
        summary: stats,
        logs: filteredLogs.slice(0, 50).map(log => ({
          timestamp: format(log.timestamp, "yyyy-MM-dd HH:mm:ss"),
          user: log.userName,
          action: log.action,
          module: log.module,
          resource: log.resourceId,
          status: log.status
        }))
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-report-${format(new Date(), "yyyy-MM-dd")}.json`;
      a.click();
      URL.revokeObjectURL(url);

      logSuccess("GENERATE_REPORT", "audit_trail", null, { logsCount: filteredLogs.length });
      toast.success("Relatório gerado com sucesso!");
    } catch (error) {
      logger.error("Error generating report:", error);
      toast.error("Erro ao gerar relatório");
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Timestamp", "Usuário", "Role", "Ação", "Módulo", "Recurso", "Status", "IP"];
    const rows = filteredLogs.map(log => [
      format(log.timestamp, "yyyy-MM-dd HH:mm:ss"),
      log.userName,
      log.userRole,
      log.action,
      log.module,
      log.resourceId,
      log.status,
      log.ipAddress
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    logSuccess("EXPORT_CSV", "audit_trail", null, { logsCount: filteredLogs.length });
    toast.success("Logs exportados em CSV!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Audit Trail Completo
          </h2>
          <p className="text-muted-foreground">
            Rastreabilidade em tempo real de todas as ações
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button onClick={handleGenerateReport} disabled={generating}>
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Relatório
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Database className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sucesso</p>
                <p className="text-2xl font-bold">{stats.success}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avisos</p>
                <p className="text-2xl font-bold">{stats.warning}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Falhas</p>
                <p className="text-2xl font-bold">{stats.failure}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuário, ação ou recurso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {modules.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {actions.map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="failure">Falha</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Registros de Auditoria</span>
            <Badge variant="outline">{filteredLogs.length} registros</Badge>
          </CardTitle>
          <CardDescription>
            Dados em tempo real da tabela audit_logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum registro encontrado
                </div>
              ) : (
                filteredLogs.map(log => (
                  <Dialog key={log.id}>
                    <DialogTrigger asChild>
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4 flex-wrap">
                          {getStatusIcon(log.status)}
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {format(log.timestamp, "dd/MM HH:mm:ss", { locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">{log.userName}</span>
                          </div>
                          <Badge variant="outline" className={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{log.module}</span>
                        </div>
                        <Button variant="ghost" size="icon" aria-label="Ver detalhes" title="Ver detalhes">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          Detalhes do Registro
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Timestamp</p>
                            <p className="font-medium">{format(log.timestamp, "dd/MM/yyyy HH:mm:ss")}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Usuário</p>
                            <p className="font-medium">{log.userName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Role</p>
                            <p className="font-medium">{log.userRole}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Ação</p>
                            <Badge variant="outline" className={getActionColor(log.action)}>{log.action}</Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Módulo</p>
                            <p className="font-medium">{log.module}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Recurso</p>
                            <p className="font-mono bg-muted px-2 py-1 rounded text-sm">{log.resourceId}</p>
                          </div>
                        </div>

                        <Separator />
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Detalhes</p>
                          <pre className="p-3 bg-muted rounded text-sm overflow-auto max-h-48">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
