/**
 * PEOTRAM Element Checklist - Interactive per-item audit with AI
 * Displays all items for a given element with scoring, evidence generation, and NC creation
 */
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChevronDown, ChevronRight, Sparkles, FileText, AlertTriangle,
  CheckCircle, Loader2, Copy, Save, Brain, Camera, Mic, 
  MicOff, ClipboardCheck, Star, Info, Target, Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { logger } from "@/lib/logger";
import type { PeotramElement, PeotramItem, PeotramSubelement, ScoreValue } from "@/data/peotram-elements-data";
import { SCORE_CRITERIA, NC_CLASSIFICATIONS } from "@/data/peotram-elements-data";

interface ItemAuditState {
  score: ScoreValue;
  observations: string;
  evidence: string | null;
  aiEvidence: string | null;
  isGeneratingEvidence: boolean;
  ncClassification: string | null;
  photos: string[];
}

interface PeotramElementChecklistProps {
  element: PeotramElement;
  vesselName?: string;
  auditorName?: string;
  onSaveProgress?: (elementId: number, states: Record<string, ItemAuditState>) => void;
}

const defaultItemState: ItemAuditState = {
  score: "NA",
  observations: "",
  evidence: null,
  aiEvidence: null,
  isGeneratingEvidence: false,
  ncClassification: null,
  photos: [],
};

