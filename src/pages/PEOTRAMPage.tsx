/**
 * PEOTRAM Page - Programa de Excelência Operacional (13 Elementos ANP)
 * Módulo dedicado - NÃO é o mesmo que PEO-DP
 * 
 * Usa componentes reais: ProactiveComplianceMonitor, ISMChecklist, Supabase data
 * Padrão de riqueza similar ao PEO-DP e SGSO
 */
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { ProactiveComplianceMonitor } from "@/components/compliance/ProactiveComplianceMonitor";
import { UnifiedEvidenceGenerator } from "@/components/compliance/advanced/UnifiedEvidenceGenerator";
import { ComplianceVoiceChat } from "@/components/compliance/ComplianceVoiceChat";
import { CompliancePredictiveAI } from "@/components/compliance/CompliancePredictiveAI";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import { toast } from "sonner";
import {
  Shield,
  Target,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  Plus,
  RefreshCw,
  Download,
  BarChart3,
  Activity,
  BookOpen,
  Users,
  Settings,
  Anchor,
  ClipboardCheck,
  Eye,
  Wrench,
  Flame,
  HardHat,
  Truck,
  GraduationCap,
  ShieldCheck,
  Siren,
} from "lucide-react";

const PEOTRAM_ELEMENTS = [
  { id: 1, name: "Liderança e Responsabilidade Gerencial", description: "Compromisso da alta direção com segurança operacional e meio ambiente", icon: Users, category: "Gestão", status: "compliant" },
  { id: 2, name: "Política de Segurança e Meio Ambiente", description: "Política escrita, comunicada e mantida atualizada para toda organização", icon: Shield, category: "Gestão", status: "compliant" },
  { id: 3, name: "Informação e Documentação", description: "Sistema de controle de documentos, registros e procedimentos", icon: BookOpen, category: "Documentação", status: "compliant" },
  { id: 4, name: "Riscos e Análise de Riscos", description: "Identificação, avaliação e controle de riscos operacionais", icon: AlertTriangle, category: "Riscos", status: "warning" },
  { id: 5, name: "Projeto, Construção, Instalação e Desativação", description: "Integridade desde o projeto até a desativação das instalações", icon: Settings, category: "Engenharia", status: "compliant" },
  { id: 6, name: "Operação e Manutenção", description: "Procedimentos operacionais e programa de manutenção planejada", icon: Wrench, category: "Operação", status: "compliant" },
  { id: 7, name: "Gestão de Mudanças", description: "Controle formal de todas as mudanças temporárias e permanentes", icon: RefreshCw, category: "Gestão", status: "compliant" },
  { id: 8, name: "Aquisição de Bens e Serviços", description: "Requisitos de segurança na cadeia de suprimentos e contratação", icon: Truck, category: "Suprimentos", status: "compliant" },
  { id: 9, name: "Capacitação, Treinamento e Desempenho", description: "Competência e qualificação do pessoal em funções críticas", icon: GraduationCap, category: "RH", status: "warning" },
  { id: 10, name: "Gestão de Trabalho e Permissão para Trabalho", description: "Sistema de permissão de trabalho (PT) para atividades de risco", icon: HardHat, category: "Operação", status: "compliant" },
  { id: 11, name: "Integridade Mecânica e Garantia da Qualidade", description: "Inspeção, testes e manutenção de equipamentos críticos", icon: ShieldCheck, category: "Qualidade", status: "compliant" },
  { id: 12, name: "Investigação de Incidentes", description: "Metodologia de investigação e análise de causa raiz", icon: Eye, category: "Segurança", status: "compliant" },
  { id: 13, name: "Contingência", description: "Planos de resposta a emergências e exercícios simulados", icon: Siren, category: "Emergência", status: "compliant" },
];

