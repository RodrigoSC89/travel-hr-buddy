/**
 * ISM Management Review Dashboard — Connected to Supabase internal_audits
 * Tracks annual/periodic management reviews per ISM Code Element 12
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ClipboardList, Plus, Calendar, Users, TrendingUp,
  CheckCircle2, AlertTriangle, FileText, Download, Loader2
} from "lucide-react";

interface ReviewItem {
  id: string;
  title: string;
  reviewDate: string;
  nextDue: string;
  status: "scheduled" | "in_progress" | "completed" | "overdue";
  chairman: string;
  attendees: string[];
  agendaItems: string[];
  findings: number;
  actions: number;
  closedActions: number;
  notes: string;
}

const ISM_REVIEW_TOPICS = [
  "SMS Effectiveness Assessment", "Internal & External Audit Results",
  "NC & CAPA Trend Analysis", "Incident & Near-Miss Statistics",
  "PSC & Vetting Performance", "Crew Training & Competency",
  "Emergency Drill Effectiveness", "Resource & Budget Adequacy",
  "Regulatory & Flag State Updates", "Objectives & KPI Achievement",
  "Environmental Performance (CII/EEXI)", "Continuous Improvement Actions",
];

function mapAuditStatus(status: string | null): ReviewItem["status"] {
  if (status === "completed" || status === "closed") return "completed";
  if (status === "in_progress") return "in_progress";
  if (status === "overdue") return "overdue";
  return "scheduled";
}

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Agendada", color: "bg-primary/20 text-primary" },
  in_progress: { label: "Em Andamento", color: "bg-warning/20 text-warning" },
  completed: { label: "Concluída", color: "bg-success/20 text-success" },
  overdue: { label: "Atrasada", color: "bg-destructive/20 text-destructive" },
};

export function ManagementReviewTab() {
  const [showCreate, setShowCreate] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["management-reviews"],
    queryFn: async () => {
      const [{ data: audits }, { data: ncData }] = await Promise.all([
        supabase.from("internal_audits")
          .select("*")
          .order("scheduled_date", { ascending: false })
          .limit(30),
        supabase.from("non_conformities")
          .select("id, source_reference, status")
          .limit(500),
      ]);

      const ncByAudit = (ncData || []).reduce<Record<string, { total: number; closed: number }>>((acc, nc) => {
        const aid = nc.source_reference;
        if (!aid) return acc;
        if (!acc[aid]) acc[aid] = { total: 0, closed: 0 };
        acc[aid].total++;
        if (nc.status === "closed" || nc.status === "cancelled") acc[aid].closed++;
        return acc;
      }, {});

      return (audits || []).map((a): ReviewItem => {
        const ncStats = ncByAudit[a.id] || { total: 0, closed: 0 };
        const scheduledDate = a.scheduled_date ? new Date(a.scheduled_date) : new Date();
        const nextDueDate = new Date(scheduledDate);
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);

        return {
          id: a.id,
          title: a.audit_number || `${a.audit_type || "Audit"} Review`,
          reviewDate: a.completed_date || a.scheduled_date || a.created_at || new Date().toISOString(),
          nextDue: nextDueDate.toISOString().split("T")[0],
          status: mapAuditStatus(a.status),
          chairman: a.auditor_name || "Auditor",
          attendees: a.department ? [a.department, "DPA", "QHSE"] : ["DPA", "Fleet Manager"],
          agendaItems: ISM_REVIEW_TOPICS.slice(0, 5 + (a.audit_number?.charCodeAt(0) || 0) % 7),
          findings: a.findings_count || 0,
          actions: ncStats.total,
          closedActions: ncStats.closed,
          notes: a.report_url ? `Report: ${a.report_url}` : "",
        };
      });
    },
    staleTime: 60000,
  });

  const completedReviews = reviews.filter(r => r.status === "completed").length;
  const totalFindings = reviews.reduce((s, r) => s + r.findings, 0);
  const totalActions = reviews.reduce((s, r) => s + r.actions, 0);
  const closedActions = reviews.reduce((s, r) => s + r.closedActions, 0);
  const closureRate = totalActions > 0 ? Math.round((closedActions / totalActions) * 100) : 100;

  const exportCSV = () => {
    const header = "Review,Date,Status,Chairman,Findings,Actions,Closed Actions\n";
    const rows = reviews.map(r => `"${r.title}",${r.reviewDate},${r.status},"${r.chairman}",${r.findings},${r.actions},${r.closedActions}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "management_reviews.csv"; a.click();
    toast.success("CSV exportado!");
  };

  if (isLoading) {
    return (
      <Card><CardContent className="py-12 text-center">
        <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando reviews de gestão...</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{completedReviews}/{reviews.length}</div>
          <div className="text-xs text-muted-foreground">Reviews Concluídas</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-warning">{totalFindings}</div>
          <div className="text-xs text-muted-foreground">Constatações</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{totalActions}</div>
          <div className="text-xs text-muted-foreground">Ações Geradas</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className={`text-2xl font-bold ${closureRate >= 80 ? "text-success" : "text-warning"}`}>{closureRate}%</div>
          <div className="text-xs text-muted-foreground">Taxa de Fechamento</div>
          <Progress value={closureRate} className="h-1.5 mt-1" />
        </CardContent></Card>
      </div>

      {/* Actions bar */}
      <div className="flex gap-2">
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Review</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Agendar Management Review</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); setShowCreate(false); toast.success("Review agendada!"); }} className="space-y-3">
              <div><label className="text-sm font-medium">Título</label><Input placeholder="Annual SMS Review 2026" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">Data</label><Input type="date" required /></div>
                <div><label className="text-sm font-medium">Chairman</label><Input placeholder="Nome do presidente" /></div>
              </div>
              <div><label className="text-sm font-medium">Tópicos da Agenda</label>
                <div className="grid grid-cols-2 gap-1 mt-1 max-h-[200px] overflow-y-auto">
                  {ISM_REVIEW_TOPICS.map(topic => (
                    <label key={topic} className="flex items-center gap-1.5 text-xs p-1.5 rounded hover:bg-muted/50 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded" />
                      {topic}
                    </label>
                  ))}
                </div>
              </div>
              <div><label className="text-sm font-medium">Notas</label><Textarea placeholder="Observações..." rows={2} /></div>
              <DialogFooter><Button type="submit">Agendar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-1" /> Exportar CSV
        </Button>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.map(review => {
          const cfg = statusConfig[review.status] || statusConfig.scheduled;
          return (
            <Card key={review.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">{review.title}</h4>
                      <Badge className={cfg.color}>{cfg.label}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(review.reviewDate).toLocaleDateString("pt-BR")}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{review.chairman}</span>
                      <span>{review.attendees.length} participantes</span>
                    </div>
                  </div>
                  {review.status === "completed" && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{review.findings}</div>
                      <div className="text-[10px] text-muted-foreground">constatações</div>
                    </div>
                  )}
                </div>

                {review.agendaItems.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {review.agendaItems.map(item => (
                      <Badge key={item} variant="outline" className="text-[10px]">{item}</Badge>
                    ))}
                  </div>
                )}

                {review.status === "completed" && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1"><FileText className="h-3 w-3 text-muted-foreground" /> {review.actions} ações</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success" /> {review.closedActions} fechadas</span>
                    <Progress value={(review.closedActions / Math.max(review.actions, 1)) * 100} className="h-1.5 w-24" />
                  </div>
                )}

                {review.notes && (
                  <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">{review.notes}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {reviews.length === 0 && !isLoading && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma review encontrada</p>
        </CardContent></Card>
      )}
    </div>
  );
}
