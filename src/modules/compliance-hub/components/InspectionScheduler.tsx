/**
 * Inspection Scheduler - PSC, Flag State, Classification
 * Advanced scheduling with AI predictions
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardCheck,
  Plus,
  Calendar as CalendarIcon,
  Ship,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  FileText,
  Brain,
  Flag,
  Shield,
  Anchor,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, addDays, differenceInDays, isBefore, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Inspection {
  id: string;
  inspection_type: "PSC" | "FLAG_STATE" | "CLASS" | "ISM" | "ISPS" | "SIRE" | "CDI" | "RIGHTSHIP";
  vessel_id: string;
  vessel_name: string;
  port: string;
  scheduled_date: string;
  status: "scheduled" | "in_progress" | "completed" | "postponed" | "cancelled";
  inspector_name?: string;
  inspector_organization?: string;
  findings_count?: number;
  detention_risk?: number;
  ai_risk_score?: number;
  preparation_status?: number;
  notes?: string;
}

const mockInspections: Inspection[] = [
  {
    id: "1",
    inspection_type: "PSC",
    vessel_id: "v1",
    vessel_name: "MV Atlantic Star",
    port: "Rotterdam",
    scheduled_date: "2024-01-25",
    status: "scheduled",
    inspector_organization: "Paris MoU",
    detention_risk: 15,
    ai_risk_score: 22,
    preparation_status: 78,
  },
  {
    id: "2",
    inspection_type: "SIRE",
    vessel_id: "v2",
    vessel_name: "MV Pacific Explorer",
    port: "Singapore",
    scheduled_date: "2024-01-28",
    status: "scheduled",
    inspector_organization: "OCIMF",
    detention_risk: 8,
    ai_risk_score: 12,
    preparation_status: 92,
  },
  {
    id: "3",
    inspection_type: "CLASS",
    vessel_id: "v3",
    vessel_name: "MV Horizon",
    port: "Santos",
    scheduled_date: "2024-01-20",
    status: "completed",
    inspector_organization: "DNV GL",
    findings_count: 3,
    detention_risk: 0,
    preparation_status: 100,
  },
  {
    id: "4",
    inspection_type: "ISM",
    vessel_id: "v4",
    vessel_name: "MV Navigator",
    port: "Houston",
    scheduled_date: "2024-02-05",
    status: "scheduled",
    inspector_organization: "Flag State",
    detention_risk: 25,
    ai_risk_score: 35,
    preparation_status: 45,
  },
];

const INSPECTION_TYPES = [
  { value: "PSC", label: "Port State Control", color: "bg-blue-500" },
  { value: "FLAG_STATE", label: "Flag State", color: "bg-emerald-500" },
  { value: "CLASS", label: "Classification Society", color: "bg-purple-500" },
  { value: "ISM", label: "ISM Audit", color: "bg-amber-500" },
  { value: "ISPS", label: "ISPS Audit", color: "bg-red-500" },
  { value: "SIRE", label: "SIRE Inspection", color: "bg-cyan-500" },
  { value: "CDI", label: "CDI Inspection", color: "bg-orange-500" },
  { value: "RIGHTSHIP", label: "RightShip", color: "bg-green-500" },
];

export default function InspectionScheduler() {
  const [inspections] = useState<Inspection[]>(mockInspections);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredInspections = inspections.filter((i) => {
    const matchesType = typeFilter === "all" || i.inspection_type === typeFilter;
    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const upcomingInspections = inspections.filter(i => 
    i.status === "scheduled" && isAfter(new Date(i.scheduled_date), new Date())
  );

  const highRiskInspections = inspections.filter(i => 
    (i.ai_risk_score || 0) > 25
  );

  const stats = {
    total: inspections.length,
    scheduled: inspections.filter(i => i.status === "scheduled").length,
    completed: inspections.filter(i => i.status === "completed").length,
    highRisk: highRiskInspections.length,
    avgPreparation: Math.round(
      inspections.reduce((acc, i) => acc + (i.preparation_status || 0), 0) / inspections.length
    ),
  };

  const getTypeInfo = (type: string) => {
    return INSPECTION_TYPES.find(t => t.value === type) || { label: type, color: "bg-gray-500" };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/20 text-success"><CheckCircle2 className="h-3 w-3 mr-1" />Concluída</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500/20 text-blue-500"><Clock className="h-3 w-3 mr-1" />Agendada</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-500/20 text-amber-500"><Clock className="h-3 w-3 mr-1" />Em Andamento</Badge>;
      case "postponed":
        return <Badge className="bg-orange-500/20 text-orange-500">Adiada</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 15) return "text-success";
    if (risk <= 30) return "text-amber-500";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Agendadas</p>
                <p className="text-2xl font-bold text-blue-500">{stats.scheduled}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-success">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Alto Risco</p>
                <p className="text-2xl font-bold text-destructive">{stats.highRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Prep. Média</p>
                <p className="text-2xl font-bold text-amber-500">{stats.avgPreparation}%</p>
              </div>
              <Shield className="h-8 w-8 text-amber-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              locale={ptBR}
            />
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">Próximas Inspeções</p>
              {upcomingInspections.slice(0, 3).map((ins) => (
                <div key={ins.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${getTypeInfo(ins.inspection_type).color}`} />
                    <span>{ins.vessel_name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {format(new Date(ins.scheduled_date), "dd/MM")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inspections List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Inspeções
                </CardTitle>
                <CardDescription>Gerencie todas as inspeções da frota</CardDescription>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Inspeção
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  {INSPECTION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredInspections.map((inspection, index) => {
                  const typeInfo = getTypeInfo(inspection.inspection_type);
                  const daysUntil = differenceInDays(new Date(inspection.scheduled_date), new Date());

                  return (
                    <motion.div
                      key={inspection.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border hover:border-primary/50 transition-all ${
                        (inspection.ai_risk_score || 0) > 25 ? "border-destructive/30 bg-destructive/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg ${typeInfo.color} flex items-center justify-center text-white font-bold text-xs`}>
                            {inspection.inspection_type.slice(0, 3)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{inspection.vessel_name}</p>
                              {getStatusBadge(inspection.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">{typeInfo.label}</p>
                          </div>
                        </div>
                        {inspection.ai_risk_score !== undefined && (
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />
                            <span className={`font-bold ${getRiskColor(inspection.ai_risk_score)}`}>
                              {inspection.ai_risk_score}% risco
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground text-xs">Data</p>
                          <p className="font-medium flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {format(new Date(inspection.scheduled_date), "dd/MM/yyyy")}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Porto</p>
                          <p className="font-medium flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {inspection.port}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Organização</p>
                          <p className="font-medium">{inspection.inspector_organization || "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Dias</p>
                          <p className={`font-medium ${daysUntil < 7 ? "text-destructive" : ""}`}>
                            {daysUntil > 0 ? `${daysUntil} dias` : daysUntil === 0 ? "Hoje" : "Passada"}
                          </p>
                        </div>
                      </div>

                      {inspection.preparation_status !== undefined && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Preparação</span>
                            <span className={inspection.preparation_status < 50 ? "text-destructive" : ""}>
                              {inspection.preparation_status}%
                            </span>
                          </div>
                          <Progress 
                            value={inspection.preparation_status} 
                            className={inspection.preparation_status < 50 ? "[&>div]:bg-destructive" : ""}
                          />
                        </div>
                      )}

                      {inspection.status === "completed" && inspection.findings_count !== undefined && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                          <Badge variant="outline">
                            {inspection.findings_count} achados
                          </Badge>
                          {inspection.detention_risk === 0 && (
                            <Badge className="bg-success/20 text-success">Sem detenção</Badge>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* AI Risk Alerts */}
      {highRiskInspections.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Risco - IA
            </CardTitle>
            <CardDescription>
              Inspeções com alto risco de não-conformidades detectadas pela IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highRiskInspections.map((ins) => (
                <div key={ins.id} className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-medium">{ins.vessel_name} - {ins.inspection_type}</p>
                      <p className="text-sm text-muted-foreground">{ins.port} • {format(new Date(ins.scheduled_date), "dd/MM/yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-destructive/20 text-destructive">
                      {ins.ai_risk_score}% risco
                    </Badge>
                    <Button size="sm" variant="outline">
                      Ver Checklist
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Inspection Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agendar Nova Inspeção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Inspeção</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {INSPECTION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Embarcação</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a embarcação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1">MV Atlantic Star</SelectItem>
                  <SelectItem value="v2">MV Pacific Explorer</SelectItem>
                  <SelectItem value="v3">MV Horizon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Porto</Label>
                <Input placeholder="Ex: Rotterdam" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Organização Inspetora</Label>
              <Input placeholder="Ex: Paris MoU, DNV GL" />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea placeholder="Notas sobre a inspeção..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button onClick={() => { toast.success("Inspeção agendada!"); setShowAddDialog(false); }}>
              Agendar Inspeção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
