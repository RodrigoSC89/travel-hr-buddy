/**
 * AuditWorkflow - Sistema de Workflow de Auditorias
 * Gestão completa de auditorias internas e externas
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { 
  ClipboardCheck, Calendar, AlertTriangle, CheckCircle2,
  Clock, User, FileText, Camera, Upload, MessageSquare,
  Search, Filter, Plus, ArrowRight, Eye, Edit, Trash2,
  ShieldCheck, Ship, MapPin, Brain, TrendingUp, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Audit {
  id: string;
  title: string;
  type: "ISM" | "ISPS" | "MLC" | "PSC" | "FLAG" | "CLASS" | "INTERNAL";
  vessel: string;
  port?: string;
  scheduledDate: string;
  auditor: string;
  status: "scheduled" | "in-progress" | "completed" | "findings-pending" | "closed";
  findings: number;
  criticalFindings: number;
  progress: number;
}

interface Finding {
  id: string;
  auditId: string;
  code: string;
  description: string;
  category: string;
  severity: "observation" | "non-conformity" | "major-nc";
  status: "open" | "in-progress" | "closed" | "verified";
  assignedTo: string;
  dueDate: string;
  evidence?: string[];
}

const audits: Audit[] = [
  { id: "1", title: "Auditoria ISM Anual", type: "ISM", vessel: "MV Atlântico Sul", scheduledDate: "2026-02-15", auditor: "DNV GL", status: "scheduled", findings: 0, criticalFindings: 0, progress: 0 },
  { id: "2", title: "Inspeção PSC - Rotterdam", type: "PSC", vessel: "MV Horizonte", port: "Rotterdam", scheduledDate: "2026-02-10", auditor: "Netherlands Coast Guard", status: "in-progress", findings: 3, criticalFindings: 0, progress: 60 },
  { id: "3", title: "Auditoria ISPS", type: "ISPS", vessel: "MV Oceano", scheduledDate: "2026-02-05", auditor: "Bureau Veritas", status: "findings-pending", findings: 5, criticalFindings: 1, progress: 100 },
  { id: "4", title: "Auditoria Interna Q1", type: "INTERNAL", vessel: "MV Pacífico", scheduledDate: "2026-01-28", auditor: "Equipe QMS", status: "completed", findings: 8, criticalFindings: 0, progress: 100 },
  { id: "5", title: "Certificação MLC 2006", type: "MLC", vessel: "MV Atlântico Sul", scheduledDate: "2026-03-01", auditor: "Flag State", status: "scheduled", findings: 0, criticalFindings: 0, progress: 0 },
];

const findings: Finding[] = [
  { id: "1", auditId: "3", code: "ISPS-2026-001", description: "Registro de visitantes incompleto para 12/Jan", category: "Controle de Acesso", severity: "non-conformity", status: "in-progress", assignedTo: "Oficial de Segurança", dueDate: "2026-02-20" },
  { id: "2", auditId: "3", code: "ISPS-2026-002", description: "Exercício de segurança não documentado adequadamente", category: "Exercícios", severity: "major-nc", status: "open", assignedTo: "Comandante", dueDate: "2026-02-15" },
  { id: "3", auditId: "2", code: "PSC-2026-001", description: "Extintor da praça de máquinas vencido", category: "Combate a Incêndio", severity: "non-conformity", status: "closed", assignedTo: "Chefe de Máquinas", dueDate: "2026-02-08" },
];

function AuditTypeBadge({ type }: { type: Audit["type"] }) {
  const config: Record<string, { label: string; className: string }> = {
    ISM: { label: "ISM", className: "bg-primary/10 text-primary" },
    ISPS: { label: "ISPS", className: "bg-destructive/10 text-destructive" },
    MLC: { label: "MLC", className: "bg-success/10 text-success" },
    PSC: { label: "PSC", className: "bg-warning/10 text-warning" },
    FLAG: { label: "FLAG", className: "bg-accent text-accent-foreground" },
    CLASS: { label: "CLASS", className: "bg-secondary text-secondary-foreground" },
    INTERNAL: { label: "Interna", className: "bg-muted text-muted-foreground" },
  };
  const c = config[type];
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

function StatusBadge({ status }: { status: Audit["status"] }) {
  const config: Record<string, { label: string; className: string }> = {
    scheduled: { label: "Agendada", className: "bg-primary/10 text-primary" },
    "in-progress": { label: "Em Andamento", className: "bg-warning/10 text-warning" },
    completed: { label: "Concluída", className: "bg-success/10 text-success" },
    "findings-pending": { label: "Achados Pendentes", className: "bg-destructive/10 text-destructive" },
    closed: { label: "Fechada", className: "bg-muted text-muted-foreground" },
  };
  const c = config[status];
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

function SeverityBadge({ severity }: { severity: Finding["severity"] }) {
  const config: Record<string, { label: string; className: string }> = {
    observation: { label: "Observação", className: "bg-muted text-muted-foreground" },
    "non-conformity": { label: "NC", className: "bg-warning/10 text-warning" },
    "major-nc": { label: "NC Maior", className: "bg-destructive text-destructive-foreground" },
  };
  const c = config[severity];
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

function AuditCard({ audit }: { audit: Audit }) {
  const daysUntil = Math.ceil(
    (new Date(audit.scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border hover:border-primary/50 hover:bg-accent/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <AuditTypeBadge type={audit.type} />
            <StatusBadge status={audit.status} />
            {audit.criticalFindings > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {audit.criticalFindings} NC Maior
              </Badge>
            )}
          </div>
          <h4 className="font-medium mt-2">{audit.title}</h4>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Ship className="h-3 w-3" />
              {audit.vessel}
            </span>
            {audit.port && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {audit.port}
              </span>
            )}
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {audit.auditor}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">
            {daysUntil > 0 ? `Em ${daysUntil} dias` : daysUntil === 0 ? "Hoje" : "Realizada"}
          </p>
          <p className="text-xs text-muted-foreground">{audit.scheduledDate}</p>
          {audit.findings > 0 && (
            <p className="text-sm mt-1">
              {audit.findings} achados
            </p>
          )}
        </div>
      </div>

      {audit.status === "in-progress" && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>Progresso</span>
            <span>{audit.progress}%</span>
          </div>
          <Progress value={audit.progress} className="h-2" />
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" className="flex-1 gap-1">
          <Eye className="h-3 w-3" />
          {audit.status === "scheduled" ? "Checklist" : "Detalhes"}
        </Button>
        {audit.status === "findings-pending" && (
          <Button size="sm" className="flex-1 gap-1">
            <ClipboardCheck className="h-3 w-3" />
            Tratar Achados
          </Button>
        )}
        {audit.status === "scheduled" && (
          <Button size="sm" variant="secondary" className="gap-1">
            <Calendar className="h-3 w-3" />
            Preparar
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-lg border hover:bg-accent/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{finding.code}</span>
            <SeverityBadge severity={finding.severity} />
            <Badge variant="outline">{finding.category}</Badge>
          </div>
          <p className="font-medium text-sm mt-2">{finding.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {finding.assignedTo}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Prazo: {finding.dueDate}
            </span>
          </div>
        </div>
        <Badge variant={
          finding.status === "closed" ? "default" :
          finding.status === "in-progress" ? "secondary" : "destructive"
        }>
          {finding.status === "closed" ? "Fechado" :
           finding.status === "in-progress" ? "Em Progresso" :
           finding.status === "verified" ? "Verificado" : "Aberto"}
        </Badge>
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" className="gap-1">
          <Edit className="h-3 w-3" />
          Editar
        </Button>
        <Button size="sm" variant="outline" className="gap-1">
          <Upload className="h-3 w-3" />
          Evidência
        </Button>
        {finding.status !== "closed" && (
          <Button size="sm" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Fechar
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function AuditWorkflow() {
  const [activeTab, setActiveTab] = useState("audits");
  const [searchTerm, setSearchTerm] = useState("");

  const stats = {
    scheduled: audits.filter(a => a.status === "scheduled").length,
    inProgress: audits.filter(a => a.status === "in-progress").length,
    pendingFindings: audits.filter(a => a.status === "findings-pending").length,
    openFindings: findings.filter(f => f.status === "open").length,
    criticalFindings: findings.filter(f => f.severity === "major-nc" && f.status !== "closed").length,
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Agendadas</p>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-warning">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Achados Pendentes</p>
                <p className="text-2xl font-bold text-destructive">{stats.pendingFindings}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">NC Abertas</p>
                <p className="text-2xl font-bold text-warning">{stats.openFindings}</p>
              </div>
              <FileText className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">NC Maiores</p>
                <p className="text-2xl font-bold text-destructive">{stats.criticalFindings}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendation */}
      <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Brain className="h-6 w-6 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Análise IA de Conformidade</h4>
              <p className="text-sm text-muted-foreground">
                1 NC Maior com prazo crítico (3 dias). 
                Baseado no histórico, probabilidade de 85% de detecção em PSC Rotterdam.
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Análise Completa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Workflow de Auditorias
              </CardTitle>
              <CardDescription>Gestão de auditorias e não conformidades</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Buscar..." 
                className="w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Auditoria
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="audits">Auditorias ({audits.length})</TabsTrigger>
              <TabsTrigger value="findings">
                Achados/NC ({findings.filter(f => f.status !== "closed").length})
              </TabsTrigger>
              <TabsTrigger value="calendar">Calendário</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="audits">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {audits.map((audit) => (
                    <AuditCard key={audit.id} audit={audit} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="findings">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {findings.map((finding) => (
                    <FindingCard key={finding.id} finding={finding} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="calendar">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {audits.slice(0, 6).map((audit) => (
                    <Card key={audit.id} className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{audit.title || audit.type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {audit.scheduledDate ? new Date(audit.scheduledDate).toLocaleDateString('pt-BR') : 'Data a definir'}
                      </p>
                      <Badge variant="outline" className="mt-2 text-xs">{audit.status}</Badge>
                    </Card>
                  ))}
                </div>
                {audits.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma auditoria agendada</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: "Relatório ISM Anual", icon: ShieldCheck },
                  { title: "Histórico PSC", icon: ClipboardCheck },
                  { title: "KPIs de Conformidade", icon: TrendingUp },
                  { title: "Análise de Tendências", icon: BarChart3 },
                ].map((report) => (
                  <Button key={report.title} variant="outline" className="h-24 flex-col gap-2">
                    <report.icon className="h-6 w-6" />
                    <span className="text-xs">{report.title}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
