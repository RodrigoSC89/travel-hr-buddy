/**
 * Travel Analytics & Intelligence Panel
 * Dashboards executivos, análise de gastos e compliance
 */

import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  LineChart,
  DollarSign,
  Plane,
  Building2,
  Car,
  Users,
  Target,
  Award,
  AlertTriangle,
  CheckCircle2,
  Download,
  Calendar,
  Filter,
  Sparkles,
  Brain,
  Leaf,
  Globe,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Legend,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart as RechartsLine,
  Line
} from "recharts";

const spendTrendData = [
  { month: "Jan", flights: 125000, hotels: 85000, cars: 15000, other: 12000 },
  { month: "Fev", flights: 132000, hotels: 78000, cars: 18000, other: 10000 },
  { month: "Mar", flights: 145000, hotels: 92000, cars: 22000, other: 15000 },
  { month: "Abr", flights: 138000, hotels: 88000, cars: 20000, other: 14000 },
  { month: "Mai", flights: 158000, hotels: 95000, cars: 25000, other: 18000 },
  { month: "Jun", flights: 142000, hotels: 82000, cars: 19000, other: 11000 }
];

const categoryData = [
  { name: "Passagens Aéreas", value: 840000, color: "#3b82f6" },
  { name: "Hospedagem", value: 520000, color: "#22c55e" },
  { name: "Aluguel de Carros", value: 119000, color: "#f59e0b" },
  { name: "Refeições", value: 85000, color: "#ef4444" },
  { name: "Transporte Terrestre", value: 45000, color: "#8b5cf6" },
  { name: "Outros", value: 80000, color: "#6b7280" }
];

const departmentData = [
  { department: "Operações", spend: 450000, trips: 89, travelers: 42 },
  { department: "Manutenção", spend: 320000, trips: 65, travelers: 28 },
  { department: "Engenharia", spend: 280000, trips: 52, travelers: 24 },
  { department: "Administrativo", spend: 150000, trips: 35, travelers: 18 },
  { department: "Comercial", spend: 120000, trips: 42, travelers: 15 }
];

const complianceData = [
  { month: "Jan", compliant: 85, outOfPolicy: 15 },
  { month: "Fev", compliant: 88, outOfPolicy: 12 },
  { month: "Mar", compliant: 82, outOfPolicy: 18 },
  { month: "Abr", compliant: 91, outOfPolicy: 9 },
  { month: "Mai", compliant: 89, outOfPolicy: 11 },
  { month: "Jun", compliant: 93, outOfPolicy: 7 }
];

const supplierPerformance = [
  { name: "LATAM", onTime: 94, satisfaction: 4.5, savings: 12, volume: 320000 },
  { name: "Gol", onTime: 88, satisfaction: 4.2, savings: 8, volume: 280000 },
  { name: "Azul", onTime: 91, satisfaction: 4.4, savings: 10, volume: 240000 },
  { name: "Atlantica Hotels", onTime: 98, satisfaction: 4.6, savings: 15, volume: 180000 },
  { name: "Accor", onTime: 96, satisfaction: 4.3, savings: 11, volume: 150000 },
  { name: "Localiza", onTime: 92, satisfaction: 4.1, savings: 6, volume: 85000 }
];

const aiPredictions = [
  {
    type: "price",
    title: "Preços de Voos Subirão",
    description: "Rota GIG-MCE: aumento esperado de 18% nas próximas 2 semanas devido à alta temporada offshore.",
    action: "Antecipar reservas",
    confidence: 87,
    impact: "R$ 25.000"
  },
  {
    type: "demand",
    title: "Pico de Demanda Previsto",
    description: "Março 2026: 40% mais mobilizações previstas devido a novos contratos P&G.",
    action: "Negociar block seats",
    confidence: 92,
    impact: "R$ 45.000"
  },
  {
    type: "savings",
    title: "Oportunidade de Economia",
    description: "Consolidar hospedagem em Macaé pode gerar economia de 22% com contrato corporativo.",
    action: "Iniciar negociação",
    confidence: 78,
    impact: "R$ 68.000/ano"
  }
];

