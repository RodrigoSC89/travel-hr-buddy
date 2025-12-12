/**
 * Subsea Operations - Módulo Unificado de Operações Submarinas
 * PATCH UNIFY-2.0 - Fusão dos módulos Subsea/Sonar
 * 
 * Módulos fundidos:
 * - ocean-sonar → Subsea Operations
 * - sonar-ai → Subsea Operations
 * - underwater-drone → Subsea Operations
 * - auto-sub → Subsea Operations
 * - deep-risk-ai → Subsea Operations
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Waves, 
  Radar, 
  Bot, 
  Navigation, 
  AlertTriangle, 
  Activity,
  ThermometerSun,
  Gauge,
  Eye,
  Video,
  Map,
  Anchor
} from "lucide-react";

interface SubseaAsset {
  id: string;
  name: string;
  type: "rov" | "auv" | "sonar" | "sensor";
  status: "active" | "standby" | "maintenance" | "offline";
  depth: number;
  battery: number;
  lastContact: Date;
}

interface SonarContact {
  id: string;
  type: string;
  distance: number;
  bearing: number;
  confidence: number;
  threat: "none" | "low" | "medium" | "high";
}

const SubseaOperations: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [assets] = useState<SubseaAsset[]>([
    { id: "1", name: "ROV-01 Neptune", type: "rov", status: "active", depth: 245, battery: 78, lastContact: new Date() },
    { id: "2", name: "AUV-03 Triton", type: "auv", status: "active", depth: 180, battery: 92, lastContact: new Date() },
    { id: "3", name: "Sonar Array Alpha", type: "sonar", status: "active", depth: 0, battery: 100, lastContact: new Date() },
    { id: "4", name: "ROV-02 Poseidon", type: "rov", status: "maintenance", depth: 0, battery: 45, lastContact: new Date() }
  ]);

  const [contacts] = useState<SonarContact[]>([
    { id: "1", type: "Estrutura Submarina", distance: 450, bearing: 45, confidence: 94, threat: "none" },
    { id: "2", type: "Vida Marinha", distance: 120, bearing: 180, confidence: 87, threat: "none" },
    { id: "3", type: "Objeto Desconhecido", distance: 890, bearing: 270, confidence: 62, threat: "low" }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
    case "active": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "standby": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "maintenance": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "offline": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getThreatColor = (threat: string) => {
    switch (threat) {
    case "high": return "text-red-400";
    case "medium": return "text-yellow-400";
    case "low": return "text-blue-400";
    default: return "text-green-400";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
            <Waves className="h-8 w-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Subsea Operations</h1>
            <p className="text-muted-foreground">Centro de Operações Submarinas Integrado</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
            <Radar className="h-3 w-3 animate-pulse" />
            Sonar Ativo
          </Badge>
          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-400 border-green-500/30">
            <Bot className="h-3 w-3" />
            IA Online
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="dashboard" className="gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="sonar" className="gap-2">
            <Radar className="h-4 w-4" />
            Sonar
          </TabsTrigger>
          <TabsTrigger value="rov" className="gap-2">
            <Navigation className="h-4 w-4" />
            ROV/AUV
          </TabsTrigger>
          <TabsTrigger value="risks" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Riscos
          </TabsTrigger>
          <TabsTrigger value="map" className="gap-2">
            <Map className="h-4 w-4" />
            Mapa 3D
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <Navigation className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ativos Ativos</p>
                    <p className="text-2xl font-bold">{assets.filter(a => a.status === "active").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Gauge className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profundidade Máx</p>
                    <p className="text-2xl font-bold">{Math.max(...assets.map(a => a.depth))}m</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Eye className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contatos Sonar</p>
                    <p className="text-2xl font-bold">{contacts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <ThermometerSun className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Temp. Água</p>
                    <p className="text-2xl font-bold">18.5°C</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assets Grid */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Anchor className="h-5 w-5 text-primary" />
                Frota Submarina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assets.map((asset) => (
                  <div key={asset.id} className="p-4 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-primary" />
                        <span className="font-medium">{asset.name}</span>
                      </div>
                      <Badge className={getStatusColor(asset.status)}>
                        {asset.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Profundidade</p>
                        <p className="font-medium">{asset.depth}m</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Bateria</p>
                        <div className="flex items-center gap-2">
                          <Progress value={asset.battery} className="flex-1 h-2" />
                          <span className="font-medium">{asset.battery}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sonar Tab */}
        <TabsContent value="sonar" className="space-y-6 mt-6">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radar className="h-5 w-5 text-cyan-400" />
                Contatos Sonar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="p-4 rounded-lg bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${contact.threat === "none" ? "bg-green-500/10" : "bg-yellow-500/10"}`}>
                        <Eye className={`h-5 w-5 ${getThreatColor(contact.threat)}`} />
                      </div>
                      <div>
                        <p className="font-medium">{contact.type}</p>
                        <p className="text-sm text-muted-foreground">
                          Distância: {contact.distance}m | Bearing: {contact.bearing}°
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{contact.confidence}% confiança</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sonar Display Placeholder */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-8">
              <div className="aspect-square max-w-md mx-auto relative rounded-full border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-600/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                </div>
                <div className="absolute inset-4 rounded-full border border-cyan-500/20" />
                <div className="absolute inset-8 rounded-full border border-cyan-500/20" />
                <div className="absolute inset-12 rounded-full border border-cyan-500/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Radar className="h-12 w-12 text-cyan-400 opacity-30" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROV/AUV Tab */}
        <TabsContent value="rov" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assets.filter(a => a.type === "rov" || a.type === "auv").map((asset) => (
              <Card key={asset.id} className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Navigation className="h-5 w-5" />
                      {asset.name}
                    </span>
                    <Badge className={getStatusColor(asset.status)}>{asset.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
                      <Video className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Profundidade</p>
                        <p className="text-xl font-bold">{asset.depth}m</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bateria</p>
                        <p className="text-xl font-bold">{asset.battery}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo</p>
                        <p className="text-xl font-bold uppercase">{asset.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" variant="outline" disabled={asset.status !== "active"}>
                        Controlar
                      </Button>
                      <Button className="flex-1" variant="outline" disabled={asset.status !== "active"}>
                        Missão Auto
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="space-y-6 mt-6">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                Análise de Riscos Submarinos (Deep Risk AI)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { risk: "Colisão com estrutura", level: 12, category: "navegação" },
                  { risk: "Falha de comunicação", level: 8, category: "sistemas" },
                  { risk: "Vida marinha perigosa", level: 5, category: "ambiente" },
                  { risk: "Condições adversas", level: 3, category: "meteorologia" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.risk}</span>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <Progress value={item.level} className="h-2" />
                    </div>
                    <span className={`font-bold ${item.level > 10 ? "text-yellow-400" : "text-green-400"}`}>
                      {item.level}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map" className="mt-6">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-8">
              <div className="aspect-video bg-gradient-to-b from-blue-900/20 to-blue-950/40 rounded-lg flex items-center justify-center border border-cyan-500/20">
                <div className="text-center">
                  <Map className="h-16 w-16 text-cyan-400/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Visualização 3D do Fundo Oceânico</p>
                  <p className="text-sm text-muted-foreground/70">Integração com batimetria em desenvolvimento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubseaOperations;
