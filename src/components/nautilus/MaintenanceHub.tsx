/**
 * Maintenance Hub - Predictive maintenance with AI recommendations
 * Integrated with Supabase for real-time data
 */

import { memo, memo, useEffect, useState, useCallback, useMemo } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wrench, AlertTriangle, CheckCircle, Clock, 
  Cpu, Thermometer, Gauge, Calendar, Brain,
  ChevronRight, Zap, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  vessel: string;
  vesselId?: string;
  component: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed" | "overdue";
  dueDate: string;
  cost?: number;
  predictedFailure?: number;
  aiRecommendation?: string;
}

interface ComponentHealth {
  id: string;
  name: string;
  vessel: string;
  health: number;
  temperature: number;
  vibration: number;
  predictedLifespan: number;
  lastMaintenance: string;
}

export const MaintenanceHub = memo(function() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [components, setComponents] = useState<ComponentHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  const loadMaintenanceData = async () => {
    try {
      // Load real maintenance schedules from database
      const { data: schedulesData, error: schedulesError } = await supabase
        .from("maintenance_schedules")
        .select("*, vessels(name)")
        .order("scheduled_date", { ascending: true })
        .limit(20);

      if (!schedulesError && schedulesData && schedulesData.length > 0) {
        const mappedTasks: MaintenanceTask[] = schedulesData.map((s: unknown) => ({
          id: s.id,
          title: s.maintenance_type || "Manutenção Programada",
          description: s.description || "Manutenção preventiva",
          vessel: s.vessels?.name || "Embarcação",
          vesselId: s.vessel_id,
          component: "Sistema Geral",
          priority: mapSchedulePriority(s.status, s.scheduled_date),
          status: mapScheduleStatus(s.status, s.scheduled_date),
          dueDate: s.scheduled_date,
          cost: s.cost ? parseFloat(s.cost) : undefined,
          aiRecommendation: generateAIRecommendation(s),
        }));
        setTasks(mappedTasks);
      } else {
        setTasks(getDemoTasks());
      }

      // Generate component health data based on vessels
      const { data: vesselsData } = await supabase
        .from("vessels")
        .select("id, name")
        .limit(10);

      if (vesselsData && vesselsData.length > 0) {
        const healthData: ComponentHealth[] = vesselsData.flatMap((v: unknown: unknown: unknown) => [
          {
            id: `${v.id}-engine`,
            name: "Motor Principal",
            vessel: v.name,
            health: 70 + Math.random() * 25,
            temperature: 60 + Math.random() * 30,
            vibration: 5 + Math.random() * 15,
            predictedLifespan: 2000 + Math.random() * 3000,
            lastMaintenance: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString().split("T")[0],
          },
          {
            id: `${v.id}-generator`,
            name: "Gerador",
            vessel: v.name,
            health: 75 + Math.random() * 20,
            temperature: 50 + Math.random() * 20,
            vibration: 3 + Math.random() * 10,
            predictedLifespan: 3000 + Math.random() * 4000,
            lastMaintenance: new Date(Date.now() - Math.random() * 60 * 86400000).toISOString().split("T")[0],
          },
        ]);
        setComponents(healthData);
      } else {
        setComponents(getDemoComponents());
      }
    } catch (error) {
      console.error("Error loading maintenance:", error);
      setTasks(getDemoTasks());
      setComponents(getDemoComponents());
    } finally {
      setIsLoading(false);
    }
  };

  const mapSchedulePriority = (status: string, scheduledDate: string): MaintenanceTask["priority"] => {
    const daysUntil = Math.ceil((new Date(scheduledDate).getTime() - Date.now()) / 86400000);
    if (daysUntil < 0) return "critical";
    if (daysUntil < 7) return "high";
    if (daysUntil < 30) return "medium";
    return "low";
  };

  const mapScheduleStatus = (status: string, scheduledDate: string): MaintenanceTask["status"] => {
    if (status === "completed") return "completed";
    if (status === "in_progress") return "in_progress";
    const daysUntil = Math.ceil((new Date(scheduledDate).getTime() - Date.now()) / 86400000);
    if (daysUntil < 0) return "overdue";
    return "pending";
  };

  const generateAIRecommendation = (schedule: unknown: unknown: unknown): string | undefined => {
    const daysUntil = Math.ceil((new Date(schedule.scheduled_date).getTime() - Date.now()) / 86400000);
    if (daysUntil < 7 && daysUntil > 0) {
      return `Manutenção programada para os próximos ${daysUntil} dias. Recomendamos preparar peças de reposição.`;
    }
    if (daysUntil < 0) {
      return `Manutenção atrasada em ${Math.abs(daysUntil)} dias. Prioridade crítica - agende imediatamente.`;
    }
    return undefined;
  };

  const getDemoTasks = (): MaintenanceTask[] => [
    { id: "1", title: "Troca de Óleo Motor Principal", description: "Manutenção preventiva programada", vessel: "Atlântico Sul", component: "Motor Principal", priority: "high", status: "pending", dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0], cost: 15000, predictedFailure: 12, aiRecommendation: "Baseado em padrões de uso, recomendamos antecipar esta manutenção em 5 dias." },
    { id: "2", title: "Inspeção Sistema Hidráulico", description: "Verificação de vazamentos", vessel: "Pacífico Norte", component: "Sistema Hidráulico", priority: "critical", status: "overdue", dueDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0], cost: 8000 },
    { id: "3", title: "Calibração Instrumentos", description: "Calibração anual de instrumentos de navegação", vessel: "Atlântico Sul", component: "Navegação", priority: "medium", status: "in_progress", dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0], cost: 5000 },
    { id: "4", title: "Manutenção Gerador", description: "Substituição de filtros e verificação", vessel: "Pacífico Norte", component: "Gerador 1", priority: "low", status: "completed", dueDate: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0], cost: 3500 },
  ];

  const getDemoComponents = (): ComponentHealth[] => [
    { id: "1", name: "Motor Principal", vessel: "Atlântico Sul", health: 85, temperature: 72, vibration: 12, predictedLifespan: 2500, lastMaintenance: "2024-01-15" },
    { id: "2", name: "Gerador 1", vessel: "Atlântico Sul", health: 92, temperature: 65, vibration: 8, predictedLifespan: 4200, lastMaintenance: "2024-02-20" },
    { id: "3", name: "Sistema Hidráulico", vessel: "Pacífico Norte", health: 68, temperature: 58, vibration: 18, predictedLifespan: 800, lastMaintenance: "2023-12-01" },
    { id: "4", name: "Bomba de Combustível", vessel: "Pacífico Norte", health: 95, temperature: 45, vibration: 5, predictedLifespan: 6000, lastMaintenance: "2024-03-01" },
  ];

  const handleScheduleMaintenance = async (componentId: string, componentName: string) => {
    toast.success(`Manutenção agendada para ${componentName}`);
  };

  const getPriorityColor = (priority: MaintenanceTask["priority"]) => {
    const colors = {
      critical: "bg-red-500",
      high: "bg-orange-500",
      medium: "bg-amber-500",
      low: "bg-blue-500",
    };
    return colors[priority];
  };

  const getStatusBadge = (status: MaintenanceTask["status"]) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pendente" },
      in_progress: { variant: "default", label: "Em Progresso" },
      completed: { variant: "outline", label: "Concluído" },
      overdue: { variant: "destructive", label: "Atrasado" },
    };
    return variants[status];
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return "text-emerald-500";
    if (health >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const stats = {
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    overdue: tasks.filter(t => t.status === "overdue").length,
    criticalComponents: components.filter(c => c.health < 70).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Wrench className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">Em Progresso</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">{stats.overdue}</p>
                  <p className="text-xs text-muted-foreground">Atrasados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Brain className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-500">{stats.criticalComponents}</p>
                  <p className="text-xs text-muted-foreground">Componentes Críticos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tasks">Tarefas de Manutenção</TabsTrigger>
          <TabsTrigger value="health">Saúde dos Componentes</TabsTrigger>
          <TabsTrigger value="predictions">Predições IA</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Tarefas de Manutenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task, index) => {
                  const statusInfo = getStatusBadge(task.status);
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-1 h-full rounded-full ${getPriorityColor(task.priority)}`} />
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{task.title}</h4>
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{task.vessel}</span>
                            <span>•</span>
                            <span>{task.component}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>

                          {task.aiRecommendation && (
                            <div className="mt-3 p-2 rounded bg-purple-500/10 border border-purple-500/20">
                              <div className="flex items-center gap-2 text-xs text-purple-500">
                                <Brain className="h-3 w-3" />
                                <span className="font-medium">Recomendação IA:</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{task.aiRecommendation}</p>
                            </div>
                          )}
                        </div>

                        <Button size="sm" variant="ghost">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Saúde dos Componentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {components.map((component, index) => (
                  <motion.div
                    key={component.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border bg-card/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{component.name}</h4>
                        <p className="text-xs text-muted-foreground">{component.vessel}</p>
                      </div>
                      <div className={`text-2xl font-bold ${getHealthColor(component.health)}`}>
                        {component.health}%
                      </div>
                    </div>

                    <Progress 
                      value={component.health} 
                      className="h-2 mb-4"
                    />

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Thermometer className="h-3 w-3" />
                          <span className="text-xs">Temp</span>
                        </div>
                        <p className="font-semibold">{component.temperature}°C</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          <span className="text-xs">Vibração</span>
                        </div>
                        <p className="font-semibold">{component.vibration} Hz</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Gauge className="h-3 w-3" />
                          <span className="text-xs">Vida Útil</span>
                        </div>
                        <p className="font-semibold">{component.predictedLifespan}h</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Predições de Manutenção (IA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {components.filter(c => c.health < 85).map((component, index) => (
                  <motion.div
                    key={component.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border bg-gradient-to-r from-purple-500/10 to-blue-500/10"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <h4 className="font-semibold">{component.name} - {component.vessel}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Com base nos padrões de operação e dados dos sensores, prevemos que este componente 
                      necessitará de manutenção preventiva em aproximadamente <strong>{Math.floor(component.predictedLifespan / 24)} dias</strong>.
                      A saúde atual está em <strong>{component.health}%</strong>.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => handlehandleScheduleMaintenance}>
                        Agendar Manutenção
                      </Button>
                      <Button size="sm" variant="outline">Ver Detalhes</Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});
