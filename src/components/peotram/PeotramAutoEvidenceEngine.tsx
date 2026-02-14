/**
 * PEOTRAM Auto Evidence Engine - Batch AI evidence generation
 * Generates evidence for all items in an element automatically
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
import {
  Sparkles, Loader2, Download, CheckCircle, Brain, Zap, FileText, Copy
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { logger } from "@/lib/logger";
import { PEOTRAM_ELEMENTS } from "@/data/peotram-elements-data";

interface GeneratedBatch {
  itemId: string;
  content: string;
  status: "pending" | "generating" | "done" | "error";
}

export function PeotramAutoEvidenceEngine() {
  const [selectedElement, setSelectedElement] = useState<string>("");
  const [vesselName, setVesselName] = useState("");
  const [auditorName, setAuditorName] = useState("");
  const [batchResults, setBatchResults] = useState<GeneratedBatch[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const element = PEOTRAM_ELEMENTS.find(e => String(e.id) === selectedElement);
  const allItems = element?.subelements.flatMap(s => s.items) || [];

  const runBatchGeneration = useCallback(async () => {
    if (!element) {
      toast.error("Selecione um elemento");
      return;
    }

    setIsRunning(true);
    const results: GeneratedBatch[] = allItems.map(item => ({
      itemId: item.id,
      content: "",
      status: "pending" as const,
    }));
    setBatchResults(results);

    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      setCurrentIdx(i);
      setBatchResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "generating" } : r));

      try {
        const { data, error } = await supabase.functions.invoke("ai-chat", {
          body: {
            messages: [
              {
                role: "system",
                content: `Você é um auditor PEOTRAM sênior. Gere evidências OBJETIVAS e SUCINTAS para o item de checklist. Formato: lista de verificação em markdown. Máximo 300 palavras. Inclua: documentos a verificar, perguntas-chave para entrevista, e critério de conformidade.`,
              },
              {
                role: "user",
                content: `Elemento ${element.id} (${element.sigla}) - Item ${item.id}:
"${item.description}"
Evidências requeridas: ${item.evidences}
Normas: ${item.norms.join(", ")}
Embarcação: ${vesselName || "N/A"} | Auditor: ${auditorName || "N/A"}`,
              },
            ],
          },
        });

        if (error) throw error;
        const text = data?.choices?.[0]?.message?.content || data?.response || "";
        setBatchResults(prev => prev.map((r, idx) => idx === i ? { ...r, content: text, status: "done" } : r));
      } catch (err) {
        logger.error(`[AutoEvidence] Error on item ${item.id}`, err);
        setBatchResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "error", content: "Erro ao gerar" } : r));
      }
    }

    setIsRunning(false);
    toast.success(`Evidências geradas para ${allItems.length} itens do Elemento ${element.id}`);
  }, [element, allItems, vesselName, auditorName]);

  const completedCount = batchResults.filter(r => r.status === "done").length;
  const progress = batchResults.length > 0 ? Math.round((completedCount / batchResults.length) * 100) : 0;

  const copyAll = () => {
    const text = batchResults
      .filter(r => r.status === "done")
      .map(r => `## Item ${r.itemId}\n${r.content}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Todas evidências copiadas!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Zap className="h-6 w-6 text-warning" />
        <div>
          <h3 className="text-lg font-semibold">Motor de Evidências Automáticas</h3>
          <p className="text-sm text-muted-foreground">
            Gera evidências IA para TODOS os itens de um elemento automaticamente
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Elemento PEOTRAM</Label>
              <Select value={selectedElement} onValueChange={setSelectedElement}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o elemento..." />
                </SelectTrigger>
                <SelectContent>
                  {PEOTRAM_ELEMENTS.map(el => (
                    <SelectItem key={el.id} value={String(el.id)}>
                      {el.id}. {el.name} ({el.sigla})
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
              <Label>Auditor</Label>
              <Input value={auditorName} onChange={e => setAuditorName(e.target.value)} placeholder="Nome do auditor" />
            </div>
          </div>

          {element && (
            <p className="text-sm text-muted-foreground">
              {allItems.length} itens em {element.subelements.length} subelementos • Peso: {element.weightPercentage}%
              {element.isCritical && " • ELEMENTO CRÍTICO"}
            </p>
          )}

          <div className="flex gap-2">
            <Button onClick={runBatchGeneration} disabled={isRunning || !selectedElement} className="gap-2">
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isRunning ? `Gerando... (${currentIdx + 1}/${allItems.length})` : "Gerar Evidências para Todos os Itens"}
            </Button>
            {completedCount > 0 && (
              <Button variant="outline" onClick={copyAll} className="gap-1">
                <Copy className="h-4 w-4" /> Copiar Todas
              </Button>
            )}
          </div>

          {batchResults.length > 0 && (
            <>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{completedCount}/{batchResults.length} itens concluídos</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 [&>div]:bg-success" />
              </div>

              {/* Results grid */}
              <div className="flex gap-1 flex-wrap">
                {batchResults.map(r => (
                  <button
                    key={r.itemId}
                    onClick={() => setSelectedResult(selectedResult === r.itemId ? null : r.itemId)}
                    className={`w-10 h-8 rounded text-xs font-mono transition-all ${
                      r.status === "done" ? "bg-success/20 text-success hover:bg-success/30" :
                      r.status === "generating" ? "bg-primary/20 text-primary animate-pulse" :
                      r.status === "error" ? "bg-destructive/20 text-destructive" :
                      "bg-muted text-muted-foreground"
                    } ${selectedResult === r.itemId ? "ring-2 ring-primary" : ""}`}
                  >
                    {r.itemId}
                  </button>
                ))}
              </div>

              {/* Selected result detail */}
              {selectedResult && (
                <Card className="border-primary/20">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" />
                        Evidência Item {selectedResult}
                      </CardTitle>
                      <Button size="sm" variant="ghost" onClick={() => {
                        const r = batchResults.find(b => b.itemId === selectedResult);
                        if (r) { navigator.clipboard.writeText(r.content); toast.success("Copiado!"); }
                      }}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[300px]">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>
                          {batchResults.find(b => b.itemId === selectedResult)?.content || ""}
                        </ReactMarkdown>
                      </div>
                    </ScrollArea>
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

export default PeotramAutoEvidenceEngine;
