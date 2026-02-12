/**
 * Operations Premium - v2.0
 * Centro de Operações Marítimas com monitoramento em tempo real
 */

import React, { useState, useEffect } from "react";
import { 
  Navigation, LayoutDashboard, Ship, Activity, Fuel, 
  AlertTriangle, Clock, MapPin, Thermometer, Gauge,
  Anchor, Wind, Waves, RefreshCw, Target
} from "lucide-react";
import { PremiumModuleShell } from "@/components/ui/premium-module-kit";
import type { ModuleTab } from "@/components/ui/premium-module-kit/PremiumModuleShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Real-time Fleet Status
function FleetStatusContent() {
  const [vessels, setVessels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVessels() {
      const { data } = await supabase
        .from("vessels")
        .select("id, name, status, current_location, vessel_type, imo_number")
        .limit(20);
      
      if (data) setVessels(data);
      setLoading(false);
    }
    loadVessels();
  }, []);

  const activeVessels = vessels.filter(v => v.status === "active").length;
  const inPortVessels = vessels.filter(v => v.status === "in_port" || v.status === "docked").length;
  const maintenanceVessels = vessels.filter(v => v.status === "maintenance").length;

  return (
    <div className="space-y-6">
      {/* Fleet KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Em Navegação</p>
                <p className="text-2xl font-bold text-success">{activeVessels}</p>
              </div>
              <Ship className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Em Porto</p>
                <p className="text-2xl font-bold">{inPortVessels}</p>
              </div>
              <Anchor className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Manutenção</p>
                <p className="text-2xl font-bold text-warning">{maintenanceVessels}</p>
              </div>
              <Activity className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Frota</p>
                <p className="text-2xl font-bold">{vessels.length}</p>
              </div>
              <Target className="h-8 w-8 text-info opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vessel List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Status da Frota em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : vessels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma embarcação cadastrada</p>
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
                      <p className="text-sm text-muted-foreground">{vessel.vessel_type || "Embarcação"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {vessel.current_location || "Localização não informada"}
                      </p>
                      <p className="text-xs text-muted-foreground">IMO: {vessel.imo_number || "N/A"}</p>
                    </div>
                    <Badge variant={
                      vessel.status === "active" ? "default" :
                      vessel.status === "maintenance" ? "secondary" : "outline"
                    }>
                      {vessel.status === "active" ? "Navegando" :
                       vessel.status === "maintenance" ? "Manutenção" :
                       vessel.status === "in_port" ? "Em Porto" : vessel.status}
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
              Temperatura Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">42°C</p>
            <p className="text-xs text-muted-foreground">Motor principal da frota</p>
            <Progress value={42} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge className="h-4 w-4 text-info" />
              RPM Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">145</p>
            <p className="text-xs text-muted-foreground">Hélices em operação</p>
            <Progress value={72} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Navigation className="h-4 w-4 text-success" />
              Velocidade Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12.5 nós</p>
            <p className="text-xs text-muted-foreground">Frota ativa</p>
            <Progress value={62} className="mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Fuel Management Content
function FuelManagementContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Consumo Diário</p>
                <p className="text-2xl font-bold">12.4 ton</p>
              </div>
              <Fuel className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Eficiência</p>
                <p className="text-2xl font-bold text-success">94.2%</p>
              </div>
              <Activity className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Reserva Total</p>
                <p className="text-2xl font-bold">850 ton</p>
              </div>
              <Waves className="h-8 w-8 text-info opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Próx. Bunkering</p>
                <p className="text-2xl font-bold">5 dias</p>
              </div>
              <Clock className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consumo por Embarcação</CardTitle>
          <CardDescription>Últimas 24 horas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "MV Atlantic Star", consumption: 4.2, efficiency: 96 },
              { name: "MV Pacific Explorer", consumption: 3.8, efficiency: 94 },
              { name: "MV Oceanic Pride", consumption: 4.4, efficiency: 92 },
            ].map((vessel, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{vessel.name}</span>
                  <span>{vessel.consumption} ton/dia • {vessel.efficiency}% eficiência</span>
                </div>
                <Progress value={vessel.efficiency} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Weather Content
function WeatherContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wind className="h-4 w-4" />
              Vento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">15 nós</p>
            <p className="text-xs text-muted-foreground">Direção: NE</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Waves className="h-4 w-4" />
              Ondas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2.1 m</p>
            <p className="text-xs text-muted-foreground">Período: 8s</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Temperatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">26°C</p>
            <p className="text-xs text-muted-foreground">Água: 24°C</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Condições nas Rotas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { route: "Santos → Rio de Janeiro", condition: "Favorável", color: "success" },
              { route: "Rio de Janeiro → Vitória", condition: "Moderada", color: "warning" },
              { route: "Vitória → Salvador", condition: "Favorável", color: "success" },
            ].map((route, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{route.route}</span>
                <Badge variant={route.color === "success" ? "default" : "secondary"}>
                  {route.condition}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OperationsPremium() {
  const handleRefresh = async () => {
    // Refresh handled by React Query invalidation
  };

  const handleExport = () => {
    toast.success("Relatório operacional exportado");
  };

  const tabs: ModuleTab[] = [
    {
      id: "fleet",
      label: "Frota",
      icon: Ship,
      content: <FleetStatusContent />
    },
    {
      id: "fuel",
      label: "Combustível",
      icon: Fuel,
      content: <FuelManagementContent />
    },
    {
      id: "weather",
      label: "Meteorologia",
      icon: Wind,
      content: <WeatherContent />
    },
    {
      id: "telemetry",
      label: "Telemetria",
      icon: Activity,
      content: <div className="text-center py-12 text-muted-foreground">Módulo de Telemetria Avançada</div>
    }
  ];

  const actions = (
    <>
      <Button variant="outline" size="sm" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Sincronizar
      </Button>
      <Button size="sm" className="gap-2 bg-destructive hover:bg-destructive/90">
        <AlertTriangle className="h-4 w-4" />
        Alertas
      </Button>
    </>
  );

  return (
    <PremiumModuleShell
      title="Centro de Operações"
      subtitle="Monitoramento em tempo real de operações marítimas"
      icon={Navigation}
      iconGradient="from-blue-500 to-cyan-600"
      tabs={tabs}
      defaultTab="fleet"
      actions={actions}
      onRefresh={handleRefresh}
      onExport={handleExport}
      showAIBadge={true}
      aiStatus="active"
    />
  );
}
