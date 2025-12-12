/**
import { useState, useMemo, useCallback } from "react";;
 * AI Alerts Panel Component
 * Painel de alertas gerados por IA
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Brain,
  Sparkles,
  Eye,
  Bell,
  BellOff,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Zap,
  CheckCircle,
  Clock,
} from "lucide-react";
import type { SafetyAlert } from "../types";

interface AIAlertsPanelProps {
  alerts: SafetyAlert[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  unreadCount: number;
}

const alertTypeConfig = {
  prediction: { icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
  pattern: { icon: Zap, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
  recommendation: { icon: Lightbulb, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  critical: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
};

const severityConfig = {
  low: "bg-success/10 text-success border-success/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
  critical: "bg-destructive text-destructive-foreground",
};

export const AIAlertsPanel: React.FC<AIAlertsPanelProps> = ({
  alerts,
  onMarkAsRead,
  onMarkAllAsRead,
  unreadCount,
}) => {
  const [selectedAlert, setSelectedAlert] = useState<SafetyAlert | null>(null);

  const handleViewDetails = (alert: SafetyAlert) => {
    setSelectedAlert(alert);
    if (!alert.read) {
      onMarkAsRead(alert.id);
    }
  };

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Alertas IA - Safety Guardian
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Análise preditiva e recomendações baseadas em IA
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
              disabled={unreadCount === 0}
              className="gap-2"
            >
              <BellOff className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-3">
              {alerts.map((alert) => {
                const config = alertTypeConfig[alert.type] || alertTypeConfig.recommendation;
                const Icon = config.icon;

                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border transition-all ${
                      alert.read 
                        ? "bg-muted/30 border-border" 
                        : "bg-card border-primary/30 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${config.bg}`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`font-semibold ${alert.read ? "text-muted-foreground" : ""}`}>
                              {alert.title}
                            </h4>
                            {!alert.read && (
                              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {alert.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className={severityConfig[alert.severity]}>
                              {alert.severity === "high" || alert.severity === "critical" ? (
                                <AlertTriangle className="h-3 w-3 mr-1" />
                              ) : (
                                <Sparkles className="h-3 w-3 mr-1" />
                              )}
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Ação: {alert.action}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlehandleViewDetails}
                        className="shrink-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Alert Details Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAlert && (
                <>
                  {React.createElement(
                    alertTypeConfig[selectedAlert.type]?.icon || Sparkles,
                    { className: `h-5 w-5 ${alertTypeConfig[selectedAlert.type]?.color}` }
                  )}
                  {selectedAlert.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Detalhes do alerta de segurança
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">{selectedAlert.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Severidade</p>
                  <Badge className={severityConfig[selectedAlert.severity]}>
                    {selectedAlert.severity}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                  <Badge variant="outline">{selectedAlert.type}</Badge>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ação Recomendada</p>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    {selectedAlert.action}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={handleSetSelectedAlert}>
                  Entendido
                </Button>
                <Button variant="outline" className="flex-1">
                  Criar Ação
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
