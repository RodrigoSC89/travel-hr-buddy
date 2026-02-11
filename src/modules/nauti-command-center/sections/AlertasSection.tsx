/**
 * Seção: Central de Alertas
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle, XCircle, Clock, Bell } from "lucide-react";
import type { Alert } from "../index";
import { toast } from "sonner";

interface AlertasSectionProps {
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
}

const sampleAlerts: Alert[] = [
  { id: "1", severity: "critical", title: "Falha de comunicação", description: "Sensor de pressão offline - MV Pacific", source: "Sensors", timestamp: new Date(), acknowledged: false, resolved: false },
  { id: "2", severity: "high", title: "Manutenção atrasada", description: "Troca de óleo pendente há 5 dias", source: "Maintenance", timestamp: new Date(), acknowledged: false, resolved: false },
  { id: "3", severity: "medium", title: "Certificado expirando", description: "SOLAS expira em 15 dias - MV Atlântico", source: "Compliance", timestamp: new Date(), acknowledged: true, resolved: false },
  { id: "4", severity: "low", title: "Atualização disponível", description: "Nova versão do sistema de navegação", source: "System", timestamp: new Date(), acknowledged: false, resolved: false }
];

export function AlertasSection({ alerts, setAlerts }: AlertasSectionProps) {
  const [localAlerts, setLocalAlerts] = useState(alerts.length ? alerts : sampleAlerts);

  const counts = {
    critical: localAlerts.filter(a => a.severity === "critical" && !a.resolved).length,
    high: localAlerts.filter(a => a.severity === "high" && !a.resolved).length,
    medium: localAlerts.filter(a => a.severity === "medium" && !a.resolved).length,
    low: localAlerts.filter(a => a.severity === "low" && !a.resolved).length
  };

  const acknowledge = (id: string) => {
    setLocalAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    toast.success("Alerta reconhecido");
  };

  const resolve = (id: string) => {
    setLocalAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    toast.success("Alerta resolvido");
  };

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical": return "bg-destructive";
      case "high": return "bg-warning";
      case "medium": return "bg-accent";
      case "low": return "bg-primary";
    }
  };

  const summaryItems = [
    { label: "Críticos", count: counts.critical, textColor: "text-destructive", bgColor: "bg-destructive/10" },
    { label: "Altos", count: counts.high, textColor: "text-warning", bgColor: "bg-warning/10" },
    { label: "Médios", count: counts.medium, textColor: "text-accent-foreground", bgColor: "bg-accent/10" },
    { label: "Baixos", count: counts.low, textColor: "text-primary", bgColor: "bg-primary/10" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryItems.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold ${item.textColor}`}>{item.count}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {localAlerts.filter(a => !a.resolved).map((alert) => (
                <div key={alert.id} className="p-4 rounded-lg border flex items-start gap-3">
                  <div className={`h-3 w-3 rounded-full mt-1 ${getSeverityColor(alert.severity)}`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{alert.source}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.timestamp.toLocaleTimeString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!alert.acknowledged && (
                          <Button variant="outline" size="sm" onClick={() => acknowledge(alert.id)}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Reconhecer
                          </Button>
                        )}
                        <Button variant="default" size="sm" onClick={() => resolve(alert.id)}>
                          Resolver
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}