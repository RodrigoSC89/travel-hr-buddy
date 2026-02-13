/**
 * ActionableAlerts - Sistema de alertas com ações rápidas integradas
 * Permite resolver problemas diretamente do alerta sem navegar
 */
import React, { useState } from "react";
import { logger } from "@/lib/logger";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Bell,
  X,
  Clock,
  Play,
  ChevronRight,
  Zap,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface ActionableAlert {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  description: string;
  timestamp: Date;
  source?: string;
  actions?: {
    id: string;
    label: string;
    variant?: "default" | "outline" | "destructive";
    icon?: React.ReactNode;
    onClick: () => void | Promise<void>;
  }[];
  autoResolve?: boolean;
  isResolved?: boolean;
  metadata?: Record<string, string | number>;
}

interface ActionableAlertsProps {
  alerts: ActionableAlert[];
  title?: string;
  maxHeight?: string;
  showEmpty?: boolean;
  emptyMessage?: string;
  onDismiss?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  className?: string;
}

export function ActionableAlerts({
  alerts,
  title = "Alertas & Ações",
  maxHeight = "400px",
  showEmpty = true,
  emptyMessage = "Nenhum alerta pendente",
  onDismiss,
  onResolve,
  className = "",
}: ActionableAlertsProps) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const activeAlerts = alerts.filter(
    (a) => !a.isResolved && !resolvedIds.has(a.id)
  );

  const getAlertConfig = (type: ActionableAlert["type"]) => {
    switch (type) {
      case "critical":
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          bgColor: "bg-destructive/10",
          borderColor: "border-l-destructive",
          iconColor: "text-destructive",
          badgeVariant: "destructive" as const,
        };
      case "warning":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          bgColor: "bg-warning/10",
          borderColor: "border-l-warning",
          iconColor: "text-warning",
          badgeVariant: "secondary" as const,
        };
      case "success":
        return {
          icon: <CheckCircle2 className="h-5 w-5" />,
          bgColor: "bg-success/10",
          borderColor: "border-l-success",
          iconColor: "text-success",
          badgeVariant: "default" as const,
        };
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          bgColor: "bg-info/10",
          borderColor: "border-l-info",
          iconColor: "text-info",
          badgeVariant: "outline" as const,
        };
    }
  };

  const handleAction = async (
    alertId: string,
    actionId: string,
    onClick: () => void | Promise<void>
  ) => {
    const processingKey = `${alertId}-${actionId}`;
    setProcessingIds((prev) => new Set(prev).add(processingKey));

    try {
      await onClick();
      // Auto-resolve after successful action
      setResolvedIds((prev) => new Set(prev).add(alertId));
      onResolve?.(alertId);
    } catch (error) {
      logger.error("Action failed", error as Error);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(processingKey);
        return next;
      });
    }
  };

  const criticalCount = activeAlerts.filter((a) => a.type === "critical").length;
  const warningCount = activeAlerts.filter((a) => a.type === "warning").length;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {criticalCount} crítico{criticalCount > 1 ? "s" : ""}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {warningCount}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea style={{ maxHeight }} className="pr-4">
          <AnimatePresence mode="popLayout">
            {activeAlerts.length === 0 ? (
              showEmpty && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                   <CheckCircle2 className="h-12 w-12 text-success mb-3" />
                   <p className="font-medium text-success">{emptyMessage}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Todas as pendências foram resolvidas
                  </p>
                </motion.div>
              )
            ) : (
              <div className="space-y-3">
                {activeAlerts
                  .sort((a, b) => {
                    const priority = { critical: 0, warning: 1, info: 2, success: 3 };
                    return priority[a.type] - priority[b.type];
                  })
                  .map((alert) => {
                    const config = getAlertConfig(alert.type);

                    return (
                      <motion.div
                        key={alert.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        className={`p-4 rounded-lg border-l-4 ${config.borderColor} ${config.bgColor}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={config.iconColor}>{config.icon}</div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-semibold text-sm">{alert.title}</h4>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {alert.description}
                                </p>
                              </div>

                              {onDismiss && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={() => onDismiss(alert.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>

                            {/* Metadata */}
                            {alert.metadata && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {Object.entries(alert.metadata).map(([key, value]) => (
                                  <Badge
                                    key={key}
                                    variant="outline"
                                    className="text-xs font-normal"
                                  >
                                    {key}: {value}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Actions */}
                            {alert.actions && alert.actions.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {alert.actions.map((action) => {
                                  const isProcessing = processingIds.has(
                                    `${alert.id}-${action.id}`
                                  );

                                  return (
                                    <Button
                                      key={action.id}
                                      size="sm"
                                      variant={action.variant || "default"}
                                      className="gap-1.5 h-7 text-xs"
                                      disabled={isProcessing}
                                      onClick={() =>
                                        handleAction(alert.id, action.id, action.onClick)
                                      }
                                    >
                                      {isProcessing ? (
                                        <RefreshCw className="h-3 w-3 animate-spin" />
                                      ) : (
                                        action.icon || <Zap className="h-3 w-3" />
                                      )}
                                      {action.label}
                                    </Button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border/50">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(alert.timestamp, {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </div>
                              {alert.source && (
                                <Badge variant="outline" className="text-xs">
                                  {alert.source}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * AlertSummaryBanner - Banner resumido de alertas para cabeçalho de módulos
 */
interface AlertSummaryBannerProps {
  criticalCount: number;
  warningCount: number;
  onViewAll?: () => void;
  className?: string;
}

export function AlertSummaryBanner({
  criticalCount,
  warningCount,
  onViewAll,
  className = "",
}: AlertSummaryBannerProps) {
  if (criticalCount === 0 && warningCount === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between p-3 rounded-lg ${
        criticalCount > 0
           ? "bg-destructive/10 border border-destructive/30"
           : "bg-warning/10 border border-warning/30"
      } ${className}`}
    >
      <div className="flex items-center gap-3">
        {criticalCount > 0 ? (
           <AlertTriangle className="h-5 w-5 text-destructive" />
         ) : (
           <AlertCircle className="h-5 w-5 text-warning" />
        )}
        <div>
          <p className="font-medium text-sm">
            {criticalCount > 0
              ? `${criticalCount} alerta${criticalCount > 1 ? "s" : ""} crítico${
                  criticalCount > 1 ? "s" : ""
                }`
              : `${warningCount} alerta${warningCount > 1 ? "s" : ""} de atenção`}
          </p>
          <p className="text-xs text-muted-foreground">
            Requer ação imediata para garantir conformidade
          </p>
        </div>
      </div>

      {onViewAll && (
        <Button size="sm" variant="outline" className="gap-1" onClick={onViewAll}>
          Ver todos
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
}
