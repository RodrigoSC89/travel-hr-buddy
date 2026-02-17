/**
 * WorldClassChecklistSystem - Real Supabase Integration
 * Connected to 'checklists' + 'operational_checklists' tables
 * Features: CRUD, Kanban, Templates, AI generation, PDF export
 */

import React, { useState, useMemo, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  ClipboardCheck, PlusCircle, Search, LayoutGrid, List, Kanban,
  Calendar, BarChart3, Sparkles, ArrowRight, Clock, CheckCircle2,
  AlertTriangle, XCircle, Ship, MapPin, Camera, Pen, Download,
  Upload, Filter, TrendingUp, TrendingDown, Minus, FileText,
  Eye, Play, Pause, RotateCcw, Trophy, Target, Zap,
  Shield, Wifi, WifiOff, QrCode, Settings, ChevronRight,
  Star, Copy, Trash2, Edit, MoreHorizontal,
  CalendarDays, Bell, Users, Activity, Brain, Gauge,
  CheckSquare, Square, AlertCircle, Timer, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useChecklists, useCreateChecklist, useUpdateChecklist, useDeleteChecklist } from "@/hooks/useChecklistsData";
import type { Checklist, ChecklistItem } from "@/hooks/useChecklistsData";
import { supabase } from "@/integrations/supabase/client";
import { createPDF } from "@/lib/pdf/lazy-pdf";

// ==================== HELPERS ====================

const templateLibrary = [
  { id: "t1", name: "Inspeção DP IMO MSC.1/Circ.1580", category: "DP", items: 45, frequency: "Mensal", rating: 4.9, uses: 1234, tags: ["IMO", "DP-2", "DP-3"] },
  { id: "t2", name: "Rotina de Máquinas ISM Code", category: "Engenharia", items: 32, frequency: "Semanal", rating: 4.8, uses: 2156, tags: ["ISM", "SOLAS"] },
  { id: "t3", name: "MARPOL Annex I-VI Compliance", category: "Ambiental", items: 58, frequency: "Mensal", rating: 4.7, uses: 987, tags: ["MARPOL", "Ambiental"] },
  { id: "t4", name: "ISPS Code Security Assessment", category: "Segurança", items: 28, frequency: "Trimestral", rating: 4.9, uses: 756, tags: ["ISPS", "Security"] },
  { id: "t5", name: "Pre-Arrival PSC Readiness", category: "Operacional", items: 67, frequency: "Por viagem", rating: 5.0, uses: 3421, tags: ["PSC", "Port State"] },
  { id: "t6", name: "MLC 2006 Working Conditions", category: "Tripulação", items: 42, frequency: "Mensal", rating: 4.5, uses: 1567, tags: ["MLC", "ILO"] },
];

const getPriorityConfig = (p: string) => {
  const map: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    critical: { color: "bg-destructive/10 text-destructive border-destructive/30", icon: <AlertCircle className="h-3 w-3" />, label: "Crítica" },
    high: { color: "bg-warning/10 text-warning border-warning/30", icon: <AlertTriangle className="h-3 w-3" />, label: "Alta" },
    medium: { color: "bg-warning/10 text-warning border-warning/30", icon: <Minus className="h-3 w-3" />, label: "Média" },
    low: { color: "bg-success/10 text-success border-success/30", icon: <CheckCircle2 className="h-3 w-3" />, label: "Baixa" },
  };
  return map[p] || map.medium;
};

const getStatusLabel = (s: string) => {
  const map: Record<string, string> = { draft: "Rascunho", active: "Em Andamento", completed: "Concluído", archived: "Arquivado" };
  return map[s] || s;
};

// ==================== COMPONENT ====================

