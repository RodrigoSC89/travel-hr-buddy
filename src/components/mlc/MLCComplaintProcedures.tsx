/**
 * MLC Complaint Procedures — Reg. 5.1.5
 * Onboard complaint tracking with resolution workflow — Real Supabase CRUD
 */
import React, { useState } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageSquare, Plus, CheckCircle, Shield,
  Download, ArrowRight, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";

type ComplaintStatus = "received" | "investigating" | "resolved" | "escalated" | "closed";
type ComplaintCategory = "wages" | "accommodation" | "food" | "hours" | "safety" | "discrimination" | "repatriation" | "other";

interface Complaint {
  id: string;
  date: string;
  complainant: string;
  rank: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  assignedTo: string;
  resolution: string;
  escalationLevel: number;
  daysOpen: number;
  confidential: boolean;
}

const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  wages: "Salários / Pagamentos", accommodation: "Acomodações", food: "Alimentação",
  hours: "Horas de Trabalho/Descanso", safety: "Saúde e Segurança",
  discrimination: "Discriminação / Assédio", repatriation: "Repatriação", other: "Outros",
};

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  received: { label: "Recebida", variant: "outline" },
  investigating: { label: "Em Investigação", variant: "secondary" },
  resolved: { label: "Resolvida", variant: "default" },
  escalated: { label: "Escalada", variant: "destructive" },
  closed: { label: "Encerrada", variant: "outline" },
};

const ESCALATION_LABELS = ["Bordo (Comandante)", "Empresa (Armador)", "Estado de Bandeira", "Estado do Porto"];

