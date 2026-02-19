/**
 * LVS Petrobras Inspection Simulator
 * Simula o walkthrough do inspetor Petrobras item a item
 * Gera perguntas que o inspetor faria + dicas de resposta via IA
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  UserCheck, Play, Pause, SkipForward, RotateCcw, Brain, CheckCircle2,
  XCircle, AlertTriangle, ChevronRight, Target, Clock, Shield,
  MessageSquare, Lightbulb, Flag, ThumbsUp, ThumbsDown, Loader2
} from "lucide-react";
import { ALL_LVS_SECTIONS, type Section, type LVItem, type ItemStatus } from "./lvs-data";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import ReactMarkdown from "react-markdown";

type SimulationMode = "sequential" | "random" | "critical_only" | "gaps_only";
type InspectorPersona = "rigorous" | "standard" | "cooperative";

interface SimulationState {
  isRunning: boolean;
  currentIndex: number;
  totalItems: number;
  answeredCount: number;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
  startTime: number | null;
  itemResults: Map<string, "pass" | "fail" | "skip">;
}

const PERSONA_CONFIG: Record<InspectorPersona, { label: string; description: string; color: string }> = {
  rigorous: { label: "Rigoroso", description: "Exige 100% de evidências, questiona detalhes técnicos", color: "text-destructive" },
  standard: { label: "Padrão", description: "Segue o checklist rigorosamente mas aceita evidências razoáveis", color: "text-warning" },
  cooperative: { label: "Colaborativo", description: "Foca nos itens críticos, oferece sugestões construtivas", color: "text-success" },
};

export function LVSPetrobrasInspectionSimulator() {
  const [mode, setMode] = useState<SimulationMode>("sequential");
  const [persona, setPersona] = useState<InspectorPersona>("standard");
  const [simulation, setSimulation] = useState<SimulationState>({
    isRunning: false, currentIndex: 0, totalItems: 0, answeredCount: 0,
    passedCount: 0, failedCount: 0, skippedCount: 0, startTime: null,
    itemResults: new Map(),
  });
  const [userAnswer, setUserAnswer] = useState("");
  const [aiInspectorQuestion, setAiInspectorQuestion] = useState<string | null>(null);
  const [aiEvaluation, setAiEvaluation] = useState<string | null>(null);
  const [aiTips, setAiTips] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);

  const { analyze, isLoading: aiLoading } = useNautilusAI();

  // Build item queue based on mode
  const itemQueue = useMemo(() => {
    const allItems = ALL_LVS_SECTIONS.flatMap(s =>
      s.subsections.flatMap(ss =>
        ss.items.map(item => {
          const section = ALL_LVS_SECTIONS.find(sec => sec.subsections.some(sub => sub.items.some(i => i.id === item.id)));
          return { ...item, sectionTitle: section?.title || "", etRef: section?.etRef || "", sectionCode: section?.code || "" };
        })
      )
    );

    switch (mode) {
      case "critical_only":
        return allItems.filter(i => i.status === "rejected" || i.pendency);
      case "gaps_only":
        return allItems.filter(i => i.status !== "approved" && i.status !== "not_applicable");
      case "random":
        return [...allItems].sort(() => Math.random() - 0.5);
      default:
        return allItems;
    }
  }, [mode]);

  const currentItem = itemQueue[simulation.currentIndex];

  const startSimulation = async () => {
    setSimulation({
      isRunning: true, currentIndex: 0, totalItems: itemQueue.length,
      answeredCount: 0, passedCount: 0, failedCount: 0, skippedCount: 0,
      startTime: Date.now(), itemResults: new Map(),
    });
    setAiEvaluation(null);
    setAiTips(null);
    setUserAnswer("");
    setShowTips(false);

    // Generate first inspector question
    if (itemQueue.length > 0) {
      await generateInspectorQuestion(itemQueue[0]);
    }
  };

  const generateInspectorQuestion = async (item: typeof itemQueue[0]) => {
    setAiInspectorQuestion(null);
    const personaCtx = PERSONA_CONFIG[persona];

    const result = await analyze("peodp",
      `Você é um INSPETOR DA PETROBRAS em uma vistoria de aceitação de embarcação RSV.
Seu perfil: ${personaCtx.label} — ${personaCtx.description}

ITEM SENDO INSPECIONADO:
- Referência: ${item.ref}
- Seção: ${item.sectionCode} - ${item.sectionTitle}
- ET: ${item.etRef}
- Questão original: "${item.question}"
- Metodologia de verificação: "${item.methodology}"
- Status atual: ${item.status}
${item.pendency ? `- Pendência registrada: "${item.pendency}"` : ""}
${item.observations ? `- Observações: "${item.observations}"` : ""}

TAREFA:
Faça UMA pergunta direta como se estivesse presencialmente a bordo da embarcação, verificando este item.
A pergunta deve ser:
1. Específica e técnica (não genérica)
2. Focada na EVIDÊNCIA que comprova conformidade
3. No tom do seu perfil (${personaCtx.label})
4. Em português brasileiro, linguagem técnica marítima

Formato: Apenas a pergunta, sem explicações adicionais.`,
      { framework: "lvs_petrobras" }
    );

    if (result) setAiInspectorQuestion(result.response);
  };

  const submitAnswer = async () => {
    if (!currentItem || !userAnswer.trim()) {
      toast.error("Escreva sua resposta antes de enviar");
      return;
    }

    const result = await analyze("peodp",
      `Você é um INSPETOR DA PETROBRAS avaliando a resposta do representante da embarcação RSV.
Perfil: ${PERSONA_CONFIG[persona].label}

ITEM INSPECIONADO:
- Ref: ${currentItem.ref} | ${currentItem.question}
- Metodologia: ${currentItem.methodology}
- Pergunta feita: "${aiInspectorQuestion}"

RESPOSTA DO REPRESENTANTE:
"${userAnswer}"

AVALIE a resposta:
1. **Veredicto**: APROVADO ✅ ou REPROVADO ❌ (seja realista)
2. **Justificativa**: Por que aprovado/reprovado (2-3 linhas)
3. **O que faltou** (se reprovado): Exatamente o que o inspetor exigiria
4. **Dica para próxima vez**: Como responder melhor

Use markdown. Seja direto e técnico.`,
      { framework: "lvs_petrobras" }
    );

    if (result) {
      setAiEvaluation(result.response);
      const passed = result.response.toLowerCase().includes("aprovado") && !result.response.toLowerCase().includes("reprovado");
      setSimulation(prev => ({
        ...prev,
        answeredCount: prev.answeredCount + 1,
        passedCount: prev.passedCount + (passed ? 1 : 0),
        failedCount: prev.failedCount + (passed ? 0 : 1),
        itemResults: new Map(prev.itemResults).set(currentItem.id, passed ? "pass" : "fail"),
      }));
    }
  };

  const generateTips = async () => {
    if (!currentItem) return;
    setShowTips(true);
    setAiTips(null);

    const result = await analyze("peodp",
      `Para o item LVS Petrobras:
- Ref: ${currentItem.ref}
- Questão: "${currentItem.question}"
- Metodologia: "${currentItem.methodology}"
- ET: ${currentItem.etRef}

Gere DICAS DE PREPARAÇÃO para o representante da embarcação:
1. **Documentos a ter em mãos**: Lista específica
2. **Resposta ideal**: Como responder perfeitamente ao inspetor
3. **Armadilhas comuns**: O que NÃO fazer/dizer
4. **Evidência física**: O que mostrar a bordo
5. **Norma aplicável**: Referência normativa relevante

Formato markdown, conciso e prático.`,
      { framework: "lvs_petrobras" }
    );

    if (result) setAiTips(result.response);
  };

  const nextItem = async () => {
    const nextIndex = simulation.currentIndex + 1;
    if (nextIndex >= itemQueue.length) {
      setSimulation(prev => ({ ...prev, isRunning: false }));
      toast.success("Simulação concluída!");
      return;
    }

    setSimulation(prev => ({ ...prev, currentIndex: nextIndex }));
    setUserAnswer("");
    setAiEvaluation(null);
    setAiTips(null);
    setShowTips(false);
    await generateInspectorQuestion(itemQueue[nextIndex]);
  };

  const skipItem = async () => {
    setSimulation(prev => ({
      ...prev,
      skippedCount: prev.skippedCount + 1,
      itemResults: new Map(prev.itemResults).set(currentItem?.id || "", "skip"),
    }));
    await nextItem();
  };

  const elapsedMinutes = simulation.startTime ? Math.floor((Date.now() - simulation.startTime) / 60000) : 0;
  const progressPercent = simulation.totalItems > 0 ? Math.round(((simulation.answeredCount + simulation.skippedCount) / simulation.totalItems) * 100) : 0;
  const passRate = simulation.answeredCount > 0 ? Math.round((simulation.passedCount / simulation.answeredCount) * 100) : 0;

  // ─── Not Started ───
  if (!simulation.isRunning && simulation.answeredCount === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Simulador de Inspeção Petrobras
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Simule o walkthrough de um inspetor Petrobras item a item. Pratique suas respostas e receba feedback da IA.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Modo de Simulação</label>
                <Select value={mode} onValueChange={v => setMode(v as SimulationMode)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sequential">Sequencial (todos os itens)</SelectItem>
                    <SelectItem value="gaps_only">Apenas Gaps (não aprovados)</SelectItem>
                    <SelectItem value="critical_only">Críticos (rejeitados + pendências)</SelectItem>
                    <SelectItem value="random">Aleatório (shuffle)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Perfil do Inspetor</label>
                <Select value={persona} onValueChange={v => setPersona(v as InspectorPersona)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PERSONA_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label} — {v.description}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <Card><CardContent className="p-3">
                <div className="text-2xl font-bold text-primary">{itemQueue.length}</div>
                <div className="text-xs text-muted-foreground">Itens no modo selecionado</div>
              </CardContent></Card>
              <Card><CardContent className="p-3">
                <div className="text-2xl font-bold text-warning">
                  {itemQueue.filter(i => i.status === "pending" || i.status === "not_verified").length}
                </div>
                <div className="text-xs text-muted-foreground">Pendentes/Não verificados</div>
              </CardContent></Card>
              <Card><CardContent className="p-3">
                <div className="text-2xl font-bold text-destructive">
                  {itemQueue.filter(i => i.status === "rejected").length}
                </div>
                <div className="text-xs text-muted-foreground">Rejeitados</div>
              </CardContent></Card>
            </div>

            <Button className="w-full" size="lg" onClick={startSimulation} disabled={itemQueue.length === 0}>
              <Play className="h-5 w-5 mr-2" /> Iniciar Simulação ({itemQueue.length} itens)
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Finished ───
  if (!simulation.isRunning && simulation.answeredCount > 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" /> Resultado da Simulação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Respondidos", value: simulation.answeredCount, color: "text-primary" },
                { label: "Aprovados", value: simulation.passedCount, icon: ThumbsUp, color: "text-success" },
                { label: "Reprovados", value: simulation.failedCount, icon: ThumbsDown, color: "text-destructive" },
                { label: "Pulados", value: simulation.skippedCount, color: "text-muted-foreground" },
                { label: "Taxa de Aprovação", value: `${passRate}%`, color: passRate >= 80 ? "text-success" : passRate >= 50 ? "text-warning" : "text-destructive" },
              ].map(kpi => (
                <Card key={kpi.label}><CardContent className="p-3 text-center">
                  <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                  <div className="text-xs text-muted-foreground">{kpi.label}</div>
                </CardContent></Card>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /> Duração: {elapsedMinutes} minutos
              <span className="mx-2">•</span>
              <Shield className="h-4 w-4" /> Perfil: {PERSONA_CONFIG[persona].label}
            </div>

            <Progress value={passRate} className="h-3" />

            <div className="flex gap-2">
              <Button onClick={startSimulation}><RotateCcw className="h-4 w-4 mr-1" /> Nova Simulação</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Running ───
  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Badge variant="outline">{simulation.currentIndex + 1}/{simulation.totalItems}</Badge>
              <span className="text-sm text-muted-foreground">
                <span className="text-success">✓{simulation.passedCount}</span>
                <span className="mx-1">•</span>
                <span className="text-destructive">✗{simulation.failedCount}</span>
                <span className="mx-1">•</span>
                <span>⊘{simulation.skippedCount}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{elapsedMinutes}min</span>
              <Badge className={passRate >= 80 ? "bg-success/20 text-success" : passRate >= 50 ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"}>
                {passRate}% aprovação
              </Badge>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {currentItem && (
        <>
          {/* Item Context */}
          <Card className="border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">{currentItem.sectionCode}</Badge>
                <Badge variant="secondary" className="text-[10px]">{currentItem.etRef}</Badge>
                <Badge className="text-[10px]">{currentItem.ref}</Badge>
              </div>
              <p className="text-sm font-medium mb-1">{currentItem.question}</p>
              <p className="text-xs text-muted-foreground">Metodologia: {currentItem.methodology}</p>
              {currentItem.pendency && (
                <div className="mt-2 flex items-center gap-1 text-xs text-warning">
                  <AlertTriangle className="h-3 w-3" /> Pendência: {currentItem.pendency}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inspector Question */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Inspetor Petrobras ({PERSONA_CONFIG[persona].label})</span>
              </div>
              {aiLoading && !aiInspectorQuestion ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Preparando pergunta...
                </div>
              ) : (
                <p className="text-sm italic">"{aiInspectorQuestion}"</p>
              )}
            </CardContent>
          </Card>

          {/* User Answer */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" /> Sua Resposta
                </span>
                <Button variant="ghost" size="sm" onClick={generateTips} disabled={aiLoading}>
                  <Lightbulb className="h-3.5 w-3.5 mr-1" /> Dicas de Preparação
                </Button>
              </div>
              <Textarea
                placeholder="Responda como se estivesse falando com o inspetor a bordo..."
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={submitAnswer} disabled={aiLoading || !userAnswer.trim()} className="flex-1">
                  {aiLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Brain className="h-4 w-4 mr-1" />}
                  Enviar Resposta
                </Button>
                <Button variant="outline" onClick={skipItem} disabled={aiLoading}>
                  <SkipForward className="h-4 w-4 mr-1" /> Pular
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          {showTips && (
            <Card className="bg-accent/30 border-accent">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-warning" />
                  <span className="text-sm font-semibold">Dicas de Preparação</span>
                </div>
                {aiTips ? (
                  <ScrollArea className="max-h-[300px]">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{aiTips}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Gerando dicas...
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Evaluation */}
          {aiEvaluation && (
            <Card className={aiEvaluation.toLowerCase().includes("reprovado") ? "border-destructive/50 bg-destructive/5" : "border-success/50 bg-success/5"}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4" />
                  <span className="text-sm font-semibold">Avaliação do Inspetor</span>
                </div>
                <ScrollArea className="max-h-[300px]">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{aiEvaluation}</ReactMarkdown>
                  </div>
                </ScrollArea>
                <Separator className="my-3" />
                <Button onClick={nextItem} className="w-full">
                  <ChevronRight className="h-4 w-4 mr-1" /> Próximo Item
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
