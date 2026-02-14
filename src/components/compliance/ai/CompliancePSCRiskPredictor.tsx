/**
 * CompliancePSCRiskPredictor - AI-Powered PSC Detention Risk Predictor
 * Predicts PSC detention probability based on vessel data, history, port profile
 * Includes real-time risk score and automatic mitigation plan
 */
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import ReactMarkdown from "react-markdown";
import {
  Shield, AlertTriangle, Loader2, Brain, Sparkles, Target,
  Ship, Anchor, MapPin, TrendingDown, TrendingUp, CheckCircle,
  XCircle, BarChart3, Zap, Clock, FileCheck, Activity
} from "lucide-react";

export interface CompliancePSCRiskPredictorProps {
  moduleId: string;
  moduleName: string;
}

interface RiskPrediction {
  detention_probability: number;
  risk_level: "very_low" | "low" | "medium" | "high" | "critical";
  risk_score: number;
  risk_factors: Array<{
    factor: string;
    impact: "high" | "medium" | "low";
    score: number;
    mitigation: string;
  }>;
  historical_context: string;
  port_risk_profile: string;
  mitigation_plan: Array<{
    action: string;
    priority: "immediate" | "before_arrival" | "ongoing";
    responsible: string;
    estimated_time: string;
  }>;
  pre_arrival_checklist: string[];
  ai_recommendation: string;
}

const MOU_REGIMES = [
  { value: "paris", label: "Paris MoU (Europe)" },
  { value: "tokyo", label: "Tokyo MoU (Asia-Pacific)" },
  { value: "uscg", label: "US Coast Guard" },
  { value: "amsa", label: "AMSA (Australia)" },
  { value: "indian", label: "Indian Ocean MoU" },
  { value: "abuja", label: "Abuja MoU (West Africa)" },
  { value: "vina", label: "Viña del Mar (Latin America)" },
  { value: "riyadh", label: "Riyadh MoU (Gulf States)" },
  { value: "black_sea", label: "Black Sea MoU" },
  { value: "mediterranean", label: "Mediterranean MoU" },
];

