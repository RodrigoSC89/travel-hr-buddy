import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Ship, AlertTriangle, Anchor, Container, Route, BarChart3, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Vessel {
  id: string;
  name: string;
  imo: string;
  type: "container" | "tanker" | "bulk" | "general_cargo" | "passenger";
  flag: string;
  status: "at_sea" | "in_port" | "anchored" | "maintenance" | "emergency";
  location: {
    lat: number;
    lng: number;
    port?: string;
    country: string;
  };
  eta: string;
  etd?: string;
  cargo: {
    type: string;
    capacity: number;
    current_load: number;
  };
  crew: {
    total: number;
    onboard: number;
  };
  fuel: {
    capacity: number;
    current: number;
  };
  route: {
    origin: string;
    destination: string;
    waypoints: string[];
  };
  lastUpdate: string;
}

interface LogisticsOperation {
  id: string;
  vesselId: string;
  type: "loading" | "unloading" | "bunkering" | "crew_change" | "maintenance";
  port: string;
  scheduled: string;
  estimated_duration: number;
  status: "scheduled" | "in_progress" | "completed" | "delayed";
  cargo?: {
    type: string;
    quantity: number;
    unit: string;
  };
}

interface PortSchedule {
  id: string;
  port: string;
  country: string;
  vessels_expected: number;
  berth_availability: number;
  avg_waiting_time: number;
  weather_conditions: string;
  tidal_info: string;
}

