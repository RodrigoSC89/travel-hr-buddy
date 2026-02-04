/**
 * Waste Management Dashboard - Premium MARPOL Compliance
 * Gestão de resíduos e conformidade ambiental
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trash2,
  Droplet,
  Leaf,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Ship,
  Calendar,
  MapPin,
  Download,
  Plus,
  BarChart3,
  Gauge,
  Anchor,
  RefreshCw,
  Waves,
  FlaskConical,
  Recycle,
  ClipboardList,
  PenTool,
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WasteTank {
  id: string;
  name: string;
  type: "sludge" | "bilge" | "sewage" | "garbage" | "cargo_residue";
  capacity: number;
  currentLevel: number;
  unit: string;
  vessel: string;
  lastDischarge: string;
  status: "ok" | "warning" | "critical";
}

interface DischargeRecord {
  id: string;
  vessel: string;
  type: string;
  quantity: number;
  unit: string;
  method: "port" | "sea" | "incineration" | "transfer";
  location: string;
  date: string;
  signedBy: string;
  oilRecordBook: boolean;
  garbageRecordBook: boolean;
}

interface RecordBookEntry {
  id: string;
  bookType: "ORB" | "GRB";
  vessel: string;
  operationType: string;
  date: string;
  quantity: string;
  position: string;
  remarks: string;
  signedBy: string;
  status: "draft" | "signed" | "verified";
}

// Mock data
const mockTanks: WasteTank[] = [
  { id: "1", name: "Tanque de Lodo #1", type: "sludge", capacity: 50, currentLevel: 42, unit: "m³", vessel: "MV Atlantic Star", lastDischarge: "2024-01-10", status: "warning" },
  { id: "2", name: "Tanque de Água de Lastro", type: "bilge", capacity: 100, currentLevel: 35, unit: "m³", vessel: "MV Atlantic Star", lastDischarge: "2024-01-12", status: "ok" },
  { id: "3", name: "Tanque de Esgoto", type: "sewage", capacity: 30, currentLevel: 28, unit: "m³", vessel: "MV Pacific Dream", lastDischarge: "2024-01-08", status: "critical" },
  { id: "4", name: "Compactador de Lixo", type: "garbage", capacity: 20, currentLevel: 8, unit: "m³", vessel: "MV Pacific Dream", lastDischarge: "2024-01-15", status: "ok" },
  { id: "5", name: "Resíduo de Carga", type: "cargo_residue", capacity: 40, currentLevel: 12, unit: "m³", vessel: "MV Ocean Pride", lastDischarge: "2024-01-05", status: "ok" },
];

const mockDischarges: DischargeRecord[] = [
  { id: "1", vessel: "MV Atlantic Star", type: "Sludge", quantity: 15, unit: "m³", method: "port", location: "Porto de Santos", date: "2024-01-10", signedBy: "Cap. João Silva", oilRecordBook: true, garbageRecordBook: false },
  { id: "2", vessel: "MV Pacific Dream", type: "Garbage - Plastics", quantity: 0.5, unit: "m³", method: "port", location: "Rio de Janeiro", date: "2024-01-15", signedBy: "Cap. Carlos Santos", oilRecordBook: false, garbageRecordBook: true },
  { id: "3", vessel: "MV Atlantic Star", type: "Bilge Water", quantity: 8, unit: "m³", method: "sea", location: "Lat -24.5, Lon -45.2", date: "2024-01-12", signedBy: "Cap. João Silva", oilRecordBook: true, garbageRecordBook: false },
  { id: "4", vessel: "MV Ocean Pride", type: "Food Waste", quantity: 0.3, unit: "m³", method: "sea", location: "Lat -25.1, Lon -48.0", date: "2024-01-14", signedBy: "Cap. Pedro Costa", oilRecordBook: false, garbageRecordBook: true },
];

const mockRecordBooks: RecordBookEntry[] = [
  { id: "1", bookType: "ORB", vessel: "MV Atlantic Star", operationType: "Descarga de lodo em porto", date: "2024-01-10", quantity: "15.0 m³", position: "Porto de Santos", remarks: "Recebido por empresa autorizada", signedBy: "Cap. João Silva", status: "verified" },
  { id: "2", bookType: "ORB", vessel: "MV Atlantic Star", operationType: "Descarga de água oleosa no mar", date: "2024-01-12", quantity: "8.0 m³", position: "24°30'S 045°12'W", remarks: "Através do separador 15ppm", signedBy: "Cap. João Silva", status: "signed" },
  { id: "3", bookType: "GRB", vessel: "MV Pacific Dream", operationType: "Entrega de plásticos em porto", date: "2024-01-15", quantity: "0.5 m³", position: "Rio de Janeiro", remarks: "Categoria A - Plásticos", signedBy: "Cap. Carlos Santos", status: "draft" },
];

const getTankIcon = (type: WasteTank["type"]) => {
  const icons = {
    "sludge": FlaskConical,
    "bilge": Droplet,
    "sewage": Waves,
    "garbage": Trash2,
    "cargo_residue": Recycle
  };
  return icons[type];
};

const getStatusColor = (status: WasteTank["status"]) => {
  const colors = {
    "ok": "text-emerald-600",
    "warning": "text-amber-600",
    "critical": "text-destructive"
  };
  return colors[status];
};

export default function WasteManagementDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const criticalTanks = mockTanks.filter(t => t.status === "critical").length;
  const warningTanks = mockTanks.filter(t => t.status === "warning").length;
  const totalDischarges = mockDischarges.length;
  const pendingSignatures = mockRecordBooks.filter(r => r.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conformidade MARPOL</p>
                <p className="text-3xl font-bold text-emerald-600">98%</p>
                <p className="text-xs text-emerald-600 mt-1">
                  Todos os anexos
                </p>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Leaf className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(criticalTanks > 0 && "border-destructive/50")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tanques Críticos</p>
                <p className={cn("text-3xl font-bold", criticalTanks > 0 ? "text-destructive" : "text-muted-foreground")}>
                  {criticalTanks}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {warningTanks} em alerta
                </p>
              </div>
              <div className={cn("p-3 rounded-xl", criticalTanks > 0 ? "bg-destructive/20" : "bg-muted")}>
                <AlertTriangle className={cn("h-6 w-6", criticalTanks > 0 ? "text-destructive" : "text-muted-foreground")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Descartes (Mês)</p>
                <p className="text-3xl font-bold">{totalDischarges}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Registrados
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Recycle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(pendingSignatures > 0 && "border-amber-500/50")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assinaturas Pend.</p>
                <p className={cn("text-3xl font-bold", pendingSignatures > 0 ? "text-amber-600" : "text-muted-foreground")}>
                  {pendingSignatures}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Diários de bordo
                </p>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <PenTool className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {criticalTanks > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Tanque(s) em Nível Crítico</p>
                <p className="text-sm text-muted-foreground">
                  {mockTanks.filter(t => t.status === "critical").map(t => `${t.name} (${t.vessel})`).join(", ")} - Agendar descarte imediatamente
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Agendar Descarte
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="tanks" className="gap-2">
              <Gauge className="h-4 w-4" />
              Tanques
            </TabsTrigger>
            <TabsTrigger value="discharges" className="gap-2">
              <Recycle className="h-4 w-4" />
              Descartes
            </TabsTrigger>
            <TabsTrigger value="orb" className="gap-2">
              <FileText className="h-4 w-4" />
              ORB - Oil Record
            </TabsTrigger>
            <TabsTrigger value="grb" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              GRB - Garbage
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Registro
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Níveis de Tanques */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Níveis de Tanques por Embarcação</CardTitle>
                <CardDescription>Monitoramento em tempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {["MV Atlantic Star", "MV Pacific Dream", "MV Ocean Pride"].map((vessel) => {
                    const vesselTanks = mockTanks.filter(t => t.vessel === vessel);
                    
                    return (
                      <div key={vessel} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Ship className="h-4 w-4 text-primary" />
                          <span className="font-medium">{vessel}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-6">
                          {vesselTanks.map((tank) => {
                            const percentage = (tank.currentLevel / tank.capacity) * 100;
                            const TankIcon = getTankIcon(tank.type);
                            
                            return (
                              <div key={tank.id} className={cn(
                                "p-3 rounded-lg border",
                                tank.status === "critical" && "border-destructive/50 bg-destructive/5",
                                tank.status === "warning" && "border-amber-500/50 bg-amber-500/5"
                              )}>
                                <div className="flex items-center gap-2 mb-2">
                                  <TankIcon className={cn("h-4 w-4", getStatusColor(tank.status))} />
                                  <span className="text-sm font-medium truncate">{tank.name}</span>
                                </div>
                                <Progress 
                                  value={percentage} 
                                  className={cn(
                                    "h-2",
                                    tank.status === "critical" && "[&>div]:bg-destructive",
                                    tank.status === "warning" && "[&>div]:bg-amber-500"
                                  )}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {tank.currentLevel}/{tank.capacity} {tank.unit} ({percentage.toFixed(0)}%)
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas MARPOL */}
            <Card>
              <CardHeader>
                <CardTitle>Conformidade por Anexo</CardTitle>
                <CardDescription>MARPOL 73/78</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Anexo I - Óleos", compliance: 100, color: "bg-emerald-500" },
                    { name: "Anexo II - Substâncias Nocivas", compliance: 98, color: "bg-emerald-500" },
                    { name: "Anexo IV - Esgoto", compliance: 95, color: "bg-amber-500" },
                    { name: "Anexo V - Lixo", compliance: 100, color: "bg-emerald-500" },
                    { name: "Anexo VI - Emissões", compliance: 97, color: "bg-emerald-500" },
                  ].map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.name}</span>
                        <span className={cn(
                          "font-medium",
                          item.compliance >= 98 ? "text-emerald-600" : "text-amber-600"
                        )}>
                          {item.compliance}%
                        </span>
                      </div>
                      <Progress value={item.compliance} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tanks" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTanks.map((tank) => {
              const percentage = (tank.currentLevel / tank.capacity) * 100;
              const TankIcon = getTankIcon(tank.type);
              
              return (
                <Card key={tank.id} className={cn(
                  tank.status === "critical" && "border-destructive/50 bg-destructive/5",
                  tank.status === "warning" && "border-amber-500/50 bg-amber-500/5"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          tank.status === "critical" ? "bg-destructive/20" :
                          tank.status === "warning" ? "bg-amber-500/20" : "bg-primary/20"
                        )}>
                          <TankIcon className={cn("h-5 w-5", getStatusColor(tank.status))} />
                        </div>
                        <div>
                          <h4 className="font-medium">{tank.name}</h4>
                          <p className="text-sm text-muted-foreground">{tank.vessel}</p>
                        </div>
                      </div>
                      <Badge variant={
                        tank.status === "critical" ? "destructive" :
                        tank.status === "warning" ? "secondary" : "default"
                      }>
                        {tank.status === "critical" ? "Crítico" :
                         tank.status === "warning" ? "Alerta" : "Normal"}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Nível Atual</span>
                          <span className={cn("font-medium", getStatusColor(tank.status))}>
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className={cn(
                            "h-3",
                            tank.status === "critical" && "[&>div]:bg-destructive",
                            tank.status === "warning" && "[&>div]:bg-amber-500"
                          )}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {tank.currentLevel} / {tank.capacity} {tank.unit}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Último descarte:</span>
                        <span>{tank.lastDischarge}</span>
                      </div>
                    </div>

                    <Button 
                      variant={tank.status === "critical" ? "destructive" : "outline"} 
                      className="w-full mt-4" 
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Registrar Descarte
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="discharges" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Descartes</CardTitle>
              <CardDescription>Registros de descarte de resíduos</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {mockDischarges.map((discharge) => (
                    <div key={discharge.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-full",
                          discharge.method === "port" ? "bg-blue-500/20 text-blue-600" :
                          discharge.method === "sea" ? "bg-emerald-500/20 text-emerald-600" :
                          "bg-amber-500/20 text-amber-600"
                        )}>
                          {discharge.method === "port" ? <Anchor className="h-4 w-4" /> :
                           discharge.method === "sea" ? <Waves className="h-4 w-4" /> :
                           <Recycle className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{discharge.type}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Ship className="h-3 w-3" />
                            <span>{discharge.vessel}</span>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{discharge.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{discharge.quantity} {discharge.unit}</p>
                        <p className="text-sm text-muted-foreground">{discharge.date}</p>
                        <div className="flex gap-1 mt-1">
                          {discharge.oilRecordBook && (
                            <Badge variant="outline" className="text-xs">ORB</Badge>
                          )}
                          {discharge.garbageRecordBook && (
                            <Badge variant="outline" className="text-xs">GRB</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orb" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Oil Record Book - Parte I
                </CardTitle>
                <CardDescription>Registro de operações com óleos (MARPOL Anexo I)</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Entrada
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <div className="space-y-3">
                  {mockRecordBooks.filter(r => r.bookType === "ORB").map((entry) => (
                    <div key={entry.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">{entry.operationType}</p>
                          <p className="text-sm text-muted-foreground">{entry.vessel} • {entry.date}</p>
                        </div>
                        <Badge variant={
                          entry.status === "verified" ? "default" :
                          entry.status === "signed" ? "secondary" : "outline"
                        }>
                          {entry.status === "verified" ? "Verificado" :
                           entry.status === "signed" ? "Assinado" : "Rascunho"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantidade</span>
                          <p className="font-medium">{entry.quantity}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Posição</span>
                          <p className="font-medium">{entry.position}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Assinado por</span>
                          <p className="font-medium">{entry.signedBy}</p>
                        </div>
                      </div>
                      {entry.remarks && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Obs:</strong> {entry.remarks}
                        </p>
                      )}
                      {entry.status === "draft" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            <PenTool className="h-4 w-4 mr-2" />
                            Assinar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grb" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-emerald-600" />
                  Garbage Record Book
                </CardTitle>
                <CardDescription>Registro de lixo (MARPOL Anexo V)</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Entrada
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <div className="space-y-3">
                  {mockRecordBooks.filter(r => r.bookType === "GRB").map((entry) => (
                    <div key={entry.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">{entry.operationType}</p>
                          <p className="text-sm text-muted-foreground">{entry.vessel} • {entry.date}</p>
                        </div>
                        <Badge variant={
                          entry.status === "verified" ? "default" :
                          entry.status === "signed" ? "secondary" : "outline"
                        }>
                          {entry.status === "verified" ? "Verificado" :
                           entry.status === "signed" ? "Assinado" : "Rascunho"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantidade</span>
                          <p className="font-medium">{entry.quantity}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Posição</span>
                          <p className="font-medium">{entry.position}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Assinado por</span>
                          <p className="font-medium">{entry.signedBy}</p>
                        </div>
                      </div>
                      {entry.remarks && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Obs:</strong> {entry.remarks}
                        </p>
                      )}
                      {entry.status === "draft" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            <PenTool className="h-4 w-4 mr-2" />
                            Assinar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
