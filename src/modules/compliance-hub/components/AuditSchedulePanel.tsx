/**
 * Audit Schedule Panel - Calendário de Auditorias e Inspeções
 * ✅ Integrado com Supabase - Zero Mock
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  CalendarDays, CheckCircle2, Clock, AlertTriangle, FileText, User,
  MapPin, Building2, Ship, Shield, Plus, ChevronLeft, ChevronRight,
  Bell, ClipboardCheck, Eye, Edit, Download, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AuditSchedulePanel() {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [showNewAudit, setShowNewAudit] = useState(false);
  const [formData, setFormData] = useState({ type: "", title: "", vessel: "", date: "", priority: "", auditor: "", notes: "" });

  // Fetch audits from internal_audits
  const { data: audits = [], isLoading } = useQuery({
    queryKey: ["audit-schedule"],
    queryFn: async () => {
      const { data } = await supabase
        .from("internal_audits")
        .select("*")
        .order("scheduled_date", { ascending: true })
        .limit(50);
      return (data || []).map((a) => ({
        id: a.id,
        type: a.audit_type || "internal",
        title: a.audit_number || "Auditoria",
        vessel: a.vessel_id || "",
        auditor: a.auditor_name || "",
        scheduledDate: new Date(a.scheduled_date || a.created_at || new Date()),
        status: a.status || "scheduled",
        priority: "medium",
        scope: [] as string[],
        preparationProgress: a.score || 0,
        findings: a.findings_count || 0,
        notes: a.department,
      }));
    },
  });

  // Create audit mutation
  const createAudit = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("internal_audits").insert({
        audit_number: data.title || `AUD-${Date.now()}`,
        audit_type: data.type,
        vessel_id: data.vessel || null,
        scheduled_date: data.date || new Date().toISOString(),
        auditor_name: data.auditor,
        department: data.notes,
        status: "scheduled",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-schedule"] });
      toast.success("Auditoria agendada com sucesso!");
      setShowNewAudit(false);
      setFormData({ type: "", title: "", vessel: "", date: "", priority: "", auditor: "", notes: "" });
    },
    onError: () => toast.error("Erro ao agendar auditoria"),
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const auditsThisMonth = audits.filter(
    (a) => a.scheduledDate >= monthStart && a.scheduledDate <= monthEnd
  );

  const upcomingAudits = audits.filter(
    (a) => a.status === "scheduled" && !isBefore(a.scheduledDate, new Date())
  ).sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());

  const completedAudits = audits.filter((a) => a.status === "completed").length;

  const getTypeBadge = (type: string) => {
    const config: Record<string, { label: string; color: string }> = {
      ism: { label: "ISM", color: "bg-blue-500/10 text-blue-500" },
      isps: { label: "ISPS", color: "bg-purple-500/10 text-purple-500" },
      sire: { label: "SIRE", color: "bg-amber-500/10 text-amber-500" },
      psc: { label: "PSC", color: "bg-red-500/10 text-red-500" },
      internal: { label: "Interna", color: "bg-green-500/10 text-green-500" },
      flag_state: { label: "Flag State", color: "bg-cyan-500/10 text-cyan-500" },
    };
    const c = config[type] || { label: type || "N/A", color: "bg-muted text-muted-foreground" };
    return <Badge className={c.color}>{c.label}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-red-500";
      case "high": return "text-amber-500";
      case "medium": return "text-blue-500";
      default: return "text-muted-foreground";
    }
  };

  const getAuditsByDate = (date: Date) => audits.filter((a) => isSameDay(a.scheduledDate, date));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Auditorias Este Mês</p><p className="text-2xl font-bold">{auditsThisMonth.length}</p></div>
              <CalendarDays className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Próximas</p><p className="text-2xl font-bold">{upcomingAudits.length}</p></div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Concluídas</p><p className="text-2xl font-bold">{completedAudits}</p></div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{audits.length}</p></div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Calendário de Auditorias</CardTitle>
              <CardDescription>{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="h-4 w-4" /></Button>
              <Dialog open={showNewAudit} onOpenChange={setShowNewAudit}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova Auditoria</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Agendar Nova Auditoria</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tipo</Label>
                        <Select value={formData.type} onValueChange={(v) => setFormData((p) => ({ ...p, type: v }))}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ism">ISM</SelectItem>
                            <SelectItem value="isps">ISPS</SelectItem>
                            <SelectItem value="sire">SIRE</SelectItem>
                            <SelectItem value="psc">PSC</SelectItem>
                            <SelectItem value="internal">Interna</SelectItem>
                            <SelectItem value="flag_state">Flag State</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Prioridade</Label>
                        <Select value={formData.priority} onValueChange={(v) => setFormData((p) => ({ ...p, priority: v }))}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="critical">Crítica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div><Label>Título</Label><Input placeholder="Ex: Auditoria ISM Anual" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Data</Label><Input type="date" value={formData.date} onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} /></div>
                      <div><Label>Auditor</Label><Input placeholder="Ex: DNV GL" value={formData.auditor} onChange={(e) => setFormData((p) => ({ ...p, auditor: e.target.value }))} /></div>
                    </div>
                    <div><Label>Notas</Label><Textarea placeholder="Informações adicionais..." value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} /></div>
                    <Button className="w-full" disabled={createAudit.isPending} onClick={() => createAudit.mutate(formData)}>
                      {createAudit.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Agendar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">{day}</div>
                ))}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (<div key={`empty-${i}`} className="aspect-square" />))}
                {daysInMonth.map((day) => {
                  const dayAudits = getAuditsByDate(day);
                  return (
                    <motion.div key={day.toISOString()} whileHover={{ scale: 1.05 }} onClick={() => { setSelectedDate(day); if (dayAudits.length > 0) setSelectedAuditId(dayAudits[0].id); }}
                      className={`aspect-square p-1 rounded-lg cursor-pointer border ${isToday(day) ? "border-primary bg-primary/5" : selectedDate && isSameDay(day, selectedDate) ? "border-primary/50 bg-muted" : "border-transparent hover:bg-muted"}`}>
                      <div className="text-sm text-center">{format(day, "d")}</div>
                      {dayAudits.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                          {dayAudits.slice(0, 2).map((a) => (
                            <div key={a.id} className={`h-1.5 w-1.5 rounded-full ${a.type === "ism" ? "bg-blue-500" : a.type === "sire" ? "bg-amber-500" : a.type === "psc" ? "bg-red-500" : "bg-green-500"}`} />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Audits */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Próximas Auditorias</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              {upcomingAudits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma auditoria agendada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAudits.map((audit) => (
                    <motion.div key={audit.id} whileHover={{ scale: 1.02 }} onClick={() => setSelectedAuditId(audit.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedAuditId === audit.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">{getTypeBadge(audit.type)}<span className={`text-xs font-medium ${getPriorityColor(audit.priority)}`}>{audit.priority}</span></div>
                          <p className="font-medium mt-1">{audit.title}</p>
                          <p className="text-sm text-muted-foreground">{audit.auditor}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />{format(audit.scheduledDate, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      {audit.preparationProgress > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs"><span>Preparação</span><span>{audit.preparationProgress}%</span></div>
                          <Progress value={audit.preparationProgress} className="h-1.5 mt-1" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
