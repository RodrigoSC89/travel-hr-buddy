import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Settings,
  Shield,
  Volume2,
  XCircle,
  Filter,
} from "lucide-react";

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  timestamp: string;
  acknowledged: boolean;
  source: string;
}

const alerts: Alert[] = [
  {
    id: "1",
    title: "Gyro Drift Elevado",
    description: "Gyro #2 apresentando drift acima do limite (0.08°/min). Verificar calibração.",
    severity: "warning",
    timestamp: "2024-12-06 15:42",
    acknowledged: false,
    source: "Gyro System",
  },
  {
    id: "2",
    title: "Thruster #4 - Temperatura Alta",
    description: "Temperatura do motor acima de 85°C. Monitorar continuamente.",
    severity: "warning",
    timestamp: "2024-12-06 14:30",
    acknowledged: true,
    source: "Thruster Control",
  },
  {
    id: "3",
    title: "DGPS Backup Offline",
    description: "DGPS secundário perdeu conexão. Operando apenas com DGPS primário.",
    severity: "critical",
    timestamp: "2024-12-06 13:15",
    acknowledged: false,
    source: "Reference System",
  },
  {
    id: "4",
    title: "Vento Forte Detectado",
    description: "Velocidade do vento atingiu 28 knots. Capability plot atualizado.",
    severity: "info",
    timestamp: "2024-12-06 12:00",
    acknowledged: true,
    source: "Weather System",
  },
  {
    id: "5",
    title: "Manutenção Programada",
    description: "Lembrete: Manutenção preventiva do HPR System em 48 horas.",
    severity: "info",
    timestamp: "2024-12-06 08:00",
    acknowledged: true,
    source: "Maintenance",
  },
];

const alertConfig = [
  { name: "Falha de Thruster", enabled: true, sound: true },
  { name: "Perda de Referência", enabled: true, sound: true },
  { name: "Drift Excessivo", enabled: true, sound: true },
  { name: "Condições Ambientais", enabled: true, sound: false },
  { name: "Manutenção", enabled: true, sound: false },
  { name: "Power Management", enabled: true, sound: true },
];

export default function DPAlerts() {
  const [activeAlerts, setActiveAlerts] = useState(alerts);
  const [config, setConfig] = useState(alertConfig);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "info":
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-100 text-red-700">Crítico</Badge>;
      case "warning":
        return <Badge className="bg-amber-100 text-amber-700">Alerta</Badge>;
      case "info":
        return <Badge className="bg-blue-100 text-blue-700">Info</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const acknowledgeAlert = (id: string) => {
    setActiveAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const toggleConfig = (index: number, field: "enabled" | "sound") => {
    setConfig(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: !item[field] } : item
      )
    );
  };

  const unacknowledgedCount = activeAlerts.filter(a => !a.acknowledged).length;
  const criticalCount = activeAlerts.filter(a => a.severity === "critical" && !a.acknowledged).length;

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-3xl font-bold">{unacknowledgedCount}</p>
              </div>
              <Bell className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-3xl font-bold text-red-500">{criticalCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reconhecidos</p>
                <p className="text-3xl font-bold text-emerald-500">
                  {activeAlerts.filter(a => a.acknowledged).length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Último Alerta</p>
                <p className="text-lg font-bold">15:42</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Alertas Ativos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Alertas Pendentes</h3>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>

          <div className="space-y-4">
            {activeAlerts
              .filter(a => !a.acknowledged)
              .map(alert => (
                <Card key={alert.id} className={`border-l-4 ${
                  alert.severity === "critical" ? "border-l-red-500" :
                  alert.severity === "warning" ? "border-l-amber-500" :
                  "border-l-blue-500"
                }`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(alert.severity)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{alert.title}</h4>
                            {getSeverityBadge(alert.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{alert.source}</span>
                            <span>{alert.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Reconhecer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {activeAlerts.filter(a => !a.acknowledged).length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhum alerta pendente</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {activeAlerts.map(alert => (
              <Card key={alert.id} className="opacity-75">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{alert.title}</h4>
                        {getSeverityBadge(alert.severity)}
                        {alert.acknowledged && (
                          <Badge variant="outline" className="text-emerald-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Reconhecido
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" /> Configuração de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Ativo</span>
                        <Switch
                          checked={item.enabled}
                          onCheckedChange={() => toggleConfig(index, "enabled")}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <Switch
                          checked={item.sound}
                          onCheckedChange={() => toggleConfig(index, "sound")}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
