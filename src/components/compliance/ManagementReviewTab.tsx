/**
 * ISM Management Review Dashboard
 * Tracks annual/periodic management reviews per ISM Code Element 12
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ClipboardList, Plus, Calendar, Users, TrendingUp,
  CheckCircle2, AlertTriangle, FileText, Download
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

const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: "1", title: "Annual SMS Review 2025", reviewDate: "2025-01-15", nextDue: "2026-01-15",
    status: "completed", chairman: "Capt. J. Silva", attendees: ["DPA", "Fleet Manager", "QHSE Manager", "Technical Superintendent"],
    agendaItems: ["SMS effectiveness", "Audit results", "NC trends", "Training effectiveness", "Resource adequacy"],
    findings: 8, actions: 12, closedActions: 9, notes: "Overall positive review. Focus areas: bridge team management and PSC findings."
  },
  {
    id: "2", title: "Q2 Management Review", reviewDate: "2025-06-20", nextDue: "2025-09-20",
    status: "completed", chairman: "COO M. Santos", attendees: ["DPA", "Crew Manager", "Technical Director"],
    agendaItems: ["KPI review", "Incident trends", "Crew feedback", "Regulatory updates"],
    findings: 5, actions: 7, closedActions: 4, notes: "Crew wellbeing improvements noted. New MLC amendments require policy update."
  },
  {
    id: "3", title: "Q3 Management Review", reviewDate: "2025-09-20", nextDue: "2025-12-20",
    status: "scheduled", chairman: "DPA R. Oliveira", attendees: ["Fleet Manager", "QHSE Manager"],
    agendaItems: ["ISM audit prep", "CII performance", "Drydock planning"],
    findings: 0, actions: 0, closedActions: 0, notes: ""
  },
];

const ISM_REVIEW_TOPICS = [
  "SMS Effectiveness Assessment",
  "Internal & External Audit Results",
  "NC & CAPA Trend Analysis",
  "Incident & Near-Miss Statistics",
  "PSC & Vetting Performance",
  "Crew Training & Competency",
  "Emergency Drill Effectiveness",
  "Resource & Budget Adequacy",
  "Regulatory & Flag State Updates",
  "Objectives & KPI Achievement",
  "Environmental Performance (CII/EEXI)",
  "Continuous Improvement Actions",
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  scheduled: { label: "Agendada", color: "bg-primary/20 text-primary", icon: Calendar },
  in_progress: { label: "Em Andamento", color: "bg-warning/20 text-warning", icon: TrendingUp },
  completed: { label: "Concluída", color: "bg-success/20 text-success", icon: CheckCircle2 },
  overdue: { label: "Atrasada", color: "bg-destructive/20 text-destructive", icon: AlertTriangle },
};

export function ManagementReviewTab() {
  const [reviews] = useState<ReviewItem[]>(MOCK_REVIEWS);
  const [showCreate, setShowCreate] = useState(false);

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
          const cfg = statusConfig[review.status];
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
    </div>
  );
}
