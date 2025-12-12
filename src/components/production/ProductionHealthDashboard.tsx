/**
import { useEffect, useCallback } from "react";;
 * Production Health Dashboard Component - PATCH 850
 * Visual component for system health monitoring
 */

import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Shield,
  Zap,
  HardDrive
} from "lucide-react";
import { useReadinessChecker, type ReadinessCheck } from "@/lib/production/readiness-checker";
import { cn } from "@/lib/utils";

interface HealthDashboardProps {
  autoRun?: boolean;
  compact?: boolean;
}

const statusIcons = {
  pass: CheckCircle2,
  fail: XCircle,
  warning: AlertTriangle,
  skipped: AlertTriangle,
};

const statusColors = {
  pass: "text-green-500",
  fail: "text-red-500",
  warning: "text-yellow-500",
  skipped: "text-muted-foreground",
};

const categoryIcons = {
  "Supabase Connection": Database,
  "Auth Configuration": Shield,
  "Service Worker": Zap,
  "Offline Capability": WifiOff,
  "Memory Usage": HardDrive,
  "Network Info": Wifi,
};

export const ProductionHealthDashboard = memo(function({ autoRun = true, compact = false }: HealthDashboardProps) {
  const { report, isChecking, runChecks } = useReadinessChecker();

  useEffect(() => {
    if (autoRun) {
      runChecks();
    }
  }, [autoRun, runChecks]);

  const getOverallStatusBadge = () => {
    if (!report) return null;
    
    const variants = {
      "ready": { variant: "default" as const, className: "bg-green-500", text: "Pronto para Produção" },
      "warning": { variant: "secondary" as const, className: "bg-yellow-500", text: "Atenção Necessária" },
      "not-ready": { variant: "destructive" as const, className: "", text: "Não Pronto" },
    });
    
    const status = variants[report.overallStatus];
    return (
      <Badge variant={status.variant} className={status.className}>
        {status.text}
      </Badge>
    );
  });

  const renderCheck = (check: ReadinessCheck) => {
    const StatusIcon = statusIcons[check.status];
    const CategoryIcon = categoryIcons[check.name as keyof typeof categoryIcons] || CheckCircle2;

    return (
      <div 
        key={check.name} 
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border",
          check.status === "fail" && "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950",
          check.status === "warning" && "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950",
          check.status === "pass" && "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950",
          check.status === "skipped" && "border-muted bg-muted/30"
        )}
      >
        <div className="flex items-center gap-3">
          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium text-sm">{check.name}</div>
            <div className="text-xs text-muted-foreground">{check.message}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{check.duration.toFixed(0)}ms</span>
          <StatusIcon className={cn("h-5 w-5", statusColors[check.status])} />
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-medium">Sistema</span>
            </div>
            {report && (
              <div className="flex items-center gap-2">
                <Progress value={report.score} className="w-20 h-2" />
                <span className="text-sm font-medium">{report.score}%</span>
                {getOverallStatusBadge()}
              </div>
            )}
            <Button 
              size="sm" 
              variant="ghost"
              onClick={runChecks}
              disabled={isChecking}
            >
              <RefreshCw className={cn("h-4 w-4", isChecking && "animate-spin")} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Health Check - Produção
            </CardTitle>
            <CardDescription>
              Verificação de prontidão do sistema para ambiente de produção
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {getOverallStatusBadge()}
            <Button 
              onClick={runChecks} 
              disabled={isChecking}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isChecking && "animate-spin")} />
              {isChecking ? "Verificando..." : "Verificar"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {report && (
          <div className="space-y-6">
            {/* Score */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Score de Prontidão</span>
                  <span className="text-sm font-bold">{report.score}%</span>
                </div>
                <Progress value={report.score} className="h-3" />
              </div>
            </div>

            {/* Checks by Category */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-red-600 dark:text-red-400">
                  Críticos
                </h4>
                <div className="space-y-2">
                  {report.checks
                    .filter(c => c.category === "critical")
                    .map(renderCheck)}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 text-yellow-600 dark:text-yellow-400">
                  Importantes
                </h4>
                <div className="space-y-2">
                  {report.checks
                    .filter(c => c.category === "important")
                    .map(renderCheck)}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                  Opcionais
                </h4>
                <div className="space-y-2">
                  {report.checks
                    .filter(c => c.category === "optional")
                    .map(renderCheck)}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Recomendações</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {report.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground text-right">
              Última verificação: {new Date(report.timestamp).toLocaleString("pt-BR")}
            </div>
          </div>
        )}

        {!report && !isChecking && (
          <div className="text-center py-8 text-muted-foreground">
            Clique em "Verificar" para iniciar a análise de prontidão
          </div>
        )}

        {isChecking && !report && (
          <div className="flex items-center justify-center py-8 gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Executando verificações...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default ProductionHealthDashboard;
