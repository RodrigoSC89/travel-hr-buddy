/**
 * PEOTRAM NC Action Plan Tracker
 * PRODUCTION: Wired to Supabase peotram_nc_actions
 */
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle, CheckCircle, Clock, Plus, Download, Target,
  Users, Calendar, ArrowRight, FileText, Shield, Eye
} from "lucide-react";
import { toast } from "sonner";

type NCPriority = "A" | "B" | "C" | "D";
type NCStatus = "open" | "in_progress" | "evidence_pending" | "verification" | "closed";

interface NCActionItem {
  id: string;
  nc_number: string;
  element: number;
  element_name: string;
  item_id: string;
  description: string;
  root_cause: string;
  corrective_action: string;
  preventive_action: string;
  priority: NCPriority;
  status: NCStatus;
  responsible: string;
  responsible_email: string;
  due_date: string;
  created_at: string;
  closed_at: string | null;
  evidence_count: number;
  verified_by: string | null;
  escalated: boolean;
  percent_complete: number;
}

const PRIORITY_CONFIG: Record<NCPriority, { label: string; deadline: string; color: string; days: number }> = {
  A: { label: "Crítica", deadline: "10 dias", color: "bg-destructive text-destructive-foreground", days: 10 },
  B: { label: "Maior", deadline: "15 dias", color: "bg-destructive/80 text-destructive-foreground", days: 15 },
  C: { label: "Menor", deadline: "30 dias", color: "bg-warning text-warning-foreground", days: 30 },
  D: { label: "Observação", deadline: "60 dias", color: "bg-muted text-foreground", days: 60 },
};

const STATUS_CONFIG: Record<NCStatus, { label: string; color: string; icon: React.ReactNode }> = {
  open: { label: "Aberta", color: "border-destructive/30 bg-destructive/5", icon: <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> },
  in_progress: { label: "Em Andamento", color: "border-warning/30 bg-warning/5", icon: <Clock className="h-3.5 w-3.5 text-warning" /> },
  evidence_pending: { label: "Aguardando Evidência", color: "border-primary/30 bg-primary/5", icon: <FileText className="h-3.5 w-3.5 text-primary" /> },
  verification: { label: "Em Verificação", color: "border-blue-500/30 bg-blue-500/5", icon: <Eye className="h-3.5 w-3.5 text-blue-400" /> },
  closed: { label: "Fechada", color: "border-success/30 bg-success/5", icon: <CheckCircle className="h-3.5 w-3.5 text-success" /> },
};

