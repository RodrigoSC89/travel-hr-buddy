/**
 * VR/AR Training Page - Full CRUD + Interactive Sessions
 * PATCH INTERACTIVITY: Complete CRUD for scenarios + session execution + export
 */
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { 
  Gamepad2, Play, Users, Award, Brain, 
  Target, Clock, Trophy, Star, CheckCircle,
  Plus, Trash2, Edit, Download, Copy, Pause, StopCircle,
  RefreshCw, Search, Filter
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface VRScenario {
  id: string;
  title: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  completions: number;
  avgScore: number;
  description: string;
  category: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
}

interface TrainingSession {
  scenarioId: string;
  startTime: Date;
  status: "running" | "paused" | "completed";
  score: number;
  elapsedTime: number;
}

const initialScenarios: VRScenario[] = [
  {
    id: "fire-engine-room",
    title: "Incêndio na Praça de Máquinas",
    duration: "25 min",
    difficulty: "advanced",
    completions: 45,
    avgScore: 78,
    description: "Responda a um incêndio no engine room com procedimentos SOLAS",
    category: "emergency",
    status: "published",
    createdAt: "2025-01-15"
  },
  {
    id: "man-overboard",
    title: "Homem ao Mar (MOB)",
    duration: "15 min",
    difficulty: "intermediate",
    completions: 89,
    avgScore: 85,
    description: "Procedimento completo de resgate de homem ao mar",
    category: "safety",
    status: "published",
    createdAt: "2025-01-10"
  },
  {
    id: "abandon-ship",
    title: "Abandono de Navio",
    duration: "30 min",
    difficulty: "advanced",
    completions: 32,
    avgScore: 72,
    description: "Evacuação completa com baleeiras e comunicação de emergência",
    category: "emergency",
    status: "published",
    createdAt: "2025-01-08"
  },
  {
    id: "collision",
    title: "Colisão e Alagamento",
    duration: "35 min",
    difficulty: "expert",
    completions: 18,
    avgScore: 68,
    description: "Controle de avarias após colisão com alagamento progressivo",
    category: "damage_control",
    status: "published",
    createdAt: "2025-01-05"
  },
  {
    id: "medical-emergency",
    title: "Emergência Médica",
    duration: "20 min",
    difficulty: "intermediate",
    completions: 67,
    avgScore: 82,
    description: "Atendimento de emergência médica a bordo",
    category: "medical",
    status: "published",
    createdAt: "2025-01-02"
  },
  {
    id: "oil-spill",
    title: "Derramamento de Óleo",
    duration: "25 min",
    difficulty: "intermediate",
    completions: 54,
    avgScore: 79,
    description: "Contenção e resposta a derramamento de óleo (SOPEP)",
    category: "environmental",
    status: "draft",
    createdAt: "2025-01-01"
  }
];

const VRTrainingPage = () => {
  const [scenarios, setScenarios] = useState<VRScenario[]>(initialScenarios);
  const [selectedScenario, setSelectedScenario] = useState<VRScenario | null>(null);
  const [activeSession, setActiveSession] = useState<TrainingSession | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<VRScenario | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "20 min",
    difficulty: "intermediate" as VRScenario["difficulty"],
    category: "emergency"
  });

  const filteredScenarios = scenarios.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || s.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const handleCreate = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const newScenario: VRScenario = {
        id: `scenario-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        difficulty: formData.difficulty,
        category: formData.category,
        completions: 0,
        avgScore: 0,
        status: "draft",
        createdAt: new Date().toISOString().split("T")[0]
      };
      setScenarios(prev => [...prev, newScenario]);
      setIsCreateOpen(false);
      setFormData({ title: "", description: "", duration: "20 min", difficulty: "intermediate", category: "emergency" });
      toast.success("Cenário VR criado com sucesso!", {
        description: `"${newScenario.title}" está pronto para edição`
      });
      setIsLoading(false);
    }, 800);
  }, [formData]);

  const handleEdit = useCallback(() => {
    if (!editingScenario) return;
    setIsLoading(true);
    setTimeout(() => {
      setScenarios(prev => prev.map(s => 
        s.id === editingScenario.id 
          ? { ...s, title: formData.title, description: formData.description, duration: formData.duration, difficulty: formData.difficulty, category: formData.category }
          : s
      ));
      setIsEditOpen(false);
      setEditingScenario(null);
      toast.success("Cenário atualizado com sucesso!");
      setIsLoading(false);
    }, 600);
  }, [editingScenario, formData]);

  const handleDelete = useCallback((id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;
    
    setScenarios(prev => prev.filter(s => s.id !== id));
    toast.success(`Cenário "${scenario.title}" removido`, {
      action: {
        label: "Desfazer",
        onClick: () => setScenarios(prev => [...prev, scenario])
      }
    });
  }, [scenarios]);

  const handleDuplicate = useCallback((scenario: VRScenario) => {
    const duplicate: VRScenario = {
      ...scenario,
      id: `${scenario.id}-copy-${Date.now()}`,
      title: `${scenario.title} (Cópia)`,
      completions: 0,
      avgScore: 0,
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0]
    };
    setScenarios(prev => [...prev, duplicate]);
    toast.success("Cenário duplicado!");
  }, []);

  const handlePublish = useCallback((id: string) => {
    setScenarios(prev => prev.map(s => 
      s.id === id ? { ...s, status: "published" as const } : s
    ));
    toast.success("Cenário publicado! Agora está disponível para treinamento.");
  }, []);

  const handleArchive = useCallback((id: string) => {
    setScenarios(prev => prev.map(s => 
      s.id === id ? { ...s, status: "archived" as const } : s
    ));
    toast.info("Cenário arquivado");
  }, []);

  const startSession = useCallback((scenario: VRScenario) => {
    setActiveSession({
      scenarioId: scenario.id,
      startTime: new Date(),
      status: "running",
      score: 0,
      elapsedTime: 0
    });
    setSelectedScenario(scenario);
    toast.success(`Iniciando sessão VR: ${scenario.title}`, {
      description: "Prepare seu equipamento VR"
    });
  }, []);

  const pauseSession = useCallback(() => {
    if (activeSession) {
      setActiveSession({ ...activeSession, status: "paused" });
      toast.info("Sessão pausada");
    }
  }, [activeSession]);

  const resumeSession = useCallback(() => {
    if (activeSession) {
      setActiveSession({ ...activeSession, status: "running" });
      toast.info("Sessão retomada");
    }
  }, [activeSession]);

  const completeSession = useCallback(() => {
    if (activeSession && selectedScenario) {
      const finalScore = Math.floor(70 + (selectedScenario.id.charCodeAt(0) % 25));
      setScenarios(prev => prev.map(s => 
        s.id === selectedScenario.id 
          ? { 
              ...s, 
              completions: s.completions + 1,
              avgScore: Math.round((s.avgScore * s.completions + finalScore) / (s.completions + 1))
            }
          : s
      ));
      toast.success(`Sessão concluída! Score: ${finalScore}%`, {
        description: "Resultado registrado com sucesso"
      });
      setActiveSession(null);
      setSelectedScenario(null);
    }
  }, [activeSession, selectedScenario]);

  const exportResults = useCallback(() => {
    const data = scenarios.map(s => ({
      Título: s.title,
      Dificuldade: s.difficulty,
      Duração: s.duration,
      Completions: s.completions,
      "Score Médio": `${s.avgScore}%`,
      Status: s.status,
      Categoria: s.category
    }));
    
    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map(row => Object.values(row).join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vr-training-results-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Resultados exportados em CSV!");
  }, [scenarios]);

  const openEdit = (scenario: VRScenario) => {
    setEditingScenario(scenario);
    setFormData({
      title: scenario.title,
      description: scenario.description,
      duration: scenario.duration,
      difficulty: scenario.difficulty,
      category: scenario.category
    });
    setIsEditOpen(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500";
      case "intermediate": return "bg-yellow-500";
      case "advanced": return "bg-orange-500";
      case "expert": return "bg-red-500";
      default: return "bg-muted";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-green-500">Publicado</Badge>;
      case "draft": return <Badge variant="outline">Rascunho</Badge>;
      case "archived": return <Badge variant="secondary">Arquivado</Badge>;
      default: return null;
    }
  };

  const leaderboard = [
    { rank: 1, name: "Cmte. João Silva", score: 9450, scenarios: 12, badge: "Elite" },
    { rank: 2, name: "1º Of. Maria Santos", score: 8920, scenarios: 11, badge: "Expert" },
    { rank: 3, name: "2º Of. Pedro Lima", score: 8100, scenarios: 10, badge: "Expert" },
    { rank: 4, name: "Eng. Carlos Souza", score: 7650, scenarios: 9, badge: "Advanced" },
    { rank: 5, name: "3º Of. Ana Costa", score: 7200, scenarios: 8, badge: "Advanced" }
  ];

  const myProgress = {
    completed: scenarios.filter(s => s.completions > 0).length,
    total: scenarios.length,
    avgScore: Math.round(scenarios.reduce((acc, s) => acc + s.avgScore, 0) / scenarios.length) || 0,
    totalTime: "2h 15min",
    rank: 8,
    nextBadge: "Expert",
    progressToBadge: 75
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Gamepad2 className="h-8 w-8 text-primary" />
            VR/AR Training Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Simulações imersivas para treinamento de emergência - {scenarios.length} cenários disponíveis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5">
            <Brain className="h-4 w-4 text-green-500" />
            AI Coach Ativo
          </Badge>
          <Button variant="outline" onClick={exportResults}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cenário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Cenário VR</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input 
                    value={formData.title}
                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="Nome do cenário"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Descrição do cenário"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duração</Label>
                    <Input 
                      value={formData.duration}
                      onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value }))}
                      placeholder="Ex: 20 min"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dificuldade</Label>
                    <Select 
                      value={formData.difficulty} 
                      onValueChange={(v) => setFormData(p => ({ ...p, difficulty: v as VRScenario["difficulty"] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Iniciante</SelectItem>
                        <SelectItem value="intermediate">Intermediário</SelectItem>
                        <SelectItem value="advanced">Avançado</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergência</SelectItem>
                      <SelectItem value="safety">Segurança</SelectItem>
                      <SelectItem value="medical">Médico</SelectItem>
                      <SelectItem value="damage_control">Controle de Avarias</SelectItem>
                      <SelectItem value="environmental">Ambiental</SelectItem>
                      <SelectItem value="navigation">Navegação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={!formData.title || isLoading}>
                  {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Criar Cenário
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Session Banner */}
      <AnimatePresence>
        {activeSession && selectedScenario && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/20 rounded-full">
                      <Gamepad2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Sessão Ativa: {selectedScenario.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Status: {activeSession.status === "running" ? "Em execução" : "Pausada"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {activeSession.status === "running" ? (
                      <Button variant="outline" onClick={pauseSession}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={resumeSession}>
                        <Play className="h-4 w-4 mr-2" />
                        Retomar
                      </Button>
                    )}
                    <Button onClick={completeSession}>
                      <StopCircle className="h-4 w-4 mr-2" />
                      Finalizar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* My Progress */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Meu Progresso</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Cenários</p>
                  <p className="text-2xl font-bold">{myProgress.completed}/{myProgress.total}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Score Médio</p>
                  <p className="text-2xl font-bold text-green-500">{myProgress.avgScore}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Total</p>
                  <p className="text-2xl font-bold">{myProgress.totalTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ranking</p>
                  <p className="text-2xl font-bold">#{myProgress.rank}</p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Progresso para {myProgress.nextBadge}</span>
                  <span>{myProgress.progressToBadge}%</span>
                </div>
                <Progress value={myProgress.progressToBadge} className="h-2" />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Award className="h-16 w-16 text-yellow-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="scenarios" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scenarios">Cenários VR ({filteredScenarios.length})</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar cenários..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredScenarios.length === 0 ? (
            <Card className="p-12 text-center">
              <Gamepad2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cenário encontrado</h3>
              <p className="text-muted-foreground mb-4">Crie seu primeiro cenário de treinamento VR</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Cenário
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredScenarios.map((scenario, index) => (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedScenario?.id === scenario.id ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{scenario.title}</CardTitle>
                          <div className="flex gap-1">
                            {getStatusBadge(scenario.status)}
                            <Badge className={getDifficultyColor(scenario.difficulty)}>
                              {scenario.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {scenario.description}
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                          <div>
                            <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                            <span>{scenario.duration}</span>
                          </div>
                          <div>
                            <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                            <span>{scenario.completions}</span>
                          </div>
                          <div>
                            <Star className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                            <span>{scenario.avgScore}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1" 
                            variant="outline" 
                            size="sm"
                            onClick={() => startSession(scenario)}
                            disabled={activeSession !== null || scenario.status !== "published"}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Iniciar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => openEdit(scenario)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDuplicate(scenario)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDelete(scenario.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        {scenario.status === "draft" && (
                          <Button 
                            className="w-full mt-2" 
                            size="sm"
                            onClick={() => handlePublish(scenario.id)}
                          >
                            Publicar Cenário
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Ranking Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <div 
                    key={user.rank}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      user.rank <= 3 ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        user.rank === 1 ? "bg-yellow-500 text-yellow-950" :
                        user.rank === 2 ? "bg-gray-300 text-gray-700" :
                        user.rank === 3 ? "bg-orange-400 text-orange-950" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {user.rank}
                      </div>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.scenarios} cenários completados
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{user.badge}</Badge>
                      <p className="text-xl font-bold text-primary">{user.score.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Conquistas</CardTitle>
              <CardDescription>Complete cenários para desbloquear conquistas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Primeiro Cenário", icon: "🎯", unlocked: true, description: "Complete seu primeiro cenário VR" },
                  { name: "Apagador de Incêndios", icon: "🔥", unlocked: true, description: "Complete todos os cenários de incêndio" },
                  { name: "Socorrista", icon: "🏥", unlocked: true, description: "Complete o cenário de emergência médica" },
                  { name: "Herói MOB", icon: "🌊", unlocked: true, description: "Score perfeito em Homem ao Mar" },
                  { name: "Expert em Abandono", icon: "🚤", unlocked: false, description: "Complete todos os níveis de abandono" },
                  { name: "Mestre de Emergências", icon: "👑", unlocked: false, description: "Complete todos os cenários com 90%+" }
                ].map((achievement, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      achievement.unlocked ? "bg-primary/5" : "bg-muted/30 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div>
                        <p className="font-semibold">{achievement.name}</p>
                        {achievement.unlocked && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Análise detalhada de performance e métricas de treinamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Target className="h-10 w-10 text-primary mx-auto mb-2" />
                      <p className="text-3xl font-bold">{scenarios.reduce((acc, s) => acc + s.completions, 0)}</p>
                      <p className="text-sm text-muted-foreground">Total de Completions</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Star className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                      <p className="text-3xl font-bold">
                        {Math.round(scenarios.reduce((acc, s) => acc + s.avgScore, 0) / scenarios.length)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Score Médio Global</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Trophy className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                      <p className="text-3xl font-bold">{scenarios.filter(s => s.status === "published").length}</p>
                      <p className="text-sm text-muted-foreground">Cenários Publicados</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cenário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duração</Label>
                <Input 
                  value={formData.duration}
                  onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Dificuldade</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(v) => setFormData(p => ({ ...p, difficulty: v as VRScenario["difficulty"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VRTrainingPage;
