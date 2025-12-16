/**
 * Alerts Panel - Painel de alertas inteligentes
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertOctagon, AlertTriangle, Info, X, CheckCircle,
  Clock, ArrowRight, Bell
} from "lucide-react";

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  module: string;
  title: string;
  description: string;
  timestamp: Date;
  actionRequired: boolean;
}

interface AlertsPanelProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
  expanded?: boolean;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onDismiss, expanded = false }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertOctagon className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical': return 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20';
      default: return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20';
    }
  };

  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  return (
    <Card className={expanded ? "h-full" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Alertas Ativos
            </CardTitle>
            <CardDescription>
              {alerts.length} alertas requerem atenção
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive">{criticalCount} Críticos</Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                {warningCount} Avisos
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
            <p className="text-muted-foreground">Nenhum alerta ativo</p>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os sistemas operando normalmente
            </p>
          </div>
        ) : (
          <ScrollArea className={expanded ? "h-[calc(100vh-300px)]" : "h-[300px]"}>
            <AnimatePresence>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative p-3 rounded-lg border-l-4 ${getAlertStyle(alert.type)}`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => onDismiss(alert.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    <div className="flex items-start gap-3 pr-8">
                      <div className="mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {alert.module}
                          </Badge>
                          {alert.actionRequired && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                              Ação Necessária
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                          {alert.actionRequired && (
                            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                              Resolver <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
