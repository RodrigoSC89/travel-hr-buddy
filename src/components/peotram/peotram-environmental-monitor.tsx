import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Thermometer,
  Droplets,
  Wind,
  Zap,
  Waves,
  Cloud,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  MapPin,
  Clock,
  RefreshCw,
  Download,
  Settings,
  Bell,
} from "lucide-react";

interface EnvironmentalSensor {
  id: string;
  name: string;
  type:
    | "temperature"
    | "humidity"
    | "pressure"
    | "wind"
    | "water_quality"
    | "air_quality"
    | "noise"
    | "radiation";
  location: string;
  currentValue: number;
  unit: string;
  minThreshold: number;
  maxThreshold: number;
  status: "normal" | "warning" | "critical" | "offline";
  trend: "up" | "down" | "stable";
  lastReading: string;
  calibrationDate: string;
}

interface EnvironmentalAlert {
  id: string;
  sensorId: string;
  type: "threshold" | "offline" | "calibration" | "maintenance";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export const PeotramEnvironmentalMonitor: React.FC = () => {
  const [sensors, setSensors] = useState<EnvironmentalSensor[]>(getDemoSensors());
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>(getDemoAlerts());
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  function getDemoSensors(): EnvironmentalSensor[] {
    return [
      {
        id: "TEMP001",
        name: "Temperatura do Ar - Deck Principal",
        type: "temperature",
        location: "Deck Principal",
        currentValue: 28.5,
        unit: "°C",
        minThreshold: 15,
        maxThreshold: 35,
        status: "normal",
        trend: "up",
        lastReading: "2024-01-22T10:30:00Z",
        calibrationDate: "2024-01-15",
      },
      {
        id: "HUM001",
        name: "Umidade Relativa - Praça de Máquinas",
        type: "humidity",
        location: "Praça de Máquinas",
        currentValue: 85.2,
        unit: "%",
        minThreshold: 40,
        maxThreshold: 80,
        status: "warning",
        trend: "up",
        lastReading: "2024-01-22T10:29:00Z",
        calibrationDate: "2024-01-10",
      },
      {
        id: "WIND001",
        name: "Velocidade do Vento",
        type: "wind",
        location: "Ponte de Comando",
        currentValue: 15.8,
        unit: "km/h",
        minThreshold: 0,
        maxThreshold: 50,
        status: "normal",
        trend: "stable",
        lastReading: "2024-01-22T10:28:00Z",
        calibrationDate: "2024-01-08",
      },
      {
        id: "WATER001",
        name: "Qualidade da Água - Descarga",
        type: "water_quality",
        location: "Sistema de Descarga",
        currentValue: 6.8,
        unit: "pH",
        minThreshold: 6.0,
        maxThreshold: 8.5,
        status: "normal",
        trend: "stable",
        lastReading: "2024-01-22T10:25:00Z",
        calibrationDate: "2024-01-12",
      },
      {
        id: "NOISE001",
        name: "Nível de Ruído - Acomodações",
        type: "noise",
        location: "Acomodações",
        currentValue: 75.3,
        unit: "dB",
        minThreshold: 0,
        maxThreshold: 70,
        status: "critical",
        trend: "up",
        lastReading: "2024-01-22T10:27:00Z",
        calibrationDate: "2024-01-05",
      },
      {
        id: "AIR001",
        name: "Qualidade do Ar - Convés",
        type: "air_quality",
        location: "Convés Superior",
        currentValue: 45,
        unit: "AQI",
        minThreshold: 0,
        maxThreshold: 100,
        status: "normal",
        trend: "down",
        lastReading: "2024-01-22T10:26:00Z",
        calibrationDate: "2024-01-18",
      },
    ];
  }

  function getDemoAlerts(): EnvironmentalAlert[] {
    return [
      {
        id: "ALERT001",
        sensorId: "HUM001",
        type: "threshold",
        severity: "medium",
        message: "Umidade acima do limite recomendado na Praça de Máquinas",
        timestamp: "2024-01-22T10:29:00Z",
        acknowledged: false,
      },
      {
        id: "ALERT002",
        sensorId: "NOISE001",
        type: "threshold",
        severity: "high",
        message: "Nível de ruído crítico nas acomodações",
        timestamp: "2024-01-22T10:27:00Z",
        acknowledged: false,
      },
      {
        id: "ALERT003",
        sensorId: "TEMP001",
        type: "calibration",
        severity: "low",
        message: "Calibração do sensor de temperatura próxima do vencimento",
        timestamp: "2024-01-22T09:15:00Z",
        acknowledged: true,
      },
    ];
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-success/20 text-success border-success/30";
      case "warning":
        return "bg-warning/20 text-warning border-warning/30";
      case "critical":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "offline":
        return "bg-muted/20 text-muted-foreground border-muted/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/20 text-warning border-warning/30";
      case "low":
        return "bg-info/20 text-info border-info/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "temperature":
        return <Thermometer className="w-5 h-5" />;
      case "humidity":
        return <Droplets className="w-5 h-5" />;
      case "pressure":
        return <BarChart3 className="w-5 h-5" />;
      case "wind":
        return <Wind className="w-5 h-5" />;
      case "water_quality":
        return <Waves className="w-5 h-5" />;
      case "air_quality":
        return <Cloud className="w-5 h-5" />;
      case "noise":
        return <Activity className="w-5 h-5" />;
      case "radiation":
        return <Zap className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-destructive" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-success" />;
      case "stable":
        return <Activity className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "offline":
        return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const filteredSensors = sensors.filter(sensor => {
    const matchesLocation = selectedLocation === "all" || sensor.location === selectedLocation;
    const matchesType = selectedType === "all" || sensor.type === selectedType;
    return matchesLocation && matchesType;
  });

  const activeAlerts = alerts.filter(alert => !alert.acknowledged);
  const criticalSensors = sensors.filter(sensor => sensor.status === "critical").length;
  const warningSensors = sensors.filter(sensor => sensor.status === "warning").length;
  const offlineSensors = sensors.filter(sensor => sensor.status === "offline").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Monitoramento Ambiental</h2>
          <p className="text-muted-foreground">
            Controle em tempo real das condições ambientais e operacionais
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Relatório
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {activeAlerts.length > 0 && (
        <Alert className="border-warning bg-warning/10">
          <Bell className="h-4 w-4 text-warning" />
          <AlertDescription>
            <span className="font-medium">
              {activeAlerts.length} alerta(s) ativo(s) requerem atenção.
            </span>
            <Button variant="link" className="p-0 h-auto ml-2 text-warning">
              Ver alertas
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/20">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sensores Normais</p>
                <p className="text-2xl font-bold text-success">
                  {sensors.filter(s => s.status === "normal").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning/20">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold text-warning">{warningSensors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/20">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-destructive">{criticalSensors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-muted/20">
                <Activity className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-muted-foreground">{offlineSensors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sensors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sensors">Sensores</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="locations">Localizações</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="sensors" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Localização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as localizações</SelectItem>
                <SelectItem value="Deck Principal">Deck Principal</SelectItem>
                <SelectItem value="Praça de Máquinas">Praça de Máquinas</SelectItem>
                <SelectItem value="Ponte de Comando">Ponte de Comando</SelectItem>
                <SelectItem value="Acomodações">Acomodações</SelectItem>
                <SelectItem value="Convés Superior">Convés Superior</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de Sensor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="temperature">Temperatura</SelectItem>
                <SelectItem value="humidity">Umidade</SelectItem>
                <SelectItem value="wind">Vento</SelectItem>
                <SelectItem value="water_quality">Qualidade da Água</SelectItem>
                <SelectItem value="air_quality">Qualidade do Ar</SelectItem>
                <SelectItem value="noise">Ruído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSensors.map(sensor => (
              <Card key={sensor.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(sensor.type)}
                      <div>
                        <CardTitle className="text-base">{sensor.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {sensor.location}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className={getStatusColor(sensor.status)}>
                        {getStatusIcon(sensor.status)}
                        <span className="ml-1">{sensor.status}</span>
                      </Badge>
                      {getTrendIcon(sensor.trend)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{sensor.currentValue}</p>
                    <p className="text-sm text-muted-foreground">{sensor.unit}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Min: {sensor.minThreshold}</span>
                      <span>Max: {sensor.maxThreshold}</span>
                    </div>
                    <Progress
                      value={
                        ((sensor.currentValue - sensor.minThreshold) /
                          (sensor.maxThreshold - sensor.minThreshold)) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(sensor.lastReading).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="w-3 h-3" />
                      <span>Cal: {new Date(sensor.calibrationDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Histórico
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="w-3 h-3 mr-1" />
                      Config
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {alerts.map(alert => (
              <Card
                key={alert.id}
                className={`border-l-4 ${
                  alert.severity === "critical"
                    ? "border-l-destructive"
                    : alert.severity === "high"
                      ? "border-l-destructive"
                      : alert.severity === "medium"
                        ? "border-l-warning"
                        : "border-l-info"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <AlertTriangle
                        className={`w-5 h-5 ${
                          alert.severity === "critical" || alert.severity === "high"
                            ? "text-destructive"
                            : alert.severity === "medium"
                              ? "text-warning"
                              : "text-info"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">
                          Sensor: {sensors.find(s => s.id === alert.sensorId)?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          alert.acknowledged
                            ? "bg-success/20 text-success border-success/30"
                            : "bg-warning/20 text-warning border-warning/30"
                        }
                      >
                        {alert.acknowledged ? "Reconhecido" : "Pendente"}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <div className="text-center p-8">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Mapa de Sensores</h3>
            <p className="text-muted-foreground mb-4">
              Visualização geográfica dos sensores na embarcação
            </p>
            <Button>
              <MapPin className="w-4 h-4 mr-2" />
              Abrir Mapa
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="text-center p-8">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dados Históricos</h3>
            <p className="text-muted-foreground mb-4">Análise histórica das condições ambientais</p>
            <Button>
              <BarChart3 className="w-4 h-4 mr-2" />
              Ver Gráficos
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
