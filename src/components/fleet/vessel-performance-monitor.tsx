import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Fuel, 
  Gauge, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface VesselPerformanceData {
  id: string;
  name: string;
  fuelConsumption: number;
  speed: number;
  engineTemp: number;
  efficiency: number;
  maintenanceScore: number;
  alerts: Alert[];
  performanceHistory: PerformancePoint[];
}

interface Alert {
  id: string;
  type: "warning" | "critical" | "info";
  message: string;
  timestamp: string;
}

interface PerformancePoint {
  time: string;
  speed: number;
  fuel: number;
  efficiency: number;
}

const VesselPerformanceMonitor = () => {
  const [vessels, setVessels] = useState<VesselPerformanceData[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>("");

  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = () => {
    // Simulate real-time performance data
    const mockData: VesselPerformanceData[] = [
      {
        id: "1",
        name: "Nautilus Explorer",
        fuelConsumption: 12.5,
        speed: 18.2,
        engineTemp: 82,
        efficiency: 87,
        maintenanceScore: 92,
        alerts: [
          {
            id: "1",
            type: "warning",
            message: "Consumo de combustível acima da média",
            timestamp: new Date().toISOString()
          }
        ],
        performanceHistory: generateMockHistory()
      },
      {
        id: "2",
        name: "Atlantic Pioneer",
        fuelConsumption: 15.8,
        speed: 14.5,
        engineTemp: 75,
        efficiency: 94,
        maintenanceScore: 88,
        alerts: [
          {
            id: "2",
            type: "info",
            message: "Manutenção preventiva agendada para próxima semana",
            timestamp: new Date().toISOString()
          }
        ],
        performanceHistory: generateMockHistory()
      },
      {
        id: "3",
        name: "Pacific Star",
        fuelConsumption: 11.2,
        speed: 20.1,
        engineTemp: 78,
        efficiency: 91,
        maintenanceScore: 95,
        alerts: [],
        performanceHistory: generateMockHistory()
      }
    ];

    setVessels(mockData);
    if (!selectedVessel && mockData.length > 0) {
      setSelectedVessel(mockData[0].id);
    }
  };

  const generateMockHistory = (): PerformancePoint[] => {
    const points: PerformancePoint[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      points.push({
        time: time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        speed: 15 + Math.random() * 8,
        fuel: 10 + Math.random() * 8,
        efficiency: 85 + Math.random() * 10
      });
    }
    
    return points;
  };

  const selectedVesselData = vessels.find(v => v.id === selectedVessel);

  const getAlertIcon = (type: string) => {
    switch (type) {
    case "critical":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    default:
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPerformanceColor = (value: number, threshold: number = 90) => {
    if (value >= threshold) return "text-green-600";
    if (value >= threshold - 20) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Vessel Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitor de Performance da Frota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {vessels.map(vessel => (
              <Button
                key={vessel.id}
                variant={selectedVessel === vessel.id ? "default" : "outline"}
                onClick={() => setSelectedVessel(vessel.id)}
                className="mb-2"
              >
                {vessel.name}
                {vessel.alerts.length > 0 && (
                  <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
                    {vessel.alerts.length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedVesselData && (
        <>
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Fuel className="h-4 w-4" />
                  Consumo de Combustível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedVesselData.fuelConsumption} L/h</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  +2.1% vs média
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Velocidade Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedVesselData.speed} nós</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingDown className="h-3 w-3" />
                  -1.2% vs planejado
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Eficiência Operacional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getPerformanceColor(selectedVesselData.efficiency)}`}>
                  {selectedVesselData.efficiency}%
                </div>
                <Progress value={selectedVesselData.efficiency} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Score de Manutenção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getPerformanceColor(selectedVesselData.maintenanceScore)}`}>
                  {selectedVesselData.maintenanceScore}%
                </div>
                <Progress value={selectedVesselData.maintenanceScore} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Charts and Details */}
          <Tabs defaultValue="charts" className="w-full">
            <TabsList>
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Gráficos de Performance
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Alertas ({selectedVesselData.alerts.length})
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Manutenção
              </TabsTrigger>
            </TabsList>

            <TabsContent value="charts" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance nas Últimas 24h</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={selectedVesselData.performanceHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="speed" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="Velocidade (nós)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="fuel" 
                          stroke="hsl(var(--destructive))" 
                          strokeWidth={2}
                          name="Combustível (L/h)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Eficiência Operacional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={selectedVesselData.performanceHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="efficiency" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                          name="Eficiência (%)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="alerts">
              <Card>
                <CardHeader>
                  <CardTitle>Alertas e Notificações</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedVesselData.alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>Nenhum alerta ativo para esta embarcação</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedVesselData.alerts.map(alert => (
                        <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1">
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString("pt-BR")}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            Resolver
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance">
              <Card>
                <CardHeader>
                  <CardTitle>Status de Manutenção</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">95%</div>
                        <div className="text-sm text-muted-foreground">Health Score</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">12</div>
                        <div className="text-sm text-muted-foreground">Dias até próxima manutenção</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">3</div>
                        <div className="text-sm text-muted-foreground">Itens para inspeção</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Próximas Manutenções</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Inspeção do Motor</p>
                            <p className="text-sm text-muted-foreground">Agendada para 15/01/2025</p>
                          </div>
                          <Badge variant="secondary">Preventiva</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Troca de Filtros</p>
                            <p className="text-sm text-muted-foreground">Agendada para 20/01/2025</p>
                          </div>
                          <Badge variant="secondary">Rotina</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default VesselPerformanceMonitor;