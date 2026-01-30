/**
 * Digital Twin 3D Page
 * Visualização 3D do navio com sensores IoT em tempo real
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Ship, Thermometer, Gauge, Fuel, Anchor, Activity, 
  AlertTriangle, CheckCircle, Radio, Zap, Eye, Settings
} from "lucide-react";

const DigitalTwin3DPage = () => {
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);

  const vesselSystems = [
    { 
      id: "propulsion", 
      name: "Sistema de Propulsão", 
      icon: Zap, 
      status: "operational",
      health: 94,
      sensors: [
        { name: "Temperatura Motor Principal", value: "78°C", status: "normal" },
        { name: "RPM Hélice", value: "120 RPM", status: "normal" },
        { name: "Consumo Combustível", value: "2.4 t/h", status: "normal" },
        { name: "Vibração", value: "0.8 mm/s", status: "normal" }
      ]
    },
    { 
      id: "navigation", 
      name: "Sistema de Navegação", 
      icon: Anchor, 
      status: "operational",
      health: 98,
      sensors: [
        { name: "GPS Status", value: "DGPS Lock", status: "normal" },
        { name: "Heading", value: "045°", status: "normal" },
        { name: "Speed Over Ground", value: "12.4 kn", status: "normal" },
        { name: "Depth", value: "45m", status: "normal" }
      ]
    },
    { 
      id: "power", 
      name: "Sistema Elétrico", 
      icon: Gauge, 
      status: "warning",
      health: 76,
      sensors: [
        { name: "Gerador 1", value: "450 kW", status: "normal" },
        { name: "Gerador 2", value: "380 kW", status: "warning" },
        { name: "Carga Total", value: "68%", status: "normal" },
        { name: "Frequência", value: "60.1 Hz", status: "normal" }
      ]
    },
    { 
      id: "hvac", 
      name: "HVAC & Ventilação", 
      icon: Thermometer, 
      status: "operational",
      health: 92,
      sensors: [
        { name: "Temp. Ponte", value: "22°C", status: "normal" },
        { name: "Temp. Engine Room", value: "38°C", status: "normal" },
        { name: "Umidade", value: "55%", status: "normal" },
        { name: "Pressão Ar", value: "1013 hPa", status: "normal" }
      ]
    },
    { 
      id: "fuel", 
      name: "Sistema de Combustível", 
      icon: Fuel, 
      status: "operational",
      health: 88,
      sensors: [
        { name: "HFO Tank 1", value: "78%", status: "normal" },
        { name: "HFO Tank 2", value: "65%", status: "normal" },
        { name: "MDO Day Tank", value: "45%", status: "warning" },
        { name: "Consumo 24h", value: "48.2 t", status: "normal" }
      ]
    },
    { 
      id: "safety", 
      name: "Sistemas de Segurança", 
      icon: AlertTriangle, 
      status: "operational",
      health: 100,
      sensors: [
        { name: "Fire Detection", value: "OK", status: "normal" },
        { name: "CO2 System", value: "Ready", status: "normal" },
        { name: "Lifeboats", value: "2/2 Ready", status: "normal" },
        { name: "EPIRB", value: "Armed", status: "normal" }
      ]
    }
  ];

  const activeAlerts = [
    { id: 1, system: "power", message: "Gerador 2 - Temperatura elevada", severity: "warning", time: "10 min atrás" },
    { id: 2, system: "fuel", message: "MDO Day Tank abaixo de 50%", severity: "info", time: "25 min atrás" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "critical": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getSensorStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "critical": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Ship className="h-8 w-8 text-primary" />
            Digital Twin 3D
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualização em tempo real do navio com sensores IoT
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5">
            <Radio className="h-4 w-4 animate-pulse text-green-500" />
            45 Sensores Ativos
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="3d">Visualização 3D</TabsTrigger>
          <TabsTrigger value="sensors">Sensores IoT</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Systems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vesselSystems.map((system) => (
              <Card 
                key={system.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedSystem === system.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedSystem(system.id === selectedSystem ? null : system.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        system.status === "operational" ? "bg-green-500/10" :
                        system.status === "warning" ? "bg-yellow-500/10" : "bg-red-500/10"
                      }`}>
                        <system.icon className={`h-5 w-5 ${
                          system.status === "operational" ? "text-green-500" :
                          system.status === "warning" ? "text-yellow-500" : "text-red-500"
                        }`} />
                      </div>
                      <CardTitle className="text-base">{system.name}</CardTitle>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(system.status)}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Saúde do Sistema</span>
                      <span className="font-medium">{system.health}%</span>
                    </div>
                    <Progress value={system.health} className="h-2" />
                    
                    {selectedSystem === system.id && (
                      <div className="mt-4 pt-4 border-t space-y-2">
                        {system.sensors.map((sensor, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{sensor.name}</span>
                            <span className={`font-medium ${getSensorStatusColor(sensor.status)}`}>
                              {sensor.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Alertas Ativos ({activeAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      alert.severity === "warning" ? "bg-yellow-500/10" :
                      alert.severity === "critical" ? "bg-red-500/10" : "bg-blue-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-4 w-4 ${
                        alert.severity === "warning" ? "text-yellow-500" :
                        alert.severity === "critical" ? "text-red-500" : "text-blue-500"
                      }`} />
                      <span className="font-medium">{alert.message}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{alert.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="3d">
          <Card className="h-[600px]">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                  <Ship className="h-16 w-16 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Visualização 3D Interativa</h3>
                <p className="text-muted-foreground max-w-md">
                  Modelo 3D do navio com hotspots interativos mostrando status em tempo real 
                  de cada sistema e componente.
                </p>
                <Button>
                  <Eye className="h-4 w-4 mr-2" />
                  Carregar Modelo 3D
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors">
          <Card>
            <CardHeader>
              <CardTitle>Sensores IoT em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {vesselSystems.flatMap(system => 
                  system.sensors.map((sensor, idx) => (
                    <div 
                      key={`${system.id}-${idx}`}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className={`h-4 w-4 ${getSensorStatusColor(sensor.status)}`} />
                        <span className="text-sm text-muted-foreground">{sensor.name}</span>
                      </div>
                      <p className={`text-2xl font-bold ${getSensorStatusColor(sensor.status)}`}>
                        {sensor.value}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Sistema de histórico de alertas com filtros avançados
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DigitalTwin3DPage;
