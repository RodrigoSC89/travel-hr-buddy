import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Thermometer, 
  Zap, 
  Fuel, 
  Gauge,
  Activity,
  AlertTriangle,
  TrendingUp,
  Wifi,
  Battery,
  Waves,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SensorReading {
  id: string;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: Date;
  status: "normal" | "warning" | "critical";
  location: string;
}

interface VesselSensors {
  vesselId: string;
  vesselName: string;
  sensors: SensorReading[];
  lastUpdate: Date;
  connectionStatus: "online" | "offline" | "unstable";
}

export const IoTSensorDashboard = () => {
  const [vessels, setVessels] = useState<VesselSensors[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSensorData();
    
    // Set up real-time sensor updates
    const interval = setInterval(() => {
      simulateSensorUpdates();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const loadSensorData = () => {
    // Mock sensor data - in real implementation, this would come from IoT sensors
    const mockData: VesselSensors[] = [
      {
        vesselId: "1",
        vesselName: "MV Atlantic Explorer",
        lastUpdate: new Date(),
        connectionStatus: "online",
        sensors: [
          {
            id: "temp_001",
            sensorType: "engine_temperature",
            value: 78,
            unit: "°C",
            timestamp: new Date(),
            status: "normal",
            location: "Motor Principal"
          },
          {
            id: "vib_001",
            sensorType: "vibration",
            value: 3.2,
            unit: "mm/s",
            timestamp: new Date(),
            status: "normal",
            location: "Eixo Principal"
          },
          {
            id: "fuel_001",
            sensorType: "fuel_level",
            value: 75,
            unit: "%",
            timestamp: new Date(),
            status: "normal",
            location: "Tanque Principal"
          },
          {
            id: "oil_001",
            sensorType: "oil_pressure",
            value: 3.8,
            unit: "bar",
            timestamp: new Date(),
            status: "normal",
            location: "Sistema de Lubrificação"
          },
          {
            id: "bat_001",
            sensorType: "battery_voltage",
            value: 12.6,
            unit: "V",
            timestamp: new Date(),
            status: "normal",
            location: "Bateria Principal"
          }
        ]
      },
      {
        vesselId: "2",
        vesselName: "MV Pacific Navigator",
        lastUpdate: new Date(Date.now() - 120000), // 2 minutes ago
        connectionStatus: "unstable",
        sensors: [
          {
            id: "temp_002",
            sensorType: "engine_temperature",
            value: 92,
            unit: "°C",
            timestamp: new Date(),
            status: "warning",
            location: "Motor Principal"
          },
          {
            id: "vib_002",
            sensorType: "vibration",
            value: 6.1,
            unit: "mm/s",
            timestamp: new Date(),
            status: "warning",
            location: "Eixo Principal"
          },
          {
            id: "fuel_002",
            sensorType: "fuel_level",
            value: 15,
            unit: "%",
            timestamp: new Date(),
            status: "critical",
            location: "Tanque Principal"
          }
        ]
      }
    ];

    setVessels(mockData);
    setSelectedVessel(mockData[0].vesselId);
    setLoading(false);
  };

  const simulateSensorUpdates = () => {
    setVessels(prev => prev.map(vessel => ({
      ...vessel,
      lastUpdate: new Date(),
      sensors: vessel.sensors.map(sensor => {
        // Simulate realistic sensor value changes
        let newValue = sensor.value;
        let newStatus = sensor.status;
        
        switch (sensor.sensorType) {
        case "engine_temperature":
          newValue = Math.max(60, Math.min(100, sensor.value + (Math.random() - 0.5) * 4));
          newStatus = newValue > 85 ? "warning" : newValue > 95 ? "critical" : "normal";
          break;
        case "vibration":
          newValue = Math.max(0, Math.min(10, sensor.value + (Math.random() - 0.5) * 1));
          newStatus = newValue > 5 ? "warning" : newValue > 8 ? "critical" : "normal";
          break;
        case "fuel_level":
          newValue = Math.max(0, sensor.value - Math.random() * 0.5);
          newStatus = newValue < 20 ? "warning" : newValue < 10 ? "critical" : "normal";
          break;
        case "oil_pressure":
          newValue = Math.max(1, Math.min(5, sensor.value + (Math.random() - 0.5) * 0.3));
          newStatus = newValue < 2.5 ? "warning" : newValue < 1.5 ? "critical" : "normal";
          break;
        case "battery_voltage":
          newValue = Math.max(10, Math.min(14, sensor.value + (Math.random() - 0.5) * 0.2));
          newStatus = newValue < 12 ? "warning" : newValue < 11.5 ? "critical" : "normal";
          break;
        }

        return {
          ...sensor,
          value: Number(newValue.toFixed(1)),
          status: newStatus,
          timestamp: new Date()
        };
      })
    })));
  };

  const processSensorData = async (vesselId: string, sensorData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke("iot-sensor-processing", {
        body: {
          sensorData,
          vesselId,
          sensorType: sensorData.sensorType
        }
      });

      if (error) throw error;
      
      if (data.alerts && data.alerts.length > 0) {
        setAlerts(prev => [...prev, ...data.alerts]);
      }
      
    } catch (error) {
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
    case "engine_temperature": return <Thermometer className="h-5 w-5" />;
    case "vibration": return <Activity className="h-5 w-5" />;
    case "fuel_level": return <Fuel className="h-5 w-5" />;
    case "oil_pressure": return <Gauge className="h-5 w-5" />;
    case "battery_voltage": return <Battery className="h-5 w-5" />;
    default: return <Settings className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "normal": return "bg-green-100 text-green-800";
    case "warning": return "bg-yellow-100 text-yellow-800";
    case "critical": return "bg-red-100 text-red-800";
    default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getConnectionColor = (status: string) => {
    switch (status) {
    case "online": return "text-green-500";
    case "unstable": return "text-yellow-500";
    case "offline": return "text-red-500";
    default: return "text-muted-foreground";
    }
  };

  const getSensorValueColor = (sensor: SensorReading) => {
    switch (sensor.status) {
    case "critical": return "text-red-600";
    case "warning": return "text-yellow-600";
    case "normal": return "text-green-600";
    default: return "text-muted-foreground";
    }
  };

  const selectedVesselData = vessels.find(v => v.vesselId === selectedVessel);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard de Sensores IoT</h2>
        <p className="text-muted-foreground">
          Monitoramento em tempo real dos sensores das embarcações
        </p>
      </div>

      {/* Vessel Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vessels.map((vessel) => (
          <Card 
            key={vessel.vesselId}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedVessel === vessel.vesselId ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedVessel(vessel.vesselId)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wifi className={`h-5 w-5 ${getConnectionColor(vessel.connectionStatus)}`} />
                  {vessel.vesselName}
                </CardTitle>
                <Badge variant="outline">
                  {vessel.sensors.length} sensores
                </Badge>
              </div>
              <CardDescription>
                Última atualização: {vessel.lastUpdate.toLocaleTimeString("pt-BR")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {vessel.sensors.slice(0, 3).map((sensor) => (
                  <div key={sensor.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getSensorIcon(sensor.sensorType)}
                      <span className="capitalize">
                        {sensor.sensorType.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getSensorValueColor(sensor)}`}>
                        {sensor.value} {sensor.unit}
                      </span>
                      <Badge className={getStatusColor(sensor.status)} style={{ fontSize: "10px" }}>
                        {sensor.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Sensor View */}
      {selectedVesselData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {selectedVesselData.vesselName} - Sensores Detalhados
            </CardTitle>
            <CardDescription>
              Monitoramento detalhado de todos os sensores da embarcação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="current" className="w-full">
              <TabsList>
                <TabsTrigger value="current">Estado Atual</TabsTrigger>
                <TabsTrigger value="trends">Tendências</TabsTrigger>
                <TabsTrigger value="alerts">Alertas</TabsTrigger>
                <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedVesselData.sensors.map((sensor) => (
                    <Card key={sensor.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getSensorIcon(sensor.sensorType)}
                          {sensor.sensorType.replace("_", " ").toUpperCase()}
                        </CardTitle>
                        <CardDescription>{sensor.location}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-center">
                            <div className={`text-3xl font-bold ${getSensorValueColor(sensor)}`}>
                              {sensor.value}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {sensor.unit}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <Badge className={getStatusColor(sensor.status)}>
                              {sensor.status.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {sensor.timestamp.toLocaleTimeString("pt-BR")}
                            </span>
                          </div>

                          {/* Value range indicator */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Min</span>
                              <span>Max</span>
                            </div>
                            <Progress 
                              value={sensor.sensorType === "fuel_level" ? sensor.value : 
                                sensor.sensorType === "battery_voltage" ? (sensor.value / 14) * 100 :
                                  sensor.sensorType === "engine_temperature" ? (sensor.value / 120) * 100 :
                                    (sensor.value / 10) * 100} 
                              className="h-2" 
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tendências de 24h</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Temperatura do Motor</span>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">+2.3°C</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Consumo de Combustível</span>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-red-500" />
                            <span className="text-red-600">-5.2%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Vibração</span>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-yellow-500" />
                            <span className="text-yellow-600">Estável</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Previsões</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-800">Manutenção Preventiva</div>
                          <div className="text-xs text-blue-600">Recomendada em 15 dias</div>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <div className="text-sm font-medium text-yellow-800">Reabastecimento</div>
                          <div className="text-xs text-yellow-600">Necessário em 8 horas</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4">
                <div className="space-y-3">
                  {selectedVesselData.sensors
                    .filter(s => s.status !== "normal")
                    .map((sensor) => (
                      <Card key={sensor.id} className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              <div>
                                <div className="font-medium">
                                  {sensor.sensorType.replace("_", " ").toUpperCase()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {sensor.location}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${getSensorValueColor(sensor)}`}>
                                {sensor.value} {sensor.unit}
                              </div>
                              <Badge className={getStatusColor(sensor.status)}>
                                {sensor.status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="maintenance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Manutenção Preditiva</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Sistema de Resfriamento</span>
                          <Badge variant="outline">15 dias</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Rolamentos Principais</span>
                          <Badge variant="outline">30 dias</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Sistema Elétrico</span>
                          <Badge className="bg-green-100 text-green-800">OK</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Eficiência Operacional</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Eficiência Geral</span>
                            <span>87%</span>
                          </div>
                          <Progress value={87} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Consumo de Combustível</span>
                            <span>92%</span>
                          </div>
                          <Progress value={92} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};