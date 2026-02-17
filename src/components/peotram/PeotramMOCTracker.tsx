/**
 * PEOTRAM MOC Tracker — Management of Change (Elemento 9)
 * 6-stage workflow with approval chain
 * PRODUCTION: Integrated with Supabase peotram_moc_requests
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ArrowRight, CheckCircle, Clock, FileText, GitBranch, Plus, Shield, Target, Users } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FLOW_STEPS = [
  { key: "draft", label: "Solicitação", icon: FileText },
  { key: "risk_assessment", label: "Análise de Risco", icon: AlertTriangle },
  { key: "approval", label: "Aprovação", icon: CheckCircle },
  { key: "implementation", label: "Implementação", icon: Target },
  { key: "verification", label: "Verificação", icon: Shield },
  { key: "closed", label: "Encerrada", icon: CheckCircle },
];

const changeTypeConfig: Record<string, { label: string; color: string }> = {
  permanent: { label: "Permanente", color: "bg-primary/10 text-primary border-primary/30" },
  temporary: { label: "Temporária", color: "bg-warning/10 text-warning border-warning/30" },
  emergency: { label: "Emergencial", color: "bg-destructive/10 text-destructive border-destructive/30" },
};

const riskColors: Record<string, string> = {
  low: "bg-success/10 text-success border-success/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  high: "bg-destructive/10 text-destructive border-destructive/30",
  critical: "bg-destructive/10 text-destructive border-destructive/30",
};

export const PeotramMOCTracker: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newForm, setNewForm] = useState({ title: "", description: "", element: "", change_type: "permanent", risk_level: "medium", requested_by: "", target_date: "" });

  const { data: mocs = [], isLoading } = useQuery({
    queryKey: ["peotram-moc-requests"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("peotram_moc_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (moc: Record<string, unknown>) => {
      const count = mocs.length + 1;
      const { error } = await (supabase.from as Function)("peotram_moc_requests").insert({
        ...moc,
        moc_number: `MOC-2026-${String(count).padStart(3, "0")}`,
        request_date: new Date().toISOString().split("T")[0],
        status: "draft",
        days_open: 0,
        approvals: [],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peotram-moc-requests"] });
      setShowForm(false);
      setNewForm({ title: "", description: "", element: "", change_type: "permanent", risk_level: "medium", requested_by: "", target_date: "" });
      toast.success("MOC criada com sucesso");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await (supabase.from as Function)("peotram_moc_requests").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peotram-moc-requests"] });
    },
  });

  const advanceStatus = (moc: any) => {
    const flow: Record<string, string> = {
      draft: "risk_assessment", risk_assessment: "approval", approval: "implementation",
      implementation: "verification", verification: "closed",
    };
    const next = flow[moc.status];
    if (next) {
      updateMutation.mutate({ id: moc.id, updates: { status: next } });
      toast.success(`MOC avançada para: ${FLOW_STEPS.find(s => s.key === next)?.label}`);
    }
  };

  const activeCount = mocs.filter((m: any) => m.status !== "closed").length;
  const emergencyCount = mocs.filter((m: any) => m.change_type === "emergency" && m.status !== "closed").length;
  const pendingApproval = mocs.filter((m: any) => m.status === "approval").length;
  const avgDays = mocs.length > 0 ? Math.round(mocs.reduce((a: number, m: any) => a + (m.days_open || 0), 0) / mocs.length) : 0;

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Carregando MOCs...</div>;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><GitBranch className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">MOCs Ativas</p></div>
          <p className="text-2xl font-bold">{activeCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-destructive" /><p className="text-xs text-muted-foreground">Emergenciais</p></div>
          <p className="text-2xl font-bold text-destructive">{emergencyCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="h-4 w-4 text-warning" /><p className="text-xs text-muted-foreground">Aguard. Aprovação</p></div>
          <p className="text-2xl font-bold text-warning">{pendingApproval}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">Média Dias</p></div>
          <p className="text-2xl font-bold">{avgDays}d</p>
        </CardContent></Card>
      </div>

      {/* Flow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><GitBranch className="h-5 w-5 text-primary" />Fluxo MOC — Management of Change</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {FLOW_STEPS.map((step, i) => (
              <React.Fragment key={step.key}>
                <div className="text-center p-3 rounded-xl border bg-card min-w-[100px]">
                  <step.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium">{step.label}</p>
                </div>
                {i < FLOW_STEPS.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MOC List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Registro de Mudanças</CardTitle>
              <CardDescription>Gestão de Mudanças conforme Elemento 9 — PEOTRAM</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1"><Plus className="h-3 w-3" />Nova MOC</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {showForm && (
            <div className="p-4 rounded-xl border bg-card/50 space-y-3">
              <h4 className="text-sm font-semibold">Nova Solicitação de Mudança</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Título" value={newForm.title} onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))} />
                <Input placeholder="Solicitante" value={newForm.requested_by} onChange={e => setNewForm(p => ({ ...p, requested_by: e.target.value }))} />
                <Input placeholder="Elemento PEOTRAM" value={newForm.element} onChange={e => setNewForm(p => ({ ...p, element: e.target.value }))} />
                <Input type="date" value={newForm.target_date} onChange={e => setNewForm(p => ({ ...p, target_date: e.target.value }))} />
                <Select value={newForm.change_type} onValueChange={v => setNewForm(p => ({ ...p, change_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanente</SelectItem>
                    <SelectItem value="temporary">Temporária</SelectItem>
                    <SelectItem value="emergency">Emergencial</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newForm.risk_level} onValueChange={v => setNewForm(p => ({ ...p, risk_level: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixo</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea placeholder="Descrição da mudança..." value={newForm.description} onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))} />
              <Button size="sm" onClick={() => createMutation.mutate(newForm)} disabled={!newForm.title || createMutation.isPending}>
                Criar MOC
              </Button>
            </div>
          )}

          {mocs.map((moc: any) => {
            const ctCfg = changeTypeConfig[moc.change_type] || changeTypeConfig.permanent;
            const currentStep = FLOW_STEPS.findIndex(s => s.key === moc.status);
            const progress = ((currentStep + 1) / FLOW_STEPS.length) * 100;
            const approvals = Array.isArray(moc.approvals) ? moc.approvals : [];

            return (
              <div key={moc.id} className="p-4 rounded-xl border bg-card/50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{moc.moc_number}</span>
                      <Badge variant="outline" className={ctCfg.color}>{ctCfg.label}</Badge>
                      <Badge variant="outline" className={riskColors[moc.risk_level] || ""}>Risco: {moc.risk_level}</Badge>
                      <Badge variant="outline">{FLOW_STEPS[currentStep]?.label || moc.status}</Badge>
                    </div>
                    <p className="font-medium">{moc.title}</p>
                    <p className="text-xs text-muted-foreground">{moc.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {moc.element && <span>{moc.element}</span>}
                      {moc.requested_by && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{moc.requested_by}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{moc.days_open || 0}d</span>
                    </div>
                  </div>
                  {moc.status !== "closed" && (
                    <Button size="sm" variant="outline" onClick={() => advanceStatus(moc)} className="gap-1 text-xs shrink-0">
                      <ArrowRight className="h-3 w-3" />Avançar
                    </Button>
                  )}
                </div>

                {moc.impact_areas && moc.impact_areas.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {moc.impact_areas.map((area: string) => (
                      <Badge key={area} variant="secondary" className="text-[10px]">{area}</Badge>
                    ))}
                  </div>
                )}

                {approvals.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {approvals.map((ap: any, i: number) => (
                      <div key={`${moc.id}-ap-${ap.role}-${i}`} className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs ${
                        ap.status === "approved" ? "bg-success/5 border-success/20 text-success" :
                        ap.status === "rejected" ? "bg-destructive/5 border-destructive/20 text-destructive" :
                        "bg-muted/50 border-border text-muted-foreground"
                      }`}>
                        {ap.status === "approved" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        <span>{ap.role}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progresso</span>
                    <span>{currentStep + 1}/{FLOW_STEPS.length}</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              </div>
            );
          })}

          {mocs.length === 0 && (
            <p className="text-center py-4 text-muted-foreground text-sm">Nenhuma MOC registrada. Use o botão "Nova MOC" para criar.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
