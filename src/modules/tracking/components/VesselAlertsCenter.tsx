/**
 * Vessel Alerts Center - Real-time Alert Management
 * Geofencing, threshold alerts, emergency notifications
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ship,
  MapPin,
  Thermometer,
  Gauge,
  Droplets,
  Volume2,
  VolumeX,
  Settings,
  Filter,
  Search,
  Plus,
  X,
  Eye,
  Radio,
  Zap,
  Shield,
  Navigation,
  Anchor,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Alert {
  id: string;
  type: "geofence" | "threshold" | "system" | "emergency" | "maintenance" | "weather";
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  message: string;
  vessel_id: string;
  vessel_name: string;
  sensor_type?: string;
  current_value?: number;
  threshold_value?: number;
  unit?: string;
  location?: { lat: number; lng: number };
  zone_name?: string;
  status: "active" | "acknowledged" | "resolved" | "muted";
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
  auto_action?: string;
}

interface AlertRule {
  id: string;
  name: string;
  type: "threshold" | "geofence" | "schedule" | "pattern";
  condition: string;
  vessels: string[];
  severity: string;
  enabled: boolean;
  notification_channels: string[];
  auto_actions?: string[];
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "threshold",
    severity: "critical",
    title: "Temperatura Motor Alta",
    message: "Motor principal atingiu 95°C - limite máximo 90°C",
    vessel_id: "v1",
    vessel_name: "MV Atlantic Star",
    sensor_type: "temperature",
    current_value: 95,
    threshold_value: 90,
    unit: "°C",
    status: "active",
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    auto_action: "Reduzir RPM automaticamente",
  },
  {
    id: "2",
    type: "geofence",
    severity: "high",
    title: "Saída de Zona Autorizada",
    message: "Embarcação saiu da zona de operação designada",
    vessel_id: "v2",
    vessel_name: "MV Pacific Explorer",
    zone_name: "Bacia de Santos",
    location: { lat: -23.9618, lng: -46.3322 },
    status: "acknowledged",
    acknowledged_by: "Capitão Silva",
    acknowledged_at: new Date(Date.now() - 2 * 60000).toISOString(),
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "3",
    type: "maintenance",
    severity: "medium",
    title: "Manutenção Programada",
    message: "Gerador #2 atingiu 500 horas de operação",
    vessel_id: "v1",
    vessel_name: "MV Atlantic Star",
    sensor_type: "hours",
    current_value: 502,
    threshold_value: 500,
    unit: "h",
    status: "active",
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: "4",
    type: "threshold",
    severity: "low",
    title: "Nível de Combustível Baixo",
    message: "Tanque principal em 25% da capacidade",
    vessel_id: "v3",
    vessel_name: "MV Horizon",
    sensor_type: "fuel",
    current_value: 25,
    threshold_value: 30,
    unit: "%",
    status: "resolved",
    resolved_at: new Date(Date.now() - 30 * 60000).toISOString(),
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: "5",
    type: "weather",
    severity: "high",
    title: "Alerta de Tempestade",
    message: "Condições adversas previstas nas próximas 6 horas",
    vessel_id: "v2",
    vessel_name: "MV Pacific Explorer",
    status: "active",
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: "6",
    type: "emergency",
    severity: "critical",
    title: "Homem ao Mar (Drill)",
    message: "Simulação de emergência iniciada",
    vessel_id: "v1",
    vessel_name: "MV Atlantic Star",
    status: "resolved",
    resolved_at: new Date(Date.now() - 45 * 60000).toISOString(),
    created_at: new Date(Date.now() - 90 * 60000).toISOString(),
  },
];

const mockRules: AlertRule[] = [
  {
    id: "1",
    name: "Temperatura Motor > 85°C",
    type: "threshold",
    condition: "motor_temp > 85",
    vessels: ["all"],
    severity: "high",
    enabled: true,
    notification_channels: ["push", "email", "sms"],
    auto_actions: ["reduce_rpm"],
  },
  {
    id: "2",
    name: "Zona de Operação Bacia Santos",
    type: "geofence",
    condition: "outside_zone",
    vessels: ["v1", "v2"],
    severity: "high",
    enabled: true,
    notification_channels: ["push", "email"],
  },
  {
    id: "3",
    name: "Combustível < 30%",
    type: "threshold",
    condition: "fuel_level < 30",
    vessels: ["all"],
    severity: "medium",
    enabled: true,
    notification_channels: ["push"],
  },
];

const SEVERITY_CONFIG = {
  critical: { label: "Crítico", color: "bg-destructive text-destructive-foreground", icon: AlertTriangle },
  high: { label: "Alto", color: "bg-orange-500 text-white", icon: AlertTriangle },
  medium: { label: "Médio", color: "bg-amber-500 text-white", icon: Bell },
  low: { label: "Baixo", color: "bg-blue-500 text-white", icon: Bell },
  info: { label: "Info", color: "bg-muted text-muted-foreground", icon: Bell },
};

const TYPE_CONFIG = {
  geofence: { label: "Geofence", icon: MapPin, color: "text-purple-500" },
  threshold: { label: "Threshold", icon: Gauge, color: "text-orange-500" },
  system: { label: "Sistema", icon: Settings, color: "text-blue-500" },
  emergency: { label: "Emergência", icon: Radio, color: "text-destructive" },
  maintenance: { label: "Manutenção", icon: Settings, color: "text-amber-500" },
  weather: { label: "Clima", icon: Navigation, color: "text-cyan-500" },
};

const STATUS_CONFIG = {
  active: { label: "Ativo", color: "bg-destructive/20 text-destructive" },
  acknowledged: { label: "Reconhecido", color: "bg-amber-500/20 text-amber-500" },
  resolved: { label: "Resolvido", color: "bg-success/20 text-success" },
  muted: { label: "Silenciado", color: "bg-muted text-muted-foreground" },
};

export default function VesselAlertsCenter() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [rules, setRules] = useState<AlertRule[]>(mockRules);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.vessel_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === "all" || a.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const activeAlerts = alerts.filter(a => a.status === "active");
  const criticalAlerts = alerts.filter(a => a.severity === "critical" && a.status === "active");

  const stats = {
    total: alerts.length,
    active: activeAlerts.length,
    critical: criticalAlerts.length,
    acknowledged: alerts.filter(a => a.status === "acknowledged").length,
    resolved: alerts.filter(a => a.status === "resolved").length,
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, status: "acknowledged", acknowledged_by: "Operador", acknowledged_at: new Date().toISOString() }
        : a
    ));
    toast.success("Alerta reconhecido");
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, status: "resolved", resolved_at: new Date().toISOString() }
        : a
    ));
    toast.success("Alerta resolvido");
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
  };

  return (
    <div className="space-y-6">
      {/* Critical Alert Banner */}
      <AnimatePresence>
        {criticalAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive rounded-full animate-pulse">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-destructive">
                    {criticalAlerts.length} Alerta(s) Crítico(s) Ativo(s)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {criticalAlerts[0].title} - {criticalAlerts[0].vessel_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => acknowledgeAlert(criticalAlerts[0].id)}
                >
                  Reconhecer
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-orange-500">{stats.active}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Reconhecidos</p>
                <p className="text-2xl font-bold text-amber-500">{stats.acknowledged}</p>
              </div>
              <Eye className="h-8 w-8 text-amber-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Resolvidos</p>
                <p className="text-2xl font-bold text-success">{stats.resolved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Alertas
            {stats.active > 0 && (
              <Badge className="ml-1 bg-destructive">{stats.active}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <Settings className="h-4 w-4" />
            Regras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar alerta..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alerts List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Histórico de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredAlerts.map((alert, index) => {
                    const severityConfig = SEVERITY_CONFIG[alert.severity];
                    const typeConfig = TYPE_CONFIG[alert.type];
                    const statusConfig = STATUS_CONFIG[alert.status];
                    const SeverityIcon = severityConfig.icon;
                    const TypeIcon = typeConfig.icon;

                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border cursor-pointer hover:border-primary/50 transition-all ${
                          alert.status === "active" && alert.severity === "critical" 
                            ? "border-destructive/50 bg-destructive/5 animate-pulse" 
                            : alert.status === "active" 
                            ? "border-orange-500/30" 
                            : ""
                        }`}
                        onClick={() => { setSelectedAlert(alert); setShowAlertDetails(true); }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${severityConfig.color}`}>
                              <SeverityIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{alert.title}</p>
                                <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{alert.message}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} />
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: ptBR })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Ship className="h-3 w-3" />
                              {alert.vessel_name}
                            </div>
                            {alert.current_value !== undefined && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{alert.current_value}{alert.unit}</span>
                                <span className="text-muted-foreground">
                                  (limite: {alert.threshold_value}{alert.unit})
                                </span>
                              </div>
                            )}
                            {alert.zone_name && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {alert.zone_name}
                              </div>
                            )}
                          </div>

                          {alert.status === "active" && (
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={(e) => {
                                e.stopPropagation();
                                acknowledgeAlert(alert.id);
                              }}>
                                Reconhecer
                              </Button>
                              <Button size="sm" onClick={(e) => {
                                e.stopPropagation();
                                resolveAlert(alert.id);
                              }}>
                                Resolver
                              </Button>
                            </div>
                          )}
                        </div>

                        {alert.auto_action && alert.status === "active" && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t text-sm">
                            <Zap className="h-3 w-3 text-primary" />
                            <span className="text-muted-foreground">Ação automática:</span>
                            <span className="font-medium">{alert.auto_action}</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}

                  {filteredAlerts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Nenhum alerta encontrado</p>
                      <p className="text-sm">Todos os sistemas operando normalmente</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Regras de Alerta</h3>
              <p className="text-sm text-muted-foreground">Configure gatilhos automáticos</p>
            </div>
            <Button onClick={() => setShowRuleDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Regra
            </Button>
          </div>

          <div className="grid gap-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${rule.enabled ? "bg-success/10" : "bg-muted"}`}>
                        <Shield className={`h-5 w-5 ${rule.enabled ? "text-success" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Tipo: {rule.type} • Severidade: {rule.severity}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {rule.notification_channels.map((ch) => (
                            <Badge key={ch} variant="outline" className="text-xs">{ch}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Alert Details Dialog */}
      <Dialog open={showAlertDetails} onOpenChange={setShowAlertDetails}>
        <DialogContent>
          {selectedAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className={`h-5 w-5 ${
                    selectedAlert.severity === "critical" ? "text-destructive" : "text-amber-500"
                  }`} />
                  Detalhes do Alerta
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedAlert.title}</h3>
                  <p className="text-muted-foreground">{selectedAlert.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Embarcação</p>
                    <p className="font-medium">{selectedAlert.vessel_name}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Tipo</p>
                    <p className="font-medium">{TYPE_CONFIG[selectedAlert.type].label}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Severidade</p>
                    <Badge className={SEVERITY_CONFIG[selectedAlert.severity].color}>
                      {SEVERITY_CONFIG[selectedAlert.severity].label}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Criado em</p>
                    <p className="font-medium">
                      {format(new Date(selectedAlert.created_at), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>
                {selectedAlert.current_value !== undefined && (
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Leitura do Sensor</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{selectedAlert.current_value}</span>
                      <span className="text-muted-foreground">{selectedAlert.unit}</span>
                      <span className="text-sm text-muted-foreground">
                        (limite: {selectedAlert.threshold_value}{selectedAlert.unit})
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAlertDetails(false)}>Fechar</Button>
                {selectedAlert.status === "active" && (
                  <>
                    <Button variant="outline" onClick={() => {
                      acknowledgeAlert(selectedAlert.id);
                      setShowAlertDetails(false);
                    }}>
                      Reconhecer
                    </Button>
                    <Button onClick={() => {
                      resolveAlert(selectedAlert.id);
                      setShowAlertDetails(false);
                    }}>
                      Resolver
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Rule Dialog */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Regra de Alerta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Regra</Label>
              <Input placeholder="Ex: Temperatura Motor > 85°C" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="threshold">Threshold</SelectItem>
                    <SelectItem value="geofence">Geofence</SelectItem>
                    <SelectItem value="schedule">Agendamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severidade</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Condição</Label>
              <Input placeholder="Ex: motor_temp > 85" />
            </div>
            <div className="space-y-2">
              <Label>Canais de Notificação</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Push</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">SMS</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRuleDialog(false)}>Cancelar</Button>
            <Button onClick={() => { toast.success("Regra criada!"); setShowRuleDialog(false); }}>
              Criar Regra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
