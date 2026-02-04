/**
 * Environmental Dashboard - Dashboard Ambiental Integrado
 * Visualização completa de métricas ambientais e sustentabilidade
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Leaf, Droplets, Recycle, Wind, Thermometer, 
  TrendingDown, TrendingUp, AlertTriangle, CheckCircle2,
  Globe, Ship, Fuel, Zap, Factory, BarChart3, Target,
  Award, Calendar, Download, Brain, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";

const emissionsData = [
  { month: "Jan", co2: 450, sox: 12, nox: 28, voc: 5 },
  { month: "Fev", co2: 420, sox: 11, nox: 25, voc: 4 },
  { month: "Mar", co2: 480, sox: 13, nox: 30, voc: 6 },
  { month: "Abr", co2: 390, sox: 9, nox: 22, voc: 4 },
  { month: "Mai", co2: 410, sox: 10, nox: 24, voc: 5 },
  { month: "Jun", co2: 370, sox: 8, nox: 20, voc: 3 },
];

const wasteBreakdown = [
  { name: "Óleo Usado", value: 35, color: "#6366f1" },
  { name: "Água de Porão", value: 28, color: "#3b82f6" },
  { name: "Esgoto", value: 20, color: "#10b981" },
  { name: "Resíduos Sólidos", value: 12, color: "#f59e0b" },
  { name: "Plásticos", value: 5, color: "#ef4444" },
];

const complianceMetrics = [
  { regulation: "MARPOL Anexo I", status: "compliant", score: 100, details: "Óleo e resíduos oleosos" },
  { regulation: "MARPOL Anexo IV", status: "compliant", score: 100, details: "Esgoto sanitário" },
  { regulation: "MARPOL Anexo V", status: "compliant", score: 98, details: "Lixo e resíduos sólidos" },
  { regulation: "MARPOL Anexo VI", status: "warning", score: 92, details: "Emissões atmosféricas" },
  { regulation: "BWM Convention", status: "compliant", score: 100, details: "Água de lastro" },
  { regulation: "EU MRV", status: "compliant", score: 95, details: "Monitoramento CO₂" },
];

const ciiRating = {
  current: "B",
  target: "A",
  score: 4.2,
  trend: -8,
  forecast: "A esperado em 2025 com medidas atuais"
};

export default function EnvironmentalDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"month" | "quarter" | "year">("month");

  return (
    <div className="space-y-6">
      {/* Header KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Score ESG</p>
                  <p className="text-3xl font-bold text-emerald-600">87</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +5 vs mês anterior
                  </p>
                </div>
                <div className="p-3 rounded-full bg-emerald-500/20">
                  <Leaf className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Emissões CO₂</p>
                  <p className="text-2xl font-bold">370</p>
                  <p className="text-xs text-primary flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    -12% redução
                  </p>
                </div>
                <Factory className="h-8 w-8 text-muted-foreground opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Rating CII</p>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    {ciiRating.current}
                    <Badge variant="secondary" className="text-xs">Meta: {ciiRating.target}</Badge>
                  </p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    {ciiRating.trend}% vs ano anterior
                  </p>
                </div>
                <Award className="h-8 w-8 text-amber-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Eficiência Combustível</p>
                  <p className="text-2xl font-bold">8.2</p>
                  <p className="text-xs text-muted-foreground">g CO₂/ton-mile</p>
                </div>
                <Fuel className="h-8 w-8 text-blue-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-success/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Conformidade MARPOL</p>
                  <p className="text-2xl font-bold text-success">100%</p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Todos anexos OK
                  </p>
                </div>
                <Ship className="h-8 w-8 text-success opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emissions Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5 text-muted-foreground" />
                  Emissões Atmosféricas
                </CardTitle>
                <CardDescription>Tendência mensal de emissões (toneladas)</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={selectedPeriod === "month" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedPeriod("month")}
                >
                  Mês
                </Button>
                <Button 
                  variant={selectedPeriod === "quarter" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedPeriod("quarter")}
                >
                  Trimestre
                </Button>
                <Button 
                  variant={selectedPeriod === "year" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedPeriod("year")}
                >
                  Ano
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={emissionsData}>
                  <defs>
                    <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="co2" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorCo2)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-sm">CO₂ (ton)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -17.8% vs Jan
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Waste Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Recycle className="h-5 w-5 text-emerald-500" />
              Composição de Resíduos
            </CardTitle>
            <CardDescription>Distribuição por categoria (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {wasteBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {wasteBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                Status de Conformidade Ambiental
              </CardTitle>
              <CardDescription>Regulamentações internacionais e certificações</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Relatório Completo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complianceMetrics.map((metric, index) => (
              <motion.div
                key={metric.regulation}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`${
                  metric.status === "compliant" ? "border-success/30" :
                  metric.status === "warning" ? "border-warning/30" : "border-destructive/30"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{metric.regulation}</h4>
                        <p className="text-xs text-muted-foreground">{metric.details}</p>
                      </div>
                      {metric.status === "compliant" ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Conformidade</span>
                        <span className={`font-bold ${
                          metric.score >= 95 ? "text-success" :
                          metric.score >= 80 ? "text-warning" : "text-destructive"
                        }`}>
                          {metric.score}%
                        </span>
                      </div>
                      <Progress 
                        value={metric.score} 
                        className={`h-2 ${
                          metric.score >= 95 ? "[&>div]:bg-success" :
                          metric.score >= 80 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="bg-gradient-to-br from-purple-500/5 via-background to-blue-500/5 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Recomendações IA para Sustentabilidade
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Análise Preditiva
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Target className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Otimização de Rota</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ajuste de velocidade em 2 nós pode reduzir emissões em 15% e economizar $12K/viagem
                    </p>
                    <Button size="sm" className="mt-3" variant="outline">
                      Ver Análise
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Droplets className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Previsão de Descarte</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Água de porão atingirá 95% em 48h. Porto de Santos tem recepção disponível.
                    </p>
                    <Button size="sm" className="mt-3" variant="outline">
                      Agendar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Zap className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Eficiência Energética</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Limpeza de casco pode melhorar eficiência em 8%. Última limpeza há 6 meses.
                    </p>
                    <Button size="sm" className="mt-3" variant="outline">
                      Programar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
