/**
 * Smart Evidence Organizer - Organizador Inteligente de Evidências v2
 * Upload de checklists → IA parseia → Busca evidências → Gera respostas
 * + Dashboard visual, Export PDF, Document Library, History
 */

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Upload, FolderOpen, FileCheck, FileX, FileQuestion, Brain,
  ChevronRight, ChevronDown, Search, Loader2,
  CheckCircle2, XCircle, AlertTriangle, Sparkles,
  LayoutGrid, List, FolderTree, Plus, RefreshCw,
  BarChart3, Library, ArrowLeft, MessageSquare, Calendar, Wand2, Users
} from "lucide-react";
import { useEvidenceOrganizer } from "./useEvidenceOrganizer";
import { EvidenceDashboard } from "./EvidenceDashboard";
import { EvidenceExporter } from "./EvidenceExporter";
import { DocumentLibrarySidebar } from "./DocumentLibrarySidebar";
import { PackHistoryComparison } from "./PackHistoryComparison";
import { PackDiffComparison } from "./PackDiffComparison";
import { CriticalGapsAlert } from "./CriticalGapsAlert";
import { AuditInterviewSimulator } from "./AuditInterviewSimulator";
import { EvidenceValidityTimeline } from "./EvidenceValidityTimeline";
import { AutoEvidenceGenerator } from "./AutoEvidenceGenerator";
import { EvidenceCollaboration } from "./EvidenceCollaboration";
import type { EvidenceElement, EvidenceItem, EvidenceMatch, ViewMode } from "./types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  framework: "peodp" | "peotram";
}

