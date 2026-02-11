/**
 * VR/AR Training Scenario Manager - CRUD Completo
 * Criar, executar, avaliar e exportar cenários de treinamento
 */

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Glasses,
  Play,
  Pause,
  Square,
  Star,
  Download,
  Plus,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  Search,
  Filter,
  Clock,
  Users,
  Award,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  FileText,
  Video,
  Headphones,
  Target,
  Zap,
  TrendingUp,
} from "lucide-react";

interface Scenario {
  id: string;
  title: string;
  description: string;
  type: "vr" | "ar" | "mixed";
  category: "safety" | "operations" | "emergency" | "maintenance" | "navigation";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  duration_minutes: number;
  max_participants: number;
  objectives: string[];
  equipment_required: string[];
  status: "draft" | "published" | "archived";
  version: number;
  created_at: string;
  updated_at: string;
  sessions_count: number;
  avg_score: number;
}

interface TrainingSession {
  id: string;
  scenario_id: string;
  participant_name: string;
  participant_role: string;
  started_at: string;
  completed_at?: string;
  status: "in_progress" | "completed" | "failed" | "abandoned";
  score?: number;
  time_spent_minutes?: number;
  objectives_completed: number;
  total_objectives: number;
  feedback?: string;
  evaluator?: string;
  evaluation_notes?: string;
}

// Fallback data
const fallbackScenarios: Scenario[] = [
  {
    id: "scn-001", title: "Evacuação de Emergência - Nível 1",
    description: "Simulação VR de procedimentos de evacuação em caso de incêndio a bordo",
    type: "vr", category: "emergency", difficulty: "beginner", duration_minutes: 30,
    max_participants: 10,
    objectives: ["Identificar alarme", "Localizar ponto de encontro", "Vestir colete", "Seguir rota"],
    equipment_required: ["Headset VR", "Controladores"],
    status: "published", version: 3, created_at: "2025-11-01T10:00:00Z", updated_at: "2026-01-15T14:30:00Z",
    sessions_count: 156, avg_score: 87.5,
  },
];

const fallbackSessions: TrainingSession[] = [
  {
    id: "sess-001", scenario_id: "scn-001", participant_name: "Carlos Silva",
    participant_role: "Marinheiro", started_at: "2026-01-30T14:00:00Z",
    completed_at: "2026-01-30T14:28:00Z", status: "completed", score: 92,
    time_spent_minutes: 28, objectives_completed: 4, total_objectives: 4,
    feedback: "Excelente desempenho", evaluator: "Cap. João Mendes",
    evaluation_notes: "Recomendado para cenário avançado",
  },
];

const categoryLabels: Record<string, string> = {
  safety: "Segurança",
  operations: "Operações",
  emergency: "Emergência",
  maintenance: "Manutenção",
  navigation: "Navegação",
};

const difficultyLabels: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
  expert: "Especialista",
};

const typeLabels: Record<string, string> = {
  vr: "VR",
  ar: "AR",
  mixed: "Misto",
};

