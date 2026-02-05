/**
 * FuelConsumptionDashboard - Dashboard de Consumo de Combustível
 * Enterprise-grade fuel management with bunker integration
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Fuel, Ship, TrendingUp, TrendingDown, AlertTriangle, 
  DollarSign, BarChart3, Droplets, Gauge, Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from "recharts";

interface VesselFuelData {
  vesselId: string;
  vesselName: string;
  voyageId: string;
  fuelType: "VLSFO" | "MGO" | "HSFO" | "LNG";
  rob: number; // Remaining on Board (MT)
  consumed: number; // Consumed this voyage (MT)
  averageDaily: number; // MT/day
  efficiency: number; // % vs baseline
  costPerTon: number;
  lastBunker: Date;
  nextBunkerEta: Date;
}

const mockVessels: VesselFuelData[] = [
  {
    vesselId: "v1",
    vesselName: "MV Atlantic Star",
    voyageId: "VOY-2024-001",
    fuelType: "VLSFO",
    rob: 850,
    consumed: 320,
    averageDaily: 28.5,
    efficiency: 94,
    costPerTon: 580,
    lastBunker: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    nextBunkerEta: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  },
  {
    vesselId: "v2",
    vesselName: "MV Pacific Dawn",
    voyageId: "VOY-2024-002",
    fuelType: "MGO",
    rob: 420,
    consumed: 180,
    averageDaily: 22.3,
    efficiency: 102,
    costPerTon: 720,
    lastBunker: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    nextBunkerEta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
  {
    vesselId: "v3",
    vesselName: "MV Caribbean Blue",
    voyageId: "VOY-2024-003",
    fuelType: "VLSFO",
    rob: 1200,
    consumed: 450,
    averageDaily: 32.1,
    efficiency: 88,
    costPerTon: 575,
    lastBunker: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    nextBunkerEta: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
  },
];

const consumptionHistory = [
  { date: "01/02", vlsfo: 28, mgo: 4, total: 32 },
  { date: "02/02", vlsfo: 30, mgo: 3, total: 33 },
  { date: "03/02", vlsfo: 27, mgo: 5, total: 32 },
  { date: "04/02", vlsfo: 29, mgo: 4, total: 33 },
  { date: "05/02", vlsfo: 31, mgo: 3, total: 34 },
  { date: "06/02", vlsfo: 26, mgo: 6, total: 32 },
  { date: "07/02", vlsfo: 28, mgo: 4, total: 32 },
];

const priceHistory = [
  { month: "Set", vlsfo: 560, mgo: 690 },
  { month: "Out", vlsfo: 575, mgo: 705 },
  { month: "Nov", vlsfo: 590, mgo: 720 },
  { month: "Dez", vlsfo: 580, mgo: 715 },
  { month: "Jan", vlsfo: 578, mgo: 718 },
  { month: "Fev", vlsfo: 582, mgo: 722 },
];

const fuelTypeDistribution = [
  { name: "VLSFO", value: 65, color: "#3b82f6" },
  { name: "MGO", value: 25, color: "#22c55e" },
  { name: "LNG", value: 8, color: "#f59e0b" },
  { name: "HSFO", value: 2, color: "#6b7280" },
];

export function FuelConsumptionDashboard() {
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("7d");

  const totalROB = mockVessels.reduce((sum, v) => sum + v.rob, 0);
  const totalConsumed = mockVessels.reduce((sum, v) => sum + v.consumed, 0);
  const avgEfficiency = mockVessels.reduce((sum, v) => sum + v.efficiency, 0) / mockVessels.length;
  const totalCost = mockVessels.reduce((sum, v) => sum + (v.consumed * v.costPerTon), 0);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Fuel className="h-6 w-6" />
            Gestão de Combustível
          </h2>
          <p className="text-muted-foreground">Monitoramento de consumo, ROB e bunker da frota</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Embarcação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda a Frota</SelectItem>
              {mockVessels.map(v => (
                <SelectItem key={v.vesselId} value={v.vesselId}>{v.vesselName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ROB Total</p>
                  <p className="text-2xl font-bold">{totalROB.toLocaleString()} MT</p>
                  <p className="text-xs text-muted-foreground">Toda a frota</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Consumo Período</p>
                  <p className="text-2xl font-bold">{totalConsumed.toLocaleString()} MT</p>
                  <div className="flex items-center gap-1 text-xs text-red-500">
                    <TrendingUp className="h-3 w-3" />
                    <span>+5.2% vs anterior</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Fuel className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Eficiência Média</p>
                  <p className="text-2xl font-bold">{avgEfficiency.toFixed(1)}%</p>
                  <div className="flex items-center gap-1 text-xs text-green-500">
                    <TrendingDown className="h-3 w-3" />
                    <span>-2.1% consumo</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Gauge className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Custo Total</p>
                  <p className="text-2xl font-bold">${(totalCost / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">Período selecionado</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consumption Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Consumo Diário (MT)</CardTitle>
            <CardDescription>VLSFO vs MGO por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={consumptionHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="vlsfo" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="VLSFO" />
                <Area type="monotone" dataKey="mgo" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="MGO" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Price Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Evolução de Preços (USD/MT)</CardTitle>
            <CardDescription>Histórico de preços de bunker</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[500, 800]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="vlsfo" stroke="#3b82f6" strokeWidth={2} name="VLSFO" />
                <Line type="monotone" dataKey="mgo" stroke="#22c55e" strokeWidth={2} name="MGO" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Vessel Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Status por Embarcação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockVessels.map((vessel) => {
              const daysToNextBunker = Math.ceil((vessel.nextBunkerEta.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const robPercentage = (vessel.rob / (vessel.rob + vessel.consumed)) * 100;
              
              return (
                <motion.div key={vessel.vesselId} whileHover={{ scale: 1.02 }}>
                  <Card className="border-2">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{vessel.vesselName}</h4>
                          <p className="text-xs text-muted-foreground">{vessel.voyageId}</p>
                        </div>
                        <Badge variant="outline">{vessel.fuelType}</Badge>
                      </div>

                      {/* ROB Gauge */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">ROB</span>
                          <span className="font-medium">{vessel.rob} MT</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              robPercentage < 25 ? "bg-red-500" :
                              robPercentage < 50 ? "bg-amber-500" : "bg-green-500"
                            }`}
                            style={{ width: `${robPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Consumo/dia</p>
                          <p className="font-medium">{vessel.averageDaily} MT</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Eficiência</p>
                          <p className={`font-medium ${vessel.efficiency >= 100 ? "text-green-600" : vessel.efficiency >= 90 ? "text-amber-600" : "text-red-600"}`}>
                            {vessel.efficiency}%
                          </p>
                        </div>
                      </div>

                      {/* Next Bunker Alert */}
                      <div className={`mt-4 p-2 rounded-lg ${
                        daysToNextBunker <= 5 ? "bg-red-50 border border-red-200" :
                        daysToNextBunker <= 10 ? "bg-amber-50 border border-amber-200" :
                        "bg-green-50 border border-green-200"
                      }`}>
                        <div className="flex items-center gap-2">
                          <Calendar className={`h-4 w-4 ${
                            daysToNextBunker <= 5 ? "text-red-600" :
                            daysToNextBunker <= 10 ? "text-amber-600" : "text-green-600"
                          }`} />
                          <span className="text-xs">
                            Próximo bunker em <strong>{daysToNextBunker}</strong> dias
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fuel Type Distribution & FIFO vs Weighted Average */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Distribuição por Tipo</CardTitle>
            <CardDescription>Consumo por tipo de combustível</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={fuelTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {fuelTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">FIFO vs Média Ponderada</CardTitle>
            <CardDescription>Comparativo de metodologia de custeio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Método FIFO</p>
                  <p className="text-sm text-muted-foreground">First In, First Out</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">$587/MT</p>
                  <Badge className="bg-green-100 text-green-700">Recomendado</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Média Ponderada</p>
                  <p className="text-sm text-muted-foreground">Weighted Average Cost</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">$592/MT</p>
                  <Badge variant="outline">+$5/MT</Badge>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                <p className="text-sm text-blue-700">
                  💡 Usando FIFO você economiza aproximadamente <strong>$4,750</strong> neste período
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FuelConsumptionDashboard;
