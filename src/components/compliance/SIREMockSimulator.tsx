/**
 * SIRE 2.0 Mock Inspection Simulator
 * Simulates a vetting inspection with randomized questions from the 13-chapter framework
 */
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Play, RotateCcw, CheckCircle2, XCircle, AlertTriangle,
  Clock, Target, Trophy, BookOpen
} from "lucide-react";

const SIRE2_QUESTIONS = [
  { chapter: 1, ref: "1.1.1", question: "Is the vessel's Document of Compliance (DOC) valid and available for inspection?", guidance: "Verify DOC validity, issuing authority, and ship types covered." },
  { chapter: 1, ref: "1.2.3", question: "Are all statutory certificates current and available?", guidance: "Check SMC, ISSC, IOPP, CLC, tonnage, loadline certificates." },
  { chapter: 2, ref: "2.1.1", question: "Is there evidence of an effective system for controlling documentation?", guidance: "Look for controlled copy register, distribution lists, revision tracking." },
  { chapter: 3, ref: "3.1.2", question: "Are crew members holding valid STCW certificates appropriate for their duties?", guidance: "Sample-check 3-4 crew certificates against STCW requirements for their rank." },
  { chapter: 3, ref: "3.2.1", question: "Is there a familiarization program for new crew members?", guidance: "Check records of familiarization checklists, equipment-specific training." },
  { chapter: 4, ref: "4.1.1", question: "Is the passage plan prepared berth-to-berth and approved by the Master?", guidance: "Verify voyage plan includes waypoints, no-go areas, contingencies, and Master's signature." },
  { chapter: 4, ref: "4.2.3", question: "Are ECDIS charts up to date with latest NtM corrections?", guidance: "Check ECDIS update logs, NtM application records, permit-to-use status." },
  { chapter: 5, ref: "5.1.1", question: "Is the ISM Safety Management System effectively implemented?", guidance: "Review SMS manual, check crew understanding, evidence of drills and reviews." },
  { chapter: 5, ref: "5.3.2", question: "Are emergency drills conducted as per SOLAS requirements?", guidance: "Verify drill records, frequency compliance, lessons learned documentation." },
  { chapter: 6, ref: "6.1.1", question: "Is the Shipboard Oil Pollution Emergency Plan (SOPEP) available and crew aware?", guidance: "Check SOPEP availability on bridge, engine room. Quiz crew on response procedures." },
  { chapter: 6, ref: "6.2.1", question: "Is the garbage management plan implemented and records maintained?", guidance: "Check garbage record book entries, segregation practices, disposal receipts." },
  { chapter: 7, ref: "7.1.1", question: "Is the hull in satisfactory structural condition?", guidance: "Visual inspection of deck, holds, ballast tanks for corrosion, fractures, deformation." },
  { chapter: 8, ref: "8.1.2", question: "Are cargo operations conducted in accordance with the cargo plan?", guidance: "Verify cargo plan availability, loading computer data, stress calculations." },
  { chapter: 9, ref: "9.1.1", question: "Are mooring arrangements adequate for the vessel?", guidance: "Check condition of mooring lines, winches, fairleads, and snap-back zones marked." },
  { chapter: 10, ref: "10.1.1", question: "Is the main engine in satisfactory operating condition?", guidance: "Review running hours, defect reports, PM records, spare parts availability." },
  { chapter: 10, ref: "10.2.1", question: "Is the steering gear tested regularly as per SOLAS requirements?", guidance: "Check steering gear test records, emergency drills, redundancy verification." },
  { chapter: 11, ref: "11.1.1", question: "Is the general condition and cleanliness of the vessel satisfactory?", guidance: "Walk-through assessment of accommodation, deck areas, machinery spaces." },
  { chapter: 12, ref: "12.1.1", question: "If applicable, does the vessel have ice-class notation and procedures?", guidance: "Check ice-class certificate, ice navigator qualifications, ice operations manual." },
  { chapter: 13, ref: "13.1.1", question: "Is there evidence of effective crew resource management (CRM) practices?", guidance: "Check bridge team management, closed-loop communication, handover procedures." },
  { chapter: 13, ref: "13.2.1", question: "Are rest hours monitored and compliant with MLC/STCW requirements?", guidance: "Review rest hour records for compliance with 77/10 and 72/7 day rules." },
];

type Phase = "setup" | "active" | "result";
type Answer = { questionIdx: number; response: "conformity" | "observation" | "non_conformity"; notes: string };

