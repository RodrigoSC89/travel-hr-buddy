/**
 * Unified AI Dashboard - PATCH 903
 * Central hub for all AI/ML capabilities
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  Ship,
  Users,
  Shield,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Bot,
  Cpu,
  Link2,
  Zap,
  TrendingUp,
  Settings,
  RefreshCw,
  Eye
} from "lucide-react";

// Import AI Engines
import { onnxPredictiveMaintenanceEngine, type FailurePrediction } from "@/lib/ai/engines/onnx-predictive-maintenance";
import { turnoverPredictionEngine, type TurnoverPrediction, type CrewMemberProfile } from "@/lib/ai/engines/turnover-prediction";

interface AIModuleStatus {
  name: string;
  category: "operations" | "crew" | "compliance" | "financial" | "agentic";
  status: "active" | "idle" | "error" | "disabled";
  level: "autonomous" | "semi-autonomous" | "assistive";
  lastRun: Date | null;
  metrics: {
    accuracy?: number;
    decisionsToday?: number;
    alertsGenerated?: number;
  };
}

export function UnifiedAIDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [modules, setModules] = useState<AIModuleStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeModules();
  }, []);

  const initializeModules = async () => {
    setIsLoading(true);
    
    // Initialize ONNX engine
    await onnxPredictiveMaintenanceEngine.initialize();
    
    const moduleList: AIModuleStatus[] = [
      // Operations & Fleet
      {
        name: "Manutenção Preditiva ONNX",
        category: "operations",
        status: "active",
        level: "semi-autonomous",
        lastRun: new Date(),
        metrics: { accuracy: 92, decisionsToday: 15, alertsGenerated: 3 }
      },
      {
        name: "Otimização de Rota Real-time",
        category: "operations",
        status: "active",
        level: "autonomous",
        lastRun: new Date(),
        metrics: { accuracy: 89, decisionsToday: 45 }
      },
      {
        name: "Digital Twin 3D Preditivo",
        category: "operations",
        status: "active",
        level: "assistive",
        lastRun: new Date(),
        metrics: { accuracy: 94 }
      },
      {
        name: "Anomaly Detection IoT",
        category: "operations",
        status: "active",
        level: "autonomous",
        lastRun: new Date(),
        metrics: { alertsGenerated: 12, accuracy: 96 }
      },
      // Crew & HR
      {
        name: "Predição de Turnover",
        category: "crew",
        status: "active",
        level: "assistive",
        lastRun: new Date(),
        metrics: { accuracy: 87, alertsGenerated: 5 }
      },
      {
        name: "Matching Inteligente de Crew",
        category: "crew",
        status: "active",
        level: "semi-autonomous",
        lastRun: new Date(),
        metrics: { accuracy: 91, decisionsToday: 8 }
      },
      {
        name: "Análise de Wellbeing NLP",
        category: "crew",
        status: "active",
        level: "assistive",
        lastRun: new Date(),
        metrics: { accuracy: 85 }
      },
      {
        name: "Treinamento Adaptativo",
        category: "crew",
        status: "active",
        level: "semi-autonomous",
        lastRun: new Date(),
        metrics: { decisionsToday: 22 }
      },
      // Compliance & Security
      {
        name: "Auditoria Contínua Automatizada",
        category: "compliance",
        status: "active",
        level: "autonomous",
        lastRun: new Date(),
        metrics: { accuracy: 98, decisionsToday: 156 }
      },
      {
        name: "Risk Scoring Dinâmico",
        category: "compliance",
        status: "active",
        level: "semi-autonomous",
        lastRun: new Date(),
        metrics: { accuracy: 93 }
      },
      {
        name: "Detecção de Anomalias de Acesso",
        category: "compliance",
        status: "active",
        level: "autonomous",
        lastRun: new Date(),
        metrics: { alertsGenerated: 2, accuracy: 97 }
      },
      {
        name: "Previsão de Não-Conformidades",
        category: "compliance",
        status: "active",
        level: "assistive",
        lastRun: new Date(),
        metrics: { accuracy: 84 }
      },
      // Financial
      {
        name: "Forecasting de OPEX",
        category: "financial",
        status: "active",
        level: "assistive",
        lastRun: new Date(),
        metrics: { accuracy: 88 }
      },
      {
        name: "Otimização de Bunker ML",
        category: "financial",
        status: "active",
        level: "semi-autonomous",
        lastRun: new Date(),
        metrics: { decisionsToday: 6 }
      },
      {
        name: "Análise de Contratos NLP",
        category: "financial",
        status: "active",
        level: "assistive",
        lastRun: new Date(),
        metrics: { accuracy: 86 }
      },
      {
        name: "Detecção de Fraudes",
        category: "financial",
        status: "active",
        level: "autonomous",
        lastRun: new Date(),
        metrics: { alertsGenerated: 0, accuracy: 99 }
      },
      // Agentic AI
      {
        name: "Multi-Agent Orchestrator",
        category: "agentic",
        status: "active",
        level: "autonomous",
        lastRun: new Date(),
        metrics: { decisionsToday: 34, accuracy: 95 }
      },
      {
        name: "Self-Healing System",
        category: "agentic",
        status: "active",
        level: "autonomous",
        lastRun: new Date(),
        metrics: { decisionsToday: 8, accuracy: 97 }
      },
      {
        name: "Consensus Decision Engine",
        category: "agentic",
        status: "active",
        level: "autonomous",
        lastRun: new Date(),
        metrics: { decisionsToday: 12, accuracy: 94 }
      },
      {
        name: "Blockchain Audit Trail",
        category: "agentic",
        status: "active",
        level: "autonomous",
        lastRun: new Date(),
        metrics: { decisionsToday: 267 }
      }
    ];
    
    setModules(moduleList);
    setIsLoading(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "operations": return <Ship className="h-4 w-4" />;
      case "crew": return <Users className="h-4 w-4" />;
      case "compliance": return <Shield className="h-4 w-4" />;
      case "financial": return <DollarSign className="h-4 w-4" />;
      case "agentic": return <Brain className="h-4 w-4" />;
      default: return <Cpu className="h-4 w-4" />;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "autonomous":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Autônomo</Badge>;
      case "semi-autonomous":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Semi-autônomo</Badge>;
      case "assistive":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Assistivo</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "active":
        return <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />;
      case "idle":
        return <span className="flex h-2 w-2 rounded-full bg-yellow-500" />;
      case "error":
        return <span className="flex h-2 w-2 rounded-full bg-red-500" />;
      default:
        return <span className="flex h-2 w-2 rounded-full bg-gray-500" />;
    }
  };

  const stats = {
    totalModules: modules.length,
    activeModules: modules.filter(m => m.status === "active").length,
    autonomousModules: modules.filter(m => m.level === "autonomous").length,
    decisionsToday: modules.reduce((sum, m) => sum + (m.metrics.decisionsToday || 0), 0),
    avgAccuracy: Math.round(
      modules.filter(m => m.metrics.accuracy).reduce((sum, m) => sum + (m.metrics.accuracy || 0), 0) /
      modules.filter(m => m.metrics.accuracy).length
    ),
    alertsToday: modules.reduce((sum, m) => sum + (m.metrics.alertsGenerated || 0), 0)
  };

  const categoryModules = (category: string) => modules.filter(m => m.category === category);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Brain className="h-12 w-12 mx-auto animate-pulse text-primary" />
          <p className="text-muted-foreground">Inicializando módulos AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{stats.totalModules}</span>
            </div>
            <p className="text-xs text-muted-foreground">Módulos AI</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{stats.activeModules}</span>
            </div>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{stats.autonomousModules}</span>
            </div>
            <p className="text-xs text-muted-foreground">Autônomos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-2xl font-bold">{stats.decisionsToday}</span>
            </div>
            <p className="text-xs text-muted-foreground">Decisões Hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold">{stats.avgAccuracy}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Precisão Média</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold">{stats.alertsToday}</span>
            </div>
            <p className="text-xs text-muted-foreground">Alertas Hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-1">
            <Ship className="h-4 w-4" />
            <span className="hidden sm:inline">Operações</span>
          </TabsTrigger>
          <TabsTrigger value="crew" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Tripulação</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="agentic" className="flex items-center gap-1">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Agêntico</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
              <Card key={module.name} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIndicator(module.status)}
                      {getCategoryIcon(module.category)}
                      <CardTitle className="text-sm">{module.name}</CardTitle>
                    </div>
                    {getLevelBadge(module.level)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    {module.metrics.accuracy && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span>{module.metrics.accuracy}% precisão</span>
                      </div>
                    )}
                    {module.metrics.decisionsToday !== undefined && (
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-blue-500" />
                        <span>{module.metrics.decisionsToday} decisões</span>
                      </div>
                    )}
                    {module.metrics.alertsGenerated !== undefined && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                        <span>{module.metrics.alertsGenerated} alertas</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Category Tabs */}
        {["operations", "crew", "compliance", "financial", "agentic"].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <CategorySection 
              category={category} 
              modules={categoryModules(category)}
              getLevelBadge={getLevelBadge}
              getStatusIndicator={getStatusIndicator}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface CategorySectionProps {
  category: string;
  modules: AIModuleStatus[];
  getLevelBadge: (level: string) => React.ReactNode;
  getStatusIndicator: (status: string) => React.ReactNode;
}

function CategorySection({ category, modules, getLevelBadge, getStatusIndicator }: CategorySectionProps) {
  const categoryInfo: Record<string, { title: string; description: string }> = {
    operations: {
      title: "🚢 Operações & Frota",
      description: "Manutenção preditiva, otimização de rotas, digital twin e detecção de anomalias IoT"
    },
    crew: {
      title: "👥 RH & Tripulação",
      description: "Predição de turnover, matching de crew, análise de wellbeing e treinamento adaptativo"
    },
    compliance: {
      title: "✅ Compliance & Segurança",
      description: "Auditoria contínua, risk scoring, detecção de anomalias de acesso e previsão de NCs"
    },
    financial: {
      title: "💰 Financeiro & Custos",
      description: "Forecasting de OPEX, otimização de bunker, análise de contratos e detecção de fraudes"
    },
    agentic: {
      title: "🧠 IA Agêntica Avançada",
      description: "Multi-agent orchestrator, self-healing, consensus engine e blockchain audit trail"
    }
  };

  const info = categoryInfo[category];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{info.title}</CardTitle>
          <CardDescription>{info.description}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {modules.map((module) => (
          <Card key={module.name} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIndicator(module.status)}
                  <CardTitle className="text-base">{module.name}</CardTitle>
                </div>
                {getLevelBadge(module.level)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {module.metrics.accuracy && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Precisão</span>
                    <span className="font-medium">{module.metrics.accuracy}%</span>
                  </div>
                  <Progress value={module.metrics.accuracy} className="h-2" />
                </div>
              )}
              
              <div className="flex gap-4 text-sm">
                {module.metrics.decisionsToday !== undefined && (
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span>{module.metrics.decisionsToday} decisões hoje</span>
                  </div>
                )}
                {module.metrics.alertsGenerated !== undefined && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span>{module.metrics.alertsGenerated} alertas</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Settings className="h-4 w-4 mr-1" />
                  Configurar
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default UnifiedAIDashboard;
