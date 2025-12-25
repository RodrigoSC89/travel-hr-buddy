/**
 * System Health Dashboard
 * Visual display of system health and auto-healing status
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Shield,
  Zap,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAutoHealing, useHealingEvents } from "@/hooks/useAutoHealing";
import type { HealthStatus, SystemIssue, AppliedFix } from "@/lib/auto-healing";

const statusColors: Record<HealthStatus, string> = {
  healthy: "text-green-500",
  degraded: "text-yellow-500",
  critical: "text-red-500",
  offline: "text-muted-foreground",
};

const statusBgColors: Record<HealthStatus, string> = {
  healthy: "bg-green-500/10",
  degraded: "bg-yellow-500/10",
  critical: "bg-red-500/10",
  offline: "bg-muted/50",
};

const StatusIcon: React.FC<{ status: HealthStatus }> = ({ status }) => {
  switch (status) {
    case "healthy":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "degraded":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "critical":
      return <XCircle className="h-5 w-5 text-red-500" />;
    case "offline":
      return <XCircle className="h-5 w-5 text-muted-foreground" />;
  }
};

export const SystemHealthDashboard: React.FC = () => {
  const {
    diagnostic,
    issues,
    fixes,
    isHealthy,
    isMonitoring,
    refreshDiagnostic,
  } = useAutoHealing();

  const events = useHealingEvents();

  const formatUptime = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isHealthy ? "bg-green-500/10" : "bg-red-500/10"
            }`}
          >
            <Shield
              className={`h-6 w-6 ${
                isHealthy ? "text-green-500" : "text-red-500"
              }`}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Sistema Auto-Healing</h1>
            <p className="text-sm text-muted-foreground">
              Monitoramento e correção automática de falhas
            </p>
          </div>
        </div>

        <Button
          onClick={() => refreshDiagnostic()}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status Geral</p>
                <p className="text-2xl font-bold capitalize">
                  {diagnostic?.overallHealth || "Verificando..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">
                  {diagnostic ? formatUptime(diagnostic.metrics.uptime) : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Problemas Ativos</p>
                <p className="text-2xl font-bold">{issues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Correção</p>
                <p className="text-2xl font-bold">
                  {diagnostic
                    ? `${Math.round(diagnostic.metrics.autoFixRate * 100)}%`
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Module Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Saúde dos Módulos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                <AnimatePresence>
                  {diagnostic?.modules.map((module) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 rounded-lg ${statusBgColors[module.status]}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StatusIcon status={module.status} />
                          <div>
                            <p className="font-medium">{module.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {module.type} • {module.responseTime.toFixed(0)}ms
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={statusColors[module.status]}>
                          {module.status}
                        </Badge>
                      </div>
                      {module.errorCount > 0 && (
                        <div className="mt-2">
                          <Progress
                            value={Math.min(module.errorCount * 20, 100)}
                            className="h-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {module.errorCount} erros recentes
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {(!diagnostic || diagnostic.modules.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    {isMonitoring ? "Carregando..." : "Sistema não monitorado"}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Active Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Problemas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                <AnimatePresence>
                  {issues.map((issue) => (
                    <IssueCard key={issue.id} issue={issue} />
                  ))}
                </AnimatePresence>

                {issues.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Nenhum problema detectado
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Fixes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Correções Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              <AnimatePresence>
                {fixes.map((fix) => (
                  <FixCard key={fix.id} fix={fix} />
                ))}
              </AnimatePresence>

              {fixes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma correção aplicada ainda
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

const IssueCard: React.FC<{ issue: SystemIssue }> = ({ issue }) => {
  const severityColors = {
    low: "bg-blue-500/10 text-blue-500",
    medium: "bg-yellow-500/10 text-yellow-500",
    high: "bg-orange-500/10 text-orange-500",
    critical: "bg-red-500/10 text-red-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4 rounded-lg border bg-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={severityColors[issue.severity]}>
              {issue.severity}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {issue.type.replace("_", " ")}
            </span>
          </div>
          <p className="font-medium">{issue.description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Módulo: {issue.module}
          </p>
        </div>
        {issue.autoFixable && (
          <Badge variant="outline" className="text-green-500">
            Auto-fix
          </Badge>
        )}
      </div>
    </motion.div>
  );
};

const FixCard: React.FC<{ fix: AppliedFix }> = ({ fix }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-lg ${
        fix.success ? "bg-green-500/10" : "bg-red-500/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {fix.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="font-medium">{fix.description}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{fix.strategy}</Badge>
          <span className="text-xs text-muted-foreground">
            {fix.duration}ms
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default SystemHealthDashboard;
