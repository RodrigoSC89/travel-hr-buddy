import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Leaf,
  TrendingDown,
  TrendingUp,
  Target,
  BarChart3,
  Calendar,
  Anchor,
  AlertCircle,
  Award,
  Download,
} from "lucide-react";

interface VesselEmissions {
  vessel: string;
  currentMonth: {
    total: number;
    perNauticalMile: number;
    trend: "up" | "down" | "stable";
    change: number;
  };
  yearToDate: {
    total: number;
    target: number;
    percentage: number;
  };
  breakdown: {
    fuel: number;
    electricity: number;
    other: number;
  };
  offsetPrograms: {
    name: string;
    amount: number;
  }[];
}

export const CarbonFootprintTracker: React.FC = () => {
  const [emissions, setEmissions] = useState<VesselEmissions[]>([
    {
      vessel: "MV-Atlas",
      currentMonth: {
        total: 245.8,
        perNauticalMile: 0.578,
        trend: "down",
        change: -8.5,
      },
      yearToDate: {
        total: 2847.5,
        target: 3200,
        percentage: 89,
      },
      breakdown: {
        fuel: 89.2,
        electricity: 8.5,
        other: 2.3,
      },
      offsetPrograms: [
        { name: "Reflorestamento Amazônia", amount: 45.5 },
        { name: "Energia Renovável", amount: 28.3 },
      ],
    },
    {
      vessel: "MV-Neptune",
      currentMonth: {
        total: 198.4,
        perNauticalMile: 0.492,
        trend: "down",
        change: -12.3,
      },
      yearToDate: {
        total: 2245.8,
        target: 2800,
        percentage: 80,
      },
      breakdown: {
        fuel: 91.5,
        electricity: 6.8,
        other: 1.7,
      },
      offsetPrograms: [
        { name: "Captura de Carbono", amount: 38.2 },
        { name: "Energia Solar", amount: 22.1 },
      ],
    },
    {
      vessel: "MV-Poseidon",
      currentMonth: {
        total: 287.3,
        perNauticalMile: 0.615,
        trend: "up",
        change: 5.2,
      },
      yearToDate: {
        total: 3142.6,
        target: 3000,
        percentage: 105,
      },
      breakdown: {
        fuel: 88.7,
        electricity: 9.2,
        other: 2.1,
      },
      offsetPrograms: [{ name: "Preservação Oceânica", amount: 52.4 }],
    },
  ]);

  const totalEmissions = emissions.reduce((sum, e) => sum + e.currentMonth.total, 0);
  const totalYTD = emissions.reduce((sum, e) => sum + e.yearToDate.total, 0);
  const targetYTD = emissions.reduce((sum, e) => sum + e.yearToDate.target, 0);
  const totalOffset = emissions.reduce(
    (sum, e) => sum + e.offsetPrograms.reduce((s, p) => s + p.amount, 0),
    0
  );

  const avgTrend = emissions.reduce((sum, e) => sum + e.currentMonth.change, 0) / emissions.length;

  const getTrendIcon = (trend: string) => {
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-green-600" />;
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-red-600" />;
    return <BarChart3 className="h-4 w-4 text-yellow-600" />;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage <= 90) return "text-green-600";
    if (percentage <= 100) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Emissões Mês Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmissions.toFixed(1)}t</div>
            <p className="text-xs text-muted-foreground">CO₂ equivalente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Acumulado 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalYTD / 1000).toFixed(1)}k t</div>
            <p className="text-xs text-muted-foreground">
              Meta: {(targetYTD / 1000).toFixed(1)}k t
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tendência Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${avgTrend < 0 ? "text-green-600" : "text-red-600"}`}
            >
              {avgTrend > 0 ? "+" : ""}
              {avgTrend.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs. mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Offset Ativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalOffset.toFixed(1)}t</div>
            <p className="text-xs text-muted-foreground">Compensação carbono</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tracker */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Rastreador de Pegada de Carbono
              </CardTitle>
              <CardDescription>
                Monitoramento de emissões por viagem e embarcação com metas ESG
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Relatório ESG
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="vessels">Por Embarcação</TabsTrigger>
              <TabsTrigger value="offset">Compensação</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Fleet Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance da Frota</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Meta Anual de Redução</span>
                    <span className="text-2xl font-bold">15%</span>
                  </div>
                  <Progress value={((targetYTD - totalYTD) / targetYTD) * 100} className="h-3" />
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Atual</div>
                      <div className="font-bold">{(totalYTD / 1000).toFixed(2)}k t</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Meta</div>
                      <div className="font-bold">{(targetYTD / 1000).toFixed(2)}k t</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Diferença</div>
                      <div
                        className={`font-bold ${totalYTD < targetYTD ? "text-green-600" : "text-red-600"}`}
                      >
                        {((totalYTD - targetYTD) / 1000).toFixed(2)}k t
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Breakdown Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Distribuição de Emissões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Combustível (Diesel/HFO)</span>
                        <span className="font-medium">89.8%</span>
                      </div>
                      <Progress value={89.8} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Energia Elétrica</span>
                        <span className="font-medium">8.2%</span>
                      </div>
                      <Progress value={8.2} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Outros</span>
                        <span className="font-medium">2.0%</span>
                      </div>
                      <Progress value={2.0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vessels" className="space-y-4 mt-4">
              {emissions.map(emission => (
                <Card key={emission.vessel} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="gap-1">
                          <Anchor className="h-3 w-3" />
                          {emission.vessel}
                        </Badge>
                        {getTrendIcon(emission.currentMonth.trend)}
                        <span
                          className={`text-sm font-medium ${
                            emission.currentMonth.change < 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {emission.currentMonth.change > 0 ? "+" : ""}
                          {emission.currentMonth.change}%
                        </span>
                      </div>
                      {emission.yearToDate.percentage <= 90 && (
                        <Badge variant="default" className="gap-1 bg-green-600">
                          <Award className="h-3 w-3" />
                          Meta Atingida
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Current Month */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Mês Atual</div>
                        <div className="text-2xl font-bold">{emission.currentMonth.total} t</div>
                        <div className="text-sm text-muted-foreground">
                          {emission.currentMonth.perNauticalMile} kg/nm
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Acumulado 2025</div>
                        <div className="text-2xl font-bold">
                          {(emission.yearToDate.total / 1000).toFixed(2)}k t
                        </div>
                        <div
                          className={`text-sm font-medium ${getPerformanceColor(emission.yearToDate.percentage)}`}
                        >
                          {emission.yearToDate.percentage}% da meta
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progresso vs Meta Anual</span>
                        <span className="font-medium">
                          {emission.yearToDate.total} / {emission.yearToDate.target} t
                        </span>
                      </div>
                      <Progress value={emission.yearToDate.percentage} className="h-3" />
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground mb-1">Combustível</div>
                        <div className="font-bold">{emission.breakdown.fuel}%</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground mb-1">Eletricidade</div>
                        <div className="font-bold">{emission.breakdown.electricity}%</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground mb-1">Outros</div>
                        <div className="font-bold">{emission.breakdown.other}%</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Histórico
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Target className="h-4 w-4 mr-2" />
                        Metas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="offset" className="space-y-4 mt-4">
              {emissions.map(emission => (
                <Card key={emission.vessel}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Anchor className="h-3 w-3" />
                        {emission.vessel}
                      </Badge>
                      <CardTitle className="text-base">Programas de Compensação Ativos</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {emission.offsetPrograms.map((program, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <Leaf className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{program.name}</div>
                            <div className="text-xs text-muted-foreground">Compensação ativa</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{program.amount}t</div>
                          <div className="text-xs text-muted-foreground">CO₂</div>
                        </div>
                      </div>
                    ))}
                    <Button size="sm" variant="outline" className="w-full">
                      Adicionar Programa
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarbonFootprintTracker;
