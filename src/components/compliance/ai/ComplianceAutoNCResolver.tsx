/**
 * ComplianceAutoNCResolver - AI-Powered NC Auto-Resolution Engine
 * When a Non-Conformity is identified, AI automatically generates:
 * - Root cause analysis (5-Why, Ishikawa)
 * - Corrective action plan with deadlines and responsibilities
 * - Required evidence list
 * - Text ready for auditor forms
 * - Preventive actions to avoid recurrence
 */
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import ReactMarkdown from "react-markdown";
import {
  AlertTriangle, Brain, Loader2, CheckCircle, XCircle, Target,
  FileText, Clock, Users, Sparkles, Copy, Download, Zap,
  ArrowRight, Shield, Search, GitBranch, Wrench
} from "lucide-react";

export interface ComplianceAutoNCResolverProps {
  moduleId: string;
  moduleName: string;
}

interface NCResolution {
  root_cause_analysis: {
    method: string;
    primary_cause: string;
    contributing_factors: string[];
    why_chain: string[];
  };
  corrective_actions: Array<{
    action: string;
    responsible: string;
    deadline: string;
    priority: "immediate" | "short_term" | "medium_term";
    evidence_required: string;
  }>;
  preventive_actions: string[];
  auditor_response_text: string;
  evidence_checklist: string[];
  estimated_closure_days: number;
  risk_if_unresolved: string;
  regulatory_references: string[];
}

const NC_SEVERITIES = [
  { value: "major", label: "Maior (Major NC)" },
  { value: "minor", label: "Menor (Minor NC / Observation)" },
  { value: "critical", label: "Crítica (Detention / Showstopper)" },
  { value: "observation", label: "Observação" },
];

const NC_SOURCES = [
  { value: "psc", label: "Port State Control (PSC)" },
  { value: "ism_audit", label: "Auditoria ISM" },
  { value: "isps_audit", label: "Verificação ISPS" },
  { value: "sire", label: "Inspeção SIRE" },
  { value: "ovid", label: "Inspeção OVID" },
  { value: "class", label: "Vistoria de Classe" },
  { value: "internal", label: "Auditoria Interna" },
  { value: "mlc", label: "Inspeção MLC" },
  { value: "peotram", label: "Auditoria PEOTRAM" },
  { value: "flag_state", label: "Flag State" },
];

