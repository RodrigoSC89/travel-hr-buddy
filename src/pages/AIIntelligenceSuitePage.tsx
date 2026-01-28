/**
 * AI Intelligence Suite Page
 * Dashboard unificado para todos os 30+ engines de IA/ML
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain,
  Users,
  Wrench,
  Shield,
  DollarSign,
  Navigation,
  FileText,
  Bot,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Cpu,
  Zap,
  BarChart3,
  Eye,
  Settings,
  Play,
  Pause
} from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { AI_ENGINE_REGISTRY, type AIEngineInfo } from "@/lib/ai/engines";

const MODULE_ICONS: Record<string, React.ReactNode> = {
  crew: <Users className="h-5 w-5" />,
  maintenance: <Wrench className="h-5 w-5" />,
  compliance: <Shield className="h-5 w-5" />,
  finance: <DollarSign className="h-5 w-5" />,
  navigation: <Navigation className="h-5 w-5" />,
  documents: <FileText className="h-5 w-5" />,
  agentic: <Bot className="h-5 w-5" />,
};

const TYPE_COLORS: Record<string, string> = {
  ML: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  NLP: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Optimization: "bg-green-500/10 text-green-500 border-green-500/20",
  Prediction: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Agent: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  "Computer Vision": "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  Streaming: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

interface EngineStats {
  totalEngines: number;
  activeEngines: number;
  betaEngines: number;
  decisionsToday: number;
  avgConfidence: number;
  avgResponseTime: number;
}

export default function AIIntelligenceSuitePage() {
  const [activeModule, setActiveModule] = useState<string>("all");
  const [selectedEngine, setSelectedEngine] = useState<AIEngineInfo | null>(null);

  const stats: EngineStats = {
    totalEngines: AI_ENGINE_REGISTRY.length,
    activeEngines: AI_ENGINE_REGISTRY.filter(e => e.status === "active").length,
    betaEngines: AI_ENGINE_REGISTRY.filter(e => e.status === "beta").length,
    decisionsToday: 1247,
    avgConfidence: 89.3,
    avgResponseTime: 145,
  };

  const filteredEngines = activeModule === "all" 
    ? AI_ENGINE_REGISTRY 
    : AI_ENGINE_REGISTRY.filter(e => e.module === activeModule);

  const moduleStats = [
    { module: "crew", label: "Crew & HR", count: AI_ENGINE_REGISTRY.filter(e => e.module === "crew").length },
    { module: "maintenance", label: "Manutenção", count: AI_ENGINE_REGISTRY.filter(e => e.module === "maintenance").length },
    { module: "compliance", label: "Compliance", count: AI_ENGINE_REGISTRY.filter(e => e.module === "compliance").length },
    { module: "finance", label: "Financeiro", count: AI_ENGINE_REGISTRY.filter(e => e.module === "finance").length },
    { module: "navigation", label: "Navegação", count: AI_ENGINE_REGISTRY.filter(e => e.module === "navigation").length },
    { module: "documents", label: "Documentos", count: AI_ENGINE_REGISTRY.filter(e => e.module === "documents").length },
    { module: "agentic", label: "Agentic AI", count: AI_ENGINE_REGISTRY.filter(e => e.module === "agentic").length },
  ];

  return (
    <ModulePageWrapper gradient="purple">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Intelligence Suite</h1>
              <p className="text-muted-foreground">
                {stats.totalEngines} Engines • {stats.decisionsToday.toLocaleString()} decisões hoje
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.totalEngines}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Engines</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold text-green-500">{stats.activeEngines}</span>
              </div>
              <p className="text-sm text-muted-foreground">Ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-2xl font-bold text-yellow-500">{stats.betaEngines}</span>
              </div>
              <p className="text-sm text-muted-foreground">Beta</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold">{stats.decisionsToday.toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground">Decisões/Hoje</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold">{stats.avgConfidence}%</span>
              </div>
              <p className="text-sm text-muted-foreground">Confiança Média</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                <span className="text-2xl font-bold">{stats.avgResponseTime}ms</span>
              </div>
              <p className="text-sm text-muted-foreground">Tempo Resposta</p>
            </CardContent>
          </Card>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {moduleStats.map(({ module, label, count }) => (
            <Card 
              key={module}
              className={`cursor-pointer transition-all hover:scale-105 ${
                activeModule === module ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setActiveModule(activeModule === module ? "all" : module)}
            >
              <CardContent className="pt-4 pb-3 text-center">
                <div className={`inline-flex p-2 rounded-lg mb-2 ${
                  activeModule === module ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  {MODULE_ICONS[module]}
                </div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{count} engines</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Engines Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  AI/ML Engines 
                  <Badge variant="outline" className="ml-2">
                    {filteredEngines.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {activeModule === "all" ? "Todos os módulos" : moduleStats.find(m => m.module === activeModule)?.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="grid gap-3 md:grid-cols-2">
                    {filteredEngines.map((engine) => (
                      <Card 
                        key={engine.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedEngine?.id === engine.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedEngine(engine)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {MODULE_ICONS[engine.module]}
                              <h4 className="font-medium text-sm">{engine.name}</h4>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${TYPE_COLORS[engine.type] || ""}`}
                            >
                              {engine.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            {engine.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={engine.status === "active" ? "default" : "secondary"}
                              className={engine.status === "active" ? "bg-green-500" : ""}
                            >
                              {engine.status === "active" ? "Ativo" : "Beta"}
                            </Badge>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Play className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Engine Details Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedEngine ? selectedEngine.name : "Detalhes do Engine"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEngine ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Descrição</p>
                      <p className="text-sm">{selectedEngine.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Módulo</p>
                        <Badge variant="outline" className="mt-1">
                          {selectedEngine.module}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tipo</p>
                        <Badge variant="outline" className={`mt-1 ${TYPE_COLORS[selectedEngine.type]}`}>
                          {selectedEngine.type}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Performance</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Acurácia</span>
                          <span>92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                        
                        <div className="flex justify-between text-sm">
                          <span>Confiança</span>
                          <span>88%</span>
                        </div>
                        <Progress value={88} className="h-2" />
                        
                        <div className="flex justify-between text-sm">
                          <span>Uptime</span>
                          <span>99.9%</span>
                        </div>
                        <Progress value={99.9} className="h-2" />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Executar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione um engine para ver detalhes</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Multi-Agent Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Multi-Agent Orchestrator</CardTitle>
                <CardDescription>8 agentes especializados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: "Captain", emoji: "🎯", status: "active" },
                    { name: "Engineer", emoji: "🔧", status: "active" },
                    { name: "Safety", emoji: "🛡️", status: "active" },
                    { name: "Wellness", emoji: "💚", status: "idle" },
                    { name: "Navigator", emoji: "🧭", status: "active" },
                    { name: "Economist", emoji: "💰", status: "busy" },
                    { name: "Predictor", emoji: "🔮", status: "active" },
                    { name: "Comms", emoji: "📡", status: "active" },
                  ].map((agent) => (
                    <div 
                      key={agent.name}
                      className="text-center p-2 rounded-lg bg-muted"
                    >
                      <div className="text-xl mb-1">{agent.emoji}</div>
                      <p className="text-xs font-medium truncate">{agent.name}</p>
                      <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                        agent.status === "active" ? "bg-green-500" :
                        agent.status === "busy" ? "bg-yellow-500" : "bg-gray-400"
                      }`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModulePageWrapper>
  );
}
