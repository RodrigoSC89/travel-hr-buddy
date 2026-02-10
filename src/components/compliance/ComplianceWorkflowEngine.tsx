/**
 * Compliance Workflow Engine - Fluxo completo de auditoria
 * Template → Execução → Findings → NC Workflow → Relatório
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Play,
  Download,
  Upload,
  Search,
  Filter,
  ClipboardCheck,
  FileText,
  Users,
  Calendar,
  TrendingUp,
  ChevronRight,
  Paperclip,
  MessageSquare,
  RotateCcw,
  Send,
} from "lucide-react";

// Types
interface AuditTemplate {
  id: string;
  name: string;
  type: "ISM" | "ISPS" | "SOLAS" | "MARPOL" | "MLC" | "PSC" | "Internal";
  description: string;
  sections: AuditSection[];
  version: number;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

interface AuditSection {
  id: string;
  title: string;
  questions: AuditQuestion[];
}

interface AuditQuestion {
  id: string;
  text: string;
  reference?: string;
  required: boolean;
  type: "yes_no" | "rating" | "text" | "checklist";
}

interface AuditRun {
  id: string;
  template_id: string;
  template_name: string;
  vessel_name: string;
  auditor: string;
  scheduled_date: string;
  started_at?: string;
  completed_at?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  score?: number;
  findings_count: number;
  nc_count: number;
}

interface Finding {
  id: string;
  audit_id: string;
  question_id: string;
  type: "observation" | "minor_nc" | "major_nc" | "critical";
  description: string;
  evidence?: string[];
  status: "open" | "in_progress" | "closed" | "verified";
  assigned_to?: string;
  due_date?: string;
  root_cause?: string;
  corrective_action?: string;
  created_at: string;
  closed_at?: string;
}

interface NCWorkflow {
  id: string;
  finding_id: string;
  steps: NCStep[];
  current_step: number;
}

interface NCStep {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed" | "skipped";
  assigned_to?: string;
  completed_at?: string;
  notes?: string;
}

// Fallback data
const fallbackTemplates: AuditTemplate[] = [
  {
    id: "tmpl-001",
    name: "ISM Code Audit - Full",
    type: "ISM",
    description: "Auditoria completa do Código ISM incluindo todos os elementos",
    sections: [
      {
        id: "sec-1",
        title: "1. General",
        questions: [
          { id: "q-1-1", text: "Is the SMS documented?", reference: "ISM 1.4", required: true, type: "yes_no" },
          { id: "q-1-2", text: "Are safety policies defined?", reference: "ISM 1.2", required: true, type: "yes_no" },
        ],
      },
      {
        id: "sec-2",
        title: "2. Safety Policy",
        questions: [
          { id: "q-2-1", text: "Is the safety policy signed by top management?", reference: "ISM 2.1", required: true, type: "yes_no" },
          { id: "q-2-2", text: "Is the policy communicated to all personnel?", reference: "ISM 2.2", required: true, type: "yes_no" },
        ],
      },
    ],
    version: 3,
    status: "published",
    created_at: "2025-06-01T10:00:00Z",
    updated_at: "2026-01-10T14:30:00Z",
  },
  {
    id: "tmpl-002",
    name: "ISPS Security Assessment",
    type: "ISPS",
    description: "Avaliação de segurança conforme Código ISPS",
    sections: [
      {
        id: "sec-1",
        title: "Security Organization",
        questions: [
          { id: "q-1-1", text: "Is SSO appointed and trained?", reference: "ISPS A/11.2", required: true, type: "yes_no" },
          { id: "q-1-2", text: "Is SSP approved by Administration?", reference: "ISPS A/9.4", required: true, type: "yes_no" },
        ],
      },
    ],
    version: 2,
    status: "published",
    created_at: "2025-08-15T08:00:00Z",
    updated_at: "2026-01-05T11:20:00Z",
  },
];

const fallbackAuditRuns: AuditRun[] = [
  {
    id: "audit-001",
    template_id: "tmpl-001",
    template_name: "ISM Code Audit - Full",
    vessel_name: "MV Ocean Star",
    auditor: "Carlos Mendes",
    scheduled_date: "2026-02-15",
    started_at: "2026-01-28T09:00:00Z",
    status: "in_progress",
    findings_count: 5,
    nc_count: 2,
  },
  {
    id: "audit-002",
    template_id: "tmpl-002",
    template_name: "ISPS Security Assessment",
    vessel_name: "MV Atlantic Pride",
    auditor: "Maria Santos",
    scheduled_date: "2026-02-01",
    completed_at: "2026-01-25T16:00:00Z",
    status: "completed",
    score: 94,
    findings_count: 3,
    nc_count: 1,
  },
];

const fallbackFindings: Finding[] = [
  {
    id: "find-001",
    audit_id: "audit-001",
    question_id: "q-1-1",
    type: "minor_nc",
    description: "SMS documentation incomplete - missing emergency procedures update",
    status: "in_progress",
    assigned_to: "João Silva",
    due_date: "2026-02-10",
    created_at: "2026-01-28T10:30:00Z",
  },
  {
    id: "find-002",
    audit_id: "audit-001",
    question_id: "q-2-1",
    type: "observation",
    description: "Policy signature date not visible on posted copy",
    status: "open",
    created_at: "2026-01-28T11:00:00Z",
  },
  {
    id: "find-003",
    audit_id: "audit-002",
    question_id: "q-1-1",
    type: "major_nc",
    description: "SSO training certificate expired",
    status: "closed",
    assigned_to: "Pedro Oliveira",
    due_date: "2026-01-20",
    root_cause: "Training tracking system failure",
    corrective_action: "Renewed certificate and implemented automated alerts",
    created_at: "2026-01-20T14:00:00Z",
    closed_at: "2026-01-24T09:00:00Z",
  },
];

const typeColors: Record<string, string> = {
  observation: "bg-blue-500/20 text-blue-600",
  minor_nc: "bg-yellow-500/20 text-yellow-600",
  major_nc: "bg-orange-500/20 text-orange-600",
  critical: "bg-red-500/20 text-red-600",
};

const typeLabels: Record<string, string> = {
  observation: "Observação",
  minor_nc: "NC Menor",
  major_nc: "NC Maior",
  critical: "Crítico",
};

const statusLabels: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em Tratamento",
  closed: "Fechado",
  verified: "Verificado",
};

export function ComplianceWorkflowEngine() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<AuditTemplate[]>(fallbackTemplates);
  const [auditRuns, setAuditRuns] = useState<AuditRun[]>(fallbackAuditRuns);
  const [findings, setFindings] = useState<Finding[]>(fallbackFindings);
  const [activeTab, setActiveTab] = useState("audits");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Modal states
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isExecuteOpen, setIsExecuteOpen] = useState(false);
  const [isFindingOpen, setIsFindingOpen] = useState(false);
  const [isNCWorkflowOpen, setIsNCWorkflowOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditRun | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  
  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    template_id: "",
    vessel_name: "",
    auditor: "",
    scheduled_date: "",
  });
  
  const [findingForm, setFindingForm] = useState({
    type: "observation" as Finding["type"],
    description: "",
    assigned_to: "",
    due_date: "",
  });
  
  const [ncForm, setNCForm] = useState({
    root_cause: "",
    corrective_action: "",
    evidence: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const scheduled = auditRuns.filter((a) => a.status === "scheduled").length;
    const inProgress = auditRuns.filter((a) => a.status === "in_progress").length;
    const completed = auditRuns.filter((a) => a.status === "completed").length;
    const openNCs = findings.filter((f) => f.type !== "observation" && f.status !== "closed" && f.status !== "verified").length;
    const avgScore = auditRuns.filter((a) => a.score).reduce((acc, a) => acc + (a.score || 0), 0) / (completed || 1);
    
    return { scheduled, inProgress, completed, openNCs, avgScore: Math.round(avgScore) };
  }, [auditRuns, findings]);

  // Filtered audits
  const filteredAudits = useMemo(() => {
    return auditRuns.filter((a) => {
      const matchesSearch =
        a.vessel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.auditor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [auditRuns, searchQuery, statusFilter]);

  // Filtered findings
  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      const matchesSearch = f.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [findings, searchQuery, statusFilter]);

  // Schedule audit
  const handleSchedule = async () => {
    setIsLoading(true);
    try {
      
      
      const template = templates.find((t) => t.id === scheduleForm.template_id);
      const newAudit: AuditRun = {
        id: `audit-${Date.now()}`,
        template_id: scheduleForm.template_id,
        template_name: template?.name || "",
        vessel_name: scheduleForm.vessel_name,
        auditor: scheduleForm.auditor,
        scheduled_date: scheduleForm.scheduled_date,
        status: "scheduled",
        findings_count: 0,
        nc_count: 0,
      };
      
      setAuditRuns((prev) => [newAudit, ...prev]);
      setIsScheduleOpen(false);
      setScheduleForm({ template_id: "", vessel_name: "", auditor: "", scheduled_date: "" });
      
      toast({
        title: "Auditoria agendada",
        description: `${template?.name} - ${scheduleForm.vessel_name}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start audit
  const handleStartAudit = (audit: AuditRun) => {
    setSelectedAudit(audit);
    setAuditRuns((prev) =>
      prev.map((a) =>
        a.id === audit.id
          ? { ...a, status: "in_progress" as const, started_at: new Date().toISOString() }
          : a
      )
    );
    setIsExecuteOpen(true);
    
    toast({
      title: "Auditoria iniciada",
      description: audit.template_name,
    });
  };

  // Complete audit
  const handleCompleteAudit = async () => {
    if (!selectedAudit) return;
    setIsLoading(true);
    try {
      
      
      const auditFindings = findings.filter((f) => f.audit_id === selectedAudit.id);
      const score = 100 - auditFindings.length * 5;
      
      setAuditRuns((prev) =>
        prev.map((a) =>
          a.id === selectedAudit.id
            ? {
                ...a,
                status: "completed" as const,
                completed_at: new Date().toISOString(),
                score: Math.max(0, score),
                findings_count: auditFindings.length,
                nc_count: auditFindings.filter((f) => f.type !== "observation").length,
              }
            : a
        )
      );
      
      setIsExecuteOpen(false);
      toast({
        title: "Auditoria concluída",
        description: `Score: ${Math.max(0, score)}%`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add finding
  const handleAddFinding = async () => {
    if (!selectedAudit) return;
    setIsLoading(true);
    try {
      
      
      const newFinding: Finding = {
        id: `find-${Date.now()}`,
        audit_id: selectedAudit.id,
        question_id: "manual",
        type: findingForm.type,
        description: findingForm.description,
        status: "open",
        assigned_to: findingForm.assigned_to || undefined,
        due_date: findingForm.due_date || undefined,
        created_at: new Date().toISOString(),
      };
      
      setFindings((prev) => [newFinding, ...prev]);
      setIsFindingOpen(false);
      setFindingForm({ type: "observation", description: "", assigned_to: "", due_date: "" });
      
      toast({
        title: "Achado registrado",
        description: typeLabels[newFinding.type],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update finding status
  const handleUpdateFindingStatus = async (finding: Finding, newStatus: Finding["status"]) => {
    setIsLoading(true);
    try {
      
      
      setFindings((prev) =>
        prev.map((f) =>
          f.id === finding.id
            ? {
                ...f,
                status: newStatus,
                closed_at: newStatus === "closed" ? new Date().toISOString() : f.closed_at,
              }
            : f
        )
      );
      
      toast({
        title: "Status atualizado",
        description: statusLabels[newStatus],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Open NC workflow
  const openNCWorkflow = (finding: Finding) => {
    setSelectedFinding(finding);
    setNCForm({
      root_cause: finding.root_cause || "",
      corrective_action: finding.corrective_action || "",
      evidence: "",
    });
    setIsNCWorkflowOpen(true);
  };

  // Submit NC treatment
  const handleSubmitNC = async () => {
    if (!selectedFinding) return;
    setIsLoading(true);
    try {
      
      
      setFindings((prev) =>
        prev.map((f) =>
          f.id === selectedFinding.id
            ? {
                ...f,
                root_cause: ncForm.root_cause,
                corrective_action: ncForm.corrective_action,
                status: "closed" as const,
                closed_at: new Date().toISOString(),
              }
            : f
        )
      );
      
      setIsNCWorkflowOpen(false);
      toast({
        title: "NC tratada com sucesso",
        description: "Aguardando verificação de eficácia",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Export report
  const handleExportReport = (audit: AuditRun) => {
    const auditFindings = findings.filter((f) => f.audit_id === audit.id);
    
    const report = {
      audit,
      findings: auditFindings,
      generated_at: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-report-${audit.id}.json`;
    a.click();
    
    toast({
      title: "Relatório exportado",
      description: audit.template_name,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Compliance Workflow Engine</h1>
            <p className="text-muted-foreground">
              Gestão completa de auditorias e não-conformidades
            </p>
          </div>
        </div>
        <Button onClick={() => setIsScheduleOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agendar Auditoria
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendadas</p>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NCs Abertas</p>
                <p className="text-2xl font-bold">{stats.openNCs}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Médio</p>
                <p className="text-2xl font-bold">{stats.avgScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="audits">Auditorias</TabsTrigger>
          <TabsTrigger value="findings">Achados & NCs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {activeTab === "audits" ? (
                <>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="in_progress">Em Tratamento</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                  <SelectItem value="verified">Verificado</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="audits" className="space-y-4 mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auditoria</TableHead>
                  <TableHead>Embarcação</TableHead>
                  <TableHead>Auditor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Achados</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAudits.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{audit.template_name}</p>
                        <p className="text-xs text-muted-foreground">{audit.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>{audit.vessel_name}</TableCell>
                    <TableCell>{audit.auditor}</TableCell>
                    <TableCell>
                      {new Date(audit.scheduled_date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{audit.findings_count}</span>
                        {audit.nc_count > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {audit.nc_count} NC
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {audit.score !== undefined ? (
                        <Badge variant={audit.score >= 80 ? "default" : "secondary"}>
                          {audit.score}%
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        audit.status === "completed"
                          ? "default"
                          : audit.status === "in_progress"
                          ? "secondary"
                          : "outline"
                      }>
                        {audit.status === "completed"
                          ? "Concluída"
                          : audit.status === "in_progress"
                          ? "Em Andamento"
                          : audit.status === "scheduled"
                          ? "Agendada"
                          : "Cancelada"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {audit.status === "scheduled" && (
                          <Button size="sm" onClick={() => handleStartAudit(audit)}>
                            <Play className="h-4 w-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        {audit.status === "in_progress" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAudit(audit);
                              setIsExecuteOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Continuar
                          </Button>
                        )}
                        {audit.status === "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExportReport(audit)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Relatório
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="findings" className="space-y-4 mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFindings.map((finding) => (
                  <TableRow key={finding.id}>
                    <TableCell>
                      <Badge className={typeColors[finding.type]}>
                        {typeLabels[finding.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-md line-clamp-2">{finding.description}</p>
                    </TableCell>
                    <TableCell>{finding.assigned_to || "-"}</TableCell>
                    <TableCell>
                      {finding.due_date
                        ? new Date(finding.due_date).toLocaleDateString("pt-BR")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        finding.status === "closed" || finding.status === "verified"
                          ? "default"
                          : finding.status === "in_progress"
                          ? "secondary"
                          : "outline"
                      }>
                        {statusLabels[finding.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {finding.type !== "observation" && finding.status !== "closed" && finding.status !== "verified" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openNCWorkflow(finding)}
                          >
                            <FileCheck className="h-4 w-4 mr-1" />
                            Tratar NC
                          </Button>
                        )}
                        {finding.status === "open" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateFindingStatus(finding, "in_progress")}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Auditoria</CardTitle>
              <CardDescription>Modelos disponíveis para execução</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{template.type}</Badge>
                            <Badge variant="secondary">v{template.version}</Badge>
                          </div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {template.sections.length} seções •{" "}
                            {template.sections.reduce((acc, s) => acc + s.questions.length, 0)} perguntas
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setScheduleForm((prev) => ({ ...prev, template_id: template.id }));
                            setIsScheduleOpen(true);
                          }}
                        >
                          Usar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Modal */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Auditoria</DialogTitle>
            <DialogDescription>
              Selecione o template e defina os detalhes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select
                value={scheduleForm.template_id}
                onValueChange={(value) => setScheduleForm((prev) => ({ ...prev, template_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.filter((t) => t.status === "published").map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Embarcação</Label>
              <Input
                value={scheduleForm.vessel_name}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, vessel_name: e.target.value }))}
                placeholder="Nome da embarcação"
              />
            </div>
            <div className="space-y-2">
              <Label>Auditor</Label>
              <Input
                value={scheduleForm.auditor}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, auditor: e.target.value }))}
                placeholder="Nome do auditor"
              />
            </div>
            <div className="space-y-2">
              <Label>Data Agendada</Label>
              <Input
                type="date"
                value={scheduleForm.scheduled_date}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, scheduled_date: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={isLoading || !scheduleForm.template_id || !scheduleForm.vessel_name}
            >
              {isLoading ? "Agendando..." : "Agendar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execute Audit Modal */}
      <Dialog open={isExecuteOpen} onOpenChange={setIsExecuteOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Executar Auditoria</DialogTitle>
            <DialogDescription>
              {selectedAudit?.template_name} - {selectedAudit?.vessel_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Progresso</span>
                <span className="text-sm text-muted-foreground">
                  {findings.filter((f) => f.audit_id === selectedAudit?.id).length} achados registrados
                </span>
              </div>
              <Progress value={50} />
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Achados Registrados</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {findings
                  .filter((f) => f.audit_id === selectedAudit?.id)
                  .map((f) => (
                    <div key={f.id} className="flex items-center gap-2 text-sm">
                      <Badge className={`${typeColors[f.type]} text-xs`}>
                        {typeLabels[f.type]}
                      </Badge>
                      <span className="line-clamp-1">{f.description}</span>
                    </div>
                  ))}
                {findings.filter((f) => f.audit_id === selectedAudit?.id).length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum achado registrado ainda</p>
                )}
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => setIsFindingOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Achado
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExecuteOpen(false)}>
              Salvar e Sair
            </Button>
            <Button onClick={handleCompleteAudit} disabled={isLoading}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isLoading ? "Concluindo..." : "Concluir Auditoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Finding Modal */}
      <Dialog open={isFindingOpen} onOpenChange={setIsFindingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Achado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={findingForm.type}
                onValueChange={(value: Finding["type"]) =>
                  setFindingForm((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="observation">Observação</SelectItem>
                  <SelectItem value="minor_nc">NC Menor</SelectItem>
                  <SelectItem value="major_nc">NC Maior</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={findingForm.description}
                onChange={(e) => setFindingForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o achado..."
              />
            </div>
            {findingForm.type !== "observation" && (
              <>
                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Input
                    value={findingForm.assigned_to}
                    onChange={(e) => setFindingForm((prev) => ({ ...prev, assigned_to: e.target.value }))}
                    placeholder="Nome do responsável"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prazo</Label>
                  <Input
                    type="date"
                    value={findingForm.due_date}
                    onChange={(e) => setFindingForm((prev) => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFindingOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddFinding} disabled={isLoading || !findingForm.description}>
              {isLoading ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NC Workflow Modal */}
      <Dialog open={isNCWorkflowOpen} onOpenChange={setIsNCWorkflowOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tratamento de Não-Conformidade</DialogTitle>
            <DialogDescription>
              {selectedFinding && typeLabels[selectedFinding.type]}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{selectedFinding?.description}</p>
            </div>

            <div className="space-y-2">
              <Label>Análise de Causa Raiz</Label>
              <Textarea
                value={ncForm.root_cause}
                onChange={(e) => setNCForm((prev) => ({ ...prev, root_cause: e.target.value }))}
                placeholder="Identifique a causa raiz do problema..."
              />
            </div>

            <div className="space-y-2">
              <Label>Ação Corretiva</Label>
              <Textarea
                value={ncForm.corrective_action}
                onChange={(e) => setNCForm((prev) => ({ ...prev, corrective_action: e.target.value }))}
                placeholder="Descreva a ação corretiva implementada..."
              />
            </div>

            <div className="space-y-2">
              <Label>Evidências</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Arraste arquivos ou clique para fazer upload
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNCWorkflowOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitNC}
              disabled={isLoading || !ncForm.root_cause || !ncForm.corrective_action}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isLoading ? "Salvando..." : "Fechar NC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
