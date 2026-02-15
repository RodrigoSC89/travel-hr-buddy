/**
 * PEO-DP Trials Manager - DP Annual Trials tracking per IMCA M 190
 * Tracks all required DP trial types with pass/fail criteria
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, FileText, Plus, Download } from "lucide-react";
import { toast } from "sonner";

interface DPTrial {
  id: string;
  category: string;
  trialName: string;
  description: string;
  requirement: string;
  status: "pending" | "pass" | "fail" | "not_applicable";
  date?: string;
  notes?: string;
  acceptanceCriteria: string;
}

const DP_TRIALS: DPTrial[] = [
  { id: "T01", category: "Power System", trialName: "Single Generator Failure", description: "Simulate loss of one generator and verify automatic changeover", requirement: "IMCA M 190 §4.1", status: "pending", acceptanceCriteria: "No loss of position; max excursion < 10m" },
  { id: "T02", category: "Power System", trialName: "Worst Case Failure (WCF)", description: "Simulate worst case single point failure per WCFDI", requirement: "IMCA M 190 §4.2", status: "pending", acceptanceCriteria: "Vessel maintains position within operational limits" },
  { id: "T03", category: "Power System", trialName: "Total Blackout Recovery", description: "Full blackout and recovery procedure", requirement: "IMCA M 190 §4.3", status: "pending", acceptanceCriteria: "Power restored within 45 seconds; DP regains control" },
  { id: "T04", category: "Thruster System", trialName: "Single Thruster Failure", description: "Loss of any single thruster", requirement: "IMCA M 190 §5.1", status: "pending", acceptanceCriteria: "Vessel holds position; DP reallocates thrust" },
  { id: "T05", category: "Thruster System", trialName: "Maximum Environmental Force", description: "DP capability plot verification under max environment", requirement: "IMCA M 190 §5.2", status: "pending", acceptanceCriteria: "Capability matches or exceeds DP capability plot" },
  { id: "T06", category: "Position Reference", trialName: "Loss of Single PRS", description: "Remove one position reference system", requirement: "IMCA M 190 §6.1", status: "pending", acceptanceCriteria: "DP continues with remaining references; alarm generated" },
  { id: "T07", category: "Position Reference", trialName: "Loss of All PRS", description: "Progressive loss of all position reference systems", requirement: "IMCA M 190 §6.2", status: "pending", acceptanceCriteria: "DP goes to dead reckoning; DPO takes manual control" },
  { id: "T08", category: "DP Control", trialName: "DP Computer Changeover", description: "Transfer from primary to backup DP computer", requirement: "IMCA M 190 §7.1", status: "pending", acceptanceCriteria: "Seamless transfer; no position excursion > 5m" },
  { id: "T09", category: "DP Control", trialName: "UPS Failure", description: "Loss of UPS supply to DP systems", requirement: "IMCA M 190 §7.2", status: "pending", acceptanceCriteria: "DP continues on alternative power path" },
  { id: "T10", category: "Sensors", trialName: "Gyro Compass Failure", description: "Loss of active gyro compass", requirement: "IMCA M 190 §8.1", status: "pending", acceptanceCriteria: "DP switches to backup heading reference" },
  { id: "T11", category: "Sensors", trialName: "Wind Sensor Failure", description: "Loss of wind sensor input", requirement: "IMCA M 190 §8.2", status: "pending", acceptanceCriteria: "DP uses last known value; alarm generated" },
  { id: "T12", category: "Emergency", trialName: "Emergency Disconnect (EDS)", description: "Activate emergency disconnect sequence", requirement: "IMCA M 190 §9.1", status: "pending", acceptanceCriteria: "Clean disconnect; vessel drives off safely" },
  { id: "T13", category: "Emergency", trialName: "Drive-Off Scenario", description: "Simulate drive-off condition and recovery", requirement: "IMCA M 190 §9.2", status: "pending", acceptanceCriteria: "Drive-off detected; auto-stop; DPO recovery" },
  { id: "T14", category: "Emergency", trialName: "Drift-Off Scenario", description: "Simulate drift-off condition", requirement: "IMCA M 190 §9.3", status: "pending", acceptanceCriteria: "Drift detected within ASOG limits; alerts triggered" },
];

export function PeoDPTrialsManager() {
  const [trials, setTrials] = useState<DPTrial[]>(DP_TRIALS);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filtered = selectedCategory === "all" ? trials : trials.filter(t => t.category === selectedCategory);
  const categories = [...new Set(trials.map(t => t.category))];
  const passCount = trials.filter(t => t.status === "pass").length;
  const failCount = trials.filter(t => t.status === "fail").length;
  const pendingCount = trials.filter(t => t.status === "pending").length;
  const completionPct = Math.round(((passCount + failCount) / trials.filter(t => t.status !== "not_applicable").length) * 100);

  const updateTrialStatus = (id: string, status: DPTrial["status"]) => {
    setTrials(prev => prev.map(t => t.id === id ? { ...t, status, date: status !== "pending" ? new Date().toISOString().split("T")[0] : undefined } : t));
    toast.success(`Trial ${id} marcado como ${status === "pass" ? "APROVADO ✓" : status === "fail" ? "REPROVADO ✗" : status}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">DP Annual Trials — IMCA M 190</h3>
          <p className="text-sm text-muted-foreground">Registro e acompanhamento de testes DP anuais obrigatórios</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => toast.success("Relatório de Trials exportado")} className="gap-1">
          <Download className="h-3 w-3" /> Exportar Relatório
        </Button>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso dos Trials</span>
            <span className="text-sm font-bold">{completionPct}%</span>
          </div>
          <Progress value={completionPct} className="h-3" />
          <div className="flex gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1 text-success"><CheckCircle className="h-3 w-3" /> {passCount} Aprovados</span>
            <span className="flex items-center gap-1 text-destructive"><XCircle className="h-3 w-3" /> {failCount} Reprovados</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" /> {pendingCount} Pendentes</span>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-64"><SelectValue placeholder="Filtrar por categoria" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Categorias</SelectItem>
          {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Trials Cards */}
      <div className="space-y-3">
        {filtered.map(trial => (
          <Card key={trial.id} className={trial.status === "fail" ? "border-destructive/30" : trial.status === "pass" ? "border-success/30" : ""}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{trial.id}</Badge>
                    <span className="font-medium">{trial.trialName}</span>
                    <Badge variant="secondary" className="text-xs">{trial.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{trial.description}</p>
                  <p className="text-xs text-muted-foreground"><strong>Ref:</strong> {trial.requirement}</p>
                  <p className="text-xs"><strong>Critério de Aceitação:</strong> {trial.acceptanceCriteria}</p>
                  {trial.date && <p className="text-xs text-muted-foreground">Executado: {trial.date}</p>}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant={trial.status === "pass" ? "default" : "outline"} className="gap-1 h-8" onClick={() => updateTrialStatus(trial.id, "pass")}>
                    <CheckCircle className="h-3 w-3" /> Pass
                  </Button>
                  <Button size="sm" variant={trial.status === "fail" ? "destructive" : "outline"} className="gap-1 h-8" onClick={() => updateTrialStatus(trial.id, "fail")}>
                    <XCircle className="h-3 w-3" /> Fail
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
