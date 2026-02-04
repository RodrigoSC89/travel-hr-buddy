/**
 * Audit Schedule Panel - Calendário de Auditorias e Inspeções
 * Planejamento e acompanhamento de auditorias ISM/ISPS/STCW
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  User,
  MapPin,
  Building2,
  Ship,
  Shield,
  Plus,
  ChevronLeft,
  ChevronRight,
  Bell,
  ClipboardCheck,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Audit {
  id: string;
  type: "ism" | "isps" | "sire" | "psc" | "internal" | "flag_state";
  title: string;
  vessel: string;
  auditor: string;
  organization?: string;
  scheduledDate: Date;
  status: "scheduled" | "in_progress" | "completed" | "postponed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  scope: string[];
  preparationProgress: number;
  findings?: number;
  notes?: string;
}

interface AuditChecklist {
  id: string;
  category: string;
  items: { id: string; description: string; completed: boolean }[];
}

const MOCK_AUDITS: Audit[] = [
  {
    id: "1",
    type: "ism",
    title: "Auditoria ISM Anual",
    vessel: "MV Atlantic Star",
    auditor: "DNV GL",
    organization: "DNV GL Rotterdam",
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "scheduled",
    priority: "high",
    scope: ["SMS", "Procedimentos", "Registros", "Treinamentos"],
    preparationProgress: 75,
  },
  {
    id: "2",
    type: "sire",
    title: "Inspeção SIRE",
    vessel: "MV Atlantic Star",
    auditor: "OCIMF Inspector",
    scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: "scheduled",
    priority: "critical",
    scope: ["Navegação", "Carga", "Segurança", "Ambiental"],
    preparationProgress: 45,
  },
  {
    id: "3",
    type: "internal",
    title: "Auditoria Interna Q1",
    vessel: "MV Pacific Explorer",
    auditor: "João Silva",
    scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: "completed",
    priority: "medium",
    scope: ["Operações", "Manutenção"],
    preparationProgress: 100,
    findings: 3,
  },
  {
    id: "4",
    type: "psc",
    title: "Inspeção PSC - Porto de Rotterdam",
    vessel: "MV Atlantic Star",
    auditor: "Autoridade Portuária",
    scheduledDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    status: "scheduled",
    priority: "high",
    scope: ["Documentação", "Equipamentos", "Tripulação"],
    preparationProgress: 30,
  },
];

const CHECKLIST_ITEMS: AuditChecklist[] = [
  {
    id: "1",
    category: "Documentação",
    items: [
      { id: "1", description: "Certificados de classe atualizados", completed: true },
      { id: "2", description: "SMC e DOC válidos", completed: true },
      { id: "3", description: "Licenças de rádio", completed: false },
      { id: "4", description: "Certificados de tripulação", completed: true },
    ],
  },
  {
    id: "2",
    category: "Equipamentos de Segurança",
    items: [
      { id: "5", description: "Botes salva-vidas inspecionados", completed: true },
      { id: "6", description: "Extintores verificados", completed: true },
      { id: "7", description: "EPIRB testado", completed: false },
      { id: "8", description: "Trajes de imersão disponíveis", completed: true },
    ],
  },
  {
    id: "3",
    category: "Registros de SMS",
    items: [
      { id: "9", description: "Drill records atualizados", completed: false },
      { id: "10", description: "Non-conformity log completo", completed: true },
      { id: "11", description: "Maintenance records", completed: true },
      { id: "12", description: "Training records", completed: false },
    ],
  },
];

export default function AuditSchedulePanel() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [showNewAudit, setShowNewAudit] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const auditsThisMonth = MOCK_AUDITS.filter(
    (audit) => audit.scheduledDate >= monthStart && audit.scheduledDate <= monthEnd
  );

  const upcomingAudits = MOCK_AUDITS.filter(
    (audit) => audit.status === "scheduled" && !isBefore(audit.scheduledDate, new Date())
  ).sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());

  const getTypeBadge = (type: Audit["type"]) => {
    const config = {
      ism: { label: "ISM", color: "bg-blue-500/10 text-blue-500" },
      isps: { label: "ISPS", color: "bg-purple-500/10 text-purple-500" },
      sire: { label: "SIRE", color: "bg-amber-500/10 text-amber-500" },
      psc: { label: "PSC", color: "bg-red-500/10 text-red-500" },
      internal: { label: "Interna", color: "bg-green-500/10 text-green-500" },
      flag_state: { label: "Flag State", color: "bg-cyan-500/10 text-cyan-500" },
    };
    const { label, color } = config[type];
    return <Badge className={color}>{label}</Badge>;
  };

  const getPriorityColor = (priority: Audit["priority"]) => {
    switch (priority) {
      case "critical":
        return "text-red-500";
      case "high":
        return "text-amber-500";
      case "medium":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getAuditsByDate = (date: Date) => {
    return MOCK_AUDITS.filter((audit) => isSameDay(audit.scheduledDate, date));
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Auditorias Este Mês</p>
                <p className="text-2xl font-bold">{auditsThisMonth.length}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próximos 30 Dias</p>
                <p className="text-2xl font-bold">{upcomingAudits.length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas (ano)</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conformidade</p>
                <p className="text-2xl font-bold">96%</p>
              </div>
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
              <CardDescription>
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Dialog open={showNewAudit} onOpenChange={setShowNewAudit}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Auditoria
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agendar Nova Auditoria</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tipo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
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
                        <Label>Embarcação</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="v1">MV Atlantic Star</SelectItem>
                            <SelectItem value="v2">MV Pacific Explorer</SelectItem>
                            <SelectItem value="v3">MV Nordic Spirit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Título</Label>
                      <Input placeholder="Ex: Auditoria ISM Anual" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Data</Label>
                        <Input type="date" />
                      </div>
                      <div>
                        <Label>Prioridade</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="critical">Crítica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Auditor/Organização</Label>
                      <Input placeholder="Ex: DNV GL" />
                    </div>
                    <div>
                      <Label>Notas</Label>
                      <Textarea placeholder="Informações adicionais..." />
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => {
                        toast.success("Auditoria agendada com sucesso!");
                        setShowNewAudit(false);
                      }}>
                        Agendar
                      </Button>
                      <Button variant="outline" onClick={() => setShowNewAudit(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {daysInMonth.map((day) => {
                const audits = getAuditsByDate(day);
                return (
                  <motion.div
                    key={day.toISOString()}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setSelectedDate(day);
                      if (audits.length > 0) setSelectedAudit(audits[0]);
                    }}
                    className={`aspect-square p-1 rounded-lg cursor-pointer border ${
                      isToday(day)
                        ? "border-primary bg-primary/5"
                        : selectedDate && isSameDay(day, selectedDate)
                        ? "border-primary/50 bg-muted"
                        : "border-transparent hover:bg-muted"
                    }`}
                  >
                    <div className="text-sm text-center">{format(day, "d")}</div>
                    {audits.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                        {audits.slice(0, 2).map((audit) => (
                          <div
                            key={audit.id}
                            className={`h-1.5 w-1.5 rounded-full ${
                              audit.type === "ism" ? "bg-blue-500" :
                              audit.type === "sire" ? "bg-amber-500" :
                              audit.type === "psc" ? "bg-red-500" :
                              "bg-green-500"
                            }`}
                          />
                        ))}
                        {audits.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{audits.length - 2}</span>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Audits & Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximas Auditorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <div className="space-y-3">
                {upcomingAudits.map((audit) => (
                  <motion.div
                    key={audit.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedAudit(audit)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAudit?.id === audit.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(audit.type)}
                          <span className={`text-xs font-medium ${getPriorityColor(audit.priority)}`}>
                            {audit.priority === "critical" ? "!" : ""}
                          </span>
                        </div>
                        <p className="font-medium mt-1">{audit.title}</p>
                        <p className="text-sm text-muted-foreground">{audit.vessel}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {format(audit.scheduledDate, "dd/MM")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.ceil((audit.scheduledDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))}d
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Preparação</span>
                        <span>{audit.preparationProgress}%</span>
                      </div>
                      <Progress value={audit.preparationProgress} className="h-1.5" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Preparation Checklist */}
      {selectedAudit && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Checklist de Preparação: {selectedAudit.title}
                </CardTitle>
                <CardDescription>
                  {selectedAudit.vessel} • {format(selectedAudit.scheduledDate, "dd/MM/yyyy")}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CHECKLIST_ITEMS.map((category) => {
                const completed = category.items.filter((i) => i.completed).length;
                const total = category.items.length;
                return (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{category.category}</h4>
                      <Badge variant={completed === total ? "default" : "outline"}>
                        {completed}/{total}
                      </Badge>
                    </div>
                    <Progress value={(completed / total) * 100} className="h-2 mb-3" />
                    <div className="space-y-2">
                      {category.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            className="h-4 w-4 rounded border-gray-300"
                            onChange={() => {}}
                          />
                          <span className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                            {item.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
