/**
 * Crew Wellness Panel - MLC 2006 Compliance
 * Monitoramento de bem-estar da tripulação
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  Brain,
  Moon,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Ship,
  Clock,
  Coffee,
  Smile,
  Frown,
  Meh,
  MessageCircle,
  Calendar,
  FileText,
  Sparkles,
  ChevronRight,
  Bell,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { cn } from "@/lib/utils";

// Mock data
const wellnessMetrics = {
  overallScore: 82,
  trend: "up" as const,
  hoursOfRest: 94,
  mentalHealth: 78,
  workLifeBalance: 85,
  teamMorale: 88,
};

const vesselWellness = [
  { vessel: "MV Atlântico Sul", score: 88, crew: 45, trend: "up", alerts: 0 },
  { vessel: "MV Horizonte", score: 72, crew: 38, trend: "down", alerts: 3 },
  { vessel: "MV Oceano", score: 85, crew: 42, trend: "stable", alerts: 1 },
  { vessel: "MV Pacífico", score: 91, crew: 40, trend: "up", alerts: 0 },
];

const recentAlerts = [
  { id: "1", type: "rest", crew: "João Silva", vessel: "MV Horizonte", message: "Limite de horas de trabalho próximo (68h/semana)", severity: "warning", time: "2h atrás" },
  { id: "2", type: "fatigue", crew: "Maria Santos", vessel: "MV Horizonte", message: "Indicadores de fadiga detectados", severity: "critical", time: "4h atrás" },
  { id: "3", type: "wellness", crew: "MV Horizonte", vessel: "MV Horizonte", message: "Score de bem-estar da embarcação abaixo de 75%", severity: "warning", time: "1d atrás" },
];

const restHoursData = [
  { day: "Seg", hours: 10.5, min: 10 },
  { day: "Ter", hours: 11.2, min: 10 },
  { day: "Qua", hours: 9.8, min: 10 },
  { day: "Qui", hours: 10.1, min: 10 },
  { day: "Sex", hours: 11.5, min: 10 },
  { day: "Sáb", hours: 12.0, min: 10 },
  { day: "Dom", hours: 12.5, min: 10 },
];

const moodDistribution = [
  { name: "Excelente", value: 35, color: "#22c55e" },
  { name: "Bom", value: 42, color: "#3b82f6" },
  { name: "Neutro", value: 15, color: "#f59e0b" },
  { name: "Ruim", value: 8, color: "#ef4444" },
];

const crewFeedback = [
  { id: "1", name: "Anônimo", vessel: "MV Atlântico Sul", message: "Condições de alimentação excelentes, parabéns à equipe de cozinha!", sentiment: "positive", date: "2026-02-03" },
  { id: "2", name: "Anônimo", vessel: "MV Horizonte", message: "Problemas com ar condicionado nos alojamentos - muito quente à noite", sentiment: "negative", date: "2026-02-02" },
  { id: "3", name: "Anônimo", vessel: "MV Oceano", message: "Gostaria de mais opções de atividades de lazer durante folgas", sentiment: "neutral", date: "2026-02-01" },
];

const weeklyTrend = [
  { week: "S1", score: 78 },
  { week: "S2", score: 80 },
  { week: "S3", score: 76 },
  { week: "S4", score: 82 },
  { week: "S5", score: 85 },
  { week: "S6", score: 82 },
];

function WellnessScoreCard({ title, score, icon: Icon, trend, color }: {
  title: string;
  score: number;
  icon: React.ElementType;
  trend?: "up" | "down" | "stable";
  color: string;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";

  return (
    <Card className={cn("border-l-4", color)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          {trend && <TrendIcon className={cn("h-4 w-4", trendColor)} />}
        </div>
        <p className="text-2xl font-bold">{score}%</p>
        <p className="text-xs text-muted-foreground">{title}</p>
        <Progress value={score} className="mt-2 h-1.5" />
      </CardContent>
    </Card>
  );
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const config = {
    positive: { icon: Smile, color: "text-success", bg: "bg-success/10" },
    negative: { icon: Frown, color: "text-destructive", bg: "bg-destructive/10" },
    neutral: { icon: Meh, color: "text-warning", bg: "bg-warning/10" },
  };
  const { icon: Icon, color, bg } = config[sentiment as keyof typeof config] || config.neutral;
  return (
    <div className={cn("p-1.5 rounded-full", bg)}>
      <Icon className={cn("h-4 w-4", color)} />
    </div>
  );
}

export default function CrewWellnessPanel() {
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Score Geral</p>
                <p className="text-3xl font-bold text-primary">{wellnessMetrics.overallScore}%</p>
                <div className="flex items-center gap-1 text-xs text-success mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +4% vs mês anterior
                </div>
              </div>
              <div className="h-16 w-16 relative">
                <svg className="h-16 w-16 -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" className="stroke-muted" />
                  <circle
                    cx="32" cy="32" r="28" fill="none" strokeWidth="6"
                    className="stroke-primary"
                    strokeDasharray={`${wellnessMetrics.overallScore * 1.76} 176`}
                    strokeLinecap="round"
                  />
                </svg>
                <Heart className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <WellnessScoreCard
          title="Horas de Descanso"
          score={wellnessMetrics.hoursOfRest}
          icon={Moon}
          trend="up"
          color="border-l-success"
        />
        <WellnessScoreCard
          title="Saúde Mental"
          score={wellnessMetrics.mentalHealth}
          icon={Brain}
          trend="stable"
          color="border-l-purple-500"
        />
        <WellnessScoreCard
          title="Work-Life Balance"
          score={wellnessMetrics.workLifeBalance}
          icon={Coffee}
          trend="up"
          color="border-l-cyan-500"
        />
        <WellnessScoreCard
          title="Moral da Equipe"
          score={wellnessMetrics.teamMorale}
          icon={Users}
          trend="up"
          color="border-l-orange-500"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vessel Wellness */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5 text-primary" />
                Bem-estar por Embarcação
              </CardTitle>
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Embarcações</SelectItem>
                  {vesselWellness.map((v) => (
                    <SelectItem key={v.vessel} value={v.vessel}>{v.vessel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vesselWellness
                .filter((v) => selectedVessel === "all" || v.vessel === selectedVessel)
                .map((vessel, idx) => {
                  const TrendIcon = vessel.trend === "up" ? TrendingUp : vessel.trend === "down" ? TrendingDown : Minus;
                  const trendColor = vessel.trend === "up" ? "text-success" : vessel.trend === "down" ? "text-destructive" : "text-muted-foreground";

                  return (
                    <motion.div
                      key={vessel.vessel}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-12 w-12 rounded-lg flex items-center justify-center",
                            vessel.score >= 85 ? "bg-success/10" :
                            vessel.score >= 70 ? "bg-warning/10" : "bg-destructive/10"
                          )}>
                            <Ship className={cn(
                              "h-6 w-6",
                              vessel.score >= 85 ? "text-success" :
                              vessel.score >= 70 ? "text-warning" : "text-destructive"
                            )} />
                          </div>
                          <div>
                            <p className="font-semibold">{vessel.vessel}</p>
                            <p className="text-sm text-muted-foreground">{vessel.crew} tripulantes</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {vessel.alerts > 0 && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {vessel.alerts}
                            </Badge>
                          )}
                          <div className="text-right">
                            <p className="text-2xl font-bold">{vessel.score}%</p>
                            <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
                              <TrendIcon className="h-3 w-3" />
                              <span>{vessel.trend === "up" ? "Melhorando" : vessel.trend === "down" ? "Atenção" : "Estável"}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                      <Progress 
                        value={vessel.score} 
                        className={cn(
                          "h-2",
                          vessel.score >= 85 ? "[&>div]:bg-success" :
                          vessel.score >= 70 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                        )}
                      />
                    </motion.div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-warning/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-warning" />
              Alertas MLC 2006
              <Badge variant="destructive">{recentAlerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px]">
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "p-3 rounded-lg border",
                      alert.severity === "critical" ? "border-destructive/50 bg-destructive/5" : "border-warning/50 bg-warning/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={cn(
                        "h-4 w-4 mt-0.5",
                        alert.severity === "critical" ? "text-destructive" : "text-warning"
                      )} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.crew}</p>
                        <p className="text-xs text-muted-foreground mb-1">{alert.vessel}</p>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        Resolver
                      </Button>
                      <Button size="sm" variant="ghost">
                        Ver
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rest Hours Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Horas de Descanso (Média Frota)
            </CardTitle>
            <CardDescription>MLC 2006: Mínimo 10h em período de 24h</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={restHoursData}>
                <defs>
                  <linearGradient id="restGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis domain={[8, 14]} className="text-xs" />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="hours" stroke="hsl(var(--primary))" fill="url(#restGradient)" strokeWidth={2} name="Horas" />
                <Area type="monotone" dataKey="min" stroke="hsl(var(--destructive))" strokeDasharray="5 5" fill="none" strokeWidth={1} name="Mínimo" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-primary" />
              Satisfação da Tripulação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={moodDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {moodDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Feedback da Tripulação
              </CardTitle>
              <CardDescription>Comentários anônimos recentes</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Análise IA
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {crewFeedback.map((feedback) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AN</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{feedback.name}</p>
                      <p className="text-xs text-muted-foreground">{feedback.vessel}</p>
                    </div>
                  </div>
                  <SentimentBadge sentiment={feedback.sentiment} />
                </div>
                <p className="text-sm">{feedback.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(feedback.date).toLocaleDateString("pt-BR")}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
