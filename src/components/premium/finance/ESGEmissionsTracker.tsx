/**
 * FASE 9 - Finance Command
 * ESG & Emissões - CII/EEXI tracker com metas IMO (benchmark: Veson IMOS)
 */

import React, { useState } from "react";
import { useESGEmissionsData, type VesselCII } from "@/hooks/useESGEmissionsData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Leaf, TrendingDown, TrendingUp, Ship, Target,
  AlertTriangle, CheckCircle, BarChart3, Globe, Gauge
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

// Types imported from hook; local mock data removed

const getRatingColor = (rating: string) => {
  switch (rating) {
    case "A": return "bg-success text-success-foreground";
    case "B": return "bg-emerald-400 text-white";
    case "C": return "bg-warning text-warning-foreground";
    case "D": return "bg-orange-500 text-white";
    case "E": return "bg-destructive text-destructive-foreground";
    default: return "bg-muted";
  }
};

const getRatingBarColor = (rating: string) => {
  switch (rating) {
    case "A": return "hsl(var(--success))";
    case "B": return "#34d399";
    case "C": return "hsl(var(--warning))";
    case "D": return "#f97316";
    case "E": return "hsl(var(--destructive))";
    default: return "hsl(var(--muted))";
  }
};

export default function ESGEmissionsTracker() {
  const { vesselCII: vesselCIIData, emissionsTrend, isLoading } = useESGEmissionsData();
  const [selectedYear, setSelectedYear] = useState("2024");

  const totalEmissions = vesselCIIData.reduce((sum: number, v: VesselCII) => sum + v.co2Emissions, 0);
  const compliantCount = vesselCIIData.filter((v: VesselCII) => ["A", "B", "C"].includes(v.rating)).length;
  const atRiskCount = vesselCIIData.filter((v: VesselCII) => ["D", "E"].includes(v.rating)).length;
  const fleetAverageRating = vesselCIIData.length > 0 ? vesselCIIData[0].rating : "B";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Badge variant="outline" className="text-sm">
          <Globe className="h-3 w-3 mr-1" />
          IMO 2023 Compliant
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Rating Médio da Frota</p>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold px-3 py-1 rounded ${getRatingColor(fleetAverageRating)}`}>
                    {fleetAverageRating}
                  </span>
                </div>
              </div>
              <Gauge className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Emissões CO₂ (YTD)</p>
                <p className="text-2xl font-bold">{(totalEmissions / 1000).toFixed(1)}k t</p>
              </div>
              <Leaf className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Embarcações Conformes</p>
                <p className="text-2xl font-bold text-success">{compliantCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Em Risco (D/E)</p>
                <p className="text-2xl font-bold text-destructive">{atRiskCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cii">
        <TabsList>
          <TabsTrigger value="cii" className="gap-2">
            <Gauge className="h-4 w-4" />
            CII por Embarcação
          </TabsTrigger>
          <TabsTrigger value="emissions" className="gap-2">
            <Leaf className="h-4 w-4" />
            Tendência de Emissões
          </TabsTrigger>
          <TabsTrigger value="targets" className="gap-2">
            <Target className="h-4 w-4" />
            Metas IMO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cii" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CII Rating por Embarcação</CardTitle>
                <CardDescription>Carbon Intensity Indicator - IMO 2023</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vesselCIIData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis dataKey="vessel" type="category" fontSize={10} width={120} />
                    <Tooltip />
                    <Bar dataKey="ciiValue" name="CII Atual" radius={[0, 4, 4, 0]}>
                      {vesselCIIData.map((entry, index) => (
                        <Cell key={index} fill={getRatingBarColor(entry.rating)} />
                      ))}
                    </Bar>
                    <Bar dataKey="target" name="Meta" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes por Embarcação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vesselCIIData.map((vessel) => (
                  <div key={vessel.vessel} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Ship className="h-4 w-4" />
                        <span className="font-medium">{vessel.vessel}</span>
                      </div>
                      <Badge className={getRatingColor(vessel.rating)}>
                        {vessel.rating}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">CII</p>
                        <p className="font-medium">{vessel.ciiValue} g/t·nm</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Meta</p>
                        <p className="font-medium">{vessel.target} g/t·nm</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tendência</p>
                        <div className="flex items-center gap-1">
                          {vessel.trend === "improving" ? (
                            <TrendingDown className="h-4 w-4 text-success" />
                          ) : vessel.trend === "declining" ? (
                            <TrendingUp className="h-4 w-4 text-destructive" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min((vessel.target / vessel.ciiValue) * 100, 100)}
                      className={`h-2 mt-3 ${
                        vessel.rating === "A" || vessel.rating === "B" ? "[&>div]:bg-success" :
                        vessel.rating === "C" ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                      }`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="emissions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Emissões vs Meta</CardTitle>
              <CardDescription>Últimos 6 meses - Toneladas CO₂</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={emissionsTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="emissions" name="Emissões Reais" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="target" name="Meta IMO" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targets" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Metas de Redução IMO</CardTitle>
              <CardDescription>Roadmap de descarbonização marítima</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { year: "2023", reduction: "5%", status: "achieved", description: "Início do rating CII obrigatório" },
                  { year: "2025", reduction: "11%", status: "on-track", description: "Aperto nas faixas de rating" },
                  { year: "2030", reduction: "40%", status: "planning", description: "Meta intermediária GHG Strategy" },
                  { year: "2050", reduction: "Net Zero", status: "planning", description: "Descarbonização total" },
                ].map((target) => (
                  <div key={target.year} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-primary">{target.year}</div>
                      <div>
                        <p className="font-medium">Redução de {target.reduction}</p>
                        <p className="text-sm text-muted-foreground">{target.description}</p>
                      </div>
                    </div>
                    <Badge variant={
                      target.status === "achieved" ? "default" :
                      target.status === "on-track" ? "secondary" : "outline"
                    }>
                      {target.status === "achieved" ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                      {target.status}
                    </Badge>
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