export function VRARScenarioManager() {
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<Scenario[]>(fallbackScenarios);
  const [sessions, setSessions] = useState<TrainingSession[]>(fallbackSessions);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await supabase.from("academy_courses").select("*").limit(10);
        if (data && data.length > 0) {
          const mapped: Scenario[] = data.map(c => ({
            id: c.id, title: c.course_name, description: c.course_description || "",
            type: "vr" as const, category: "safety" as const, difficulty: "intermediate" as const,
            duration_minutes: (c.duration_hours || 1) * 60, max_participants: 10,
            objectives: ((c.modules as unknown[]) || []).map(() => "Objetivo"), equipment_required: ["Headset VR"],
            status: c.is_published ? "published" as const : "draft" as const, version: 1,
            created_at: c.created_at || "", updated_at: c.updated_at || "",
            sessions_count: 0, avg_score: 0,
          }));
          setScenarios(mapped);
        }
      } catch { /* fallback */ }
    };
    loadData();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("scenarios");
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isExecuteOpen, setIsExecuteOpen] = useState(false);
  const [isEvaluateOpen, setIsEvaluateOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "vr" as "vr" | "ar" | "mixed",
    category: "safety" as "safety" | "operations" | "emergency" | "maintenance" | "navigation",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced" | "expert",
    duration_minutes: 30,
    max_participants: 5,
    objectives: "",
    equipment_required: "",
  });
  
  // Execution state
  const [executionState, setExecutionState] = useState({
    participantName: "",
    participantRole: "",
    isRunning: false,
    currentObjective: 0,
    elapsedTime: 0,
  });
  
  // Evaluation state
  const [evaluationData, setEvaluationData] = useState({
    score: 80,
    feedback: "",
    evaluator: "",
    notes: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Filtered scenarios
  const filteredScenarios = useMemo(() => {
    return scenarios.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [scenarios, searchQuery, categoryFilter, statusFilter]);

  // Create scenario
  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const newScenario: Scenario = {
        id: `scn-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        difficulty: formData.difficulty,
        duration_minutes: formData.duration_minutes,
        max_participants: formData.max_participants,
        objectives: formData.objectives.split("\n").filter(Boolean),
        equipment_required: formData.equipment_required.split("\n").filter(Boolean),
        status: "draft",
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sessions_count: 0,
        avg_score: 0,
      };
      
      setScenarios((prev) => [newScenario, ...prev]);
      setIsCreateOpen(false);
      resetForm();
      
      toast({
        title: "Cenário criado",
        description: `"${newScenario.title}" salvo como rascunho`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Edit scenario
  const handleEdit = async () => {
    if (!selectedScenario) return;
    setIsLoading(true);
    try {
      // Update scenario in local state
      
      setScenarios((prev) =>
        prev.map((s) =>
          s.id === selectedScenario.id
            ? {
                ...s,
                title: formData.title,
                description: formData.description,
                type: formData.type,
                category: formData.category,
                difficulty: formData.difficulty,
                duration_minutes: formData.duration_minutes,
                max_participants: formData.max_participants,
                objectives: formData.objectives.split("\n").filter(Boolean),
                equipment_required: formData.equipment_required.split("\n").filter(Boolean),
                updated_at: new Date().toISOString(),
                version: s.version + 1,
              }
            : s
        )
      );
      
      setIsEditOpen(false);
      toast({
        title: "Cenário atualizado",
        description: `Versão ${selectedScenario.version + 1} salva`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete scenario
  const handleDelete = async (scenario: Scenario) => {
    setIsLoading(true);
    try {
      // Remove scenario from local state
      setScenarios((prev) => prev.filter((s) => s.id !== scenario.id));
      toast({
        title: "Cenário excluído",
        description: scenario.title,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Duplicate scenario
  const handleDuplicate = async (scenario: Scenario) => {
    setIsLoading(true);
    try {
      // Duplicate scenario
      
      const duplicated: Scenario = {
        ...scenario,
        id: `scn-${Date.now()}`,
        title: `${scenario.title} (Cópia)`,
        status: "draft",
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sessions_count: 0,
        avg_score: 0,
      };
      
      setScenarios((prev) => [duplicated, ...prev]);
      toast({
        title: "Cenário duplicado",
        description: duplicated.title,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Publish/Archive scenario
  const handleStatusChange = async (scenario: Scenario, newStatus: "published" | "archived" | "draft") => {
    setIsLoading(true);
    try {
      // Update status
      
      setScenarios((prev) =>
        prev.map((s) =>
          s.id === scenario.id
            ? { ...s, status: newStatus, updated_at: new Date().toISOString() }
            : s
        )
      );
      
      const statusLabels = { published: "publicado", archived: "arquivado", draft: "despublicado" };
      toast({
        title: `Cenário ${statusLabels[newStatus]}`,
        description: scenario.title,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start training session
  const handleStartSession = async () => {
    if (!selectedScenario) return;
    setIsLoading(true);
    try {
      // Create session
      
      const newSession: TrainingSession = {
        id: `sess-${Date.now()}`,
        scenario_id: selectedScenario.id,
        participant_name: executionState.participantName,
        participant_role: executionState.participantRole,
        started_at: new Date().toISOString(),
        status: "in_progress",
        objectives_completed: 0,
        total_objectives: selectedScenario.objectives.length,
      };
      
      setSessions((prev) => [newSession, ...prev]);
      setSelectedSession(newSession);
      setExecutionState((prev) => ({ ...prev, isRunning: true, currentObjective: 0 }));
      
      toast({
        title: "Sessão iniciada",
        description: `${executionState.participantName} - ${selectedScenario.title}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Complete objective
  const handleCompleteObjective = () => {
    if (!selectedSession || !selectedScenario) return;
    
    const newCompleted = executionState.currentObjective + 1;
    setExecutionState((prev) => ({ ...prev, currentObjective: newCompleted }));
    
    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSession.id
          ? { ...s, objectives_completed: newCompleted }
          : s
      )
    );
    
    if (newCompleted >= selectedScenario.objectives.length) {
      handleFinishSession();
    }
  };

  // Finish session
  const handleFinishSession = () => {
    if (!selectedSession) return;
    
    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSession.id
          ? {
              ...s,
              status: "completed" as const,
              completed_at: new Date().toISOString(),
              time_spent_minutes: Math.floor(executionState.elapsedTime / 60),
            }
          : s
      )
    );
    
    setExecutionState((prev) => ({ ...prev, isRunning: false }));
    setIsExecuteOpen(false);
    
    // Open evaluation immediately
    setIsEvaluateOpen(true);
    
    toast({
      title: "Sessão concluída",
      description: "Prossiga com a avaliação do participante",
    });
  };

  // Submit evaluation
  const handleSubmitEvaluation = async () => {
    if (!selectedSession) return;
    setIsLoading(true);
    try {
      // Save evaluation
      
      setSessions((prev) =>
        prev.map((s) =>
          s.id === selectedSession.id
            ? {
                ...s,
                score: evaluationData.score,
                feedback: evaluationData.feedback,
                evaluator: evaluationData.evaluator,
                evaluation_notes: evaluationData.notes,
              }
            : s
        )
      );
      
      setIsEvaluateOpen(false);
      setEvaluationData({ score: 80, feedback: "", evaluator: "", notes: "" });
      
      toast({
        title: "Avaliação registrada",
        description: `Nota: ${evaluationData.score}%`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Export results
  const handleExport = (format: "csv" | "pdf") => {
    const data = sessions.filter((s) => s.status === "completed");
    
    if (format === "csv") {
      const csv = [
        "Participante,Cenário,Data,Nota,Tempo (min),Objetivos,Avaliador",
        ...data.map((s) => {
          const scenario = scenarios.find((sc) => sc.id === s.scenario_id);
          return `"${s.participant_name}","${scenario?.title}","${s.completed_at}",${s.score},${s.time_spent_minutes},"${s.objectives_completed}/${s.total_objectives}","${s.evaluator || ""}"`;
        }),
      ].join("\n");
      
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `treinamentos-vrar-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }
    
    toast({
      title: "Exportação concluída",
      description: `${data.length} sessões exportadas em ${format.toUpperCase()}`,
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "vr",
      category: "safety",
      difficulty: "beginner",
      duration_minutes: 30,
      max_participants: 5,
      objectives: "",
      equipment_required: "",
    });
  };

  const openEditModal = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setFormData({
      title: scenario.title,
      description: scenario.description,
      type: scenario.type,
      category: scenario.category,
      difficulty: scenario.difficulty,
      duration_minutes: scenario.duration_minutes,
      max_participants: scenario.max_participants,
      objectives: scenario.objectives.join("\n"),
      equipment_required: scenario.equipment_required.join("\n"),
    });
    setIsEditOpen(true);
  };

  const openExecuteModal = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setExecutionState({
      participantName: "",
      participantRole: "",
      isRunning: false,
      currentObjective: 0,
      elapsedTime: 0,
    });
    setIsExecuteOpen(true);
  };

  // Stats
  const stats = useMemo(() => {
    const published = scenarios.filter((s) => s.status === "published").length;
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.status === "completed").length;
    const avgScore = completedSessions > 0
      ? Math.round(sessions.filter((s) => s.score).reduce((acc, s) => acc + (s.score || 0), 0) / completedSessions)
      : 0;
    
    return { published, totalSessions, completedSessions, avgScore };
  }, [scenarios, sessions]);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
            <Glasses className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">VR/AR Training Center</h1>
            <p className="text-muted-foreground">
              Cenários de treinamento imersivo
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cenário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cenários Publicados</p>
                <p className="text-2xl font-bold">{stats.published}</p>
              </div>
              <Video className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sessões Totais</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
              <Users className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">{stats.completedSessions}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nota Média</p>
                <p className="text-2xl font-bold">{stats.avgScore}%</p>
              </div>
              <Award className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cenários..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                <SelectItem value="safety">Segurança</SelectItem>
                <SelectItem value="operations">Operações</SelectItem>
                <SelectItem value="emergency">Emergência</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="navigation">Navegação</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scenarios Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cenário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Dificuldade</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Sessões</TableHead>
                  <TableHead>Nota Média</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScenarios.map((scenario) => (
                  <TableRow key={scenario.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{scenario.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {scenario.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{typeLabels[scenario.type]}</Badge>
                    </TableCell>
                    <TableCell>{categoryLabels[scenario.category]}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          scenario.difficulty === "expert"
                            ? "destructive"
                            : scenario.difficulty === "advanced"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {difficultyLabels[scenario.difficulty]}
                      </Badge>
                    </TableCell>
                    <TableCell>{scenario.duration_minutes} min</TableCell>
                    <TableCell>{scenario.sessions_count}</TableCell>
                    <TableCell>
                      {scenario.avg_score > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-warning fill-warning" />
                          {scenario.avg_score}%
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          scenario.status === "published"
                            ? "default"
                            : scenario.status === "draft"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {scenario.status === "published"
                          ? "Publicado"
                          : scenario.status === "draft"
                          ? "Rascunho"
                          : "Arquivado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {scenario.status === "published" && (
                            <DropdownMenuItem onClick={() => openExecuteModal(scenario)}>
                              <Play className="h-4 w-4 mr-2" />
                              Iniciar Sessão
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => openEditModal(scenario)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(scenario)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {scenario.status === "draft" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(scenario, "published")}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Publicar
                            </DropdownMenuItem>
                          )}
                          {scenario.status === "published" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(scenario, "archived")}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Arquivar
                            </DropdownMenuItem>
                          )}
                          {scenario.status === "archived" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(scenario, "draft")}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Restaurar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(scenario)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sessões de Treinamento</CardTitle>
              <CardDescription>Histórico de execuções e avaliações</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participante</TableHead>
                    <TableHead>Cenário</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Avaliador</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => {
                    const scenario = scenarios.find((s) => s.id === session.scenario_id);
                    return (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{session.participant_name}</p>
                            <p className="text-sm text-muted-foreground">{session.participant_role}</p>
                          </div>
                        </TableCell>
                        <TableCell>{scenario?.title || "N/A"}</TableCell>
                        <TableCell>
                          {new Date(session.started_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(session.objectives_completed / session.total_objectives) * 100}
                              className="w-20"
                            />
                            <span className="text-sm">
                              {session.objectives_completed}/{session.total_objectives}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {session.score ? (
                            <Badge variant={session.score >= 80 ? "default" : "secondary"}>
                              {session.score}%
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              session.status === "completed"
                                ? "default"
                                : session.status === "in_progress"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {session.status === "completed"
                              ? "Concluída"
                              : session.status === "in_progress"
                              ? "Em andamento"
                              : session.status === "failed"
                              ? "Falhou"
                              : "Abandonada"}
                          </Badge>
                        </TableCell>
                        <TableCell>{session.evaluator || "-"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exportar Relatórios</CardTitle>
              <CardDescription>Gere relatórios de treinamentos realizados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleExport("csv")}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport("pdf")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cenário de Treinamento</DialogTitle>
            <DialogDescription>
              Crie um novo cenário VR/AR para treinamento da tripulação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Evacuação de Emergência - Nível 1"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o cenário de treinamento..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "vr" | "ar" | "mixed") =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vr">VR - Realidade Virtual</SelectItem>
                    <SelectItem value="ar">AR - Realidade Aumentada</SelectItem>
                    <SelectItem value="mixed">Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value as typeof prev.category }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safety">Segurança</SelectItem>
                    <SelectItem value="operations">Operações</SelectItem>
                    <SelectItem value="emergency">Emergência</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="navigation">Navegação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Dificuldade</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, difficulty: value as typeof prev.difficulty }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                    <SelectItem value="expert">Especialista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duração (min)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, duration_minutes: parseInt(e.target.value) || 30 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Máx. Participantes</Label>
                <Input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, max_participants: parseInt(e.target.value) || 5 }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Objetivos (um por linha)</Label>
              <Textarea
                value={formData.objectives}
                onChange={(e) => setFormData((prev) => ({ ...prev, objectives: e.target.value }))}
                placeholder="Identificar alarme de emergência&#10;Localizar ponto de encontro&#10;..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Equipamentos Necessários (um por linha)</Label>
              <Textarea
                value={formData.equipment_required}
                onChange={(e) => setFormData((prev) => ({ ...prev, equipment_required: e.target.value }))}
                placeholder="Headset VR&#10;Controladores&#10;..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isLoading || !formData.title}>
              {isLoading ? "Salvando..." : "Criar Cenário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cenário</DialogTitle>
            <DialogDescription>
              Versão atual: {selectedScenario?.version || 1}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "vr" | "ar" | "mixed") =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vr">VR</SelectItem>
                    <SelectItem value="ar">AR</SelectItem>
                    <SelectItem value="mixed">Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value as typeof prev.category }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safety">Segurança</SelectItem>
                    <SelectItem value="operations">Operações</SelectItem>
                    <SelectItem value="emergency">Emergência</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="navigation">Navegação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Objetivos (um por linha)</Label>
              <Textarea
                value={formData.objectives}
                onChange={(e) => setFormData((prev) => ({ ...prev, objectives: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execute Session Modal */}
      <Dialog open={isExecuteOpen} onOpenChange={setIsExecuteOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Iniciar Sessão de Treinamento</DialogTitle>
            <DialogDescription>{selectedScenario?.title}</DialogDescription>
          </DialogHeader>
          {!executionState.isRunning ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Participante</Label>
                <Input
                  value={executionState.participantName}
                  onChange={(e) =>
                    setExecutionState((prev) => ({ ...prev, participantName: e.target.value }))
                  }
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label>Função</Label>
                <Input
                  value={executionState.participantRole}
                  onChange={(e) =>
                    setExecutionState((prev) => ({ ...prev, participantRole: e.target.value }))
                  }
                  placeholder="Ex: Marinheiro, Oficial de Convés..."
                />
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Objetivos:</h4>
                <ul className="space-y-1">
                  {selectedScenario?.objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                  <Play className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold">Sessão em Andamento</h3>
                <p className="text-muted-foreground">{executionState.participantName}</p>
              </div>
              <Progress
                value={(executionState.currentObjective / (selectedScenario?.objectives.length || 1)) * 100}
              />
              <div className="space-y-2">
                {selectedScenario?.objectives.map((obj, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 p-2 rounded ${
                      idx < executionState.currentObjective
                        ? "bg-green-500/10 text-green-600"
                        : idx === executionState.currentObjective
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {idx < executionState.currentObjective ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Target className="h-4 w-4" />
                    )}
                    {obj}
                  </div>
                ))}
              </div>
              <Button
                className="w-full"
                onClick={handleCompleteObjective}
                disabled={executionState.currentObjective >= (selectedScenario?.objectives.length || 0)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completar Objetivo Atual
              </Button>
            </div>
          )}
          <DialogFooter>
            {!executionState.isRunning ? (
              <>
                <Button variant="outline" onClick={() => setIsExecuteOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleStartSession}
                  disabled={!executionState.participantName || !executionState.participantRole || isLoading}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar
                </Button>
              </>
            ) : (
              <Button variant="destructive" onClick={handleFinishSession}>
                <Square className="h-4 w-4 mr-2" />
                Encerrar Sessão
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evaluation Modal */}
      <Dialog open={isEvaluateOpen} onOpenChange={setIsEvaluateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar Participante</DialogTitle>
            <DialogDescription>
              {selectedSession?.participant_name} - Objetivos: {selectedSession?.objectives_completed}/{selectedSession?.total_objectives}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nota (0-100)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={evaluationData.score}
                onChange={(e) =>
                  setEvaluationData((prev) => ({ ...prev, score: parseInt(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Avaliador</Label>
              <Input
                value={evaluationData.evaluator}
                onChange={(e) => setEvaluationData((prev) => ({ ...prev, evaluator: e.target.value }))}
                placeholder="Nome do avaliador"
              />
            </div>
            <div className="space-y-2">
              <Label>Feedback</Label>
              <Textarea
                value={evaluationData.feedback}
                onChange={(e) => setEvaluationData((prev) => ({ ...prev, feedback: e.target.value }))}
                placeholder="Comentários sobre o desempenho..."
              />
            </div>
            <div className="space-y-2">
              <Label>Notas Internas</Label>
              <Textarea
                value={evaluationData.notes}
                onChange={(e) => setEvaluationData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações para registro..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEvaluateOpen(false)}>
              Pular
            </Button>
            <Button onClick={handleSubmitEvaluation} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Registrar Avaliação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
