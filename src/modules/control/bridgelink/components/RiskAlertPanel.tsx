import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Info, AlertCircle, XCircle } from "lucide-react";
import type { RiskAlert } from "../types";

interface RiskAlertPanelProps {
  alerts: RiskAlert[];
}

/**
 * Display risk alerts with severity levels
 */
export function RiskAlertPanel({ alerts }: RiskAlertPanelProps) {
  const getAlertIcon = (level: string) => {
    switch (level) {
    case "critical":
      return <XCircle className="h-5 w-5 text-destructive" />;
    case "high":
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    case "medium":
      return <AlertCircle className="h-5 w-5 text-warning" />;
    case "low":
      return <Info className="h-5 w-5 text-primary" />;
    default:
      return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getAlertBadge = (level: string) => {
    switch (level) {
    case "critical":
      return <Badge className="bg-destructive">Crítico</Badge>;
    case "high":
      return <Badge className="bg-warning text-warning-foreground">Alto</Badge>;
    case "medium":
      return <Badge className="bg-warning/70 text-warning-foreground">Médio</Badge>;
    case "low":
      return <Badge className="bg-primary">Baixo</Badge>;
    default:
      return <Badge className="bg-muted text-muted-foreground">Desconhecido</Badge>;
    }
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    const levelOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return levelOrder[a.level] - levelOrder[b.level];
  });

  return (
    <Card className="border-2 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-6 w-6 text-warning" />
          Alertas de Risco
          {alerts.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-2 text-success" />
            <p className="text-sm">Nenhum alerta ativo</p>
            <p className="text-xs mt-1">Sistema operando normalmente</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {sortedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border rounded-lg p-3 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getAlertIcon(alert.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">
                          {alert.title}
                        </h4>
                        {getAlertBadge(alert.level)}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Fonte: {alert.source}</span>
                        <span>
                          {new Date(alert.timestamp).toLocaleTimeString("pt-BR")}
                        </span>
                      </div>
                      {alert.recommendations && alert.recommendations.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs font-medium mb-1">Recomendações:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {alert.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-success">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
