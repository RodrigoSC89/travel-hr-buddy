/**
 * SGSO Risk Heatmap with Bow-Tie Analysis
 * Integrated with Supabase risk_assessments table
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Shield, ArrowRight, Zap, Target, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Risk {
  id: string;
  name: string;
  practice: string;
  probability: number;
  severity: number;
  category: string;
  barriers: string[];
  controls: string[];
  consequences: string[];
}

const PROB_LABELS = ["", "Raro", "Improvável", "Possível", "Provável", "Quase Certo"];
const SEV_LABELS = ["", "Insignificante", "Menor", "Moderado", "Maior", "Catastrófico"];

const getRiskLevel = (p: number, s: number): { level: string; color: string } => {
  const score = p * s;
  if (score >= 15) return { level: "Extremo", color: "bg-red-600 text-white" };
  if (score >= 10) return { level: "Alto", color: "bg-orange-500 text-white" };
  if (score >= 5) return { level: "Médio", color: "bg-amber-400 text-black" };
  return { level: "Baixo", color: "bg-emerald-500 text-white" };
};

const CATEGORIES = ["Ambiental", "Pessoal", "Processo", "Operacional", "Regulatório"];
const PRACTICES = [
  "P2-Conformidade Legal", "P4-Operações", "P5-Saúde e Segurança",
  "P6-Controle Operacional", "P7-Gerenciamento de Mudanças", "P9-Emergências",
];

export function SGSORiskHeatmap() {
  const queryClient = useQueryClient();
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [bowTieOpen, setBowTieOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", practice: PRACTICES[0], probability: "3", severity: "3",
    category: CATEGORIES[0], barriers: "", controls: "", consequences: "",
  });

  const { data: risks = [], isLoading } = useQuery({
    queryKey: ["sgso-risks"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("risk_assessments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((r: any): Risk => ({
        id: r.id,
        name: r.risk_description || r.title || "Risco",
        practice: r.practice || r.category || "P6-Controle Operacional",
        probability: Number(r.likelihood || r.probability || 3),
        severity: Number(r.severity || r.impact || 3),
        category: r.category || "Operacional",
        barriers: Array.isArray(r.barriers) ? r.barriers : (r.mitigation_measures ? [r.mitigation_measures] : []),
        controls: Array.isArray(r.controls) ? r.controls : (r.existing_controls ? [r.existing_controls] : []),
        consequences: Array.isArray(r.consequences) ? r.consequences : (r.potential_consequences ? [r.potential_consequences] : []),
      }));
    },
    staleTime: 30_000,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase.from as Function)("risk_assessments").insert({
        risk_description: form.name,
        practice: form.practice,
        likelihood: parseInt(form.probability),
        severity: parseInt(form.severity),
        category: form.category,
        barriers: form.barriers.split(",").map((s: string) => s.trim()).filter(Boolean),
        controls: form.controls.split(",").map((s: string) => s.trim()).filter(Boolean),
        consequences: form.consequences.split(",").map((s: string) => s.trim()).filter(Boolean),
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sgso-risks"] });
      toast.success("Risco cadastrado com sucesso");
      setAddOpen(false);
      setForm({ name: "", practice: PRACTICES[0], probability: "3", severity: "3", category: CATEGORIES[0], barriers: "", controls: "", consequences: "" });
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  // Build 5x5 matrix
  const matrix: Risk[][][] = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => [] as Risk[]));
  risks.forEach((r: Risk) => { matrix[5 - r.severity]?.[r.probability - 1]?.push(r); });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-destructive" />Matriz de Riscos 5×5 — SGSO ANP</CardTitle>
              <CardDescription>Clique em um risco para análise Bow-Tie. {risks.length} riscos cadastrados.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["sgso-risks"] })}><RefreshCw className="h-4 w-4 mr-1" />Atualizar</Button>
              <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" />Novo Risco</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-center text-muted-foreground py-8">Carregando riscos...</p> : (
            <TooltipProvider>
              <div className="overflow-x-auto">
                <div className="inline-grid gap-1" style={{ gridTemplateColumns: "120px repeat(5, 1fr)" }}>
                  <div />
                  {PROB_LABELS.slice(1).map((label, i) => (
                    <div key={`pl-${i}`} className="text-center text-xs font-medium p-2 bg-muted/30 rounded">{label}</div>
                  ))}
                  {[5, 4, 3, 2, 1].map((sev) => (
                    <React.Fragment key={`row-${sev}`}>
                      <div className="flex items-center text-xs font-medium pr-2 bg-muted/30 rounded p-2">{SEV_LABELS[sev]}</div>
                      {[1, 2, 3, 4, 5].map(prob => {
                        const cellRisks = matrix[5 - sev]?.[prob - 1] || [];
                        const { color } = getRiskLevel(prob, sev);
                        return (
                          <div key={`cell-${prob}-${sev}`} className={`min-h-[60px] rounded p-1 ${color} flex flex-col gap-1`}>
                            {cellRisks.map(risk => (
                              <Tooltip key={risk.id}>
                                <TooltipTrigger asChild>
                                  <button onClick={() => { setSelectedRisk(risk); setBowTieOpen(true); }} className="text-[10px] leading-tight bg-white/20 rounded px-1 py-0.5 hover:bg-white/40 transition-colors text-left w-full truncate">{risk.name}</button>
                                </TooltipTrigger>
                                <TooltipContent><p className="font-medium">{risk.name}</p><p className="text-xs">{risk.practice} • {risk.category}</p><p className="text-xs">Score: {prob * sev} ({getRiskLevel(prob, sev).level})</p></TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                  <div /><div className="col-span-5 text-center text-xs text-muted-foreground font-medium pt-2">Probabilidade →</div>
                </div>
              </div>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>

      {/* Risk Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { level: "Extremo", count: risks.filter((r: Risk) => r.probability * r.severity >= 15).length, color: "text-red-600 bg-red-500/10 border-red-500/30" },
          { level: "Alto", count: risks.filter((r: Risk) => { const s = r.probability * r.severity; return s >= 10 && s < 15; }).length, color: "text-orange-600 bg-orange-500/10 border-orange-500/30" },
          { level: "Médio", count: risks.filter((r: Risk) => { const s = r.probability * r.severity; return s >= 5 && s < 10; }).length, color: "text-amber-600 bg-amber-500/10 border-amber-500/30" },
          { level: "Baixo", count: risks.filter((r: Risk) => r.probability * r.severity < 5).length, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" },
        ].map(item => (
          <Card key={item.level} className={`border ${item.color}`}><CardContent className="pt-4 text-center"><p className="text-3xl font-bold">{item.count}</p><p className="text-sm font-medium">{item.level}</p></CardContent></Card>
        ))}
      </div>

      {/* Bow-Tie Dialog */}
      <Dialog open={bowTieOpen} onOpenChange={setBowTieOpen}>
        <DialogContent className="max-w-4xl">
          {selectedRisk && (
            <>
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Análise Bow-Tie: {selectedRisk.name}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-[1fr,auto,1fr,auto,1fr] gap-4 items-center py-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-emerald-600 flex items-center gap-1"><Shield className="h-4 w-4" /> Barreiras Preventivas</h4>
                  {selectedRisk.barriers.length > 0 ? selectedRisk.barriers.map((b, i) => <div key={`barrier-${b.substring(0, 15)}-${i}`} className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-sm">{b}</div>) : <p className="text-sm text-muted-foreground">Nenhuma barreira cadastrada</p>}
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <Card className="border-2 border-destructive bg-destructive/5">
                  <CardContent className="py-4 text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto text-destructive mb-2" />
                    <p className="font-bold text-sm">{selectedRisk.name}</p>
                    <Badge className="mt-2">{selectedRisk.practice}</Badge>
                    <div className="mt-2 flex justify-center gap-2">
                      <Badge variant="outline" className="text-xs">P: {PROB_LABELS[selectedRisk.probability]}</Badge>
                      <Badge variant="outline" className="text-xs">S: {SEV_LABELS[selectedRisk.severity]}</Badge>
                    </div>
                    <Badge className={`mt-2 ${getRiskLevel(selectedRisk.probability, selectedRisk.severity).color}`}>{getRiskLevel(selectedRisk.probability, selectedRisk.severity).level} ({selectedRisk.probability * selectedRisk.severity})</Badge>
                  </CardContent>
                </Card>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-blue-600 flex items-center gap-1"><Zap className="h-4 w-4" /> Controles Mitigatórios</h4>
                    {selectedRisk.controls.length > 0 ? selectedRisk.controls.map((c, i) => <div key={`ctrl-${c.substring(0, 15)}-${i}`} className="p-2 rounded bg-blue-500/10 border border-blue-500/30 text-sm">{c}</div>) : <p className="text-sm text-muted-foreground">Nenhum controle</p>}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Consequências</h4>
                    {selectedRisk.consequences.length > 0 ? selectedRisk.consequences.map((c, i) => <div key={`csq-${c.substring(0, 15)}-${i}`} className="p-2 rounded bg-red-500/10 border border-red-500/30 text-sm">{c}</div>) : <p className="text-sm text-muted-foreground">Nenhuma</p>}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Risk Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Risco SGSO</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Descrição do Risco *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Prática SGSO</Label><Select value={form.practice} onValueChange={(v) => setForm({ ...form, practice: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRACTICES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Categoria</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Probabilidade (1-5)</Label><Select value={form.probability} onValueChange={(v) => setForm({ ...form, probability: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} - {PROB_LABELS[n]}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Severidade (1-5)</Label><Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} - {SEV_LABELS[n]}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label>Barreiras Preventivas (separadas por vírgula)</Label><Textarea value={form.barriers} onChange={(e) => setForm({ ...form, barriers: e.target.value })} rows={2} /></div>
            <div><Label>Controles Mitigatórios (separadas por vírgula)</Label><Textarea value={form.controls} onChange={(e) => setForm({ ...form, controls: e.target.value })} rows={2} /></div>
            <div><Label>Consequências (separadas por vírgula)</Label><Textarea value={form.consequences} onChange={(e) => setForm({ ...form, consequences: e.target.value })} rows={2} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button onClick={() => { if (!form.name) { toast.error("Preencha a descrição"); return; } addMutation.mutate(); }} disabled={addMutation.isPending}>{addMutation.isPending ? "Salvando..." : "Salvar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
