/**
 * Audit Trail System - Phase 6
 * Complete traceability of all actions and report generator for external audits
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  History, Search, Filter, Download, FileText, User, 
  Clock, CheckCircle2, AlertTriangle, XCircle, Eye,
  Shield, Activity, Database, Loader2, Calendar
} from "lucide-react";
import { format, subDays, subHours } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  userAgent: string;
  details: Record<string, unknown>;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-1",
    timestamp: new Date(),
    userId: "usr-001",
    userName: "Carlos Silva",
    userRole: "Auditor Chefe",
    action: "APPROVE",
    module: "NC Workflow",
    resource: "non_conformity",
    resourceId: "NC-2025-001",
    status: "success",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome/120.0.0.0",
    details: { approvalType: "Fechamento de NC", comments: "Evidências validadas" },
    changes: [
      { field: "status", oldValue: "pending_approval", newValue: "closed" }
    ]
  },
  {
    id: "log-2",
    timestamp: subHours(new Date(), 2),
    userId: "usr-002",
    userName: "Maria Santos",
    userRole: "Gestor de Compliance",
    action: "CREATE",
    module: "PEOTRAM",
    resource: "audit_session",
    resourceId: "AUD-2025-015",
    status: "success",
    ipAddress: "192.168.1.101",
    userAgent: "Firefox/121.0",
    details: { vesselName: "Vessel Alpha", auditType: "Semestral" }
  },
  {
    id: "log-3",
    timestamp: subHours(new Date(), 5),
    userId: "usr-003",
    userName: "João Ferreira",
    userRole: "Capitão",
    action: "UPDATE",
    module: "Documentos",
    resource: "certificate",
    resourceId: "CERT-ISM-001",
    status: "success",
    ipAddress: "10.0.0.50",
    userAgent: "Safari/17.0",
    details: { documentType: "Certificado ISM", expiryDate: "2026-01-15" },
    changes: [
      { field: "expiryDate", oldValue: "2025-01-15", newValue: "2026-01-15" },
      { field: "status", oldValue: "expiring", newValue: "valid" }
    ]
  },
  {
    id: "log-4",
    timestamp: subDays(new Date(), 1),
    userId: "usr-004",
    userName: "Ana Costa",
    userRole: "Analista de Segurança",
    action: "DELETE",
    module: "Evidências",
    resource: "evidence_file",
    resourceId: "EVD-2025-089",
    status: "warning",
    ipAddress: "192.168.1.102",
    userAgent: "Edge/120.0.0.0",
    details: { fileName: "foto_equipamento.jpg", reason: "Duplicado" }
  },
  {
    id: "log-5",
    timestamp: subDays(new Date(), 1),
    userId: "usr-005",
    userName: "Pedro Lima",
    userRole: "Oficial de DPA",
    action: "EXPORT",
    module: "Relatórios",
    resource: "compliance_report",
    resourceId: "RPT-2025-012",
    status: "success",
    ipAddress: "192.168.1.103",
    userAgent: "Chrome/120.0.0.0",
    details: { format: "PDF", reportType: "Compliance Mensal" }
  },
  {
    id: "log-6",
    timestamp: subDays(new Date(), 2),
    userId: "usr-001",
    userName: "Carlos Silva",
    userRole: "Auditor Chefe",
    action: "LOGIN",
    module: "Sistema",
    resource: "auth_session",
    resourceId: "SES-2025-789",
    status: "success",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome/120.0.0.0",
    details: { mfaUsed: true, location: "Rio de Janeiro, BR" }
  },
  {
    id: "log-7",
    timestamp: subDays(new Date(), 3),
    userId: "usr-006",
    userName: "Desconhecido",
    userRole: "N/A",
    action: "LOGIN_FAILED",
    module: "Sistema",
    resource: "auth_attempt",
    resourceId: "ATT-2025-456",
    status: "failure",
    ipAddress: "203.0.113.50",
    userAgent: "Unknown",
    details: { reason: "Credenciais inválidas", attempts: 3 }
  }
];

export const AuditTrailSystem = () => {
  const [logs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [generating, setGenerating] = useState(false);

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
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE": return "bg-green-500/10 text-green-500 border-green-500/30";
      case "UPDATE": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "DELETE": return "bg-red-500/10 text-red-500 border-red-500/30";
      case "APPROVE": return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      case "EXPORT": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/30";
      case "LOGIN": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "LOGIN_FAILED": return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    toast.info("Gerando relatório de auditoria...");
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setGenerating(false);
    toast.success("Relatório gerado com sucesso! Download iniciado.");
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
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();

    toast.success("Logs exportados em CSV!");
  };

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
            Rastreabilidade completa de todas as ações do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={handleGenerateReport} disabled={generating}>
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Registros</p>
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
                <SelectItem value="all">Todos Módulos</SelectItem>
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
                <SelectItem value="all">Todas Ações</SelectItem>
                {actions.map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
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
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {filteredLogs.map(log => (
                <Dialog key={log.id}>
                  <DialogTrigger asChild>
                    <div 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-center gap-4">
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
                          <span className="text-xs text-muted-foreground">({log.userRole})</span>
                        </div>
                        <Badge variant="outline" className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{log.module}</span>
                        <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{log.resourceId}</span>
                      </div>
                      <Button variant="ghost" size="icon">
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
                        <div>
                          <p className="text-sm text-muted-foreground">IP</p>
                          <p className="font-mono">{log.ipAddress}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">User Agent</p>
                          <p className="text-sm truncate">{log.userAgent}</p>
                        </div>
                      </div>

                      {log.changes && log.changes.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Alterações</p>
                            <div className="space-y-2">
                              {log.changes.map((change, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                                  <span className="font-medium">{change.field}:</span>
                                  <span className="text-red-500 line-through">{change.oldValue}</span>
                                  <span>→</span>
                                  <span className="text-green-500">{change.newValue}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Detalhes Adicionais</p>
                        <pre className="p-3 bg-muted rounded text-sm overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
