/**
 * Autonomous Operations Center (AOC) - IA Autônoma Nível 5
 * Central de operações autônomas com decisões em tempo real
 */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain, Zap, CheckCircle2, XCircle, Clock, TrendingUp,
  Ship, Fuel, Users, Wrench, AlertTriangle, Sparkles,
  ThumbsUp, ThumbsDown, RotateCcw
} from "lucide-react";

interface AutonomousDecision {
  id: string;
  type: "refueling" | "routing" | "maintenance" | "crew" | "contract";
  title: string;
  description: string;
  confidence: number;
  status: "pending" | "approved" | "executed" | "rejected";
  impact: string;
  savings: string;
  timestamp: Date;
  reasoning: string[];
  consensus: string;
}

const MOCK_DECISIONS: AutonomousDecision[] = [
  {
    id: "1",
    type: "refueling",
    title: "Skip Singapore, Refuel in Colombo",
    description: "IA identificou economia de $15,500 em combustível",
    confidence: 0.97,
    status: "executed",
    impact: "high",
    savings: "$15,500",
    timestamp: new Date(Date.now() - 3600000),
    reasoning: [
      "Singapore bunker price: $550/ton",
      "Colombo bunker price: $520/ton",
      "Route deviation: +50nm (4 hours)",
      "Net savings: $15,500"
    ],
    consensus: "12/15 AI agents agree"
  },
  {
    id: "2",
    type: "maintenance",
    title: "Preventive Turbocharger Service",
    description: "Vibração anômala detectada - manutenção preventiva recomendada",
    confidence: 0.94,
    status: "pending",
    impact: "critical",
    savings: "$85,000",
    timestamp: new Date(Date.now() - 1800000),
    reasoning: [
      "Vibration increased 40% in 3 days",
      "Pattern matches bearing failure signature",
      "Estimated failure in 5-7 days",
      "Preventive cost: $15k vs Corrective: $100k"
    ],
    consensus: "14/15 AI agents agree"
  },
  {
    id: "3",
    type: "routing",
    title: "Reroute to Avoid Storm",
    description: "Sistema meteorológico severo detectado na rota original",
    confidence: 0.99,
    status: "approved",
    impact: "safety",
    savings: "Safety Priority",
    timestamp: new Date(Date.now() - 900000),
    reasoning: [
      "Storm system 48h ahead on current route",
      "Wind: 45-55 knots, waves: 6-8m",
      "Alternative route: +12h, calm conditions",
      "Risk assessment: Original route HIGH RISK"
    ],
    consensus: "15/15 AI agents agree"
  },
  {
    id: "4",
    type: "contract",
    title: "Accept Charter: Singapore-Rotterdam",
    description: "Oportunidade de freight rate premium detectada",
    confidence: 0.91,
    status: "pending",
    impact: "high",
    savings: "+$400,000",
    timestamp: new Date(),
    reasoning: [
      "Current market rate: $2.0M",
      "Offered rate: $2.4M (+20%)",
      "MV Ocean Star available in 5 days",
      "Profitability score: 94/100"
    ],
    consensus: "11/15 AI agents agree"
  }
];

const getTypeIcon = (type: string) => {
  const icons: Record<string, typeof Ship> = {
    refueling: Fuel,
    routing: Ship,
    maintenance: Wrench,
    crew: Users,
    contract: TrendingUp
  };
  return icons[type] || Brain;
};

const getStatusConfig = (status: string) => {
  const configs: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
    pending: { color: "text-yellow-500", icon: Clock },
    approved: { color: "text-blue-500", icon: CheckCircle2 },
    executed: { color: "text-green-500", icon: CheckCircle2 },
    rejected: { color: "text-red-500", icon: XCircle }
  };
  return configs[status] || configs.pending;
};

