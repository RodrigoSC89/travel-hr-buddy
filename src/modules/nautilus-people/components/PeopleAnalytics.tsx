/**
 * People Analytics - Analytics Avançado de RH com IA
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  Sparkles,
  Target,
  Award,
  UserMinus,
  Building2,
  GraduationCap,
  Brain,
  Download,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";

const PeopleAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("12m");

  // Mock data for charts
  const turnoverData = [
    { mes: "Jan", turnover: 3.2, benchmark: 4.0 },
    { mes: "Fev", turnover: 2.8, benchmark: 4.0 },
    { mes: "Mar", turnover: 4.1, benchmark: 4.0 },
    { mes: "Abr", turnover: 3.5, benchmark: 4.0 },
    { mes: "Mai", turnover: 3.0, benchmark: 4.0 },
    { mes: "Jun", turnover: 2.5, benchmark: 4.0 },
    { mes: "Jul", turnover: 3.8, benchmark: 4.0 },
    { mes: "Ago", turnover: 4.2, benchmark: 4.0 },
    { mes: "Set", turnover: 3.6, benchmark: 4.0 },
    { mes: "Out", turnover: 2.9, benchmark: 4.0 },
    { mes: "Nov", turnover: 3.3, benchmark: 4.0 },
    { mes: "Dez", turnover: 2.7, benchmark: 4.0 }
  ];

  const headcountData = [
    { mes: "Jan", headcount: 1180, contratacoes: 25, desligamentos: 15 },
    { mes: "Fev", headcount: 1190, contratacoes: 20, desligamentos: 10 },
    { mes: "Mar", headcount: 1205, contratacoes: 30, desligamentos: 15 },
    { mes: "Abr", headcount: 1215, contratacoes: 22, desligamentos: 12 },
    { mes: "Mai", headcount: 1225, contratacoes: 18, desligamentos: 8 },
    { mes: "Jun", headcount: 1235, contratacoes: 15, desligamentos: 5 },
    { mes: "Jul", headcount: 1230, contratacoes: 10, desligamentos: 15 },
    { mes: "Ago", headcount: 1238, contratacoes: 20, desligamentos: 12 },
    { mes: "Set", headcount: 1242, contratacoes: 12, desligamentos: 8 },
    { mes: "Out", headcount: 1245, contratacoes: 14, desligamentos: 11 },
    { mes: "Nov", headcount: 1247, contratacoes: 18, desligamentos: 16 },
    { mes: "Dez", headcount: 1247, contratacoes: 23, desligamentos: 5 }
  ];

  const departmentDistribution = [
    { name: "Operações", value: 45, color: "#3B82F6" },
    { name: "Administrativo", value: 20, color: "#10B981" },
    { name: "Técnico", value: 18, color: "#F59E0B" },
    { name: "Gestão", value: 10, color: "#8B5CF6" },
    { name: "Outros", value: 7, color: "#6B7280" }
  ];

  const turnoverRiskData = [
    { colaborador: "Maria Silva", risco: 85, departamento: "Operações", motivo: "Estagnação de carreira" },
    { colaborador: "João Santos", risco: 78, departamento: "TI", motivo: "Proposta de mercado" },
    { colaborador: "Ana Costa", risco: 72, departamento: "Financeiro", motivo: "Insatisfação salarial" },
    { colaborador: "Pedro Lima", risco: 68, departamento: "QSMS", motivo: "Clima com liderança" },
    { colaborador: "Lucia Ferreira", risco: 65, departamento: "RH", motivo: "Falta de desafios" }
  ];

  const costMetrics = [
    { label: "Custo por Contratação", value: "R$ 4.850", change: "-12%", trend: "down" },
    { label: "Custo de Turnover", value: "R$ 18.500", change: "+5%", trend: "up" },
    { label: "ROI Treinamento", value: "287%", change: "+15%", trend: "up" },
    { label: "Custo por Funcionário", value: "R$ 12.400", change: "-3%", trend: "down" }
  ];

  const aiInsights = [
    {
      tipo: "alerta",
      titulo: "Risco de Turnover Elevado no Setor de TI",
      descricao: "Análise preditiva indica 23% de probabilidade de saída nos próximos 3 meses.",
      acao: "Revisar política salarial e plano de carreira"
    },
    {
      tipo: "oportunidade",
      titulo: "Potencial de Promoção Identificado",
      descricao: "12 colaboradores atingiram critérios para promoção segundo análise de performance.",
      acao: "Avaliar candidatos para posições disponíveis"
    },
    {
      tipo: "tendencia",
      titulo: "Melhoria no Engajamento",
      descricao: "Score de engajamento subiu 8% após implementação do programa de bem-estar.",
      acao: "Expandir programa para outras unidades"
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 rounded-lg border shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <Clock className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Últimos 3 meses</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
              <SelectItem value="ytd">Ano atual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {costMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  {metric.trend === "up" ? (
                    <TrendingUp className={`w-4 h-4 ${metric.label.includes("ROI") ? "text-green-500" : "text-red-500"}`} />
                  ) : (
                    <TrendingDown className={`w-4 h-4 ${metric.label.includes("Custo") ? "text-green-500" : "text-red-500"}`} />
                  )}
                </div>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className={`text-xs ${metric.trend === "up" && !metric.label.includes("ROI") ? "text-red-500" : "text-green-500"}`}>
                  {metric.change} vs período anterior
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Insights Preditivos (IA)
          </CardTitle>
          <CardDescription>Análises e recomendações baseadas em machine learning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  insight.tipo === "alerta" ? "bg-red-500/10 border-red-500/30" :
                    insight.tipo === "oportunidade" ? "bg-green-500/10 border-green-500/30" :
                      "bg-blue-500/10 border-blue-500/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {insight.tipo === "alerta" ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : insight.tipo === "oportunidade" ? (
                    <Sparkles className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  )}
                  <span className="font-medium text-sm">{insight.titulo}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{insight.descricao}</p>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  {insight.acao}
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turnover Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserMinus className="w-5 h-5" />
              Taxa de Turnover
            </CardTitle>
            <CardDescription>Comparativo com benchmark do setor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={turnoverData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="mes" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="turnover"
                    name="Turnover"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                  <Line
                    type="monotone"
                    dataKey="benchmark"
                    name="Benchmark"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Headcount Evolution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Evolução do Headcount
            </CardTitle>
            <CardDescription>Contratações vs Desligamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={headcountData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="mes" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="contratacoes" name="Contratações" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="desligamentos" name="Desligamentos" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Distribuição por Departamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {departmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Turnover Risk */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Risco de Turnover (Preditivo)
            </CardTitle>
            <CardDescription>Colaboradores com maior probabilidade de saída</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {turnoverRiskData.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{item.colaborador}</span>
                      <Badge
                        className={
                          item.risco >= 80 ? "bg-red-500" :
                            item.risco >= 70 ? "bg-orange-500" :
                              "bg-yellow-500"
                        }
                      >
                        {item.risco}% risco
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.departamento} • {item.motivo}</p>
                  </div>
                  <Progress
                    value={item.risco}
                    className="w-20 h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PeopleAnalytics;
