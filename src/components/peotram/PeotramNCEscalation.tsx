import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ArrowRight, CheckCircle, Clock, FileText, Shield, Target, TrendingUp, Users, Loader2, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NCItem {
  id: string;
  element: string;
  elementId: number;
  description: string;
  classification: "A" | "B" | "C" | "D";
  status: "open" | "action_plan" | "implementing" | "verification" | "closed";
  responsible: string;
  openDate: string;
  dueDate: string;
  daysOpen: number;
  rootCause?: string;
  actionPlan?: string;
  escalated: boolean;
  escalationLevel: number;
  dbId?: string;
}

const CLASSIFICATIONS = {
  A: { label: "NC Maior — Sistema", color: "bg-destructive/10 text-destructive border-destructive/30", sla: 30, desc: "Falha sistêmica que compromete a eficácia do programa" },
  B: { label: "NC Menor — Processo", color: "bg-warning/10 text-warning border-warning/30", sla: 60, desc: "Desvio pontual que não compromete o sistema" },
  C: { label: "Observação", color: "bg-info/10 text-info border-info/30", sla: 90, desc: "Oportunidade de melhoria identificada" },
  D: { label: "Recomendação", color: "bg-primary/10 text-primary border-primary/30", sla: 120, desc: "Sugestão de melhoria ou boa prática" },
};

const STATUS_FLOW = [
  { key: "open", label: "Aberta", icon: AlertTriangle },
  { key: "action_plan", label: "Plano de Ação", icon: FileText },
  { key: "implementing", label: "Implementando", icon: Target },
  { key: "verification", label: "Verificação", icon: Shield },
  { key: "closed", label: "Encerrada", icon: CheckCircle },
];

const dynamicFrom = supabase.from as Function;

