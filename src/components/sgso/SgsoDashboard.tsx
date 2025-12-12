import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  AlertTriangle,
  FileText,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Bell,
  Calendar,
  Brain,
  GitBranch,
  Download,
  MessageSquare,
  Plus,
  Save
} from "lucide-react";
import { AnpPracticesManager } from "./AnpPracticesManager";
import { RiskAssessmentMatrix } from "./RiskAssessmentMatrix";
import { IncidentReporting } from "./IncidentReporting";
import { TrainingCompliance } from "./TrainingCompliance";
import { AuditPlanner } from "./AuditPlanner";
import { NonConformityManager } from "./NonConformityManager";
import { ComplianceMetrics } from "./ComplianceMetrics";
import { EmergencyResponse } from "./EmergencyResponse";
import { PainelSGSO } from "./PainelSGSO";
import { PainelMetricasRisco } from "./PainelMetricasRisco";
import { SGSOActionPlanGenerator } from "./SGSOActionPlanGenerator";
import { CAPAManager } from "./CAPAManager";
import { SGSOEnhancedAssistant } from "./SGSOEnhancedAssistant";
import { ANPDossierExport } from "./ANPDossierExport";

export const SgsoDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  
  // Dialog states
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  
  // Form states
  const [incidentForm, setIncidentForm] = useState({
    title: "",
    type: "",
    severity: "",
    description: "",
    vessel: "",
    location: ""
  };
  
  const [riskForm, setRiskForm] = useState({
    title: "",
    category: "",
    probability: "",
    impact: "",
    description: "",
    mitigation: ""
  });
  
  const [auditForm, setAuditForm] = useState({
    title: "",
    type: "",
    scope: "",
    auditor: "",
    scheduledDate: "",
    practices: ""
  });

  // Sample KPIs
  const kpis = {
    overallCompliance: 84,
    practices: {
      compliant: 10,
      nonCompliant: 3,
      inProgress: 3,
      pending: 1
    },
    incidents: {
      total: 12,
      critical: 1,
      high: 3,
      medium: 5,
      low: 3,
      openIncidents: 4
    },
    risks: {
      critical: 1,
      high: 2,
      medium: 8,
      low: 15,
      totalRisks: 26
    },
    audits: {
      completed: 8,
      planned: 3,
      overdue: 1
    },
    training: {
      upToDate: 87,
      expiringSoon: 5,
      expired: 2
    }
  };

  const handleSubmitIncident = () => {
    if (!incidentForm.title || !incidentForm.type || !incidentForm.severity) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "✅ Incidente Registrado",
      description: `Incidente "${incidentForm.title}" foi registrado com sucesso.`
    };
    setIncidentDialogOpen(false);
    setIncidentForm({ title: "", type: "", severity: "", description: "", vessel: "", location: "" });
  };

  const handleSubmitRisk = () => {
    if (!riskForm.title || !riskForm.probability || !riskForm.impact) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const score = parseInt(riskForm.probability) * parseInt(riskForm.impact);
    let level = "Baixo";
    if (score >= 20) level = "Crítico";
    else if (score >= 15) level = "Alto";
    else if (score >= 8) level = "Médio";
    
    toast({
      title: "✅ Risco Registrado",
      description: `Risco "${riskForm.title}" classificado como ${level} (Score: ${score}).`
    };
    setRiskDialogOpen(false);
    setRiskForm({ title: "", category: "", probability: "", impact: "", description: "", mitigation: "" });
  };

  const handleSubmitAudit = () => {
    if (!auditForm.title || !auditForm.type || !auditForm.scheduledDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "✅ Auditoria Agendada",
      description: `Auditoria "${auditForm.title}" agendada para ${auditForm.scheduledDate}.`
    };
    setAuditDialogOpen(false);
    setAuditForm({ title: "", type: "", scope: "", auditor: "", scheduledDate: "", practices: "" });
  };

  const handleGenerateANPReport = () => {
    toast({
      title: "📊 Gerando Relatório ANP",
      description: "O relatório está sendo preparado. Você será notificado quando estiver pronto."
    };
    setActiveTab("dossie");
  };

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800">
        <CardContent className="p-8">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="p-6 bg-white dark:bg-background rounded-2xl shadow-lg">
              <Shield className="h-16 w-16 text-red-600" />
            </div>
            <div className="flex-1 min-w-[300px]">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Sistema de Gestão de Segurança Operacional (SGSO)
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                Compliance ANP Resolução 43/2007 - 17 Práticas Obrigatórias
              </p>
              <div className="flex gap-3 flex-wrap">
                <Badge className="bg-green-600 text-white px-4 py-2 text-sm font-semibold">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {kpis.practices.compliant} Práticas Conformes
                </Badge>
                <Badge className="bg-red-600 text-white px-4 py-2 text-sm font-semibold">
                  <XCircle className="h-4 w-4 mr-2" />
                  {kpis.practices.nonCompliant} Não Conformes
                </Badge>
                <Badge className="bg-blue-600 text-white px-4 py-2 text-sm font-semibold">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {kpis.overallCompliance}% Compliance Geral
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handlenavigateToTab}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-10 w-10 text-red-600" />
              <Badge className="bg-red-600 text-white font-bold">CRÍTICO</Badge>
            </div>
            <h3 className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Incidentes Abertos</h3>
            <p className="text-3xl font-bold text-red-900 dark:text-red-300">{kpis.incidents.openIncidents}</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              {kpis.incidents.critical} críticos, {kpis.incidents.high} altos
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handlenavigateToTab}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-10 w-10 text-orange-600" />
              <Badge className="bg-orange-600 text-white font-bold">RISCOS</Badge>
            </div>
            <h3 className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">Riscos Ativos</h3>
            <p className="text-3xl font-bold text-orange-900 dark:text-orange-300">{kpis.risks.totalRisks}</p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              {kpis.risks.critical} críticos, {kpis.risks.high} altos
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handlenavigateToTab}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-10 w-10 text-blue-600" />
              <Badge className="bg-blue-600 text-white font-bold">AUDITORIAS</Badge>
            </div>
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Auditorias</h3>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">{kpis.audits.completed}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              {kpis.audits.planned} planejadas, {kpis.audits.overdue} atrasadas
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handlenavigateToTab}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-10 w-10 text-green-600" />
              <Badge className="bg-green-600 text-white font-bold">TREINAMENTO</Badge>
            </div>
            <h3 className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Compliance Treinamento</h3>
            <p className="text-3xl font-bold text-green-900 dark:text-green-300">{kpis.training.upToDate}%</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              {kpis.training.expiringSoon} expirando, {kpis.training.expired} expirados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Módulos SGSO</CardTitle>
          <CardDescription>
            Gestão completa do Sistema de Segurança Operacional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 w-full h-auto gap-2 bg-muted p-2">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-background data-[state=active]:text-red-600 data-[state=active]:font-bold min-h-[44px]"
              >
                <Shield className="h-4 w-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger 
                value="practices"
                className="data-[state=active]:bg-background data-[state=active]:text-red-600 data-[state=active]:font-bold min-h-[44px]"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                17 Práticas
              </TabsTrigger>
              <TabsTrigger 
                value="risks"
                className="data-[state=active]:bg-background data-[state=active]:text-orange-600 data-[state=active]:font-bold min-h-[44px]"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Riscos
              </TabsTrigger>
              <TabsTrigger 
                value="incidents"
                className="data-[state=active]:bg-background data-[state=active]:text-red-600 data-[state=active]:font-bold min-h-[44px]"
              >
                <Bell className="h-4 w-4 mr-2" />
                Incidentes
              </TabsTrigger>
              <TabsTrigger 
                value="audits"
                className="data-[state=active]:bg-background data-[state=active]:text-blue-600 data-[state=active]:font-bold min-h-[44px]"
              >
                <FileText className="h-4 w-4 mr-2" />
                Auditorias
              </TabsTrigger>
              <TabsTrigger 
                value="training"
                className="data-[state=active]:bg-background data-[state=active]:text-green-600 data-[state=active]:font-bold min-h-[44px]"
              >
                <Users className="h-4 w-4 mr-2" />
                Treinamentos
              </TabsTrigger>
              <TabsTrigger 
                value="assistente"
                className="data-[state=active]:bg-background data-[state=active]:text-purple-600 data-[state=active]:font-bold min-h-[44px] bg-purple-100 dark:bg-purple-900/30"
              >
                <Brain className="h-4 w-4 mr-2" />
                IA SGSO
              </TabsTrigger>
            </TabsList>

            {/* Secondary Tabs */}
            <TabsList className="grid grid-cols-2 lg:grid-cols-7 w-full h-auto gap-2 bg-muted p-2">
              <TabsTrigger 
                value="emergency"
                className="data-[state=active]:bg-background data-[state=active]:text-red-700 data-[state=active]:font-bold min-h-[44px]"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergência
              </TabsTrigger>
              <TabsTrigger 
                value="nc"
                className="data-[state=active]:bg-background data-[state=active]:text-yellow-600 data-[state=active]:font-bold min-h-[44px]"
              >
                <XCircle className="h-4 w-4 mr-2" />
                NCs
              </TabsTrigger>
              <TabsTrigger 
                value="capa"
                className="data-[state=active]:bg-background data-[state=active]:text-orange-600 data-[state=active]:font-bold min-h-[44px]"
              >
                <GitBranch className="h-4 w-4 mr-2" />
                CAPA
              </TabsTrigger>
              <TabsTrigger 
                value="plano-ia"
                className="data-[state=active]:bg-background data-[state=active]:text-purple-600 data-[state=active]:font-bold min-h-[44px]"
              >
                <Brain className="h-4 w-4 mr-2" />
                Plano IA
              </TabsTrigger>
              <TabsTrigger 
                value="dossie"
                className="data-[state=active]:bg-background data-[state=active]:text-green-600 data-[state=active]:font-bold min-h-[44px]"
              >
                <Download className="h-4 w-4 mr-2" />
                Dossiê ANP
              </TabsTrigger>
              <TabsTrigger 
                value="metrics"
                className="data-[state=active]:bg-background data-[state=active]:text-purple-600 data-[state=active]:font-bold min-h-[44px]"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Métricas
              </TabsTrigger>
              <TabsTrigger 
                value="painel"
                className="data-[state=active]:bg-background data-[state=active]:text-red-600 data-[state=active]:font-bold min-h-[44px]"
              >
                <Activity className="h-4 w-4 mr-2" />
                Painel
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Atividades Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { type: "incident", title: "Novo incidente registrado", time: "2 horas atrás", severity: "high", tab: "incidents" },
                        { type: "audit", title: "Auditoria ANP concluída", time: "5 horas atrás", severity: "info", tab: "audits" },
                        { type: "practice", title: "Prática 4 atualizada", time: "1 dia atrás", severity: "warning", tab: "practices" },
                        { type: "risk", title: "Novo risco identificado", time: "2 dias atrás", severity: "medium", tab: "risks" }
                      ].map((activity, index) => (
                        <div 
                          key={index} 
                          className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => handlenavigateToTab}
                        >
                          <div className={`p-2 rounded-full ${
                            activity.severity === "high" ? "bg-red-100 dark:bg-red-900/30" :
                              activity.severity === "warning" ? "bg-yellow-100 dark:bg-yellow-900/30" :
                                activity.severity === "info" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-muted"
                          }`}>
                            <Activity className={`h-4 w-4 ${
                              activity.severity === "high" ? "text-red-600" :
                                activity.severity === "warning" ? "text-yellow-600" :
                                  activity.severity === "info" ? "text-blue-600" : "text-muted-foreground"
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Próximas Ações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { task: "Auditoria interna Prática 13", due: "Amanhã", priority: "high", tab: "audits" },
                        { task: "Revisão matriz de riscos", due: "3 dias", priority: "medium", tab: "risks" },
                        { task: "Treinamento SGSO tripulação", due: "1 semana", priority: "medium", tab: "training" },
                        { task: "Relatório ANP mensal", due: "2 semanas", priority: "low", tab: "dossie" }
                      ].map((task, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => handlenavigateToTab}
                        >
                          <div className="flex items-center gap-3">
                            <Clock className={`h-4 w-4 ${
                              task.priority === "high" ? "text-red-600" :
                                task.priority === "medium" ? "text-yellow-600" : "text-blue-600"
                            }`} />
                            <span className="font-semibold text-sm">{task.task}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {task.due}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions with Dialogs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Incident Dialog */}
                    <Dialog open={incidentDialogOpen} onOpenChange={setIncidentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700 text-white h-auto py-6 flex-col gap-2">
                          <Bell className="h-6 w-6" />
                          <span className="font-semibold">Reportar Incidente</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-red-600" />
                            Registrar Novo Incidente
                          </DialogTitle>
                          <DialogDescription>
                            Preencha os dados do incidente para registro no SGSO
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="incident-title">Título do Incidente *</Label>
                            <Input
                              id="incident-title"
                              placeholder="Descreva brevemente o incidente"
                              value={incidentForm.title}
                              onChange={handleChange}))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Tipo *</Label>
                              <Select value={incidentForm.type} onValueChange={(v) => setIncidentForm(prev => ({ ...prev, type: v }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="accident">Acidente</SelectItem>
                                  <SelectItem value="near_miss">Quase Acidente</SelectItem>
                                  <SelectItem value="environmental">Ambiental</SelectItem>
                                  <SelectItem value="operational">Operacional</SelectItem>
                                  <SelectItem value="security">Segurança</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Severidade *</Label>
                              <Select value={incidentForm.severity} onValueChange={(v) => setIncidentForm(prev => ({ ...prev, severity: v }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="critical">Crítico</SelectItem>
                                  <SelectItem value="high">Alto</SelectItem>
                                  <SelectItem value="medium">Médio</SelectItem>
                                  <SelectItem value="low">Baixo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="incident-vessel">Embarcação</Label>
                              <Input
                                id="incident-vessel"
                                placeholder="Nome da embarcação"
                                value={incidentForm.vessel}
                                onChange={handleChange}))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="incident-location">Local</Label>
                              <Input
                                id="incident-location"
                                placeholder="Local do incidente"
                                value={incidentForm.location}
                                onChange={handleChange}))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="incident-description">Descrição Detalhada</Label>
                            <Textarea
                              id="incident-description"
                              placeholder="Descreva o incidente em detalhes..."
                              rows={3}
                              value={incidentForm.description}
                              onChange={handleChange}))}
                            />
                          </div>
                          <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleSubmitIncident}>
                            <Save className="h-4 w-4 mr-2" />
                            Registrar Incidente
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Risk Dialog */}
                    <Dialog open={riskDialogOpen} onOpenChange={setRiskDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white h-auto py-6 flex-col gap-2">
                          <AlertTriangle className="h-6 w-6" />
                          <span className="font-semibold">Registrar Risco</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            Registrar Novo Risco
                          </DialogTitle>
                          <DialogDescription>
                            Identificação e avaliação de risco conforme matriz 5x5
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="risk-title">Descrição do Risco *</Label>
                            <Input
                              id="risk-title"
                              placeholder="Ex: Falha no sistema de combate a incêndio"
                              value={riskForm.title}
                              onChange={handleChange}))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select value={riskForm.category} onValueChange={(v) => setRiskForm(prev => ({ ...prev, category: v }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="operational">Operacional</SelectItem>
                                <SelectItem value="health_safety">Saúde e Segurança</SelectItem>
                                <SelectItem value="environmental">Ambiental</SelectItem>
                                <SelectItem value="equipment">Equipamento</SelectItem>
                                <SelectItem value="process">Processo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Probabilidade (1-5) *</Label>
                              <Select value={riskForm.probability} onValueChange={(v) => setRiskForm(prev => ({ ...prev, probability: v }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 - Muito Baixa</SelectItem>
                                  <SelectItem value="2">2 - Baixa</SelectItem>
                                  <SelectItem value="3">3 - Média</SelectItem>
                                  <SelectItem value="4">4 - Alta</SelectItem>
                                  <SelectItem value="5">5 - Muito Alta</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Impacto (1-5) *</Label>
                              <Select value={riskForm.impact} onValueChange={(v) => setRiskForm(prev => ({ ...prev, impact: v }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 - Insignificante</SelectItem>
                                  <SelectItem value="2">2 - Menor</SelectItem>
                                  <SelectItem value="3">3 - Moderado</SelectItem>
                                  <SelectItem value="4">4 - Maior</SelectItem>
                                  <SelectItem value="5">5 - Catastrófico</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="risk-mitigation">Medidas de Mitigação</Label>
                            <Textarea
                              id="risk-mitigation"
                              placeholder="Descreva as medidas de controle e mitigação..."
                              rows={3}
                              value={riskForm.mitigation}
                              onChange={handleChange}))}
                            />
                          </div>
                          <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={handleSubmitRisk}>
                            <Save className="h-4 w-4 mr-2" />
                            Registrar Risco
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Audit Dialog */}
                    <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white h-auto py-6 flex-col gap-2">
                          <FileText className="h-6 w-6" />
                          <span className="font-semibold">Nova Auditoria</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Agendar Nova Auditoria
                          </DialogTitle>
                          <DialogDescription>
                            Planejamento de auditoria interna ou externa SGSO
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="audit-title">Título da Auditoria *</Label>
                            <Input
                              id="audit-title"
                              placeholder="Ex: Auditoria Prática 13 - MOC"
                              value={auditForm.title}
                              onChange={handleChange}))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Tipo *</Label>
                              <Select value={auditForm.type} onValueChange={(v) => setAuditForm(prev => ({ ...prev, type: v }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="internal">Interna</SelectItem>
                                  <SelectItem value="external">Externa</SelectItem>
                                  <SelectItem value="regulatory">Regulatória (ANP)</SelectItem>
                                  <SelectItem value="certification">Certificação</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="audit-date">Data Agendada *</Label>
                              <Input
                                id="audit-date"
                                type="date"
                                value={auditForm.scheduledDate}
                                onChange={handleChange}))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="audit-auditor">Auditor Responsável</Label>
                            <Input
                              id="audit-auditor"
                              placeholder="Nome do auditor"
                              value={auditForm.auditor}
                              onChange={handleChange}))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="audit-scope">Escopo da Auditoria</Label>
                            <Textarea
                              id="audit-scope"
                              placeholder="Descreva o escopo e as práticas a serem auditadas..."
                              rows={3}
                              value={auditForm.scope}
                              onChange={handleChange}))}
                            />
                          </div>
                          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSubmitAudit}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Agendar Auditoria
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Report Button */}
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white h-auto py-6 flex-col gap-2"
                      onClick={handleGenerateANPReport}
                    >
                      <TrendingUp className="h-6 w-6" />
                      <span className="font-semibold">Relatório ANP</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practices">
              <AnpPracticesManager />
            </TabsContent>

            <TabsContent value="risks">
              <RiskAssessmentMatrix />
            </TabsContent>

            <TabsContent value="incidents">
              <IncidentReporting />
            </TabsContent>

            <TabsContent value="emergency">
              <EmergencyResponse />
            </TabsContent>

            <TabsContent value="audits">
              <AuditPlanner />
            </TabsContent>

            <TabsContent value="training">
              <TrainingCompliance />
            </TabsContent>

            <TabsContent value="nc">
              <NonConformityManager />
            </TabsContent>

            <TabsContent value="plano-ia">
              <SGSOActionPlanGenerator />
            </TabsContent>

            <TabsContent value="capa">
              <CAPAManager />
            </TabsContent>

            <TabsContent value="assistente">
              <SGSOEnhancedAssistant />
            </TabsContent>

            <TabsContent value="dossie">
              <ANPDossierExport />
            </TabsContent>

            <TabsContent value="metrics">
              <div className="space-y-6">
                <ComplianceMetrics />
                <PainelMetricasRisco />
              </div>
            </TabsContent>

            <TabsContent value="painel">
              <PainelSGSO />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SgsoDashboard;