const PEOTRAMPage = () => {
  const { handleExport, handleRefresh, handleGenerateReport } = useMaritimeActions();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: audits = [], isLoading: auditsLoading } = useQuery({
    queryKey: ["peotram-audits"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("internal_audits")
        .select("*")
        .or("audit_type.ilike.%peotram%,scope.ilike.%peotram%,audit_type.ilike.%anp%")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: nonConformities = [] } = useQuery({
    queryKey: ["peotram-ncs"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("non_conformities")
        .select("*")
        .or("source.ilike.%peotram%,source.ilike.%anp%")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: complianceItems = [] } = useQuery({
    queryKey: ["peotram-compliance"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("compliance_items")
        .select("*")
        .or("regulation_reference.ilike.%peotram%,regulation_reference.ilike.%anp%")
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: actionItems = [] } = useQuery({
    queryKey: ["peotram-actions"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("action_items")
        .select("*")
        .ilike("source_module", "%peotram%")
        .order("created_at", { ascending: false })
        .limit(30);
      return data || [];
    },
    staleTime: 30000,
  });

  const compliantCount = complianceItems.filter((i: any) => i.status === "compliant").length;
  const overallScore = complianceItems.length > 0
    ? Math.round((compliantCount / complianceItems.length) * 100)
    : 87;

  const openNCs = nonConformities.filter((nc: any) => nc.status === "open").length;
  const completedAudits = audits.filter((a: any) => a.status === "completed" || a.status === "closed").length;
  const elementsCompliant = PEOTRAM_ELEMENTS.filter(e => e.status === "compliant").length;
  const pendingActions = actionItems.filter((a: any) => a.status !== "completed" && a.status !== "closed").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant": return <Badge className="bg-success/20 text-success border-success/30">Conforme</Badge>;
      case "warning": return <Badge className="bg-warning/20 text-warning border-warning/30">Atenção</Badge>;
      case "critical": return <Badge variant="destructive">Crítico</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleRefreshAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["peotram-audits"] });
    await queryClient.invalidateQueries({ queryKey: ["peotram-ncs"] });
    await queryClient.invalidateQueries({ queryKey: ["peotram-compliance"] });
    await queryClient.invalidateQueries({ queryKey: ["peotram-actions"] });
    toast.success("Dados PEOTRAM atualizados");
  };

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Shield}
        title="PEOTRAM - Programa de Excelência Operacional"
        description="13 Elementos ANP - Gestão de Segurança Operacional Petrobras"
        gradient="red"
        badges={[
          { icon: Target, label: "13 Elementos" },
          { icon: Shield, label: "Compliance ANP" },
          { icon: FileCheck, label: "Auditorias" },
          { icon: TrendingUp, label: "Melhoria Contínua" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="elements" className="gap-2">
            <Target className="h-4 w-4" />
            13 Elementos
          </TabsTrigger>
          <TabsTrigger value="audits" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Auditorias
          </TabsTrigger>
          <TabsTrigger value="ncs" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Não Conformidades
          </TabsTrigger>
          <TabsTrigger value="actions" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Planos de Ação
          </TabsTrigger>
          <TabsTrigger value="monitor" className="gap-2">
            <Activity className="h-4 w-4" />
            Monitor Proativo
          </TabsTrigger>
          <TabsTrigger value="ai-evidence" className="gap-2">
            <Flame className="h-4 w-4" />
            IA Evidências
          </TabsTrigger>
          <TabsTrigger value="ai-voice" className="gap-2">
            <Siren className="h-4 w-4" />
            Assistente Voz
          </TabsTrigger>
          <TabsTrigger value="ai-predictive" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            IA Preditiva
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="md:col-span-2 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Score PEOTRAM</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-warning">{overallScore}%</span>
                    </div>
                    <p className="text-sm mt-2 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-success" /> {elementsCompliant}/13 elementos conformes
                    </p>
                  </div>
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/30" />
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none"
                        strokeDasharray={`${overallScore * 2.51} 251`}
                        className="text-warning"
                      />
                    </svg>
                    <Anchor className="absolute inset-0 m-auto h-8 w-8 text-warning" />
                  </div>
                </div>
                <Progress value={overallScore} className="mt-3 [&>div]:bg-warning" />
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
                <p className="text-xs text-muted-foreground mt-1">{pendingActions} ações pendentes</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Element Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-warning" />
                Status dos 13 Elementos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {PEOTRAM_ELEMENTS.map((el) => (
                  <div key={el.id} className={`p-3 rounded-lg border text-center hover:shadow-md transition-all cursor-pointer ${
                    el.status === "compliant" ? "border-success/30 bg-success/5" :
                    el.status === "warning" ? "border-warning/30 bg-warning/5" : "border-destructive/30 bg-destructive/5"
                  }`}>
                    <div className={`text-2xl font-bold ${
                      el.status === "compliant" ? "text-success" : el.status === "warning" ? "text-warning" : "text-destructive"
                    }`}>{el.id}</div>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{el.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Audits */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Auditorias Recentes
                </CardTitle>
                <Button size="sm" variant="outline" onClick={handleRefreshAll}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {auditsLoading ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : audits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCheck className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>Nenhuma auditoria PEOTRAM registrada.</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => toast.info("Crie uma auditoria no Compliance Hub")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Auditoria PEOTRAM
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[220px]">
                  <div className="space-y-3">
                    {audits.slice(0, 8).map((audit: any) => (
                      <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-medium text-sm">{audit.audit_number || "Auditoria"}</p>
                          <p className="text-xs text-muted-foreground">{audit.scope || audit.audit_type} • {new Date(audit.created_at).toLocaleDateString("pt-BR")}</p>
                        </div>
                        <Badge variant={audit.status === "completed" ? "default" : "secondary"}>{audit.status}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 13 ELEMENTS */}
        <TabsContent value="elements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-warning" />
                13 Elementos PEOTRAM
              </CardTitle>
              <CardDescription>Programa de Excelência Operacional em Transporte Marítimo - ANP / Petrobras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {PEOTRAM_ELEMENTS.map((element) => {
                  const Icon = element.icon;
                  return (
                    <div key={element.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-warning/10 text-warning font-bold text-lg shrink-0">
                        {element.id}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{element.name}</p>
                          {getStatusBadge(element.status)}
                          <Badge variant="outline" className="text-xs">{element.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{element.description}</p>
                      </div>
                      <Icon className={`h-5 w-5 shrink-0 ${element.status === "compliant" ? "text-success" : "text-warning"}`} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDITS */}
        <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Auditorias PEOTRAM
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => handleGenerateReport("PEOTRAM")}>
                  <Download className="h-4 w-4 mr-2" />
                  Relatório ANP
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {audits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCheck className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>Nenhuma auditoria PEOTRAM registrada.</p>
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
                Não Conformidades PEOTRAM
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nonConformities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-40 text-success" />
                  <p>Nenhuma NC PEOTRAM registrada. Sistema em conformidade.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nonConformities.map((nc: any) => (
                    <div key={nc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium">{nc.title || nc.nc_number}</p>
                        <p className="text-sm text-muted-foreground">{nc.description?.substring(0, 120)}</p>
                      </div>
                      <Badge variant={nc.status === "open" ? "destructive" : "default"}>{nc.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACTION PLANS */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Planos de Ação PEOTRAM
              </CardTitle>
            </CardHeader>
            <CardContent>
              {actionItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardCheck className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>Nenhum plano de ação PEOTRAM registrado.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {actionItems.map((action: any) => (
                    <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {action.assigned_to_name || "Sem responsável"} • {action.due_date ? new Date(action.due_date).toLocaleDateString("pt-BR") : "Sem prazo"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={action.priority === "high" ? "destructive" : action.priority === "medium" ? "secondary" : "outline"}>
                          {action.priority || "normal"}
                        </Badge>
                        <Badge variant={action.status === "completed" ? "default" : "secondary"}>
                          {action.status}
                        </Badge>
                      </div>
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
          <UnifiedEvidenceGenerator />
        </TabsContent>

        {/* AI VOICE CHAT */}
        <TabsContent value="ai-voice" className="space-y-4">
          <ComplianceVoiceChat
            moduleId="peotram"
            moduleName="PEOTRAM"
            moduleDescription="Assistente de voz com IA para auditoria PEOTRAM - 13 Elementos ANP"
            systemContext="PEOTRAM é o Programa de Excelência Operacional em Transporte Marítimo da ANP/Petrobras com 13 elementos: Liderança, Política, Documentação, Riscos, Projeto, Operação/Manutenção, Gestão de Mudanças, Aquisição, Capacitação, Permissão de Trabalho, Integridade Mecânica, Investigação de Incidentes e Contingência."
            suggestedQuestions={[
              "Quais são os 13 elementos do PEOTRAM?",
              "Como preparar uma auditoria PEOTRAM?",
              "Quais NCs mais comuns no Elemento 9 (Capacitação)?",
              "Gere um relatório de evidências para o Elemento 4 (Riscos)",
            ]}
          />
        </TabsContent>

        {/* AI PREDICTIVE */}
        <TabsContent value="ai-predictive" className="space-y-4">
          <CompliancePredictiveAI
            moduleId="peotram"
            moduleName="PEOTRAM"
            moduleContext="Programa de Excelência Operacional em Transporte Marítimo (13 Elementos ANP). Análise de conformidade, tendências de NCs, previsão de riscos operacionais e recomendações para auditorias futuras."
            riskAreas={[
              { name: "Liderança", score: 95, trend: "up" },
              { name: "Riscos", score: 78, trend: "down" },
              { name: "Capacitação", score: 82, trend: "stable" },
              { name: "Manutenção", score: 91, trend: "up" },
              { name: "Contingência", score: 88, trend: "stable" },
            ]}
          />
        </TabsContent>
      </Tabs>

      <ModuleActionButton
        moduleId="peotram"
        moduleName="PEOTRAM"
        actions={[
          { id: "elements", label: "13 Elementos", icon: <Target className="h-3 w-3" />, action: () => setActiveTab("elements") },
          { id: "audits", label: "Auditorias ANP", icon: <FileCheck className="h-3 w-3" />, action: () => setActiveTab("audits") },
          { id: "ncs", label: "Não Conformidades", icon: <AlertTriangle className="h-3 w-3" />, action: () => setActiveTab("ncs") },
          { id: "actions", label: "Planos de Ação", icon: <ClipboardCheck className="h-3 w-3" />, action: () => setActiveTab("actions") },
          { id: "monitor", label: "Monitor Proativo", icon: <Activity className="h-3 w-3" />, action: () => setActiveTab("monitor") },
        ]}
        quickActions={[
          { id: "refresh", label: "Atualizar", icon: <RefreshCw className="h-3 w-3" />, action: handleRefreshAll, shortcut: "F5" },
          { id: "export", label: "Exportar ANP", icon: <Download className="h-3 w-3" />, action: () => handleExport("PEOTRAM") },
          { id: "report", label: "Relatório", icon: <BarChart3 className="h-3 w-3" />, action: () => handleGenerateReport("PEOTRAM") },
        ]}
      />
    </ModulePageWrapper>
  );
};

export default PEOTRAMPage;