export const MaritimeLogisticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [operations, setOperations] = useState<LogisticsOperation[]>([]);
  const [portSchedules, setPortSchedules] = useState<PortSchedule[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with mock data - replace with real API calls
    loadMockData();
  }, []);

  const loadMockData = () => {
    const mockVessels: Vessel[] = [
      {
        id: "1",
        name: "MV Nautilus Pioneer",
        imo: "IMO 9456789",
        type: "container",
        flag: "Brazil",
        status: "at_sea",
        location: {
          lat: -23.0015,
          lng: -43.2093,
          country: "Brazil",
        },
        eta: "2024-01-20T14:30:00Z",
        etd: "2024-01-21T08:00:00Z",
        cargo: {
          type: "Containers",
          capacity: 12000,
          current_load: 8500,
        },
        crew: {
          total: 24,
          onboard: 22,
        },
        fuel: {
          capacity: 3500,
          current: 2800,
        },
        route: {
          origin: "Santos, Brazil",
          destination: "Hamburg, Germany",
          waypoints: ["Las Palmas", "Algeciras"],
        },
        lastUpdate: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        name: "MV Atlantic Explorer",
        imo: "IMO 9567890",
        type: "tanker",
        flag: "Brazil",
        status: "in_port",
        location: {
          lat: -23.9608,
          lng: -46.3334,
          port: "Santos",
          country: "Brazil",
        },
        eta: "2024-01-15T09:00:00Z",
        cargo: {
          type: "Crude Oil",
          capacity: 85000,
          current_load: 78000,
        },
        crew: {
          total: 28,
          onboard: 28,
        },
        fuel: {
          capacity: 4200,
          current: 3900,
        },
        route: {
          origin: "Santos, Brazil",
          destination: "Houston, USA",
          waypoints: ["Panama Canal"],
        },
        lastUpdate: "2024-01-15T11:00:00Z",
      },
    ];

    const mockOperations: LogisticsOperation[] = [
      {
        id: "1",
        vesselId: "1",
        type: "loading",
        port: "Santos",
        scheduled: "2024-01-20T15:00:00Z",
        estimated_duration: 18,
        status: "scheduled",
        cargo: {
          type: "Containers",
          quantity: 1200,
          unit: "TEU",
        },
      },
      {
        id: "2",
        vesselId: "2",
        type: "unloading",
        port: "Santos",
        scheduled: "2024-01-15T10:00:00Z",
        estimated_duration: 24,
        status: "in_progress",
        cargo: {
          type: "Crude Oil",
          quantity: 78000,
          unit: "MT",
        },
      },
    ];

    const mockPortSchedules: PortSchedule[] = [
      {
        id: "1",
        port: "Santos",
        country: "Brazil",
        vessels_expected: 15,
        berth_availability: 8,
        avg_waiting_time: 6.5,
        weather_conditions: "Calm seas, 2m waves",
        tidal_info: "High tide 14:30 UTC",
      },
      {
        id: "2",
        port: "Hamburg",
        country: "Germany",
        vessels_expected: 22,
        berth_availability: 12,
        avg_waiting_time: 4.2,
        weather_conditions: "Moderate seas, wind 15 knots",
        tidal_info: "High tide 09:15 UTC",
      },
    ];

    setVessels(mockVessels);
    setOperations(mockOperations);
    setPortSchedules(mockPortSchedules);
    setSelectedVessel(mockVessels[0]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "at_sea":
        return "text-primary bg-primary/10";
      case "in_port":
        return "text-green-600 bg-green-100";
      case "anchored":
        return "text-yellow-600 bg-yellow-100";
      case "maintenance":
        return "text-orange-600 bg-orange-100";
      case "emergency":
        return "text-destructive bg-destructive/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "at_sea":
        return "Em Navegação";
      case "in_port":
        return "No Porto";
      case "anchored":
        return "Fundeado";
      case "maintenance":
        return "Manutenção";
      case "emergency":
        return "Emergência";
      default:
        return "Desconhecido";
    }
  };

  const handleOptimizeRoute = () => {
    toast({
      title: "IA Ativada",
      description: "Otimização de rota iniciada com algoritmos de Machine Learning",
    });
  };

  const handlePredictiveAlert = () => {
    toast({
      title: "Análise Preditiva",
      description: "Sistema detectou possível atraso de 2h devido a condições meteorológicas",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 p-8 text-azure-50">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        ></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-azure-100/20 rounded-2xl">
              <Ship className="h-12 w-12" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Gestão Logística Marítima</h1>
              <p className="text-xl opacity-90">
                Sistema Inteligente de Operações Portuárias e Navegação
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-azure-100/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Ship className="h-5 w-5" />
                <span>Embarcações Ativas</span>
              </div>
              <div className="text-3xl font-bold">{vessels.length}</div>
            </div>
            <div className="bg-azure-100/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Container className="h-5 w-5" />
                <span>Operações Hoje</span>
              </div>
              <div className="text-3xl font-bold">{operations.length}</div>
            </div>
            <div className="bg-azure-100/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Anchor className="h-5 w-5" />
                <span>Portos Monitorados</span>
              </div>
              <div className="text-3xl font-bold">{portSchedules.length}</div>
            </div>
            <div className="bg-azure-100/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5" />
                <span>Eficiência IA</span>
              </div>
              <div className="text-3xl font-bold">96.2%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="fleet" className="flex items-center gap-2">
            <Ship className="h-4 w-4" />
            Frota
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Container className="h-4 w-4" />
            Operações
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            IA Logística
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Fleet Status */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Status da Frota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vessels.map(vessel => (
                    <div
                      key={vessel.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Ship className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{vessel.name}</h3>
                          <p className="text-sm text-muted-foreground">{vessel.imo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(vessel.status)}>
                          {getStatusLabel(vessel.status)}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {vessel.location.port || vessel.location.country}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Port Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="h-5 w-5" />
                  Informações Portuárias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portSchedules.map(port => (
                    <div key={port.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{port.port}</h3>
                        <Badge variant="outline">{port.country}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Embarcações esperadas:</span>
                          <div className="font-medium">{port.vessels_expected}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Berços disponíveis:</span>
                          <div className="font-medium">{port.berth_availability}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tempo médio espera:</span>
                          <div className="font-medium">{port.avg_waiting_time}h</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div>{port.weather_conditions}</div>
                        <div>{port.tidal_info}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Operations Today */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Container className="h-5 w-5" />
                Operações de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {operations.map(operation => {
                  const vessel = vessels.find(v => v.id === operation.vesselId);
                  return (
                    <div
                      key={operation.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Container className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{vessel?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {operation.type === "loading" ? "Carregamento" : "Descarregamento"} -{" "}
                            {operation.port}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={operation.status === "in_progress" ? "default" : "secondary"}
                        >
                          {operation.status === "in_progress" ? "Em Andamento" : "Agendado"}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {operation.estimated_duration}h estimadas
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vessel List */}
            <Card>
              <CardHeader>
                <CardTitle>Selecionar Embarcação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vessels.map(vessel => (
                    <div
                      key={vessel.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedVessel?.id === vessel.id
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedVessel(vessel)}
                    >
                      <h3 className="font-semibold">{vessel.name}</h3>
                      <p className="text-sm text-muted-foreground">{vessel.type}</p>
                      <Badge className={getStatusColor(vessel.status)} variant="outline">
                        {getStatusLabel(vessel.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vessel Details */}
            {selectedVessel && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5" />
                    {selectedVessel.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Informações Básicas</Label>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>IMO:</span>
                            <span className="font-medium">{selectedVessel.imo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tipo:</span>
                            <span className="font-medium capitalize">
                              {selectedVessel.type.replace("_", " ")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bandeira:</span>
                            <span className="font-medium">{selectedVessel.flag}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge
                              className={getStatusColor(selectedVessel.status)}
                              variant="outline"
                            >
                              {getStatusLabel(selectedVessel.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Rota</Label>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Origem:</span>
                            <span className="font-medium">{selectedVessel.route.origin}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Destino:</span>
                            <span className="font-medium">{selectedVessel.route.destination}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ETA:</span>
                            <span className="font-medium">
                              {new Date(selectedVessel.eta).toLocaleDateString("pt-BR")} às{" "}
                              {new Date(selectedVessel.eta).toLocaleTimeString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Carga</Label>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Tipo:</span>
                            <span className="font-medium">{selectedVessel.cargo.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Capacidade:</span>
                            <span className="font-medium">
                              {selectedVessel.cargo.capacity.toLocaleString()} TEU
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Carga Atual:</span>
                            <span className="font-medium">
                              {selectedVessel.cargo.current_load.toLocaleString()} TEU
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(selectedVessel.cargo.current_load / selectedVessel.cargo.capacity) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Tripulação e Combustível</Label>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Tripulação a bordo:</span>
                            <span className="font-medium">
                              {selectedVessel.crew.onboard}/{selectedVessel.crew.total}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Combustível:</span>
                            <span className="font-medium">
                              {selectedVessel.fuel.current}/{selectedVessel.fuel.capacity} MT
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${(selectedVessel.fuel.current / selectedVessel.fuel.capacity) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button onClick={handleOptimizeRoute}>
                      <Route className="h-4 w-4 mr-2" />
                      Otimizar Rota
                    </Button>
                    <Button variant="outline" onClick={handlePredictiveAlert}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Análise Preditiva
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Operações Portuárias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Container className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Gestão de Operações</h3>
                <p className="text-muted-foreground">
                  Módulo de operações portuárias em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intelligence">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  IA Preditiva
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">🌊 Previsão Meteorológica</h4>
                    <p className="text-sm text-blue-600">
                      IA detecta tempestade em 48h. Recomenda atraso de 6h na partida para economia
                      de combustível.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">⚓ Otimização Portuária</h4>
                    <p className="text-sm text-green-600">
                      Slot preferencial identificado no Porto de Santos. Economia estimada: R$
                      15.000.
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">🛠️ Manutenção Preditiva</h4>
                    <p className="text-sm text-orange-600">
                      Motor principal requer atenção em 850 horas. Agendar manutenção no próximo
                      porto.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Avançados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Eficiência de Combustível</span>
                      <span className="text-sm font-medium">94.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: "94.2%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Pontualidade Portuária</span>
                      <span className="text-sm font-medium">87.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: "87.8%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Otimização de Rotas</span>
                      <span className="text-sm font-medium">91.5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: "91.5%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold mb-2">Insights de Mercado</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Rota Santos-Hamburg 12% mais eficiente</li>
                    <li>• Demanda por contêineres +8% este mês</li>
                    <li>• Preços de bunker trending down</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
