/**
 * VR/AR Training Page - Refactored orchestrator
 */
import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import {
  Gamepad2, Play, Brain, Award, CheckCircle,
  Plus, Pause, StopCircle, RefreshCw, Download,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { initialScenarios, type VRScenario, type TrainingSession } from "./vr-training/types";
import { VRTrainingTabs } from "./vr-training/VRTrainingTabs";

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
  const [formData, setFormData] = useState({ title: "", description: "", duration: "20 min", difficulty: "intermediate" as VRScenario["difficulty"], category: "emergency" });

  const filteredScenarios = scenarios.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || s.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const handleCreate = useCallback(() => {
    const newScenario: VRScenario = { id: `scenario-${Date.now()}`, ...formData, completions: 0, avgScore: 0, status: "draft", createdAt: new Date().toISOString().split("T")[0] };
    setScenarios(prev => [...prev, newScenario]);
    setIsCreateOpen(false);
    setFormData({ title: "", description: "", duration: "20 min", difficulty: "intermediate", category: "emergency" });
    toast.success("Cenário VR criado com sucesso!");
  }, [formData]);

  const handleEdit = useCallback(() => {
    if (!editingScenario) return;
    setScenarios(prev => prev.map(s => s.id === editingScenario.id ? { ...s, ...formData } : s));
    setIsEditOpen(false);
    setEditingScenario(null);
    toast.success("Cenário atualizado com sucesso!");
  }, [editingScenario, formData]);

  const handleDelete = useCallback((id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;
    setScenarios(prev => prev.filter(s => s.id !== id));
    toast.success(`Cenário "${scenario.title}" removido`, { action: { label: "Desfazer", onClick: () => setScenarios(prev => [...prev, scenario]) } });
  }, [scenarios]);

  const handleDuplicate = useCallback((scenario: VRScenario) => {
    setScenarios(prev => [...prev, { ...scenario, id: `${scenario.id}-copy-${Date.now()}`, title: `${scenario.title} (Cópia)`, completions: 0, avgScore: 0, status: "draft", createdAt: new Date().toISOString().split("T")[0] }]);
    toast.success("Cenário duplicado!");
  }, []);

  const handlePublish = useCallback((id: string) => { setScenarios(prev => prev.map(s => s.id === id ? { ...s, status: "published" as const } : s)); toast.success("Cenário publicado!"); }, []);

  const startSession = useCallback((scenario: VRScenario) => {
    setActiveSession({ scenarioId: scenario.id, startTime: new Date(), status: "running", score: 0, elapsedTime: 0 });
    setSelectedScenario(scenario);
    toast.success(`Iniciando sessão VR: ${scenario.title}`);
  }, []);

  const completeSession = useCallback(() => {
    if (activeSession && selectedScenario) {
      const finalScore = Math.floor(70 + (selectedScenario.id.charCodeAt(0) % 25));
      setScenarios(prev => prev.map(s => s.id === selectedScenario.id ? { ...s, completions: s.completions + 1, avgScore: Math.round((s.avgScore * s.completions + finalScore) / (s.completions + 1)) } : s));
      toast.success(`Sessão concluída! Score: ${finalScore}%`);
      setActiveSession(null);
      setSelectedScenario(null);
    }
  }, [activeSession, selectedScenario]);

  const exportResults = useCallback(() => {
    const csv = ["Título,Dificuldade,Duração,Completions,Score Médio,Status,Categoria", ...scenarios.map(s => `${s.title},${s.difficulty},${s.duration},${s.completions},${s.avgScore}%,${s.status},${s.category}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `vr-training-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Resultados exportados!");
  }, [scenarios]);

  const openEdit = (scenario: VRScenario) => {
    setEditingScenario(scenario);
    setFormData({ title: scenario.title, description: scenario.description, duration: scenario.duration, difficulty: scenario.difficulty, category: scenario.category });
    setIsEditOpen(true);
  };

  const myProgress = {
    completed: scenarios.filter(s => s.completions > 0).length, total: scenarios.length,
    avgScore: Math.round(scenarios.reduce((acc, s) => acc + s.avgScore, 0) / scenarios.length) || 0,
    totalTime: "2h 15min", rank: 8, nextBadge: "Expert", progressToBadge: 75,
  };

  const ScenarioFormFields = () => (
    <div className="space-y-4 py-4">
      <div className="space-y-2"><Label>Título</Label><Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="Nome do cenário" /></div>
      <div className="space-y-2"><Label>Descrição</Label><Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Duração</Label><Input value={formData.duration} onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value }))} /></div>
        <div className="space-y-2"><Label>Dificuldade</Label>
          <Select value={formData.difficulty} onValueChange={(v) => setFormData(p => ({ ...p, difficulty: v as VRScenario["difficulty"] }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="beginner">Iniciante</SelectItem><SelectItem value="intermediate">Intermediário</SelectItem><SelectItem value="advanced">Avançado</SelectItem><SelectItem value="expert">Expert</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><Gamepad2 className="h-8 w-8 text-primary" />VR/AR Training Center</h1>
          <p className="text-muted-foreground mt-1">Simulações imersivas para treinamento de emergência - {scenarios.length} cenários disponíveis</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5"><Brain className="h-4 w-4 text-success" />AI Coach Ativo</Badge>
          <Button variant="outline" onClick={exportResults}><Download className="h-4 w-4 mr-2" />Exportar</Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo Cenário</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Novo Cenário VR</DialogTitle></DialogHeader>
              <ScenarioFormFields />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={!formData.title}><Plus className="h-4 w-4 mr-2" />Criar Cenário</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Session Banner */}
      <AnimatePresence>
        {activeSession && selectedScenario && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/20 rounded-full"><Gamepad2 className="h-6 w-6 text-primary" /></div>
                    <div><h3 className="font-bold text-lg">Sessão Ativa: {selectedScenario.title}</h3><p className="text-sm text-muted-foreground">Status: {activeSession.status === "running" ? "Em execução" : "Pausada"}</p></div>
                  </div>
                  <div className="flex gap-2">
                    {activeSession.status === "running" ? (
                      <Button variant="outline" onClick={() => setActiveSession({ ...activeSession, status: "paused" })}><Pause className="h-4 w-4 mr-2" />Pausar</Button>
                    ) : (
                      <Button variant="outline" onClick={() => setActiveSession({ ...activeSession, status: "running" })}><Play className="h-4 w-4 mr-2" />Retomar</Button>
                    )}
                    <Button onClick={completeSession}><StopCircle className="h-4 w-4 mr-2" />Finalizar</Button>
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
                <div><p className="text-sm text-muted-foreground">Cenários</p><p className="text-2xl font-bold">{myProgress.completed}/{myProgress.total}</p></div>
                <div><p className="text-sm text-muted-foreground">Score Médio</p><p className="text-2xl font-bold text-success">{myProgress.avgScore}%</p></div>
                <div><p className="text-sm text-muted-foreground">Tempo Total</p><p className="text-2xl font-bold">{myProgress.totalTime}</p></div>
                <div><p className="text-sm text-muted-foreground">Ranking</p><p className="text-2xl font-bold">#{myProgress.rank}</p></div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1"><span>Progresso para {myProgress.nextBadge}</span><span>{myProgress.progressToBadge}%</span></div>
                <Progress value={myProgress.progressToBadge} className="h-2" />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2"><Award className="h-16 w-16 text-warning" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <VRTrainingTabs
        scenarios={scenarios}
        filteredScenarios={filteredScenarios}
        selectedScenario={selectedScenario}
        activeSession={activeSession}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        onStartSession={startSession}
        onOpenEdit={openEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onPublish={handlePublish}
        onOpenCreate={() => setIsCreateOpen(true)}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Cenário</DialogTitle></DialogHeader>
          <ScenarioFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={isLoading}><CheckCircle className="h-4 w-4 mr-2" />Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VRTrainingPage;
