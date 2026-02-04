/**
 * Fuel Management Page - Gestão de Combustível Premium
 * PATCH: Módulo completo de bunker e consumo
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Fuel, TrendingUp, TrendingDown, AlertTriangle, Ship, 
  DollarSign, BarChart3, Calendar, FileText, Droplets,
  Gauge, Thermometer, Clock, MapPin, Plus
} from "lucide-react";

// Mock data for fuel tanks
const fuelTanks = [
  { id: 1, name: "HFO Tank P1", type: "HFO", capacity: 500, current: 420, unit: "MT", temp: 42 },
  { id: 2, name: "HFO Tank P2", type: "HFO", capacity: 500, current: 380, unit: "MT", temp: 41 },
  { id: 3, name: "MGO Tank S1", type: "MGO", capacity: 200, current: 165, unit: "MT", temp: 28 },
  { id: 4, name: "MGO Tank S2", type: "MGO", capacity: 200, current: 180, unit: "MT", temp: 27 },
  { id: 5, name: "LSFO Tank C1", type: "LSFO", capacity: 300, current: 245, unit: "MT", temp: 35 },
];

const bunkerHistory = [
  { id: 1, date: "2026-02-01", port: "Rotterdam", type: "HFO", quantity: 450, price: 485, supplier: "Shell Marine" },
  { id: 2, date: "2026-01-28", port: "Singapore", type: "MGO", quantity: 180, price: 720, supplier: "BP Marine" },
  { id: 3, date: "2026-01-15", port: "Fujairah", type: "LSFO", quantity: 320, price: 590, supplier: "ADNOC" },
];

export default function FuelManagementPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const totalCapacity = fuelTanks.reduce((acc, t) => acc + t.capacity, 0);
  const totalCurrent = fuelTanks.reduce((acc, t) => acc + t.current, 0);
  const fillPercentage = Math.round((totalCurrent / totalCapacity) * 100);

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Fuel className="h-8 w-8 text-primary" />
            Gestão de Combustível
          </h1>
          <p className="text-muted-foreground">
            Bunker Operations, Consumo & Otimização
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Bunker Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Bunker
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total em Tanques</p>
                <p className="text-2xl font-bold">{totalCurrent.toLocaleString()} MT</p>
                <p className="text-xs text-muted-foreground">{fillPercentage}% capacidade</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Droplets className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consumo Médio/Dia</p>
                <p className="text-2xl font-bold">28.5 MT</p>
                <div className="flex items-center text-xs text-success">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -3.2% vs mês anterior
                </div>
              </div>
              <div className="p-3 rounded-full bg-success/10">
                <Gauge className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Bunker YTD</p>
                <p className="text-2xl font-bold">$1.2M</p>
                <div className="flex items-center text-xs text-destructive">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.5% vs ano anterior
                </div>
              </div>
              <div className="p-3 rounded-full bg-warning/10">
                <DollarSign className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Autonomia Estimada</p>
                <p className="text-2xl font-bold">48 dias</p>
                <p className="text-xs text-muted-foreground">@ velocidade atual</p>
              </div>
              <div className="p-3 rounded-full bg-info/10">
                <Clock className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tanks">Tanques</TabsTrigger>
          <TabsTrigger value="bunker">Bunker Ops</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Tank Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Visão Geral dos Tanques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fuelTanks.map(tank => {
                  const fill = Math.round((tank.current / tank.capacity) * 100);
                  const isLow = fill < 30;
                  return (
                    <div key={tank.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{tank.name}</span>
                          <Badge variant="outline" className="text-xs">{tank.type}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Thermometer className="h-3 w-3 text-muted-foreground" />
                          <span>{tank.temp}°C</span>
                          {isLow && <AlertTriangle className="h-4 w-4 text-warning" />}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={fill} className="flex-1" />
                        <span className="text-sm font-medium w-20 text-right">
                          {tank.current}/{tank.capacity} MT
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Bunker Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Últimas Operações de Bunker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bunkerHistory.map(op => (
                    <div key={op.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{op.port}</span>
                          <Badge variant="secondary" className="text-xs">{op.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{op.supplier}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{op.quantity} MT</p>
                        <p className="text-sm text-muted-foreground">${op.price}/MT</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tanks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Tanques</CardTitle>
              <CardDescription>Gerenciamento detalhado de todos os tanques de combustível</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {fuelTanks.map(tank => {
                  const fill = Math.round((tank.current / tank.capacity) * 100);
                  return (
                    <Card key={tank.id} className="bg-muted/30">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold">{tank.name}</h3>
                            <Badge>{tank.type}</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{fill}%</p>
                          </div>
                        </div>
                        <Progress value={fill} className="mb-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{tank.current} MT</span>
                          <span>Cap: {tank.capacity} MT</span>
                        </div>
                        <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3" /> {tank.temp}°C
                          </span>
                          <Button variant="ghost" size="sm">Detalhes</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bunker" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Bunker</CardTitle>
              <CardDescription>Todas as operações de abastecimento registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Data</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Porto</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Fornecedor</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Quantidade</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Preço/MT</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bunkerHistory.map(op => (
                      <tr key={op.id} className="border-t">
                        <td className="px-4 py-3 text-sm">{op.date}</td>
                        <td className="px-4 py-3 text-sm">{op.port}</td>
                        <td className="px-4 py-3"><Badge variant="outline">{op.type}</Badge></td>
                        <td className="px-4 py-3 text-sm">{op.supplier}</td>
                        <td className="px-4 py-3 text-sm text-right">{op.quantity} MT</td>
                        <td className="px-4 py-3 text-sm text-right">${op.price}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          ${(op.quantity * op.price).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics de Consumo
              </CardTitle>
              <CardDescription>Análise de consumo e custos de combustível</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Consumo por Tipo</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>HFO (Heavy Fuel Oil)</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <Progress value={65} />
                    <div className="flex items-center justify-between">
                      <span>MGO (Marine Gas Oil)</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <Progress value={25} />
                    <div className="flex items-center justify-between">
                      <span>LSFO (Low Sulfur)</span>
                      <span className="font-medium">10%</span>
                    </div>
                    <Progress value={10} />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Métricas de Eficiência</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-success">94.2%</p>
                      <p className="text-sm text-muted-foreground">Eficiência do Motor</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">12.4</p>
                      <p className="text-sm text-muted-foreground">MT/1000nm</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-warning">$542</p>
                      <p className="text-sm text-muted-foreground">Preço Médio/MT</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-info">-5.3%</p>
                      <p className="text-sm text-muted-foreground">vs Budget</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
