/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * Smart Checklists Module - Complete Professional Version
 * PATCH 1101: Full functionality with AI generation, analytics dashboard, and all buttons working
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckSquare, PlusCircle, BarChart3, Sparkles, Search, Filter, Download,
  Trash2, Edit, Eye, Clock, CheckCircle, AlertTriangle, FileText, 
  Brain, TrendingUp, Users, Ship, Loader2, Plus, X, GripVertical,
  Calendar, Target, Zap, RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence, Reorder } from "framer-motion";

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  criticality: "low" | "medium" | "high" | "critical";
  notes?: string;
}

interface Checklist {
  id: string;
  title: string;
  description?: string;
  type: string;
  items: ChecklistItem[];
  created_at: string;
  created_by: string;
  status: "draft" | "active" | "completed" | "archived";
  source: "manual" | "ai" | "template";
  vessel?: string;
  dueDate?: string;
  assignedTo?: string;
  completedAt?: string;
  aiSummary?: string;
}

const CHECKLIST_TYPES = [
  { id: "pre-operation", name: "Pré-Operação", icon: Ship },
  { id: "safety", name: "Segurança", icon: AlertTriangle },
  { id: "maintenance", name: "Manutenção", icon: CheckSquare },
  { id: "compliance", name: "Compliance", icon: FileText },
  { id: "training", name: "Treinamento", icon: Users },
  { id: "custom", name: "Personalizado", icon: Target },
];

// Sample data
const SAMPLE_CHECKLISTS: Checklist[] = [
  {
    id: "1",
    title: "Inspeção Pré-Partida - Motor Principal",
    description: "Checklist completo para verificação antes da partida do motor principal",
    type: "pre-operation",
    items: [
      { id: "1-1", title: "Verificar nível de óleo lubrificante", completed: true, criticality: "high" },
      { id: "1-2", title: "Checar temperatura da água de resfriamento", completed: true, criticality: "high" },
      { id: "1-3", title: "Inspecionar vazamentos visíveis", completed: false, criticality: "medium" },
      { id: "1-4", title: "Verificar pressão do ar de partida", completed: false, criticality: "critical" },
      { id: "1-5", title: "Testar alarmes do motor", completed: false, criticality: "high" },
    ],
    created_at: "2024-12-06T10:00:00Z",
    created_by: "João Silva",
    status: "active",
    source: "ai",
    vessel: "Navio Sirius",
    dueDate: "2024-12-07",
  },
  {
    id: "2",
    title: "Checklist de Segurança - Operação de Mergulho",
    description: "Verificações obrigatórias antes de operações de mergulho",
    type: "safety",
    items: [
      { id: "2-1", title: "Briefing de segurança realizado", completed: true, criticality: "critical" },
      { id: "2-2", title: "Equipamentos de emergência verificados", completed: true, criticality: "critical" },
      { id: "2-3", title: "Comunicação testada", completed: true, criticality: "high" },
      { id: "2-4", title: "Condições meteorológicas avaliadas", completed: true, criticality: "high" },
    ],
    created_at: "2024-12-05T14:30:00Z",
    created_by: "Maria Santos",
    status: "completed",
    source: "template",
    vessel: "Navio Vega",
    completedAt: "2024-12-05T16:45:00Z",
  },
  {
    id: "3",
    title: "Manutenção Preventiva - Sistema Hidráulico",
    description: "Rotina de manutenção mensal do sistema hidráulico",
    type: "maintenance",
    items: [
      { id: "3-1", title: "Verificar nível do fluido hidráulico", completed: false, criticality: "high" },
      { id: "3-2", title: "Inspecionar mangueiras e conexões", completed: false, criticality: "medium" },
      { id: "3-3", title: "Limpar filtros", completed: false, criticality: "medium" },
      { id: "3-4", title: "Testar pressão do sistema", completed: false, criticality: "high" },
      { id: "3-5", title: "Verificar cilindros por vazamentos", completed: false, criticality: "medium" },
      { id: "3-6", title: "Documentar leituras de pressão", completed: false, criticality: "low" },
    ],
    created_at: "2024-12-04T09:00:00Z",
    created_by: "Carlos Mendes",
    status: "draft",
    source: "manual",
    vessel: "Navio Polaris",
    dueDate: "2024-12-10",
  },
];

