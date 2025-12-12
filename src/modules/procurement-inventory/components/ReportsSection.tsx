import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  FileText,
  DollarSign,
  Package,
  Building2,
  AlertTriangle,
  Brain,
  Sparkles,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";

// Mock data
const spendingByCategory = [
  { category: "Manutenção", value: 145000, percentage: 35 },
  { category: "Consumíveis", value: 89000, percentage: 22 },
  { category: "Segurança", value: 67000, percentage: 16 },
  { category: "DP System", value: 78000, percentage: 19 },
  { category: "Outros", value: 33000, percentage: 8 },
];

const monthlySpending = [
  { month: "Jul", spending: 42000, orders: 18 },
  { month: "Ago", spending: 38000, orders: 15 },
  { month: "Set", spending: 52000, orders: 22 },
  { month: "Out", spending: 48000, orders: 20 },
  { month: "Nov", spending: 55000, orders: 24 },
  { month: "Dez", spending: 58000, orders: 26 },
];

const supplierPerformance = [
  { name: "HidroMar", onTime: 97, quality: 95, savings: 12 },
  { name: "NavTech", onTime: 99, quality: 98, savings: 8 },
  { name: "PetroLub", onTime: 94, quality: 90, savings: 15 },
  { name: "SafetyFirst", onTime: 85, quality: 85, savings: 5 },
];

const inventoryValue = [
  { category: "Manutenção", value: 85000, items: 245 },
  { category: "Consumíveis", value: 42000, items: 180 },
  { category: "Segurança", value: 28000, items: 95 },
  { category: "DP System", value: 120000, items: 45 },
];

const stockMovements = [
  { month: "Jul", entries: 85, exits: 72 },
  { month: "Ago", entries: 92, exits: 88 },
  { month: "Set", entries: 78, exits: 81 },
  { month: "Out", entries: 105, exits: 95 },
  { month: "Nov", entries: 118, exits: 102 },
  { month: "Dez", entries: 95, exits: 89 },
];

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function ReportsSection() {
  const [period, setPeriod] = useState("6months");
  const [reportType, setReportType] = useState("spending");

  const handleExport = (format: string) => {
    toast.success(`Relatório exportado em formato ${format.toUpperCase()}`);
  });

  const handleGenerateAIReport = () => {
    toast.success("Relatório com análise IA sendo gerado...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Relatórios e Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Análises de gastos, estoque, fornecedores e previsões com IA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="1year">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handlehandleExport}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => handlehandleExport}>
            <FileText className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button onClick={handleGenerateAIReport}>
            <Brain className="h-4 w-4 mr-2" />
            Relatório IA
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gastos Totais</p>
                <p className="text-2xl font-bold">R$ 412k</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowDownRight className="h-3 w-3" />
                  -5% vs período anterior
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia IA</p>
                <p className="text-2xl font-bold">R$ 38k</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Sparkles className="h-3 w-3" />
                  Negociações automáticas
                </div>
              </div>
              <Brain className="h-8 w-8 text-purple-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pedidos</p>
                <p className="text-2xl font-bold">125</p>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <ArrowUpRight className="h-3 w-3" />
                  +12% vs período anterior
                </div>
              </div>
              <Package className="h-8 w-8 text-blue-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa On-Time</p>
                <p className="text-2xl font-bold">94%</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  +3% vs período anterior
                </div>
              </div>
              <Target className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Estoque</p>
                <p className="text-2xl font-bold">R$ 275k</p>
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <Clock className="h-3 w-3" />
                  Giro: 5.2x
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-amber-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="spending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="spending">Gastos</TabsTrigger>
          <TabsTrigger value="inventory">Estoque</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="predictions">Previsões IA</TabsTrigger>
        </TabsList>

        <TabsContent value="spending" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Spending Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Gastos Mensais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={monthlySpending}>
                    <defs>
                      <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" tickFormatter={(v) => `R$${v/1000}k`} />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--popover))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number, name: string) => [
                        name === "spending" ? `R$ ${value.toLocaleString()}` : value,
                        name === "spending" ? "Gastos" : "Pedidos"
                      ]}
                    />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="spending" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorSpending)"
                      name="spending"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="orders" 
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-2))" }}
                      name="orders"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Spending by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={spendingByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="category"
                    >
                      {spendingByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--popover))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString()}`, ""]}
                    />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Category Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {spendingByCategory.map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{cat.category}</span>
                        <span className="font-semibold">R$ {(cat.value / 1000).toFixed(0)}k</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${cat.percentage}%`,
                            backgroundColor: COLORS[idx % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Value */}
            <Card>
              <CardHeader>
                <CardTitle>Valor em Estoque por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryValue} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tickFormatter={(v) => `R$${v/1000}k`} className="text-xs" />
                    <YAxis type="category" dataKey="category" className="text-xs" width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--popover))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString()}`, "Valor"]}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Stock Movements */}
            <Card>
              <CardHeader>
                <CardTitle>Movimentações de Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stockMovements}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--popover))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="entries" fill="hsl(var(--chart-2))" name="Entradas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="exits" fill="hsl(var(--chart-4))" name="Saídas" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Inventory KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {inventoryValue.map((cat, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{cat.category}</Badge>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">R$ {(cat.value / 1000).toFixed(0)}k</p>
                  <p className="text-sm text-muted-foreground">{cat.items} SKUs</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance de Fornecedores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={supplierPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 100]} className="text-xs" />
                  <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--popover))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="onTime" fill="hsl(var(--primary))" name="% On-Time" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="quality" fill="hsl(var(--chart-2))" name="% Qualidade" radius={[0, 4, 4, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {supplierPerformance.map((supplier, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{supplier.name}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">On-Time</span>
                      <span className={supplier.onTime >= 95 ? "text-green-600" : supplier.onTime >= 90 ? "text-amber-600" : "text-red-600"}>
                        {supplier.onTime}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Qualidade</span>
                      <span className={supplier.quality >= 95 ? "text-green-600" : supplier.quality >= 90 ? "text-amber-600" : "text-red-600"}>
                        {supplier.quality}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Economia</span>
                      <span className="text-green-600">+{supplier.savings}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Previsões e Recomendações IA
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Preditivo
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-background/50 border">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold">Alertas de Estoque</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Com base no consumo histórico, a IA prevê:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-destructive" />
                      Filtro de óleo: estoque esgota em 7 dias
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Válvula DP: estoque esgota em 15 dias
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Graxa rolamentos: excesso de 50kg
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-background/50 border">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">Oportunidades de Economia</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    A IA identificou oportunidades:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Consolidar pedidos HidroMar: -8% custo
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Renegociar contrato PetroLub: -12% volume
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Substituir fornecedor EPIs: -15%
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-background/50 border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold">Previsão de Demanda</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Próximo trimestre:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center justify-between">
                      <span>Gastos estimados:</span>
                      <span className="font-semibold">R$ 180k</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Pedidos previstos:</span>
                      <span className="font-semibold">72</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Confiança:</span>
                      <Badge variant="outline">92%</Badge>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-background/50 border">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Ações Recomendadas</span>
                  </div>
                  <div className="space-y-2">
                    <Button size="sm" className="w-full justify-start">
                      <Package className="h-4 w-4 mr-2" />
                      Gerar POs automáticos (3 itens)
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <Building2 className="h-4 w-4 mr-2" />
                      Revisar fornecedor SafetyFirst
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Otimizar níveis de estoque
                    </Button>
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