export function MLCComplaintProcedures() {
  const queryClient = useQueryClient();
  const [showNewForm, setShowNewForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [newComplaint, setNewComplaint] = useState({ complainant: "", rank: "", category: "other" as ComplaintCategory, description: "" });

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["mlc-complaints"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("mlc_complaints")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        date: (row.date as string) || (row.created_at as string),
        complainant: (row.complainant as string) || "Anônimo",
        rank: (row.rank as string) || "",
        category: (row.category as ComplaintCategory) || "other",
        description: (row.description as string) || "",
        status: (row.status as ComplaintStatus) || "received",
        assignedTo: (row.assigned_to as string) || "",
        resolution: (row.resolution as string) || "",
        escalationLevel: (row.escalation_level as number) || 0,
        daysOpen: (row.days_open as number) || Math.ceil((Date.now() - new Date(row.created_at as string).getTime()) / 86400000),
        confidential: (row.confidential as boolean) ?? true,
      })) as Complaint[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (c: typeof newComplaint) => {
      const { error } = await fromUntyped("mlc_complaints").insert({
        complainant: c.complainant || "Anônimo",
        rank: c.rank,
        category: c.category,
        description: c.description,
        status: "received",
        confidential: true,
        escalation_level: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mlc-complaints"] });
      setShowNewForm(false);
      setNewComplaint({ complainant: "", rank: "", category: "other", description: "" });
      toast.success("Reclamação registrada com confidencialidade");
    },
    onError: () => toast.error("Erro ao registrar reclamação"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await fromUntyped("mlc_complaints")
        .update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mlc-complaints"] }),
  });

  const filtered = filterStatus === "all" ? complaints : complaints.filter(c => c.status === filterStatus);
  const openCount = complaints.filter(c => c.status !== "resolved" && c.status !== "closed").length;
  const resolvedCount = complaints.filter(c => c.status === "resolved" || c.status === "closed").length;
  const escalatedCount = complaints.filter(c => c.status === "escalated").length;
  const avgDays = complaints.length > 0 ? Math.round(complaints.reduce((a, c) => a + c.daysOpen, 0) / complaints.length) : 0;

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2 text-muted-foreground">Carregando...</span></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Procedimentos de Reclamação a Bordo
          </h3>
          <p className="text-sm text-muted-foreground">MLC Reg. 5.1.5 • Dados reais Supabase</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1 h-9" onClick={() => quickExport(complaints, "MLC Complaints")}>
            <Download className="h-3 w-3" /> Exportar
          </Button>
          <Button size="sm" className="gap-1 h-9" onClick={() => setShowNewForm(!showNewForm)}>
            <Plus className="h-3 w-3" /> Nova Reclamação
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{complaints.length}</p></CardContent></Card>
        <Card className="border-warning/20"><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Abertas</p><p className="text-2xl font-bold text-warning">{openCount}</p></CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Resolvidas</p><p className="text-2xl font-bold text-success">{resolvedCount}</p></CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Escaladas</p><p className="text-2xl font-bold text-destructive">{escalatedCount}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Tempo Médio</p><p className="text-2xl font-bold">{avgDays}d</p></CardContent></Card>
      </div>

      {/* Escalation Flow */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Fluxo de Escalação — MLC Standard A5.1.5</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-1">
            {ESCALATION_LABELS.map((label, idx) => (
              <React.Fragment key={idx}>
                <div className={`flex-1 text-center p-2 rounded text-xs font-medium ${
                  idx === 0 ? "bg-primary/10 text-primary" : idx === 1 ? "bg-warning/10 text-warning" : idx === 2 ? "bg-warning/20 text-warning" : "bg-destructive/10 text-destructive"
                }`}>
                  <p className="font-bold">Nível {idx + 1}</p><p>{label}</p>
                </div>
                {idx < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Form */}
      {showNewForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Registrar Nova Reclamação</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Nome (ou 'Anônimo')" className="h-9" value={newComplaint.complainant} onChange={e => setNewComplaint({ ...newComplaint, complainant: e.target.value })} />
              <Input placeholder="Função/Posto" className="h-9" value={newComplaint.rank} onChange={e => setNewComplaint({ ...newComplaint, rank: e.target.value })} />
              <Select value={newComplaint.category} onValueChange={v => setNewComplaint({ ...newComplaint, category: v as ComplaintCategory })}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Textarea placeholder="Descrição detalhada da reclamação..." rows={3} value={newComplaint.description} onChange={e => setNewComplaint({ ...newComplaint, description: e.target.value })} />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => addMutation.mutate(newComplaint)} disabled={addMutation.isPending || !newComplaint.description}>
                {addMutation.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Shield className="h-3 w-3 mr-1" />} Registrar (Confidencial)
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowNewForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-48 h-9"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Status</SelectItem>
          <SelectItem value="received">Recebida</SelectItem>
          <SelectItem value="investigating">Investigando</SelectItem>
          <SelectItem value="resolved">Resolvida</SelectItem>
          <SelectItem value="escalated">Escalada</SelectItem>
        </SelectContent>
      </Select>

      {/* Complaints List */}
      {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma reclamação registrada.</p>}
      <div className="space-y-2">
        {filtered.map(complaint => (
          <Card key={complaint.id} className={complaint.status === "escalated" ? "border-destructive/20" : complaint.status === "resolved" ? "border-success/20" : ""}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={STATUS_CONFIG[complaint.status].variant} className="text-xs">{STATUS_CONFIG[complaint.status].label}</Badge>
                    <Badge variant="secondary" className="text-xs">{CATEGORY_LABELS[complaint.category]}</Badge>
                    {complaint.confidential && <Badge variant="outline" className="text-xs"><Shield className="h-2.5 w-2.5 mr-0.5" />Confidencial</Badge>}
                    <Badge variant="outline" className="text-xs">Nível {complaint.escalationLevel + 1}</Badge>
                  </div>
                  <p className="text-sm">{complaint.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{complaint.complainant} ({complaint.rank})</span>
                    <span>{new Date(complaint.date).toLocaleDateString("pt-BR")}</span>
                    <span>{complaint.daysOpen} dias</span>
                    {complaint.assignedTo && <span>→ {complaint.assignedTo}</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {complaint.status === "investigating" && (
                    <Button size="sm" variant="default" className="gap-1 h-7 text-xs"
                      onClick={() => { updateMutation.mutate({ id: complaint.id, updates: { status: "resolved", resolution: "Resolvida pelo responsável" } }); toast.success("Resolvida"); }}>
                      <CheckCircle className="h-3 w-3" /> Resolver
                    </Button>
                  )}
                  {(complaint.status === "received" || complaint.status === "investigating") && (
                    <Button size="sm" variant="destructive" className="gap-1 h-7 text-xs"
                      onClick={() => { updateMutation.mutate({ id: complaint.id, updates: { status: "escalated", escalation_level: Math.min(complaint.escalationLevel + 1, 3) } }); toast.warning("Escalada"); }}>
                      Escalar
                    </Button>
                  )}
                </div>
              </div>
              {complaint.resolution && (
                <div className="p-2 rounded bg-success/5 border border-success/20 text-xs">
                  <strong>Resolução:</strong> {complaint.resolution}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
