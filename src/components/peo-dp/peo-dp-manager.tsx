import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PeoDpWizard } from "./peo-dp-wizard";
import { PEODPAuditForm } from "./peodp-audit-form";
import { PEODPChecklistEditor } from "./peodp-checklist-editor";
import { FMEADPTrialsIntegration } from "./fmea-dp-trials-integration";
import { MLValidationIMCA } from "./ml-validation-imca";
import { SmartDPLogbook } from "./smart-dp-logbook";
import { LessonsLearnedCenter } from "./lessons-learned-center";
import { DPCompetenceHub } from "./dp-competence-hub";
import { OperationalWindowMonitor } from "./operational-window-monitor";
import { DPAIAdvisor } from "./dp-ai-advisor";
import { ClientAssurancePortal } from "./client-assurance-portal";
import { DPReplaySystem } from "./dp-replay-system";
import { SIMOPSManager } from "./simops-manager";
import { AutoEvidenceBuilder } from "./auto-evidence-builder";
import {
  LayoutDashboard,
  FileText,
  Users,
  GraduationCap,
  Wrench,
  Radio,
  Settings,
  TestTube,
  Plus,
  Edit,
  Eye,
  Download,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Target,
  Shield,
  ClipboardCheck,
  Ship
} from "lucide-react";
import { toast } from "sonner";
import {
  type PEODPAudit,
  type PEODPAuditItem,
  type PEODPChecklistVersion,
  PEODP_DEFAULT_REQUIREMENTS,
  getScoreColor,
  getScoreLevel
} from "@/types/peodp-checklist";

interface DPPlan {
  id: string;
  vessel_name: string;
  vessel_type: string;
  dp_class: "DP1" | "DP2" | "DP3";
  status: "draft" | "in_review" | "approved" | "active";
  created_at: Date;
  updated_at: Date;
  sections: {
    management: SectionStatus;
    training: SectionStatus;
    procedures: SectionStatus;
    operation: SectionStatus;
    maintenance: SectionStatus;
    testing: SectionStatus;
  };
  overall_compliance: number;
}

interface SectionStatus {
  completed: number;
  total: number;
  status: "pending" | "in_progress" | "completed";
  last_updated: Date;
}