export function PeotramNCActionPlan() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();

  const { data: ncs = [] } = useQuery({
    queryKey: ['peotram-nc-actions'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('peotram_nc_actions')
        .select('*').order('priority').order('due_date');
      if (error) throw error;
      return (data || []) as NCActionItem[];
    },
  });

  const addNC = useMutation({
    mutationFn: async (nc: Partial<NCActionItem>) => {
      const { error } = await (supabase.from as Function)('peotram_nc_actions').insert(nc);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peotram-nc-actions'] });
      toast.success('NC registrada com sucesso');
      setShowAdd(false);
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: NCStatus }) => {
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (status === 'closed') {
        updates.closed_at = new Date().toISOString().split('T')[0];
        updates.percent_complete = 100;
      }
      const { error } = await (supabase.from as Function)('peotram_nc_actions')
        .update(updates as never).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peotram-nc-actions'] });
      toast.success('Status da NC atualizado');
    },
  });

  const filtered = useMemo(() => ncs.filter(nc =>
    (filterStatus === "all" || nc.status === filterStatus) &&
    (filterPriority === "all" || nc.priority === filterPriority)
  ), [ncs, filterStatus, filterPriority]);

  const openNCs = ncs.filter(nc => nc.status !== "closed");
  const now = Date.now();
  const overdueNCs = openNCs.filter(nc => nc.due_date && new Date(nc.due_date).getTime() < now);
  const criticalNCs = openNCs.filter(nc => nc.priority === "A");
  const closedNCs = ncs.filter(nc => nc.status === "closed");
  const closureRate = ncs.length > 0 ? Math.round((closedNCs.length / ncs.length) * 100) : 0;
  const avgCompletion = openNCs.length > 0 ? Math.round(openNCs.reduce((a, nc) => a + Number(nc.percent_complete || 0), 0) / openNCs.length) : 0;

  const getDaysRemaining = (dueDate: string) => {
    if (!dueDate) return 999;
    return Math.ceil((new Date(dueDate).getTime() - now) / 86400000);
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const priority = String(fd.get('priority') || 'C') as NCPriority;
    addNC.mutate({
      nc_number: `PEOTRAM-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      element: Number(fd.get('element') || 1),
      element_name: String(fd.get('element_name')),
      item_id: String(fd.get('item_id') || ''),
      description: String(fd.get('description')),
      root_cause: String(fd.get('root_cause') || ''),
      corrective_action: String(fd.get('corrective_action') || ''),
      preventive_action: String(fd.get('preventive_action') || ''),
      priority,
      status: 'open',
      responsible: String(fd.get('responsible')),
      responsible_email: String(fd.get('responsible_email') || ''),
      due_date: String(fd.get('due_date')),
      evidence_count: 0,
      escalated: false,
      percent_complete: 0,
    } as any);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Plano de Ação — Não Conformidades
          </h3>
          <p className="text-sm text-muted-foreground">Rastreamento com prazos, responsáveis e escalação</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3 w-3" />Nova NC</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Registrar Não Conformidade</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <Textarea name="description" placeholder="Descrição da NC" required />
              <div className="grid grid-cols-3 gap-2">
                <Input name="element" type="number" placeholder="Elemento" required />
                <Input name="element_name" placeholder="Nome Elemento" required />
                <Input name="item_id" placeholder="Item ID" />
              </div>
              <Textarea name="root_cause" placeholder="Causa Raiz" />
              <Textarea name="corrective_action" placeholder="Ação Corretiva" />
              <Textarea name="preventive_action" placeholder="Ação Preventiva" />
              <div className="grid grid-cols-3 gap-2">
                <Select name="priority" defaultValue="C">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A - Crítica</SelectItem>
                    <SelectItem value="B">B - Maior</SelectItem>
                    <SelectItem value="C">C - Menor</SelectItem>
                    <SelectItem value="D">D - Observação</SelectItem>
                  </SelectContent>
                </Select>
                <Input name="responsible" placeholder="Responsável" required />
                <Input name="due_date" type="date" required />
              </div>
              <Input name="responsible_email" placeholder="Email responsável" />
              <Button type="submit" className="w-full">Registrar NC</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{ncs.length}</p>
          <p className="text-[10px] text-muted-foreground">Total NCs</p>
        </CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-destructive">{openNCs.length}</p>
          <p className="text-[10px] text-muted-foreground">Abertas</p>
        </CardContent></Card>
        <Card className={overdueNCs.length > 0 ? "border-destructive/40 bg-destructive/5" : ""}><CardContent className="pt-4 text-center">
          <p className={`text-2xl font-bold ${overdueNCs.length > 0 ? "text-destructive" : ""}`}>{overdueNCs.length}</p>
          <p className="text-[10px] text-muted-foreground">Vencidas</p>
        </CardContent></Card>
        <Card className="border-warning/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-warning">{criticalNCs.length}</p>
          <p className="text-[10px] text-muted-foreground">Críticas (A)</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-success">{closureRate}%</p>
          <p className="text-[10px] text-muted-foreground">Taxa Fechamento</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{avgCompletion}%</p>
          <p className="text-[10px] text-muted-foreground">Progresso Médio</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{k} — {v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* NC Cards */}
      {filtered.length === 0 && (
        <Card className="bg-muted/30"><CardContent className="py-8 text-center text-muted-foreground">
          Nenhuma NC registrada. Clique em "Nova NC" para começar.
        </CardContent></Card>
      )}

      <div className="space-y-3">
        {filtered.map(nc => {
          const daysRemaining = getDaysRemaining(nc.due_date);
          return (
            <Card key={nc.id} className={`${STATUS_CONFIG[nc.status]?.color || ''} ${nc.escalated ? "ring-1 ring-destructive/40" : ""}`}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {STATUS_CONFIG[nc.status]?.icon}
                      <Badge variant="outline" className="text-xs font-mono">{nc.nc_number}</Badge>
                      <Badge className={`text-[10px] ${PRIORITY_CONFIG[nc.priority as NCPriority]?.color || ''}`}>
                        {nc.priority} — {PRIORITY_CONFIG[nc.priority as NCPriority]?.label || nc.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">Elem. {nc.element} ({nc.element_name})</Badge>
                      {nc.escalated && <Badge variant="destructive" className="text-[10px]">ESCALADA</Badge>}
                    </div>
                    <p className="text-sm font-medium">{nc.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-lg font-bold ${daysRemaining < 0 ? "text-destructive" : daysRemaining <= 5 ? "text-warning" : ""}`}>
                      {nc.status === "closed" ? "✓" : daysRemaining < 0 ? `${Math.abs(daysRemaining)}d vencida` : `${daysRemaining}d`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Prazo: {nc.due_date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Progress value={Number(nc.percent_complete || 0)} className="flex-1 h-2" />
                  <span className="text-xs font-bold w-10 text-right">{nc.percent_complete}%</span>
                </div>

                <div className="grid md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1.5">
                    {nc.root_cause && <div><span className="text-muted-foreground">Causa Raiz:</span> {nc.root_cause}</div>}
                    {nc.corrective_action && <div><span className="text-muted-foreground">Ação Corretiva:</span> {nc.corrective_action}</div>}
                    {nc.preventive_action && <div><span className="text-muted-foreground">Ação Preventiva:</span> {nc.preventive_action}</div>}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1"><Users className="h-3 w-3 text-muted-foreground" /> {nc.responsible}</div>
                    <div className="flex items-center gap-1"><Calendar className="h-3 w-3 text-muted-foreground" /> Criada: {nc.created_at?.split('T')[0]}</div>
                    <div className="flex items-center gap-1"><FileText className="h-3 w-3 text-muted-foreground" /> {nc.evidence_count} evidência(s)</div>
                  </div>
                </div>

                {nc.status !== "closed" && (
                  <div className="flex gap-2 flex-wrap pt-1 border-t">
                    {nc.status === "open" && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => updateStatus.mutate({ id: nc.id, status: "in_progress" })}>
                        <ArrowRight className="h-3 w-3" /> Iniciar
                      </Button>
                    )}
                    {nc.status === "in_progress" && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => updateStatus.mutate({ id: nc.id, status: "evidence_pending" })}>
                        <FileText className="h-3 w-3" /> Enviar Evidências
                      </Button>
                    )}
                    {nc.status === "evidence_pending" && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => updateStatus.mutate({ id: nc.id, status: "verification" })}>
                        <Eye className="h-3 w-3" /> Solicitar Verificação
                      </Button>
                    )}
                    {nc.status === "verification" && (
                      <Button size="sm" className="gap-1 text-xs h-7 bg-success hover:bg-success/90" onClick={() => updateStatus.mutate({ id: nc.id, status: "closed" })}>
                        <CheckCircle className="h-3 w-3" /> Fechar NC
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
