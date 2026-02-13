/**
 * SGA Completo - Sistema de Gestão Ambiental
 * MARPOL Annexes I-VI, Ballast Water, ISO 14001, Carbon Footprint
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Leaf,
  Droplets,
  Wind,
  Trash2,
  Ship,
  AlertTriangle,
  CheckCircle,
  FileText,
  TrendingUp,
  TrendingDown,
  Brain,
  Download,
  RefreshCw,
  Target,
  Waves,
  Flame,
  Gauge,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";

interface WasteRecord {
  id: string;
  type: string;
  marpolAnnex: string;
  quantity: number;
  unit: string;
  disposalMethod: string;
  date: Date;
  port: string;
  certificate: string;
}

interface BallastWaterRecord {
  id: string;
  operation: "intake" | "discharge" | "exchange";
  volume: number;
  position: { lat: number; lng: number };
  date: Date;
  salinity: number;
  temperature: number;
  compliant: boolean;
}

interface EmissionData {
  month: string;
  co2: number;
  sox: number;
  nox: number;
  pm: number;
}

const MARPOL_ANNEXES = [
  { id: "I", title: "Óleo", description: "Prevenção da poluição por óleo", icon: Droplets },
  { id: "II", title: "Substâncias Nocivas", description: "Substâncias líquidas nocivas a granel", icon: AlertTriangle },
  { id: "III", title: "Substâncias Embaladas", description: "Substâncias nocivas em embalagens", icon: Trash2 },
  { id: "IV", title: "Esgoto", description: "Prevenção da poluição por esgoto", icon: Waves },
  { id: "V", title: "Lixo", description: "Prevenção da poluição por lixo", icon: Trash2 },
  { id: "VI", title: "Emissões", description: "Prevenção da poluição do ar", icon: Wind }
];

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

export function SGACompleto() {
  const [activeTab, setActiveTab] = useState("overview");
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([
    {
      id: "w1",
      type: "Óleo Usado",
      marpolAnnex: "I",
      quantity: 2500,
      unit: "L",
      disposalMethod: "Empresa autorizada",
      date: new Date("2024-12-15"),
      port: "Santos",
      certificate: "CERT-2024-001"
    },
    {
      id: "w2",
      type: "Lixo Plástico",
      marpolAnnex: "V",
      quantity: 180,
      unit: "kg",
      disposalMethod: "Reciclagem",
      date: new Date("2024-12-20"),
      port: "Rio de Janeiro",
      certificate: "CERT-2024-002"
    },
    {
      id: "w3",
      type: "Resíduos Alimentares",
      marpolAnnex: "V",
      quantity: 450,
      unit: "kg",
      disposalMethod: "Compostagem",
      date: new Date("2024-12-22"),
      port: "Vitória",
      certificate: "CERT-2024-003"
    }
  ]);

  const [ballastRecords, setBallastRecords] = useState<BallastWaterRecord[]>([
    {
      id: "bw1",
      operation: "intake",
      volume: 12000,
      position: { lat: -23.9618, lng: -46.3322 },
      date: new Date("2024-12-10"),
      salinity: 35.2,
      temperature: 24.5,
      compliant: true
    },
    {
      id: "bw2",
      operation: "exchange",
      volume: 12000,
      position: { lat: -22.1234, lng: -40.5678 },
      date: new Date("2024-12-18"),
      salinity: 36.1,
      temperature: 26.2,
      compliant: true
    }
  ]);

  const emissionsData: EmissionData[] = [
    { month: "Jul", co2: 245, sox: 2.8, nox: 8.2, pm: 0.5 },
    { month: "Ago", co2: 258, sox: 2.9, nox: 8.5, pm: 0.6 },
    { month: "Set", co2: 232, sox: 2.5, nox: 7.8, pm: 0.4 },
    { month: "Out", co2: 268, sox: 3.0, nox: 8.8, pm: 0.6 },
    { month: "Nov", co2: 241, sox: 2.6, nox: 8.0, pm: 0.5 },
    { month: "Dez", co2: 235, sox: 2.4, nox: 7.6, pm: 0.4 }
  ];

  const carbonFootprintByVoyage = [
    { voyage: "VY-2024-045", distance: 1250, fuel: 185, co2: 582, efficiency: 0.47 },
    { voyage: "VY-2024-046", distance: 980, fuel: 142, co2: 447, efficiency: 0.46 },
    { voyage: "VY-2024-047", distance: 1580, fuel: 248, co2: 780, efficiency: 0.49 },
    { voyage: "VY-2024-048", distance: 720, fuel: 98, co2: 308, efficiency: 0.43 }
  ];

  const wasteByType = [
    { name: "Óleo (Anexo I)", value: 35 },
    { name: "Lixo (Anexo V)", value: 40 },
    { name: "Esgoto (Anexo IV)", value: 15 },
    { name: "Emissões (Anexo VI)", value: 10 }
  ];

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case "intake": return "bg-blue-500";
      case "discharge": return "bg-orange-500";
      case "exchange": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const calculateCII = () => {
    const totalCO2 = emissionsData.reduce((sum, d) => sum + d.co2, 0);
    const avgEfficiency = 0.46;
    if (avgEfficiency < 0.42) return { rating: "A", color: "bg-success" };
    if (avgEfficiency < 0.46) return { rating: "B", color: "bg-success/80" };
    if (avgEfficiency < 0.50) return { rating: "C", color: "bg-warning" };
    if (avgEfficiency < 0.54) return { rating: "D", color: "bg-warning/80" };
    return { rating: "E", color: "bg-destructive" };
  };

  const cii = calculateCII();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-success/20 to-success/10 rounded-xl">
            <Leaf className="h-6 w-6 text-success" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Sistema de Gestão Ambiental
              <Badge className="bg-gradient-to-r from-success to-success/80">
                ISO 14001 + MARPOL
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Compliance ambiental completo • Gestão de resíduos • Água de lastro • Emissões
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Relatório IMO
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Gerar DCS
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className={`w-12 h-12 rounded-full ${cii.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-xl">{cii.rating}</span>
              </div>
              <div>
                <p className="text-sm font-medium">CII Rating</p>
                <p className="text-xs text-muted-foreground">Carbon Intensity</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">1,479</p>
                <p className="text-xs text-muted-foreground">Ton CO₂ (YTD)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-xs text-muted-foreground">Resíduos conformes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Waves className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-muted-foreground">BWM Compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">-8%</p>
                <p className="text-xs text-muted-foreground">vs Ano anterior</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="marpol">
            <Ship className="h-4 w-4 mr-2" />
            MARPOL
          </TabsTrigger>
          <TabsTrigger value="waste">
            <Trash2 className="h-4 w-4 mr-2" />
            Resíduos
          </TabsTrigger>
          <TabsTrigger value="ballast">
            <Waves className="h-4 w-4 mr-2" />
            Água de Lastro
          </TabsTrigger>
          <TabsTrigger value="emissions">
            <Wind className="h-4 w-4 mr-2" />
            Emissões
          </TabsTrigger>
          <TabsTrigger value="footprint">
            <Leaf className="h-4 w-4 mr-2" />
            Carbon Footprint
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Distribuição de Resíduos por MARPOL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={wasteByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {wasteByType.map((entry, index) => (
                          <Cell key={`waste-cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Emissões Mensais (Ton)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={emissionsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="co2" name="CO₂" stackId="1" stroke="#ef4444" fill="#ef444440" />
                      <Area type="monotone" dataKey="nox" name="NOx" stackId="2" stroke="#f97316" fill="#f9731640" />
                      <Area type="monotone" dataKey="sox" name="SOx" stackId="3" stroke="#eab308" fill="#eab30840" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* MARPOL Annexes Tab */}
        <TabsContent value="marpol" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MARPOL_ANNEXES.map((annex) => {
              const IconComponent = annex.icon;
              return (
                <Card key={annex.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">Anexo {annex.id}</CardTitle>
                        <CardDescription>{annex.title}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-3">{annex.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-500/20 text-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Conforme
                      </Badge>
                      <Button size="sm" variant="outline">
                        Ver registros
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Waste Management Tab */}
        <TabsContent value="waste" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Registros de Resíduos</CardTitle>
                <Button size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Novo Registro
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {wasteRecords.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Anexo {record.marpolAnnex}</Badge>
                            <span className="font-medium">{record.type}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{record.quantity} {record.unit}</span>
                            <span>{record.port}</span>
                            <span>{record.date.toLocaleDateString("pt-BR")}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-500/20 text-green-500">{record.disposalMethod}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{record.certificate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ballast Water Tab */}
        <TabsContent value="ballast" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestão de Água de Lastro</CardTitle>
                  <CardDescription>BWM Convention Compliance</CardDescription>
                </div>
                <Button size="sm">
                  <Waves className="h-4 w-4 mr-2" />
                  Nova Operação
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {ballastRecords.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getOperationColor(record.operation)} text-white`}>
                              {record.operation === "intake" ? "Captação" : 
                               record.operation === "discharge" ? "Descarga" : "Troca"}
                            </Badge>
                            <span className="font-medium">{record.volume.toLocaleString()} m³</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>Lat: {record.position.lat.toFixed(4)}, Lng: {record.position.lng.toFixed(4)}</span>
                            <span>Salinidade: {record.salinity} ‰</span>
                            <span>Temp: {record.temperature}°C</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {record.compliant ? (
                            <Badge className="bg-green-500/20 text-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Conforme
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Não Conforme
                            </Badge>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {record.date.toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emissions Tab */}
        <TabsContent value="emissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Emissões - MARPOL Anexo VI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emissionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="co2" name="CO₂ (ton)" fill="#ef4444" />
                    <Bar dataKey="nox" name="NOx (ton)" fill="#f97316" />
                    <Bar dataKey="sox" name="SOx (ton)" fill="#eab308" />
                    <Bar dataKey="pm" name="PM (ton)" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Carbon Footprint Tab */}
        <TabsContent value="footprint" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carbon Footprint por Viagem</CardTitle>
              <CardDescription>Análise de eficiência e emissões por viagem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carbonFootprintByVoyage.map((voyage) => (
                  <div key={voyage.voyage} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{voyage.voyage}</span>
                      <Badge variant="outline">{voyage.distance} NM</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Combustível</p>
                        <p className="font-bold">{voyage.fuel} ton</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">CO₂ Emitido</p>
                        <p className="font-bold">{voyage.co2} ton</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Eficiência</p>
                        <p className="font-bold">{voyage.efficiency} ton/NM</p>
                      </div>
                      <div>
                        <Progress value={(1 - voyage.efficiency) * 200} className="h-2 mt-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SGACompleto;
