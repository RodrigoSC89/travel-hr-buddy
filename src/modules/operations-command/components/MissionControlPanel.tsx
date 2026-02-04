/**
 * Mission Control Panel - Advanced Mission Management
 * Centro de Controle de Missões com gestão avançada de operações
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Target,
  Flag,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Users,
  Ship,
  MapPin,
  Calendar,
  Timer,
  Zap,
  BarChart3,
  ArrowRight,
  Eye,
  Edit,
  Plus,
  RefreshCw,
  Rocket,
  Shield,
  Anchor,
  Navigation,
  Compass,
  Radio,
  Layers,
  TrendingUp,
  Star,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { toast } from "sonner";

interface Mission {
  id: string;
  name: string;
  type: "voyage" | "cargo" | "maintenance" | "inspection" | "emergency" | "training";
  status: "planning" | "active" | "paused" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  vessel?: string;
  startDate: Date;
  endDate?: Date;
  progress: number;
  objectives: Objective[];
  crew: number;
  budget: number;
  budgetUsed: number;
  risks: number;
  updates: MissionUpdate[];
}

interface Objective {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  progress: number;
}

interface MissionUpdate {
  id: string;
  message: string;
  timestamp: Date;
  type: "info" | "warning" | "success" | "error";
  author: string;
}

export default function MissionControlPanel() {
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [view, setView] = useState<"grid" | "timeline">("grid");

  // Fetch missions data
  const { data: missionsData = [], isLoading, refetch } = useQuery({
    queryKey: ["mission-control-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voyage_plans")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Mock missions for UI demonstration
  const missions: Mission[] = [
    {
      id: "m1",
      name: "Operação Atlantic Crossing",
      type: "voyage",
      status: "active",
      priority: "high",
      vessel: "MV Atlântico Sul",
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-02-15"),
      progress: 65,
      objectives: [
        { id: "o1", title: "Partida de Santos", status: "completed", progress: 100 },
        { id: "o2", title: "Travessia Atlântico", status: "in_progress", progress: 60 },
        { id: "o3", title: "Chegada Rotterdam", status: "pending", progress: 0 },
      ],
      crew: 22,
      budget: 450000,
      budgetUsed: 280000,
      risks: 2,
      updates: [
        { id: "u1", message: "Velocidade aumentada para 14.5 kn", timestamp: new Date(), type: "info", author: "Capitão Silva" },
        { id: "u2", message: "Condições meteorológicas favoráveis", timestamp: new Date(Date.now() - 3600000), type: "success", author: "Sistema" },
      ],
    },
    {
      id: "m2",
      name: "Manutenção Programada #47",
      type: "maintenance",
      status: "active",
      priority: "medium",
      vessel: "MV Horizonte",
      startDate: new Date("2026-02-04"),
      endDate: new Date("2026-02-08"),
      progress: 35,
      objectives: [
        { id: "o1", title: "Inspeção de casco", status: "completed", progress: 100 },
        { id: "o2", title: "Manutenção de motor", status: "in_progress", progress: 40 },
        { id: "o3", title: "Verificação de sistemas", status: "pending", progress: 0 },
        { id: "o4", title: "Testes finais", status: "pending", progress: 0 },
      ],
      crew: 8,
      budget: 85000,
      budgetUsed: 32000,
      risks: 1,
      updates: [
        { id: "u1", message: "Peça de reposição encomendada", timestamp: new Date(), type: "warning", author: "Eng. Costa" },
      ],
    },
    {
      id: "m3",
      name: "Inspeção SIRE",
      type: "inspection",
      status: "planning",
      priority: "critical",
      vessel: "MV Oceano",
      startDate: new Date("2026-02-10"),
      progress: 0,
      objectives: [
        { id: "o1", title: "Preparação de documentação", status: "in_progress", progress: 75 },
        { id: "o2", title: "Checklist de segurança", status: "in_progress", progress: 45 },
        { id: "o3", title: "Inspeção física", status: "pending", progress: 0 },
      ],
      crew: 25,
      budget: 15000,
      budgetUsed: 5000,
      risks: 3,
      updates: [],
    },
    {
      id: "m4",
      name: "Operação Emergência SAR",
      type: "emergency",
      status: "completed",
      priority: "critical",
      vessel: "MV Pacífico",
      startDate: new Date("2026-02-02"),
      endDate: new Date("2026-02-03"),
      progress: 100,
      objectives: [
        { id: "o1", title: "Resposta ao chamado", status: "completed", progress: 100 },
        { id: "o2", title: "Resgate de tripulação", status: "completed", progress: 100 },
        { id: "o3", title: "Transporte ao porto", status: "completed", progress: 100 },
      ],
      crew: 18,
      budget: 120000,
      budgetUsed: 98000,
      risks: 0,
      updates: [
        { id: "u1", message: "Missão concluída com sucesso - 6 pessoas resgatadas", timestamp: new Date(Date.now() - 86400000), type: "success", author: "Sistema" },
      ],
    },
    {
      id: "m5",
      name: "Treinamento STCW",
      type: "training",
      status: "active",
      priority: "low",
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-02-28"),
      progress: 45,
      objectives: [
        { id: "o1", title: "Módulo de Segurança", status: "completed", progress: 100 },
        { id: "o2", title: "Módulo de Navegação", status: "in_progress", progress: 60 },
        { id: "o3", title: "Módulo de Emergência", status: "pending", progress: 0 },
      ],
      crew: 45,
      budget: 35000,
      budgetUsed: 18000,
      risks: 0,
      updates: [],
    },
  ];

  const missionStats = {
    active: missions.filter(m => m.status === "active").length,
    planning: missions.filter(m => m.status === "planning").length,
    completed: missions.filter(m => m.status === "completed").length,
    critical: missions.filter(m => m.priority === "critical").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/20";
      case "planning":
        return "bg-primary/10 text-primary border-primary/20";
      case "paused":
        return "bg-warning/10 text-warning border-warning/20";
      case "completed":
        return "bg-muted text-muted-foreground";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "voyage":
        return <Navigation className="h-4 w-4" />;
      case "cargo":
        return <Layers className="h-4 w-4" />;
      case "maintenance":
        return <Anchor className="h-4 w-4" />;
      case "inspection":
        return <Shield className="h-4 w-4" />;
      case "emergency":
        return <AlertTriangle className="h-4 w-4" />;
      case "training":
        return <Users className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-warning text-warning-foreground";
      case "medium":
        return "bg-primary text-primary-foreground";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted";
    }
  };

  const progressData = missions.map(m => ({
    name: m.name.substring(0, 15) + "...",
    progress: m.progress,
    fill: m.status === "active" ? "hsl(142, 71%, 45%)" : m.status === "completed" ? "hsl(217, 91%, 60%)" : "hsl(var(--muted))",
  }));

  return (
    <div className="space-y-6">
      {/* Header KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-l-4 border-l-success hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Ativas</p>
                  <p className="text-3xl font-bold text-success">{missionStats.active}</p>
                </div>
                <div className="p-2 rounded-full bg-success/10">
                  <Play className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Planejadas</p>
                  <p className="text-3xl font-bold text-primary">{missionStats.planning}</p>
                </div>
                <div className="p-2 rounded-full bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-l-4 border-l-muted-foreground hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                  <p className="text-3xl font-bold">{missionStats.completed}</p>
                </div>
                <div className="p-2 rounded-full bg-muted">
                  <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-l-4 border-l-destructive hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Críticas</p>
                  <p className="text-3xl font-bold text-destructive">{missionStats.critical}</p>
                </div>
                <div className="p-2 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Missão
          </Button>
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("grid")}
          >
            Grid
          </Button>
          <Button
            variant={view === "timeline" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("timeline")}
          >
            Timeline
          </Button>
        </div>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {missions.map((mission, idx) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card 
              className={`h-full hover:shadow-lg transition-all cursor-pointer ${
                mission.priority === "critical" ? "ring-1 ring-destructive/50" : ""
              }`}
              onClick={() => setSelectedMission(mission)}
            >
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      mission.status === "active" ? "bg-success/10" : "bg-muted"
                    }`}>
                      {getTypeIcon(mission.type)}
                    </div>
                    <div>
                      <h4 className="font-medium line-clamp-1">{mission.name}</h4>
                      {mission.vessel && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Ship className="h-3 w-3" />
                          {mission.vessel}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={getPriorityColor(mission.priority)}>
                    {mission.priority === "critical" ? "Crítico" : 
                     mission.priority === "high" ? "Alta" :
                     mission.priority === "medium" ? "Média" : "Baixa"}
                  </Badge>
                </div>

                {/* Progress */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso</span>
                    <span className="font-medium">{mission.progress}%</span>
                  </div>
                  <Progress value={mission.progress} className="h-2" />
                </div>

                {/* Objectives Preview */}
                <div className="space-y-1 mb-4">
                  {mission.objectives.slice(0, 3).map((obj) => (
                    <div key={obj.id} className="flex items-center gap-2 text-xs">
                      {obj.status === "completed" ? (
                        <CheckCircle2 className="h-3 w-3 text-success" />
                      ) : obj.status === "in_progress" ? (
                        <Clock className="h-3 w-3 text-primary" />
                      ) : obj.status === "blocked" ? (
                        <XCircle className="h-3 w-3 text-destructive" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border" />
                      )}
                      <span className={obj.status === "completed" ? "line-through text-muted-foreground" : ""}>
                        {obj.title}
                      </span>
                    </div>
                  ))}
                  {mission.objectives.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{mission.objectives.length - 3} objetivos
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>{mission.crew}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span>${(mission.budgetUsed / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className={`h-3 w-3 ${mission.risks > 0 ? "text-warning" : "text-muted-foreground"}`} />
                    <span>{mission.risks} riscos</span>
                  </div>
                </div>

                {/* Status & Date */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={getStatusColor(mission.status)}>
                    {mission.status === "active" ? "Ativa" :
                     mission.status === "planning" ? "Planejando" :
                     mission.status === "completed" ? "Concluída" :
                     mission.status === "paused" ? "Pausada" : "Cancelada"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {mission.startDate.toLocaleDateString("pt-BR")}
                    {mission.endDate && ` - ${mission.endDate.toLocaleDateString("pt-BR")}`}
                  </span>
                </div>

                {/* Latest Update */}
                {mission.updates.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start gap-2">
                      <Radio className="h-3 w-3 mt-1 text-primary" />
                      <div>
                        <p className="text-xs">{mission.updates[0].message}</p>
                        <p className="text-xs text-muted-foreground">
                          {mission.updates[0].author} • {mission.updates[0].timestamp.toLocaleTimeString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mission Detail Dialog */}
      <Dialog open={!!selectedMission} onOpenChange={() => setSelectedMission(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedMission && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedMission.type)}
                  {selectedMission.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Status Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(selectedMission.status)}>
                      {selectedMission.status}
                    </Badge>
                    <Badge className={getPriorityColor(selectedMission.priority)}>
                      {selectedMission.priority}
                    </Badge>
                    {selectedMission.vessel && (
                      <Badge variant="secondary" className="gap-1">
                        <Ship className="h-3 w-3" />
                        {selectedMission.vessel}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    {selectedMission.status === "active" ? (
                      <Button size="sm" variant="outline">
                        <Pause className="h-4 w-4 mr-1" />
                        Pausar
                      </Button>
                    ) : (
                      <Button size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Iniciar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Progresso Geral</span>
                    <span className="text-2xl font-bold">{selectedMission.progress}%</span>
                  </div>
                  <Progress value={selectedMission.progress} className="h-3" />
                </div>

                {/* Objectives */}
                <div>
                  <h4 className="font-medium mb-3">Objetivos</h4>
                  <div className="space-y-3">
                    {selectedMission.objectives.map((obj) => (
                      <div key={obj.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        {obj.status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : obj.status === "in_progress" ? (
                          <Clock className="h-5 w-5 text-primary" />
                        ) : obj.status === "blocked" ? (
                          <XCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2" />
                        )}
                        <div className="flex-1">
                          <p className={obj.status === "completed" ? "line-through text-muted-foreground" : ""}>
                            {obj.title}
                          </p>
                          <Progress value={obj.progress} className="h-1 mt-1" />
                        </div>
                        <span className="text-sm text-muted-foreground">{obj.progress}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <Users className="h-5 w-5 mx-auto text-primary mb-1" />
                      <p className="text-xl font-bold">{selectedMission.crew}</p>
                      <p className="text-xs text-muted-foreground">Tripulação</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <TrendingUp className="h-5 w-5 mx-auto text-success mb-1" />
                      <p className="text-xl font-bold">${(selectedMission.budgetUsed / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-muted-foreground">de ${(selectedMission.budget / 1000).toFixed(0)}k</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <AlertTriangle className={`h-5 w-5 mx-auto mb-1 ${selectedMission.risks > 0 ? "text-warning" : "text-muted-foreground"}`} />
                      <p className="text-xl font-bold">{selectedMission.risks}</p>
                      <p className="text-xs text-muted-foreground">Riscos</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
                      <p className="text-xl font-bold">
                        {selectedMission.endDate 
                          ? Math.ceil((selectedMission.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                          : "-"
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">Dias restantes</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Updates */}
                {selectedMission.updates.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Atualizações Recentes</h4>
                    <div className="space-y-2">
                      {selectedMission.updates.map((update) => (
                        <div key={update.id} className={`p-3 rounded-lg border-l-4 ${
                          update.type === "success" ? "border-l-success bg-success/5" :
                          update.type === "warning" ? "border-l-warning bg-warning/5" :
                          update.type === "error" ? "border-l-destructive bg-destructive/5" :
                          "border-l-primary bg-primary/5"
                        }`}>
                          <p className="text-sm">{update.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {update.author} • {update.timestamp.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
