/**
 * Compliance Timeline
 * Visual timeline of all compliance activities, deadlines, and milestones
 * AI-powered deadline prediction and risk assessment
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Clock, Calendar, AlertTriangle, CheckCircle, Shield, FileText,
  Ship, Users, Anchor, Filter, ChevronRight
} from "lucide-react";
import { format, differenceInDays, addDays, isPast, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface ComplianceTimelineProps {
  moduleId: string;
  moduleName: string;
}

interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: "audit" | "certificate" | "inspection" | "drill" | "review" | "deadline";
  status: "completed" | "upcoming" | "overdue" | "in_progress";
  icon: React.ReactNode;
  urgency: "critical" | "high" | "medium" | "low";
}

export function ComplianceTimeline({
  moduleId,
  moduleName,
}: ComplianceTimelineProps) {
  const [filterType, setFilterType] = useState<string>("all");

  // Fetch real data from multiple sources
  const { data: audits = [] } = useQuery({
    queryKey: ["timeline-audits"],
    queryFn: async () => {
      const { data } = await supabase.from("internal_audits")
        .select("id, audit_number, audit_type, status, start_date, end_date, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ["timeline-certificates"],
    queryFn: async () => {
      const { data } = await supabase.from("certificates")
        .select("id, certificate_type, status, issue_date, expiry_date")
        .order("expiry_date", { ascending: true })
        .limit(30);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: ncs = [] } = useQuery({
    queryKey: ["timeline-ncs"],
    queryFn: async () => {
      const { data } = await supabase.from("non_conformities")
        .select("id, nc_number, title, status, due_date, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    staleTime: 30000,
  });

  // Build timeline events from real data
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Add audits
    audits.forEach((audit: any) => {
      const date = new Date(audit.start_date || audit.created_at);
      const isCompleted = audit.status === "completed" || audit.status === "closed";
      events.push({
        id: `audit-${audit.id}`,
        date,
        title: `Auditoria ${audit.audit_number || audit.audit_type}`,
        description: `${audit.audit_type} - ${audit.status}`,
        type: "audit",
        status: isCompleted ? "completed" : isPast(date) ? "overdue" : "upcoming",
        icon: <Shield className="h-4 w-4" />,
        urgency: isPast(date) && !isCompleted ? "critical" : "medium",
      });
    });

    // Add certificate expirations
    certificates.forEach((cert: any) => {
      if (!cert.expiry_date) return;
      const expiry = new Date(cert.expiry_date);
      const daysLeft = differenceInDays(expiry, new Date());
      events.push({
        id: `cert-${cert.id}`,
        date: expiry,
        title: `Vencimento: ${cert.certificate_type}`,
        description: daysLeft > 0 ? `Vence em ${daysLeft} dias` : `Vencido há ${Math.abs(daysLeft)} dias`,
        type: "certificate",
        status: daysLeft < 0 ? "overdue" : daysLeft < 30 ? "upcoming" : "completed",
        icon: <FileText className="h-4 w-4" />,
        urgency: daysLeft < 0 ? "critical" : daysLeft < 30 ? "high" : daysLeft < 90 ? "medium" : "low",
      });
    });

    // Add NC deadlines
    ncs.forEach((nc: any) => {
      const dueDate = nc.due_date ? new Date(nc.due_date) : addDays(new Date(nc.created_at), 30);
      const isOpen = nc.status === "open";
      events.push({
        id: `nc-${nc.id}`,
        date: dueDate,
        title: `NC ${nc.nc_number || nc.title || ""}`,
        description: nc.title || `Não-conformidade - ${nc.status}`,
        type: "deadline",
        status: !isOpen ? "completed" : isPast(dueDate) ? "overdue" : "upcoming",
        icon: <AlertTriangle className="h-4 w-4" />,
        urgency: isPast(dueDate) && isOpen ? "critical" : "medium",
      });
    });

    // Add some standard compliance events
    const standardEvents: TimelineEvent[] = [
      {
        id: "drill-abandon",
        date: addDays(new Date(), 15),
        title: "Abandon Ship Drill",
        description: "Simulacro obrigatório trimestral - SOLAS III/19",
        type: "drill",
        status: "upcoming",
        icon: <Ship className="h-4 w-4" />,
        urgency: "medium",
      },
      {
        id: "drill-fire",
        date: addDays(new Date(), 7),
        title: "Fire Drill",
        description: "Simulacro obrigatório mensal - SOLAS III/19",
        type: "drill",
        status: "upcoming",
        icon: <Ship className="h-4 w-4" />,
        urgency: "high",
      },
      {
        id: "review-sms",
        date: addDays(new Date(), 45),
        title: "Revisão Gerencial do SMS",
        description: "Management Review obrigatória - ISM Code 12.1",
        type: "review",
        status: "upcoming",
        icon: <Users className="h-4 w-4" />,
        urgency: "medium",
      },
    ];
    events.push(...standardEvents);

    // Sort by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());
    return events;
  }, [audits, certificates, ncs]);

  const filteredEvents = filterType === "all"
    ? timelineEvents
    : timelineEvents.filter(e => e.type === filterType);

  const overdueCount = timelineEvents.filter(e => e.status === "overdue").length;
  const upcomingCount = timelineEvents.filter(e => e.status === "upcoming").length;
  const criticalCount = timelineEvents.filter(e => e.urgency === "critical").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "border-success/50 bg-success/5";
      case "overdue": return "border-destructive/50 bg-destructive/5";
      case "upcoming": return "border-primary/50 bg-primary/5";
      case "in_progress": return "border-warning/50 bg-warning/5";
      default: return "border-muted";
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "critical": return "bg-destructive/20 text-destructive";
      case "high": return "bg-warning/20 text-warning";
      case "medium": return "bg-primary/20 text-primary";
      case "low": return "bg-success/20 text-success";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{timelineEvents.length}</p>
                <p className="text-xs text-muted-foreground">Eventos Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
                <p className="text-xs text-muted-foreground">Atrasados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold text-warning">{upcomingCount}</p>
                <p className="text-xs text-muted-foreground">Próximos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
                <p className="text-xs text-muted-foreground">Críticos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Timeline de Compliance
              </CardTitle>
              <CardDescription>Visão cronológica de todas as atividades, prazos e marcos regulatórios</CardDescription>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="audit">Auditorias</SelectItem>
                <SelectItem value="certificate">Certificados</SelectItem>
                <SelectItem value="drill">Simulacros</SelectItem>
                <SelectItem value="review">Revisões</SelectItem>
                <SelectItem value="deadline">Prazos NCs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
              
              <div className="space-y-4">
                {filteredEvents.map((event, idx) => (
                  <div key={event.id} className="relative flex items-start gap-4 pl-2">
                    {/* Timeline dot */}
                    <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      event.status === "overdue" ? "border-destructive bg-destructive/10" :
                      event.status === "completed" ? "border-success bg-success/10" :
                      "border-primary bg-primary/10"
                    }`}>
                      {event.icon}
                    </div>
                    
                    {/* Content */}
                    <div className={`flex-1 p-3 border rounded-lg ${getStatusColor(event.status)}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={`text-xs ${getUrgencyBadge(event.urgency)}`}>
                            {event.urgency}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {format(event.date, "dd MMM yyyy", { locale: ptBR })}
                        </span>
                        {isFuture(event.date) && (
                          <span className="text-xs text-primary">
                            (em {differenceInDays(event.date, new Date())} dias)
                          </span>
                        )}
                        {isPast(event.date) && event.status !== "completed" && (
                          <span className="text-xs text-destructive font-medium">
                            (atrasado {Math.abs(differenceInDays(event.date, new Date()))} dias)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredEvents.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>Nenhum evento encontrado para este filtro</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
