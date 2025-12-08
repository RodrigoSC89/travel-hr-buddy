/**
 * Compliance Hub Dashboard Complete
 * Dashboard principal do módulo de conformidade com IA integrada
 */

import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileCheck, Award, Brain, Settings, Bell } from 'lucide-react';
import { ComplianceKPICards } from './ComplianceKPICards';
import { ComplianceAlertsPanel } from './ComplianceAlertsPanel';
import { ComplianceAIAnalysisPanel } from './ComplianceAIAnalysisPanel';
import { useComplianceData } from '../hooks/useComplianceData';
import { useComplianceAI } from '../hooks/useComplianceAI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ComplianceHubDashboard() {
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
  } = useComplianceAI();

  useEffect(() => {
    if (complianceItems.length > 0 && !analysisState.analysis) {
      runComplianceAnalysis(complianceItems, audits, certificates);
    }
  }, [complianceItems, audits, certificates]);

  const trainingMatrix = getTrainingMatrix();

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
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button size="sm">
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
          <TabsTrigger value="training"><Brain className="h-4 w-4 mr-2" />Treinamentos</TabsTrigger>
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

          {/* Compliance Items Overview */}
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
                      <Badge variant={item.status === 'compliant' ? 'default' : 'destructive'}>
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
          <Card>
            <CardHeader>
              <CardTitle>Auditorias</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {audits.map((audit) => (
                    <div key={audit.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{audit.vesselName} - {audit.auditType.toUpperCase()}</span>
                        <Badge variant={audit.status === 'completed' ? 'default' : 'secondary'}>
                          {audit.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Auditor: {audit.auditorName}</p>
                      <p className="text-sm text-muted-foreground">Data: {audit.scheduledDate}</p>
                      {audit.findings.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <span className="text-xs text-muted-foreground">{audit.findings.length} finding(s)</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Certificados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{cert.name}</span>
                      <Badge variant={
                        cert.status === 'valid' ? 'default' :
                        cert.status === 'expiring-soon' ? 'secondary' : 'destructive'
                      }>
                        {cert.status === 'valid' ? 'Válido' :
                         cert.status === 'expiring-soon' ? 'Expirando' : 'Expirado'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{cert.vesselName}</p>
                    <p className="text-xs text-muted-foreground mt-1">Validade: {cert.expiryDate}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Matriz de Treinamentos</CardTitle>
                <Badge>Conformidade: {trainingMatrix.overallCompliance}%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainings.map((training) => (
                  <div key={training.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium">{training.crewMemberName}</span>
                        <span className="text-sm text-muted-foreground ml-2">({training.crewMemberRank})</span>
                      </div>
                      <Badge variant={
                        training.status === 'completed' ? 'default' :
                        training.status === 'in-progress' ? 'secondary' :
                        training.status === 'expired' ? 'destructive' : 'outline'
                      }>
                        {training.status === 'completed' ? 'Concluído' :
                         training.status === 'in-progress' ? 'Em Progresso' :
                         training.status === 'expired' ? 'Expirado' : 'Não Iniciado'}
                      </Badge>
                    </div>
                    <p className="text-sm">{training.courseName}</p>
                    <Progress value={training.progress} className="h-1.5 mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
}

export default ComplianceHubDashboard;
