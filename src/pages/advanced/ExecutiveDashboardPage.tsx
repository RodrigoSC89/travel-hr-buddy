/**
 * Executive Dashboard Page
 * BI avançado com KPIs em tempo real para diretoria
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, Ship, 
  Users, Fuel, Shield, Clock, Download, RefreshCw, Target
} from "lucide-react";

const ExecutiveDashboardPage = () => {
  const [period, setPeriod] = useState("month");

  const kpis = [
    { 
      name: "Receita Operacional", 
      value: "$12.4M", 
      change: "+8.3%", 
      trend: "up",
      icon: DollarSign,
      color: "text-green-500"
    },
    { 
      name: "OPEX Total", 
      value: "$8.2M", 
      change: "-3.1%", 
      trend: "down",
      icon: TrendingDown,
      color: "text-green-500"
    },
    { 
      name: "Utilização da Frota", 
      value: "94.2%", 
      change: "+2.1%", 
      trend: "up",
      icon: Ship,
      color: "text-blue-500"
    },
    { 
      name: "TCE Médio", 
      value: "$28,450/dia", 
      change: "+12.4%", 
      trend: "up",
      icon: Target,
      color: "text-green-500"
    }
  ];

  const fleetPerformance = [
    { vessel: "MT Atlântico", tce: 32500, utilization: 98, opex: 18500, status: "operating" },
    { vessel: "MT Pacífico", tce: 28900, utilization: 95, opex: 17200, status: "operating" },
    { vessel: "MT Índico", tce: 26400, utilization: 92, opex: 19100, status: "operating" },
    { vessel: "MT Ártico", tce: 0, utilization: 0, opex: 8500, status: "drydock" },
    { vessel: "MT Antártico", tce: 24800, utilization: 88, opex: 16800, status: "operating" }
  ];

  const complianceMetrics = {
    overall: 96,
    pscDeficiencyRate: 0.8,
    ism: 98,
    mlc: 94,
    marpol: 97,
    vetting: 95
  };

  const crewMetrics = {
    totalCrew: 124,
    retention: 87,
    avgTenure: "4.2 anos",
    training: 92,
    wellness: 78
  };

  const financialHighlights = [
    { item: "Bunker Costs", ytd: 15600000, budget: 17200000, variance: -9.3 },
    { item: "Crew Costs", ytd: 8900000, budget: 9100000, variance: -2.2 },
    { item: "Maintenance", ytd: 4200000, budget: 4000000, variance: +5.0 },
    { item: "Insurance", ytd: 2100000, budget: 2100000, variance: 0 },
    { item: "Admin & Overhead", ytd: 1800000, budget: 2000000, variance: -10.0 }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Executive Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Business Intelligence em tempo real para tomada de decisão
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Ano</option>
          </select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.name}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {kpi.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                    <span className={kpi.color}>{kpi.change}</span>
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="fleet" className="space-y-6">
        <TabsList>
          <TabsTrigger value="fleet">Performance da Frota</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="crew">Tripulação</TabsTrigger>
        </TabsList>

        <TabsContent value="fleet">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Performance por Embarcação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Embarcação</th>
                      <th className="text-right p-3">TCE ($/dia)</th>
                      <th className="text-right p-3">Utilização</th>
                      <th className="text-right p-3">OPEX ($/dia)</th>
                      <th className="text-center p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fleetPerformance.map((vessel) => (
                      <tr key={vessel.vessel} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{vessel.vessel}</td>
                        <td className="p-3 text-right">
                          {vessel.tce > 0 ? `$${vessel.tce.toLocaleString()}` : "-"}
                        </td>
                        <td className="p-3 text-right">
                          <span className={
                            vessel.utilization >= 95 ? "text-green-500" :
                            vessel.utilization >= 85 ? "text-yellow-500" :
                            vessel.utilization > 0 ? "text-red-500" : "text-muted-foreground"
                          }>
                            {vessel.utilization > 0 ? `${vessel.utilization}%` : "-"}
                          </span>
                        </td>
                        <td className="p-3 text-right">${vessel.opex.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <Badge className={
                            vessel.status === "operating" ? "bg-green-500" :
                            vessel.status === "drydock" ? "bg-yellow-500" : "bg-red-500"
                          }>
                            {vessel.status === "operating" ? "Operando" :
                             vessel.status === "drydock" ? "Docagem" : vessel.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget vs Realizado (YTD)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialHighlights.map((item) => (
                  <div key={item.item} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.item}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>YTD: ${(item.ytd/1000000).toFixed(1)}M</span>
                        <span>Budget: ${(item.budget/1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                    <Badge className={
                      item.variance < 0 ? "bg-green-500" :
                      item.variance > 0 ? "bg-red-500" : "bg-gray-500"
                    }>
                      {item.variance > 0 ? "+" : ""}{item.variance.toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Score de Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-green-500">{complianceMetrics.overall}%</div>
                  <p className="text-muted-foreground">Score Geral</p>
                </div>
                <div className="space-y-3">
                  {Object.entries(complianceMetrics).filter(([key]) => key !== "overall" && key !== "pscDeficiencyRate").map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize">{key}</span>
                      <span className={`font-bold ${
                        Number(value) >= 95 ? "text-green-500" :
                        Number(value) >= 85 ? "text-yellow-500" : "text-red-500"
                      }`}>{value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>KPIs de Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">PSC Deficiency Rate</p>
                    <p className="text-2xl font-bold text-green-500">{complianceMetrics.pscDeficiencyRate}</p>
                    <p className="text-xs text-muted-foreground">Meta: &lt; 1.0</p>
                  </div>
                  <div className="p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Dias sem LTI</p>
                    <p className="text-2xl font-bold text-blue-500">847</p>
                    <p className="text-xs text-muted-foreground">Record: 1,200 dias</p>
                  </div>
                  <div className="p-4 bg-yellow-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Near Misses (YTD)</p>
                    <p className="text-2xl font-bold text-yellow-500">23</p>
                    <p className="text-xs text-muted-foreground">100% investigados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crew">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Total Tripulantes</p>
                <p className="text-2xl font-bold">{crewMetrics.totalCrew}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">Retenção</p>
                <p className="text-2xl font-bold text-green-500">{crewMetrics.retention}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold text-blue-500">{crewMetrics.avgTenure}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <p className="text-sm text-muted-foreground">Training Score</p>
                <p className="text-2xl font-bold text-purple-500">{crewMetrics.training}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <p className="text-sm text-muted-foreground">Wellness Score</p>
                <p className="text-2xl font-bold text-orange-500">{crewMetrics.wellness}%</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExecutiveDashboardPage;