export function SIREMockSimulator() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [questionCount, setQuestionCount] = useState("10");
  const [focusChapter, setFocusChapter] = useState("all");
  const [questions, setQuestions] = useState<typeof SIRE2_QUESTIONS>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);

  const startSimulation = useCallback(() => {
    let pool = focusChapter === "all" ? [...SIRE2_QUESTIONS] : SIRE2_QUESTIONS.filter(q => q.chapter === parseInt(focusChapter));
    const count = Math.min(parseInt(questionCount), pool.length);
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);
    setQuestions(shuffled);
    setAnswers([]);
    setCurrentIdx(0);
    setNotes("");
    setStartTime(Date.now());
    setPhase("active");
    toast.info("Simulação SIRE 2.0 iniciada! Responda cada item.");
  }, [questionCount, focusChapter]);

  const submitAnswer = (response: Answer["response"]) => {
    const newAnswers = [...answers, { questionIdx: currentIdx, response, notes }];
    setAnswers(newAnswers);
    setNotes("");
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setElapsed(Math.round((Date.now() - startTime) / 1000));
      setPhase("result");
      toast.success("Simulação concluída!");
    }
  };

  const conformities = answers.filter(a => a.response === "conformity").length;
  const observations = answers.filter(a => a.response === "observation").length;
  const ncs = answers.filter(a => a.response === "non_conformity").length;
  const score = answers.length > 0 ? Math.round((conformities / answers.length) * 100) : 0;

  if (phase === "setup") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            SIRE 2.0 Mock Inspection Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Simule uma inspeção SIRE 2.0 com perguntas reais dos 13 capítulos OCIMF. Treine sua tripulação para vettings.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nº de Perguntas</label>
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 (Rápido)</SelectItem>
                  <SelectItem value="10">10 (Padrão)</SelectItem>
                  <SelectItem value="15">15 (Extenso)</SelectItem>
                  <SelectItem value="20">20 (Completo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Foco por Capítulo</label>
              <Select value={focusChapter} onValueChange={setFocusChapter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Capítulos</SelectItem>
                  {Array.from({ length: 13 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>Cap. {i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={startSimulation} className="w-full">
            <Play className="h-4 w-4 mr-2" /> Iniciar Simulação
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "active") {
    const q = questions[currentIdx];
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Pergunta {currentIdx + 1} de {questions.length}
            </CardTitle>
            <Badge variant="outline">Cap. {q.chapter} — Ref. {q.ref}</Badge>
          </div>
          <Progress value={((currentIdx) / questions.length) * 100} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/30 border">
            <p className="font-medium">{q.question}</p>
            <p className="text-sm text-muted-foreground mt-2 italic">
              💡 Orientação: {q.guidance}
            </p>
          </div>
          <Textarea
            placeholder="Notas do inspetor (opcional)..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
          />
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="border-success/50 text-success hover:bg-success/10" onClick={() => submitAnswer("conformity")}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Conforme
            </Button>
            <Button variant="outline" className="border-warning/50 text-warning hover:bg-warning/10" onClick={() => submitAnswer("observation")}>
              <AlertTriangle className="h-4 w-4 mr-1" /> Observação
            </Button>
            <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => submitAnswer("non_conformity")}>
              <XCircle className="h-4 w-4 mr-1" /> NC
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Results phase
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : "D";
  const gradeColor = grade === "A" ? "text-success" : grade === "B" ? "text-primary" : grade === "C" ? "text-warning" : "text-destructive";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" />
          Resultado da Simulação SIRE 2.0
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-lg bg-muted/30 border">
            <div className={`text-3xl font-bold ${gradeColor}`}>{grade}</div>
            <div className="text-xs text-muted-foreground">Grade</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border">
            <div className="text-3xl font-bold text-primary">{score}%</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </div>
          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
            <div className="text-2xl font-bold text-success">{conformities}</div>
            <div className="text-xs text-muted-foreground">Conformidades</div>
          </div>
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <div className="text-2xl font-bold text-warning">{observations}</div>
            <div className="text-xs text-muted-foreground">Observações</div>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="text-2xl font-bold text-destructive">{ncs}</div>
            <div className="text-xs text-muted-foreground">NCs</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" /> Tempo: {minutes}m {seconds}s
        </div>

        {/* Detailed breakdown */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {answers.map((a, i) => {
            const q = questions[a.questionIdx];
            const icon = a.response === "conformity" ? <CheckCircle2 className="h-4 w-4 text-success" /> : a.response === "observation" ? <AlertTriangle className="h-4 w-4 text-warning" /> : <XCircle className="h-4 w-4 text-destructive" />;
            return (
              <div key={i} className="flex items-start gap-2 p-2 rounded border bg-muted/20 text-sm">
                {icon}
                <div className="flex-1">
                  <span className="font-mono text-xs text-muted-foreground mr-2">[{q.ref}]</span>
                  <span className="line-clamp-1">{q.question}</span>
                  {a.notes && <p className="text-xs text-muted-foreground mt-1 italic">📝 {a.notes}</p>}
                </div>
              </div>
            );
          })}
        </div>

        <Button onClick={() => { setPhase("setup"); setAnswers([]); }} className="w-full">
          <RotateCcw className="h-4 w-4 mr-2" /> Nova Simulação
        </Button>
      </CardContent>
    </Card>
  );
}