export function PeotramElementChecklist({ element, vesselName, auditorName, onSaveProgress }: PeotramElementChecklistProps) {
  const [itemStates, setItemStates] = useState<Record<string, ItemAuditState>>({});
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set([element.subelements[0]?.id]));

  const getState = (itemId: string): ItemAuditState => itemStates[itemId] || { ...defaultItemState };

  const updateState = (itemId: string, patch: Partial<ItemAuditState>) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: { ...getState(itemId), ...patch },
    }));
  };

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSub = (id: string) => {
    setExpandedSubs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Calculate element score
  const allItems = element.subelements.flatMap(s => s.items);
  const scoredItems = allItems.filter(item => {
    const s = getState(item.id);
    return s.score !== "NA" && s.score !== undefined;
  });
  const totalScore = scoredItems.reduce((acc, item) => {
    const s = getState(item.id);
    const criteria = SCORE_CRITERIA[String(s.score)];
    return acc + (criteria?.percentage || 0);
  }, 0);
  const avgScore = scoredItems.length > 0 ? Math.round(totalScore / scoredItems.length) : 0;
  const progressPercent = Math.round((scoredItems.length / allItems.length) * 100);

  // Generate AI evidence for a single item
  const generateAIEvidence = useCallback(async (item: PeotramItem) => {
    updateState(item.id, { isGeneratingEvidence: true });
    try {
      const state = getState(item.id);
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            {
              role: "system",
              content: `Você é um auditor sênior PEOTRAM especialista no programa de excelência operacional Petrobras. 
Gere evidências técnicas detalhadas para itens de checklist considerando o SGI (Sistema de Gestão Integrado) da empresa.
Use referências normativas reais (ISM Code, NRs, SOLAS, MARPOL, IMCA, STCW).
Formato: markdown com seções claras. Inclua: Evidências Objetivas, Documentos de Referência, Método de Verificação, Critério de Aceitação, e Observações do Auditor.`,
            },
            {
              role: "user",
              content: `Gere evidências de auditoria PEOTRAM para:

**Elemento ${element.id}: ${element.name} (${element.sigla})**
**Item ${item.id}: ${item.description}**
**Evidências Requeridas:** ${item.evidences}
**Normas Aplicáveis:** ${item.norms.join(", ")}
**Peso do Item:** ${item.weight}
**Item Crítico:** ${item.isCritical ? "SIM" : "NÃO"}
**Nota Atribuída:** ${state.score !== "NA" ? `${state.score} - ${SCORE_CRITERIA[String(state.score)]?.description}` : "Ainda não avaliado"}
**Observações do Auditor:** ${state.observations || "Nenhuma"}
**Embarcação:** ${vesselName || "N/A"}
**Auditor:** ${auditorName || "N/A"}
**Data:** ${new Date().toLocaleDateString("pt-BR")}

Gere evidências detalhadas incluindo:
1. Evidências objetivas que devem ser coletadas
2. Documentos SGI a serem verificados
3. Perguntas para entrevistas com tripulação
4. Checklist de verificação em campo
5. Critérios de conformidade (nota 3) vs excelência (nota 4)
6. Não conformidades comuns neste item
7. Ações corretivas recomendadas se aplicável`,
            },
          ],
        },
      });

      if (error) throw error;
      const text = data?.choices?.[0]?.message?.content || data?.response || "Evidência gerada.";
      updateState(item.id, { aiEvidence: text, isGeneratingEvidence: false });
      toast.success(`Evidência IA gerada para item ${item.id}`);
    } catch (err) {
      logger.error("[PeotramChecklist] AI evidence error", err);
      updateState(item.id, { isGeneratingEvidence: false });
      toast.error("Erro ao gerar evidência IA");
    }
  }, [element, vesselName, auditorName, itemStates]);

  const getScoreColor = (score: ScoreValue) => {
    if (score === "NA") return "bg-muted text-muted-foreground";
    if (score === 0) return "bg-destructive text-destructive-foreground";
    if (score === 1) return "bg-destructive/80 text-destructive-foreground";
    if (score === 2) return "bg-warning text-warning-foreground";
    if (score === 3) return "bg-success text-success-foreground";
    if (score === 4) return "bg-primary text-primary-foreground";
    return "bg-muted";
  };

  const handleSave = () => {
    onSaveProgress?.(element.id, itemStates);
    toast.success(`Progresso do Elemento ${element.id} salvo`);
  };

  return (
    <div className="space-y-4">
      {/* Element Header & Progress */}
      <Card className={`${element.isCritical ? "border-destructive/40 bg-destructive/5" : "border-warning/20"}`}>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold text-warning">{element.id}</span>
                <h3 className="text-lg font-semibold">{element.name}</h3>
                {element.isCritical && <Badge variant="destructive" className="text-xs">CRÍTICO</Badge>}
                <Badge variant="outline" className="text-xs">{element.sigla}</Badge>
                <Badge variant="outline" className="text-xs">Peso: {element.weightPercentage}%</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{element.description}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-bold text-warning">{avgScore}%</div>
              <p className="text-xs text-muted-foreground">{scoredItems.length}/{allItems.length} avaliados</p>
            </div>
          </div>
          <Progress value={progressPercent} className="mt-3 h-2 [&>div]:bg-warning" />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">Progresso: {progressPercent}%</p>
            <Button size="sm" variant="outline" onClick={handleSave} className="gap-1">
              <Save className="h-3 w-3" /> Salvar Progresso
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subelements */}
      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="space-y-3 pr-2">
          {element.subelements.map((sub) => (
            <Card key={sub.id} className="overflow-hidden">
              <Collapsible open={expandedSubs.has(sub.id)} onOpenChange={() => toggleSub(sub.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {expandedSubs.has(sub.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span className="font-mono text-xs text-muted-foreground">{sub.id}</span>
                        <CardTitle className="text-sm">{sub.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">{sub.items.length} itens</Badge>
                      </div>
                      <div className="flex gap-1">
                        {sub.items.map(item => {
                          const s = getState(item.id);
                          return (
                            <div key={item.id} className={`w-3 h-3 rounded-full ${getScoreColor(s.score)}`} title={`${item.id}: ${s.score}`} />
                          );
                        })}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-2">
                    {sub.items.map((item) => {
                      const state = getState(item.id);
                      const isExpanded = expandedItems.has(item.id);
                      return (
                        <div key={item.id} className={`border rounded-lg ${item.isCritical ? "border-destructive/30" : "border-border"}`}>
                          {/* Item Header */}
                          <div
                            className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => toggleItem(item.id)}
                          >
                            <div className="flex items-center gap-2 shrink-0 pt-0.5">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              <span className="font-mono text-xs font-bold text-muted-foreground">{item.id}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm leading-relaxed">{item.description}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {item.isCritical && <Badge variant="destructive" className="text-[10px] h-4">CRÍTICO</Badge>}
                                {item.norms.slice(0, 3).map(n => (
                                  <Badge key={n} variant="outline" className="text-[10px] h-4">{n}</Badge>
                                ))}
                                {item.norms.length > 3 && <Badge variant="outline" className="text-[10px] h-4">+{item.norms.length - 3}</Badge>}
                              </div>
                            </div>
                            {/* Score buttons */}
                            <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                              {(["NA", 0, 1, 2, 3, 4] as ScoreValue[]).map(score => (
                                <TooltipProvider key={String(score)}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                                          state.score === score
                                            ? getScoreColor(score)
                                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                        }`}
                                        onClick={() => updateState(item.id, {
                                          score,
                                          ncClassification: typeof score === "number" && score <= 1 ? "B" : null,
                                        })}
                                      >
                                        {score === "NA" ? "–" : score}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[200px]">
                                      <p className="text-xs font-medium">{SCORE_CRITERIA[String(score)]?.label}</p>
                                      <p className="text-xs text-muted-foreground">{SCORE_CRITERIA[String(score)]?.description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ))}
                            </div>
                          </div>

                          {/* Expanded Item Details */}
                          {isExpanded && (
                            <div className="border-t px-4 py-3 space-y-3 bg-muted/20">
                              {/* Required Evidences */}
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                                  <ClipboardCheck className="h-3 w-3" /> Evidências Requeridas:
                                </p>
                                <p className="text-xs bg-background p-2 rounded border">{item.evidences}</p>
                              </div>

                              {/* Auditor Observations */}
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1">Observações do Auditor:</p>
                                <Textarea
                                  value={state.observations}
                                  onChange={e => updateState(item.id, { observations: e.target.value })}
                                  placeholder="Descreva observações, condições encontradas..."
                                  rows={2}
                                  className="text-xs"
                                />
                              </div>

                              {/* NC Classification (if score <= 2) */}
                              {typeof state.score === "number" && state.score <= 2 && (
                                <div className="p-2 border border-destructive/30 rounded bg-destructive/5">
                                  <p className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" /> Classificação da Não Conformidade:
                                  </p>
                                  <div className="flex gap-2">
                                    {(["A", "B", "C", "D"] as const).map(nc => (
                                      <button
                                        key={nc}
                                        onClick={() => updateState(item.id, { ncClassification: nc })}
                                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                                          state.ncClassification === nc
                                            ? nc === "A" ? "bg-destructive text-destructive-foreground" :
                                              nc === "B" ? "bg-destructive/80 text-destructive-foreground" :
                                              nc === "C" ? "bg-warning text-warning-foreground" :
                                              "bg-muted text-foreground"
                                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                        }`}
                                      >
                                        {nc} - {NC_CLASSIFICATIONS[nc].label}
                                      </button>
                                    ))}
                                  </div>
                                  {state.ncClassification && (
                                    <p className="text-xs mt-2 text-muted-foreground">
                                      {NC_CLASSIFICATIONS[state.ncClassification as keyof typeof NC_CLASSIFICATIONS]?.description}
                                      {" • Prazo: "}{NC_CLASSIFICATIONS[state.ncClassification as keyof typeof NC_CLASSIFICATIONS]?.deadline}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* AI Actions */}
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => generateAIEvidence(item)}
                                  disabled={state.isGeneratingEvidence}
                                  className="gap-1 text-xs"
                                >
                                  {state.isGeneratingEvidence ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Sparkles className="h-3 w-3" />
                                  )}
                                  Gerar Evidência IA
                                </Button>
                                <Button size="sm" variant="ghost" className="gap-1 text-xs" onClick={() => toast.info("Captura de foto em desenvolvimento")}>
                                  <Camera className="h-3 w-3" /> Foto
                                </Button>
                              </div>

                              {/* AI Generated Evidence */}
                              {state.aiEvidence && (
                                <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold flex items-center gap-1 text-primary">
                                      <Brain className="h-3 w-3" /> Evidência Gerada por IA
                                    </p>
                                    <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => {
                                      navigator.clipboard.writeText(state.aiEvidence || "");
                                      toast.success("Copiado!");
                                    }}>
                                      <Copy className="h-3 w-3 mr-1" /> Copiar
                                    </Button>
                                  </div>
                                  <ScrollArea className="max-h-[300px]">
                                    <div className="prose prose-xs dark:prose-invert max-w-none text-xs">
                                      <ReactMarkdown>{state.aiEvidence}</ReactMarkdown>
                                    </div>
                                  </ScrollArea>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default PeotramElementChecklist;
