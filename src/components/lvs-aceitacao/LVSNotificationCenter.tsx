/**
 * LVS Notification Center & Deadlines
 * Central de alertas com countdown, prazos, responsáveis pendentes e lembretes
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Bell, BellRing, Clock, AlertTriangle, Calendar,
  CheckCircle2, XCircle, Timer, TrendingDown,
  Users, ChevronRight, Zap, Target, Mail
} from "lucide-react";
import { ALL_LVS_SECTIONS, type LVItem, type Section } from "./lvs-data";
import { differenceInDays, format, addDays, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notification {
  id: string;
  type: "overdue" | "upcoming" | "nc_unresolved" | "section_critical" | "milestone";
  severity: "critical" | "high" | "medium" | "info";
  title: string;
  description: string;
  section?: string;
  ref?: string;
  dueDate?: Date;
  isRead: boolean;
  createdAt: Date;
}

const SEVERITY_CONFIG = {
  critical: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", badge: "bg-destructive" },
  high: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30", badge: "bg-orange-500" },
  medium: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30", badge: "bg-amber-500" },
  info: { icon: Bell, color: "text-primary", bg: "bg-primary/10 border-primary/30", badge: "bg-primary" }
};

const flattenItems = (section: Section): LVItem[] =>
  section.subsections.flatMap(sub => sub.items);

export const LVSNotificationCenter: React.FC = () => {
  const [acceptanceDate, setAcceptanceDate] = useState<string>(
    format(addDays(new Date(), 30), "yyyy-MM-dd")
  );
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [showReadNotifications, setShowReadNotifications] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const targetDate = useMemo(() => new Date(acceptanceDate), [acceptanceDate]);
  const daysRemaining = useMemo(() => differenceInDays(targetDate, new Date()), [targetDate]);

  const notifications = useMemo<Notification[]>(() => {
    const notifs: Notification[] = [];
    let idx = 0;

    ALL_LVS_SECTIONS.forEach(section => {
      const items = flattenItems(section);
      const ncItems = items.filter((i: LVItem) => i.status === "rejected");
      const pendingItems = items.filter((i: LVItem) => i.status === "pending" || i.status === "not_verified");
      const naCount = items.filter((i: LVItem) => i.status === "not_applicable").length;
      const approvedCount = items.filter((i: LVItem) => i.status === "approved").length;
      const applicable = items.length - naCount;
      const score = applicable > 0 ? Math.round((approvedCount / applicable) * 100) : 100;

      // NC alerts
      ncItems.forEach((item: LVItem) => {
        const deadline = item.deadline ? new Date(item.deadline) : null;
        const isOverdue = deadline && isPast(deadline);

        notifs.push({
          id: `nc-${idx++}`,
          type: isOverdue ? "overdue" : "nc_unresolved",
          severity: isOverdue ? "critical" : "high",
          title: isOverdue ? `NC VENCIDA — ${item.ref}` : `NC Aberta — ${item.ref}`,
          description: `${item.question.substring(0, 80)}...`,
          section: section.code,
          ref: item.ref,
          dueDate: deadline || undefined,
          isRead: false,
          createdAt: new Date()
        });
      });

      // Section critical alert
      if (score < 50 && applicable > 0) {
        notifs.push({
          id: `section-${idx++}`,
          type: "section_critical",
          severity: score < 30 ? "critical" : "high",
          title: `Seção ${section.code} em risco: ${score}%`,
          description: `${section.title} — ${ncItems.length} NCs, ${pendingItems.length} pendentes de ${applicable} itens aplicáveis`,
          section: section.code,
          isRead: false,
          createdAt: new Date()
        });
      }

      // Upcoming deadlines
      items.forEach((item: LVItem) => {
        if (item.deadline && item.status !== "approved" && item.status !== "not_applicable") {
          const deadline = new Date(item.deadline);
          const daysUntil = differenceInDays(deadline, new Date());
          if (daysUntil > 0 && daysUntil <= 7) {
            notifs.push({
              id: `upcoming-${idx++}`,
              type: "upcoming",
              severity: daysUntil <= 2 ? "high" : "medium",
              title: `Prazo em ${daysUntil} dia(s) — ${item.ref}`,
              description: item.question.substring(0, 80),
              section: section.code,
              ref: item.ref,
              dueDate: deadline,
              isRead: false,
              createdAt: new Date()
            });
          }
        }
      });
    });

    // Milestone alerts based on countdown
    if (daysRemaining <= 7 && daysRemaining > 0) {
      notifs.push({
        id: `milestone-week`,
        type: "milestone",
        severity: "critical",
        title: `⚠️ Apenas ${daysRemaining} dia(s) para a aceitação!`,
        description: "Verifique todas as seções críticas e NCs pendentes antes da inspeção Petrobras.",
        isRead: false,
        createdAt: new Date()
      });
    }

    if (daysRemaining <= 0) {
      notifs.push({
        id: `milestone-overdue`,
        type: "milestone",
        severity: "critical",
        title: "🔴 Data de aceitação ultrapassada!",
        description: "A data de aceitação Petrobras já passou. Atualize o cronograma ou entre em contato com o inspetor.",
        isRead: false,
        createdAt: new Date()
      });
    }

    return notifs.map(n => ({ ...n, isRead: readIds.has(n.id) }));
  }, [readIds, daysRemaining]);

  const filtered = useMemo(() => {
    let result = notifications;
    if (filterSeverity !== "all") result = result.filter(n => n.severity === filterSeverity);
    if (!showReadNotifications) result = result.filter(n => !n.isRead);
    return result.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, info: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [notifications, filterSeverity, showReadNotifications]);

  const severityCounts = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, info: 0 };
    notifications.filter(n => !n.isRead).forEach(n => counts[n.severity]++);
    return counts;
  }, [notifications]);

  const markAsRead = (id: string) => setReadIds(prev => new Set([...prev, id]));
  const markAllAsRead = () => setReadIds(new Set(notifications.map(n => n.id)));

  const getCountdownColor = () => {
    if (daysRemaining <= 0) return "text-destructive";
    if (daysRemaining <= 7) return "text-orange-500";
    if (daysRemaining <= 14) return "text-amber-500";
    return "text-emerald-500";
  };

  return (
    <div className="space-y-6">
      {/* Countdown Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6 flex items-center gap-6">
            <div className="text-center">
              <div className={`text-6xl font-black ${getCountdownColor()}`}>
                {Math.max(0, daysRemaining)}
              </div>
              <div className="text-xs text-muted-foreground font-medium mt-1">dias restantes</div>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <Label className="text-xs">Data de Aceitação Petrobras</Label>
                <Input
                  type="date"
                  value={acceptanceDate}
                  onChange={e => setAcceptanceDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <Progress value={Math.max(0, Math.min(100, ((30 - daysRemaining) / 30) * 100))} className="h-2" />
              <div className="text-[10px] text-muted-foreground">
                {daysRemaining > 0
                  ? `Aceitação em ${format(targetDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                  : "Data ultrapassada — atualize o cronograma"}
              </div>
            </div>
          </CardContent>
        </Card>

        {(["critical", "high", "medium", "info"] as const).map(level => {
          const config = SEVERITY_CONFIG[level];
          const Icon = config.icon;
          return (
            <Card key={level} className={`cursor-pointer transition-colors ${filterSeverity === level ? "ring-2 ring-primary" : ""}`}
              onClick={() => setFilterSeverity(filterSeverity === level ? "all" : level)}>
              <CardContent className="pt-4 flex items-center gap-3">
                <Icon className={`h-8 w-8 ${config.color}`} />
                <div>
                  <div className="text-2xl font-black">{severityCounts[level]}</div>
                  <div className="text-[10px] text-muted-foreground capitalize">{level}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BellRing className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">
            {filtered.length} notificação(ões)
            {filterSeverity !== "all" && (
              <Badge variant="secondary" className="text-[10px] ml-2 cursor-pointer" onClick={() => setFilterSeverity("all")}>
                {filterSeverity} ✕
              </Badge>
            )}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs">
            <Switch checked={showReadNotifications} onCheckedChange={setShowReadNotifications} />
            Mostrar lidas
          </label>
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="text-xs h-7">
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <ScrollArea className="max-h-[500px]">
        <div className="space-y-2">
          {filtered.map(notif => {
            const config = SEVERITY_CONFIG[notif.severity];
            const Icon = config.icon;
            return (
              <Card
                key={notif.id}
                className={`border ${config.bg} ${notif.isRead ? "opacity-50" : ""} transition-all hover:shadow-md cursor-pointer`}
                onClick={() => markAsRead(notif.id)}
              >
                <CardContent className="py-3 px-4 flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{notif.title}</span>
                      {notif.section && (
                        <Badge variant="outline" className="text-[9px]">S{notif.section}</Badge>
                      )}
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.description}</p>
                    {notif.dueDate && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Prazo: {format(notif.dueDate, "dd/MM/yyyy")}
                        {isPast(notif.dueDate) && <Badge className="bg-destructive text-[9px] ml-1">VENCIDO</Badge>}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
              <p className="text-sm font-semibold">Tudo em dia!</p>
              <p className="text-xs">Nenhuma notificação pendente para os filtros selecionados.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
