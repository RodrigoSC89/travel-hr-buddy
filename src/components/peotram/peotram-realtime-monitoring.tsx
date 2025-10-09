import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  Ship,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
  Gauge,
  Thermometer,
  Droplets,
  Wind,
  Navigation,
  Anchor,
  Radio,
  Shield,
} from "lucide-react";

interface VesselStatus {
  id: string;
  name: string;
  imoNumber: string;
  position: {
    lat: number;
    lng: number;
    heading: number;
    speed: number;
  };
  status: "navegando" | "ancorado" | "no_porto" | "manutencao";
  connectionStatus: "online" | "offline" | "intermitente";
  lastUpdate: string;
  peotramScore: number;
  alerts: VesselAlert[];
  sensors: SensorData[];
}

interface VesselAlert {
  id: string;
  type: "seguranca" | "operacional" | "ambiental" | "manutencao";
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  lastUpdate: string;
}

interface OperationalMetrics {
  totalVessels: number;
  onlineVessels: number;
  activeAlerts: number;
  criticalAlerts: number;
  averagePeotramScore: number;
  fuelEfficiency: number;
  emissionCompliance: number;
  safetyIncidents: number;
}

export const PeotramRealtimeMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVessel, setSelectedVessel] = useState<VesselStatus | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const getDemoVessels = (): VesselStatus[] => [
    {
      id: "VESSEL_001",
      name: "MV Atlantic Explorer",
      imoNumber: "1234567",
      position: {
        lat: -23.5505,
        lng: -46.6333,
        heading: 45,
        speed: 12.5,
      },
      status: "navegando",
      connectionStatus: "online",
      lastUpdate: "2024-12-28T10:30:00Z",
      peotramScore: 87.5,
      alerts: [
        {
          id: "ALERT_001",
          type: "operacional",
          severity: "warning",
          message: "Temperatura do motor principal acima do normal",
          timestamp: "2024-12-28T10:25:00Z",
          acknowledged: false,
        },
      ],
      sensors: [
        {
          id: "TEMP_001",
          name: "Temperatura Motor",
          value: 78,
          unit: "°C",
          status: "warning",
          lastUpdate: "2024-12-28T10:30:00Z",
        },
        {
          id: "FUEL_001",
          name: "Nível Combustível",
          value: 65,
          unit: "%",
          status: "normal",
          lastUpdate: "2024-12-28T10:30:00Z",
        },
      ],
    },
    {
      id: "VESSEL_002",
      name: "OSV Petrobras XXI",
      imoNumber: "2345678",
      position: {
        lat: -22.9068,
        lng: -43.1729,
        heading: 180,
        speed: 0,
      },
      status: "ancorado",
      connectionStatus: "online",
      lastUpdate: "2024-12-28T10:28:00Z",
      peotramScore: 92.3,
      alerts: [],
      sensors: [
        {
          id: "PRESS_001",
          name: "Pressão Hidráulica",
          value: 145,
          unit: "bar",
          status: "normal",
          lastUpdate: "2024-12-28T10:28:00Z",
        },
      ],
    },
  ];

  const [vessels, setVessels] = useState<VesselStatus[]>(getDemoVessels());

  const getMetrics = (): OperationalMetrics => ({
    totalVessels: vessels.length,
    onlineVessels: vessels.filter(v => v.connectionStatus === "online").length,
    activeAlerts: vessels.reduce((acc, v) => acc + v.alerts.length, 0),
    criticalAlerts: vessels.reduce(
      (acc, v) => acc + v.alerts.filter(a => a.severity === "critical").length,
      0
    ),
    averagePeotramScore: vessels.reduce((acc, v) => acc + v.peotramScore, 0) / vessels.length,
    fuelEfficiency: 89.2,
    emissionCompliance: 94.7,
    safetyIncidents: 0,
  });

  const metrics = getMetrics();

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simular atualizações de dados em tempo real
      setVessels(prev =>
        prev.map(vessel => ({
          ...vessel,
          lastUpdate: new Date().toISOString(),
          position: {
            ...vessel.position,
            speed: vessel.position.speed + (Math.random() - 0.5) * 2,
          },
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
    case "navegando":
      return "bg-info/20 text-info border-info/30";
    case "ancorado":
      return "bg-warning/20 text-warning border-warning/30";
    case "no_porto":
      return "bg-success/20 text-success border-success/30";
    case "manutencao":
      return "bg-destructive/20 text-destructive border-destructive/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getConnectionIcon = (status: string) => {
    switch (status) {
    case "online":
      return <Wifi className="w-4 h-4 text-success" />;
    case "offline":
      return <WifiOff className="w-4 h-4 text-destructive" />;
    case "intermitente":
      return <Radio className="w-4 h-4 text-warning" />;
    default:
      return <WifiOff className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical":
      return "bg-destructive/20 text-destructive border-destructive/30";
    case "warning":
      return "bg-warning/20 text-warning border-warning/30";
    case "info":
      return "bg-info/20 text-info border-info/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getSensorStatusColor = (status: string) => {
    switch (status) {
    case "normal":
      return "text-success";
    case "warning":
      return "text-warning";
    case "critical":
      return "text-destructive";
    default:
      return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Monitoramento em Tempo Real</h2>
          <p className="text-muted-foreground">
            Status operacional e conformidade PEOTRAM da frota
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="w-4 h-4 mr-2" />
            {autoRefresh ? "Pausar" : "Iniciar"} Atualização
          </Button>
          <Badge variant="outline" className="bg-success/20 text-success border-success/30">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="vessels" className="flex items-center gap-2">
            <Ship className="w-4 h-4" />
            Embarcações
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Embarcações Online</CardTitle>
                <Ship className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {metrics.onlineVessels}/{metrics.totalVessels}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((metrics.onlineVessels / metrics.totalVessels) * 100)}% da frota
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Score PEOTRAM Médio</CardTitle>
                <Shield className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {metrics.averagePeotramScore.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Acima da meta (85%)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{metrics.activeAlerts}</div>
                <p className="text-xs text-muted-foreground">{metrics.criticalAlerts} críticos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eficiência Combustível</CardTitle>
                <Droplets className="h-4 w-4 text-info" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-info">{metrics.fuelEfficiency}%</div>
                <p className="text-xs text-muted-foreground">+2.1% este mês</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status da Frota</CardTitle>
                <CardDescription>Distribuição por status operacional</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { status: "navegando", count: 2, label: "Navegando" },
                  { status: "ancorado", count: 1, label: "Ancorado" },
                  { status: "no_porto", count: 0, label: "No Porto" },
                  { status: "manutencao", count: 0, label: "Manutenção" },
                ].map(item => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(item.count / metrics.totalVessels) * 100}
                        className="w-20 h-2"
                      />
                      <span className="text-sm font-medium w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conformidade Ambiental</CardTitle>
                <CardDescription>Monitoramento de emissões em tempo real</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Emissões NOx</span>
                    <span className="text-success">Conforme</span>
                  </div>
                  <Progress value={94.7} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Emissões SOx</span>
                    <span className="text-success">Conforme</span>
                  </div>
                  <Progress value={96.2} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Água de Lastro</span>
                    <span className="text-success">Conforme</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vessels" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vessels.map(vessel => (
              <Card
                key={vessel.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-card to-accent/5"
                onClick={() => setSelectedVessel(vessel)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{vessel.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getConnectionIcon(vessel.connectionStatus)}
                      <Badge variant="outline" className={getStatusColor(vessel.status)}>
                        {vessel.status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>IMO: {vessel.imoNumber}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-muted-foreground" />
                      <span>{vessel.position.speed.toFixed(1)} kn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{vessel.position.heading}°</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score PEOTRAM</span>
                      <span className="font-medium text-primary">{vessel.peotramScore}%</span>
                    </div>
                    <Progress value={vessel.peotramScore} className="h-2" />
                  </div>

                  {vessel.alerts.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Alertas Ativos:</div>
                      {vessel.alerts.slice(0, 2).map(alert => (
                        <div
                          key={alert.id}
                          className={`p-2 rounded-lg border text-xs ${getSeverityColor(alert.severity)}`}
                        >
                          {alert.message}
                        </div>
                      ))}
                      {vessel.alerts.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{vessel.alerts.length - 2} mais alertas
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {vessels.flatMap(vessel =>
              vessel.alerts.map(alert => (
                <Card
                  key={`${vessel.id}-${alert.id}`}
                  className="bg-gradient-to-r from-card to-accent/5"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="bg-muted/50">
                            {alert.type}
                          </Badge>
                          <span className="text-sm font-medium">{vessel.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!alert.acknowledged && (
                          <Button size="sm">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Reconhecer
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Operacional</CardTitle>
                <CardDescription>Métricas dos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tempo de Navegação</span>
                    <span className="font-medium">87.3%</span>
                  </div>
                  <Progress value={87.3} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Eficiência Combustível</span>
                    <span className="font-medium text-success">92.1%</span>
                  </div>
                  <Progress value={92.1} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Conformidade PEOTRAM</span>
                    <span className="font-medium text-primary">89.4%</span>
                  </div>
                  <Progress value={89.4} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendências de Alertas</CardTitle>
                <CardDescription>Distribuição por categoria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { type: "operacional", count: 12, color: "bg-info/40" },
                  { type: "seguranca", count: 3, color: "bg-destructive/40" },
                  { type: "ambiental", count: 7, color: "bg-success/40" },
                  { type: "manutencao", count: 5, color: "bg-warning/40" },
                ].map(item => (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm capitalize">{item.type}</span>
                    </div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
