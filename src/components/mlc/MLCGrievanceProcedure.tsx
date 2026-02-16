/**
 * MLC Grievance Procedure — Reg. 5.1.5
 * 4-level escalation with SLA tracking
 * PRODUCTION: Integrated with Supabase mlc_grievances
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Clock, FileText, MessageSquare, Scale, Shield, Users, ArrowRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ESCALATION_LEVELS = [
  { level: 1, title: "Supervisor Direto", sla: 7, description: "Resolução informal pelo supervisor imediato" },
  { level: 2, title: "Capitão / Master", sla: 14, description: "Intervenção do Comandante da embarcação" },
  { level: 3, title: "Companhia / DPA", sla: 30, description: "Encaminhamento ao DPA ou gestão em terra" },
  { level: 4, title: "Estado de Bandeira", sla: 90, description: "Reclamação formal ao Estado de Bandeira (Reg. 5.1.5)" },
];

const CATEGORIES = [
  "Condições de Trabalho", "Salários/Pagamentos", "Alimentação/Alojamento",
  "Assédio/Discriminação", "Segurança/Saúde", "Horas de Descanso",
  "Repatriação", "Contrato SEA", "Outros"
];

const statusConfig: Record<string, { label: string; color: string; level: number }> = {
  filed: { label: "Registrada", color: "bg-muted text-muted-foreground", level: 0 },
  level_1: { label: "Nível 1 — Supervisor", color: "bg-blue-500/10 text-blue-400 border-blue-500/30", level: 1 },
  level_2: { label: "Nível 2 — Capitão", color: "bg-warning/10 text-warning border-warning/30", level: 2 },
  level_3: { label: "Nível 3 — DPA/Companhia", color: "bg-orange-500/10 text-orange-400 border-orange-500/30", level: 3 },
  flag_state: { label: "Nível 4 — Estado de Bandeira", color: "bg-destructive/10 text-destructive border-destructive/30", level: 4 },
  resolved: { label: "Resolvida", color: "bg-success/10 text-success border-success/30", level: 5 },
  closed: { label: "Encerrada", color: "bg-muted text-muted-foreground", level: 5 },
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning border-warning/30",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  critical: "bg-destructive/10 text-destructive border-destructive/30",
};

export const MLCGrievanceProcedure: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newForm, setNewForm] = useState({ title: "", complainant: "", category: "Condições de Trabalho", priority: "medium", description: "" });

  const { data: grievances = [], isLoading } = useQuery({
    queryKey: ["mlc-grievances"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("mlc_grievances")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (g: Record<string, unknown>) => {
      const count = grievances.length + 1;
      const { error } = await (supabase.from as Function)("mlc_grievances").insert({
        ...g,
        grievance_number: `GRV-${String(count).padStart(3, "0")}`,
        filed_date: new Date().toISOString().split("T")[0],
        last_update: new Date().toISOString().split("T")[0],
        status: "filed",
        days_open: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mlc-grievances"] });
      setShowForm(false);
      setNewForm({ title: "", complainant: "", category: "Condições de Trabalho", priority: "medium", description: "" });
      toast.success("Reclamação registrada com sucesso");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await (supabase.from as Function)("mlc_grievances").update({ ...updates, last_update: new Date().toISOString().split("T")[0] }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mlc-grievances"] }),
  });

  const escalate = (g: any) => {
    const nextStatus: Record<string, string> = { filed: "level_1", level_1: "level_2", level_2: "level_3", level_3: "flag_state" };
    const next = nextStatus[g.status];
    if (next) {
      const history = Array.isArray(g.escalation_history) ? g.escalation_history : [];
      updateMutation.mutate({ id: g.id, updates: { status: next, escalation_history: [...history, { from: g.status, to: next, date: new Date().toISOString() }] } });
      toast.info(`Reclamação escalada para ${statusConfig[next]?.label}`);
    }
  };

  const resolve = (id: string) => {
    updateMutation.mutate({ id, updates: { status: "resolved", resolution: "Resolvida conforme procedimento interno." } });
    toast.success("Reclamação resolvida");
  };

  const activeCount = grievances.filter((g: any) => !["resolved", "closed"].includes(g.status)).length;
  const resolvedCount = grievances.filter((g: any) => g.status === "resolved").length;
  const avgResolution = grievances.filter((g: any) => g.status === "resolved").reduce((a: number, g: any) => a + (g.days_open || 0), 0) / (resolvedCount || 1);
  const criticalCount = grievances.filter((g: any) => g.priority === "critical" && g.status !== "resolved").length;

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Carregando reclamações...</div>;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><MessageSquare className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Ativas</p></div>
          <p className="text-2xl font-bold">{activeCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="h-4 w-4 text-success" /><p className="text-xs text-muted-foreground">Resolvidas</p></div>
          <p className="text-2xl font-bold text-success">{resolvedCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-warning" /><p className="text-xs text-muted-foreground">Média Resolução</p></div>
          <p className="text-2xl font-bold">{avgResolution.toFixed(0)}d</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-destructive" /><p className="text-xs text-muted-foreground">Críticas</p></div>
          <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
        </CardContent></Card>
      </div>

      {/* Escalation Flow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Scale className="h-5 w-5 text-primary" />Fluxo de Escalonamento — MLC Reg. 5.1.5</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {ESCALATION_LEVELS.map((level, i) => (
              <React.Fragment key={level.level}>
                <div className="text-center p-3 rounded-xl border bg-card min-w-[140px]">
                  <Badge variant="outline" className="mb-2">Nível {level.level}</Badge>
                  <p className="text-sm font-medium">{level.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">SLA: {level.sla} dias</p>
                </div>
                {i < ESCALATION_LEVELS.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grievance List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Registro de Reclamações</CardTitle>
              <CardDescription>Rastreamento com escalonamento e persistência real</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1"><Plus className="h-3 w-3" />Nova</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {showForm && (
            <div className="p-4 rounded-xl border bg-card/50 space-y-3">
              <h4 className="text-sm font-semibold">Nova Reclamação</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Título" value={newForm.title} onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))} />
                <Input placeholder="Reclamante" value={newForm.complainant} onChange={e => setNewForm(p => ({ ...p, complainant: e.target.value }))} />
                <Select value={newForm.category} onValueChange={v => setNewForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={newForm.priority} onValueChange={v => setNewForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea placeholder="Descrição detalhada..." value={newForm.description} onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))} />
              <Button size="sm" onClick={() => createMutation.mutate(newForm)} disabled={!newForm.title || !newForm.complainant || createMutation.isPending}>
                Registrar Reclamação
              </Button>
            </div>
          )}

          {grievances.map((g: any) => {
            const config = statusConfig[g.status] || statusConfig.filed;
            const slaLevel = ESCALATION_LEVELS.find(l => l.level === config.level);
            const slaProgress = slaLevel ? Math.min(((g.days_open || 0) / slaLevel.sla) * 100, 100) : 0;
            const canEscalate = !["resolved", "closed", "flag_state"].includes(g.status);

            return (
              <div key={g.id} className="p-4 rounded-xl border bg-card/50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{g.grievance_number}</span>
                      <Badge variant="outline" className={config.color}>{config.label}</Badge>
                      <Badge variant="outline" className={priorityColors[g.priority] || ""}>{g.priority}</Badge>
                    </div>
                    <p className="font-medium">{g.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{g.complainant}</span>
                      <span>{g.category}</span>
                      <span>{g.days_open || 0}d aberta</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {canEscalate && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => resolve(g.id)} className="gap-1 text-xs">
                          <CheckCircle className="h-3 w-3" />Resolver
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => escalate(g)} className="gap-1 text-xs">
                          <ArrowRight className="h-3 w-3" />Escalar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {slaLevel && g.status !== "resolved" && g.status !== "closed" && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>SLA Nível {slaLevel.level}: {slaLevel.sla}d</span>
                      <span className={slaProgress >= 80 ? "text-destructive" : ""}>{g.days_open || 0}/{slaLevel.sla}d</span>
                    </div>
                    <Progress value={slaProgress} className="h-1.5" />
                  </div>
                )}
                {g.resolution && (
                  <div className="p-2 rounded-lg bg-success/5 border border-success/20 text-xs">
                    <span className="font-medium text-success">Resolução:</span> {g.resolution}
                  </div>
                )}
              </div>
            );
          })}

          {grievances.length === 0 && (
            <p className="text-center py-4 text-muted-foreground text-sm">Nenhuma reclamação registrada. Use o botão "Nova" para criar.</p>
          )}
        </CardContent>
      </Card>

      {/* Compliance Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-success" />Checklist de Conformidade — Reg. 5.1.5</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-2">
            {[
              "Procedimento de reclamação publicado em idioma compreensível",
              "Cópia do SEA com procedimento de reclamação fornecida ao marítimo",
              "Oficial designado para receber reclamações a bordo (não Capitão)",
              "Garantia de não-retaliação ao reclamante",
              "Registro de reclamações mantido a bordo",
              "Marítimo informado sobre contato com Estado de Bandeira",
              "Procedimento de escalonamento em 4 níveis implementado",
              "Treinamento sobre procedimento de reclamação realizado",
            ].map((item, i) => (
              <div key={`checklist-${i}-${item.slice(0,20)}`} className="flex items-center gap-2 p-2 rounded-lg border bg-card/50">
                <CheckCircle className="h-4 w-4 text-success shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
