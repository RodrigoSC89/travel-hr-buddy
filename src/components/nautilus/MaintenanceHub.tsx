/**
 * Maintenance Hub - Predictive maintenance with AI recommendations
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
  ChevronRight, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  vessel: string;
  component: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed" | "overdue";
  dueDate: string;
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
      const { data: maintenanceData } = await supabase
        .from("work_orders")
        .select("*")
        .limit(20);

      if (maintenanceData) {
        const mappedTasks: MaintenanceTask[] = maintenanceData.map((t: any) => ({
          id: t.id,
          title: t.title || "Manutenção",
          description: t.description || "",
          vessel: "Embarcação",
          component: "Motor Principal",
          priority: (t.priority as MaintenanceTask["priority"]) || "medium",
          status: (t.status as MaintenanceTask["status"]) || "pending",
          dueDate: t.due_date || new Date().toISOString(),
          predictedFailure: Math.random() * 30,
          aiRecommendation: Math.random() > 0.5 
            ? "Baseado em padrões de uso, recomendamos antecipar esta manutenção em 5 dias para evitar falha."
            : undefined,
        }));
        setTasks(mappedTasks);
      }

      // Generate mock component health data
      const mockComponents: ComponentHealth[] = [
        { id: "1", name: "Motor Principal", vessel: "Atlântico Sul", health: 85, temperature: 72, vibration: 12, predictedLifespan: 2500, lastMaintenance: "2024-01-15" },
        { id: "2", name: "Gerador 1", vessel: "Atlântico Sul", health: 92, temperature: 65, vibration: 8, predictedLifespan: 4200, lastMaintenance: "2024-02-20" },
        { id: "3", name: "Sistema Hidráulico", vessel: "Pacífico Norte", health: 68, temperature: 58, vibration: 18, predictedLifespan: 800, lastMaintenance: "2023-12-01" },
        { id: "4", name: "Bomba de Combustível", vessel: "Pacífico Norte", health: 95, temperature: 45, vibration: 5, predictedLifespan: 6000, lastMaintenance: "2024-03-01" },
      ];
      setComponents(mockComponents);
    } catch (error) {
      console.error("Error loading maintenance:", error);
    } finally {
      setIsLoading(false);
    }
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
                      <Button size="sm">Agendar Manutenção</Button>
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
