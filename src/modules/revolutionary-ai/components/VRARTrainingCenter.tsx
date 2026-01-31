/**
 * VR/AR Training & Support Center
 * PATCH REVOLUTION v1.0
 * Immersive training and remote expert assistance
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Glasses, Video, Play, Award, Users, Clock,
  Monitor, Wifi, CheckCircle, Star, Target,
  Flame, Wrench, Ship, AlertTriangle, Phone,
  BookOpen, GraduationCap, Trophy, Zap, Plus, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface TrainingScenario {
  id: string;
  title: string;
  description: string;
  category: "emergency" | "navigation" | "maintenance" | "safety";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  duration: number; // minutes
  xpReward: number;
  completions: number;
  avgScore: number;
  imoApproved: boolean;
}

interface TrainingSession {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  userId: string;
  userName: string;
  score: number;
  duration: number;
  completedAt: string;
  certified: boolean;
}

interface RemoteSession {
  id: string;
  vesselName: string;
  technicianName: string;
  expertName: string;
  issue: string;
  status: "active" | "completed" | "scheduled";
  startedAt?: string;
  duration?: number;
  resolution?: string;
  savingsEstimate?: number;
}

const mockScenarios: TrainingScenario[] = [
  {
    id: "1",
    title: "Fire in Engine Room",
    description: "Combate a incêndio na sala de máquinas com simulação realista de fumaça e calor",
    category: "emergency",
    difficulty: "advanced",
    duration: 45,
    xpReward: 500,
    completions: 1247,
    avgScore: 82,
    imoApproved: true,
  },
  {
    id: "2",
    title: "Man Overboard (MOB)",
    description: "Procedimentos de resgate com condições meteorológicas variáveis",
    category: "emergency",
    difficulty: "intermediate",
    duration: 30,
    xpReward: 350,
    completions: 2891,
    avgScore: 78,
    imoApproved: true,
  },
  {
    id: "3",
    title: "Bridge Navigation - Traffic",
    description: "Navegação em tráfego intenso com radar, ECDIS e AIS realistas",
    category: "navigation",
    difficulty: "expert",
    duration: 60,
    xpReward: 750,
    completions: 892,
    avgScore: 71,
    imoApproved: true,
  },
  {
    id: "4",
    title: "Main Engine Overhaul",
    description: "Manutenção completa de motor principal com guia AR passo-a-passo",
    category: "maintenance",
    difficulty: "advanced",
    duration: 90,
    xpReward: 600,
    completions: 456,
    avgScore: 85,
    imoApproved: false,
  },
  {
    id: "5",
    title: "Collision Avoidance",
    description: "Cenários de colisão iminente com tomada de decisão sob pressão",
    category: "safety",
    difficulty: "expert",
    duration: 40,
    xpReward: 650,
    completions: 1023,
    avgScore: 74,
    imoApproved: true,
  },
];

const mockRemoteSessions: RemoteSession[] = [
  {
    id: "1",
    vesselName: "MV Ocean Star",
    technicianName: "João Silva",
    expertName: "Dr. Carlos Mendes",
    issue: "Turbocharger vibration analysis",
    status: "active",
    startedAt: "2025-01-20T14:00:00Z",
  },
  {
    id: "2",
    vesselName: "MV Sea Pride",
    technicianName: "Maria Santos",
    expertName: "Eng. Paulo Costa",
    issue: "Electrical fault in main switchboard",
    status: "completed",
    startedAt: "2025-01-20T10:00:00Z",
    duration: 45,
    resolution: "Faulty relay identified and replaced",
    savingsEstimate: 35000,
  },
  {
    id: "3",
    vesselName: "MV Blue Wave",
    technicianName: "Pedro Lima",
    expertName: "Eng. Ana Ferreira",
    issue: "Hydraulic system leak inspection",
    status: "scheduled",
    startedAt: "2025-01-21T09:00:00Z",
  },
];

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-500 border-green-500/30",
  intermediate: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  advanced: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  expert: "bg-red-500/10 text-red-500 border-red-500/30",
};

const categoryIcons = {
  emergency: AlertTriangle,
  navigation: Ship,
  maintenance: Wrench,
  safety: CheckCircle,
};

const statusColors = {
  active: "bg-green-500/10 text-green-500 border-green-500/30",
  completed: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  scheduled: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
};

export function VRARTrainingCenter() {
  const [selectedTab, setSelectedTab] = useState("scenarios");
  const [selectedScenario, setSelectedScenario] = useState<TrainingScenario | null>(null);
  const [scenarios, setScenarios] = useState<TrainingScenario[]>(mockScenarios);
  const [isAddScenarioOpen, setIsAddScenarioOpen] = useState(false);

  const handleStartTraining = (scenario: TrainingScenario) => {
    toast.success(`Iniciando treinamento: ${scenario.title}`, {
      description: "Prepare seu headset VR para a sessão imersiva"
    });
    setSelectedScenario(scenario);
  };

  const handleDeleteScenario = (id: string) => {
    if (confirm("Deseja remover este cenário?")) {
      setScenarios(prev => prev.filter(s => s.id !== id));
      toast.success("Cenário removido");
    }
  };

  const totalTrainees = mockScenarios.reduce((acc, s) => acc + s.completions, 0);
  const avgCompletionScore = Math.round(
    mockScenarios.reduce((acc, s) => acc + s.avgScore * s.completions, 0) / totalTrainees
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Glasses className="h-6 w-6 text-purple-500" />
            VR/AR Training & Support Center
          </h2>
          <p className="text-muted-foreground">
            Treinamento imersivo e suporte remoto com realidade aumentada
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
            <GraduationCap className="h-3 w-3 mr-1" />
            {totalTrainees.toLocaleString()} treinados
          </Badge>
          <Badge variant="outline" className="bg-green-500/10 text-green-500">
            <Trophy className="h-3 w-3 mr-1" />
            {avgCompletionScore}% média
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Glasses className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockScenarios.length}</p>
                <p className="text-xs text-muted-foreground">Cenários VR</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Video className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockRemoteSessions.filter(s => s.status === "active").length}
                </p>
                <p className="text-xs text-muted-foreground">Sessões AR Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Award className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockScenarios.filter(s => s.imoApproved).length}
                </p>
                <p className="text-xs text-muted-foreground">IMO Certificados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">$70k</p>
                <p className="text-xs text-muted-foreground">Economia/Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="scenarios">Cenários VR</TabsTrigger>
          <TabsTrigger value="remote">Suporte AR</TabsTrigger>
          <TabsTrigger value="digital-twin">Digital Twin</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => toast.info("Criação de cenários VR disponível em breve")} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cenário
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario, index) => {
              const CategoryIcon = categoryIcons[scenario.category];
              return (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <CategoryIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex gap-1 items-center">
                          {scenario.imoApproved && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs">
                              IMO ✓
                            </Badge>
                          )}
                          <Badge variant="outline" className={difficultyColors[scenario.difficulty]}>
                            {scenario.difficulty}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScenario(scenario.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2">{scenario.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {scenario.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {scenario.duration} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-500" />
                          +{scenario.xpReward} XP
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {scenario.completions.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-muted-foreground" />
                          {scenario.avgScore}% avg
                        </div>
                      </div>
                      <Button className="w-full" size="sm" onClick={() => handleStartTraining(scenario)}>
                        <Play className="h-4 w-4 mr-1" />
                        Iniciar Treinamento
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="remote" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-green-500" />
                Sessões de Suporte Remoto AR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRemoteSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 rounded-lg border ${
                      session.status === "active" ? "bg-green-500/5 border-green-500/30" : "bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Ship className="h-4 w-4 text-primary" />
                          <span className="font-medium">{session.vesselName}</span>
                          <Badge variant="outline" className={statusColors[session.status]}>
                            {session.status === "active" && <Wifi className="h-3 w-3 mr-1 animate-pulse" />}
                            {session.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{session.issue}</p>
                      </div>
                      {session.status === "active" && (
                        <Button size="sm" variant="destructive">
                          <Phone className="h-4 w-4 mr-1" />
                          Entrar
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Técnico: </span>
                        {session.technicianName}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expert: </span>
                        {session.expertName}
                      </div>
                    </div>
                    {session.status === "completed" && session.savingsEstimate && (
                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <span className="text-sm">
                          <CheckCircle className="h-4 w-4 inline text-green-500 mr-1" />
                          {session.resolution}
                        </span>
                        <Badge className="bg-green-500">
                          Economia: ${session.savingsEstimate.toLocaleString()}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ROI Card */}
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5">
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-4">💰 ROI do Suporte Remoto AR</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">-70%</div>
                  <div className="text-sm text-muted-foreground">Custo Expert</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500">80%</div>
                  <div className="text-sm text-muted-foreground">Resolvido Remoto</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-500">10x</div>
                  <div className="text-sm text-muted-foreground">Mais Rápido</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-500">$840k</div>
                  <div className="text-sm text-muted-foreground">Economia/Ano</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="digital-twin" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-blue-500" />
                Digital Twins da Frota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {["MV Ocean Star", "MV Sea Pride", "MV Blue Wave"].map((vessel, i) => (
                  <div key={vessel} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <Ship className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">{vessel}</h4>
                        <p className="text-xs text-muted-foreground">3D Model Available</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Scan Date:</span>
                        <span>2024-{12 - i}-15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Points:</span>
                        <span>{(15 + i * 3).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Accuracy:</span>
                        <span>±{2 - i * 0.3}mm</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Glasses className="h-4 w-4 mr-1" />
                        VR View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Monitor className="h-4 w-4 mr-1" />
                        Desktop
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">🎯 Casos de Uso do Digital Twin</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Planejamento de Drydock:</strong> Simule trabalhos antes de executar</li>
                  <li>• <strong>Treinamento:</strong> Familiarize tripulação com a embarcação</li>
                  <li>• <strong>Manutenção:</strong> Planeje modificações em ambiente virtual</li>
                  <li>• <strong>Inspeções:</strong> Revisão prévia de áreas a inspecionar</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
