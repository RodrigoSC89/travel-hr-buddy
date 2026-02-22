/**
 * PEOTRAM NC Auto-Generator - AI-powered Non-Conformity creation
 * Generates NCs with classification, root cause analysis, corrective actions and deadlines
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
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle, Loader2, FileText, Sparkles, Copy, Save,
  Clock, User, CheckCircle, XCircle, ArrowRight, Scale
} from "lucide-react";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { logger } from "@/lib/logger";
import { PEOTRAM_ELEMENTS, NC_CLASSIFICATIONS, SCORE_CRITERIA } from "@/data/peotram-elements-data";
import type { ScoreValue } from "@/data/peotram-elements-data";

interface GeneratedNC {
  itemId: string;
  title: string;
  description: string;
  classification: "A" | "B" | "C" | "D";
  rootCause: string;
  correctiveActions: string[];
  preventiveActions: string[];
  deadline: string;
  responsibleArea: string;
  status: "pending" | "generating" | "done" | "error";
}

interface PeotramNCAutoGeneratorProps {
  vesselName?: string;
  auditorName?: string;
  itemStates?: Record<string, { score: ScoreValue; observations: string; ncClassification: string | null }>;
}

export function PeotramNCAutoGenerator({ vesselName: propVessel, auditorName: propAuditor, itemStates: propItemStates }: PeotramNCAutoGeneratorProps = {}) {
  const [selectedElement, setSelectedElement] = useState("");
  const [vesselName, setVesselName] = useState(propVessel || "");
  const [auditorName, setAuditorName] = useState(propAuditor || "");
  // Use real scores from active audit if available
  const externalScores: Record<string, ScoreValue> = propItemStates
    ? Object.fromEntries(Object.entries(propItemStates).map(([k, v]) => [k, v.score]))
    : {};
  const [itemScores, setItemScores] = useState<Record<string, ScoreValue>>(externalScores);
  const [generatedNCs, setGeneratedNCs] = useState<GeneratedNC[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedNC, setSelectedNC] = useState<string | null>(null);

  const element = PEOTRAM_ELEMENTS.find(e => String(e.id) === selectedElement);
  const allItems = element?.subelements.flatMap(s => s.items) || [];
  const lowScoreItems = allItems.filter(item => {
    const score = itemScores[item.id];
    return typeof score === "number" && score <= 2;
  });

  const setScore = (itemId: string, score: ScoreValue) => {
    setItemScores(prev => ({ ...prev, [itemId]: score }));
  };

  const generateNCs = useCallback(async () => {
    if (!element || lowScoreItems.length === 0) {
      toast.error(lowScoreItems.length === 0 ? "Nenhum item com nota ≤ 2 para gerar NC" : "Selecione um elemento");
      return;
    }

    setIsRunning(true);
    const results: GeneratedNC[] = lowScoreItems.map(item => ({
      itemId: item.id, title: "", description: "", classification: "D" as const,
      rootCause: "", correctiveActions: [], preventiveActions: [],
      deadline: "", responsibleArea: "", status: "pending" as const,
    }));
    setGeneratedNCs(results);

    for (let i = 0; i < lowScoreItems.length; i++) {
      const item = lowScoreItems[i];
      const score = itemScores[item.id];
      setGeneratedNCs(prev => prev.map((r, idx) => idx === i ? { ...r, status: "generating" } : r));

      try {
        const { data, error } = await supabase.functions.invoke("ai-chat", {
          body: {
            messages: [
              {
                role: "system",
                content: `Você é um auditor PEOTRAM sênior especializado em classificação de Não Conformidades conforme Petrobras.
Gere uma NC completa em JSON com a estrutura:
{"title":"título curto","description":"descrição detalhada do desvio encontrado","classification":"A|B|C|D","rootCause":"análise de causa raiz","correctiveActions":["ação 1"],"preventiveActions":["ação 1"],"deadline":"prazo em dias","responsibleArea":"área responsável"}

Critérios de classificação:
- A: Risco iminente. Comunicação imediata. Prazo 10 dias.
- B: Falha sistêmica/recorrente. Prazo 15 dias.
- C: Atendimento parcial/insuficiente. Prazo 30 dias.
- D: Desvio isolado. Prazo 60 dias.

Para nota 0 (não implantado): classificar como A ou B.
Para nota 1 (falhas sistemáticas): classificar como B.
Para nota 2 (falhas pontuais): classificar como C ou D.`
              },
              {
                role: "user",
                content: `Gere NC PEOTRAM para:
Elemento ${element.id}: ${element.name} (${element.sigla})
Item ${item.id}: ${item.description}
Evidências requeridas: ${item.evidences}
Normas: ${item.norms.join(", ")}
Nota atribuída: ${score} - ${SCORE_CRITERIA[String(score)]?.description}
Item Crítico: ${item.isCritical ? "SIM" : "NÃO"}
Embarcação: ${vesselName || "N/A"}
Auditor: ${auditorName || "N/A"}`
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
        } catch { parsed = { title: `NC - Item ${item.id}`, description: raw }; }

        setGeneratedNCs(prev => prev.map((r, idx) => idx === i ? {
          ...r,
          title: parsed.title || `NC - Item ${item.id}`,
          description: parsed.description || "",
          classification: (["A", "B", "C", "D"].includes(parsed.classification) ? parsed.classification : "D") as "A" | "B" | "C" | "D",
          rootCause: parsed.rootCause || "",
          correctiveActions: parsed.correctiveActions || [],
          preventiveActions: parsed.preventiveActions || [],
          deadline: parsed.deadline || NC_CLASSIFICATIONS[parsed.classification as keyof typeof NC_CLASSIFICATIONS]?.deadline || "30 dias",
          responsibleArea: parsed.responsibleArea || "",
          status: "done",
        } : r));
      } catch (err) {
        logger.error(`[NCAutoGen] Error on item ${item.id}`, err);
        setGeneratedNCs(prev => prev.map((r, idx) => idx === i ? { ...r, status: "error" } : r));
      }
    }

    setIsRunning(false);
    toast.success(`${lowScoreItems.length} NCs geradas automaticamente`);
  }, [element, lowScoreItems, itemScores, vesselName, auditorName]);

  const saveNCToSupabase = async (nc: GeneratedNC) => {
    try {
      await fromUntyped("non_conformities").insert({
        title: nc.title,
        description: nc.description,
        nc_type: nc.classification,
        source: `PEOTRAM - Elemento ${element?.id} (${element?.sigla})`,
        status: "open",
        severity: nc.classification === "A" ? "critical" : nc.classification === "B" ? "high" : nc.classification === "C" ? "medium" : "low",
        root_cause: nc.rootCause,
        corrective_action: nc.correctiveActions.join("\n"),
        preventive_action: nc.preventiveActions.join("\n"),
      });
      toast.success(`NC "${nc.title}" salva no sistema`);
    } catch (err) {
      toast.error("Erro ao salvar NC");
    }
  };

  const copyAllNCs = () => {
    const text = generatedNCs.filter(nc => nc.status === "done")
      .map(nc => `## ${nc.title}\n**Classificação:** ${nc.classification} - ${NC_CLASSIFICATIONS[nc.classification]?.label}\n**Prazo:** ${nc.deadline}\n**Descrição:** ${nc.description}\n**Causa Raiz:** ${nc.rootCause}\n**Ações Corretivas:**\n${nc.correctiveActions.map(a => `- ${a}`).join("\n")}\n**Ações Preventivas:**\n${nc.preventiveActions.map(a => `- ${a}`).join("\n")}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    toast.success("NCs copiadas!");
  };

  const completedCount = generatedNCs.filter(r => r.status === "done").length;
  const selected = selectedNC ? generatedNCs.find(nc => nc.itemId === selectedNC) : null;

  const getClassColor = (c: string) => {
    if (c === "A") return "bg-destructive text-destructive-foreground";
    if (c === "B") return "bg-destructive/80 text-destructive-foreground";
    if (c === "C") return "bg-warning text-warning-foreground";
    return "bg-muted text-foreground";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-destructive" />
        <div>
          <h3 className="text-lg font-semibold">Gerador Automático de NCs</h3>
          <p className="text-sm text-muted-foreground">
            Atribua notas ≤ 2 aos itens e a IA gera NCs completas com classificação, causa raiz e plano de ação
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Elemento PEOTRAM</Label>
              <Select value={selectedElement} onValueChange={v => { setSelectedElement(v); setItemScores({}); setGeneratedNCs([]); }}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {PEOTRAM_ELEMENTS.map(el => (
                    <SelectItem key={el.id} value={String(el.id)}>{el.id}. {el.sigla} - {el.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Embarcação</Label>
              <Input value={vesselName} onChange={e => setVesselName(e.target.value)} placeholder="Nome" />
            </div>
            <div className="space-y-2">
              <Label>Auditor</Label>
              <Input value={auditorName} onChange={e => setAuditorName(e.target.value)} placeholder="Nome" />
            </div>
          </div>

          {/* Quick score assignment */}
          {element && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Atribua notas rápidas (itens com nota ≤ 2 terão NC gerada):</p>
              <ScrollArea className="h-[250px]">
                <div className="space-y-1 pr-2">
                  {allItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2 p-2 border rounded hover:bg-muted/30 transition-colors">
                      <span className="font-mono text-xs w-12 shrink-0">{item.id}</span>
                      <p className="text-xs flex-1 line-clamp-1">{item.description}</p>
                      <div className="flex gap-0.5 shrink-0">
                        {([0, 1, 2, 3, 4] as ScoreValue[]).map(s => (
                          <button
                            key={String(s)}
                            onClick={() => setScore(item.id, s)}
                            className={`w-6 h-6 rounded text-[10px] font-bold transition-all ${
                              itemScores[item.id] === s
                                ? (s as number) <= 1 ? "bg-destructive text-destructive-foreground"
                                : s === 2 ? "bg-warning text-warning-foreground"
                                : "bg-success text-success-foreground"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {lowScoreItems.length} itens com nota ≤ 2 → NCs a gerar
                </p>
                <div className="flex gap-2">
                  {completedCount > 0 && (
                    <Button variant="outline" size="sm" onClick={copyAllNCs} className="gap-1 text-xs">
                      <Copy className="h-3 w-3" /> Copiar Todas
                    </Button>
                  )}
                  <Button onClick={generateNCs} disabled={isRunning || lowScoreItems.length === 0} size="sm" className="gap-1">
                    {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    Gerar {lowScoreItems.length} NCs
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Generated NCs */}
          {generatedNCs.length > 0 && (
            <div className="space-y-3">
              <Separator />
              <div className="flex gap-1 flex-wrap">
                {generatedNCs.map(nc => (
                  <button
                    key={nc.itemId}
                    onClick={() => setSelectedNC(selectedNC === nc.itemId ? null : nc.itemId)}
                    className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                      nc.status === "done" ? getClassColor(nc.classification) :
                      nc.status === "generating" ? "bg-primary/20 text-primary animate-pulse" :
                      "bg-muted text-muted-foreground"
                    } ${selectedNC === nc.itemId ? "ring-2 ring-foreground" : ""}`}
                  >
                    {nc.itemId} {nc.status === "done" && `(${nc.classification})`}
                  </button>
                ))}
              </div>

              {selected && selected.status === "done" && (
                <Card className="border-destructive/30">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{selected.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getClassColor(selected.classification)}>
                          {selected.classification} - {NC_CLASSIFICATIONS[selected.classification]?.label}
                        </Badge>
                        <Button size="sm" variant="outline" className="h-6 text-xs gap-1" onClick={() => saveNCToSupabase(selected)}>
                          <Save className="h-3 w-3" /> Salvar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div>
                      <p className="font-semibold mb-1">Descrição do Desvio:</p>
                      <p className="text-muted-foreground">{selected.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> Prazo: <strong>{selected.deadline}</strong></div>
                      <div className="flex items-center gap-1"><User className="h-3 w-3" /> {selected.responsibleArea || "A definir"}</div>
                    </div>
                    <Separator />
                    <div>
                      <p className="font-semibold mb-1 flex items-center gap-1"><Scale className="h-3 w-3" /> Causa Raiz:</p>
                      <p className="text-muted-foreground">{selected.rootCause}</p>
                    </div>
                    {selected.correctiveActions.length > 0 && (
                      <div>
                        <p className="font-semibold mb-1 flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive" /> Ações Corretivas:</p>
                        <ul className="space-y-1">{selected.correctiveActions.map((a) => (
                          <li key={a} className="text-muted-foreground flex items-start gap-1"><ArrowRight className="h-3 w-3 shrink-0 mt-0.5" />{a}</li>
                        ))}</ul>
                      </div>
                    )}
                    {selected.preventiveActions.length > 0 && (
                      <div>
                        <p className="font-semibold mb-1 flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" /> Ações Preventivas:</p>
                        <ul className="space-y-1">{selected.preventiveActions.map((a) => (
                          <li key={a} className="text-muted-foreground flex items-start gap-1"><ArrowRight className="h-3 w-3 shrink-0 mt-0.5" />{a}</li>
                        ))}</ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PeotramNCAutoGenerator;