// ─── Status Badge ─────────────────────────────────────────
const StatusBadge = memo(({ status }: { status: string }) => {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    found: { label: "Encontrada", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
    partial: { label: "Parcial", variant: "secondary", icon: <AlertTriangle className="h-3 w-3" /> },
    not_found: { label: "Não Encontrada", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
    pending: { label: "Pendente", variant: "outline", icon: <FileQuestion className="h-3 w-3" /> },
    manual: { label: "Manual", variant: "default", icon: <Plus className="h-3 w-3" /> },
  };
  const c = config[status] || config.pending;
  return (
    <Badge variant={c.variant} className="gap-1 text-xs">
      {c.icon} {c.label}
    </Badge>
  );
});
StatusBadge.displayName = "StatusBadge";

// ─── KPI Cards ────────────────────────────────────────────
const KPIBar = memo(({ pack }: { pack: any }) => {
  if (!pack) return null;
  const stats = [
    { label: "Elementos", value: pack.total_elements, icon: FolderOpen, color: "text-primary" },
    { label: "Itens", value: pack.total_items, icon: FileCheck, color: "text-foreground" },
    { label: "Encontradas", value: pack.matched_items, icon: CheckCircle2, color: "text-green-500" },
    { label: "Parciais", value: pack.partial_items, icon: AlertTriangle, color: "text-yellow-500" },
    { label: "Não Encontradas", value: pack.unmatched_items, icon: XCircle, color: "text-destructive" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="border-border/50">
          <CardContent className="pt-3 pb-2 px-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <s.icon className={`h-3.5 w-3.5 ${s.color}`} /> {s.label}
            </div>
            <div className="text-xl font-bold">{s.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
KPIBar.displayName = "KPIBar";

// ─── Upload Panel ─────────────────────────────────────────
function UploadPanel({ onUpload, isLoading, processingStep }: {
  onUpload: (text: string, fileName: string, fileType: string) => void;
  isLoading: boolean;
  processingStep: string | null;
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "xlsx", "csv", "txt", "docx"].includes(ext || "")) return;
    const text = await file.text();
    onUpload(text, file.name, ext || "txt");
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="text-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div>
              <p className="text-lg font-semibold">{processingStep || "Processando..."}</p>
              <p className="text-sm text-muted-foreground mt-1">A IA está analisando e vinculando evidências automaticamente</p>
            </div>
            <Progress value={processingStep?.includes("respostas") ? 80 : processingStep?.includes("evidências") ? 50 : 20} className="max-w-md mx-auto" />
          </div>
        ) : (
          <div
            className={`text-center py-8 cursor-pointer transition-colors rounded-lg ${dragOver ? "bg-primary/10" : "hover:bg-primary/5"}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".pdf,.xlsx,.csv,.txt,.docx";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFile(file);
              };
              input.click();
            }}
          >
            <Upload className="h-12 w-12 text-primary/60 mx-auto mb-3" />
            <p className="text-lg font-semibold">Upload do Checklist / Lista de Verificação</p>
            <p className="text-sm text-muted-foreground mt-1">
              Arraste ou clique para enviar (PDF, Excel, CSV, TXT)
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              <Badge variant="outline"><Brain className="h-3 w-3 mr-1" /> IA Parseia</Badge>
              <Badge variant="outline"><Search className="h-3 w-3 mr-1" /> Busca Evidências</Badge>
              <Badge variant="outline"><Sparkles className="h-3 w-3 mr-1" /> Gera Respostas</Badge>
              <Badge variant="outline" className="border-primary/40 text-primary"><CheckCircle2 className="h-3 w-3 mr-1" /> 100% Automático</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Evidence Item Row ────────────────────────────────────
const EvidenceItemRow = memo(({ item, itemMatches, onAddManual, onLinkFromLibrary }: {
  item: EvidenceItem;
  itemMatches: EvidenceMatch[];
  onAddManual: (itemId: string) => void;
  onLinkFromLibrary: (itemId: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg bg-card">
      <div
        className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="h-4 w-4 mt-1 shrink-0" /> : <ChevronRight className="h-4 w-4 mt-1 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">{item.item_number}</span>
            {item.is_critical && <Badge variant="destructive" className="text-[10px] h-4">CRÍTICO</Badge>}
            <StatusBadge status={item.evidence_status} />
          </div>
          <p className="text-sm mt-1 line-clamp-2">{item.item_text}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {itemMatches.length > 0 && (
            <Badge variant="outline" className="text-xs">{itemMatches.length} doc(s)</Badge>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 space-y-3 border-t">
              {item.ai_response && (
                <div className="bg-primary/5 border border-primary/20 rounded-md p-3 mt-3">
                  <div className="flex items-center gap-1 text-xs font-medium text-primary mb-1">
                    <Sparkles className="h-3 w-3" /> Resposta IA
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{item.ai_response}</p>
                </div>
              )}

              {item.ai_suggestion && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-md p-3">
                  <div className="flex items-center gap-1 text-xs font-medium text-yellow-600 mb-1">
                    <AlertTriangle className="h-3 w-3" /> Sugestão de Evidência
                  </div>
                  <p className="text-sm">{item.ai_suggestion}</p>
                </div>
              )}

              {itemMatches.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Evidências Vinculadas:</p>
                  {itemMatches.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 bg-muted/30 rounded p-2 text-sm">
                      <FileCheck className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="flex-1 truncate">{m.document_title}</span>
                      {m.match_confidence && (
                        <Badge variant="outline" className="text-[10px]">{m.match_confidence}%</Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">{m.match_source}</Badge>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onLinkFromLibrary(item.id); }} className="gap-1">
                  <Library className="h-3 w-3" /> Vincular da Biblioteca
                </Button>
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onAddManual(item.id); }} className="gap-1">
                  <Plus className="h-3 w-3" /> Manual
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
EvidenceItemRow.displayName = "EvidenceItemRow";

// ─── Element Folder ───────────────────────────────────────
function ElementFolder({ element, elementItems, matches, onAddManual, onLinkFromLibrary }: {
  element: EvidenceElement;
  elementItems: EvidenceItem[];
  matches: EvidenceMatch[];
  onAddManual: (itemId: string) => void;
  onLinkFromLibrary: (itemId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const scoreColor = element.compliance_score >= 80 ? "text-green-500" : element.compliance_score >= 50 ? "text-yellow-500" : "text-destructive";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <Card className={`border-l-4 ${element.compliance_score >= 80 ? "border-l-green-500" : element.compliance_score >= 50 ? "border-l-yellow-500" : "border-l-destructive"} hover:bg-muted/30 transition-colors`}>
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                <FolderOpen className={`h-5 w-5 ${isOpen ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{element.element_code || `E${element.element_number}`}</span>
                    <span className="font-medium text-sm">{element.element_name}</span>
                  </div>
                  {element.element_description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{element.element_description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <Badge variant="default" className="text-[10px]">{element.matched_count}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{element.partial_count}</Badge>
                  <Badge variant="destructive" className="text-[10px]">{element.unmatched_count}</Badge>
                </div>
                <span className={`font-bold text-sm ${scoreColor}`}>{element.compliance_score.toFixed(0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-6 mt-2 space-y-2 pb-3">
          {elementItems
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((item) => (
              <EvidenceItemRow
                key={item.id}
                item={item}
                itemMatches={matches.filter((m) => m.item_id === item.id)}
                onAddManual={onAddManual}
                onLinkFromLibrary={onLinkFromLibrary}
              />
            ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Kanban View ──────────────────────────────────────────
function KanbanView({ items, matches, onAddManual, onLinkFromLibrary }: {
  items: EvidenceItem[];
  matches: EvidenceMatch[];
  onAddManual: (itemId: string) => void;
  onLinkFromLibrary: (itemId: string) => void;
}) {
  const columns = useMemo(() => ({
    found: items.filter((i) => i.evidence_status === "found"),
    partial: items.filter((i) => i.evidence_status === "partial"),
    not_found: items.filter((i) => i.evidence_status === "not_found" || i.evidence_status === "pending"),
  }), [items]);

  const columnConfig = [
    { key: "found", label: "✅ Evidência Encontrada", items: columns.found, color: "border-t-green-500" },
    { key: "partial", label: "⚠️ Evidência Parcial", items: columns.partial, color: "border-t-yellow-500" },
    { key: "not_found", label: "❌ Não Encontrada", items: columns.not_found, color: "border-t-destructive" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {columnConfig.map((col) => (
        <Card key={col.key} className={`border-t-4 ${col.color}`}>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{col.label}</CardTitle>
              <Badge variant="outline">{col.items.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 pr-2">
                {col.items.map((item) => (
                  <EvidenceItemRow
                    key={item.id}
                    item={item}
                    itemMatches={matches.filter((m) => m.item_id === item.id)}
                    onAddManual={onAddManual}
                    onLinkFromLibrary={onLinkFromLibrary}
                  />
                ))}
                {col.items.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">Nenhum item</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Manual Evidence Dialog ───────────────────────────────
function ManualEvidenceDialog({ itemId, onSubmit, open, onOpenChange }: {
  itemId: string | null;
  onSubmit: (itemId: string, title: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Evidência Manual</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome do Documento/Evidência</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Procedimento de Segurança SMS-PRO-001"
            />
          </div>
          <Button
            onClick={() => {
              if (itemId && title.trim()) {
                onSubmit(itemId, title.trim());
                setTitle("");
                onOpenChange(false);
              }
            }}
            className="w-full"
          >
            Vincular Evidência
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────
export function SmartEvidenceOrganizer({ framework }: Props) {
  const {
    packs, activePack, elements, items, matches,
    isLoading, isRematching, processingStep,
    loadPacks, loadPackDetails, loadPackElements, setActivePack, uploadAndProcess, addManualEvidence, rematchGaps,
  } = useEvidenceOrganizer(framework);

  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [activeTab, setActiveTab] = useState("evidence");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [manualItemId, setManualItemId] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [linkingItemId, setLinkingItemId] = useState<string | null>(null);

  useEffect(() => { loadPacks(); }, [loadPacks]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (statusFilter !== "all") {
      result = result.filter(i => {
        if (statusFilter === "gaps") return i.evidence_status === "not_found" || i.evidence_status === "pending";
        return i.evidence_status === statusFilter;
      });
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (i) => i.item_text.toLowerCase().includes(lower) || i.item_number.includes(lower)
      );
    }
    return result;
  }, [items, searchTerm, statusFilter]);

  const handleAddManual = useCallback((itemId: string) => {
    setManualItemId(itemId);
    setManualDialogOpen(true);
  }, []);

  const handleManualSubmit = useCallback((itemId: string, title: string) => {
    addManualEvidence(itemId, title);
  }, [addManualEvidence]);

  const handleLinkFromLibrary = useCallback((itemId: string) => {
    setLinkingItemId(itemId);
    setShowLibrary(true);
  }, []);

  const handleLibraryLink = useCallback((itemId: string, docTitle: string, docPath?: string) => {
    addManualEvidence(itemId, docTitle, docPath);
    setLinkingItemId(null);
  }, [addManualEvidence]);

  const handleBack = useCallback(() => {
    setActivePack(null);
    setActiveTab("evidence");
    loadPacks();
  }, [setActivePack, loadPacks]);

  const frameworkLabel = framework === "peodp" ? "PEO-DP" : "PEOTRAM";

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Smart Evidence Organizer — {frameworkLabel}
          </h2>
          <p className="text-sm text-muted-foreground">
            Upload → IA parseia → Busca evidências → Gera respostas • 100% automático
          </p>
        </div>
        {activePack && (
          <div className="flex items-center gap-2">
            <EvidenceExporter pack={activePack} elements={elements} items={items} matches={matches} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLibrary(!showLibrary)}
              className="gap-1"
            >
              <Library className="h-3 w-3" />
              {showLibrary ? "Fechar" : "Biblioteca"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => loadPackDetails(activePack.id)} className="gap-1">
              <RefreshCw className="h-3 w-3" /> Atualizar
            </Button>
          </div>
        )}
      </motion.div>

      {/* Upload or Pack Content */}
      {!activePack ? (
        <motion.div variants={fadeUp} className="space-y-4">
          <UploadPanel
            onUpload={(text, name, type) => uploadAndProcess(text, name, type)}
            isLoading={isLoading}
            processingStep={processingStep}
          />
          <PackHistoryComparison packs={packs} onSelectPack={loadPackDetails} />
          {packs.length >= 2 && (
            <PackDiffComparison packs={packs} onLoadPackElements={loadPackElements} />
          )}
        </motion.div>
      ) : (
        <div className="flex gap-4">
          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Score + Back */}
            <motion.div variants={fadeUp} className="space-y-3">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Voltar
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Score:</span>
                  <span className={`text-2xl font-bold ${activePack.overall_score >= 80 ? "text-green-500" : activePack.overall_score >= 50 ? "text-yellow-500" : "text-destructive"}`}>
                    {activePack.overall_score.toFixed(0)}%
                  </span>
                </div>
              </div>
              <Progress value={activePack.overall_score} className="h-2" />
              <KPIBar pack={activePack} />

              {/* Critical Gaps Alert */}
              <CriticalGapsAlert
                items={items}
                elements={elements}
                overallScore={activePack.overall_score}
                onRematchGaps={rematchGaps}
                isRematching={isRematching}
              />
            </motion.div>

            {/* Tabs: Evidence / Dashboard */}
            <motion.div variants={fadeUp}>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <TabsList>
                    <TabsTrigger value="evidence" className="gap-1">
                      <FolderTree className="h-3.5 w-3.5" /> Evidências
                    </TabsTrigger>
                    <TabsTrigger value="dashboard" className="gap-1">
                      <BarChart3 className="h-3.5 w-3.5" /> Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="interview" className="gap-1">
                      <MessageSquare className="h-3.5 w-3.5" /> Entrevista IA
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Timeline
                    </TabsTrigger>
                    <TabsTrigger value="autogen" className="gap-1">
                      <Wand2 className="h-3.5 w-3.5" /> Auto-Gerar
                    </TabsTrigger>
                    <TabsTrigger value="collab" className="gap-1">
                      <Users className="h-3.5 w-3.5" /> Colaboração
                    </TabsTrigger>
                  </TabsList>

                  {activeTab === "evidence" && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Status Filter */}
                      <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
                        {[
                          { key: "all", label: "Todos", count: items.length },
                          { key: "found", label: "✅", count: items.filter(i => i.evidence_status === "found").length },
                          { key: "partial", label: "⚠️", count: items.filter(i => i.evidence_status === "partial").length },
                          { key: "gaps", label: "❌", count: items.filter(i => i.evidence_status === "not_found" || i.evidence_status === "pending").length },
                        ].map(f => (
                          <Button
                            key={f.key}
                            variant={statusFilter === f.key ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setStatusFilter(f.key)}
                            className="gap-1 h-7 text-xs"
                          >
                            {f.label} <span className="text-[10px] opacity-70">{f.count}</span>
                          </Button>
                        ))}
                      </div>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar item..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 w-48"
                        />
                      </div>
                      <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
                        <Button variant={viewMode === "tree" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("tree")} className="gap-1 h-7">
                          <FolderTree className="h-3.5 w-3.5" /> Árvore
                        </Button>
                        <Button variant={viewMode === "accordion" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("accordion")} className="gap-1 h-7">
                          <List className="h-3.5 w-3.5" /> Accordion
                        </Button>
                        <Button variant={viewMode === "kanban" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("kanban")} className="gap-1 h-7">
                          <LayoutGrid className="h-3.5 w-3.5" /> Kanban
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <TabsContent value="evidence" className="mt-4">
                  {viewMode === "kanban" ? (
                    <KanbanView items={filteredItems} matches={matches} onAddManual={handleAddManual} onLinkFromLibrary={handleLinkFromLibrary} />
                  ) : (
                    <ScrollArea className="h-[calc(100vh-480px)]">
                      <div className="space-y-3 pr-2">
                        {elements
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map((element) => (
                            <ElementFolder
                              key={element.id}
                              element={element}
                              elementItems={filteredItems.filter((i) => i.element_id === element.id)}
                              matches={matches}
                              onAddManual={handleAddManual}
                              onLinkFromLibrary={handleLinkFromLibrary}
                            />
                          ))}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>

                <TabsContent value="dashboard" className="mt-4">
                  <EvidenceDashboard pack={activePack} elements={elements} items={items} />
                </TabsContent>

                <TabsContent value="interview" className="mt-4">
                  <AuditInterviewSimulator framework={framework} pack={activePack} elements={elements} />
                </TabsContent>

                <TabsContent value="timeline" className="mt-4">
                  <EvidenceValidityTimeline items={items} matches={matches} elements={elements} />
                </TabsContent>

                <TabsContent value="autogen" className="mt-4">
                  <AutoEvidenceGenerator
                    framework={framework}
                    pack={activePack}
                    items={items}
                    elements={elements}
                    onRefresh={() => loadPackDetails(activePack.id)}
                  />
                </TabsContent>

                <TabsContent value="collab" className="mt-4">
                  <EvidenceCollaboration pack={activePack} items={items} elements={elements} />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Document Library Sidebar */}
          {showLibrary && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0"
            >
              <DocumentLibrarySidebar
                onLinkDocument={handleLibraryLink}
                activeItemId={linkingItemId}
                onSelectItem={setLinkingItemId}
              />
            </motion.div>
          )}
        </div>
      )}

      <ManualEvidenceDialog
        itemId={manualItemId}
        onSubmit={handleManualSubmit}
        open={manualDialogOpen}
        onOpenChange={setManualDialogOpen}
      />
    </motion.div>
  );
}
