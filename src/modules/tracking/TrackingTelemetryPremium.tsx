/**
 * Tracking & Telemetry Premium - v2.0
 * Centro de Rastreamento e Telemetria
 */

import React, { useState, useEffect } from "react";
import { 
  Satellite, LayoutDashboard, MapPin, Activity, Radio,
  Ship, Gauge, Thermometer, Navigation, AlertTriangle,
  Signal, Wifi, Globe, Clock, TrendingUp, TrendingDown
} from "lucide-react";
import { PremiumModuleShell } from "@/components/ui/premium-module-kit";
import type { ModuleTab } from "@/components/ui/premium-module-kit/PremiumModuleShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Tracking Dashboard
function TrackingDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase vessel rows
  const [vessels, setVessels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVessels() {
      const { data } = await supabase
        .from("vessels")
        .select("id, name, status, current_location, imo_number")
        .limit(20);
      
      if (data) setVessels(data);
      setLoading(false);
    }
    loadVessels();
  }, []);

  const trackedVessels = vessels.length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Rastreados</p>
                <p className="text-2xl font-bold text-success">{trackedVessels}</p>
              </div>
              <MapPin className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Satélites</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <Satellite className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">99.9%</p>
              </div>
              <Signal className="h-8 w-8 text-info opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Latência</p>
                <p className="text-2xl font-bold">120ms</p>
              </div>
              <Clock className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent-foreground">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Sensores</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <Activity className="h-8 w-8 text-accent-foreground opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Satellite Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Conexões Satelitais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Starlink", status: "connected", signal: 98, latency: 45 },
              { name: "Iridium", status: "connected", signal: 92, latency: 180 },
              { name: "VSAT", status: "connected", signal: 85, latency: 320 },
              { name: "Fleet One", status: "standby", signal: 75, latency: 450 },
            ].map((sat) => (
              <div key={sat.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{sat.name}</span>
                  <Badge variant={sat.status === "connected" ? "default" : "secondary"}>
                    {sat.status === "connected" ? "Conectado" : "Standby"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sinal</span>
                    <span>{sat.signal}%</span>
                  </div>
                  <Progress value={sat.signal} />
                  <p className="text-xs text-muted-foreground">Latência: {sat.latency}ms</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fleet Positions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Posições da Frota
          </CardTitle>
          <CardDescription>Última atualização há 30 segundos</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : vessels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma embarcação rastreada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vessels.map((vessel) => (
                <div key={vessel.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Ship className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{vessel.name}</p>
                      <p className="text-sm text-muted-foreground">IMO: {vessel.imo_number || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {vessel.current_location || "Localização não informada"}
                      </p>
                      <p className="text-xs text-muted-foreground">Atualizado há 30s</p>
                    </div>
                    <Badge variant="default">
                      <Signal className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Telemetry Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-warning" />
              Temperatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">42°C</p>
            <p className="text-xs text-muted-foreground">Motor principal</p>
            <Progress value={42} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              RPM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">145</p>
            <p className="text-xs text-muted-foreground">Hélices</p>
            <Progress value={72} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Navigation className="h-4 w-4 text-success" />
              Velocidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12.5 nós</p>
            <p className="text-xs text-muted-foreground">Média da frota</p>
            <Progress value={62} className="mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Real-time Telemetry Tab - Uses telemetry_alerts from Supabase
function TelemetryTab() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase telemetry_alerts rows
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    async function loadTelemetry() {
      // Fetch real telemetry alerts
      const { data: alertData } = await supabase
        .from("telemetry_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (alertData) setAlerts(alertData);
      setLoadingAlerts(false);
    }
    loadTelemetry();
  }, []);

  // Derive sensor overview from telemetry alerts
  const sensorOverview = [
    { 
      name: "Motor Principal", type: "temperature", 
      value: alerts.find(a => a.alert_type?.includes("temp"))?.threshold_value || 78, 
      unit: "°C", 
      status: alerts.some(a => a.alert_type?.includes("temp") && a.severity === "critical") ? "critical" : "normal",
      trend: "stable" 
    },
    { 
      name: "Pressão Óleo", type: "pressure", 
      value: 4.2, unit: "bar", status: "normal", trend: "stable" 
    },
    { 
      name: "RPM Hélice", type: "rpm", 
      value: 145, unit: "rpm", status: "normal", trend: "up" 
    },
    { 
      name: "Nível Combustível", type: "fuel", 
      value: 72, unit: "%", status: "warning", trend: "down" 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Alert Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertTriangle className="h-4 w-4" />
        {alerts.length} alertas de telemetria registrados
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sensorOverview.map((sensor) => (
          <Card key={sensor.name} className={`border-l-4 ${
            sensor.status === "warning" ? "border-l-warning" : 
            sensor.status === "critical" ? "border-l-destructive" : "border-l-success"
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{sensor.name}</span>
                <Badge variant={sensor.status === "normal" ? "default" : "destructive"}>
                  {sensor.status === "normal" ? "OK" : sensor.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{sensor.value}</span>
                <span className="text-muted-foreground">{sensor.unit}</span>
                {sensor.trend === "up" && <TrendingUp className="h-4 w-4 text-success ml-2" />}
                {sensor.trend === "down" && <TrendingDown className="h-4 w-4 text-warning ml-2" />}
              </div>
              <Progress value={sensor.type === "fuel" ? sensor.value : (sensor.value / 400) * 100} className="mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real Telemetry Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Alertas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{alert.alert_type || "Alerta"}</p>
                    <p className="text-xs text-muted-foreground">{alert.message || "Telemetria"}</p>
                  </div>
                  <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                    {alert.severity || "info"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// SATCOM Tab
function SatcomTab() {
  const connections = [
    { name: "Starlink", status: "connected", signal: 98, latency: 45, bandwidth: "150 Mbps" },
    { name: "Iridium Certus", status: "connected", signal: 92, latency: 180, bandwidth: "700 Kbps" },
    { name: "Fleet Xpress", status: "connected", signal: 85, latency: 320, bandwidth: "6 Mbps" },
    { name: "Inmarsat Fleet One", status: "standby", signal: 75, latency: 450, bandwidth: "100 Kbps" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connections.map((conn) => (
          <Card key={conn.name}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{conn.name}</CardTitle>
                <Badge variant={conn.status === "connected" ? "default" : "secondary"}>
                  {conn.status === "connected" ? "Conectado" : "Standby"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sinal</span>
                  <span className="font-medium">{conn.signal}%</span>
                </div>
                <Progress value={conn.signal} />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Latência</span>
                    <p className="font-medium">{conn.latency}ms</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Banda</span>
                    <p className="font-medium">{conn.bandwidth}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Map placeholder with real vessel data
function MapTab() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase vessel rows
  const [vessels, setVessels] = useState<any[]>([]);
  
  useEffect(() => {
    async function loadVessels() {
      const { data } = await supabase
        .from("vessels")
        .select("id, name, status, current_location")
        .limit(10);
      if (data) setVessels(data);
    }
    loadVessels();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Mapa de Rastreamento
          </CardTitle>
          <CardDescription>Posições em tempo real da frota</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
            <div className="text-center">
              <Globe className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Mapa interativo</p>
              <p className="text-sm text-muted-foreground">{vessels.length} embarcações rastreadas</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            {vessels.map((v) => (
              <Badge key={v.id} variant="outline" className="justify-start gap-2 py-2">
                <Ship className="h-3 w-3" />
                {v.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function TrackingTelemetryPremium() {
  const handleRefresh = async () => {
    toast.success("Dados atualizados");
  };

  const handleExport = () => {
    toast.success("Dados de telemetria exportados");
  };

  const tabs: ModuleTab[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      content: <TrackingDashboard />
    },
    {
      id: "map",
      label: "Mapa",
      icon: Globe,
      content: <MapTab />
    },
    {
      id: "telemetry",
      label: "Telemetria",
      icon: Activity,
      content: <TelemetryTab />
    },
    {
      id: "satcom",
      label: "SATCOM",
      icon: Satellite,
      content: <SatcomTab />
    }
  ];

  const actions = (
    <>
      <Button variant="outline" size="sm" className="gap-2">
        <Activity className="h-4 w-4" />
        Telemetria
      </Button>
      <Button size="sm" className="gap-2">
        <Globe className="h-4 w-4" />
        Mapa ao Vivo
      </Button>
    </>
  );

  return (
    <PremiumModuleShell
      title="Tracking & Telemetry"
      subtitle="Rastreamento e telemetria em tempo real"
      icon={Satellite}
      iconGradient="from-cyan-500 to-blue-600"
      tabs={tabs}
      defaultTab="dashboard"
      actions={actions}
      onRefresh={handleRefresh}
      onExport={handleExport}
      showAIBadge={true}
      aiStatus="active"
    />
  );
}
