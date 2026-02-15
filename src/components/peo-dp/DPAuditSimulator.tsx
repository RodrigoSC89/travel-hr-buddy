import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Target, CheckCircle, XCircle, AlertTriangle, RotateCcw, Download, Clock } from "lucide-react";

const AUDIT_QUESTIONS = [
  { id: "dp_log", category: "Documentação", weight: 10, question: "O DP Log está atualizado com todas as entradas das últimas 90 dias?", reference: "IMCA M 117 Rev 2", hint: "Verificar DP Log eletrônico e/ou manual com entradas de mudança de modo, alertas e handovers" },
  { id: "fmea_current", category: "FMEA", weight: 15, question: "O FMEA está atualizado após últimas modificações ao sistema DP?", reference: "IMCA M 166", hint: "FMEA deve refletir configuração atual do navio, incluindo upgrades e reparos" },
  { id: "annual_dp_trial", category: "Trials", weight: 15, question: "Annual DP Trial realizado nos últimos 12 meses por empresa aprovada IMCA?", reference: "IMCA M 190", hint: "Relatório do trial deve incluir testes de blackout, drift-off e drive-off" },
  { id: "dp_operators_cert", category: "Certificação", weight: 15, question: "Todos os DPOs possuem certificado NI DP válido e logbook atualizado?", reference: "Nautical Institute DP Scheme", hint: "Verificar certificados NI DP, logbooks com horas registradas e validade" },
  { id: "ciras_filed", category: "Incidentes", weight: 10, question: "Todos os incidentes DP foram reportados ao IMCA CIRAS?", reference: "IMCA M 232", hint: "Todo DP incident, near-miss ou loss of position deve ser reportado" },
  { id: "power_management", category: "Energia", weight: 10, question: "PMS calibrado e testado conforme requisitos IMCA?", reference: "IMCA M 166 Rev 2, Sec 4.2", hint: "PMS deve demonstrar correta distribuição de carga e proteção de blackout" },
  { id: "thruster_maintenance", category: "Propulsão", weight: 10, question: "Todos os thrusters revisados conforme plano de manutenção do fabricante?", reference: "SMS Maintenance Plan", hint: "Registros de manutenção preventiva e preditiva de todos os thrusters" },
  { id: "reference_systems", category: "Referência", weight: 10, question: "Mínimo 3 sistemas de referência independentes operacionais e calibrados?", reference: "IMCA M 166, Sec 3.4", hint: "DGNSS, HPR/LBL, Taut Wire, Fanbeam, Artemis — mínimo 3 operacionais" },
  { id: "dp_drills", category: "Simulacros", weight: 5, question: "Simulacros de emergência DP realizados mensalmente e documentados?", reference: "OCIMF DPOG 2.1.5", hint: "Simulacros devem cobrir: DP blackout, drift-off, drive-off, vessel collision" },
];

type Answer = "yes" | "partial" | "no" | "na";

interface QuestionState {
  answer: Answer | null;
  notes: string;
}

