/**
 * MARPOL Tracker Page - Real Supabase Integration
 * Monitoramento ambiental e compliance MARPOL em tempo real
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ShipLoader } from "@/components/ui/ship-loader";
import { 
  Leaf, Waves, Fuel, Trash2, AlertTriangle, 
  CheckCircle, FileText, Map, Activity, Ship, RefreshCw
} from "lucide-react";

// Hook for real MARPOL compliance data
function useMARPOLData() {
  // Compliance items for MARPOL annexes
  const complianceQuery = useQuery({
    queryKey: ["marpol-compliance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_items")
        .select("*")
        .or("framework.ilike.%MARPOL%,framework.ilike.%marpol%,category.ilike.%environment%")
        .limit(50);

      if (!error && data && data.length > 0) {
        // Group by annex/category and calculate scores
        const annexMap: Record<string, { total: number; compliant: number }> = {
          annexI: { total: 0, compliant: 0 },
          annexII: { total: 0, compliant: 0 },
          annexIII: { total: 0, compliant: 0 },
          annexIV: { total: 0, compliant: 0 },
          annexV: { total: 0, compliant: 0 },
          annexVI: { total: 0, compliant: 0 },
        };

        data.forEach((item) => {
          const desc = (item.description || "").toLowerCase();
          let annex = "annexI";
          if (desc.includes("nls") || desc.includes("químic") || desc.includes("annex ii")) annex = "annexII";
          else if (desc.includes("substânc") || desc.includes("packag") || desc.includes("annex iii")) annex = "annexIII";
          else if (desc.includes("esgoto") || desc.includes("sewage") || desc.includes("annex iv")) annex = "annexIV";
          else if (desc.includes("lixo") || desc.includes("garbage") || desc.includes("annex v")) annex = "annexV";
          else if (desc.includes("emiss") || desc.includes("sox") || desc.includes("nox") || desc.includes("annex vi")) annex = "annexVI";

          annexMap[annex].total++;
          if (item.status === "compliant" || item.status === "completed" || item.status === "ok") {
            annexMap[annex].compliant++;
          }
        });

        const scores: Record<string, number> = {};
        let totalCompliant = 0;
        let totalItems = 0;
        for (const [key, val] of Object.entries(annexMap)) {
          scores[key] = val.total > 0 ? Math.round((val.compliant / val.total) * 100) : 100;
          totalCompliant += val.compliant;
          totalItems += val.total;
        }
        scores.overall = totalItems > 0 ? Math.round((totalCompliant / totalItems) * 100) : 100;
        return scores;
      }

      return null;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Waste/discharge logs from logs table
  const wasteQuery = useQuery({
    queryKey: ["marpol-waste-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .or("module.eq.waste,module.eq.discharge,module.ilike.%marpol%")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        return data.map((log) => {
          const meta = (log.metadata as Record<string, unknown>) || {};
          return {
            id: log.id,
            type: (meta.type as string) || log.message || "Descarte",
            quantity: (meta.quantity as string) || "N/A",
            lastDischarge: (meta.location as string) || "Porto",
            date: log.created_at?.split("T")[0] || "",
            method: (meta.method as string) || "Port Reception",
          };
        });
      }
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Emissions from equipment_sensors or vessel_performance
  const emissionsQuery = useQuery({
    queryKey: ["marpol-emissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_sensors")
        .select("*")
        .or("sensor_type.ilike.%sox%,sensor_type.ilike.%nox%,sensor_type.ilike.%co2%,sensor_type.ilike.%emission%")
        .limit(10);

      if (!error && data && data.length > 0) {
        const result: Record<string, number> = { sox: 0, nox: 0, co2: 0, pm: 0 };
        data.forEach((s) => {
          const type = (s.sensor_type || "").toLowerCase();
          if (type.includes("sox")) result.sox = s.value || 0;
          else if (type.includes("nox")) result.nox = s.value || 0;
          else if (type.includes("co2")) result.co2 = s.value || 0;
          else if (type.includes("pm") || type.includes("particul")) result.pm = s.value || 0;
        });
        return result;
      }
      return null;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Tracking alerts for MARPOL
  const alertsQuery = useQuery({
    queryKey: ["marpol-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracking_alerts")
        .select("*")
        .eq("is_resolved", false)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        return data.map((a) => ({
          id: a.id,
          type: a.severity === "critical" ? "warning" : "info",
          message: a.description || a.alert_type || "Alerta MARPOL",
          time: a.created_at ? new Date(a.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "",
        }));
      }
      return [];
    },
    staleTime: 1000 * 60 * 2,
  });

  return {
    compliance: complianceQuery.data,
    wasteLogs: wasteQuery.data || [],
    emissions: emissionsQuery.data,
    alerts: alertsQuery.data || [],
    isLoading: complianceQuery.isLoading || wasteQuery.isLoading,
    refetch: () => {
      complianceQuery.refetch();
      wasteQuery.refetch();
      emissionsQuery.refetch();
      alertsQuery.refetch();
    },
  };
}

const MARPOLTrackerPage = () => {
  const { compliance, wasteLogs, emissions, alerts, isLoading, refetch } = useMARPOLData();

  const complianceStatus = compliance || {
    overall: 0, annexI: 0, annexII: 0, annexIII: 0, annexIV: 0, annexV: 0, annexVI: 0,
  };

  const emissionsData = emissions || { sox: 0, nox: 0, co2: 0, pm: 0 };

  const getAnnexName = (annex: string) => {
    const names: Record<string, string> = {
      annexI: "Anexo I - Óleo",
      annexII: "Anexo II - NLS",
      annexIII: "Anexo III - Substâncias Nocivas",
      annexIV: "Anexo IV - Esgoto",
      annexV: "Anexo V - Lixo",
      annexVI: "Anexo VI - Emissões"
    };
    return names[annex] || annex;
  };

  if (isLoading) {
    return <ShipLoader size="lg" className="h-96" />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Leaf className="h-8 w-8 text-success" />
            MARPOL Compliance Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento ambiental e compliance em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Badge variant="outline" className="gap-2 py-1.5">
            <Activity className="h-4 w-4 text-success animate-pulse" />
            Monitoramento Ativo
          </Badge>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* Overall Compliance */}
      <Card className="bg-gradient-to-br from-success/10 to-success/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Compliance Geral MARPOL</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Status em tempo real de todos os 6 Anexos
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">SOx</p>
                  <p className={`text-lg font-bold ${emissionsData.sox <= 0.1 ? "text-success" : "text-destructive"}`}>
                    {emissionsData.sox || "—"}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NOx</p>
                  <p className={`text-lg font-bold ${emissionsData.nox <= 14.4 ? "text-success" : "text-warning"}`}>
                    {emissionsData.nox || "—"} g/kWh
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CO₂</p>
                  <p className="text-lg font-bold text-primary">
                    {emissionsData.co2 || "—"} kg/nm
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="none" className="text-muted" />
                  <circle 
                    cx="56" cy="56" r="48" 
                    stroke="currentColor" 
                    strokeWidth="10" 
                    fill="none" 
                    strokeDasharray={`${complianceStatus.overall * 3.02} 302`}
                    className="text-success"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{complianceStatus.overall}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Annexes Status */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(complianceStatus).filter(([key]) => key !== "overall").map(([annex, score]) => (
          <Card key={annex}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{getAnnexName(annex)}</p>
                <p className={`text-xl font-bold ${
                  score >= 95 ? "text-success" :
                  score >= 85 ? "text-warning" : "text-destructive"
                }`}>{score}%</p>
                <Progress value={score} className="h-1.5 mt-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    alert.type === "warning" ? "bg-warning/10" : "bg-primary/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-4 w-4 ${
                      alert.type === "warning" ? "text-warning" : "text-primary"
                    }`} />
                    <span>{alert.message}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{alert.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="waste" className="space-y-6">
        <TabsList>
          <TabsTrigger value="waste">Resíduos & Descargas</TabsTrigger>
          <TabsTrigger value="emissions">Emissões (Anexo VI)</TabsTrigger>
          <TabsTrigger value="zones">Zonas Especiais</TabsTrigger>
          <TabsTrigger value="records">ORB & GRB</TabsTrigger>
        </TabsList>

        <TabsContent value="waste">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Registro de Resíduos e Descargas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {wasteLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">Nenhum registro de descarte encontrado</p>
                  <p className="text-sm">Registros aparecerão aqui quando descargas forem documentadas.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {wasteLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{log.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.quantity} - {log.method}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{log.lastDischarge}</p>
                        <p className="text-sm text-muted-foreground">{log.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emissions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5" />
                  Emissões em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>SOx (Teor de Enxofre)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{emissionsData.sox || "—"}%</span>
                      <Badge className="bg-success text-success-foreground">Limite: 0.50%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>NOx (Tier III)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{emissionsData.nox || "—"} g/kWh</span>
                      <Badge className="bg-success text-success-foreground">Limite: 14.4</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CO₂ Intensity</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{emissionsData.co2 || "—"} kg/nm</span>
                      <Badge variant="outline">CII Rating</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Material Particulado</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{emissionsData.pm || "—"} g/kWh</span>
                      <Badge className="bg-success text-success-foreground">OK</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Combustível em Uso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">VLSFO 0.50%</span>
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Conforme IMO 2020 Global Cap
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">MGO 0.10% (ECA)</span>
                      <Badge variant="outline">Reserva</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Para uso em ECAs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Zonas Especiais & ECAs
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <Waves className="h-16 w-16 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">Mapa de Zonas MARPOL</h3>
                <p className="text-muted-foreground max-w-md">
                  Visualização de ECAs, SECA, zonas de descarga proibida 
                  e requisitos específicos por área geográfica.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Oil Record Book & Garbage Record Book</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">Oil Record Book (ORB)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Registro de operações com óleo e lastro
                  </p>
                  <Button variant="outline" className="w-full">
                    Adicionar Entrada
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">Garbage Record Book (GRB)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Registro de descartes conforme Anexo V
                  </p>
                  <Button variant="outline" className="w-full">
                    Adicionar Entrada
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MARPOLTrackerPage;