export function AutonomousOperationsCenter() {
  const [decisions, setDecisions] = useState<AutonomousDecision[]>(MOCK_DECISIONS);
  const [aiActivity, setAiActivity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAiActivity(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = (id: string) => {
    setDecisions(prev => prev.map(d => 
      d.id === id ? { ...d, status: "approved" as const } : d
    ));
  };

  const handleReject = (id: string) => {
    setDecisions(prev => prev.map(d => 
      d.id === id ? { ...d, status: "rejected" as const } : d
    ));
  };

  const stats = {
    total: decisions.length,
    executed: decisions.filter(d => d.status === "executed").length,
    pending: decisions.filter(d => d.status === "pending").length,
    avgConfidence: Math.round(decisions.reduce((acc, d) => acc + d.confidence, 0) / decisions.length * 100)
  };

  return (
    <div className="space-y-6">
      {/* AI Status Header */}
      <Card className="bg-gradient-to-r from-violet-600 to-purple-700 text-white border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="p-3 bg-white/20 rounded-full"
              >
                <Brain className="h-8 w-8" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  Autonomous Operations Center
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    <span className="animate-pulse mr-1">●</span> ONLINE
                  </Badge>
                </CardTitle>
                <CardDescription className="text-white/80">
                  IA Autônoma Nível 5 - Decisões em tempo real
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.avgConfidence}%</p>
              <p className="text-sm text-white/70">Confiança Média</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Decisões Hoje", value: stats.total, icon: Brain },
              { label: "Executadas", value: stats.executed, icon: CheckCircle2 },
              { label: "Pendentes", value: stats.pending, icon: Clock },
              { label: "Economia Total", value: "$500K+", icon: TrendingUp }
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <stat.icon className="h-4 w-4" />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-xs text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
          
          {/* AI Activity Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Atividade Neural</span>
              <span>{aiActivity}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-400"
                animate={{ width: `${aiActivity}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decisions Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Decisões Autônomas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {decisions.map((decision, i) => {
                    const TypeIcon = getTypeIcon(decision.type);
                    const statusConfig = getStatusConfig(decision.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <motion.div
                        key={decision.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className="border-l-4 border-l-violet-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                  <TypeIcon className="h-4 w-4 text-violet-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{decision.title}</p>
                                  <p className="text-xs text-muted-foreground">{decision.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                                <Badge variant={decision.status === "executed" ? "default" : "secondary"}>
                                  {decision.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-2 mb-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Confiança</span>
                                <span className="font-medium">{Math.round(decision.confidence * 100)}%</span>
                              </div>
                              <Progress value={decision.confidence * 100} className="h-1.5" />
                              <p className="text-xs text-muted-foreground">{decision.consensus}</p>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-2 mb-3">
                              <p className="text-xs font-medium mb-1">Raciocínio da IA:</p>
                              <ul className="text-xs text-muted-foreground space-y-0.5">
                                {decision.reasoning.slice(0, 2).map((r, i) => (
                                  <li key={i}>• {r}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-green-600">
                                {decision.savings}
                              </Badge>
                              
                              {decision.status === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(decision.id)}
                                  >
                                    <ThumbsDown className="h-3 w-3 mr-1" />
                                    Rejeitar
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(decision.id)}
                                  >
                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                    Aprovar
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* AI Agents Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Agentes IA Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Fuel Optimizer", status: "active", tasks: 847, accuracy: 98.2 },
                { name: "Route Planner", status: "active", tasks: 1243, accuracy: 97.8 },
                { name: "Maintenance Predictor", status: "active", tasks: 456, accuracy: 96.5 },
                { name: "Contract Analyzer", status: "active", tasks: 234, accuracy: 94.1 },
                { name: "Crew Scheduler", status: "active", tasks: 567, accuracy: 95.7 },
                { name: "Risk Sentinel", status: "active", tasks: 2341, accuracy: 99.1 },
                { name: "Weather Oracle", status: "active", tasks: 8976, accuracy: 97.3 },
                { name: "Port Predictor", status: "active", tasks: 1567, accuracy: 93.8 },
                { name: "Compliance Guardian", status: "active", tasks: 789, accuracy: 99.9 },
                { name: "ESG Advisor", status: "learning", tasks: 123, accuracy: 91.2 }
              ].map((agent, i) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                    <div>
                      <p className="font-medium text-sm">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.tasks} tarefas</p>
                    </div>
                  </div>
                  <Badge variant={agent.accuracy > 95 ? "default" : "secondary"}>
                    {agent.accuracy}%
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AutonomousOperationsCenter;