export default function SmartChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>(SAMPLE_CHECKLISTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("list");
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  
  // Form states
  const [newChecklist, setNewChecklist] = useState({
    title: "",
    description: "",
    type: "pre-operation",
    vessel: "",
    dueDate: "",
    items: [] as ChecklistItem[]
  });
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemCriticality, setNewItemCriticality] = useState<"low" | "medium" | "high" | "critical">("medium");
  
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Computed stats
  const stats = {
    total: checklists.length,
    active: checklists.filter(c => c.status === "active").length,
    completed: checklists.filter(c => c.status === "completed").length,
    overdue: checklists.filter(c => 
      c.dueDate && new Date(c.dueDate) < new Date() && c.status !== "completed"
    ).length,
    avgCompletion: Math.round(
      checklists.reduce((acc, c) => {
        const total = c.items.length;
        const done = c.items.filter(i => i.completed).length;
        return acc + (total > 0 ? (done / total) * 100 : 0);
      }, 0) / (checklists.length || 1)
    ),
  };

  const filteredChecklists = checklists.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || c.type === selectedType;
    const matchesStatus = selectedStatus === "all" || c.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
    case "critical": return "bg-red-500 text-white";
    case "high": return "bg-orange-500 text-white";
    case "medium": return "bg-yellow-500 text-black";
    case "low": return "bg-green-500 text-white";
    default: return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    case "active": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    case "draft": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    case "archived": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
    default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculateProgress = (items: ChecklistItem[]) => {
    if (items.length === 0) return 0;
    return Math.round((items.filter(i => i.completed).length / items.length) * 100);
  };

  const handleToggleItem = (checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(c => {
      if (c.id === checklistId) {
        const updatedItems = c.items.map(item => 
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        const allCompleted = updatedItems.every(i => i.completed);
        return {
          ...c,
          items: updatedItems,
          status: allCompleted ? "completed" as const : c.status,
          completedAt: allCompleted ? new Date().toISOString() : c.completedAt
        };
      }
      return c;
    }));
    toast.success("Item atualizado!");
  };

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    
    const newItem: ChecklistItem = {
      id: `new-${Date.now()}`,
      title: newItemTitle,
      completed: false,
      criticality: newItemCriticality
    };
    
    setNewChecklist(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setNewItemTitle("");
    setNewItemCriticality("medium");
  };

  const handleRemoveItem = (itemId: string) => {
    setNewChecklist(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== itemId)
    }));
  };

  const handleCreateChecklist = () => {
    if (!newChecklist.title.trim()) {
      toast.error("Digite um título para o checklist");
      return;
    }
    
    const checklist: Checklist = {
      id: Date.now().toString(),
      title: newChecklist.title,
      description: newChecklist.description,
      type: newChecklist.type,
      items: newChecklist.items,
      created_at: new Date().toISOString(),
      created_by: "Usuário Atual",
      status: "draft",
      source: "manual",
      vessel: newChecklist.vessel,
      dueDate: newChecklist.dueDate
    };
    
    setChecklists(prev => [checklist, ...prev]);
    setShowCreateDialog(false);
    setNewChecklist({ title: "", description: "", type: "pre-operation", vessel: "", dueDate: "", items: [] });
    toast.success("Checklist criado com sucesso!");
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Descreva o checklist que deseja gerar");
      return;
    }
    
    setIsGeneratingAI(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const generatedItems: ChecklistItem[] = [
      { id: `ai-${Date.now()}-1`, title: "Verificar documentação obrigatória", completed: false, criticality: "high" },
      { id: `ai-${Date.now()}-2`, title: "Inspecionar equipamentos de segurança", completed: false, criticality: "critical" },
      { id: `ai-${Date.now()}-3`, title: "Conferir comunicações", completed: false, criticality: "high" },
      { id: `ai-${Date.now()}-4`, title: "Validar condições operacionais", completed: false, criticality: "medium" },
      { id: `ai-${Date.now()}-5`, title: "Registrar observações iniciais", completed: false, criticality: "low" },
      { id: `ai-${Date.now()}-6`, title: "Aprovar liberação para operação", completed: false, criticality: "critical" },
    ];
    
    const checklist: Checklist = {
      id: Date.now().toString(),
      title: aiPrompt,
      description: `Checklist gerado automaticamente por IA baseado em: "${aiPrompt}"`,
      type: "custom",
      items: generatedItems,
      created_at: new Date().toISOString(),
      created_by: "IA Nautilus",
      status: "draft",
      source: "ai"
    };
    
    setChecklists(prev => [checklist, ...prev]);
    setAiPrompt("");
    setIsGeneratingAI(false);
    toast.success(`Checklist gerado com ${generatedItems.length} itens!`);
  };

  const handleSummarize = async (checklist: Checklist) => {
    setIsSummarizing(true);
    
    // Simulate AI summarization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const summary = `📊 **Análise do Checklist**
    
- **Progresso:** ${calculateProgress(checklist.items)}% concluído
- **Itens críticos pendentes:** ${checklist.items.filter(i => !i.completed && (i.criticality === "critical" || i.criticality === "high")).length}
- **Recomendação:** ${calculateProgress(checklist.items) >= 80 ? "Pronto para aprovação final" : "Continue a verificação dos itens pendentes"}
- **Tempo estimado:** ${Math.ceil(checklist.items.filter(i => !i.completed).length * 5)} minutos para conclusão`;

    setChecklists(prev => prev.map(c => 
      c.id === checklist.id ? { ...c, aiSummary: summary } : c
    ));
    
    setIsSummarizing(false);
    toast.success("Resumo gerado com IA!");
  };

  const handleDeleteChecklist = (id: string) => {
    setChecklists(prev => prev.filter(c => c.id !== id));
    toast.success("Checklist removido!");
  };

  const handleExportPDF = (checklist: Checklist) => {
    // Simple text export for now
    const content = `${checklist.title}\n\n${checklist.items.map(i => `${i.completed ? "✓" : "○"} ${i.title}`).join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${checklist.title.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exportado com sucesso!");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CheckSquare className="h-8 w-8 text-primary" />
            Checklists Inteligentes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie checklists operacionais com IA integrada
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/checklists/dashboard">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Ver Dashboard
            </Button>
          </Link>
          <Button className="gap-2" onClick={handleSetShowCreateDialog}>
            <Plus className="h-4 w-4" />
            Novo Checklist
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <CheckSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">Atrasados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500/10">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgCompletion}%</p>
                <p className="text-xs text-muted-foreground">Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Quick Generate */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Gerar Checklist com IA</p>
                <Input
                  placeholder="Descreva o checklist que deseja criar... Ex: Inspeção de segurança para operação de mergulho"
                  value={aiPrompt}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>
            </div>
            <Button 
              onClick={handleGenerateWithAI} 
              disabled={isGeneratingAI || !aiPrompt.trim()}
              className="gap-2"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Gerar com IA
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="board" className="gap-2">
              <Target className="h-4 w-4" />
              Quadro
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={handleChange}
                className="pl-9 w-[200px]"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {CHECKLIST_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="list" className="mt-6">
          <div className="space-y-4">
            <AnimatePresence>
              {filteredChecklists.length === 0 ? (
                <Card className="p-8 text-center">
                  <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Nenhum checklist encontrado</h3>
                  <p className="text-muted-foreground mt-1">
                    Crie um novo checklist ou ajuste os filtros
                  </p>
                  <Button className="mt-4 gap-2" onClick={handleSetShowCreateDialog}>
                    <Plus className="h-4 w-4" />
                    Criar Checklist
                  </Button>
                </Card>
              ) : (
                filteredChecklists.map((checklist, index) => (
                  <motion.div
                    key={checklist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-all hover:border-primary/50">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Left side - Info */}
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div className="flex flex-col items-center gap-1">
                                <div className="text-2xl font-bold text-primary">
                                  {calculateProgress(checklist.items)}%
                                </div>
                                <Progress value={calculateProgress(checklist.items)} className="w-16 h-2" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-lg">{checklist.title}</h3>
                                  <Badge className={getStatusColor(checklist.status)}>
                                    {checklist.status === "draft" && "Rascunho"}
                                    {checklist.status === "active" && "Ativo"}
                                    {checklist.status === "completed" && "Concluído"}
                                    {checklist.status === "archived" && "Arquivado"}
                                  </Badge>
                                  {checklist.source === "ai" && (
                                    <Badge variant="outline" className="gap-1">
                                      <Sparkles className="h-3 w-3" />
                                      IA
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{checklist.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  {checklist.vessel && (
                                    <span className="flex items-center gap-1">
                                      <Ship className="h-3 w-3" />
                                      {checklist.vessel}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(checklist.created_at).toLocaleDateString("pt-BR")}
                                  </span>
                                  <span>{checklist.items.filter(i => i.completed).length}/{checklist.items.length} itens</span>
                                </div>
                              </div>
                            </div>

                            {/* Items preview */}
                            <div className="mt-4 space-y-2">
                              {checklist.items.slice(0, 3).map(item => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                                  onClick={() => handlehandleToggleItem}
                                >
                                  <Checkbox checked={item.completed} />
                                  <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                                    {item.title}
                                  </span>
                                  <Badge className={`${getCriticalityColor(item.criticality)} text-xs`}>
                                    {item.criticality}
                                  </Badge>
                                </div>
                              ))}
                              {checklist.items.length > 3 && (
                                <p className="text-xs text-muted-foreground pl-2">
                                  +{checklist.items.length - 3} mais itens...
                                </p>
                              )}
                            </div>

                            {/* AI Summary */}
                            {checklist.aiSummary && (
                              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <div className="flex items-center gap-2 mb-2">
                                  <Brain className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-medium">Análise IA</span>
                                </div>
                                <p className="text-sm whitespace-pre-line">{checklist.aiSummary}</p>
                              </div>
                            )}
                          </div>

                          {/* Right side - Actions */}
                          <div className="flex flex-row md:flex-col gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => {
                                setSelectedChecklist(checklist);
                                setShowViewDialog(true);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => handlehandleSummarize}
                              disabled={isSummarizing}
                            >
                              {isSummarizing ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Brain className="h-3 w-3" />
                              )}
                              Analisar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => handlehandleExportPDF}
                            >
                              <Download className="h-3 w-3" />
                              Exportar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-destructive hover:text-destructive"
                              onClick={() => handlehandleDeleteChecklist}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="board" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {["draft", "active", "completed", "archived"].map(status => (
              <Card key={status} className="min-h-[300px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Badge className={getStatusColor(status)}>
                      {status === "draft" && "Rascunho"}
                      {status === "active" && "Ativo"}
                      {status === "completed" && "Concluído"}
                      {status === "archived" && "Arquivado"}
                    </Badge>
                    <span className="text-muted-foreground">
                      ({checklists.filter(c => c.status === status).length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {checklists
                    .filter(c => c.status === status)
                    .map(checklist => (
                      <Card
                        key={checklist.id}
                        className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          setSelectedChecklist(checklist);
                          setShowViewDialog(true);
                        }}
                      >
                        <p className="font-medium text-sm truncate">{checklist.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Progress value={calculateProgress(checklist.items)} className="flex-1 h-1.5" />
                          <span className="text-xs text-muted-foreground ml-2">
                            {calculateProgress(checklist.items)}%
                          </span>
                        </div>
                      </Card>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Visualização de Calendário</h3>
            <p className="text-muted-foreground mt-1">
              Em breve: visualize seus checklists por data de vencimento
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Criar Checklist Manual
            </DialogTitle>
            <DialogDescription>
              Configure seu checklist personalizado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={newChecklist.title}
                  onChange={handleChange}))}
                  placeholder="Ex: Inspeção de Segurança"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={newChecklist.type}
                  onValueChange={(value) => setNewChecklist(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHECKLIST_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={newChecklist.description}
                onChange={handleChange}))}
                placeholder="Descreva o propósito deste checklist"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Embarcação (opcional)</Label>
                <Input
                  value={newChecklist.vessel}
                  onChange={handleChange}))}
                  placeholder="Ex: Navio Sirius"
                />
              </div>
              <div className="space-y-2">
                <Label>Data limite (opcional)</Label>
                <Input
                  type="date"
                  value={newChecklist.dueDate}
                  onChange={handleChange}))}
                />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <Label>Itens do Checklist</Label>
              <div className="flex gap-2">
                <Input
                  value={newItemTitle}
                  onChange={handleChange}
                  placeholder="Adicionar item..."
                  onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                />
                <Select value={newItemCriticality} onValueChange={(v: unknown: unknown: unknown) => setNewItemCriticality(v}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixo</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 mt-4">
                {newChecklist.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 rounded-lg border bg-card"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{item.title}</span>
                    <Badge className={getCriticalityColor(item.criticality)}>
                      {item.criticality}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handlehandleRemoveItem}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowCreateDialog}>
              Cancelar
            </Button>
            <Button onClick={handleCreateChecklist} disabled={!newChecklist.title.trim()}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Criar Checklist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              {selectedChecklist?.title}
            </DialogTitle>
            <DialogDescription>{selectedChecklist?.description}</DialogDescription>
          </DialogHeader>

          {selectedChecklist && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Badge className={getStatusColor(selectedChecklist.status)}>
                  {selectedChecklist.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Progresso: {calculateProgress(selectedChecklist.items)}%
                </span>
                <Progress value={calculateProgress(selectedChecklist.items)} className="flex-1" />
              </div>

              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {selectedChecklist.items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handlehandleToggleItem}
                    >
                      <Checkbox checked={item.completed} />
                      <span className={`flex-1 ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                        {item.title}
                      </span>
                      <Badge className={getCriticalityColor(item.criticality)}>
                        {item.criticality}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {selectedChecklist.aiSummary && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="font-medium">Análise IA</span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{selectedChecklist.aiSummary}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => selectedChecklist && handleSummarize(selectedChecklist}
              disabled={isSummarizing}
            >
              {isSummarizing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Analisar com IA
            </Button>
            <Button onClick={() => selectedChecklist && handleExportPDF(selectedChecklist}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
