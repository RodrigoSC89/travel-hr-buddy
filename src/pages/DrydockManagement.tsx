import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Ship, Wrench, DollarSign, FileText, Plus, AlertTriangle, CheckCircle2, Clock, Anchor } from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DrydockEvent {
  id: string;
  vessel_id: string;
  event_type: string;
  shipyard_name: string;
  shipyard_location: string;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date: string | null;
  actual_end_date: string | null;
  estimated_cost: number;
  actual_cost: number | null;
  currency: string;
  status: string;
  work_scope: any[];
  notes: string;
}

interface HullInspection {
  id: string;
  vessel_id: string;
  inspection_type: string;
  inspection_date: string;
  hull_condition_score: number;
  fouling_level: string;
  coating_condition: string;
  anodes_condition: string;
  next_inspection_due: string;
}

const statusColors: Record<string, string> = {
  planned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  delayed: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const conditionColors: Record<string, string> = {
  excellent: "text-emerald-400",
  good: "text-green-400",
  fair: "text-amber-400",
  poor: "text-orange-400",
  failed: "text-destructive",
  depleted: "text-destructive",
};

export default function DrydockManagement() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: drydockEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["drydock-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drydock_events")
        .select("*")
        .order("planned_start_date", { ascending: true });
      if (error) throw error;
      return data as DrydockEvent[];
    },
  });

  const { data: hullInspections = [], isLoading: inspectionsLoading } = useQuery({
    queryKey: ["hull-inspections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hull_inspections")
        .select("*")
        .order("inspection_date", { ascending: false });
      if (error) throw error;
      return data as HullInspection[];
    },
  });

  const upcomingEvents = drydockEvents.filter(e => e.status === "planned" || e.status === "in_progress");
  const totalEstimatedCost = drydockEvents.reduce((sum, e) => sum + (e.estimated_cost || 0), 0);
  const avgHullCondition = hullInspections.length > 0 
    ? hullInspections.reduce((sum, i) => sum + (i.hull_condition_score || 0), 0) / hullInspections.length 
    : 0;

  return (
    <>
      <Helmet>
        <title>Drydock & Hull Management | Nautilus One</title>
        <meta name="description" content="Gestão completa de docagens, inspeções de casco e planejamento de manutenção naval" />
      </Helmet>

      <div className="min-h-screen bg-background p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Anchor className="h-8 w-8 text-primary" />
              Drydock & Hull Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Planejamento de docagens, inspeções de casco e gestão de custos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Relatórios
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Docagem
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Docagens Planejadas</p>
                  <p className="text-3xl font-bold text-foreground">{upcomingEvents.length}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Custo Estimado Total</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${(totalEstimatedCost / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Condição Média Casco</p>
                  <p className="text-3xl font-bold text-foreground">{avgHullCondition.toFixed(1)}/10</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-full">
                  <Ship className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
              <Progress value={avgHullCondition * 10} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inspeções Realizadas</p>
                  <p className="text-3xl font-bold text-foreground">{hullInspections.length}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Wrench className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="schedule">Cronograma</TabsTrigger>
            <TabsTrigger value="hull">Inspeções de Casco</TabsTrigger>
            <TabsTrigger value="costs">Custos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Drydocks */}
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Próximas Docagens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {eventsLoading ? (
                    <p className="text-muted-foreground text-center py-4">Carregando...</p>
                  ) : upcomingEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Ship className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground">Nenhuma docagem planejada</p>
                      <Button variant="link" className="mt-2">
                        <Plus className="h-4 w-4 mr-1" />
                        Agendar Docagem
                      </Button>
                    </div>
                  ) : (
                    upcomingEvents.slice(0, 5).map((event) => {
                      const daysUntil = differenceInDays(new Date(event.planned_start_date), new Date());
                      return (
                        <div key={event.id} className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">{event.shipyard_name}</span>
                            <Badge className={cn("border", statusColors[event.status])}>
                              {event.status === "planned" ? "Planejada" : 
                                event.status === "in_progress" ? "Em Andamento" : event.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(event.planned_start_date), "dd/MM/yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {daysUntil > 0 ? `Em ${daysUntil} dias` : "Hoje"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{event.shipyard_location}</span>
                            <span className="font-medium text-foreground">
                              ${event.estimated_cost?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              {/* Hull Condition Summary */}
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5 text-primary" />
                    Status do Casco por Embarcação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {inspectionsLoading ? (
                    <p className="text-muted-foreground text-center py-4">Carregando...</p>
                  ) : hullInspections.length === 0 ? (
                    <div className="text-center py-8">
                      <Wrench className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground">Nenhuma inspeção registrada</p>
                      <Button variant="link" className="mt-2">
                        <Plus className="h-4 w-4 mr-1" />
                        Registrar Inspeção
                      </Button>
                    </div>
                  ) : (
                    hullInspections.slice(0, 5).map((inspection) => (
                      <div key={inspection.id} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-foreground">Vessel ID: {inspection.vessel_id?.slice(0, 8)}</span>
                          <span className="text-2xl font-bold text-foreground">
                            {inspection.hull_condition_score}/10
                          </span>
                        </div>
                        <Progress 
                          value={inspection.hull_condition_score * 10} 
                          className="h-2 mb-3"
                        />
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Incrustação</span>
                            <p className={cn("font-medium capitalize", conditionColors[inspection.fouling_level] || "text-foreground")}>
                              {inspection.fouling_level || "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pintura</span>
                            <p className={cn("font-medium capitalize", conditionColors[inspection.coating_condition] || "text-foreground")}>
                              {inspection.coating_condition || "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Anodos</span>
                            <p className={cn("font-medium capitalize", conditionColors[inspection.anodes_condition] || "text-foreground")}>
                              {inspection.anodes_condition || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Cronograma de Docagens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Calendário Gantt em desenvolvimento</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Visualização timeline será implementada com integração de IA para otimização
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hull">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Histórico de Inspeções de Casco</CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Inspeção
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-3 text-muted-foreground font-medium">Data</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Tipo</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Score</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Incrustação</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Pintura</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Próxima</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hullInspections.map((inspection) => (
                        <tr key={inspection.id} className="border-b border-border/30 hover:bg-muted/20">
                          <td className="p-3 text-foreground">
                            {format(new Date(inspection.inspection_date), "dd/MM/yyyy")}
                          </td>
                          <td className="p-3 text-foreground capitalize">{inspection.inspection_type}</td>
                          <td className="p-3">
                            <span className={cn(
                              "font-bold",
                              inspection.hull_condition_score >= 8 ? "text-emerald-400" :
                                inspection.hull_condition_score >= 6 ? "text-amber-400" : "text-destructive"
                            )}>
                              {inspection.hull_condition_score}/10
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={cn("capitalize", conditionColors[inspection.fouling_level])}>
                              {inspection.fouling_level}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={cn("capitalize", conditionColors[inspection.coating_condition])}>
                              {inspection.coating_condition}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {inspection.next_inspection_due 
                              ? format(new Date(inspection.next_inspection_due), "dd/MM/yyyy")
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Análise de Custos de Docagem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Dashboard de custos com IA preditiva</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Previsão de custos baseada em histórico e condições do casco
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