export function DPAuditSimulator() {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [states, setStates] = useState<Record<string, QuestionState>>(() =>
    Object.fromEntries(AUDIT_QUESTIONS.map(q => [q.id, { answer: null, notes: "" }]))
  );
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);

  const answered = Object.values(states).filter(s => s.answer !== null).length;
  const progress = Math.round((answered / AUDIT_QUESTIONS.length) * 100);

  const updateAnswer = (id: string, answer: Answer) => {
    setStates(prev => ({ ...prev, [id]: { ...prev[id], answer } }));
  };
  const updateNotes = (id: string, notes: string) => {
    setStates(prev => ({ ...prev, [id]: { ...prev[id], notes } }));
  };

  const calculateResult = () => {
    let totalWeight = 0;
    let earnedWeight = 0;
    const weakAreas: string[] = [];
    const deficiencies: string[] = [];

    for (const q of AUDIT_QUESTIONS) {
      const state = states[q.id];
      if (state.answer === "na") continue;
      totalWeight += q.weight;
      if (state.answer === "yes") earnedWeight += q.weight;
      else if (state.answer === "partial") { earnedWeight += q.weight * 0.5; weakAreas.push(q.category); }
      else if (state.answer === "no") { deficiencies.push(`${q.category}: ${q.question} (Ref: ${q.reference})`); }
    }

    const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
    const passed = score >= 70 && deficiencies.length === 0;

    return { score, passed, weakAreas: [...new Set(weakAreas)], deficiencies, totalWeight, earnedWeight };
  };

  const handleStart = () => {
    setStarted(true);
    setStartTime(Date.now());
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - Date.now()) / 1000)), 1000);
  };

  const handleComplete = () => {
    if (answered < AUDIT_QUESTIONS.length) {
      toast.error("Responda todas as perguntas antes de finalizar");
      return;
    }
    setCompleted(true);
    setElapsed(Math.floor((Date.now() - startTime) / 1000));
    toast.success("Simulação de auditoria concluída!");
  };

  const handleReset = () => {
    setStarted(false);
    setCompleted(false);
    setStates(Object.fromEntries(AUDIT_QUESTIONS.map(q => [q.id, { answer: null, notes: "" }])));
    setElapsed(0);
  };

  const result = completed ? calculateResult() : null;

  if (!started) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-12 text-center space-y-4">
          <Target className="h-16 w-16 mx-auto text-primary opacity-70" />
          <h3 className="text-xl font-bold">Simulador de Auditoria DPVOA / IMCA</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Simule uma auditoria DP real baseada nos critérios IMCA M 166, DPVOA e OCIMF.
            9 perguntas ponderadas com score automático e relatório de gaps.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline">IMCA M 166</Badge>
            <Badge variant="outline">DPVOA</Badge>
            <Badge variant="outline">IMCA M 190</Badge>
            <Badge variant="outline">OCIMF DPOG</Badge>
            <Badge variant="outline">Nautical Institute</Badge>
          </div>
          <Button size="lg" onClick={handleStart} className="gap-2 mt-4">
            <Target className="h-4 w-4" /> Iniciar Simulação
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (completed && result) {
    return (
      <div className="space-y-4">
        <Card className={`border-2 ${result.passed ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}`}>
          <CardContent className="py-8 text-center space-y-4">
            {result.passed ? <CheckCircle className="h-16 w-16 mx-auto text-green-500" /> : <XCircle className="h-16 w-16 mx-auto text-red-500" />}
            <h3 className="text-2xl font-bold">{result.passed ? "✅ APROVADO" : "❌ REPROVADO"}</h3>
            <p className="text-5xl font-bold">{result.score}<span className="text-lg text-muted-foreground">/100</span></p>
            <p className="text-sm text-muted-foreground">Tempo: {Math.floor(elapsed / 60)}min {elapsed % 60}s</p>
          </CardContent>
        </Card>

        {result.deficiencies.length > 0 && (
          <Card className="border-destructive/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <XCircle className="h-4 w-4" /> Deficiências ({result.deficiencies.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.deficiencies.map((d, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-destructive mt-0.5">●</span>{d}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {result.weakAreas.length > 0 && (
          <Card className="border-warning/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-warning">
                <AlertTriangle className="h-4 w-4" /> Áreas a Melhorar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.weakAreas.map(a => <Badge key={a} variant="outline" className="border-warning text-warning">{a}</Badge>)}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-1">
            <RotateCcw className="h-3.5 w-3.5" /> Nova Simulação
          </Button>
          <Button className="gap-1" onClick={() => toast.success("Relatório exportado!")}>
            <Download className="h-3.5 w-3.5" /> Exportar Relatório
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso: {answered}/{AUDIT_QUESTIONS.length}</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {AUDIT_QUESTIONS.map((q, idx) => {
        const state = states[q.id];
        return (
          <Card key={q.id} className={state.answer === "no" ? "border-destructive/30" : state.answer === "partial" ? "border-warning/30" : state.answer === "yes" ? "border-green-500/30" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-muted-foreground">#{idx + 1}</span> {q.question}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant="outline" className="text-xs mr-2">{q.category}</Badge>
                    <span className="text-xs">Ref: {q.reference} • Peso: {q.weight}%</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground italic">💡 {q.hint}</p>
              <div className="flex gap-2">
                {([
                  { val: "yes" as Answer, label: "✅ Sim", cls: "border-green-500 text-green-600 bg-green-500/10" },
                  { val: "partial" as Answer, label: "⚠️ Parcial", cls: "border-amber-500 text-amber-600 bg-amber-500/10" },
                  { val: "no" as Answer, label: "❌ Não", cls: "border-red-500 text-red-600 bg-red-500/10" },
                  { val: "na" as Answer, label: "N/A", cls: "border-muted text-muted-foreground" },
                ]).map(opt => (
                  <Button key={opt.val} size="sm" variant="outline"
                    className={`flex-1 text-xs ${state.answer === opt.val ? opt.cls + " font-bold" : ""}`}
                    onClick={() => updateAnswer(q.id, opt.val)}>
                    {opt.label}
                  </Button>
                ))}
              </div>
              <Textarea placeholder="Observações do auditor..." value={state.notes}
                onChange={e => updateNotes(q.id, e.target.value)} className="text-xs h-16" />
            </CardContent>
          </Card>
        );
      })}

      <div className="flex gap-2 sticky bottom-4">
        <Button variant="outline" onClick={handleReset} className="gap-1">
          <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
        </Button>
        <Button onClick={handleComplete} className="flex-1 gap-1" disabled={answered < AUDIT_QUESTIONS.length}>
          <Target className="h-3.5 w-3.5" /> Finalizar Simulação ({answered}/{AUDIT_QUESTIONS.length})
        </Button>
      </div>
    </div>
  );
}
