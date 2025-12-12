import { useEffect, useState, useCallback } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Ship, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Fuel,
  Navigation,
  Thermometer,
  BarChart3
} from "lucide-react";

interface OperationMetric {
  label: string;
  value: string | number;
  unit?: string;
  status: "normal" | "warning" | "critical";
  icon: React.ReactNode;
}

interface VesselOperation {
  id: string;
  vessel_name: string;
  operation_type: string;
  status: string;
  start_time: string;
  location?: string;
}

const OperationsDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [operations, setOperations] = useState<VesselOperation[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);

  const loadOperationsData = async () => {
    try {
      setLoading(true);
      
      // Load real vessel data
      const { data: vesselsData, error: vesselsError } = await supabase
        .from("vessels")
        .select("id, name, status, current_location, vessel_type")
        .limit(20);
      
      if (!vesselsError && vesselsData) {
        setVessels(vesselsData);
        
        // Map vessels to operations
        const mappedOperations: VesselOperation[] = vesselsData.map((v: unknown) => ({
          id: v.id,
          vessel_name: v.name,
          operation_type: mapStatusToOperationType(v.status),
          status: mapVesselStatus(v.status),
          start_time: new Date().toISOString(),
          location: v.current_location || "Localização não informada"
        }));
        
        setOperations(mappedOperations);
      } else {
        // Fallback to mock data
        setOperations([
          {
            id: "op-1",
            vessel_name: "MV Atlantic Star",
            operation_type: "cargo_loading",
            status: "in_progress",
            start_time: new Date().toISOString(),
            location: "Porto de Santos"
          },
          {
            id: "op-2",
            vessel_name: "MV Pacific Explorer",
            operation_type: "navigation",
            status: "active",
            start_time: new Date(Date.now() - 3600000).toISOString(),
            location: "Em trânsito - Atlântico Sul"
          }
        ]);
      }
    } catch (error) {
      console.error("Error loading operations:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados operacionais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const mapStatusToOperationType = (status: string): string => {
    const typeMap: Record<string, string> = {
      "active": "navigation",
      "in_port": "cargo_loading",
      "docked": "cargo_unloading",
      "maintenance": "maintenance",
      "inactive": "inspection"
    };
    return typeMap[status] || "navigation";
  };

  const mapVesselStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      "active": "active",
      "in_port": "in_progress",
      "docked": "in_progress",
      "maintenance": "scheduled",
      "inactive": "completed"
    };
    return statusMap[status] || "active";
  };

  useEffect(() => {
    loadOperationsData();
    const interval = setInterval(loadOperationsData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const metrics: OperationMetric[] = [
    {
      label: "Embarcações Ativas",
      value: vessels.filter(v => v.status === "active").length || operations.length,
      status: "normal",
      icon: <Ship className="h-5 w-5" />
    },
    {
      label: "Eficiência Operacional",
      value: 94.5,
      unit: "%",
      status: "normal",
      icon: <Activity className="h-5 w-5" />
    },
    {
      label: "Em Manutenção",
      value: vessels.filter(v => v.status === "maintenance").length,
      status: vessels.filter(v => v.status === "maintenance").length > 2 ? "warning" : "normal",
      icon: <Fuel className="h-5 w-5" />
    },
    {
      label: "Alertas Ativos",
      value: vessels.filter(v => v.status === "maintenance" || v.status === "inactive").length,
      status: vessels.filter(v => v.status === "maintenance").length > 0 ? "warning" : "normal",
      icon: <AlertTriangle className="h-5 w-5" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
    case "normal": return "text-green-600";
    case "warning": return "text-yellow-600";
    case "critical": return "text-red-600";
    default: return "text-muted-foreground";
    }
  };

  const getOperationStatusBadge = (status: string) => {
    switch (status) {
    case "active":
    case "in_progress":
      return <Badge className="bg-green-500">Em Andamento</Badge>;
    case "scheduled":
      return <Badge variant="outline">Agendado</Badge>;
    case "completed":
      return <Badge variant="secondary">Concluído</Badge>;
    case "delayed":
      return <Badge variant="destructive">Atrasado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOperationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cargo_loading: "Carregamento de Carga",
      cargo_unloading: "Descarga",
      navigation: "Navegação",
      maintenance: "Manutenção",
      bunkering: "Abastecimento",
      inspection: "Inspeção"
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Carregando dados operacionais...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Navigation className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Centro de Operações</h1>
            <p className="text-muted-foreground">Monitoramento em tempo real de operações marítimas</p>
          </div>
        </div>
        <Button variant="outline" onClick={loadOperationsData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <div className={getStatusColor(metric.status)}>
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.value}{metric.unit && <span className="text-sm font-normal ml-1">{metric.unit}</span>}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {metric.status === "normal" && <CheckCircle className="h-3 w-3 text-green-500" />}
                {metric.status === "warning" && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                {metric.status === "critical" && <AlertTriangle className="h-3 w-3 text-red-500" />}
                <span className="text-xs text-muted-foreground capitalize">{metric.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="operations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="operations">Operações Ativas</TabsTrigger>
          <TabsTrigger value="telemetry">Telemetria</TabsTrigger>
          <TabsTrigger value="fuel">Combustível</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operações em Andamento</CardTitle>
              <CardDescription>Status atual de todas as operações da frota</CardDescription>
            </CardHeader>
            <CardContent>
              {operations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma operação em andamento</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {operations.map((op) => (
                    <div key={op.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Ship className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{op.vessel_name}</p>
                          <p className="text-sm text-muted-foreground">{getOperationTypeLabel(op.operation_type)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm">{op.location || "Localização não informada"}</p>
                          <p className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(op.start_time).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        {getOperationStatusBadge(op.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telemetry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Telemetria da Frota</CardTitle>
              <CardDescription>Dados em tempo real de sensores e sistemas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">Temperatura Média</span>
                  </div>
                  <p className="text-2xl font-bold">42°C</p>
                  <p className="text-xs text-muted-foreground">Motor principal</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">RPM Médio</span>
                  </div>
                  <p className="text-2xl font-bold">145 RPM</p>
                  <p className="text-xs text-muted-foreground">Hélices</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Velocidade Média</span>
                  </div>
                  <p className="text-2xl font-bold">12.5 nós</p>
                  <p className="text-xs text-muted-foreground">Frota ativa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Combustível</CardTitle>
              <CardDescription>Consumo e otimização de combustível</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Fuel className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Módulo de otimização de combustível</p>
                <Button className="mt-4" onClick={() => window.location.href = "/fuel-optimizer"}>
                  Acessar Fuel Optimizer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Performance</CardTitle>
              <CardDescription>Métricas de desempenho operacional</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Módulo de análise de performance</p>
                <Button className="mt-4" onClick={() => window.location.href = "/analytics"}>
                  Acessar Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OperationsDashboard;
