/**
 * Compliance Alerts Panel Component
 * Painel de alertas e notificações de conformidade
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  ExternalLink,
  X 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ComplianceAlert } from "../types";

interface ComplianceAlertsPanelProps {
  alerts: ComplianceAlert[];
  onMarkAsRead: (alertId: string) => void;
  onMarkAllAsRead: () => void;
}

export const ComplianceAlertsPanel = memo(function({ 
  alerts, 
  onMarkAsRead, 
  onMarkAllAsRead 
}: ComplianceAlertsPanelProps) {
  const navigate = useNavigate();
  const unreadCount = alerts.filter(a => !a.isRead).length;

  const getSeverityIcon = (severity: ComplianceAlert["severity"]) => {
    switch (severity) {
    case "critical":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: ComplianceAlert["severity"]) => {
    const variants: Record<string, string> = {
      critical: "bg-red-500/10 text-red-500 border-red-500/20",
      warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };
    
    const labels: Record<string, string> = {
      critical: "Crítico",
      warning: "Atenção",
      info: "Info",
    };
    
    return (
      <Badge variant="outline" className={variants[severity]}>
        {labels[severity]}
      </Badge>
    );
  };

  const handleAlertClick = (alert: ComplianceAlert) => {
    if (!alert.isRead) {
      onMarkAsRead(alert.id);
    }
    if (alert.actionUrl) {
      navigate(alert.actionUrl);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Alertas de Conformidade</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            className="text-xs"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Marcar todas
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[280px] pr-3">
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum alerta no momento</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`group relative p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    alert.isRead 
                      ? "bg-muted/30 border-border/50" 
                      : "bg-card border-border shadow-sm"
                  }`}
                  onClick={() => handlehandleAlertClick}
                >
                  {!alert.isRead && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium text-sm ${alert.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                          {alert.title}
                        </span>
                        {getSeverityBadge(alert.severity)}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                        {alert.actionUrl && (
                          <span className="text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Ver detalhes
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(alert.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