export const PeotramNCEscalation: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: ncs = [], isLoading } = useQuery({
    queryKey: ["peotram-ncs"],
    queryFn: async () => {
      const { data, error } = await dynamicFrom("peotram_nc_actions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      return (data || []).map((nc: any): NCItem => {
        const openDate = new Date(nc.created_at || nc.opened_at || new Date());
        const daysOpen = Math.round((Date.now() - openDate.getTime()) / 86400000);
        const severity = (nc.severity || nc.classification || "C").toUpperCase();
        const classification = ["A", "B", "C", "D"].includes(severity) ? severity : "C";

        return {
          id: nc.nc_number || nc.id?.slice(0, 8) || "NC-?",
          dbId: nc.id,
          element: nc.element_name || nc.area || `Elemento ${nc.element_id || "?"}`,
          elementId: nc.element_id || 0,
          description: nc.description || nc.finding || "Sem descrição",
          classification: classification as NCItem["classification"],
          status: (nc.status || "open") as NCItem["status"],
          responsible: nc.responsible || nc.assigned_to || "Não atribuído",
          openDate: openDate.toISOString().slice(0, 10),
          dueDate: nc.due_date?.slice(0, 10) || new Date(openDate.getTime() + 60 * 86400000).toISOString().slice(0, 10),
          daysOpen,
          rootCause: nc.root_cause,
          actionPlan: nc.action_plan || nc.corrective_action,
          escalated: nc.escalated || false,
          escalationLevel: nc.escalation_level || 0,
        };
      });
    },
  });

  const updateNC = useMutation({
    mutationFn: async ({ dbId, updates }: { dbId: string; updates: Record<string, any> }) => {
      const { error } = await dynamicFrom("peotram_nc_actions")
        .update(updates)
        .eq("id", dbId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peotram-ncs"] });
    },
  });

  const openCount = ncs.filter((nc: NCItem) => nc.status !== "closed").length;
  const overdueCount = ncs.filter((nc: NCItem) => {
    const due = new Date(nc.dueDate);
    return nc.status !== "closed" && due < new Date();
  }).length;
  const escalatedCount = ncs.filter((nc: NCItem) => nc.escalated).length;
  const closedRate = ncs.length > 0 ? Math.round((ncs.filter((nc: NCItem) => nc.status === "closed").length / ncs.length) * 100) : 0;

  const advanceStatus = (nc: NCItem) => {
    if (!nc.dbId) return;
    const flow: Record<string, string> = {
      open: "action_plan", action_plan: "implementing", implementing: "verification", verification: "closed",
    };
    const newStatus = flow[nc.status];
    if (!newStatus) return;
    updateNC.mutate({ dbId: nc.dbId, updates: { status: newStatus } });
    toast.success(`NC ${nc.id} avançada para ${newStatus}`);
  };

  const escalate = (nc: NCItem) => {
    if (!nc.dbId) return;
    updateNC.mutate({ dbId: nc.dbId, updates: { escalated: true, escalation_level: nc.escalationLevel + 1 } });
    toast.warning(`NC ${nc.id} escalonada para nível ${nc.escalationLevel + 1}`);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-warning" /><p className="text-xs text-muted-foreground">NCs Abertas</p></div>
          <p className="text-2xl font-bold text-warning">{openCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-destructive" /><p className="text-xs text-muted-foreground">Vencidas</p></div>
          <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-accent-foreground" /><p className="text-xs text-muted-foreground">Escalonadas</p></div>
          <p className="text-2xl font-bold text-accent-foreground">{escalatedCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="h-4 w-4 text-success" /><p className="text-xs text-muted-foreground">Taxa Encerr.</p></div>
          <p className="text-2xl font-bold text-success">{closedRate}%</p>
        </CardContent></Card>
      </div>

      {/* Status Flow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Fluxo de Tratamento de NCs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {STATUS_FLOW.map((step, i) => (
              <React.Fragment key={step.key}>
                <div className="text-center p-3 rounded-xl border bg-card min-w-[110px]">
                  <step.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium">{step.label}</p>
                  <p className="text-lg font-bold">{ncs.filter((nc: NCItem) => nc.status === step.key).length}</p>
                </div>
                {i < STATUS_FLOW.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Classification Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(CLASSIFICATIONS).map(([key, cfg]) => (
          <div key={key} className="p-3 rounded-xl border bg-card/50">
            <Badge variant="outline" className={cfg.color}>{key}</Badge>
            <p className="text-xs font-medium mt-1">{cfg.label}</p>
            <p className="text-xs text-muted-foreground">{cfg.desc}</p>
            <p className="text-xs text-muted-foreground mt-1">SLA: {cfg.sla} dias</p>
          </div>
        ))}
      </div>

      {/* NC List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Registro de Não Conformidades</CardTitle>
          <CardDescription>Rastreamento com escalonamento automático por SLA — {ncs.length} registros do Supabase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ncs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Nenhuma NC registrada no PEOTRAM.</p>
            </div>
          ) : ncs.map((nc: NCItem) => {
            const classCfg = CLASSIFICATIONS[nc.classification as keyof typeof CLASSIFICATIONS];
            const currentStep = STATUS_FLOW.findIndex(s => s.key === nc.status);
            const progress = ((currentStep + 1) / STATUS_FLOW.length) * 100;
            const isOverdue = new Date(nc.dueDate) < new Date() && nc.status !== "closed";
            const slaUsed = Math.round((nc.daysOpen / classCfg.sla) * 100);

            return (
              <div key={nc.dbId || nc.id} className={`p-4 rounded-xl border space-y-3 ${isOverdue ? "border-destructive/30 bg-destructive/5" : "bg-card/50"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{nc.id}</span>
                      <Badge variant="outline" className={classCfg.color}>{nc.classification} — {classCfg.label.split(" — ")[0]}</Badge>
                      {nc.escalated && <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">⬆ Escalonada L{nc.escalationLevel}</Badge>}
                      {isOverdue && <Badge variant="destructive">VENCIDA</Badge>}
                    </div>
                    <p className="font-medium">{nc.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>{nc.element}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{nc.responsible}</span>
                      <span>{nc.daysOpen}d aberta</span>
                    </div>
                    {nc.rootCause && <p className="text-xs"><span className="font-medium">Causa Raiz:</span> {nc.rootCause}</p>}
                    {nc.actionPlan && <p className="text-xs"><span className="font-medium">Plano:</span> {nc.actionPlan}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    {nc.status !== "closed" && nc.dbId && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => advanceStatus(nc)} className="gap-1 text-xs">
                          <ArrowRight className="h-3 w-3" />Avançar
                        </Button>
                        {!nc.escalated && (
                          <Button size="sm" variant="destructive" onClick={() => escalate(nc)} className="gap-1 text-xs">
                            <TrendingUp className="h-3 w-3" />Escalar
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground"><span>Progresso</span><span>{currentStep + 1}/{STATUS_FLOW.length}</span></div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground"><span>SLA ({classCfg.sla}d)</span><span className={slaUsed > 80 ? "text-destructive" : ""}>{nc.daysOpen}/{classCfg.sla}d</span></div>
                    <Progress value={Math.min(slaUsed, 100)} className="h-1.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
