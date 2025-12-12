/**
import { useEffect, useState } from "react";;
 * ESG Emissions Dashboard
 * Monitoramento de emissões, carbon footprint e compliance ambiental
 * Integrado com Supabase para dados de embarcações
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Leaf,
  Factory,
  Droplets,
  Wind,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  BarChart3,
  Globe,
  Ship,
  Fuel,
  Thermometer,
  FileText,
  Brain,
  Sparkles,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface VesselData {
  id: string;
  name: string;
  vessel_type: string;
  fuel_capacity: number;
  current_fuel_level: number;
  status: string;
}

// Demo data as fallback
const demoMonthlyEmissions = [
  { month: "Jan", co2: 245, sox: 12, nox: 28, pm: 5.2 },
  { month: "Fev", co2: 238, sox: 11, nox: 26, pm: 4.8 },
  { month: "Mar", co2: 252, sox: 13, nox: 29, pm: 5.5 },
  { month: "Abr", co2: 228, sox: 10, nox: 24, pm: 4.5 },
  { month: "Mai", co2: 215, sox: 9, nox: 22, pm: 4.1 },
  { month: "Jun", co2: 208, sox: 8.5, nox: 21, pm: 3.9 },
  { month: "Jul", co2: 195, sox: 8, nox: 19, pm: 3.6 },
  { month: "Ago", co2: 188, sox: 7.5, nox: 18, pm: 3.4 },
];

const fuelConsumption = [
  { name: "MGO (0.1% S)", value: 45, color: "#22c55e" },
  { name: "VLSFO (0.5% S)", value: 35, color: "#3b82f6" },
  { name: "HFO (Scrubber)", value: 15, color: "#f59e0b" },
  { name: "LNG", value: 5, color: "#8b5cf6" },
];

// Vessel emissions data
const vesselEmissions = [
  { vessel: "PSV Atlantic Explorer", co2: 42.5, efficiency: "A", trend: -8.2 },
  { vessel: "AHTS Pacific Star", co2: 68.3, efficiency: "B", trend: -3.1 },
  { vessel: "OSV Caribbean Wind", co2: 35.8, efficiency: "A+", trend: -12.5 },
  { vessel: "PSV Gulf Stream", co2: 48.2, efficiency: "B", trend: 2.3 },
];

// Monthly emissions data
const monthlyEmissions = demoMonthlyEmissions;

export const EmissionsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("ytd");
  const [selectedVessel, setSelectedVessel] = useState("all");

  const getEfficiencyColor = (efficiency: string) => {
    switch (efficiency) {
    case "A+": return "bg-green-500";
    case "A": return "bg-green-400";
    case "B": return "bg-yellow-400";
    case "C": return "bg-orange-400";
    default: return "bg-red-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">Este Mês</SelectItem>
              <SelectItem value="qtd">Este Trimestre</SelectItem>
              <SelectItem value="ytd">Este Ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Todas as embarcações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Embarcações</SelectItem>
              {vesselEmissions.map(v => (
                <SelectItem key={v.vessel} value={v.vessel}>{v.vessel}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Relatório IMO DCS
          </Button>
          <Button variant="outline">
            <Globe className="h-4 w-4 mr-2" />
            EU MRV Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Factory className="h-4 w-4" />
              CO₂ Total (ton)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">1,769</div>
                <p className="text-xs text-muted-foreground">Meta anual: 2,500</p>
              </div>
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                -12.4%
              </Badge>
            </div>
            <Progress value={70.8} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              SOx (ton)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">79.5</div>
                <p className="text-xs text-muted-foreground">Limite IMO: 0.5% S</p>
              </div>
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Conforme
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wind className="h-4 w-4" />
              NOx (ton)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">187</div>
                <p className="text-xs text-muted-foreground">Tier II compliance</p>
              </div>
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Tier II
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              CII Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">B</div>
                <p className="text-xs text-muted-foreground">Média da frota</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                Meta: A
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emissions Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tendência de Emissões
            </CardTitle>
            <CardDescription>CO₂ equivalente por mês (toneladas)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyEmissions}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))" 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="co2" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.2}
                    name="CO₂"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fuel Mix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              Mix de Combustível
            </CardTitle>
            <CardDescription>Distribuição por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fuelConsumption}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {fuelConsumption.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {fuelConsumption.map((fuel) => (
                <div key={fuel.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: fuel.color }}
                    />
                    <span>{fuel.name}</span>
                  </div>
                  <span className="font-medium">{fuel.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vessel Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Performance Ambiental por Embarcação
          </CardTitle>
          <CardDescription>CII Rating e tendência de emissões</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vesselEmissions.map((vessel) => (
              <div 
                key={vessel.vessel}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Ship className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{vessel.vessel}</p>
                    <p className="text-sm text-muted-foreground">
                      {vessel.co2} ton CO₂/mês
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className={`w-10 h-10 rounded-full ${getEfficiencyColor(vessel.efficiency)} flex items-center justify-center text-white font-bold`}>
                      {vessel.efficiency}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">CII</p>
                  </div>

                  <div className="text-right">
                    <Badge 
                      variant={vessel.trend < 0 ? "default" : "destructive"}
                      className={vessel.trend < 0 ? "bg-green-100 text-green-800" : ""}
                    >
                      {vessel.trend < 0 ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(vessel.trend)}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">vs. ano anterior</p>
                  </div>

                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Compliance Regulatório
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { reg: "IMO 2020 (Sulphur Cap)", status: "Conforme", icon: CheckCircle },
              { reg: "EU MRV Regulation", status: "Conforme", icon: CheckCircle },
              { reg: "IMO DCS (Data Collection)", status: "Conforme", icon: CheckCircle },
              { reg: "CII Rating (EEXI)", status: "Em Monitoramento", icon: AlertTriangle },
            ].map((item) => (
              <div key={item.reg} className="flex items-center justify-between">
                <span className="text-sm">{item.reg}</span>
                <Badge 
                  variant={item.status === "Conforme" ? "default" : "secondary"}
                  className={item.status === "Conforme" ? "bg-green-600" : "bg-yellow-500"}
                >
                  <item.icon className="h-3 w-3 mr-1" />
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Insights IA
            </CardTitle>
            <CardDescription>Recomendações para redução de emissões</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Otimização de Rota</p>
                  <p className="text-xs text-blue-700">
                    Análise indica potencial de -8% CO₂ com weather routing otimizado para PSV Gulf Stream.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Leaf className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Transição LNG</p>
                  <p className="text-xs text-green-700">
                    Aumentar uso de LNG de 5% para 15% pode reduzir SOx em 40% e CO₂ em 12%.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-2">
                <TrendingDown className="h-4 w-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Slow Steaming</p>
                  <p className="text-xs text-purple-700">
                    Redução de 10% na velocidade média pode economizar 15% em combustível sem impacto operacional.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
