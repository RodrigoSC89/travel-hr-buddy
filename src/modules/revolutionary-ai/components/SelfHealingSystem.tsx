/**
 * Self-Healing Infrastructure System
 * PATCH REVOLUTION v1.0
 * Autonomous self-repair and predictive maintenance
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Wrench, Activity, CheckCircle, AlertTriangle, 
  Zap, Clock, Shield, TrendingUp, RefreshCw,
  Server, Cpu, HardDrive, Wifi, ThermometerSun,
  Battery, Gauge, Cog
} from "lucide-react";
import { motion } from "framer-motion";

interface SystemComponent {
  id: string;
  name: string;
  category: "engine" | "electrical" | "hvac" | "navigation" | "safety";
  status: "healthy" | "warning" | "critical" | "healing";
  health: number;
  uptime: number;
  lastCheck: string;
  predictedFailure?: string;
  healingProgress?: number;
}

interface HealingEvent {
  id: string;
  component: string;
  issue: string;
  action: string;
  status: "completed" | "in_progress" | "failed";
  duration: number;
  timestamp: string;
  automated: boolean;
}

const fallbackComponents: SystemComponent[] = [
  {
    id: "1",
    name: "Main Engine #1",
    category: "engine",
    status: "healthy",
    health: 98,
    uptime: 99.97,
    lastCheck: "2025-01-20T14:30:00Z",
  },
  {
    id: "2",
    name: "Cooling System",
    category: "engine",
    status: "healing",
    health: 85,
    uptime: 99.5,
    lastCheck: "2025-01-20T14:28:00Z",
    healingProgress: 67,
  },
  {
    id: "3",
    name: "Main Switchboard",
    category: "electrical",
    status: "healthy",
    health: 96,
    uptime: 99.99,
    lastCheck: "2025-01-20T14:29:00Z",
  },
  {
    id: "4",
    name: "Generator #2",
    category: "electrical",
    status: "warning",
    health: 78,
    uptime: 98.5,
    lastCheck: "2025-01-20T14:25:00Z",
    predictedFailure: "7 days",
  },
  {
    id: "5",
    name: "HVAC Central",
    category: "hvac",
    status: "healthy",
    health: 94,
    uptime: 99.8,
    lastCheck: "2025-01-20T14:30:00Z",
  },
  {
    id: "6",
    name: "Navigation Radar",
    category: "navigation",
    status: "healthy",
    health: 99,
    uptime: 99.99,
    lastCheck: "2025-01-20T14:30:00Z",
  },
  {
    id: "7",
    name: "Fire Suppression",
    category: "safety",
    status: "healthy",
    health: 100,
    uptime: 100,
    lastCheck: "2025-01-20T14:30:00Z",
  },
  {
    id: "8",
    name: "Bilge Pump #1",
    category: "safety",
    status: "critical",
    health: 45,
    uptime: 92,
    lastCheck: "2025-01-20T14:20:00Z",
    healingProgress: 23,
  },
];

const fallbackHealingEvents: HealingEvent[] = [
  {
    id: "1",
    component: "Cooling Pump Aux",
    issue: "Flow rate -15% detected",
    action: "Activated backup pump, isolated primary for inspection",
    status: "completed",
    duration: 3.5,
    timestamp: "2025-01-20T14:15:00Z",
    automated: true,
  },
  {
    id: "2",
    component: "Generator #1",
    issue: "Voltage fluctuation +5%",
    action: "Adjusted AVR parameters, load balanced to Gen #2",
    status: "completed",
    duration: 12,
    timestamp: "2025-01-20T13:45:00Z",
    automated: true,
  },
  {
    id: "3",
    component: "Bilge Pump #1",
    issue: "Motor overheating detected",
    action: "Switching to backup pump, scheduling maintenance",
    status: "in_progress",
    duration: 45,
    timestamp: "2025-01-20T14:20:00Z",
    automated: true,
  },
  {
    id: "4",
    component: "Network Switch #3",
    issue: "High packet loss detected",
    action: "Rerouted traffic, firmware update scheduled",
    status: "completed",
    duration: 8,
    timestamp: "2025-01-20T12:30:00Z",
    automated: true,
  },
];

const statusColors = {
  healthy: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  healing: "bg-info/10 text-info border-info/30",
};

const categoryIcons = {
  engine: Cog,
  electrical: Zap,
  hvac: ThermometerSun,
  navigation: Wifi,
  safety: Shield,
};

export function SelfHealingSystem() {
  const healthyCount = fallbackComponents.filter(c => c.status === "healthy").length;
  const warningCount = fallbackComponents.filter(c => c.status === "warning").length;
  const criticalCount = fallbackComponents.filter(c => c.status === "critical").length;
  const healingCount = fallbackComponents.filter(c => c.status === "healing").length;

  const overallHealth = Math.round(
    fallbackComponents.reduce((acc, c) => acc + c.health, 0) / fallbackComponents.length
  );

  const avgUptime = (
    fallbackComponents.reduce((acc, c) => acc + c.uptime, 0) / fallbackComponents.length
  ).toFixed(3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-success" />
            Self-Healing Infrastructure
          </h2>
          <p className="text-muted-foreground">
            Auto-diagnóstico e reparo autônomo
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-success to-success/80 text-success-foreground border-0">
          <Activity className="h-3 w-3 mr-1 animate-pulse" />
          {overallHealth}% Health
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{healthyCount}</p>
                <p className="text-xs text-muted-foreground">Saudáveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-8 w-8 text-info animate-spin" />
              <div>
                <p className="text-2xl font-bold">{healingCount}</p>
                <p className="text-xs text-muted-foreground">Em Reparo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{warningCount}</p>
                <p className="text-xs text-muted-foreground">Atenção</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{criticalCount}</p>
                <p className="text-xs text-muted-foreground">Críticos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Gauge className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{avgUptime}%</p>
                <p className="text-xs text-muted-foreground">Uptime Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Components */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              System Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {fallbackComponents.map((component, index) => {
                  const CategoryIcon = categoryIcons[component.category];
                  return (
                    <motion.div
                      key={component.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg border ${
                        component.status === "critical" ? "bg-destructive/5 border-destructive/30" :
                        component.status === "healing" ? "bg-info/5 border-info/30" :
                        "bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{component.name}</span>
                        </div>
                        <Badge variant="outline" className={statusColors[component.status]}>
                          {component.status === "healing" && (
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          {component.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-12">Health</span>
                          <Progress value={component.health} className="flex-1 h-2" />
                          <span className="text-xs font-medium w-10 text-right">{component.health}%</span>
                        </div>
                        {component.healingProgress !== undefined && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-12">Repair</span>
                            <Progress value={component.healingProgress} className="flex-1 h-2" />
                            <span className="text-xs font-medium w-10 text-right">{component.healingProgress}%</span>
                          </div>
                        )}
                        {component.predictedFailure && (
                          <div className="flex items-center gap-1 text-xs text-warning">
                            <Clock className="h-3 w-3" />
                            Predicted failure in {component.predictedFailure}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Healing Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-info" />
              Healing Events Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {fallbackHealingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-medium text-sm">{event.component}</span>
                        {event.automated && (
                          <Badge variant="outline" className="ml-2 text-xs bg-accent/10 text-accent-foreground">
                            <Zap className="h-3 w-3 mr-1" />
                            Auto
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className={
                        event.status === "completed" ? "bg-success/10 text-success" :
                        event.status === "in_progress" ? "bg-info/10 text-info" :
                        "bg-destructive/10 text-destructive"
                      }>
                        {event.status === "in_progress" && (
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        )}
                        {event.status === "completed" && (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {event.status}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-destructive">
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        {event.issue}
                      </p>
                      <p className="text-success">
                        <Wrench className="h-3 w-3 inline mr-1" />
                        {event.action}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>
                        <Clock className="h-3 w-3 inline mr-1" />
                        {event.duration}s
                      </span>
                      <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Benefits */}
      <Card className="bg-gradient-to-br from-success/10 to-info/5">
        <CardContent className="pt-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            ROI do Self-Healing
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success">-95%</div>
              <div className="text-sm text-muted-foreground">Downtime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-info">&lt;1s</div>
              <div className="text-sm text-muted-foreground">Tempo de Resposta</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-foreground">-60%</div>
              <div className="text-sm text-muted-foreground">Custos Manutenção</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning">99.999%</div>
              <div className="text-sm text-muted-foreground">Uptime Target</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
