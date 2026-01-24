/**
 * NOC Mode Layout - 24/7 Operations Center
 * PATCH 852: Integrated with AutonomousAIPanel and notifications
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Monitor, 
  Bell, 
  AlertTriangle, 
  Activity, 
  Wifi, 
  Clock, 
  Volume2, 
  VolumeX,
  Maximize2,
  RefreshCcw,
  Brain,
  BarChart3,
  Settings,
  History as HistoryIcon,
  TrendingUp,
  LayoutDashboard,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AutonomousAIPanel } from "./AutonomousAIPanel";
import { AILearningMetricsDashboard } from "./AILearningMetricsDashboard";
import { AIConfigurationPanel } from "./AIConfigurationPanel";
import { AIDecisionHistory } from "./AIDecisionHistory";
import { AIPerformanceComparison } from "./AIPerformanceComparison";
import { AIExecutiveDashboard } from "./AIExecutiveDashboard";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { useAINotifications } from "@/hooks/useAINotifications";
import { useAutonomousAI } from "@/hooks/useAutonomousAI";
import { useAIDecisionsSupabase } from "@/hooks/useAIDecisionsSupabase";

interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface SystemStatus {
  name: string;
  status: "online" | "offline" | "degraded";
  latency?: number;
}

export function NOCModeLayout() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [systems, setSystems] = useState<SystemStatus[]>([
    { name: "Database", status: "online", latency: 12 },
    { name: "API Gateway", status: "online", latency: 45 },
    { name: "Edge Functions", status: "online", latency: 89 },
    { name: "AI Services", status: "online", latency: 156 },
    { name: "MQTT Broker", status: "online", latency: 23 },
  ]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("executive");
  
  // AI integration
  const { statistics, isActive } = useAutonomousAI();
  useAINotifications({ enabled: soundEnabled });

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate real-time alerts
  useEffect(() => {
    const demoAlerts: Alert[] = [
      {
        id: "1",
        severity: "critical",
        title: "High CPU Usage",
        message: "Server API-01 CPU at 95%",
        timestamp: new Date(Date.now() - 120000),
        acknowledged: false
      },
      {
        id: "2", 
        severity: "warning",
        title: "Memory Threshold",
        message: "Edge Function memory at 80%",
        timestamp: new Date(Date.now() - 300000),
        acknowledged: true
      },
      {
        id: "3",
        severity: "info",
        title: "Deployment Complete",
        message: "nautilus-command v2.1.0 deployed",
        timestamp: new Date(Date.now() - 600000),
        acknowledged: true
      }
    ];
    setAlerts(demoAlerts);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive text-destructive-foreground animate-pulse";
      case "warning": return "bg-warning text-warning-foreground";
      default: return "bg-info text-info-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-success";
      case "offline": return "bg-destructive";
      default: return "bg-warning";
    }
  };

  const criticalCount = alerts.filter(a => a.severity === "critical" && !a.acknowledged).length;
  const warningCount = alerts.filter(a => a.severity === "warning" && !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 p-4">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between mb-4 p-3 bg-[#12121a] rounded-lg border border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-primary">NOC MODE</span>
            <Badge variant="outline" className="ml-2 border-primary text-primary">24/7</Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-lg">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {criticalCount > 0 && (
            <Badge className="bg-destructive animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {criticalCount} Crítico{criticalCount > 1 ? 's' : ''}
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge className="bg-warning text-warning-foreground">
              <Bell className="h-3 w-3 mr-1" />
              {warningCount} Aviso{warningCount > 1 ? 's' : ''}
            </Badge>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-muted-foreground hover:text-foreground"
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-muted-foreground hover:text-foreground"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#12121a] border border-gray-800">
          <TabsTrigger value="executive" className="data-[state=active]:bg-success/20">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Executivo
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="data-[state=active]:bg-primary/20">
            <Monitor className="h-4 w-4 mr-2" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-info/20">
            <Brain className="h-4 w-4 mr-2" />
            IA Autônoma
            {statistics.pending > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-black h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {statistics.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="metrics" className="data-[state=active]:bg-primary/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Métricas IA
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-info/20">
            <HistoryIcon className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-accent/20">
            <TrendingUp className="h-4 w-4 mr-2" />
            Comparativo
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-success/20">
            <Lightbulb className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-warning/20">
            <Settings className="h-4 w-4 mr-2" />
            Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="mt-0">
          <Card className="bg-[#12121a] border-gray-800 p-6">
            <AIExecutiveDashboard />
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="mt-0">
          <div className="grid grid-cols-12 gap-4">
            {/* Systems Status Panel */}
            <Card className="col-span-3 bg-[#12121a] border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-success" />
                  Status dos Sistemas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {systems.map((system) => (
                  <div key={system.name} className="flex items-center justify-between p-2 rounded bg-[#1a1a24]">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", getStatusColor(system.status))} />
                      <span className="text-sm">{system.name}</span>
                    </div>
                    {system.latency && (
                      <span className="text-xs text-muted-foreground font-mono">{system.latency}ms</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Main Metrics */}
            <div className="col-span-6 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <Card className="bg-[#12121a] border-gray-800">
                  <CardContent className="pt-4 text-center">
                    <div className="text-3xl font-bold text-success">99.9%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#12121a] border-gray-800">
                  <CardContent className="pt-4 text-center">
                    <div className="text-3xl font-bold text-info">1,234</div>
                    <div className="text-xs text-muted-foreground">Req/min</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#12121a] border-gray-800">
                  <CardContent className="pt-4 text-center">
                    <div className="text-3xl font-bold text-warning">45ms</div>
                    <div className="text-xs text-muted-foreground">Latência</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#12121a] border-gray-800">
                  <CardContent className="pt-4 text-center">
                    <div className={cn("text-3xl font-bold", isActive ? "text-green-400" : "text-muted-foreground")}>
                      {isActive ? "ON" : "OFF"}
                    </div>
                    <div className="text-xs text-muted-foreground">IA Autônoma</div>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Feed */}
              <Card className="bg-[#12121a] border-gray-800 h-[400px]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <RefreshCcw className="h-4 w-4 text-primary animate-spin" />
                      Feed de Atividades
                    </CardTitle>
                    <Wifi className="h-4 w-4 text-success" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[320px] pr-4">
                    <div className="space-y-2 font-mono text-xs">
                      {[...Array(15)].map((_, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded bg-[#1a1a24]">
                          <span className="text-muted-foreground whitespace-nowrap">
                            {new Date(Date.now() - i * 30000).toLocaleTimeString('pt-BR')}
                          </span>
                          <span className="text-success">[INFO]</span>
                          <span className="text-gray-300">
                            {i % 3 === 0 ? "API request OK" : i % 3 === 1 ? "DB query 12ms" : "Session validated"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Alerts Panel */}
            <Card className="col-span-3 bg-[#12121a] border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4 text-warning" />
                  Alertas Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-2">
                  <div className="space-y-2">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={cn("p-3 rounded-lg border", alert.acknowledged ? "opacity-60 border-gray-800" : "border-gray-700")}>
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={getSeverityColor(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
                          <span className="text-xs text-muted-foreground">{Math.round((Date.now() - alert.timestamp.getTime()) / 60000)}m</span>
                        </div>
                        <div className="text-sm font-medium mb-1">{alert.title}</div>
                        <div className="text-xs text-muted-foreground mb-2">{alert.message}</div>
                        {!alert.acknowledged && (
                          <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={() => acknowledgeAlert(alert.id)}>
                            Reconhecer
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-0">
          <Card className="bg-[#12121a] border-gray-800 p-6">
            <AutonomousAIPanel />
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="mt-0">
          <Card className="bg-[#12121a] border-gray-800 p-6">
            <AILearningMetricsDashboard />
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card className="bg-[#12121a] border-gray-800 p-6">
            <AIDecisionHistory />
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-0">
          <Card className="bg-[#12121a] border-gray-800 p-6">
            <AIPerformanceComparison />
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-0">
          <Card className="bg-[#12121a] border-gray-800 p-6">
            <AIInsightsPanel />
          </Card>
        </TabsContent>

        <TabsContent value="config" className="mt-0">
          <Card className="bg-[#12121a] border-gray-800 p-6">
            <AIConfigurationPanel />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NOCModeLayout;
