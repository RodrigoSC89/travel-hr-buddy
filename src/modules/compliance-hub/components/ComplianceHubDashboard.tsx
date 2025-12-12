/**
import { useEffect, useState, useCallback } from "react";;
 * Compliance Hub Dashboard Complete
 * Dashboard principal do módulo de conformidade com IA integrada
 */

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileCheck, Award, Brain, Settings, GraduationCap } from "lucide-react";
import { ComplianceKPICards } from "./ComplianceKPICards";
import { ComplianceAlertsPanel } from "./ComplianceAlertsPanel";
import { ComplianceAIAnalysisPanel } from "./ComplianceAIAnalysisPanel";
import { AuditsPanel } from "./AuditsPanel";
import { CertificatesPanel } from "./CertificatesPanel";
import { TrainingMatrixPanel } from "./TrainingMatrixPanel";
import { CreateAuditDialog } from "./CreateAuditDialog";
import { SettingsDialog, type ComplianceSettings } from "./SettingsDialog";
import { FilterPanel, type ComplianceFilters } from "./FilterPanel";
import { useComplianceData } from "../hooks/useComplianceData";
import { useComplianceAI } from "../hooks/useComplianceAI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const defaultFilters: ComplianceFilters = {
  search: "",
  status: [],
  auditType: [],
  vessel: "",
  dateRange: { from: undefined, to: undefined },
  severity: [],
  regulation: "",
};

const defaultSettings: ComplianceSettings = {
  notifications: {
    emailAlerts: true,
    pushNotifications: true,
    certificateExpiryDays: 30,
    auditReminderDays: 14,
    findingOverdueDays: 7,
  },
  ai: {
    autoAnalysis: true,
    predictiveAlerts: true,
    aiSuggestions: true,
    analysisFrequency: "weekly",
  },
  audit: {
    autoGenerateChecklist: true,
    requireEvidence: true,
    autoCloseFindings: false,
    findingAutoEscalation: true,
  },
  reports: {
    autoGenerateReports: true,
    reportFrequency: "monthly",
    includeAIAnalysis: true,
    emailReports: true,
  },
};

export const ComplianceHubDashboard = memo(function() {
  const {
    complianceItems,
    audits,
    certificates,
    alerts,
    trainings,
    kpis,
    loading,
    markAlertAsRead,
    markAllAlertsAsRead,
    getTrainingMatrix,
  } = useComplianceData();

  const {
    analysisState,
    runComplianceAnalysis,
    askComplianceAI,
    chatLoading,
    generateAuditChecklist,
  } = useComplianceAI();

  const [filters, setFilters] = useState<ComplianceFilters>(defaultFilters);
  const [settings, setSettings] = useState<ComplianceSettings>(defaultSettings);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateAudit, setShowCreateAudit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (complianceItems.length > 0 && !analysisState.analysis) {
      runComplianceAnalysis(complianceItems, audits, certificates);
    }
  }, [complianceItems, audits, certificates]);

  const trainingMatrix = getTrainingMatrix();

  const vessels = [
    { id: "v1", name: "MV Atlantic Star" },
    { id: "v2", name: "MV Pacific Pioneer" },
    { id: "v3", name: "MV Nordeste Explorer" },
  ];

  const regulations = [
    { id: "ism", name: "ISM Code" },
    { id: "isps", name: "ISPS Code" },
    { id: "mlc", name: "MLC 2006" },
    { id: "solas", name: "SOLAS" },
    { id: "marpol", name: "MARPOL" },
  ];

  const handleCreateAudit = async (auditData: unknown: unknown: unknown) => {
    toast.success("Auditoria criada com sucesso");
    setShowCreateAudit(false);
  });

  const handleSaveSettings = async (newSettings: ComplianceSettings) => {
    setSettings(newSettings);
    toast.success("Configurações salvas");
  });

  const handleGenerateRecommendations = async (crewMemberId: string) => {
    return await askComplianceAI(`Gere recomendações de treinamento para o tripulante ${crewMemberId}`);
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Compliance Hub</h1>
            <p className="text-muted-foreground">Centro de Gestão de Conformidade com IA Integrada</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSetShowSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button size="sm" onClick={handleSetShowCreateAudit}>
            <FileCheck className="h-4 w-4 mr-2" />
            Nova Auditoria
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <ComplianceKPICards kpis={kpis} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview"><Shield className="h-4 w-4 mr-2" />Visão Geral</TabsTrigger>
          <TabsTrigger value="audits"><FileCheck className="h-4 w-4 mr-2" />Auditorias</TabsTrigger>
          <TabsTrigger value="certificates"><Award className="h-4 w-4 mr-2" />Certificados</TabsTrigger>
          <TabsTrigger value="training"><GraduationCap className="h-4 w-4 mr-2" />Treinamentos</TabsTrigger>
          <TabsTrigger value="ai"><Brain className="h-4 w-4 mr-2" />IA Preditiva</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComplianceAlertsPanel
              alerts={alerts}
              onMarkAsRead={markAlertAsRead}
              onMarkAllAsRead={markAllAlertsAsRead}
            />
            <ComplianceAIAnalysisPanel
              analysis={analysisState.analysis}
              loading={analysisState.loading}
              onRunAnalysis={runComplianceAnalysis}
              onAskAI={askComplianceAI}
              chatLoading={chatLoading}
              complianceItems={complianceItems}
              audits={audits}
              certificates={certificates}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Status de Conformidade por Regulamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {complianceItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{item.code}</span>
                      <Badge variant={item.status === "compliant" ? "default" : "destructive"}>
                        {item.score}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.title}</p>
                    <Progress value={item.score} className="h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits">
          <AuditsPanel
            audits={audits}
            onCreateAudit={() => setShowCreateAudit(true}
            onViewAudit={(id) => toast.info(`Visualizando auditoria ${id}`)}
            onEditAudit={(id) => toast.info(`Editando auditoria ${id}`)}
            onDeleteAudit={(id) => toast.success("Auditoria excluída"}
            onGenerateChecklist={async (id) => {
              await generateAuditChecklist("internal", "vessel");
              toast.success("Checklist gerado com IA");
            }}
            onExportAudit={(id) => toast.success("Auditoria exportada"}
          />
        </TabsContent>

        <TabsContent value="certificates">
          <CertificatesPanel
            certificates={certificates}
            onAddCertificate={() => toast.info("Adicionar certificado"}
            onViewCertificate={(id) => toast.info(`Visualizando certificado ${id}`)}
            onEditCertificate={(id) => toast.info(`Editando certificado ${id}`)}
            onDownloadCertificate={(id) => toast.success("Download iniciado"}
            onSetReminder={(id) => toast.success("Lembrete configurado"}
          />
        </TabsContent>

        <TabsContent value="training">
          <TrainingMatrixPanel
            trainings={trainings}
            matrix={trainingMatrix}
            onGenerateRecommendations={handleGenerateRecommendations}
            onExportMatrix={() => toast.success("Matriz exportada"}
          />
        </TabsContent>

        <TabsContent value="ai">
          <ComplianceAIAnalysisPanel
            analysis={analysisState.analysis}
            loading={analysisState.loading}
            onRunAnalysis={runComplianceAnalysis}
            onAskAI={askComplianceAI}
            chatLoading={chatLoading}
            complianceItems={complianceItems}
            audits={audits}
            certificates={certificates}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateAuditDialog
        open={showCreateAudit}
        onOpenChange={setShowCreateAudit}
        onCreateAudit={handleCreateAudit}
        vessels={vessels}
      />

      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}

export default ComplianceHubDashboard;
