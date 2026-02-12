/**
 * MARPOL Tracker Page
 * Monitoramento ambiental e compliance MARPOL em tempo real
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Leaf, Waves, Fuel, Trash2, AlertTriangle, 
  CheckCircle, FileText, Map, Activity, Ship
} from "lucide-react";

const MARPOLTrackerPage = () => {
  const complianceStatus = {
    overall: 94,
    annexI: 98,
    annexII: 95,
    annexIII: 100,
    annexIV: 92,
    annexV: 88,
    annexVI: 96
  };

  const emissions = {
    sox: 0.08, // % sulfur
    nox: 12.4, // g/kWh
    co2: 3.12, // kg/nm
    pm: 0.02 // g/kWh
  };

  const wasteLogs = [
    { type: "Óleo (Anexo I)", quantity: "2.3 m³", lastDischarge: "Singapore", date: "2024-01-12", method: "Port Reception" },
    { type: "Químicos (Anexo II)", quantity: "0.8 m³", lastDischarge: "Rotterdam", date: "2024-01-05", method: "Port Reception" },
    { type: "Lixo (Anexo V)", quantity: "1.2 m³", lastDischarge: "Singapore", date: "2024-01-14", method: "Port Reception" },
    { type: "Esgoto (Anexo IV)", quantity: "15 m³", lastDischarge: "Alto Mar", date: "2024-01-15", method: "Tratado" }
  ];

  const alerts = [
    { id: 1, type: "warning", message: "Entrando em ECA em 12 horas - verificar teor de enxofre", time: "Agora" },
    { id: 2, type: "info", message: "ORB precisa ser atualizado com última operação de lastro", time: "2h atrás" }
  ];

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Leaf className="h-8 w-8 text-green-500" />
            MARPOL Compliance Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento ambiental e compliance em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5">
            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
            Monitoramento Ativo
          </Badge>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* Overall Compliance */}
      <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
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
                  <p className={`text-lg font-bold ${emissions.sox <= 0.1 ? "text-green-500" : "text-red-500"}`}>
                    {emissions.sox}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NOx</p>
                  <p className={`text-lg font-bold ${emissions.nox <= 14.4 ? "text-green-500" : "text-yellow-500"}`}>
                    {emissions.nox} g/kWh
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CO₂</p>
                  <p className="text-lg font-bold text-blue-500">
                    {emissions.co2} kg/nm
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
                    className="text-green-500"
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
                  score >= 95 ? "text-green-500" :
                  score >= 85 ? "text-yellow-500" : "text-red-500"
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
                    alert.type === "warning" ? "bg-yellow-500/10" : "bg-blue-500/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-4 w-4 ${
                      alert.type === "warning" ? "text-yellow-500" : "text-blue-500"
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

      <Tabs defaultValue="emissions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="emissions">Emissões (Anexo VI)</TabsTrigger>
          <TabsTrigger value="waste">Resíduos & Descargas</TabsTrigger>
          <TabsTrigger value="zones">Zonas Especiais</TabsTrigger>
          <TabsTrigger value="records">ORB & GRB</TabsTrigger>
        </TabsList>

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
                      <span className="font-bold">{emissions.sox}%</span>
                      <Badge className="bg-green-500">Limite: 0.50%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>NOx (Tier III)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{emissions.nox} g/kWh</span>
                      <Badge className="bg-green-500">Limite: 14.4</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CO₂ Intensity</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{emissions.co2} kg/nm</span>
                      <Badge variant="outline">CII Rating: B</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Material Particulado</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{emissions.pm} g/kWh</span>
                      <Badge className="bg-green-500">OK</Badge>
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
                      <CheckCircle className="h-5 w-5 text-green-500" />
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

        <TabsContent value="waste">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Registro de Resíduos e Descargas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wasteLogs.map((log, idx) => (
                  <div key={`waste-${idx}-${log.type}`} className="flex items-center justify-between p-3 border rounded-lg">
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
            </CardContent>
          </Card>
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
                    Última entrada: 14 Jan 2024
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
                    Última entrada: 14 Jan 2024
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