const SECTIONS = [
  {
    id: "management",
    name: "Gestão",
    icon: Users,
    description: "Organograma, responsabilidades e estrutura",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    id: "training",
    name: "Treinamentos",
    icon: GraduationCap,
    description: "Certificações, competências e capacitação",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    id: "procedures",
    name: "Procedimentos",
    icon: FileText,
    description: "FMEA, ASOG, contingência e emergência",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    id: "operation",
    name: "Operação",
    icon: Radio,
    description: "Watch keeping, comunicação e protocolos",
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  {
    id: "maintenance",
    name: "Manutenção",
    icon: Wrench,
    description: "Preventiva, preditiva e corretiva",
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  {
    id: "testing",
    name: "Testes Anuais",
    icon: TestTube,
    description: "DP trials, capability plots e validação",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  }
];

export const PeoDpManager: React.FC = () => {
  const [plans, setPlans] = useState<DPPlan[]>([
    {
      id: "plan-1",
      vessel_name: "PSV Atlantic Explorer",
      vessel_type: "PSV",
      dp_class: "DP2",
      status: "in_review",
      created_at: new Date("2024-01-15"),
      updated_at: new Date(),
      sections: {
        management: { completed: 12, total: 15, status: "in_progress", last_updated: new Date() },
        training: { completed: 8, total: 10, status: "in_progress", last_updated: new Date() },
        procedures: { completed: 15, total: 20, status: "in_progress", last_updated: new Date() },
        operation: { completed: 18, total: 18, status: "completed", last_updated: new Date() },
        maintenance: { completed: 10, total: 12, status: "in_progress", last_updated: new Date() },
        testing: { completed: 0, total: 8, status: "pending", last_updated: new Date() }
      },
      overall_compliance: 73
    }
  ]);

  const [audits, setAudits] = useState<PEODPAudit[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DPPlan | null>(plans[0] || null);
  const [activeView, setActiveView] = useState<"dashboard" | "plans" | "audits" | "checklist" | "analytics" | "fmea" | "validation">("dashboard");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [isChecklistEditorOpen, setIsChecklistEditorOpen] = useState(false);

  // New audit form state
  const [newAuditVessel, setNewAuditVessel] = useState("");
  const [newAuditDpClass, setNewAuditDpClass] = useState<"DP1" | "DP2" | "DP3">("DP2");
  const [activeAudit, setActiveAudit] = useState<{ vesselName: string; dpClass: "DP1" | "DP2" | "DP3" } | null>(null);

  const createNewPlan = () => {
    setIsWizardOpen(true);
  };

  const handleWizardComplete = async (data: any) => {
    setIsWizardOpen(false);
    toast.success("Plano PEO-DP criado com sucesso!");
  };

  const handleStartAudit = () => {
    if (!newAuditVessel.trim()) {
      toast.error("Informe o nome da embarcação");
      return;
    }
    setActiveAudit({ vesselName: newAuditVessel, dpClass: newAuditDpClass });
    setIsAuditDialogOpen(false);
    setActiveView("audits");
  };

  const handleAuditSave = (items: PEODPAuditItem[], score: number) => {
    console.log("Audit saved:", { items, score });
    toast.success("Auditoria salva como rascunho");
  };

  const handleAuditComplete = (items: PEODPAuditItem[], score: number) => {
    const newAudit: PEODPAudit = {
      id: `audit-${Date.now()}`,
      vesselId: "",
      vesselName: activeAudit?.vesselName || "",
      dpClass: activeAudit?.dpClass || "DP2",
      checklistVersionId: "default-2024",
      auditDate: new Date().toISOString(),
      status: "concluido",
      items,
      score,
      scoreBySection: {} as any,
      recommendations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };

    setAudits(prev => [newAudit, ...prev]);
    setActiveAudit(null);
    toast.success(`Auditoria concluída com score ${score}%`);
  };

  const handleChecklistSave = (version: PEODPChecklistVersion) => {
    console.log("Checklist saved:", version);
    setIsChecklistEditorOpen(false);
  };

  const getStatusBadge = (status: DPPlan["status"]) => {
    const variants = {
      draft: { label: "Rascunho", color: "bg-secondary text-secondary-foreground" },
      in_review: { label: "Em Revisão", color: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Aprovado", color: "bg-blue-100 text-blue-800" },
      active: { label: "Ativo", color: "bg-green-100 text-green-800" }
    };
    const variant = variants[status];
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 90) return "text-green-600";
    if (compliance >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getSectionProgress = (section: SectionStatus) => {
    return (section.completed / section.total) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Planos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {plans.filter(p => p.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Revisão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {plans.filter(p => p.status === "in_review").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Compliance Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getComplianceColor(
              plans.reduce((sum, p) => sum + p.overall_compliance, 0) / plans.length
            )}`}>
              {Math.round(plans.reduce((sum, p) => sum + p.overall_compliance, 0) / plans.length)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Auditorias Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {audits.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {plans.reduce((sum, p) => {
                return sum + Object.values(p.sections).reduce((s, section) => 
                  s + (section.total - section.completed), 0
                );
              }, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-1 text-xs px-2 py-1">
              <LayoutDashboard className="h-3 w-3" />Dashboard
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-1 text-xs px-2 py-1">
              <FileText className="h-3 w-3" />Planos
            </TabsTrigger>
            <TabsTrigger value="audits" className="flex items-center gap-1 text-xs px-2 py-1">
              <ClipboardCheck className="h-3 w-3" />Auditorias
            </TabsTrigger>
            <TabsTrigger value="logbook" className="flex items-center gap-1 text-xs px-2 py-1">
              <FileText className="h-3 w-3" />Logbook
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center gap-1 text-xs px-2 py-1">
              <Target className="h-3 w-3" />Lições
            </TabsTrigger>
            <TabsTrigger value="competence" className="flex items-center gap-1 text-xs px-2 py-1">
              <GraduationCap className="h-3 w-3" />CPD
            </TabsTrigger>
            <TabsTrigger value="window" className="flex items-center gap-1 text-xs px-2 py-1">
              <Radio className="h-3 w-3" />Janela Op.
            </TabsTrigger>
            <TabsTrigger value="advisor" className="flex items-center gap-1 text-xs px-2 py-1">
              <Target className="h-3 w-3" />AI Advisor
            </TabsTrigger>
            <TabsTrigger value="client" className="flex items-center gap-1 text-xs px-2 py-1">
              <Users className="h-3 w-3" />Cliente
            </TabsTrigger>
            <TabsTrigger value="fmea" className="flex items-center gap-1 text-xs px-2 py-1">
              <Shield className="h-3 w-3" />FMEA
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-1 text-xs px-2 py-1">
              <Target className="h-3 w-3" />ML
            </TabsTrigger>
            <TabsTrigger value="replay" className="flex items-center gap-1 text-xs px-2 py-1">
              <Radio className="h-3 w-3" />Replay
            </TabsTrigger>
            <TabsTrigger value="simops" className="flex items-center gap-1 text-xs px-2 py-1">
              <Ship className="h-3 w-3" />SIMOPS
            </TabsTrigger>
            <TabsTrigger value="evidence" className="flex items-center gap-1 text-xs px-2 py-1">
              <FileText className="h-3 w-3" />Evidências
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center gap-1 text-xs px-2 py-1">
              <Settings className="h-3 w-3" />Checklist
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsAuditDialogOpen(true)}>
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Nova Auditoria
            </Button>
            <Button onClick={createNewPlan}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </div>
        </div>

        {/* Dashboard View */}
        <TabsContent value="dashboard" className="space-y-6">
          {selectedPlan && (
            <>
              {/* Plan Header */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedPlan.vessel_name}</CardTitle>
                      <CardDescription className="flex items-center gap-3 mt-2">
                        <Badge variant="outline">{selectedPlan.vessel_type}</Badge>
                        <Badge variant="outline">Classe {selectedPlan.dp_class}</Badge>
                        {getStatusBadge(selectedPlan.status)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`text-4xl font-bold ${getComplianceColor(selectedPlan.overall_compliance)}`}>
                        {selectedPlan.overall_compliance}%
                      </div>
                      <p className="text-sm text-muted-foreground">Compliance</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Sections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SECTIONS.map((section) => {
                  const sectionData = selectedPlan.sections[section.id as keyof typeof selectedPlan.sections];
                  const progress = getSectionProgress(sectionData);
                  const Icon = section.icon;

                  return (
                    <Card key={section.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className={`${section.bgColor} border-b`}>
                        <div className="flex items-center gap-3">
                          <Icon className={`h-6 w-6 ${section.color}`} />
                          <div className="flex-1">
                            <CardTitle className="text-lg">{section.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {section.description}
                            </CardDescription>
                          </div>
                          {sectionData.status === "completed" && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">
                            {sectionData.completed}/{sectionData.total}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={sectionData.status === "completed" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {sectionData.status === "pending" && "Pendente"}
                            {sectionData.status === "in_progress" && "Em Andamento"}
                            {sectionData.status === "completed" && "Concluído"}
                          </Badge>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Risk Assessment Card */}
              <Card className="border-2 border-yellow-200 bg-yellow-50/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-yellow-600" />
                    <div>
                      <CardTitle>Análise de Risco</CardTitle>
                      <CardDescription>
                        Avaliação automática de gaps e riscos operacionais
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Testes Anuais Pendentes</p>
                        <p className="text-xs text-muted-foreground">
                          Seção de testes anuais não iniciada - crítico para compliance
                        </p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Alta Prioridade</Badge>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Treinamentos Incompletos</p>
                        <p className="text-xs text-muted-foreground">
                          2 requisitos de certificação precisam ser completados
                        </p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Média Prioridade</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Plans View */}
        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Planos PEO-DP</CardTitle>
              <CardDescription>
                Gestão completa de planos de operação com Dynamic Positioning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPlan?.id === plan.id ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{plan.vessel_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {plan.vessel_type} • Classe {plan.dp_class}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getComplianceColor(plan.overall_compliance)}`}>
                            {plan.overall_compliance}%
                          </p>
                          <p className="text-xs text-muted-foreground">Compliance</p>
                        </div>
                        {getStatusBadge(plan.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audits View */}
        <TabsContent value="audits" className="space-y-4">
          {activeAudit ? (
            <PEODPAuditForm
              vesselName={activeAudit.vesselName}
              dpClass={activeAudit.dpClass}
              requirements={PEODP_DEFAULT_REQUIREMENTS}
              onSave={handleAuditSave}
              onComplete={handleAuditComplete}
            />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Auditorias PEO-DP</CardTitle>
                    <CardDescription>
                      Histórico de auditorias realizadas com checklist baseado no programa Petrobras
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsAuditDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Auditoria
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {audits.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhuma auditoria realizada ainda</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsAuditDialogOpen(true)}
                    >
                      Iniciar Primeira Auditoria
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {audits.map(audit => (
                      <div key={audit.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Ship className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{audit.vesselName}</p>
                              <p className="text-sm text-muted-foreground">
                                Classe {audit.dpClass} • {new Date(audit.auditDate).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`text-2xl font-bold ${getScoreColor(audit.score)}`}>
                                {audit.score}%
                              </p>
                              <p className="text-xs text-muted-foreground">{getScoreLevel(audit.score)}</p>
                            </div>
                            <Badge variant={audit.status === "concluido" ? "default" : "secondary"}>
                              {audit.status === "concluido" ? "Concluída" : audit.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Checklist Editor View */}
        <TabsContent value="checklist" className="space-y-4">
          <PEODPChecklistEditor onSave={handleChecklistSave} />
        </TabsContent>

        {/* Smart DP Logbook */}
        <TabsContent value="logbook" className="space-y-4">
          <SmartDPLogbook />
        </TabsContent>

        {/* Lessons Learned Center */}
        <TabsContent value="lessons" className="space-y-4">
          <LessonsLearnedCenter />
        </TabsContent>

        {/* DP Competence Hub */}
        <TabsContent value="competence" className="space-y-4">
          <DPCompetenceHub />
        </TabsContent>

        {/* FMEA/DP Trials View */}
        <TabsContent value="fmea" className="space-y-4">
          <FMEADPTrialsIntegration />
        </TabsContent>

        {/* ML Validation View */}
        <TabsContent value="validation" className="space-y-4">
          <MLValidationIMCA />
        </TabsContent>

        {/* Operational Window Monitor */}
        <TabsContent value="window" className="space-y-4">
          <OperationalWindowMonitor />
        </TabsContent>

        {/* AI Advisor */}
        <TabsContent value="advisor" className="space-y-4">
          <DPAIAdvisor />
        </TabsContent>

        {/* Client Assurance Portal */}
        <TabsContent value="client" className="space-y-4">
          <ClientAssurancePortal />
        </TabsContent>

        {/* DP Replay System */}
        <TabsContent value="replay" className="space-y-4">
          <DPReplaySystem />
        </TabsContent>

        {/* SIMOPS Manager */}
        <TabsContent value="simops" className="space-y-4">
          <SIMOPSManager />
        </TabsContent>

        {/* Auto-Evidence Builder */}
        <TabsContent value="evidence" className="space-y-4">
          <AutoEvidenceBuilder />
        </TabsContent>
      </Tabs>

      {/* New Audit Dialog */}
      <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Auditoria PEO-DP</DialogTitle>
            <DialogDescription>
              Inicie uma nova auditoria baseada no checklist PEO-DP Petrobras
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vesselName">Nome da Embarcação</Label>
              <Input
                id="vesselName"
                placeholder="Ex: PSV Atlantic Explorer"
                value={newAuditVessel}
                onChange={(e) => setNewAuditVessel(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Classe DP</Label>
              <Select value={newAuditDpClass} onValueChange={(v) => setNewAuditDpClass(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DP1">DP1</SelectItem>
                  <SelectItem value="DP2">DP2</SelectItem>
                  <SelectItem value="DP3">DP3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">Checklist PEO-DP {new Date().getFullYear()}</p>
              <p className="text-muted-foreground">
                {PEODP_DEFAULT_REQUIREMENTS.length} requisitos em 6 seções
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAuditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStartAudit}>
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Iniciar Auditoria
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wizard Dialog */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Plano PEO-DP</DialogTitle>
          </DialogHeader>
          <PeoDpWizard
            onComplete={handleWizardComplete}
            onCancel={() => setIsWizardOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
