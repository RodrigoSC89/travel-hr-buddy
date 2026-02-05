/**
 * FASE 2 - Combustível
 * ROB tracking, análise FIFO vs Média, alertas de bunker (benchmark: StormGeo/Bunker Planner)
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Fuel, TrendingUp, TrendingDown, AlertTriangle, 
  BarChart3, Calculator, Ship, MapPin, DollarSign
} from "lucide-react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Mock data
const robHistory = [
  { date: "01/02", hfo: 850, mgo: 120, lsfo: 0 },
  { date: "05/02", hfo: 780, mgo: 105, lsfo: 0 },
  { date: "10/02", hfo: 720, mgo: 95, lsfo: 0 },
  { date: "15/02", hfo: 650, mgo: 80, lsfo: 0 },
  { date: "20/02", hfo: 580, mgo: 70, lsfo: 0 },
  { date: "25/02", hfo: 520, mgo: 55, lsfo: 0 },
];

const consumptionData = [
  { mode: "Navegação", hfo: 45, mgo: 2 },
  { mode: "Manobra", hfo: 25, mgo: 3 },
  { mode: "Porto", hfo: 0, mgo: 5 },
  { mode: "DP", hfo: 35, mgo: 4 },
];

const bunkerPurchases = [
  { date: "2024-01-15", port: "Santos", type: "HFO", quantity: 500, price: 520, total: 260000 },
  { date: "2024-01-28", port: "Rotterdam", type: "MGO", quantity: 80, price: 890, total: 71200 },
  { date: "2024-02-10", port: "Singapore", type: "HFO", quantity: 600, price: 495, total: 297000 },
];

const fifoVsAverage = {
  fifo: {
    hfoPrice: 508,
    mgoPrice: 890,
    totalValue: 398500,
  },
  average: {
    hfoPrice: 512,
    mgoPrice: 885,
    totalValue: 402100,
  }
};

export default function FuelROBAnalytics() {
  const [selectedVessel, setSelectedVessel] = useState("mv-atlantico");
  const [valuationMethod, setValuationMethod] = useState<"fifo" | "average">("fifo");

  const currentROB = {
    hfo: 520,
    mgo: 55,
    lsfo: 0,
    capacity: { hfo: 1200, mgo: 200, lsfo: 0 }
  };

  const getPercentage = (current: number, capacity: number) => (current / capacity) * 100;

  return (
    <div className="space-y-6">
      {/* Vessel Selector */}
      <div className="flex items-center justify-between">
        <Select value={selectedVessel} onValueChange={setSelectedVessel}>
          <SelectTrigger className="w-[250px]">
            <Ship className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Selecionar embarcação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mv-atlantico">MV Atlântico Sul</SelectItem>
            <SelectItem value="psv-oceano">PSV Oceano Azul</SelectItem>
            <SelectItem value="ahts-mare">AHTS Maré Alta</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10">
            <Fuel className="h-3 w-3 mr-1" />
            ROB Atualizado
          </Badge>
        </div>
      </div>

      {/* ROB Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">HFO (Heavy Fuel Oil)</p>
                <p className="text-2xl font-bold">{currentROB.hfo} MT</p>
              </div>
              <Fuel className="h-8 w-8 text-amber-500 opacity-60" />
            </div>
            <Progress 
              value={getPercentage(currentROB.hfo, currentROB.capacity.hfo)} 
              className="h-2 [&>div]:bg-amber-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Capacidade: {currentROB.capacity.hfo} MT</span>
              <span>{getPercentage(currentROB.hfo, currentROB.capacity.hfo).toFixed(0)}%</span>
            </div>
            {getPercentage(currentROB.hfo, currentROB.capacity.hfo) < 30 && (
              <div className="flex items-center gap-1 text-xs text-warning mt-2">
                <AlertTriangle className="h-3 w-3" />
                Nível baixo - Programar bunkering
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">MGO (Marine Gas Oil)</p>
                <p className="text-2xl font-bold">{currentROB.mgo} MT</p>
              </div>
              <Fuel className="h-8 w-8 text-blue-500 opacity-60" />
            </div>
            <Progress 
              value={getPercentage(currentROB.mgo, currentROB.capacity.mgo)} 
              className="h-2 [&>div]:bg-blue-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Capacidade: {currentROB.capacity.mgo} MT</span>
              <span>{getPercentage(currentROB.mgo, currentROB.capacity.mgo).toFixed(0)}%</span>
            </div>
            {getPercentage(currentROB.mgo, currentROB.capacity.mgo) < 30 && (
              <div className="flex items-center gap-1 text-xs text-destructive mt-2">
                <AlertTriangle className="h-3 w-3" />
                Nível crítico!
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">LSFO (Low Sulfur)</p>
                <p className="text-2xl font-bold">{currentROB.lsfo} MT</p>
              </div>
              <Fuel className="h-8 w-8 text-green-500 opacity-60" />
            </div>
            <div className="text-center text-sm text-muted-foreground py-4">
              Não utilizado nesta embarcação
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Histórico ROB
          </TabsTrigger>
          <TabsTrigger value="consumption" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            Consumo
          </TabsTrigger>
          <TabsTrigger value="valuation" className="gap-2">
            <Calculator className="h-4 w-4" />
            Valoração FIFO/Média
          </TabsTrigger>
          <TabsTrigger value="purchases" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Compras Bunker
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução do ROB - Últimos 30 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={robHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="hfo" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="HFO (MT)" />
                  <Area type="monotone" dataKey="mgo" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="MGO (MT)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumption" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Consumo por Modo de Operação (MT/dia)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="mode" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hfo" fill="#f59e0b" name="HFO" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="mgo" fill="#3b82f6" name="MGO" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="valuation" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className={valuationMethod === "fifo" ? "border-2 border-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Método FIFO
                  <Button 
                    variant={valuationMethod === "fifo" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setValuationMethod("fifo")}
                  >
                    {valuationMethod === "fifo" ? "Selecionado" : "Selecionar"}
                  </Button>
                </CardTitle>
                <CardDescription>First In, First Out</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Custo HFO:</span>
                  <span className="font-bold">${fifoVsAverage.fifo.hfoPrice}/MT</span>
                </div>
                <div className="flex justify-between">
                  <span>Custo MGO:</span>
                  <span className="font-bold">${fifoVsAverage.fifo.mgoPrice}/MT</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span>Valor Total Estoque:</span>
                  <span className="font-bold text-lg">${fifoVsAverage.fifo.totalValue.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card className={valuationMethod === "average" ? "border-2 border-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Custo Médio
                  <Button 
                    variant={valuationMethod === "average" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setValuationMethod("average")}
                  >
                    {valuationMethod === "average" ? "Selecionado" : "Selecionar"}
                  </Button>
                </CardTitle>
                <CardDescription>Média Ponderada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Custo HFO:</span>
                  <span className="font-bold">${fifoVsAverage.average.hfoPrice}/MT</span>
                </div>
                <div className="flex justify-between">
                  <span>Custo MGO:</span>
                  <span className="font-bold">${fifoVsAverage.average.mgoPrice}/MT</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span>Valor Total Estoque:</span>
                  <span className="font-bold text-lg">${fifoVsAverage.average.totalValue.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-success" />
                <span>
                  Usando FIFO você economiza <strong className="text-success">${(fifoVsAverage.average.totalValue - fifoVsAverage.fifo.totalValue).toLocaleString()}</strong> na valoração do estoque atual.
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Histórico de Compras de Bunker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bunkerPurchases.map((purchase, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{purchase.port}</p>
                        <p className="text-sm text-muted-foreground">{purchase.date}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline">{purchase.type}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">{purchase.quantity} MT</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Preço</p>
                      <p className="font-medium">${purchase.price}/MT</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-bold">${purchase.total.toLocaleString()}</p>
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
