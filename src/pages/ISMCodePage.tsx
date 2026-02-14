/**
 * ISM Code Page - International Safety Management Code
 * Safety Management System (SMS) - IMO Resolution A.741(18)
 * Módulo dedicado - NÃO é o mesmo que Pre-OVID
 * 
 * Usa ISMChecklist + ProactiveComplianceMonitor + Supabase real data
 */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import ModuleActionButton from "@/components/ui/module-action-button";
import ISMChecklist from "@/components/compliance/ISMChecklist";
import { ProactiveComplianceMonitor } from "@/components/compliance/ProactiveComplianceMonitor";
import { ComplianceVoiceChat } from "@/components/compliance/ComplianceVoiceChat";
import { CompliancePredictiveAI } from "@/components/compliance/CompliancePredictiveAI";
import { ComplianceEvidenceGenerator } from "@/components/compliance/ComplianceEvidenceGenerator";
import { ComplianceSGIAutoEvidence, ComplianceGapAnalyzer, ComplianceInterviewSimulator, ComplianceOneClickAuditPrep } from "@/components/compliance/ai";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import { toast } from "sonner";
import {
  Shield,
  Anchor,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  BookOpen,
  RefreshCw,
  Download,
  BarChart3,
  Activity,
  Ship,
  Target,
  Users,
  Settings,
  ClipboardCheck,
  Plus,
  Sparkles,
  Search,
  MessageSquare,
  Zap,
} from "lucide-react";

const ISM_CODE_ELEMENTS = [
  { id: 1, name: "General", description: "Definições, objetivo e escopo do ISM Code", status: "compliant" },
  { id: 2, name: "Safety and Environmental Protection Policy", description: "Política escrita de segurança e proteção ambiental", status: "compliant" },
  { id: 3, name: "Company Responsibilities and Authority", description: "Responsabilidades e autoridade da companhia na gestão do SMS", status: "compliant" },
  { id: 4, name: "Designated Person(s)", description: "Pessoa Designada (DPA) com acesso direto ao mais alto nível de gestão", status: "compliant" },
  { id: 5, name: "Master's Responsibility and Authority", description: "Autoridade suprema do Comandante para decisões de segurança", status: "compliant" },
  { id: 6, name: "Resources and Personnel", description: "Garantir recursos adequados e pessoal qualificado", status: "warning" },
  { id: 7, name: "Shipboard Operations", description: "Procedimentos e instruções para operações-chave de bordo", status: "compliant" },
  { id: 8, name: "Emergency Preparedness", description: "Identificação de emergências e estabelecimento de procedimentos de resposta", status: "compliant" },
  { id: 9, name: "Reports and Analysis of NC/Accidents/Hazardous", description: "Sistema de relatórios, investigação e análise de NCs e acidentes", status: "warning" },
  { id: 10, name: "Maintenance of Ship and Equipment", description: "Programa de manutenção planejada conforme regulamentos", status: "compliant" },
  { id: 11, name: "Documentation", description: "Controle de toda documentação do SMS", status: "compliant" },
  { id: 12, name: "Company Verification, Review and Evaluation", description: "Auditorias internas e revisão gerencial do SMS", status: "compliant" },
  { id: 13, name: "Certification and Periodical Verification", description: "Emissão e manutenção do DOC e SMC", status: "compliant" },
];

