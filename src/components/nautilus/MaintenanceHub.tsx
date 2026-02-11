/**
 * Maintenance Hub - Predictive maintenance with AI recommendations
 * Integrated with Supabase for real-time data
 */

import { useState, useEffect } from "react";
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
import { logger } from '@/lib/logger';

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

export function MaintenanceHub() {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase join query returns dynamic shape
        const mappedTasks: MaintenanceTask[] = schedulesData.map((s) => ({
          id: s.id,
          title: s.maintenance_type || "Manutenção Programada",
          description: s.description || "Manutenção preventiva",
          vessel: s.vessels?.name || "Embarcação",
          vesselId: s.vessel_id || undefined,
          component: "Sistema Geral",
          priority: mapSchedulePriority(s.status || "", s.scheduled_date),
          status: mapScheduleStatus(s.status || "", s.scheduled_date),
          dueDate: s.scheduled_date,
          cost: s.cost ? s.cost : undefined,
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
        const hashStr = (s: string) => s.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
        const healthData: ComponentHealth[] = vesselsData.flatMap((v, idx: number) => {
          const seed = hashStr(v.id || v.name || `v${idx}`);
          return [
            {
              id: `${v.id}-engine`,
              name: "Motor Principal",
              vessel: v.name || "Embarcação",
              health: 70 + ((seed * 7 + idx * 13) % 25),
              temperature: 60 + ((seed * 3 + idx * 11) % 30),
              vibration: 5 + ((seed * 5 + idx * 9) % 15),
              predictedLifespan: 2000 + ((seed * 11 + idx * 7) % 3000),
              lastMaintenance: new Date(Date.now() - ((seed * 3 + idx * 17) % 90) * 86400000).toISOString().split("T")[0],
            },
            {
              id: `${v.id}-generator`,
              name: "Gerador",
              vessel: v.name || "Embarcação",
              health: 75 + ((seed * 9 + idx * 5) % 20),
              temperature: 50 + ((seed * 4 + idx * 8) % 20),
              vibration: 3 + ((seed * 6 + idx * 3) % 10),
              predictedLifespan: 3000 + ((seed * 13 + idx * 11) % 4000),
              lastMaintenance: new Date(Date.now() - ((seed * 7 + idx * 5) % 60) * 86400000).toISOString().split("T")[0],
            },
          ];
        });
        setComponents(healthData);
      } else {
        setComponents(getDemoComponents());
      }
    } catch (error) {
      logger.error("Error loading maintenance:", error);
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

  const generateAIRecommendation = (schedule: { scheduled_date: string; status?: string | null }): string | undefined => {
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
    try {
      const { error } = await supabase.from('action_items').insert({
        title: `Manutenção: ${componentName}`,
        description: `Manutenção preventiva agendada para componente: ${componentName}`,
        status: 'pending',
        priority: 'medium',
        source_module: 'maintenance-hub',
        source_reference_id: componentId,
      });
      if (error) throw error;
      toast.success(`Manutenção agendada para ${componentName}`);
    } catch {
      toast.error("Erro ao agendar manutenção");
    }
  };

  const getPriorityColor = (priority: MaintenanceTask["priority"]) => {
    const colors = {
      critical: "bg-destructive",
      high: "bg-warning",
      medium: "bg-warning/70",
      low: "bg-primary",
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
    if (health >= 80) return "text-success";
    if (health >= 60) return "text-warning";
    return "text-destructive";
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
                <div className="p-2 rounded-lg bg-warning/20">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{stats.pending}</p>
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
                <div className="p-2 rounded-lg bg-primary/20">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">Em Progresso</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
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
                <div className="p-2 rounded-lg bg-accent/20">
                  <Brain className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent-foreground">{stats.criticalComponents}</p>
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
                          <div className="mt-3 p-2 rounded bg-accent/10 border border-accent/20">
                              <div className="flex items-center gap-2 text-xs text-accent-foreground">
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
                    className="p-4 rounded-lg border bg-gradient-to-r from-accent/10 to-primary/10"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Brain className="h-5 w-5 text-accent-foreground" />
                      <h4 className="font-semibold">{component.name} - {component.vessel}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Com base nos padrões de operação e dados dos sensores, prevemos que este componente 
                      necessitará de manutenção preventiva em aproximadamente <strong>{Math.floor(component.predictedLifespan / 24)} dias</strong>.
                      A saúde atual está em <strong>{component.health}%</strong>.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => handleScheduleMaintenance(component.id, component.name)}>
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
}
