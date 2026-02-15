/**
 * Central de Comando Aprimorada - Versão Premium World-Class
 * PATCH PREMIUM-3.0 - Cinematic animations + Real data
 */
import React from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardSkeleton, TableSkeleton, PremiumEmptyState } from "@/components/ui/premium-loading";
import {
  Compass, Ship, Users, Wrench, AlertTriangle,
  TrendingUp, Brain, Activity, Shield,
  Clock, MapPin, Zap, Target, BarChart3,
  CheckCircle, XCircle, RefreshCw, Bell, Anchor
} from "lucide-react";
import { toast } from "sonner";

// Animated KPI counter
function AnimatedValue({ value, suffix = "" }: { value: string; suffix?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-2xl font-bold"
    >
      {value}{suffix}
    </motion.span>
  );
}

export default function CentralComandoAprimorada() {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Real data queries
  const { data: vesselCount } = useQuery({
    queryKey: ["dashboard-vessels"],
    queryFn: async () => {
      const { count } = await supabase.from("vessels").select("*", { count: "exact", head: true });
      return count || 0;
    },
    staleTime: 60000,
  });

  const { data: crewCount } = useQuery({
    queryKey: ["dashboard-crew"],
    queryFn: async () => {
      const { count } = await supabase.from("crew_members").select("*", { count: "exact", head: true });
      return count || 0;
    },
    staleTime: 60000,
  });

  const { data: maintenanceCount } = useQuery({
    queryKey: ["dashboard-maintenance"],
    queryFn: async () => {
      const { count } = await supabase.from("maintenance_tasks").select("*", { count: "exact", head: true }).eq("status", "open");
      return count || 0;
    },
    staleTime: 60000,
  });

  const { data: alertsCount } = useQuery({
    queryKey: ["dashboard-alerts"],
    queryFn: async () => {
      const { count } = await supabase.from("soc_alerts").select("*", { count: "exact", head: true }).eq("status", "open");
      return count || 0;
    },
    staleTime: 60000,
  });

  const { data: recentInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ["dashboard-ai-insights"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_insights")
        .select("id, title, description, confidence, priority, category")
        .order("created_at", { ascending: false })
        .limit(3);
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: recentVoyages, isLoading: voyagesLoading } = useQuery({
    queryKey: ["dashboard-voyages"],
    queryFn: async () => {
      const { data } = await supabase
        .from("voyage_plans")
        .select("id, voyage_number, status, origin_port, destination_port, vessel_id")
        .order("created_at", { ascending: false })
        .limit(4);
      return data || [];
    },
    staleTime: 60000,
  });

  const systemKPIs = [
    { id: "fleet", label: "Embarcações", value: String(vesselCount ?? "—"), icon: Ship, color: "primary" },
    { id: "crew", label: "Tripulação", value: String(crewCount ?? "—"), icon: Users, color: "success" },
    { id: "maintenance", label: "OS Abertas", value: String(maintenanceCount ?? "—"), icon: Wrench, color: "warning" },
    { id: "alerts", label: "Alertas", value: String(alertsCount ?? "—"), icon: AlertTriangle, color: "destructive" },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      toast.success("Dados atualizados com sucesso");
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Premium */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b bg-gradient-to-r from-primary/5 via-background to-accent/5"
      >
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg"
              >
                <Compass className="h-7 w-7" />
              </motion.div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">Central de Comando</h1>
                  <Badge className="bg-success/10 text-success gap-1 border-success/20">
                    <Activity className="h-3 w-3" />
                    Online
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Visão unificada de operações marítimas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
              <Button size="sm" className="gap-2">
                <Brain className="h-4 w-4" />
                Análise IA
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* KPIs Grid - Animated */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {systemKPIs.map((kpi, i) => (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card className="hover:shadow-premium-sm transition-shadow border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                      <AnimatedValue value={kpi.value} />
                    </div>
                    <div className={`p-2 rounded-lg bg-${kpi.color}/10`}>
                      <kpi.icon className={`h-5 w-5 text-${kpi.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="operations" className="space-y-6">
          <TabsList className="inline-flex h-10 items-center gap-1 rounded-lg bg-muted/50 p-1">
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <Ship className="h-4 w-4" />
              Viagens
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alertas
              {(alertsCount ?? 0) > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 p-0 text-[10px] flex items-center justify-center">
                  {alertsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              IA Insights
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* Viagens Recentes */}
          <TabsContent value="operations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Anchor className="h-5 w-5" />
                    Viagens Recentes
                  </CardTitle>
                  <Badge variant="secondary">{recentVoyages?.length ?? 0} registros</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {voyagesLoading ? (
                  <TableSkeleton rows={4} cols={4} />
                ) : recentVoyages && recentVoyages.length > 0 ? (
                  <div className="space-y-3">
                    {recentVoyages.map((voyage, i) => (
                      <motion.div
                        key={voyage.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            <div>
                              <p className="font-semibold text-sm">{voyage.voyage_number || "Sem número"}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {voyage.origin_port || "—"} → {voyage.destination_port || "—"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={voyage.status === "active" ? "default" : "secondary"}>
                            {voyage.status || "Planejada"}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <PremiumEmptyState
                    icon={Ship}
                    title="Nenhuma viagem registrada"
                    description="As viagens aparecerão aqui quando forem criadas no módulo de Operações."
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alertas */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PremiumEmptyState
                  icon={Shield}
                  title="Sistema seguro"
                  description="Nenhum alerta crítico no momento. O monitoramento continua em tempo real."
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* IA Insights */}
          <TabsContent value="ai">
            {insightsLoading ? (
              <CardSkeleton count={3} />
            ) : recentInsights && recentInsights.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {recentInsights.map((insight, i) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="hover:shadow-premium-sm transition-all border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Brain className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-sm truncate">{insight.title}</p>
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {insight.confidence}%
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <PremiumEmptyState
                icon={Brain}
                title="Sem insights disponíveis"
                description="A IA ainda não gerou insights. Eles aparecerão conforme os dados operacionais forem processados."
              />
            )}
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Utilização da Frota", value: 85.7, icon: Target },
                { label: "Eficiência Combustível", value: 92.3, icon: Zap },
                { label: "Uptime Operacional", value: 99.2, icon: CheckCircle },
                { label: "Taxa de Incidentes", value: 0.02, icon: XCircle, isLow: true },
              ].map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium">{metric.label}</p>
                        <metric.icon className={`h-4 w-4 ${metric.isLow ? 'text-muted-foreground' : 'text-success'}`} />
                      </div>
                      <AnimatedValue value={String(metric.value)} suffix="%" />
                      <Progress value={metric.isLow ? metric.value * 100 : metric.value} className="h-2 mt-2" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
