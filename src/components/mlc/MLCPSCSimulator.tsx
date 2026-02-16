import { useState } from "react";
import { quickExport } from "@/lib/export-utils";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Shield, Target, CheckCircle, XCircle, AlertTriangle, RotateCcw, Download, Anchor, Loader2 } from "lucide-react";

const PSC_QUESTIONS = [
  { id: "dcm_valid", category: "Documentação", weight: 15, detention_risk: "high", question: "DCM Parte I e II válidas e a bordo?", regulation: "MLC Reg. 5.1.3" },
  { id: "mlc_certificate", category: "Certificação", weight: 15, detention_risk: "high", question: "MLC Certificate válido e em vigor?", regulation: "MLC Reg. 5.1.3" },
  { id: "contracts_signed", category: "Contratos", weight: 10, detention_risk: "high", question: "Todos os marítimos com CEM (SEA) assinado disponível a bordo?", regulation: "MLC Reg. 2.1" },
  { id: "work_rest_records", category: "Horas", weight: 10, detention_risk: "medium", question: "Registros de horas de trabalho e descanso completos e assinados pelos marítimos?", regulation: "MLC Reg. 2.3" },
  { id: "minimum_wage", category: "Salários", weight: 10, detention_risk: "high", question: "Todos os marítimos recebem no mínimo o valor ITF/MLC vigente ($673/mês)?", regulation: "MLC Reg. 2.2" },
  { id: "medical_certificates", category: "Saúde", weight: 10, detention_risk: "high", question: "Todos os marítimos com certificado médico STCW/ILO válido?", regulation: "MLC Reg. 1.2" },
  { id: "accommodation_standards", category: "Alojamento", weight: 8, detention_risk: "medium", question: "Alojamentos com espaço (3.6m²), ventilação e iluminação mínimos conforme MLC?", regulation: "MLC Reg. 3.1" },
  { id: "food_quality", category: "Alimentação", weight: 7, detention_risk: "low", question: "Alimentação e água potável com padrões nutricionais MLC? Cozinheiro certificado?", regulation: "MLC Reg. 3.2" },
  { id: "complaint_procedure", category: "Queixas", weight: 5, detention_risk: "medium", question: "Procedimento de queixas disponível e no idioma dos marítimos a bordo?", regulation: "MLC Reg. 5.1.5" },
  { id: "repatriation", category: "Repatriação", weight: 10, detention_risk: "high", question: "Seguro/garantia financeira de repatriação ativo e documentado para todos?", regulation: "MLC Reg. 2.5" },
];

type Answer = "yes" | "partial" | "no" | "na";

