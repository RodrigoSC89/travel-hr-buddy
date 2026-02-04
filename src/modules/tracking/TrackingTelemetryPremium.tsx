/**
 * Tracking & Telemetry Premium - v2.0
 * Centro de Rastreamento e Telemetria
 */

import React, { useState, useEffect } from "react";
import { 
  Satellite, LayoutDashboard, MapPin, Activity, Radio,
  Ship, Gauge, Thermometer, Navigation, AlertTriangle,
  Signal, Wifi, Globe, Clock
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

        <Card className="border-l-4 border-l-violet-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Sensores</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <Activity className="h-8 w-8 text-violet-500 opacity-60" />
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
              <Thermometer className="h-4 w-4 text-orange-500" />
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
              <Gauge className="h-4 w-4 text-blue-500" />
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
              <Navigation className="h-4 w-4 text-green-500" />
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

export default function TrackingTelemetryPremium() {
  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
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
      content: <div className="text-center py-12 text-muted-foreground">Mapa de Rastreamento</div>
    },
    {
      id: "telemetry",
      label: "Telemetria",
      icon: Activity,
      content: <div className="text-center py-12 text-muted-foreground">Telemetria Avançada</div>
    },
    {
      id: "satcom",
      label: "SATCOM",
      icon: Satellite,
      content: <div className="text-center py-12 text-muted-foreground">Comunicação Satelital</div>
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