export const WorldClassChecklistSystem: React.FC = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "kanban">("kanban");
  const [activeTab, setActiveTab] = useState("checklists");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAIGenerateOpen, setIsAIGenerateOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("inspection");
  const [newItems, setNewItems] = useState<string>("");

  // Real data from Supabase
  const { data: checklists = [], isLoading, error } = useChecklists();
  const createMutation = useCreateChecklist();
  const updateMutation = useUpdateChecklist();
  const deleteMutation = useDeleteChecklist();

  const filteredChecklists = useMemo(() => {
    return checklists.filter(cl => {
      const matchSearch = cl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (cl.vessel || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || cl.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [checklists, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: checklists.length,
    active: checklists.filter(c => c.status === "active").length,
    completed: checklists.filter(c => c.status === "completed").length,
    draft: checklists.filter(c => c.status === "draft").length,
    avgCompletion: checklists.length > 0
      ? Math.round(checklists.reduce((a, c) => {
          const total = c.items.length;
          const done = c.items.filter(i => i.completed).length;
          return a + (total > 0 ? (done / total) * 100 : 0);
        }, 0) / checklists.length)
      : 0,
    totalItems: checklists.reduce((a, c) => a + c.items.length, 0),
    completedItems: checklists.reduce((a, c) => a + c.items.filter(i => i.completed).length, 0),
    criticalPending: checklists.reduce((a, c) => a + c.items.filter(i => !i.completed && i.criticality === 'critical').length, 0),
  }), [checklists]);

  const kanbanColumns = useMemo(() => [
    { id: "draft", title: "📝 Rascunho", color: "border-l-muted-foreground", items: filteredChecklists.filter(c => c.status === "draft") },
    { id: "active", title: "🔄 Em Andamento", color: "border-l-primary", items: filteredChecklists.filter(c => c.status === "active") },
    { id: "completed", title: "✅ Concluído", color: "border-l-green-500", items: filteredChecklists.filter(c => c.status === "completed") },
    { id: "archived", title: "📦 Arquivado", color: "border-l-muted-foreground/50", items: filteredChecklists.filter(c => c.status === "archived") },
  ], [filteredChecklists]);

  const handleCreate = useCallback(() => {
    if (!newTitle.trim()) return;
    const items: ChecklistItem[] = newItems.split('\n').filter(l => l.trim()).map((line, idx) => ({
      id: `item-${idx}`,
      title: line.trim(),
      completed: false,
      criticality: 'medium' as const,
    }));
    createMutation.mutate({
      title: newTitle,
      type: newType,
      items,
      created_by: 'Sistema',
      status: 'draft',
      source: 'manual',
    });
    setIsCreateOpen(false);
    setNewTitle("");
    setNewItems("");
  }, [newTitle, newType, newItems, createMutation]);

  const handleStatusChange = useCallback((id: string, newStatus: string) => {
    updateMutation.mutate({ id, updates: { status: newStatus as Checklist['status'] } });
  }, [updateMutation]);

  const handleToggleItem = useCallback((checklist: Checklist, itemId: string) => {
    const updatedItems = checklist.items.map(i =>
      i.id === itemId ? { ...i, completed: !i.completed } : i
    );
    updateMutation.mutate({ id: checklist.id, updates: { items: updatedItems } });
  }, [updateMutation]);

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id);
    setIsDetailOpen(false);
  }, [deleteMutation]);

  const [isAILoading, setIsAILoading] = useState(false);

  const handleAIGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setIsAILoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-checklist', {
        body: { prompt: aiPrompt },
      });

      if (error) throw error;
      if (!data?.success || !data?.items?.length) throw new Error(data?.error || 'Nenhum item gerado');

      const generatedItems: ChecklistItem[] = data.items.map((item: { id: string; title: string; criticality: string }, idx: number) => ({
        id: item.id || `ai-${idx}`,
        title: item.title,
        completed: false,
        criticality: (item.criticality || 'medium') as ChecklistItem['criticality'],
      }));

      createMutation.mutate({
        title: data.title || `Checklist IA: ${aiPrompt}`,
        type: 'inspection',
        items: generatedItems,
        created_by: 'Nauti Brain IA',
        status: 'draft',
        source: 'ai',
      });
      toast({ title: "🧠 Checklist gerado com IA", description: `${generatedItems.length} itens criados pela Gemini 3 Flash` });
      setIsAIGenerateOpen(false);
      setAiPrompt("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: "Erro na geração IA", description: msg, variant: "destructive" });
    } finally {
      setIsAILoading(false);
    }
  }, [aiPrompt, createMutation, toast]);

  const handleExportPDF = useCallback(async (checklist: Checklist) => {
    try {
      const doc = await createPDF('portrait');

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Nautilus One - Checklist Report', 20, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, 20, 28);

      // Checklist info
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(checklist.title, 20, 40);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const completionRate = checklist.items.length > 0
        ? Math.round((checklist.items.filter(i => i.completed).length / checklist.items.length) * 100)
        : 0;
      doc.text(`Tipo: ${checklist.type} | Status: ${getStatusLabel(checklist.status)} | Conclusão: ${completionRate}%`, 20, 48);
      doc.text(`Criado por: ${checklist.created_by} | Itens: ${checklist.items.length}`, 20, 54);

      // Items table
      const tableData = checklist.items.map((item, idx) => [
        String(idx + 1),
        item.title,
        getPriorityConfig(item.criticality).label,
        item.completed ? '✅ Sim' : '❌ Não',
        item.notes || '-',
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- jsPDF-autotable plugin
      (doc as unknown as { autoTable: (opts: Record<string, unknown>) => void }).autoTable({
        startY: 62,
        head: [['#', 'Item', 'Criticidade', 'Concluído', 'Observações']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 82, 136], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 80 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 40 },
        },
        margin: { left: 20, right: 20 },
      });

      // Footer
      const pageCount = doc.getNumberOfPages?.() || 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`Nautilus One © ${new Date().getFullYear()} - Página ${i}/${pageCount}`, 20, 285);
      }

      doc.save(`checklist-${checklist.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: "📄 PDF exportado", description: `${checklist.title} salvo com sucesso` });
    } catch (err) {
      toast({ title: "Erro ao gerar PDF", description: String(err), variant: "destructive" });
    }
  }, [toast]);

  const getCompletionRate = (cl: Checklist) => {
    if (cl.items.length === 0) return 0;
    return Math.round((cl.items.filter(i => i.completed).length / cl.items.length) * 100);
  };

  // ==================== RENDER ====================

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-destructive font-medium">Erro ao carregar checklists</p>
        <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <ClipboardCheck className="h-8 w-8 text-primary" />
              Checklists Inteligentes
            </h1>
            <p className="text-muted-foreground mt-1">
              {checklists.length} checklists • {stats.totalItems} itens totais • Dados em tempo real do Supabase
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setIsAIGenerateOpen(true)}>
              <Brain className="h-4 w-4 mr-1" /> Gerar com IA
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-1" /> Novo Checklist
            </Button>
          </div>
        </div>

        {/* ===== KPI DASHBOARD ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: "Total", value: stats.total, icon: <ClipboardCheck className="h-4 w-4" />, color: "text-primary" },
            { label: "Em Andamento", value: stats.active, icon: <Play className="h-4 w-4" />, color: "text-blue-500" },
            { label: "Rascunho", value: stats.draft, icon: <Edit className="h-4 w-4" />, color: "text-muted-foreground" },
            { label: "Concluídos", value: stats.completed, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-500" },
            { label: "Conclusão Média", value: `${stats.avgCompletion}%`, icon: <Gauge className="h-4 w-4" />, color: stats.avgCompletion >= 75 ? "text-green-500" : "text-amber-500" },
            { label: "Itens Totais", value: stats.totalItems, icon: <CheckSquare className="h-4 w-4" />, color: "text-primary" },
            { label: "Itens Feitos", value: stats.completedItems, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-500" },
            { label: "Críticos Pend.", value: stats.criticalPending, icon: <AlertTriangle className="h-4 w-4" />, color: "text-destructive" },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={kpi.color}>{kpi.icon}</span>
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : kpi.value}</p>
            </Card>
          ))}
        </div>

        {/* ===== MAIN TABS ===== */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <TabsList>
              <TabsTrigger value="checklists">📋 Checklists</TabsTrigger>
              <TabsTrigger value="templates">📦 Templates</TabsTrigger>
              <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
            </TabsList>

            {activeTab === "checklists" && (
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                {([
                  { mode: "kanban" as const, icon: <Kanban className="h-4 w-4" />, tip: "Kanban" },
                  { mode: "grid" as const, icon: <LayoutGrid className="h-4 w-4" />, tip: "Grid" },
                  { mode: "list" as const, icon: <List className="h-4 w-4" />, tip: "Lista" },
                ] as const).map(v => (
                  <Tooltip key={v.mode}>
                    <TooltipTrigger asChild>
                      <Button variant={viewMode === v.mode ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode(v.mode)} aria-label={v.tip}>
                        {v.icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{v.tip}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>

          {/* ===== CHECKLISTS TAB ===== */}
          <TabsContent value="checklists" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por título, embarcação..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="active">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Carregando checklists...</span>
              </div>
            )}

            {!isLoading && filteredChecklists.length === 0 && (
              <Card className="p-8 text-center">
                <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Nenhum checklist encontrado</h3>
                <p className="text-sm text-muted-foreground mt-1">Crie seu primeiro checklist ou gere um com IA</p>
                <div className="flex gap-2 justify-center mt-4">
                  <Button variant="outline" onClick={() => setIsAIGenerateOpen(true)}>
                    <Brain className="h-4 w-4 mr-1" /> Gerar com IA
                  </Button>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-1" /> Criar Manualmente
                  </Button>
                </div>
              </Card>
            )}

            {/* KANBAN VIEW */}
            {!isLoading && viewMode === "kanban" && filteredChecklists.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {kanbanColumns.map(col => (
                  <div key={col.id} className="min-w-[280px] flex-1 space-y-3">
                    <div className={`flex items-center justify-between p-2 rounded-t-lg border-l-4 ${col.color} bg-muted/50`}>
                      <h3 className="text-sm font-semibold">{col.title}</h3>
                      <Badge variant="secondary" className="text-xs">{col.items.length}</Badge>
                    </div>
                    <div className="space-y-2 min-h-[100px]">
                      <AnimatePresence>
                        {col.items.map(cl => (
                          <motion.div key={cl.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <Card className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5" onClick={() => { setSelectedChecklist(cl); setIsDetailOpen(true); }}>
                              <CardContent className="p-3 space-y-2">
                                <h4 className="text-sm font-medium leading-tight">{cl.title}</h4>
                                {cl.vessel && (
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Ship className="h-3 w-3" /><span>{cl.vessel}</span>
                                  </div>
                                )}
                                <Badge variant="outline" className="text-[10px]">
                                  {cl.source === 'ai' ? '🧠 IA' : cl.source === 'template' ? '📦 Template' : '✏️ Manual'}
                                </Badge>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Progresso</span>
                                    <span className="font-medium">{getCompletionRate(cl)}%</span>
                                  </div>
                                  <Progress value={getCompletionRate(cl)} className="h-1.5" />
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {cl.items.filter(i => i.completed).length}/{cl.items.length} itens
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* GRID VIEW */}
            {!isLoading && viewMode === "grid" && filteredChecklists.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChecklists.map(cl => (
                  <Card key={cl.id} className="cursor-pointer hover:shadow-lg transition-all" onClick={() => { setSelectedChecklist(cl); setIsDetailOpen(true); }}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{cl.title}</CardTitle>
                      <CardDescription>{cl.vessel || cl.type} • {cl.created_by}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Badge variant="outline">{getStatusLabel(cl.status)}</Badge>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progresso</span>
                          <span className="font-medium">{getCompletionRate(cl)}%</span>
                        </div>
                        <Progress value={getCompletionRate(cl)} className="h-2" />
                      </div>
                      <p className="text-xs text-muted-foreground">{cl.items.length} itens • {new Date(cl.created_at).toLocaleDateString('pt-BR')}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* LIST VIEW */}
            {!isLoading && viewMode === "list" && filteredChecklists.length > 0 && (
              <div className="space-y-2">
                {filteredChecklists.map(cl => (
                  <Card key={cl.id} className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => { setSelectedChecklist(cl); setIsDetailOpen(true); }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{cl.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>{cl.type}</span>
                            <span>•</span>
                            <span>{cl.created_by}</span>
                            {cl.vessel && <><span>•</span><span className="flex items-center gap-1"><Ship className="h-3 w-3" /> {cl.vessel}</span></>}
                          </div>
                        </div>
                        <Badge variant="outline">{getStatusLabel(cl.status)}</Badge>
                        <div className="w-24">
                          <Progress value={getCompletionRate(cl)} className="h-2" />
                          <span className="text-xs text-muted-foreground">{getCompletionRate(cl)}%</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{cl.items.length} itens</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ===== TEMPLATES TAB ===== */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Biblioteca de Templates</h2>
                <p className="text-sm text-muted-foreground">{templateLibrary.length} templates marítimos certificados</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templateLibrary.map(t => (
                <Card key={t.id} className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm leading-tight">{t.name}</CardTitle>
                    <CardDescription>{t.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Itens</span><p className="font-semibold">{t.items}</p></div>
                      <div><span className="text-muted-foreground">Frequência</span><p className="font-semibold">{t.frequency}</p></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-medium">{t.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{t.uses.toLocaleString()} usos</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {t.tags.map(tag => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
                    </div>
                    <Button className="w-full opacity-0 group-hover:opacity-100 transition-opacity" size="sm"
                      onClick={() => {
                        createMutation.mutate({
                          title: t.name,
                          type: 'inspection',
                          items: Array.from({ length: Math.min(t.items, 10) }, (_, i) => ({
                            id: `tpl-${i}`,
                            title: `Item ${i + 1} - ${t.name}`,
                            completed: false,
                            criticality: i < 3 ? 'high' as const : 'medium' as const,
                          })),
                          created_by: 'Template',
                          status: 'draft',
                          source: 'template' as const,
                        });
                      }}
                    >
                      <Play className="h-3 w-3 mr-1" /> Usar Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ===== ANALYTICS TAB ===== */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Status dos Checklists</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Rascunho", count: stats.draft, color: "text-muted-foreground" },
                    { label: "Em Andamento", count: stats.active, color: "text-blue-500" },
                    { label: "Concluídos", count: stats.completed, color: "text-green-500" },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{s.label}</span>
                        <span className={`font-bold ${s.color}`}>{s.count}</span>
                      </div>
                      <Progress value={stats.total > 0 ? (s.count / stats.total) * 100 : 0} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Itens por Criticidade</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {['critical', 'high', 'medium', 'low'].map(crit => {
                    const count = checklists.reduce((a, c) => a + c.items.filter(i => i.criticality === crit).length, 0);
                    const done = checklists.reduce((a, c) => a + c.items.filter(i => i.criticality === crit && i.completed).length, 0);
                    return (
                      <div key={crit} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPriorityConfig(crit).icon}
                          <span className="text-sm">{getPriorityConfig(crit).label}</span>
                        </div>
                        <span className="text-sm"><span className="font-bold">{done}</span>/{count}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Origem dos Checklists</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {['manual', 'ai', 'template'].map(src => {
                    const count = checklists.filter(c => c.source === src).length;
                    return (
                      <div key={src} className="flex items-center justify-between">
                        <span className="text-sm">{src === 'ai' ? '🧠 IA' : src === 'template' ? '📦 Template' : '✏️ Manual'}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* ===== DETAIL DIALOG ===== */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedChecklist && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedChecklist.title}</DialogTitle>
                  <DialogDescription className="flex items-center gap-3 mt-1">
                    <span>{selectedChecklist.type}</span>
                    <span>•</span>
                    <span>{selectedChecklist.created_by}</span>
                    {selectedChecklist.vessel && <><span>•</span><span className="flex items-center gap-1"><Ship className="h-3 w-3" /> {selectedChecklist.vessel}</span></>}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 my-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-bold">{getCompletionRate(selectedChecklist)}%</span>
                    </div>
                    <Progress value={getCompletionRate(selectedChecklist)} className="h-3" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getStatusLabel(selectedChecklist.status)}</Badge>
                    <Badge variant="outline">{selectedChecklist.source === 'ai' ? '🧠 IA' : selectedChecklist.source === 'template' ? '📦 Template' : '✏️ Manual'}</Badge>
                  </div>
                </div>

                {/* Status actions */}
                <div className="flex gap-2 mb-4">
                  {selectedChecklist.status === 'draft' && (
                    <Button size="sm" onClick={() => handleStatusChange(selectedChecklist.id, 'active')}>
                      <Play className="h-3 w-3 mr-1" /> Iniciar
                    </Button>
                  )}
                  {selectedChecklist.status === 'active' && (
                    <Button size="sm" onClick={() => handleStatusChange(selectedChecklist.id, 'completed')}>
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Concluir
                    </Button>
                  )}
                   <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedChecklist.id)}>
                     <Trash2 className="h-3 w-3 mr-1" /> Excluir
                   </Button>
                   <Button size="sm" variant="outline" onClick={() => handleExportPDF(selectedChecklist)}>
                     <Download className="h-3 w-3 mr-1" /> Exportar PDF
                   </Button>
                </div>

                <Separator />

                {/* Checklist Items - Interactive */}
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-semibold">Itens ({selectedChecklist.items.length})</h4>
                  {selectedChecklist.items.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">Nenhum item neste checklist</p>
                  )}
                  {selectedChecklist.items.map(item => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        item.completed ? "border-success/30 bg-success/5" : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => handleToggleItem(selectedChecklist, item.id)}
                    >
                      <div className="flex items-start gap-3">
                        {item.completed ?
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> :
                          <Square className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                        }
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`text-[10px] ${getPriorityConfig(item.criticality).color}`}>
                              {getPriorityConfig(item.criticality).label}
                            </Badge>
                            {item.notes && <span className="text-xs text-muted-foreground">{item.notes}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ===== CREATE DIALOG ===== */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Checklist</DialogTitle>
              <DialogDescription>Crie um checklist manual com itens personalizados</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Inspeção de segurança mensal" />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inspection">Inspeção</SelectItem>
                    <SelectItem value="safety">Segurança</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="environmental">Ambiental</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Itens (um por linha)</Label>
                <Textarea value={newItems} onChange={e => setNewItems(e.target.value)} placeholder="Verificar extintores&#10;Testar alarmes&#10;Inspecionar balsas" rows={6} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!newTitle.trim() || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <PlusCircle className="h-4 w-4 mr-1" />}
                Criar Checklist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ===== AI GENERATE DIALOG ===== */}
        <Dialog open={isAIGenerateOpen} onOpenChange={setIsAIGenerateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" /> Gerar Checklist com IA
              </DialogTitle>
              <DialogDescription>Descreva o tipo de inspeção e a IA criará itens automaticamente</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                placeholder="Ex: Checklist pré-chegada em porto brasileiro para PSV com DP-2..."
                rows={4} />
              <div className="flex flex-wrap gap-2">
                {["PSC Readiness", "MARPOL Compliance", "ISM Audit", "DP Survey", "ISPS Security"].map(s => (
                  <Badge key={s} variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setAiPrompt(s)}>
                    <Zap className="h-3 w-3 mr-1" /> {s}
                  </Badge>
                ))}
              </div>
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => setIsAIGenerateOpen(false)}>Cancelar</Button>
               <Button onClick={handleAIGenerate} disabled={!aiPrompt.trim() || isAILoading}>
                 {isAILoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
                 {isAILoading ? 'Gerando...' : 'Gerar Checklist'}
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