export function CompliancePSCRiskPredictor({
  moduleId,
  moduleName,
}: CompliancePSCRiskPredictorProps) {
  const [vesselName, setVesselName] = useState("");
  const [targetPort, setTargetPort] = useState("");
  const [mouRegime, setMouRegime] = useState("");
  const [vesselAge, setVesselAge] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);

  // Fetch vessel data for context
  const { data: vesselData = [] } = useQuery({
    queryKey: ["psc-predictor-vessels"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("vessels")
        .select("id, name, vessel_type, flag_state, imo_number, status, built_year")
        .limit(20);
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: pscHistory = [] } = useQuery({
    queryKey: ["psc-predictor-history"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("psc_inspections")
        .select("id, inspection_date, port, result, deficiencies_count, detained, inspection_type")
        .order("inspection_date", { ascending: false })
        .limit(20);
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: complianceData = [] } = useQuery({
    queryKey: ["psc-predictor-compliance"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("compliance_items")
        .select("id, status, regulation_reference")
        .limit(100);
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: openNCs = [] } = useQuery({
    queryKey: ["psc-predictor-ncs"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("non_conformities")
        .select("id, severity, status, source")
        .eq("status", "open")
        .limit(50);
      return data || [];
    },
    staleTime: 60000,
  });

  const runPrediction = useCallback(async () => {
    setIsPredicting(true);
    setProgress(0);
    setPrediction(null);

    try {
      setProgress(20);

      const sgiContext = {
        vessels: vesselData.length,
        psc_inspections: pscHistory.length,
        detentions: pscHistory.filter((p: any) => p.detained).length,
        avg_deficiencies: pscHistory.length > 0 ? Math.round(pscHistory.reduce((a: number, p: any) => a + (p.deficiencies_count || 0), 0) / pscHistory.length) : 0,
        compliance_items: complianceData.length,
        compliant: complianceData.filter((c: any) => c.status === "compliant").length,
        open_ncs: openNCs.length,
        nc_by_severity: openNCs.reduce((acc: Record<string, number>, n: any) => { acc[n.severity || "minor"] = (acc[n.severity || "minor"] || 0) + 1; return acc; }, {}),
        recent_psc: pscHistory.slice(0, 5).map((p: any) => ({
          date: p.inspection_date,
          port: p.port,
          result: p.result,
          deficiencies: p.deficiencies_count,
          detained: p.detained,
        })),
      };

      setProgress(50);

      const mouLabel = MOU_REGIMES.find(m => m.value === mouRegime)?.label || mouRegime || "Não especificado";

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            {
              role: "system",
              content: `Você é um especialista em Port State Control (PSC) com conhecimento profundo dos regimes MoU, targeting systems e estatísticas de detenção.

DADOS DA INDÚSTRIA (2024/2025):
- Taxa média de detenção Paris MoU: ~3.5%
- Taxa média Tokyo MoU: ~4.2%
- USCG detention: ~1.8%
- Navios >15 anos têm 2x mais chance de detenção
- Top deficiências: Fire safety, ISM, Navigation, Life-saving, MLC

Analise os dados da embarcação e PREVEJA o risco de detenção PSC.

Responda em JSON:
{
  "detention_probability": 0-100 (probabilidade percentual),
  "risk_level": "very_low|low|medium|high|critical",
  "risk_score": 0-100,
  "risk_factors": [
    {"factor": "nome do fator", "impact": "high|medium|low", "score": 0-100, "mitigation": "ação para mitigar"}
  ],
  "historical_context": "análise do histórico em markdown",
  "port_risk_profile": "perfil de risco do porto/regime MoU",
  "mitigation_plan": [
    {"action": "ação de mitigação", "priority": "immediate|before_arrival|ongoing", "responsible": "cargo", "estimated_time": "tempo"}
  ],
  "pre_arrival_checklist": ["item 1", "item 2"],
  "ai_recommendation": "recomendação executiva em markdown"
}`,
            },
            {
              role: "user",
              content: `PREVEJA O RISCO DE DETENÇÃO PSC:

EMBARCAÇÃO: ${vesselName || "N/A"}
PORTO DESTINO: ${targetPort || "N/A"}
REGIME MoU: ${mouLabel}
IDADE DO NAVIO: ${vesselAge ? `${vesselAge} anos` : "N/A"}

DADOS SGI:
${JSON.stringify(sgiContext, null, 2)}

Calcule a probabilidade de detenção e gere o plano de mitigação completo.`,
            },
          ],
        },
      });

      if (error) throw error;

      setProgress(90);

      const text = data?.choices?.[0]?.message?.content || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setPrediction({
          detention_probability: parsed.detention_probability || 5,
          risk_level: parsed.risk_level || "low",
          risk_score: parsed.risk_score || 20,
          risk_factors: parsed.risk_factors || [],
          historical_context: parsed.historical_context || "",
          port_risk_profile: parsed.port_risk_profile || "",
          mitigation_plan: parsed.mitigation_plan || [],
          pre_arrival_checklist: parsed.pre_arrival_checklist || [],
          ai_recommendation: parsed.ai_recommendation || "",
        });
      }

      setProgress(100);
      toast.success("Predição de risco concluída!");
    } catch (err) {
      logger.error("[CompliancePSCRiskPredictor]", err);
      toast.error("Erro na predição de risco");
    } finally {
      setIsPredicting(false);
    }
  }, [vesselName, targetPort, mouRegime, vesselAge, vesselData, pscHistory, complianceData, openNCs]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "very_low": return "text-success";
      case "low": return "text-success";
      case "medium": return "text-warning";
      case "high": return "text-destructive";
      case "critical": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case "very_low": case "low": return "bg-success/20 text-success";
      case "medium": return "bg-warning/20 text-warning";
      case "high": case "critical": return "bg-destructive/20 text-destructive";
      default: return "bg-muted";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-destructive/20 text-destructive";
      case "medium": return "bg-warning/20 text-warning";
      default: return "bg-success/20 text-success";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-destructive/20 to-warning/10">
          <Shield className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Predição de Risco PSC / Detenção
            <Badge className="bg-destructive/20 text-destructive text-xs">IA Preditiva</Badge>
          </h3>
          <p className="text-sm text-muted-foreground">
            Prevê probabilidade de detenção com base em dados do navio, histórico e perfil do porto
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Ship className="h-3 w-3" /> Inspeções PSC</p>
            <p className="text-2xl font-bold">{pscHistory.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-destructive" /> Detenções</p>
            <p className="text-2xl font-bold text-destructive">{pscHistory.filter((p: any) => p.detained).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><XCircle className="h-3 w-3 text-warning" /> NCs Abertas</p>
            <p className="text-2xl font-bold text-warning">{openNCs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Média Deficiências</p>
            <p className="text-2xl font-bold">
              {pscHistory.length > 0 ? Math.round(pscHistory.reduce((a: number, p: any) => a + (p.deficiencies_count || 0), 0) / pscHistory.length) : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {isPredicting && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Calculando probabilidade de detenção...</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Input Form */}
      {!prediction && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parâmetros de Predição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Embarcação</Label>
                <Input value={vesselName} onChange={e => setVesselName(e.target.value)} placeholder="Nome da embarcação" />
              </div>
              <div>
                <Label>Porto de Destino</Label>
                <Input value={targetPort} onChange={e => setTargetPort(e.target.value)} placeholder="Ex: Rotterdam, Singapore, Santos" />
              </div>
              <div>
                <Label>Regime MoU</Label>
                <Select value={mouRegime} onValueChange={setMouRegime}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {MOU_REGIMES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Idade do Navio (anos)</Label>
                <Input type="number" value={vesselAge} onChange={e => setVesselAge(e.target.value)} placeholder="Ex: 12" />
              </div>
            </div>
            <Button onClick={runPrediction} disabled={isPredicting} className="w-full gap-2" size="lg">
              {isPredicting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Brain className="h-5 w-5" />}
              {isPredicting ? "Calculando..." : "Prever Risco de Detenção"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Prediction Results */}
      {prediction && (
        <>
          {/* Main Risk Display */}
          <Card className={`border-2 ${prediction.risk_level === "critical" || prediction.risk_level === "high" ? "border-destructive/50 bg-destructive/5" : prediction.risk_level === "medium" ? "border-warning/50 bg-warning/5" : "border-success/50 bg-success/5"}`}>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Probabilidade de Detenção PSC</p>
                <p className={`text-7xl font-bold ${getRiskColor(prediction.risk_level)}`}>
                  {prediction.detention_probability}%
                </p>
                <Badge className={`mt-3 text-sm px-4 py-1 ${getRiskBadgeColor(prediction.risk_level)}`}>
                  {prediction.risk_level === "very_low" ? "Risco Muito Baixo" :
                   prediction.risk_level === "low" ? "Risco Baixo" :
                   prediction.risk_level === "medium" ? "Risco Moderado" :
                   prediction.risk_level === "high" ? "Risco Alto" : "Risco Crítico"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">Risk Score: {prediction.risk_score}/100</p>
                <Progress value={prediction.detention_probability} className="mt-3 h-3 max-w-md mx-auto" />
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors */}
          {prediction.risk_factors.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-warning" /> Fatores de Risco ({prediction.risk_factors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prediction.risk_factors.map((rf, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{rf.factor}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getImpactColor(rf.impact)}`}>
                            {rf.impact === "high" ? "Alto" : rf.impact === "medium" ? "Médio" : "Baixo"}
                          </Badge>
                          <span className="text-sm font-bold">{rf.score}</span>
                        </div>
                      </div>
                      <Progress value={rf.score} className="h-1.5 mb-1" />
                      <p className="text-xs text-muted-foreground">💡 {rf.mitigation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mitigation Plan */}
          {prediction.mitigation_plan.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" /> Plano de Mitigação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {prediction.mitigation_plan.map((m, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Badge className={`shrink-0 text-xs ${
                        m.priority === "immediate" ? "bg-destructive/20 text-destructive" :
                        m.priority === "before_arrival" ? "bg-warning/20 text-warning" :
                        "bg-primary/20 text-primary"
                      }`}>
                        {m.priority === "immediate" ? "Imediato" : m.priority === "before_arrival" ? "Pré-Chegada" : "Contínuo"}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm">{m.action}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{m.responsible} • {m.estimated_time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Recommendation + Pre-arrival Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {prediction.ai_recommendation && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Recomendação IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{prediction.ai_recommendation}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
            {prediction.pre_arrival_checklist.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><FileCheck className="h-4 w-4 text-success" /> Checklist Pré-Chegada</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    {prediction.pre_arrival_checklist.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2 text-sm">
                        <CheckCircle className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          <Button variant="outline" onClick={() => setPrediction(null)} className="gap-2">
            <Activity className="h-4 w-4" /> Nova Predição
          </Button>
        </>
      )}
    </div>
  );
}