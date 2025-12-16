import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Wifi, 
  WifiOff, 
  Battery, 
  Thermometer, 
  Gauge, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  Droplets,
  Wind
} from "lucide-react";

interface SensorData {
  id: string;
  name: string;
  type: string;
  value: number;
  unit: string;
  status: "online" | "offline" | "warning";
  lastUpdate: string;
  location: string;
  battery?: number;
}

interface DeviceStatus {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline" | "maintenance";
  location: string;
  lastSeen: string;
  signalStrength: number;
}

export const IoTDashboard: React.FC = () => {
  const [sensors, setSensors] = useState<SensorData[]>([
    {
      id: "1",
      name: "Temperatura Sala Principal",
      type: "temperature",
      value: 24.5,
      unit: "°C",
      status: "online",
      lastUpdate: "2 min ago",
      location: "Deck Principal",
      battery: 85
    },
    {
      id: "2",
      name: "Pressão Hidráulica",
      type: "pressure",
      value: 120.3,
      unit: "PSI",
      status: "online",
      lastUpdate: "1 min ago",
      location: "Sala de Máquinas",
      battery: 92
    },
    {
      id: "3",
      name: "Umidade do Ar",
      type: "humidity",
      value: 65.2,
      unit: "%",
      status: "warning",
      lastUpdate: "5 min ago",
      location: "Ponte de Comando",
      battery: 45
    },
    {
      id: "4",
      name: "Velocidade do Vento",
      type: "wind",
      value: 15.8,
      unit: "kt",
      status: "online",
      lastUpdate: "30 sec ago",
      location: "Deck Superior",
      battery: 78
    }
  ]);

  const [devices, setDevices] = useState<DeviceStatus[]>([
    {
      id: "dev1",
      name: "Gateway Principal",
      type: "gateway",
      status: "online",
      location: "Ponte de Comando",
      lastSeen: "30 sec ago",
      signalStrength: 95
    },
    {
      id: "dev2",
      name: "Repetidor Deck",
      type: "repeater",
      status: "online",
      location: "Deck Principal",
      lastSeen: "1 min ago",
      signalStrength: 87
    },
    {
      id: "dev3",
      name: "Sensor Node A",
      type: "sensor_node",
      status: "maintenance",
      location: "Sala de Máquinas",
      lastSeen: "2 hours ago",
      signalStrength: 0
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => prev.map(sensor => ({
        ...sensor,
        value: sensor.value + (Math.random() - 0.5) * 2,
        lastUpdate: Math.random() > 0.7 ? "just now" : sensor.lastUpdate
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "online":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case "offline":
      return <WifiOff className="h-4 w-4 text-destructive" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
    case "temperature":
      return <Thermometer className="h-4 w-4" />;
    case "pressure":
      return <Gauge className="h-4 w-4" />;
    case "humidity":
      return <Droplets className="h-4 w-4" />;
    case "wind":
      return <Wind className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
    }
  };

  const onlineSensors = sensors.filter(s => s.status === "online").length;
  const totalSensors = sensors.length;
  const onlineDevices = devices.filter(d => d.status === "online").length;
  const totalDevices = devices.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard IoT</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real de sensores e dispositivos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-2">
            <Activity className="h-3 w-3" />
            Sistema Ativo
          </Badge>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sensores Online</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineSensors}/{totalSensors}</div>
            <Progress value={(onlineSensors / totalSensors) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos Ativos</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineDevices}/{totalDevices}</div>
            <Progress value={(onlineDevices / totalDevices) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              1 crítico, 1 aviso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime Sistema</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sensors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sensors">Sensores</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
          <TabsTrigger value="map">Mapa</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="sensors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sensors.map((sensor) => (
              <Card key={sensor.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSensorIcon(sensor.type)}
                      <CardTitle className="text-sm">{sensor.name}</CardTitle>
                    </div>
                    {getStatusIcon(sensor.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {sensor.value.toFixed(1)} {sensor.unit}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {sensor.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3" />
                      {sensor.lastUpdate}
                    </div>
                    {sensor.battery && (
                      <div className="flex items-center gap-2">
                        <Battery className="h-3 w-3" />
                        <Progress value={sensor.battery} className="flex-1 h-2" />
                        <span>{sensor.battery}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {devices.map((device) => (
              <Card key={device.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{device.name}</CardTitle>
                    <Badge variant={device.status === "online" ? "default" : "destructive"}>
                      {device.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Tipo</div>
                      <div className="font-medium">{device.type}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Localização</div>
                      <div className="font-medium">{device.location}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Último Contato</div>
                      <div className="font-medium">{device.lastSeen}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Sinal</div>
                      <div className="flex items-center gap-2">
                        <Progress value={device.signalStrength} className="flex-1 h-2" />
                        <span className="font-medium">{device.signalStrength}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                    <Button variant="outline" size="sm">
                      Diagnóstico
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Dispositivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Visualização do mapa será implementada com integração de mapas interativos
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            <Card className="border-warning">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <CardTitle className="text-warning">Bateria Baixa</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sensor de umidade com bateria em 45%. Recomenda-se substituição.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm">Marcar como Resolvido</Button>
                  <Button variant="outline" size="sm">Ver Detalhes</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <WifiOff className="h-4 w-4 text-destructive" />
                  <CardTitle className="text-destructive">Dispositivo Offline</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sensor Node A não responde há 2 horas. Verificar conectividade.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm">Reiniciar Dispositivo</Button>
                  <Button variant="outline" size="sm">Diagnosticar</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};