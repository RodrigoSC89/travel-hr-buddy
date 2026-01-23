/**
 * Seção: Operações em Tempo Real
 * PATCH: Added functional handlers for all buttons
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Activity, CheckCircle, AlertTriangle, XCircle, Clock,
  Play, Pause, Square, RotateCw, Search, Filter, Download,
  Terminal, Ship, Wrench, Users, Fuel
} from "lucide-react";
import type { SystemStatus } from "../index";

interface OperacoesSectionProps {
  systemStatus: SystemStatus;
  isLoading: boolean;
}

interface Process {
  id: string;
  name: string;
  type: string;
  status: "running" | "paused" | "completed" | "error";
  progress: number;
  startTime: string;
  vessel?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  source: string;
  message: string;
}

const sampleProcesses: Process[] = [
  { id: "1", name: "Navegação MV Atlântico", type: "voyage", status: "running", progress: 67, startTime: "08:30", vessel: "MV Atlântico" },
  { id: "2", name: "Manutenção Preventiva", type: "maintenance", status: "running", progress: 45, startTime: "09:15", vessel: "MV Pacific" },
  { id: "3", name: "Abastecimento", type: "fuel", status: "paused", progress: 80, startTime: "10:00", vessel: "MV Horizonte" },
  { id: "4", name: "Troca de Turno", type: "crew", status: "completed", progress: 100, startTime: "06:00" },
  { id: "5", name: "Auditoria de Segurança", type: "compliance", status: "running", progress: 23, startTime: "11:00", vessel: "MV Explorer" }
];

const sampleLogs: LogEntry[] = [
  { id: "1", timestamp: "14:32:15", level: "success", source: "Navigation", message: "MV Atlântico atingiu waypoint #12" },
  { id: "2", timestamp: "14:30:42", level: "info", source: "Fuel", message: "Início do abastecimento - MV Horizonte" },
  { id: "3", timestamp: "14:28:10", level: "warning", source: "Maintenance", message: "Alerta de temperatura no motor #2 - MV Pacific" },
  { id: "4", timestamp: "14:25:33", level: "info", source: "Crew", message: "Check-in realizado: 12 tripulantes" },
  { id: "5", timestamp: "14:22:01", level: "error", source: "Sensor", message: "Falha de comunicação com sensor de pressão" },
  { id: "6", timestamp: "14:20:45", level: "success", source: "Compliance", message: "Certificado SOLAS renovado automaticamente" },
  { id: "7", timestamp: "14:18:22", level: "info", source: "System", message: "Backup automático concluído" }
];

export function OperacoesSection({ systemStatus, isLoading }: OperacoesSectionProps) {
  const [processes, setProcesses] = useState(sampleProcesses);
  const [logs] = useState(sampleLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLogFilter, setActiveLogFilter] = useState<string>("all");

  const statusCounts = {
    operational: 45,
    warning: 3,
    critical: 1
  };

  // Handler: Pause all processes
  const handlePauseAll = () => {
    setProcesses(prev => prev.map(p => p.status === "running" ? { ...p, status: "paused" as const } : p));
    toast.success("Todos os processos pausados");
  };

  // Handler: Resume all processes
  const handleResumeAll = () => {
    setProcesses(prev => prev.map(p => p.status === "paused" ? { ...p, status: "running" as const } : p));
    toast.success("Processos retomados");
  };

  // Handler: Refresh processes
  const handleRefresh = () => {
    toast.loading("Atualizando processos...", { id: "refresh" });
    setTimeout(() => {
      toast.success("Processos atualizados", { id: "refresh" });
    }, 1000);
  };

  // Handler: Export logs
  const handleExportLogs = () => {
    const logsText = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.source}] ${l.message}`).join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nautilus-logs-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Logs exportados com sucesso");
  };

  // Handler: Toggle process status
  const toggleProcess = (processId: string) => {
    setProcesses(prev => prev.map(p => {
      if (p.id === processId) {
        const newStatus = p.status === "running" ? "paused" : "running";
        toast.info(`Processo ${p.name}: ${newStatus === "running" ? "Retomado" : "Pausado"}`);
        return { ...p, status: newStatus as "running" | "paused" };
      }
      return p;
    }));
  };

  // Handler: Emergency stop
  const handleEmergencyStop = () => {
    setProcesses(prev => prev.map(p => ({ ...p, status: "paused" as const })));
    toast.error("⚠️ PARADA EMERGENCIAL ATIVADA - Todos os processos interrompidos", { duration: 5000 });
  };

  // Handler: AI Optimization
  const handleAIOptimization = () => {
    toast.loading("🤖 Analisando processos com IA...", { id: "ai-opt" });
    setTimeout(() => {
      toast.success("✅ IA identificou 3 oportunidades de otimização", { id: "ai-opt" });
    }, 2000);
  };

  const getStatusColor = (status: Process["status"]) => {
    switch (status) {
      case "running": return "bg-success";
      case "paused": return "bg-warning";
      case "completed": return "bg-primary";
      case "error": return "bg-destructive";
      default: return "bg-muted";
    }
  };

  const getLogLevelIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "success": return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const filteredLogs = logs.filter(log => 
    activeLogFilter === "all" || log.level === activeLogFilter
  );

  return (
    <div className="space-y-6">
      {/* Status Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sistemas Operacionais</p>
                  <p className="text-3xl font-bold text-emerald-600">{statusCounts.operational}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-emerald-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alertas Pendentes</p>
                  <p className="text-3xl font-bold text-amber-600">{statusCounts.warning}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Incidentes Críticos</p>
                  <p className="text-3xl font-bold text-red-600">{statusCounts.critical}</p>
                </div>
                <XCircle className="h-10 w-10 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monitor de Processos e Console */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monitor de Processos */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Monitor de Processos</CardTitle>
                <CardDescription>Processos ativos em tempo real</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePauseAll}>
                  <Pause className="h-3 w-3 mr-1" /> Pausar Todos
                </Button>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RotateCw className="h-3 w-3 mr-1" /> Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar processos..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {processes
                  .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((process) => (
                    <div 
                      key={process.id} 
                      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${getStatusColor(process.status)} ${process.status === 'running' ? 'animate-pulse' : ''}`} />
                          <span className="font-medium text-sm">{process.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {process.vessel || process.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-1.5">
                          <div 
                            className={`h-full rounded-full ${getStatusColor(process.status)}`}
                            style={{ width: `${process.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-10">{process.progress}%</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleProcess(process.id)}>
                          {process.status === "running" ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Console de Logs */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Console de Logs
                </CardTitle>
                <CardDescription>Eventos do sistema em tempo real</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportLogs}>
                <Download className="h-3 w-3 mr-1" /> Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="flex gap-1 mb-3">
              {["all", "success", "info", "warning", "error"].map((filter) => (
                <Button
                  key={filter}
                  variant={activeLogFilter === filter ? "default" : "ghost"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setActiveLogFilter(filter)}
                >
                  {filter === "all" ? "Todos" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
            
            <ScrollArea className="h-[300px]">
              <div className="font-mono text-xs space-y-1">
                {filteredLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-start gap-2 p-2 rounded hover:bg-muted/50"
                  >
                    {getLogLevelIcon(log.level)}
                    <span className="text-muted-foreground shrink-0">[{log.timestamp}]</span>
                    <span className="text-primary shrink-0">[{log.source}]</span>
                    <span className="text-foreground">{log.message}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Controles Rápidos */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" className="gap-2" onClick={handlePauseAll}>
              <Pause className="h-4 w-4" /> Pausar Todos
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleResumeAll}>
              <Play className="h-4 w-4" /> Retomar Todos
            </Button>
            <Button variant="destructive" className="gap-2" onClick={handleEmergencyStop}>
              <Square className="h-4 w-4" /> Parada Emergencial
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600" onClick={handleAIOptimization}>
              <Activity className="h-4 w-4" /> Otimizar com IA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
