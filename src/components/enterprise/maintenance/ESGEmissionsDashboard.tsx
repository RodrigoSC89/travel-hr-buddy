/**
 * ESGEmissionsDashboard - Dashboard de Emissões e ESG
 * Enterprise-grade CII/EEXI monitoring with carbon footprint tracking
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Leaf, TrendingDown, TrendingUp, Ship, AlertTriangle, 
  Target, BarChart3, Globe, Droplets, Wind, FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

interface VesselEmissions {
  vesselId: string;
  vesselName: string;
  imo: string;
  ciiRating: "A" | "B" | "C" | "D" | "E";
  ciiAttained: number;
  ciiRequired: number;
  eexi: number;
  eexiRequired: number;
  co2Emissions: number; // tonnes
  sox: number;
  nox: number;
  yearlyTarget: number;
  yearlyActual: number;
}

const mockVessels: VesselEmissions[] = [
  {
    vesselId: "v1",
    vesselName: "MV Atlantic Star",
    imo: "9123456",
    ciiRating: "B",
    ciiAttained: 8.2,
    ciiRequired: 9.5,
    eexi: 12.5,
    eexiRequired: 15.0,
    co2Emissions: 12500,
    sox: 45,
    nox: 320,
    yearlyTarget: 50000,
    yearlyActual: 42000,
  },
  {
    vesselId: "v2",
    vesselName: "MV Pacific Dawn",
    imo: "9234567",
    ciiRating: "C",
    ciiAttained: 10.1,
    ciiRequired: 9.8,
    eexi: 14.2,
    eexiRequired: 15.0,
    co2Emissions: 15800,
    sox: 52,
    nox: 380,
    yearlyTarget: 55000,
    yearlyActual: 51000,
  },
  {
    vesselId: "v3",
    vesselName: "MV Caribbean Blue",
    imo: "9345678",
    ciiRating: "A",
    ciiAttained: 6.8,
    ciiRequired: 9.2,
    eexi: 11.0,
    eexiRequired: 15.0,
    co2Emissions: 9800,
    sox: 35,
    nox: 250,
    yearlyTarget: 45000,
    yearlyActual: 32000,
  },
];

const emissionsTrend = [
  { month: "Jan", co2: 4200, sox: 15, nox: 95 },
  { month: "Fev", co2: 4500, sox: 16, nox: 102 },
  { month: "Mar", co2: 3800, sox: 14, nox: 88 },
  { month: "Abr", co2: 4100, sox: 15, nox: 94 },
  { month: "Mai", co2: 3600, sox: 13, nox: 82 },
  { month: "Jun", co2: 3900, sox: 14, nox: 89 },
];

const ciiRatingColors = {
  A: { bg: "bg-green-500", text: "text-white", label: "Superior" },
  B: { bg: "bg-lime-500", text: "text-white", label: "Menor" },
  C: { bg: "bg-yellow-500", text: "text-black", label: "Moderado" },
  D: { bg: "bg-orange-500", text: "text-white", label: "Inferior" },
  E: { bg: "bg-red-500", text: "text-white", label: "Muito Inferior" },
};

const esgScoreData = [
  { subject: "Emissões CO2", A: 85, fullMark: 100 },
  { subject: "SOx/NOx", A: 78, fullMark: 100 },
  { subject: "Resíduos", A: 92, fullMark: 100 },
  { subject: "Eficiência", A: 88, fullMark: 100 },
  { subject: "Compliance", A: 95, fullMark: 100 },
  { subject: "Inovação", A: 72, fullMark: 100 },
];

export function ESGEmissionsDashboard() {
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("ytd");

  const totalCO2 = mockVessels.reduce((sum, v) => sum + v.co2Emissions, 0);
  const avgCII = mockVessels.reduce((sum, v) => sum + v.ciiAttained, 0) / mockVessels.length;
  const compliantVessels = mockVessels.filter(v => v.ciiRating !== "D" && v.ciiRating !== "E").length;
  const totalReduction = mockVessels.reduce((sum, v) => sum + (v.yearlyTarget - v.yearlyActual), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            ESG & Emissões
          </h2>
          <p className="text-muted-foreground">Monitoramento CII/EEXI e Carbon Footprint</p>
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
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Relatório ESG
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total CO2 Emitido</p>
                  <p className="text-2xl font-bold">{(totalCO2 / 1000).toFixed(1)}K t</p>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingDown className="h-3 w-3" />
                    <span>-8.5% vs ano anterior</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">CII Médio</p>
                  <p className="text-2xl font-bold">{avgCII.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">gCO2/t·nm</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Navios Compliant</p>
                  <p className="text-2xl font-bold">{compliantVessels}/{mockVessels.length}</p>
                  <p className="text-xs text-green-600">Rating A-C</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Ship className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Redução Atingida</p>
                  <p className="text-2xl font-bold">{(totalReduction / 1000).toFixed(0)}K t</p>
                  <p className="text-xs text-purple-600">vs meta anual</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* CII Rating Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Rating CII por Embarcação
          </CardTitle>
          <CardDescription>Carbon Intensity Indicator - Regulamento IMO 2023</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockVessels.map((vessel) => (
              <motion.div key={vessel.vesselId} whileHover={{ scale: 1.02 }}>
                <Card className="border-2">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{vessel.vesselName}</h4>
                        <p className="text-xs text-muted-foreground">IMO {vessel.imo}</p>
                      </div>
                      <div className={`h-12 w-12 rounded-full ${ciiRatingColors[vessel.ciiRating].bg} flex items-center justify-center`}>
                        <span className={`text-xl font-bold ${ciiRatingColors[vessel.ciiRating].text}`}>
                          {vessel.ciiRating}
                        </span>
                      </div>
                    </div>

                    {/* CII Progress */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">CII Attained</span>
                          <span className="font-medium">{vessel.ciiAttained} gCO2/t·nm</span>
                        </div>
                        <Progress 
                          value={(vessel.ciiAttained / vessel.ciiRequired) * 100} 
                          className={vessel.ciiAttained <= vessel.ciiRequired ? "bg-green-100" : "bg-red-100"}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Required: ≤{vessel.ciiRequired} gCO2/t·nm
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">EEXI</span>
                          <span className="font-medium">{vessel.eexi}</span>
                        </div>
                        <Progress 
                          value={(vessel.eexi / vessel.eexiRequired) * 100}
                          className="bg-green-100"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Required: ≤{vessel.eexiRequired}
                        </p>
                      </div>
                    </div>

                    {/* Yearly Target */}
                    <div className="mt-4 p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Meta Anual CO2</span>
                        <Badge className={vessel.yearlyActual <= vessel.yearlyTarget ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {((vessel.yearlyActual / vessel.yearlyTarget) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {vessel.yearlyActual.toLocaleString()} / {vessel.yearlyTarget.toLocaleString()} t
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emissions Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tendência de Emissões (toneladas)</CardTitle>
            <CardDescription>CO2, SOx e NOx por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={emissionsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="co2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="CO2 (t)" />
                <Line yAxisId="right" type="monotone" dataKey="sox" stroke="#f59e0b" name="SOx (t)" />
                <Line yAxisId="right" type="monotone" dataKey="nox" stroke="#ef4444" name="NOx (t)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ESG Score Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Score ESG Consolidado</CardTitle>
            <CardDescription>Performance ambiental da frota</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={esgScoreData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Score" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* CII Rating Scale */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Escala CII Rating - IMO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2">
            {Object.entries(ciiRatingColors).map(([rating, config]) => (
              <div key={rating} className="flex flex-col items-center">
                <div className={`h-12 w-12 rounded-lg ${config.bg} flex items-center justify-center mb-2`}>
                  <span className={`text-xl font-bold ${config.text}`}>{rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Atenção: Navios com rating D ou E</span>
            </div>
            <p className="text-sm text-amber-600 mt-1">
              Devem apresentar plano de correção à autoridade de bandeira dentro de 3 anos
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ESGEmissionsDashboard;
