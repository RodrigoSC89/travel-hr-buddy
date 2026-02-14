/**
 * PEOTRAM Smart Scoring - AI-powered score suggestion engine
 * Analyzes SGI data, historical patterns, and evidence to suggest scores for each item
 */
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Brain, Loader2, CheckCircle, AlertTriangle, TrendingUp, TrendingDown,
  Minus, Sparkles, Target, ThumbsUp, ThumbsDown, RotateCcw, Lightbulb
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { logger } from "@/lib/logger";
import { PEOTRAM_ELEMENTS, SCORE_CRITERIA } from "@/data/peotram-elements-data";
import type { ScoreValue } from "@/data/peotram-elements-data";

interface ScoredItem {
  itemId: string;
  suggestedScore: ScoreValue;
  confidence: number;
  reasoning: string;
  risks: string[];
  improvements: string[];
  status: "pending" | "analyzing" | "done" | "error";
}

interface PeotramSmartScoringProps {
  vesselName?: string;
  itemStates?: Record<string, { score: ScoreValue; observations: string; ncClassification: string | null }>;
  onApplyScores?: (scores: Record<string, ScoreValue>) => void;
}

export function PeotramSmartScoring({ vesselName: propVesselName, itemStates: propItemStates, onApplyScores }: PeotramSmartScoringProps = {}) {
  const [selectedElement, setSelectedElement] = useState("");
  const [vesselName, setVesselName] = useState(propVesselName || "");
  const [lastAuditScore, setLastAuditScore] = useState("");
  const [scoredItems, setScoredItems] = useState<ScoredItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const element = PEOTRAM_ELEMENTS.find(e => String(e.id) === selectedElement);
  const allItems = element?.subelements.flatMap(s => s.items) || [];

  const runSmartScoring = useCallback(async () => {
    if (!element) { toast.error("Selecione um elemento"); return; }

    setIsRunning(true);
    const results: ScoredItem[] = allItems.map(item => ({
      itemId: item.id,
      suggestedScore: "NA",
      confidence: 0,
      reasoning: "",
      risks: [],
      improvements: [],
      status: "pending" as const,
    }));
    setScoredItems(results);

    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      setCurrentIdx(i);
      setScoredItems(prev => prev.map((r, idx) => idx === i ? { ...r, status: "analyzing" } : r));

      try {
        const { data, error } = await supabase.functions.invoke("ai-chat", {
          body: {
            messages: [
              {
                role: "system",
                content: `Você é um auditor PEOTRAM sênior da Petrobras com 20 anos de experiência.
Analise o item e sugira uma nota (0-4) com base nos padrões típicos da indústria marítima brasileira.
Responda APENAS em JSON válido com a estrutura:
{"score": 0-4, "confidence": 0-100, "reasoning": "texto", "risks": ["risco1"], "improvements": ["melhoria1"]}
Considere: nota 3 = conformidade total, nota 4 = excelência além do requerido.
Se não houver informações suficientes para avaliar, use score 2 com confidence baixa.`
              },
              {
                role: "user",
                content: `Elemento ${element.id} (${element.sigla} - ${element.name})
Item ${item.id}: ${item.description}
Evidências requeridas: ${item.evidences}
Normas: ${item.norms.join(", ")}
Peso: ${item.weight} | Crítico: ${item.isCritical ? "SIM" : "NÃO"}
Embarcação: ${vesselName || "Genérica"}
Última nota do ciclo anterior: ${lastAuditScore || "N/A"}

Sugira a nota mais provável considerando o cenário típico de uma embarcação de médio porte operando para Petrobras no Brasil.`
              }
            ]
          }
        });

        if (error) throw error;
        const raw = data?.choices?.[0]?.message?.content || data?.response || "{}";
        
        let parsed: { score?: number; confidence?: number; reasoning?: string; risks?: string[]; improvements?: string[] };
        try {
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        } catch { parsed = {}; }

        setScoredItems(prev => prev.map((r, idx) => idx === i ? {
          ...r,
          suggestedScore: (typeof parsed.score === "number" ? parsed.score : "NA") as ScoreValue,
          confidence: parsed.confidence || 50,
          reasoning: parsed.reasoning || raw,
          risks: parsed.risks || [],
          improvements: parsed.improvements || [],
          status: "done",
        } : r));
      } catch (err) {
        logger.error(`[SmartScoring] Error on item ${item.id}`, err);
        setScoredItems(prev => prev.map((r, idx) => idx === i ? { ...r, status: "error", reasoning: "Erro na análise" } : r));
      }
    }

    setIsRunning(false);
    toast.success(`Análise inteligente concluída para ${allItems.length} itens`);
  }, [element, allItems, vesselName, lastAuditScore]);

  const completedCount = scoredItems.filter(r => r.status === "done").length;
  const progress = scoredItems.length > 0 ? Math.round((completedCount / scoredItems.length) * 100) : 0;

  const avgScore = scoredItems.filter(r => r.status === "done" && typeof r.suggestedScore === "number")
    .reduce((acc, r) => {
      const pct = SCORE_CRITERIA[String(r.suggestedScore)]?.percentage || 0;
      return { sum: acc.sum + pct, count: acc.count + 1 };
    }, { sum: 0, count: 0 });
  const avgPercent = avgScore.count > 0 ? Math.round(avgScore.sum / avgScore.count) : 0;

  const getScoreColor = (score: ScoreValue) => {
    if (score === "NA") return "bg-muted text-muted-foreground";
    if (score === 0) return "bg-destructive text-destructive-foreground";
    if (score === 1) return "bg-destructive/80 text-destructive-foreground";
    if (score === 2) return "bg-warning text-warning-foreground";
    if (score === 3) return "bg-success text-success-foreground";
    if (score === 4) return "bg-primary text-primary-foreground";
    return "bg-muted";
  };

  const getConfidenceColor = (c: number) => c >= 80 ? "text-success" : c >= 50 ? "text-warning" : "text-destructive";

  const selected = selectedItem ? scoredItems.find(s => s.itemId === selectedItem) : null;
  const selectedItemData = selectedItem ? allItems.find(i => i.id === selectedItem) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Brain className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Scoring Inteligente por IA</h3>
          <p className="text-sm text-muted-foreground">
            IA analisa cada item e sugere notas baseadas em padrões, normas e cenários típicos
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Elemento PEOTRAM</Label>
              <Select value={selectedElement} onValueChange={setSelectedElement}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {PEOTRAM_ELEMENTS.map(el => (
                    <SelectItem key={el.id} value={String(el.id)}>
                      {el.id}. {el.sigla} - {el.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Embarcação</Label>
              <Input value={vesselName} onChange={e => setVesselName(e.target.value)} placeholder="Nome da embarcação" />
            </div>
            <div className="space-y-2">
              <Label>Nota Ciclo Anterior</Label>
              <Input value={lastAuditScore} onChange={e => setLastAuditScore(e.target.value)} placeholder="Ex: 78%" />
            </div>
            <div className="flex items-end">
              <Button onClick={runSmartScoring} disabled={isRunning || !selectedElement} className="w-full gap-2">
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                {isRunning ? `Analisando ${currentIdx + 1}/${allItems.length}` : "Iniciar Análise IA"}
              </Button>
            </div>
          </div>

          {scoredItems.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{completedCount}/{scoredItems.length} itens analisados</span>
                    <span>Score médio estimado: <strong className={avgPercent >= 90 ? "text-success" : avgPercent >= 60 ? "text-warning" : "text-destructive"}>{avgPercent}%</strong></span>
                  </div>
                  <Progress value={progress} className="h-2 [&>div]:bg-primary" />
                </div>
              </div>

              {/* Score grid */}
              <div className="flex gap-1 flex-wrap">
                {scoredItems.map(r => (
                  <button
                    key={r.itemId}
                    onClick={() => setSelectedItem(selectedItem === r.itemId ? null : r.itemId)}
                    className={`relative w-12 h-10 rounded text-xs font-mono transition-all ${
                      r.status === "done" ? getScoreColor(r.suggestedScore) :
                      r.status === "analyzing" ? "bg-primary/20 text-primary animate-pulse" :
                      r.status === "error" ? "bg-destructive/20 text-destructive" :
                      "bg-muted text-muted-foreground"
                    } ${selectedItem === r.itemId ? "ring-2 ring-foreground" : ""}`}
                  >
                    <div className="text-[10px]">{r.itemId}</div>
                    {r.status === "done" && typeof r.suggestedScore === "number" && (
                      <div className="font-bold">{r.suggestedScore}</div>
                    )}
                  </button>
                ))}
              </div>

              {/* Selected detail */}
              {selected && selectedItemData && (
                <Card className="border-primary/30">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Item {selected.itemId}: Análise IA
                    </CardTitle>
                    <CardDescription className="text-xs">{selectedItemData.description.substring(0, 200)}...</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Score + Confidence */}
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center ${getScoreColor(selected.suggestedScore)}`}>
                        <span className="text-2xl font-bold">{typeof selected.suggestedScore === "number" ? selected.suggestedScore : "–"}</span>
                        <span className="text-[9px] opacity-80">sugerido</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Confiança:</span>
                          <span className={`text-sm font-bold ${getConfidenceColor(selected.confidence)}`}>{selected.confidence}%</span>
                        </div>
                        <Progress value={selected.confidence} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">
                          {SCORE_CRITERIA[String(selected.suggestedScore)]?.description}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Reasoning */}
                    <div>
                      <p className="text-xs font-semibold mb-1 flex items-center gap-1"><Lightbulb className="h-3 w-3 text-warning" /> Justificativa:</p>
                      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">{selected.reasoning}</p>
                    </div>

                    {/* Risks */}
                    {selected.risks.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-destructive" /> Riscos Identificados:</p>
                        <ul className="space-y-1">
                          {selected.risks.map((r) => (
                            <li key={r} className="text-xs text-muted-foreground flex items-start gap-1">
                              <Minus className="h-3 w-3 shrink-0 mt-0.5 text-destructive" />{r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvements */}
                    {selected.improvements.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-1 flex items-center gap-1"><TrendingUp className="h-3 w-3 text-success" /> Melhorias para Nota 4:</p>
                        <ul className="space-y-1">
                          {selected.improvements.map((imp) => (
                            <li key={imp} className="text-xs text-muted-foreground flex items-start gap-1">
                              <CheckCircle className="h-3 w-3 shrink-0 mt-0.5 text-success" />{imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PeotramSmartScoring;
