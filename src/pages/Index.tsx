import React, { useMemo } from "react";
import { ProfessionalHeader } from "@/components/dashboard/professional-header";
import { ProfessionalKPICard } from "@/components/dashboard/professional-kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Ship, TrendingUp, Activity, CheckCircle, DollarSign, Users, Target, AlertTriangle, BarChart3, LineChart, Shield } from "lucide-react";
import { AreaChart, Area, LineChart as RechartsLine, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { usePreviewSafeMode } from "@/hooks/qa/usePreviewSafeMode";

// Dados mockados
const revenueData = [
  { month: "Jan", revenue: 42000, target: 40000 },
  { month: "Fev", revenue: 48000, target: 45000 },
  { month: "Mar", revenue: 52000, target: 50000 },
  { month: "Abr", revenue: 58000, target: 55000 },
  { month: "Mai", revenue: 65000, target: 60000 },
  { month: "Jun", revenue: 72000, target: 70000 },
];

const fleetData = [
  { name: "Operacional", value: 20, color: "#10b981" },
  { name: "Manutenção", value: 3, color: "#f59e0b" },
  { name: "Standby", value: 1, color: "#3b82f6" },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // PATCH 624 - Preview Safe Mode
  const { isValidated, validationPassed, shouldShowData } = usePreviewSafeMode({
    componentName: "Index",
    enableValidation: true,
    maxRenderTime: 2000,
    silenceErrors: true
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div className="flex items-center justify-between">
        <ProfessionalHeader
          title="Dashboard Executivo"
          subtitle="Visão estratégica e métricas em tempo real - Sistema Nautilus One"
          showLogo={true}
          showRealTime={true}
        />
        <Link to="/qa/preview">
          <Button variant="outline" size="sm" className="gap-2">
            <Shield className="h-4 w-4" />
            QA Dashboard
          </Button>
        </Link>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProfessionalKPICard
          title="Receita Total"
          value="72.5"
          prefix="R$ "
          suffix="K"
          icon={DollarSign}
          color="green"
          change={12.5}
          trend="vs mês anterior"
          delay={0}
        />
        <ProfessionalKPICard
          title="Embarcações Ativas"
          value="24"
          icon={Ship}
          color="blue"
          change={8.3}
          trend="frota operacional"
          delay={0.1}
        />
        <ProfessionalKPICard
          title="Taxa de Compliance"
          value="94.2"
          suffix="%"
          icon={CheckCircle}
          color="purple"
          change={2.8}
          trend="meta: 95%"
          delay={0.2}
        />
        <ProfessionalKPICard
          title="Eficiência Operacional"
          value="89.7"
          suffix="%"
          icon={Target}
          color="orange"
          change={5.2}
          trend="acima da meta"
          delay={0.3}
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-primary/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="operations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Operações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-primary" />
                    Evolução de Receita
                  </CardTitle>
                  <CardDescription>Receita mensal vs meta estabelecida</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)"
                        name="Receita (R$)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Meta (R$)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Fleet Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5 text-primary" />
                    Status da Frota
                  </CardTitle>
                  <CardDescription>Distribuição atual das embarcações</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={fleetData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {fleetData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex p-4 rounded-full bg-green-500/10 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-4xl font-bold font-playfair text-green-600 mb-2">96.8%</p>
                <p className="text-sm text-muted-foreground">Uptime Geral da Frota</p>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex p-4 rounded-full bg-blue-500/10 mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-4xl font-bold font-playfair text-blue-600 mb-2">347</p>
                <p className="text-sm text-muted-foreground">Tripulantes Ativos</p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-purple-500/5">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex p-4 rounded-full bg-purple-500/10 mb-4">
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-4xl font-bold font-playfair text-purple-600 mb-2">12</p>
                <p className="text-sm text-muted-foreground">Missões em Andamento</p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="financial">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Análise Financeira</CardTitle>
              <CardDescription>Detalhamento de receitas e custos operacionais</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Receita" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="target" fill="#10b981" name="Meta" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Indicadores Operacionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Missões Completadas</span>
                  <span className="text-2xl font-bold font-playfair">148</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxa de Sucesso</span>
                  <span className="text-2xl font-bold font-playfair text-green-600">98.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tempo Médio de Resposta</span>
                  <span className="text-2xl font-bold font-playfair text-blue-600">24min</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Alertas Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Manutenção Programada</p>
                      <p className="text-xs text-muted-foreground">Atlântico I - 15/11/2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nova Missão Atribuída</p>
                      <p className="text-xs text-muted-foreground">Pacífico II - Operação Alpha</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;