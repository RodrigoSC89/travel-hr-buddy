/**
 * Voyage Accounting Component
 * P&L por viagem, estimativa vs realizado, alocação de custos
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Ship, DollarSign, TrendingUp, TrendingDown, FileText,
  Calculator, PieChart, BarChart3, ArrowUpRight, ArrowDownRight,
  Clock, Anchor, Fuel, Users, Package, Wrench
} from "lucide-react";

interface VoyageData {
  id: string;
  voyageNumber: string;
  vessel: string;
  route: string;
  status: "in_progress" | "completed" | "planned";
  startDate: string;
  endDate: string;
  estimatedRevenue: number;
  actualRevenue: number;
  estimatedCosts: number;
  actualCosts: number;
  profitMargin: number;
  costBreakdown: {
    fuel: number;
    crew: number;
    port: number;
    cargo: number;
    maintenance: number;
    other: number;
  };
}

const voyages: VoyageData[] = [
  {
    id: "1",
    voyageNumber: "VY-2024-001",
    vessel: "MV Atlantic Star",
    route: "Santos → Rotterdam",
    status: "completed",
    startDate: "2024-01-15",
    endDate: "2024-02-10",
    estimatedRevenue: 850000,
    actualRevenue: 892000,
    estimatedCosts: 620000,
    actualCosts: 598000,
    profitMargin: 33.0,
    costBreakdown: { fuel: 280000, crew: 95000, port: 78000, cargo: 62000, maintenance: 45000, other: 38000 }
  },
  {
    id: "2",
    voyageNumber: "VY-2024-002",
    vessel: "MV Pacific Dream",
    route: "Singapore → Los Angeles",
    status: "in_progress",
    startDate: "2024-02-01",
    endDate: "2024-03-05",
    estimatedRevenue: 1200000,
    actualRevenue: 1150000,
    estimatedCosts: 850000,
    actualCosts: 890000,
    profitMargin: 22.6,
    costBreakdown: { fuel: 420000, crew: 140000, port: 125000, cargo: 95000, maintenance: 65000, other: 45000 }
  },
  {
    id: "3",
    voyageNumber: "VY-2024-003",
    vessel: "MV Nordic Wind",
    route: "Hamburg → New York",
    status: "planned",
    startDate: "2024-03-01",
    endDate: "2024-03-20",
    estimatedRevenue: 720000,
    actualRevenue: 0,
    estimatedCosts: 520000,
    actualCosts: 0,
    profitMargin: 27.8,
    costBreakdown: { fuel: 240000, crew: 85000, port: 72000, cargo: 58000, maintenance: 35000, other: 30000 }
  }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const getVarianceColor = (estimated: number, actual: number, isRevenue: boolean) => {
  if (actual === 0) return "text-muted-foreground";
  const variance = ((actual - estimated) / estimated) * 100;
  if (isRevenue) {
    return variance >= 0 ? "text-success" : "text-destructive";
  }
  return variance <= 0 ? "text-success" : "text-destructive";
};

const getVarianceIcon = (estimated: number, actual: number, isRevenue: boolean) => {
  if (actual === 0) return null;
  const variance = ((actual - estimated) / estimated) * 100;
  if (isRevenue) {
    return variance >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />;
  }
  return variance <= 0 ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />;
};

export function VoyageAccounting() {
  const [selectedVoyage, setSelectedVoyage] = useState<VoyageData | null>(voyages[0]);

  const totalRevenue = voyages.reduce((sum, v) => sum + (v.actualRevenue || v.estimatedRevenue), 0);
  const totalCosts = voyages.reduce((sum, v) => sum + (v.actualCosts || v.estimatedCosts), 0);
  const totalProfit = totalRevenue - totalCosts;
  const avgMargin = (totalProfit / totalRevenue) * 100;

  const costCategories = [
    { key: "fuel", label: "Combustível", icon: Fuel, color: "bg-warning" },
    { key: "crew", label: "Tripulação", icon: Users, color: "bg-primary" },
    { key: "port", label: "Portos", icon: Anchor, color: "bg-accent" },
    { key: "cargo", label: "Carga", icon: Package, color: "bg-success" },
    { key: "maintenance", label: "Manutenção", icon: Wrench, color: "bg-warning" },
    { key: "other", label: "Outros", icon: PieChart, color: "bg-muted" }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custos Totais</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(totalCosts)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/10 to-info/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                <p className="text-2xl font-bold text-info">
                  {formatCurrency(totalProfit)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Margem Média</p>
                <p className="text-2xl font-bold text-accent-foreground">
                  {avgMargin.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-accent-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voyage List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Viagens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {voyages.map((voyage) => (
              <div
                key={voyage.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedVoyage?.id === voyage.id 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedVoyage(voyage)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{voyage.voyageNumber}</p>
                    <p className="text-sm text-muted-foreground">{voyage.vessel}</p>
                  </div>
                  <Badge variant={
                    voyage.status === "completed" ? "default" :
                    voyage.status === "in_progress" ? "secondary" : "outline"
                  }>
                    {voyage.status === "completed" ? "Concluída" :
                     voyage.status === "in_progress" ? "Em Andamento" : "Planejada"}
                  </Badge>
                </div>
                <p className="text-sm mb-2">{voyage.route}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Margem</span>
                  <span className={voyage.profitMargin >= 25 ? "text-success font-medium" : "text-warning font-medium"}>
                    {voyage.profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Voyage Details */}
        {selectedVoyage && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  {selectedVoyage.voyageNumber} - P&L
                </CardTitle>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary">
                <TabsList className="mb-4">
                  <TabsTrigger value="summary">Resumo</TabsTrigger>
                  <TabsTrigger value="breakdown">Detalhamento</TabsTrigger>
                  <TabsTrigger value="variance">Variância</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-6">
                  {/* Revenue vs Costs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-success/10">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">Receita</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Estimado:</span>
                          <span>{formatCurrency(selectedVoyage.estimatedRevenue)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                          <span>Realizado:</span>
                          <span className={getVarianceColor(selectedVoyage.estimatedRevenue, selectedVoyage.actualRevenue, true)}>
                            {formatCurrency(selectedVoyage.actualRevenue)}
                            {getVarianceIcon(selectedVoyage.estimatedRevenue, selectedVoyage.actualRevenue, true)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-destructive/10">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-medium">Custos</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Estimado:</span>
                          <span>{formatCurrency(selectedVoyage.estimatedCosts)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                          <span>Realizado:</span>
                          <span className={getVarianceColor(selectedVoyage.estimatedCosts, selectedVoyage.actualCosts, false)}>
                            {formatCurrency(selectedVoyage.actualCosts)}
                            {getVarianceIcon(selectedVoyage.estimatedCosts, selectedVoyage.actualCosts, false)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profit Summary */}
                  <div className="p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-primary/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Lucro da Viagem</p>
                        <p className="text-3xl font-bold text-primary">
                          {formatCurrency((selectedVoyage.actualRevenue || selectedVoyage.estimatedRevenue) - 
                                         (selectedVoyage.actualCosts || selectedVoyage.estimatedCosts))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Margem</p>
                        <p className="text-2xl font-bold text-primary">
                          {selectedVoyage.profitMargin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="breakdown" className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Alocação de custos por categoria
                  </p>
                  {costCategories.map((cat) => {
                    const value = selectedVoyage.costBreakdown[cat.key as keyof typeof selectedVoyage.costBreakdown];
                    const total = Object.values(selectedVoyage.costBreakdown).reduce((a, b) => a + b, 0);
                    const percentage = (value / total) * 100;
                    const Icon = cat.icon;

                    return (
                      <div key={cat.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded ${cat.color}`}>
                              <Icon className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-sm font-medium">{cat.label}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium">{formatCurrency(value)}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="variance" className="space-y-4">
                  <div className="rounded-lg border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 text-sm font-medium">Item</th>
                          <th className="text-right p-3 text-sm font-medium">Estimado</th>
                          <th className="text-right p-3 text-sm font-medium">Realizado</th>
                          <th className="text-right p-3 text-sm font-medium">Variância</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-3 text-sm">Receita Total</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(selectedVoyage.estimatedRevenue)}</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(selectedVoyage.actualRevenue)}</td>
                          <td className={`p-3 text-sm text-right font-medium ${getVarianceColor(selectedVoyage.estimatedRevenue, selectedVoyage.actualRevenue, true)}`}>
                            {selectedVoyage.actualRevenue > 0 ? 
                              `${(((selectedVoyage.actualRevenue - selectedVoyage.estimatedRevenue) / selectedVoyage.estimatedRevenue) * 100).toFixed(1)}%` : 
                              "-"
                            }
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 text-sm">Custos Totais</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(selectedVoyage.estimatedCosts)}</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(selectedVoyage.actualCosts)}</td>
                          <td className={`p-3 text-sm text-right font-medium ${getVarianceColor(selectedVoyage.estimatedCosts, selectedVoyage.actualCosts, false)}`}>
                            {selectedVoyage.actualCosts > 0 ?
                              `${(((selectedVoyage.actualCosts - selectedVoyage.estimatedCosts) / selectedVoyage.estimatedCosts) * 100).toFixed(1)}%` :
                              "-"
                            }
                          </td>
                        </tr>
                        <tr className="bg-muted/30">
                          <td className="p-3 text-sm font-medium">Lucro Líquido</td>
                          <td className="p-3 text-sm text-right font-medium">
                            {formatCurrency(selectedVoyage.estimatedRevenue - selectedVoyage.estimatedCosts)}
                          </td>
                          <td className="p-3 text-sm text-right font-medium">
                            {formatCurrency(selectedVoyage.actualRevenue - selectedVoyage.actualCosts)}
                          </td>
                          <td className="p-3 text-sm text-right font-medium text-primary">
                            {selectedVoyage.actualRevenue > 0 ?
                              formatCurrency((selectedVoyage.actualRevenue - selectedVoyage.actualCosts) - 
                                            (selectedVoyage.estimatedRevenue - selectedVoyage.estimatedCosts)) :
                              "-"
                            }
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default VoyageAccounting;