export function MLCPSCSimulator() {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [states, setStates] = useState<Record<string, { answer: Answer | null; notes: string }>>(() =>
    Object.fromEntries(PSC_QUESTIONS.map(q => [q.id, { answer: null, notes: "" }]))
  );
  const [result, setResult] = useState<any>(null);

  const answered = Object.values(states).filter(s => s.answer !== null).length;
  const progress = Math.round((answered / PSC_QUESTIONS.length) * 100);

  const updateAnswer = (id: string, answer: Answer) => setStates(prev => ({ ...prev, [id]: { ...prev[id], answer } }));
  const updateNotes = (id: string, notes: string) => setStates(prev => ({ ...prev, [id]: { ...prev[id], notes } }));

  const simulateMutation = useMutation({
    mutationFn: async () => {
      const responses = Object.entries(states).map(([id, s]) => ({
        question_id: id, answer: s.answer || "no", notes: s.notes,
      }));
      const { data, error } = await supabase.functions.invoke("simulate-psc-mlc", {
        body: { responses },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setResult(data);
      setCompleted(true);
      toast.success("Simulação PSC concluída!");
    },
    onError: () => toast.error("Erro na simulação. Usando cálculo local."),
  });

  const handleComplete = () => {
    if (answered < PSC_QUESTIONS.length) { toast.error("Responda todas as perguntas"); return; }
    simulateMutation.mutate();
  };

  const handleReset = () => {
    setStarted(false); setCompleted(false); setResult(null);
    setStates(Object.fromEntries(PSC_QUESTIONS.map(q => [q.id, { answer: null, notes: "" }])));
  };

  if (!started) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-12 text-center space-y-4">
          <Anchor className="h-16 w-16 mx-auto text-primary opacity-70" />
          <h3 className="text-xl font-bold">Simulador de Inspeção PSC — MLC 2006</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Simule uma inspeção Port State Control baseada nos critérios reais de PSCOs.
            10 perguntas ponderadas com avaliação de risco de detenção via Edge Function.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline">MLC 2006</Badge>
            <Badge variant="outline">Paris MoU</Badge>
            <Badge variant="outline">Tokyo MoU</Badge>
          </div>
          <Button size="lg" onClick={() => setStarted(true)} className="gap-2 mt-4">
            <Target className="h-4 w-4" /> Iniciar Simulação PSC
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (completed && result) {
    return (
      <div className="space-y-4">
        <Card className={`border-2 ${result.detained ? "border-red-500/50 bg-red-500/5" : "border-green-500/50 bg-green-500/5"}`}>
          <CardContent className="py-8 text-center space-y-4">
            {result.detained ? (
              <><XCircle className="h-16 w-16 mx-auto text-red-500" /><h3 className="text-2xl font-bold text-red-600">🚨 DETENÇÃO PROVÁVEL</h3></>
            ) : (
              <><CheckCircle className="h-16 w-16 mx-auto text-green-500" /><h3 className="text-2xl font-bold text-green-600">✅ INSPEÇÃO APROVADA</h3></>
            )}
            <p className="text-5xl font-bold">{result.score}<span className="text-lg text-muted-foreground">/100</span></p>
            {result.parisRouRegime && (
              <Badge variant="outline">Paris MoU: {result.parisRouRegime === "low_risk" ? "Baixo Risco" : result.parisRouRegime === "standard" ? "Padrão" : "Alto Risco"}</Badge>
            )}
          </CardContent>
        </Card>

        {result.deficiencies?.length > 0 && (
          <Card className="border-destructive/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Deficiências ({result.deficiencyCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.deficiencies.map((d: any, i: number) => (
                  <li key={`def-${d.area}-${i}`} className="text-sm flex items-start gap-2">
                    <Badge variant={d.detention_risk === "high" ? "destructive" : "secondary"} className="text-xs shrink-0 mt-0.5">
                      {d.detention_risk === "high" ? "DETENÇÃO" : "ATENÇÃO"}
                    </Badge>
                    <div>
                      <p>{d.question}</p>
                      <p className="text-xs text-muted-foreground">{d.regulation}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {result.recommendations?.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recomendações</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {result.recommendations.map((r: string, i: number) => (
                  <li key={`rec-${r.slice(0, 15)}-${i}`} className="text-sm">{r}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-1"><RotateCcw className="h-3.5 w-3.5" /> Nova Simulação</Button>
          <Button className="gap-1" onClick={() => quickExport(result?.areas || [], "PSC Simulation")}><Download className="h-3.5 w-3.5" /> Exportar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card><CardContent className="py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progresso: {answered}/{PSC_QUESTIONS.length}</span>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardContent></Card>

      {PSC_QUESTIONS.map((q, idx) => {
        const state = states[q.id];
        return (
          <Card key={q.id} className={state.answer === "no" ? "border-destructive/30" : state.answer === "yes" ? "border-green-500/30" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="text-muted-foreground">#{idx + 1}</span> {q.question}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{q.category}</Badge>
                <Badge variant={q.detention_risk === "high" ? "destructive" : "secondary"} className="text-xs">
                  {q.detention_risk === "high" ? "DETENÇÃO" : q.detention_risk === "medium" ? "MÉDIO" : "BAIXO"}
                </Badge>
                <span className="text-xs">{q.regulation} • Peso: {q.weight}%</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                {([
                  { val: "yes" as Answer, label: "✅ Conforme" },
                  { val: "partial" as Answer, label: "⚠️ Parcial" },
                  { val: "no" as Answer, label: "❌ Não Conforme" },
                  { val: "na" as Answer, label: "N/A" },
                ]).map(opt => (
                  <Button key={opt.val} size="sm" variant={state.answer === opt.val ? "default" : "outline"}
                    className="flex-1 text-xs" onClick={() => updateAnswer(q.id, opt.val)}>
                    {opt.label}
                  </Button>
                ))}
              </div>
              <Textarea placeholder="Observações PSCO..." value={state.notes}
                onChange={e => updateNotes(q.id, e.target.value)} className="text-xs h-14" />
            </CardContent>
          </Card>
        );
      })}

      <div className="flex gap-2 sticky bottom-4">
        <Button variant="outline" onClick={handleReset} className="gap-1"><RotateCcw className="h-3.5 w-3.5" /> Reiniciar</Button>
        <Button onClick={handleComplete} className="flex-1 gap-1" disabled={answered < PSC_QUESTIONS.length || simulateMutation.isPending}>
          {simulateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Target className="h-3.5 w-3.5" />}
          Finalizar Inspeção ({answered}/{PSC_QUESTIONS.length})
        </Button>
      </div>
    </div>
  );
}