export function ComplianceAutoNCResolver({
  moduleId,
  moduleName,
}: ComplianceAutoNCResolverProps) {
  const [ncDescription, setNcDescription] = useState("");
  const [ncSeverity, setNcSeverity] = useState("");
  const [ncSource, setNcSource] = useState("");
  const [ncArea, setNcArea] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resolution, setResolution] = useState<NCResolution | null>(null);

  // Fetch existing NCs for context
  const { data: existingNCs = [] } = useQuery({
    queryKey: ["nc-resolver-history", moduleId],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("non_conformities")
        .select("id, title, description, severity, source, status, root_cause, corrective_action")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    staleTime: 60000,
  });

  const resolveNC = useCallback(async () => {
    if (!ncDescription.trim()) {
      toast.error("Descreva a não-conformidade encontrada");
      return;
    }

    setIsResolving(true);
    setProgress(0);
    setResolution(null);

    try {
      setProgress(20);

      // Fetch historical patterns
      const historicalContext = existingNCs.slice(0, 5).map((nc: any) => 
        `NC: ${nc.title || nc.description?.slice(0, 100)} | Severidade: ${nc.severity} | Causa Raiz: ${nc.root_cause || "N/A"} | Ação Corretiva: ${nc.corrective_action || "N/A"}`
      ).join("\n");

      setProgress(40);

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            {
              role: "system",
              content: `Você é um especialista em resolução de não-conformidades marítimas com 20+ anos de experiência em ISM, ISPS, SOLAS, MLC, PEOTRAM, SIRE e PSC.

Sua tarefa é gerar uma RESOLUÇÃO COMPLETA para uma NC, pronta para uso pelo DPA/auditor.

FORMATO: Responda em JSON:
{
  "root_cause_analysis": {
    "method": "5-Why Analysis" ou "Ishikawa",
    "primary_cause": "causa raiz principal",
    "contributing_factors": ["fator 1", "fator 2"],
    "why_chain": ["Porquê 1", "Porquê 2", "Porquê 3", "Porquê 4", "Porquê 5 (causa raiz)"]
  },
  "corrective_actions": [
    {
      "action": "ação corretiva detalhada",
      "responsible": "cargo responsável (ex: Chief Officer, Chief Engineer, Master)",
      "deadline": "prazo (ex: 7 dias, 30 dias)",
      "priority": "immediate|short_term|medium_term",
      "evidence_required": "evidência necessária para fechar"
    }
  ],
  "preventive_actions": ["ação preventiva 1", "ação 2"],
  "auditor_response_text": "texto pronto para inserir no formulário do auditor/inspetor, em inglês técnico marítimo",
  "evidence_checklist": ["evidência 1", "evidência 2"],
  "estimated_closure_days": número,
  "risk_if_unresolved": "risco se não resolvida (ex: detenção, rejeição de vetting)",
  "regulatory_references": ["ISM Code 9.1", "SOLAS Ch.III Reg.20"]
}`,
            },
            {
              role: "user",
              content: `RESOLVA ESTA NC:

DESCRIÇÃO: ${ncDescription}
SEVERIDADE: ${ncSeverity || "Não classificada"}
FONTE: ${ncSource ? NC_SOURCES.find(s => s.value === ncSource)?.label : "Não especificada"}
ÁREA: ${ncArea || "Não especificada"}
MÓDULO: ${moduleName}

HISTÓRICO DE NCs SIMILARES:
${historicalContext || "Nenhum histórico disponível"}

Gere a resolução completa com análise de causa raiz, ações corretivas com prazos e responsáveis, e texto pronto para o auditor.`,
            },
          ],
        },
      });

      if (error) throw error;

      setProgress(80);

      const text = data?.choices?.[0]?.message?.content || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setResolution({
          root_cause_analysis: parsed.root_cause_analysis || { method: "5-Why", primary_cause: "", contributing_factors: [], why_chain: [] },
          corrective_actions: parsed.corrective_actions || [],
          preventive_actions: parsed.preventive_actions || [],
          auditor_response_text: parsed.auditor_response_text || "",
          evidence_checklist: parsed.evidence_checklist || [],
          estimated_closure_days: parsed.estimated_closure_days || 30,
          risk_if_unresolved: parsed.risk_if_unresolved || "",
          regulatory_references: parsed.regulatory_references || [],
        });
      }

      setProgress(100);
      toast.success("Resolução de NC gerada com sucesso!");
    } catch (err) {
      logger.error("[ComplianceAutoNCResolver]", err);
      toast.error("Erro ao resolver NC");
    } finally {
      setIsResolving(false);
    }
  }, [ncDescription, ncSeverity, ncSource, ncArea, moduleName, existingNCs]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "immediate": return "bg-destructive/20 text-destructive";
      case "short_term": return "bg-warning/20 text-warning";
      default: return "bg-primary/20 text-primary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-destructive/20 to-warning/10">
          <Wrench className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Auto-Resolução de NCs com IA
            <Badge className="bg-destructive/20 text-destructive text-xs">Revolucionário</Badge>
          </h3>
          <p className="text-sm text-muted-foreground">
            Gera causa raiz, ação corretiva, prazos, responsáveis e texto para o auditor automaticamente
          </p>
        </div>
      </div>

      {/* Progress */}
      {isResolving && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-5 w-5 animate-spin text-destructive" />
              <span className="text-sm font-medium">Analisando NC e gerando resolução completa...</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Input Form */}
      {!resolution && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Descreva a Não-Conformidade</CardTitle>
            <CardDescription>A IA analisará e gerará uma resolução completa com todos os elementos necessários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Descrição da NC *</Label>
              <Textarea
                value={ncDescription}
                onChange={e => setNcDescription(e.target.value)}
                placeholder="Ex: Durante inspeção PSC, constatou-se que o registro de horas de descanso do 2º Oficial não atende os requisitos STCW A-VIII/1..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Severidade</Label>
                <Select value={ncSeverity} onValueChange={setNcSeverity}>
                  <SelectTrigger><SelectValue placeholder="Classificar..." /></SelectTrigger>
                  <SelectContent>
                    {NC_SEVERITIES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fonte / Inspeção</Label>
                <Select value={ncSource} onValueChange={setNcSource}>
                  <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent>
                    {NC_SOURCES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Área Afetada</Label>
                <Input value={ncArea} onChange={e => setNcArea(e.target.value)} placeholder="Ex: Ponte, Praça de Máquinas, Convés" />
              </div>
            </div>
            <Button onClick={resolveNC} disabled={isResolving || !ncDescription.trim()} className="w-full gap-2" size="lg">
              {isResolving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Brain className="h-5 w-5" />}
              {isResolving ? "Resolvendo..." : "Resolver NC com IA"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resolution Results */}
      {resolution && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-4 pb-3 text-center">
                <Clock className="h-5 w-5 mx-auto text-destructive mb-1" />
                <p className="text-2xl font-bold">{resolution.estimated_closure_days}d</p>
                <p className="text-xs text-muted-foreground">Prazo Estimado</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <Target className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{resolution.corrective_actions.length}</p>
                <p className="text-xs text-muted-foreground">Ações Corretivas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <Shield className="h-5 w-5 mx-auto text-warning mb-1" />
                <p className="text-2xl font-bold">{resolution.preventive_actions.length}</p>
                <p className="text-xs text-muted-foreground">Ações Preventivas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <FileText className="h-5 w-5 mx-auto text-success mb-1" />
                <p className="text-2xl font-bold">{resolution.evidence_checklist.length}</p>
                <p className="text-xs text-muted-foreground">Evidências</p>
              </CardContent>
            </Card>
          </div>

          {/* Root Cause Analysis */}
          <Card className="border-warning/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-warning" /> Análise de Causa Raiz ({resolution.root_cause_analysis.method})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-warning/5 border border-warning/10">
                <p className="text-sm font-medium">Causa Raiz Principal:</p>
                <p className="text-sm mt-1">{resolution.root_cause_analysis.primary_cause}</p>
              </div>
              {resolution.root_cause_analysis.why_chain.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Cadeia dos 5 Porquês:</p>
                  {resolution.root_cause_analysis.why_chain.map((why, i) => (
                    <div key={i} className="flex items-start gap-2 ml-2">
                      <Badge variant="outline" className="shrink-0 text-xs">{i + 1}º</Badge>
                      <span className="text-sm">{why}</span>
                    </div>
                  ))}
                </div>
              )}
              {resolution.root_cause_analysis.contributing_factors.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Fatores Contribuintes:</p>
                  {resolution.root_cause_analysis.contributing_factors.map((f, i) => (
                    <p key={i} className="text-sm text-muted-foreground ml-2">• {f}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Corrective Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Ações Corretivas ({resolution.corrective_actions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resolution.corrective_actions.map((action, i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <Badge className={`shrink-0 ${getPriorityColor(action.priority)}`}>
                          {action.priority === "immediate" ? "Imediata" : action.priority === "short_term" ? "Curto Prazo" : "Médio Prazo"}
                        </Badge>
                        <p className="text-sm font-medium">{action.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {action.responsible}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {action.deadline}</span>
                    </div>
                    <p className="text-xs text-muted-foreground"><strong>Evidência:</strong> {action.evidence_required}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Auditor Response Text - THE KILLER FEATURE */}
          {resolution.auditor_response_text && (
            <Card className="border-success/20 bg-success/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-5 w-5 text-success" /> Texto Pronto para o Auditor
                    <Badge className="bg-success/20 text-success text-xs">Copiar e Colar</Badge>
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(resolution.auditor_response_text)} className="gap-1">
                    <Copy className="h-3 w-3" /> Copiar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-background border text-sm whitespace-pre-wrap font-mono">
                  {resolution.auditor_response_text}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evidence Checklist + Preventive Actions + References */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> Evidências Necessárias</CardTitle>
              </CardHeader>
              <CardContent>
                {resolution.evidence_checklist.map((ev, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm mb-2">
                    <CheckCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{ev}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-warning" /> Ações Preventivas</CardTitle>
              </CardHeader>
              <CardContent>
                {resolution.preventive_actions.map((pa, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm mb-2">
                    <ArrowRight className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                    <span>{pa}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Search className="h-4 w-4 text-primary" /> Referências</CardTitle>
              </CardHeader>
              <CardContent>
                {resolution.regulatory_references.map((ref, i) => (
                  <Badge key={i} variant="outline" className="mr-1 mb-1 text-xs">{ref}</Badge>
                ))}
                {resolution.risk_if_unresolved && (
                  <div className="mt-3 p-2 rounded bg-destructive/5 border border-destructive/10">
                    <p className="text-xs font-medium text-destructive">⚠️ Risco se não resolvida:</p>
                    <p className="text-xs text-muted-foreground">{resolution.risk_if_unresolved}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* New NC button */}
          <Button variant="outline" onClick={() => { setResolution(null); setNcDescription(""); }} className="gap-2">
            <AlertTriangle className="h-4 w-4" /> Resolver Outra NC
          </Button>
        </>
      )}
    </div>
  );
}