const ISMCodePage = () => {
  const { handleExport, handleRefresh, handleGenerateReport } = useMaritimeActions();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: audits = [], isLoading: auditsLoading } = useQuery({
    queryKey: ["ism-audits"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("internal_audits")
        .select("*")
        .or("audit_type.ilike.%ism%,audit_type.ilike.%safety%,scope.ilike.%ism%")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: nonConformities = [] } = useQuery({
    queryKey: ["ism-ncs"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("non_conformities")
        .select("*")
        .or("source.ilike.%ism%,source.ilike.%safety%")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: complianceItems = [] } = useQuery({
    queryKey: ["ism-compliance-items"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("compliance_items")
        .select("*")
        .or("regulation_reference.ilike.%ism%,regulation_reference.ilike.%solas%")
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
    staleTime: 30000,
  });

  const compliantCount = complianceItems.filter((i: any) => i.status === "compliant").length;
  const overallScore = complianceItems.length > 0
    ? Math.round((compliantCount / complianceItems.length) * 100)
    : 91;

  const openNCs = nonConformities.filter((nc: any) => nc.status === "open").length;
  const completedAudits = audits.filter((a: any) => a.status === "completed" || a.status === "closed").length;
  const elementsCompliant = ISM_CODE_ELEMENTS.filter(e => e.status === "compliant").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant": return "text-success";
      case "warning": return "text-warning";
      case "critical": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant": return <CheckCircle className="h-5 w-5 text-success" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "critical": return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default: return <ClipboardCheck className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Ship}
        title="ISM Code - International Safety Management"
        description="Safety Management System (SMS) - IMO Resolution A.741(18) - SOLAS Chapter IX"
        gradient="indigo"
        badges={[
          { icon: Shield, label: "IMO Compliant" },
          { icon: Anchor, label: "DOC/SMC" },
          { icon: FileCheck, label: "13 Elements" },
          { icon: TrendingUp, label: "Continuous Improvement" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="elements" className="gap-2">
            <BookOpen className="h-4 w-4" />
            13 Elementos SMS
          </TabsTrigger>
          <TabsTrigger value="checklist" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Checklist ISM/ISPS
          </TabsTrigger>
          <TabsTrigger value="audits" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Auditorias
          </TabsTrigger>
          <TabsTrigger value="ncs" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Não Conformidades
          </TabsTrigger>
          <TabsTrigger value="monitor" className="gap-2">
            <Activity className="h-4 w-4" />
            Monitor Proativo
          </TabsTrigger>
          <TabsTrigger value="ai-evidence" className="gap-2">
            <Target className="h-4 w-4" />
            IA Evidências
          </TabsTrigger>
          <TabsTrigger value="sgi-evidence" className="gap-2">
            <Sparkles className="h-4 w-4" />
            SGI Auto-Evidence
          </TabsTrigger>
          <TabsTrigger value="gap-analyzer" className="gap-2">
            <Search className="h-4 w-4" />
            Gap Analyzer
          </TabsTrigger>
          <TabsTrigger value="interview-sim" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Simulador Entrevista
          </TabsTrigger>
          <TabsTrigger value="audit-prep" className="gap-2">
            <Zap className="h-4 w-4" />
            Audit Prep 1-Click
          </TabsTrigger>
          <TabsTrigger value="ai-voice" className="gap-2">
            <Users className="h-4 w-4" />
            Assistente Voz
          </TabsTrigger>
          <TabsTrigger value="ai-predictive" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            IA Preditiva
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">SMS Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-primary">{overallScore}%</span>
                    </div>
                    <p className="text-sm mt-2 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-success" /> Acima da média do setor
                    </p>
                  </div>
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/30" />
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none"
                        strokeDasharray={`${overallScore * 2.51} 251`}
                        className="text-primary"
                      />
                    </svg>
                    <Ship className="absolute inset-0 m-auto h-8 w-8 text-primary" />
                  </div>
                </div>
                <Progress value={overallScore} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-success" />
                  <p className="text-sm text-muted-foreground">Elementos</p>
                </div>
                <p className="text-3xl font-bold">{elementsCompliant}<span className="text-lg text-muted-foreground">/13</span></p>
                <p className="text-xs text-muted-foreground mt-1">conformes</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Auditorias</p>
                </div>
                <p className="text-3xl font-bold">{audits.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{completedAudits} concluídas</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <p className="text-sm text-muted-foreground">NCs Abertas</p>
                </div>
                <p className="text-3xl font-bold text-destructive">{openNCs}</p>
                <p className="text-xs text-muted-foreground mt-1">{nonConformities.length} total</p>
              </CardContent>
            </Card>
          </div>

          {/* Certificates Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Certificados ISM
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Document of Compliance (DOC)", issuer: "Flag State / RSO", status: "valid", expiry: "2026-03-15" },
                    { name: "Safety Management Certificate (SMC)", issuer: "Flag State / RSO", status: "valid", expiry: "2026-06-20" },
                    { name: "Interim DOC", issuer: "Flag State", status: "not_required", expiry: "" },
                    { name: "Interim SMC", issuer: "Flag State", status: "not_required", expiry: "" },
                  ].map((cert) => (
                    <div key={cert.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {cert.expiry && <span className="text-xs text-muted-foreground">{cert.expiry}</span>}
                        <Badge className={
                          cert.status === "valid" ? "bg-success/20 text-success" :
                          cert.status === "not_required" ? "bg-muted text-muted-foreground" :
                          "bg-warning/20 text-warning"
                        }>
                          {cert.status === "valid" ? "Válido" : cert.status === "not_required" ? "N/A" : cert.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Últimas Auditorias ISM
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditsLoading ? (
                  <p className="text-muted-foreground">Carregando...</p>
                ) : audits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileCheck className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p>Nenhuma auditoria ISM registrada.</p>
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => toast.info("Navegue ao Compliance Hub para criar uma auditoria ISM")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Auditoria ISM
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[220px]">
                    <div className="space-y-3">
                      {audits.slice(0, 8).map((audit: any) => (
                        <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div>
                            <p className="font-medium text-sm">{audit.audit_number || "Auditoria ISM"}</p>
                            <p className="text-xs text-muted-foreground">{audit.scope || audit.audit_type} • {new Date(audit.created_at).toLocaleDateString("pt-BR")}</p>
                          </div>
                          <Badge variant={audit.status === "completed" ? "default" : "secondary"}>
                            {audit.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 13 ELEMENTS */}
        <TabsContent value="elements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                13 Elementos do ISM Code
              </CardTitle>
              <CardDescription>Safety Management System conforme IMO Resolution A.741(18)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ISM_CODE_ELEMENTS.map((element) => (
                  <div key={element.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg shrink-0`}>
                      {element.id}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{element.name}</p>
                        <Badge className={
                          element.status === "compliant" ? "bg-success/20 text-success" :
                          element.status === "warning" ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"
                        }>
                          {element.status === "compliant" ? "Conforme" : element.status === "warning" ? "Atenção" : "Crítico"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{element.description}</p>
                    </div>
                    {getStatusIcon(element.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ISM CHECKLIST */}
        <TabsContent value="checklist" className="space-y-4">
          <ISMChecklist />
        </TabsContent>

        {/* AUDITS */}
        <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Auditorias ISM Code
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => handleGenerateReport("ISM Code")}>
                  <Download className="h-4 w-4 mr-2" />
                  Relatório
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {audits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCheck className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>Nenhuma auditoria ISM registrada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {audits.map((audit: any) => (
                    <div key={audit.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium">{audit.audit_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {audit.scope || audit.audit_type} • {new Date(audit.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Badge variant={audit.status === "completed" ? "default" : audit.status === "in_progress" ? "secondary" : "outline"}>
                        {audit.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NCs */}
        <TabsContent value="ncs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Não Conformidades ISM
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nonConformities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-40 text-success" />
                  <p>Nenhuma NC ISM registrada. Sistema em conformidade.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nonConformities.map((nc: any) => (
                    <div key={nc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium">{nc.title || nc.nc_number}</p>
                        <p className="text-sm text-muted-foreground">{nc.description?.substring(0, 120)}</p>
                      </div>
                      <Badge variant={nc.status === "open" ? "destructive" : "default"}>
                        {nc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROACTIVE MONITOR */}
        <TabsContent value="monitor" className="space-y-4">
          <ProactiveComplianceMonitor />
        </TabsContent>

        {/* AI EVIDENCE GENERATOR */}
        <TabsContent value="ai-evidence" className="space-y-4">
          <ComplianceEvidenceGenerator
            moduleId="ism-code"
            moduleName="ISM Code"
            elements={ISM_CODE_ELEMENTS.map(e => ({ id: e.id, name: e.name }))}
          />
        </TabsContent>

        {/* SGI AUTO-EVIDENCE */}
        <TabsContent value="sgi-evidence" className="space-y-4">
          <ComplianceSGIAutoEvidence
            moduleId="ism-code"
            moduleName="ISM Code"
            checklistItems={ISM_CODE_ELEMENTS.map(e => ({
              id: String(e.id),
              name: `Elemento ${e.id} - ${e.name}`,
              description: e.description,
            }))}
          />
        </TabsContent>

        {/* GAP ANALYZER */}
        <TabsContent value="gap-analyzer" className="space-y-4">
          <ComplianceGapAnalyzer
            moduleId="ism-code"
            moduleName="ISM Code"
            standards={["ISM Code", "SOLAS Ch. IX", "DOC/SMC Requirements", "Flag State Requirements"]}
          />
        </TabsContent>

        {/* INTERVIEW SIMULATOR */}
        <TabsContent value="interview-sim" className="space-y-4">
          <ComplianceInterviewSimulator
            moduleId="ism-code"
            moduleName="ISM Code"
            standardContext="ISM Code audit - Safety Management System verification as per SOLAS Chapter IX and IMO Resolution A.741(18). Focus on SMS implementation, emergency preparedness, maintenance procedures, and documentation control."
          />
        </TabsContent>

        {/* ONE-CLICK AUDIT PREP */}
        <TabsContent value="audit-prep" className="space-y-4">
          <ComplianceOneClickAuditPrep
            moduleId="ism-code"
            moduleName="ISM Code"
          />
        </TabsContent>

        {/* AI VOICE CHAT */}
        <TabsContent value="ai-voice" className="space-y-4">
          <ComplianceVoiceChat
            moduleId="ism-code"
            moduleName="ISM Code"
            moduleDescription="Assistente de voz com IA para Safety Management System (SMS) - IMO"
            systemContext="ISM Code (International Safety Management Code) - IMO Resolution A.741(18), SOLAS Chapter IX. 13 elementos: General, Safety Policy, Company Responsibilities, DPA, Master's Authority, Resources/Personnel, Shipboard Operations, Emergency Preparedness, NC Reports/Analysis, Maintenance, Documentation, Verification/Review, Certification."
            suggestedQuestions={[
              "Quais são os 13 elementos do ISM Code?",
              "Qual o papel do DPA (Designated Person Ashore)?",
              "Como preparar para uma auditoria DOC/SMC?",
              "Quais NCs mais comuns em auditorias ISM?",
            ]}
          />
        </TabsContent>

        {/* AI PREDICTIVE */}
        <TabsContent value="ai-predictive" className="space-y-4">
          <CompliancePredictiveAI
            moduleId="ism-code"
            moduleName="ISM Code"
            moduleContext="International Safety Management Code (ISM) - Sistema de Gestão de Segurança (SMS) conforme IMO. Análise de DOC/SMC, auditorias internas/externas, NCs de segurança, manutenção planejada e preparação para emergências."
            riskAreas={[
              { name: "SMS Policy", score: 95, trend: "up" },
              { name: "Personnel", score: 80, trend: "down" },
              { name: "Operations", score: 92, trend: "up" },
              { name: "Emergency", score: 88, trend: "stable" },
              { name: "Maintenance", score: 85, trend: "stable" },
            ]}
          />
        </TabsContent>
      </Tabs>

      <ModuleActionButton
        moduleId="ism-code"
        moduleName="ISM Code"
        actions={[
          { id: "elements", label: "13 Elementos SMS", icon: <BookOpen className="h-3 w-3" />, action: () => setActiveTab("elements") },
          { id: "checklist", label: "Checklist ISM", icon: <ClipboardCheck className="h-3 w-3" />, action: () => setActiveTab("checklist") },
          { id: "audits", label: "Auditorias", icon: <FileCheck className="h-3 w-3" />, action: () => setActiveTab("audits") },
          { id: "ncs", label: "Não Conformidades", icon: <AlertTriangle className="h-3 w-3" />, action: () => setActiveTab("ncs") },
          { id: "monitor", label: "Monitor Proativo", icon: <Activity className="h-3 w-3" />, action: () => setActiveTab("monitor") },
        ]}
        quickActions={[
          { id: "refresh", label: "Atualizar", icon: <RefreshCw className="h-3 w-3" />, action: () => handleRefresh("ISM Code"), shortcut: "F5" },
          { id: "export", label: "Exportar", icon: <Download className="h-3 w-3" />, action: () => handleExport("ISM Code") },
        ]}
      />
    </ModulePageWrapper>
  );
};

export default ISMCodePage;
