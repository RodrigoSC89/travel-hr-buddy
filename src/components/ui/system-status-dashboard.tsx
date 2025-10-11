import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Server,
  Database,
  Cloud,
  Cpu,
  HardDrive,
  Network,
  Users,
  Activity,
  Zap,
  Shield,
  Clock,
  Eye,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from "lucide-react";

const SystemStatusDashboard = () => {
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  const systemMetrics = [
    {
      name: "Performance",
      value: 97.3,
      status: "excellent",
      icon: Cpu,
      color: "green",
      details: "CPU: 45% | RAM: 68%"
    },
    {
      name: "Disponibilidade",
      value: 99.95,
      status: "excellent", 
      icon: Network,
      color: "green",
      details: "Uptime: 99.95%"
    },
    {
      name: "Usuários Ativos",
      value: 42,
      status: "good",
      icon: Users,
      color: "blue",
      details: "42 sessões ativas"
    },
    {
      name: "API Response",
      value: 180,
      status: "good",
      icon: Zap,
      color: "orange",
      details: "180ms média",
      unit: "ms"
    },
    {
      name: "Armazenamento",
      value: 2.3,
      status: "good",
      icon: HardDrive,
      color: "cyan",
      details: "2.3GB / 50GB usado",
      max: 50,
      unit: "GB"
    },
    {
      name: "Segurança",
      value: 98.5,
      status: "excellent",
      icon: Shield,
      color: "purple",
      details: "0 incidentes hoje"
    }
  ];

  const getStatusColor = (status: string) => {
    const statusColors = {
      excellent: "text-green-600 bg-green-100",
      good: "text-blue-600 bg-blue-100", 
      warning: "text-orange-600 bg-orange-100",
      critical: "text-red-600 bg-red-100"
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.good;
  };

  const getIconColor = (color: string) => {
    const iconColors = {
      green: "bg-green-100 text-green-600",
      blue: "bg-blue-100 text-blue-600",
      orange: "bg-orange-100 text-orange-600",
      cyan: "bg-cyan-100 text-cyan-600",
      purple: "bg-purple-100 text-purple-600"
    };
    return iconColors[color as keyof typeof iconColors] || iconColors.blue;
  };

  const overallHealth = {
    score: 96.8,
    status: "excellent",
    issues: 0,
    warnings: 2
  };

  // Sample log data
  const systemLogs = [
    { id: 1, timestamp: "2025-10-11 18:25:30", level: "INFO", service: "API Gateway", message: "Request processed successfully - 200 OK" },
    { id: 2, timestamp: "2025-10-11 18:24:15", level: "INFO", service: "Database", message: "Connection pool health check passed" },
    { id: 3, timestamp: "2025-10-11 18:23:45", level: "WARN", service: "Storage", message: "Storage usage above 80% - consider cleanup" },
    { id: 4, timestamp: "2025-10-11 18:22:10", level: "INFO", service: "Auth Service", message: "User authentication successful" },
    { id: 5, timestamp: "2025-10-11 18:20:55", level: "INFO", service: "Backup Service", message: "Automated backup completed successfully" },
    { id: 6, timestamp: "2025-10-11 18:18:30", level: "WARN", service: "Monitor", message: "CPU usage spike detected - 85%" },
    { id: 7, timestamp: "2025-10-11 18:15:20", level: "INFO", service: "Load Balancer", message: "Health check passed for all nodes" },
    { id: 8, timestamp: "2025-10-11 18:12:45", level: "INFO", service: "Cache", message: "Cache hit ratio: 94.2%" },
  ];

  // Sample history data
  const systemHistory = [
    { id: 1, date: "2025-10-11", event: "System Update", status: "Completed", duration: "15 min", details: "Security patches applied successfully" },
    { id: 2, date: "2025-10-10", event: "Backup", status: "Completed", duration: "8 min", details: "Daily backup completed - 2.3GB" },
    { id: 3, date: "2025-10-09", event: "Maintenance", status: "Completed", duration: "30 min", details: "Database optimization performed" },
    { id: 4, date: "2025-10-08", event: "Security Scan", status: "Completed", duration: "12 min", details: "No vulnerabilities detected" },
    { id: 5, date: "2025-10-07", event: "System Update", status: "Completed", duration: "20 min", details: "Platform version upgraded to 2.1.0" },
    { id: 6, date: "2025-10-06", event: "Backup", status: "Completed", duration: "9 min", details: "Daily backup completed - 2.1GB" },
    { id: 7, date: "2025-10-05", event: "Health Check", status: "Completed", duration: "3 min", details: "All services operational" },
  ];

  const getLogLevelColor = (level: string) => {
    const colors = {
      INFO: "text-blue-600 bg-blue-50",
      WARN: "text-orange-600 bg-orange-50",
      ERROR: "text-red-600 bg-red-50"
    };
    return colors[level as keyof typeof colors] || colors.INFO;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Completed: "bg-green-100 text-green-800",
      Failed: "bg-red-100 text-red-800",
      "In Progress": "bg-blue-100 text-blue-800"
    };
    return colors[status as keyof typeof colors] || colors.Completed;
  };

  return (
    <Card className="border-2 border-primary/10 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary-light text-primary-foreground">
                <Server className="w-6 h-6" />
              </div>
              Status do Sistema
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Monitoramento em tempo real da infraestrutura
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">
              {overallHealth.score}%
            </div>
            <Badge className={getStatusColor(overallHealth.status)}>
              Sistema Saudável
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Overall Status */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <div className="font-semibold text-green-800">Sistema Operacional</div>
              <div className="text-sm text-green-600">
                Todos os serviços funcionando normalmente
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-600">
              {overallHealth.issues} problemas | {overallHealth.warnings} avisos
            </div>
            <div className="text-xs text-muted-foreground">
              Última verificação: há 2 minutos
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {systemMetrics.map((metric, index) => (
            <div key={index} className="text-center space-y-3 p-4 rounded-xl border border-border/50 hover:border-border transition-colors">
              <div className={`p-3 rounded-full mx-auto w-fit ${getIconColor(metric.color)}`}>
                <metric.icon className="w-6 h-6" />
              </div>
              
              <div>
                <div className={`text-2xl font-bold ${
                  metric.color === "green" ? "text-green-600" :
                    metric.color === "blue" ? "text-blue-600" :
                      metric.color === "orange" ? "text-orange-600" :
                        metric.color === "cyan" ? "text-cyan-600" :
                          "text-purple-600"
                }`}>
                  {metric.value}{metric.unit || (metric.name.includes("Perform") || metric.name.includes("Disp") || metric.name.includes("Seg") ? "%" : "")}
                </div>
                <div className="text-sm font-medium text-foreground">
                  {metric.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metric.details}
                </div>
              </div>

              {/* Progress bar for percentage metrics */}
              {(metric.name.includes("Performance") || metric.name.includes("Disponibilidade") || metric.name.includes("Segurança")) && (
                <div className="space-y-1">
                  <Progress value={metric.value} className="h-2" />
                </div>
              )}

              {/* Progress bar for storage */}
              {metric.name.includes("Armazenamento") && metric.max && (
                <div className="space-y-1">
                  <Progress value={(metric.value / metric.max) * 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {((metric.value / metric.max) * 100).toFixed(1)}% usado
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Sistema monitorado em tempo real
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowLogsDialog(true)}>
              <Eye className="w-4 h-4 mr-2" />
              Logs Detalhados
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowHistoryDialog(true)}>
              <Activity className="w-4 h-4 mr-2" />
              Histórico
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Logs Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Logs Detalhados do Sistema
            </DialogTitle>
            <DialogDescription>
              Registro detalhado de eventos e atividades do sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 mt-4">
            {systemLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getLogLevelColor(log.level)}>
                        {log.level}
                      </Badge>
                      <span className="text-sm font-medium text-muted-foreground">
                        {log.service}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{log.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Histórico do Sistema
            </DialogTitle>
            <DialogDescription>
              Histórico de manutenções, atualizações e eventos importantes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 mt-4">
            {systemHistory.map((item) => (
              <div 
                key={item.id} 
                className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-foreground">
                        {item.event}
                      </span>
                      <Badge className={getStatusBadge(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Data:</span> {item.date} • <span className="font-medium">Duração:</span> {item.duration}
                      </p>
                      <p className="text-sm text-foreground">{item.details}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SystemStatusDashboard;