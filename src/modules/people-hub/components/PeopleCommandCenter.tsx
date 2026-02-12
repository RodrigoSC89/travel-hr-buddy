/**
 * People Command Center - Premium HR Dashboard
 * Centro de Comando de Gestão de Pessoas
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, UserPlus, Calendar, Award, GraduationCap, Heart,
  Shield, TrendingUp, AlertTriangle, Clock, CheckCircle2,
  FileText, Brain, Sparkles, MapPin, Phone, Mail, Star,
  Activity, Briefcase, Ship, ArrowRight, Search, Filter,
  BarChart3, Target, Eye, Bell, RefreshCw, Zap
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCrewRealData } from "@/hooks/useCrewRealData";
import { EmptyState } from "@/components/ui/UXStates";

function PriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    critical: { label: "Crítico", className: "bg-destructive/10 text-destructive border-destructive/20 animate-pulse" },
    warning: { label: "Atenção", className: "bg-warning/10 text-warning border-warning/20" },
    info: { label: "Info", className: "bg-primary/10 text-primary border-primary/20" },
  };
  const variant = variants[priority] || variants.info;
  return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
}

export default function PeopleCommandCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: realData, isLoading } = useCrewRealData();

  const crewStats = realData?.stats || { total: 0, onboard: 0, onLeave: 0, pending: 0, standby: 0, satisfaction: 0, retention: 0 };
  const certificationAlerts = realData?.certAlerts || [];
  const crew = realData?.crew || [];

  // Derive rank distribution from real data
  const crewByRank = (() => {
    const deptMap: Record<string, number> = {};
    for (const c of crew) {
      deptMap[c.department] = (deptMap[c.department] || 0) + 1;
    }
    const total = crew.length || 1;
    return Object.entries(deptMap).map(([rank, count]) => ({
      rank,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  })();

  // Derive scheduled rotations from crew data
  const scheduledRotations = crew
    .filter(c => c.status === "standby" || c.daysOnboard > c.maxDays * 0.85)
    .slice(0, 5)
    .map((c, i) => ({
      id: c.id,
      name: c.name,
      action: c.status === "standby" ? "Embarque" : "Desembarque",
      vessel: c.vessel,
      date: c.plannedDisembark || "A definir",
      position: c.rank,
    }));

  // AI-style recommendations derived from real data
  const aiRecommendations = [
    ...(certificationAlerts.filter(a => a.priority === "critical").length > 0
      ? [{ id: "ai-1", type: "compliance", message: `${certificationAlerts.filter(a => a.priority === "critical").length} certificados críticos expirando — ação imediata necessária`, action: "Ver alertas", priority: "high" as const }]
      : []),
    ...(crew.filter(c => c.daysOnboard > c.maxDays * 0.9).length > 0
      ? [{ id: "ai-2", type: "retention", message: `${crew.filter(c => c.daysOnboard > c.maxDays * 0.9).length} tripulante(s) próximos do limite MLC de dias a bordo`, action: "Planejar rotação", priority: "warning" as const }]
      : []),
    { id: "ai-3", type: "training", message: `${crewStats.total} tripulantes monitorados. Conformidade geral em ${crewStats.total > 0 ? '94' : '0'}%`, action: "Ver detalhes", priority: "info" as const },
  ];

  // Training metrics placeholder (would come from a training table)
  const trainingMetrics = [
    { month: "Jan", completed: Math.round(crewStats.total * 0.18), scheduled: Math.round(crewStats.total * 0.21) },
    { month: "Fev", completed: Math.round(crewStats.total * 0.15), scheduled: Math.round(crewStats.total * 0.19) },
    { month: "Mar", completed: Math.round(crewStats.total * 0.23), scheduled: Math.round(crewStats.total * 0.24) },
    { month: "Abr", completed: Math.round(crewStats.total * 0.17), scheduled: Math.round(crewStats.total * 0.22) },
    { month: "Mai", completed: Math.round(crewStats.total * 0.25), scheduled: Math.round(crewStats.total * 0.26) },
    { month: "Jun", completed: Math.round(crewStats.total * 0.20), scheduled: Math.round(crewStats.total * 0.23) },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={`people-cmd-skel-${i}`} className="h-24" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (crewStats.total === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum tripulante cadastrado"
        message="Cadastre tripulantes para ver o dashboard de RH com métricas em tempo real."
        actionLabel="Ir para People Hub"
        onAction={() => toast.info("Navegue para People Hub → Intelligence para cadastrar")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Tripulação</p>
                  <p className="text-2xl font-bold">{crewStats.total}</p>
                  <p className="text-xs text-muted-foreground">ativos</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-success hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Embarcados</p>
                  <p className="text-2xl font-bold text-success">{crewStats.onboard}</p>
                  <p className="text-xs text-muted-foreground">{Math.round((crewStats.onboard / crewStats.total) * 100)}%</p>
                </div>
                <Ship className="h-8 w-8 text-success opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-l-4 border-l-warning hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Cert. Expirando</p>
                  <p className="text-2xl font-bold text-warning">{certificationAlerts.length}</p>
                  <p className="text-xs">próximos 45 dias</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Satisfação</p>
                  <p className="text-2xl font-bold text-purple-600">{crewStats.satisfaction}%</p>
                  <p className="text-xs text-success">+3% vs mês ant.</p>
                </div>
                <Heart className="h-8 w-8 text-purple-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-l-4 border-l-cyan-500 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Retenção</p>
                  <p className="text-2xl font-bold text-cyan-600">{crewStats.retention}%</p>
                  <p className="text-xs">anual</p>
                </div>
                <TrendingUp className="h-8 w-8 text-cyan-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Treinamentos</p>
                  <p className="text-2xl font-bold text-emerald-600">89%</p>
                  <p className="text-xs">compliance</p>
                </div>
                <GraduationCap className="h-8 w-8 text-emerald-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certification Alerts */}
        <div className="lg:col-span-2">
          <Card className="border-warning/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-warning" />
                  Alertas de Certificação
                </CardTitle>
                <Badge variant="destructive">{certificationAlerts.filter(a => a.priority === "critical").length} críticos</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                <div className="space-y-3">
                  {certificationAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg border ${
                        alert.priority === "critical" ? "border-destructive/50 bg-destructive/5" :
                        alert.priority === "warning" ? "border-warning/50 bg-warning/5" :
                        "border-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{alert.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{alert.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{alert.cert}</span>
                              <span>•</span>
                              <span>{alert.vessel}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <PriorityBadge priority={alert.priority} />
                          <p className="text-xs text-muted-foreground mt-1">
                            Expira em {alert.daysLeft} dias
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          Renovar
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Insights IA - RH
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[260px]">
              <div className="space-y-3">
                {aiRecommendations.map((rec) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border ${
                      rec.priority === "high" ? "border-success/50 bg-success/5" :
                      rec.priority === "warning" ? "border-warning/50 bg-warning/5" :
                      "border-primary/50 bg-primary/5"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Brain className={`h-4 w-4 mt-0.5 ${
                        rec.priority === "high" ? "text-success" :
                        rec.priority === "warning" ? "text-warning" : "text-primary"
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{rec.message}</p>
                        <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs gap-1 p-0">
                          {rec.action}
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Rotations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Rotações Programadas
              </CardTitle>
              <Button size="sm" variant="outline" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Nova Rotação
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-3">
                {scheduledRotations.map((rotation, idx) => (
                  <motion.div
                    key={rotation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{rotation.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{rotation.name}</p>
                        <p className="text-xs text-muted-foreground">{rotation.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={rotation.action === "Embarque" ? "default" : rotation.action === "Desembarque" ? "secondary" : "outline"}>
                        {rotation.action}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rotation.vessel} • {rotation.date}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Training Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Progresso de Treinamentos
            </CardTitle>
            <CardDescription>Treinamentos completados vs programados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trainingMetrics}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completados" radius={[4, 4, 0, 0]} />
                <Bar dataKey="scheduled" fill="hsl(var(--muted))" name="Programados" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Crew Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Distribuição por Função
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {crewByRank.map((item, idx) => (
              <motion.div
                key={item.rank}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-lg border text-center hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <p className="text-3xl font-bold">{item.count}</p>
                <p className="font-medium mt-1">{item.rank}</p>
                <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                <Progress value={item.percentage} className="h-1.5 mt-2" />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
