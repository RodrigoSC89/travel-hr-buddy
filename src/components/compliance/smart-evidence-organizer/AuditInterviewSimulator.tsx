/**
 * Audit Interview Simulator - IA conduz perguntas como um auditor real
 */
import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageSquare, Send, Brain, CheckCircle2, XCircle, AlertTriangle,
  Loader2, Trophy, RotateCcw, Target, Mic, User, Bot
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { EvidenceElement, EvidencePack } from "./types";
import { cn } from "@/lib/utils";

import type { ComplianceFramework } from "./SmartEvidenceOrganizer";

interface Props {
  framework: ComplianceFramework;
  pack?: EvidencePack | null;
  elements: EvidenceElement[];
}

interface InterviewMessage {
  role: "auditor" | "user";
  content: string;
  evaluation?: {
    score: "correct" | "partial" | "incorrect";
    feedback: string;
    norm_reference?: string;
  };
}

export const AuditInterviewSimulator = memo(({ framework, pack, elements }: Props) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [sessionType, setSessionType] = useState<"full" | "element" | "quick">("quick");
  const [targetElement, setTargetElement] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, correct: 0, partial: 0, wrong: 0 });
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalAssessment, setFinalAssessment] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSession = useCallback(async () => {
    setIsStarting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const result = await supabase.functions.invoke("smart-evidence-organizer", {
        body: {
          action: "interview_start",
          framework,
          pack_id: pack?.id,
          session_type: sessionType,
          target_element_id: targetElement,
          user_id: user.id,
        },
      });

      if (result.error) throw result.error;

      setSessionId(result.data.session_id);
      setMessages([{
        role: "auditor",
        content: result.data.first_question,
      }]);
      setStats({ total: 0, correct: 0, partial: 0, wrong: 0 });
      setIsCompleted(false);
      setFinalAssessment(null);
      toast.success("Sessão de entrevista iniciada!");
    } catch (error) {
      console.error("Start interview error:", error);
      toast.error("Erro ao iniciar entrevista");
    } finally {
      setIsStarting(false);
    }
  }, [framework, pack, sessionType, targetElement]);

  const sendAnswer = useCallback(async () => {
    if (!userInput.trim() || !sessionId) return;

    const userMsg: InterviewMessage = { role: "user", content: userInput.trim() };
    setMessages(prev => [...prev, userMsg]);
    setUserInput("");
    setIsLoading(true);

    try {
      const result = await supabase.functions.invoke("smart-evidence-organizer", {
        body: {
          action: "interview_answer",
          session_id: sessionId,
          answer: userMsg.content,
          framework,
          conversation_history: messages.map(m => ({ role: m.role === "auditor" ? "assistant" : "user", content: m.content })),
        },
      });

      if (result.error) throw result.error;

      const { evaluation, next_question, is_completed, final_assessment, stats: newStats } = result.data;

      // Add evaluation to the user message
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          evaluation,
        };
        if (next_question) {
          updated.push({ role: "auditor", content: next_question });
        }
        return updated;
      });

      if (newStats) setStats(newStats);

      if (is_completed) {
        setIsCompleted(true);
        setFinalAssessment(final_assessment);
      }
    } catch (error) {
      console.error("Answer error:", error);
      toast.error("Erro ao processar resposta");
    } finally {
      setIsLoading(false);
    }
  }, [userInput, sessionId, framework, messages]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAnswer();
    }
  }, [sendAnswer]);

  const scorePercent = stats.total > 0
    ? Math.round(((stats.correct + stats.partial * 0.5) / stats.total) * 100)
    : 0;

  const FRAMEWORK_LABELS: Record<string, string> = {
    peodp: "PEO-DP", peotram: "PEOTRAM", ism_isps: "ISM/ISPS",
    mlc: "MLC 2006", sgso: "SGSO ANP", ovid_ocimf: "OVID/OCIMF",
  };
  const frameworkLabel = FRAMEWORK_LABELS[framework] || framework.toUpperCase();

  // Not started yet
  if (!sessionId) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Simulador de Entrevista — {frameworkLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A IA conduzirá uma entrevista técnica como um auditor {frameworkLabel} real.
            Responda às perguntas como se estivesse em uma auditoria presencial.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo de Sessão</label>
              <Select value={sessionType} onValueChange={(v: any) => setSessionType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">⚡ Rápida (5 perguntas)</SelectItem>
                  <SelectItem value="element">🎯 Por Elemento (10 perguntas)</SelectItem>
                  <SelectItem value="full">📋 Completa (20 perguntas)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sessionType === "element" && elements.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-1 block">Elemento Alvo</label>
                <Select value={targetElement || ""} onValueChange={setTargetElement}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {elements.map(el => (
                      <SelectItem key={el.id} value={el.id}>
                        {el.element_code || `E${el.element_number}`} — {el.element_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">O auditor IA irá:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Fazer perguntas baseadas nas normas {framework === "peodp" ? "IMCA M166, IMO MSC/Circ.645, PEO-DP Petrobras" : "IMCA D-series, NORMAM-15, PEOTRAM Petrobras"}</li>
              <li>• Avaliar suas respostas em tempo real (✅ Correto / ⚠️ Parcial / ❌ Incorreto)</li>
              <li>• Dar feedback com referência às normas aplicáveis</li>
              <li>• Gerar uma avaliação final com score e recomendações</li>
            </ul>
          </div>

          <Button onClick={startSession} disabled={isStarting} className="w-full gap-2" size="lg">
            {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            Iniciar Entrevista de Auditoria
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Entrevista {frameworkLabel} em Andamento
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span>{stats.correct}</span>
              <AlertTriangle className="h-3 w-3 text-yellow-500 ml-1" />
              <span>{stats.partial}</span>
              <XCircle className="h-3 w-3 text-destructive ml-1" />
              <span>{stats.wrong}</span>
            </div>
            {stats.total > 0 && (
              <Badge variant={scorePercent >= 80 ? "default" : scorePercent >= 50 ? "secondary" : "destructive"}>
                {scorePercent}%
              </Badge>
            )}
          </div>
        </div>
        {stats.total > 0 && <Progress value={scorePercent} className="h-1.5 mt-2" />}
      </CardHeader>

      <CardContent className="space-y-3">
        <ScrollArea className="h-[400px] pr-2">
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-lg p-3 text-sm",
                  msg.role === "auditor"
                    ? "bg-muted border"
                    : "bg-primary text-primary-foreground"
                )}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {msg.role === "auditor" ? (
                      <>
                        <Bot className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Auditor IA</span>
                      </>
                    ) : (
                      <>
                        <User className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Sua Resposta</span>
                      </>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {msg.evaluation && (
                    <div className={cn(
                      "mt-2 p-2 rounded text-xs border",
                      msg.evaluation.score === "correct" ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400" :
                      msg.evaluation.score === "partial" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400" :
                      "bg-destructive/10 border-destructive/30 text-destructive"
                    )}>
                      <div className="flex items-center gap-1 font-medium mb-0.5">
                        {msg.evaluation.score === "correct" && <><CheckCircle2 className="h-3 w-3" /> Correto</>}
                        {msg.evaluation.score === "partial" && <><AlertTriangle className="h-3 w-3" /> Parcial</>}
                        {msg.evaluation.score === "incorrect" && <><XCircle className="h-3 w-3" /> Incorreto</>}
                      </div>
                      <p>{msg.evaluation.feedback}</p>
                      {msg.evaluation.norm_reference && (
                        <p className="mt-1 opacity-80">📜 {msg.evaluation.norm_reference}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="bg-muted border rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {isCompleted ? (
          <div className="space-y-3">
            <Card className={cn(
              "border-2",
              scorePercent >= 80 ? "border-green-500/40 bg-green-500/5" :
              scorePercent >= 50 ? "border-yellow-500/40 bg-yellow-500/5" :
              "border-destructive/40 bg-destructive/5"
            )}>
              <CardContent className="pt-4 text-center">
                <Trophy className={cn(
                  "h-10 w-10 mx-auto mb-2",
                  scorePercent >= 80 ? "text-green-500" : scorePercent >= 50 ? "text-yellow-500" : "text-destructive"
                )} />
                <p className="text-2xl font-bold">{scorePercent}%</p>
                <p className="text-sm text-muted-foreground">Score Final da Entrevista</p>
                {finalAssessment && (
                  <p className="text-sm mt-3 text-left whitespace-pre-wrap">{finalAssessment}</p>
                )}
              </CardContent>
            </Card>
            <Button onClick={() => { setSessionId(null); setMessages([]); }} variant="outline" className="w-full gap-1">
              <RotateCcw className="h-3.5 w-3.5" /> Nova Entrevista
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Textarea
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua resposta de auditoria..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button onClick={sendAnswer} disabled={isLoading || !userInput.trim()} size="icon" className="shrink-0 h-[60px] w-[60px]" aria-label="Enviar resposta">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

AuditInterviewSimulator.displayName = "AuditInterviewSimulator";
