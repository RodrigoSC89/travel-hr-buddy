/**
 * PEOTRAM AI Audit Preparation Wizard
 * Analyzes SGI data and generates a personalized preparation plan for each element
 */
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Wand2, Loader2, CheckCircle, AlertTriangle, Clock, FileText,
  ChevronDown, ChevronRight, Sparkles, ListChecks, BookOpen, Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { logger } from "@/lib/logger";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PEOTRAM_ELEMENTS } from "@/data/peotram-elements-data";

interface ElementPrep {
  elementId: number;
  elementName: string;
  sigla: string;
  documentsToGather: string[];
  interviewQuestions: string[];
  fieldInspections: string[];
  commonFindings: string[];
  bestPractices: string[];
  estimatedTime: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "generating" | "done" | "error";
}

export function PeotramAuditWizard() {
  const [vesselName, setVesselName] = useState("");
  const [vesselType, setVesselType] = useState("");
  const [daysUntilAudit, setDaysUntilAudit] = useState("15");
  const [preparations, setPreparations] = useState<ElementPrep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [expandedElements, setExpandedElements] = useState<Set<number>>(new Set());

  const toggleElement = (id: number) => {
    setExpandedElements(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const runPreparationWizard = useCallback(async () => {
    setIsRunning(true);
    const preps: ElementPrep[] = PEOTRAM_ELEMENTS.map(el => ({
      elementId: el.id, elementName: el.name, sigla: el.sigla,
      documentsToGather: [], interviewQuestions: [], fieldInspections: [],
      commonFindings: [], bestPractices: [], estimatedTime: "",
      priority: el.isCritical ? "high" as const : "medium" as const,
      status: "pending" as const,
    }));
    setPreparations(preps);

    for (let i = 0; i < PEOTRAM_ELEMENTS.length; i++) {
      const el = PEOTRAM_ELEMENTS[i];
      setCurrentIdx(i);
      setPreparations(prev => prev.map((p, idx) => idx === i ? { ...p, status: "generating" } : p));

      const itemsList = el.subelements.flatMap(s => s.items)
        .slice(0, 8)
        .map(item => `- ${item.id}: ${item.description.substring(0, 120)}`)
        .join("\n");

      try {
        const { data, error } = await supabase.functions.invoke("ai-chat", {
          body: {
            messages: [
              {
                role: "system",
                content: `Você é um consultor PEOTRAM experiente preparando uma empresa para auditoria Petrobras.
Responda em JSON com a estrutura:
{"documentsToGather":["doc1"],"interviewQuestions":["pergunta1"],"fieldInspections":["inspeção1"],"commonFindings":["achado1"],"bestPractices":["prática1"],"estimatedTime":"X horas","priority":"high|medium|low"}
Máximo 5 itens por lista. Seja específico e prático.`
              },
              {
                role: "user",
                content: `Prepare guia para Elemento ${el.id} - ${el.name} (${el.sigla}):
Peso: ${el.weightPercentage}% | Crítico: ${el.isCritical ? "SIM" : "NÃO"}
Descrição: ${el.description}
Itens principais:
${itemsList}
Embarcação: ${vesselName || "Genérica"} (${vesselType || "PSV"})
Dias até auditoria: ${daysUntilAudit}

Gere o guia de preparação completo para este elemento.`
              }
            ]
          }
        });

        if (error) throw error;
        const raw = data?.choices?.[0]?.message?.content || data?.response || "{}";
        let parsed: any;
        try {
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        } catch { parsed = {}; }

        setPreparations(prev => prev.map((p, idx) => idx === i ? {
          ...p,
          documentsToGather: parsed.documentsToGather || [],
          interviewQuestions: parsed.interviewQuestions || [],
          fieldInspections: parsed.fieldInspections || [],
          commonFindings: parsed.commonFindings || [],
          bestPractices: parsed.bestPractices || [],
          estimatedTime: parsed.estimatedTime || "4-6 horas",
          priority: parsed.priority || (el.isCritical ? "high" : "medium"),
          status: "done",
        } : p));
      } catch (err) {
        logger.error(`[AuditWizard] Error on element ${el.id}`, err);
        setPreparations(prev => prev.map((p, idx) => idx === i ? { ...p, status: "error" } : p));
      }
    }

    setIsRunning(false);
    setExpandedElements(new Set(PEOTRAM_ELEMENTS.filter(e => e.isCritical).map(e => e.id)));
    toast.success("Plano de preparação completo gerado!");
  }, [vesselName, vesselType, daysUntilAudit]);

  const completedCount = preparations.filter(p => p.status === "done").length;
  const progress = preparations.length > 0 ? Math.round((completedCount / preparations.length) * 100) : 0;

  const getPriorityColor = (p: string) => {
    if (p === "high") return "text-destructive";
    if (p === "medium") return "text-warning";
    return "text-muted-foreground";
  };

  const getPriorityBadge = (p: string) => {
    if (p === "high") return "destructive" as const;
    if (p === "medium") return "secondary" as const;
    return "outline" as const;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Wand2 className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Wizard de Preparação para Auditoria</h3>
          <p className="text-sm text-muted-foreground">
            IA gera plano de preparação personalizado para cada um dos 13 elementos
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Embarcação</Label>
              <Input value={vesselName} onChange={e => setVesselName(e.target.value)} placeholder="Nome" />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Embarcação</Label>
              <Input value={vesselType} onChange={e => setVesselType(e.target.value)} placeholder="PSV, AHTS, PLSV..." />
            </div>
            <div className="space-y-2">
              <Label>Dias até Auditoria</Label>
              <Input type="number" value={daysUntilAudit} onChange={e => setDaysUntilAudit(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={runPreparationWizard} disabled={isRunning} className="w-full gap-2">
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {isRunning ? `Preparando ${currentIdx + 1}/13` : "Gerar Plano Completo"}
              </Button>
            </div>
          </div>

          {preparations.length > 0 && (
            <>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{completedCount}/13 elementos analisados</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 [&>div]:bg-primary" />
              </div>

              <ScrollArea className="h-[calc(100vh-450px)]">
                <div className="space-y-2 pr-2">
                  {preparations.map(prep => (
                    <Card key={prep.elementId} className={`overflow-hidden ${prep.priority === "high" ? "border-destructive/30" : ""}`}>
                      <Collapsible open={expandedElements.has(prep.elementId)} onOpenChange={() => toggleElement(prep.elementId)}>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {expandedElements.has(prep.elementId) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                <span className="font-bold text-warning">{prep.elementId}</span>
                                <span className="font-medium text-sm">{prep.elementName}</span>
                                <Badge variant="outline" className="text-[10px]">{prep.sigla}</Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                {prep.status === "generating" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                                {prep.status === "done" && <CheckCircle className="h-4 w-4 text-success" />}
                                {prep.status === "error" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                                <Badge variant={getPriorityBadge(prep.priority)} className="text-[10px]">
                                  {prep.priority === "high" ? "ALTA" : prep.priority === "medium" ? "MÉDIA" : "BAIXA"}
                                </Badge>
                                {prep.estimatedTime && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                    <Clock className="h-3 w-3" />{prep.estimatedTime}
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {prep.status === "done" && (
                            <CardContent className="pt-0 space-y-3">
                              {prep.documentsToGather.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold mb-1 flex items-center gap-1"><FileText className="h-3 w-3 text-primary" /> Documentos a Reunir:</p>
                                  <ul className="space-y-0.5">{prep.documentsToGather.map((d, i) => (
                                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1"><CheckCircle className="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground" />{d}</li>
                                  ))}</ul>
                                </div>
                              )}
                              {prep.interviewQuestions.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold mb-1 flex items-center gap-1"><Users className="h-3 w-3 text-warning" /> Perguntas para Entrevistas:</p>
                                  <ul className="space-y-0.5">{prep.interviewQuestions.map((q, i) => (
                                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1"><ChevronRight className="h-3 w-3 shrink-0 mt-0.5" />{q}</li>
                                  ))}</ul>
                                </div>
                              )}
                              {prep.fieldInspections.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold mb-1 flex items-center gap-1"><ListChecks className="h-3 w-3 text-success" /> Inspeções em Campo:</p>
                                  <ul className="space-y-0.5">{prep.fieldInspections.map((f, i) => (
                                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1"><CheckCircle className="h-3 w-3 shrink-0 mt-0.5 text-success" />{f}</li>
                                  ))}</ul>
                                </div>
                              )}
                              {prep.commonFindings.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-destructive" /> Achados Mais Comuns:</p>
                                  <ul className="space-y-0.5">{prep.commonFindings.map((c, i) => (
                                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1"><AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-destructive/60" />{c}</li>
                                  ))}</ul>
                                </div>
                              )}
                              {prep.bestPractices.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold mb-1 flex items-center gap-1"><BookOpen className="h-3 w-3 text-primary" /> Boas Práticas (Nota 4):</p>
                                  <ul className="space-y-0.5">{prep.bestPractices.map((b, i) => (
                                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1"><Sparkles className="h-3 w-3 shrink-0 mt-0.5 text-primary" />{b}</li>
                                  ))}</ul>
                                </div>
                              )}
                            </CardContent>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PeotramAuditWizard;