export const TravelAnalyticsPanel: React.FC = () => {
  const [period, setPeriod] = useState("ytd");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytics de Viagens
          </h2>
          <p className="text-muted-foreground">Análise completa de gastos, compliance e performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">Este Mês</SelectItem>
              <SelectItem value="qtd">Este Trimestre</SelectItem>
              <SelectItem value="ytd">Este Ano</SelectItem>
              <SelectItem value="12m">Últimos 12 Meses</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => toast("Filtros aplicados para: " + period, { description: "Selecione o período acima para ajustar a visualização dos dados." })}>
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" onClick={() => {
            const csv = ["Mês;Aéreo;Hotel;Carro;Outros", ...spendTrendData.map(d => `${d.month};${d.flights};${d.hotels};${d.cars};${d.other}`)].join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `travel-analytics-${period}.csv`; a.click(); URL.revokeObjectURL(url);
            toast.success("Analytics de viagens exportado como CSV");
          }}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gasto Total</p>
                <p className="text-2xl font-bold">R$ 1.68M</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span>-8% vs ano anterior</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Viagens</p>
                <p className="text-2xl font-bold">283</p>
                <div className="flex items-center text-sm text-blue-600 mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+12% vs ano anterior</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Plane className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Viajantes Ativos</p>
                <p className="text-2xl font-bold">127</p>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Users className="h-4 w-4 mr-1" />
                  <span>18 em viagem agora</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Compliance</p>
                <p className="text-2xl font-bold">93%</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+5% vs mês anterior</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia Gerada</p>
                <p className="text-2xl font-bold">R$ 185K</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <Award className="h-4 w-4 mr-1" />
                  <span>11% do total</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="spend" className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="spend" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Gastos
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="sustainability" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Sustentabilidade
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA Preditiva
          </TabsTrigger>
        </TabsList>

        {/* Spend Analysis Tab */}
        <TabsContent value="spend" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Spend Trend Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Tendência de Gastos por Categoria</CardTitle>
                <CardDescription>Evolução mensal por tipo de despesa</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={spendTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Legend />
                    <Area type="monotone" dataKey="flights" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Aéreo" />
                    <Area type="monotone" dataKey="hotels" stackId="1" stroke="#22c55e" fill="#22c55e" name="Hotel" />
                    <Area type="monotone" dataKey="cars" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Carro" />
                    <Area type="monotone" dataKey="other" stackId="1" stroke="#6b7280" fill="#6b7280" name="Outros" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>Total YTD</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span>{cat.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Departamento</CardTitle>
              <CardDescription>Análise detalhada de custos por área</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Departamento</th>
                      <th className="text-right py-3 px-4 font-medium">Gasto Total</th>
                      <th className="text-right py-3 px-4 font-medium">Viagens</th>
                      <th className="text-right py-3 px-4 font-medium">Viajantes</th>
                      <th className="text-right py-3 px-4 font-medium">Custo Médio/Viagem</th>
                      <th className="text-left py-3 px-4 font-medium">% do Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentData.map((dept) => {
                      const total = departmentData.reduce((sum, d) => sum + d.spend, 0);
                      const percentage = (dept.spend / total) * 100;
                      return (
                        <tr key={dept.department} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{dept.department}</td>
                          <td className="text-right py-3 px-4">{formatCurrency(dept.spend)}</td>
                          <td className="text-right py-3 px-4">{dept.trips}</td>
                          <td className="text-right py-3 px-4">{dept.travelers}</td>
                          <td className="text-right py-3 px-4">{formatCurrency(dept.spend / dept.trips)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Progress value={percentage} className="w-24 h-2" />
                              <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Taxa de Compliance ao Longo do Tempo</CardTitle>
                <CardDescription>Evolução mensal da conformidade com políticas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={complianceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="compliant" stackId="a" fill="#22c55e" name="Dentro da Política" />
                    <Bar dataKey="outOfPolicy" stackId="a" fill="#ef4444" name="Fora da Política" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Violações por Tipo</CardTitle>
                <CardDescription>Principais causas de não-conformidade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Classe de Cabine", count: 23, trend: -15 },
                    { type: "Reserva Tardia", count: 18, trend: -8 },
                    { type: "Limite de Preço", count: 15, trend: 5 },
                    { type: "Fornecedor Não Preferido", count: 12, trend: -20 },
                    { type: "Sem Aprovação", count: 8, trend: -30 }
                  ].map((violation) => (
                    <div key={violation.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{violation.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{violation.count}</Badge>
                        <span className={`text-xs flex items-center ${violation.trend < 0 ? "text-green-600" : "text-red-600"}`}>
                          {violation.trend < 0 ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {Math.abs(violation.trend)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance de Fornecedores</CardTitle>
              <CardDescription>Análise comparativa dos principais parceiros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Fornecedor</th>
                      <th className="text-center py-3 px-4 font-medium">Pontualidade</th>
                      <th className="text-center py-3 px-4 font-medium">Satisfação</th>
                      <th className="text-center py-3 px-4 font-medium">Economia</th>
                      <th className="text-right py-3 px-4 font-medium">Volume</th>
                      <th className="text-center py-3 px-4 font-medium">Score Geral</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierPerformance.map((supplier) => {
                      const score = ((supplier.onTime + supplier.satisfaction * 20 + supplier.savings * 5) / 3).toFixed(0);
                      return (
                        <tr key={supplier.name} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{supplier.name}</td>
                          <td className="text-center py-3 px-4">
                            <Badge variant={supplier.onTime >= 90 ? "default" : "outline"} className={supplier.onTime >= 90 ? "bg-green-500" : ""}>
                              {supplier.onTime}%
                            </Badge>
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <span>⭐</span>
                              <span>{supplier.satisfaction.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="text-green-600">-{supplier.savings}%</span>
                          </td>
                          <td className="text-right py-3 px-4">{formatCurrency(supplier.volume)}</td>
                          <td className="text-center py-3 px-4">
                            <Badge className={Number(score) >= 80 ? "bg-green-500" : Number(score) >= 60 ? "bg-yellow-500" : "bg-red-500"}>
                              {score}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sustainability Tab */}
        <TabsContent value="sustainability" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">CO₂ Total</p>
                    <p className="text-2xl font-bold">245 ton</p>
                    <p className="text-xs text-green-600">-12% vs ano anterior</p>
                  </div>
                  <Leaf className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">CO₂/Viagem</p>
                    <p className="text-2xl font-bold">0.87 ton</p>
                    <p className="text-xs text-green-600">-8% vs média</p>
                  </div>
                  <Plane className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Viagens Evitadas</p>
                    <p className="text-2xl font-bold">45</p>
                    <p className="text-xs text-muted-foreground">Via reuniões virtuais</p>
                  </div>
                  <Globe className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Compensação</p>
                    <p className="text-2xl font-bold">R$ 12.5K</p>
                    <p className="text-xs text-muted-foreground">Créditos de carbono</p>
                  </div>
                  <Target className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Predictions Tab */}
        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiPredictions.map((prediction, idx) => (
              <Card key={idx} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{prediction.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{prediction.confidence}% confiança</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{prediction.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Impacto Estimado</p>
                      <p className="font-bold text-green-600">{prediction.impact}</p>
                    </div>
                    <Button size="sm" onClick={() => toast.success(`${prediction.action}`, { description: `${prediction.title} - Impacto: ${prediction.impact}. Predição aplicada com sucesso.` })}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {prediction.action}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TravelAnalyticsPanel;
