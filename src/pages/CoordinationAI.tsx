import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import {
  Brain,
  Network,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  TrendingUp,
  BarChart3,
  Clock,
  Play,
} from "lucide-react";

interface ModuleStatus {
  id: string;
  name: string;
  status: "active" | "inactive" | "error" | "warning";
  health: number; // 0-100
  dependencies: string[];
  metrics: {
    uptime: string;
    requests: number;
    errors: number;
  };
}

interface AIDecision {
  id: string;
  timestamp: string;
  type: "optimization" | "failover" | "scaling" | "alert";
  module: string;
  action: string;
  reason: string;
  outcome: "success" | "pending" | "failed";
}

const CoordinationAI = () => {
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    // Initialize with mock data for the 6 system modules
    setModules([
      {
        id: "mission-control",
        name: "Mission Control",
        status: "active",
        health: 95,
        dependencies: ["telemetry", "fleet-management"],
        metrics: { uptime: "99.8%", requests: 1523, errors: 2 },
      },
      {
        id: "fleet-management",
        name: "Fleet Management",
        status: "active",
        health: 88,
        dependencies: ["ocean-sonar", "satellite"],
        metrics: { uptime: "99.2%", requests: 987, errors: 5 },
      },
      {
        id: "ocean-sonar",
        name: "Ocean Sonar AI",
        status: "warning",
        health: 72,
        dependencies: [],
        metrics: { uptime: "95.1%", requests: 654, errors: 12 },
      },
      {
        id: "telemetry",
        name: "Telemetry System",
        status: "active",
        health: 92,
        dependencies: ["satellite"],
        metrics: { uptime: "99.5%", requests: 2341, errors: 3 },
      },
      {
        id: "satellite",
        name: "Satellite Tracker",
        status: "active",
        health: 97,
        dependencies: [],
        metrics: { uptime: "99.9%", requests: 1876, errors: 1 },
      },
      {
        id: "ai-assistant",
        name: "AI Assistant",
        status: "active",
        health: 85,
        dependencies: ["mission-control"],
        metrics: { uptime: "98.7%", requests: 3421, errors: 8 },
      },
    ]);

    setDecisions([
      {
        id: "1",
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        type: "optimization",
        module: "ocean-sonar",
        action: "Increased processing buffer",
        reason: "High latency detected on data processing",
        outcome: "success",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        type: "alert",
        module: "fleet-management",
        action: "Notified admin of increased error rate",
        reason: "Error rate exceeded threshold (5 errors in 10 min)",
        outcome: "success",
      },
    ]);
  }, []);

  const getStatusIcon = (status: ModuleStatus["status"]) => {
    switch (status) {
    case "active":
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    case "error":
      return <XCircle className="w-5 h-5 text-red-600" />;
    case "inactive":
      return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ModuleStatus["status"]) => {
    switch (status) {
    case "active":
      return "default";
    case "warning":
      return "warning";
    case "error":
      return "destructive";
    case "inactive":
      return "secondary";
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return "text-green-600";
    if (health >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getDecisionTypeColor = (type: AIDecision["type"]) => {
    switch (type) {
    case "optimization":
      return "blue";
    case "failover":
      return "purple";
    case "scaling":
      return "green";
    case "alert":
      return "orange";
    }
  };

  const getOutcomeColor = (outcome: AIDecision["outcome"]) => {
    switch (outcome) {
    case "success":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
      return "destructive";
    }
  };

  const simulateDecision = () => {
    setIsSimulating(true);

    setTimeout(() => {
      const decisionTypes: AIDecision["type"][] = ["optimization", "failover", "scaling", "alert"];
      const randomType = decisionTypes[Math.floor(Math.random() * decisionTypes.length)];
      const randomModule = modules[Math.floor(Math.random() * modules.length)];

      const actions = {
        optimization: "Optimized resource allocation",
        failover: "Initiated failover to backup system",
        scaling: "Scaled up processing capacity",
        alert: "Generated system alert",
      };

      const reasons = {
        optimization: "Performance metrics below optimal levels",
        failover: "Primary system showing signs of instability",
        scaling: "Request load exceeding current capacity",
        alert: "Anomaly detected in system behavior",
      };

      const newDecision: AIDecision = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: randomType,
        module: randomModule.name,
        action: actions[randomType],
        reason: reasons[randomType],
        outcome: "success",
      };

      setDecisions((prev) => [newDecision, ...prev].slice(0, 20));
      setIsSimulating(false);
    }, 2000);
  };

  const systemHealth = useMemo(() => {
    const avg = modules.reduce((sum, m) => sum + m.health, 0) / modules.length;
    return Math.round(avg);
  }, [modules]);

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Brain}
        title="Coordination AI Control Center"
        description="Centro de controle e coordenação autônoma de sistemas críticos"
        gradient="purple"
        badges={[
          { icon: Brain, label: "AI Coordination" },
          { icon: Network, label: "Multi-Module" },
          { icon: Activity, label: "Real-Time" },
        ]}
      />

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="status">
            <Activity className="w-4 h-4 mr-2" />
            Module Status
          </TabsTrigger>
          <TabsTrigger value="dependencies">
            <Network className="w-4 h-4 mr-2" />
            Dependencies
          </TabsTrigger>
          <TabsTrigger value="decisions">
            <Brain className="w-4 h-4 mr-2" />
            AI Decisions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          {/* System Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className={`text-3xl font-bold ${getHealthColor(systemHealth)}`}>
                      {systemHealth}%
                    </div>
                    <div className="text-xs text-muted-foreground">Overall Health</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-green-600">
                      {modules.filter((m) => m.status === "active").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Active Modules</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-yellow-600">
                      {modules.filter((m) => m.status === "warning").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Warnings</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-red-600">
                      {modules.filter((m) => m.status === "error").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Errors</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Module Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(module.status)}
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                    </div>
                    <Badge variant={getStatusColor(module.status) as any}>
                      {module.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Health</span>
                      <span className={`font-semibold ${getHealthColor(module.health)}`}>
                        {module.health}%
                      </span>
                    </div>
                    <Progress value={module.health} className="h-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Uptime</div>
                      <div className="font-semibold">{module.metrics.uptime}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Requests</div>
                      <div className="font-semibold">{module.metrics.requests}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Errors</div>
                      <div className="font-semibold text-red-600">{module.metrics.errors}</div>
                    </div>
                  </div>
                  {module.dependencies.length > 0 && (
                    <div className="text-xs">
                      <div className="text-muted-foreground mb-1">Dependencies:</div>
                      <div className="flex flex-wrap gap-1">
                        {module.dependencies.map((dep) => (
                          <Badge key={dep} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Module Dependencies
              </CardTitle>
              <CardDescription>Visualization of module relationships and dependencies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modules.map((module) => (
                  <div key={module.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                      {getStatusIcon(module.status)}
                      <span className="font-semibold">{module.name}</span>
                    </div>
                    {module.dependencies.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">depends on</span>
                        <div className="flex gap-1">
                          {module.dependencies.map((dep) => (
                            <Badge key={dep} variant="secondary">
                              {modules.find((m) => m.id === dep)?.name || dep}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline">Independent</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Decision Log
                  </CardTitle>
                  <CardDescription>
                    Autonomous decisions made by the coordination AI
                  </CardDescription>
                </div>
                <Button onClick={simulateDecision} disabled={isSimulating}>
                  <Play className="w-4 h-4 mr-2" />
                  {isSimulating ? "Simulating..." : "Simulate Decision"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {decisions.length > 0 ? (
                  decisions.map((decision) => (
                    <div key={decision.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-${getDecisionTypeColor(decision.type)}-600`}>
                            {decision.type}
                          </Badge>
                          <Badge variant={getOutcomeColor(decision.outcome) as any}>
                            {decision.outcome}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(decision.timestamp).toLocaleString("pt-BR")}
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="font-semibold">Module:</span> {decision.module}
                        </div>
                        <div>
                          <span className="font-semibold">Action:</span> {decision.action}
                        </div>
                        <div className="text-muted-foreground">
                          <span className="font-semibold">Reason:</span> {decision.reason}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No AI decisions recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default CoordinationAI;
