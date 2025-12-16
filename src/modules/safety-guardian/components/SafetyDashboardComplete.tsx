/**
 * Safety Guardian Dashboard - Complete Version
 * Dashboard principal com todas as abas funcionais
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, RefreshCw, Shield, FileText, GraduationCap, Brain, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { LTICounterBanner } from './LTICounterBanner';
import { SafetyKPICards } from './SafetyKPICards';
import { AIAlertsPanel } from './AIAlertsPanel';
import { IncidentsList } from './IncidentsList';
import { IncidentReportDialog } from './IncidentReportDialog';
import { IncidentDetailsDialog } from './IncidentDetailsDialog';
import { DDSPanel } from './DDSPanel';
import { TrainingPanel } from './TrainingPanel';
import { AIPredictivePanel } from './AIPredictivePanel';
import { SettingsPanel } from './SettingsPanel';
import { useSafetyData } from '../hooks/useSafetyData';
import { useSafetyAI } from '../hooks/useSafetyAI';
import type { SafetyIncident, SafetySettings, DDSRecord, SafetyTraining, CrewTrainingDashboard } from '../types';

export const SafetyDashboardComplete: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('ytd');
  const [selectedTab, setSelectedTab] = useState('incidents');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<SafetyIncident | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const {
    loading,
    metrics,
    incidents,
    alerts,
    filters,
    setFilters,
    createIncident,
    markAlertAsRead,
    markAllAlertsAsRead,
    getFilteredIncidents,
    unreadAlertsCount,
    refresh,
  } = useSafetyData();

  const { 
    analyzeIncident, 
    analysisState, 
    generatePredictiveInsights,
    insights: predictiveInsights 
  } = useSafetyAI();

  // Mock data for DDS
  const [ddsRecords, setDdsRecords] = useState<DDSRecord[]>([
    {
      id: '1',
      date: new Date().toISOString(),
      topic: 'Uso correto de EPIs em operações de convés',
      vessel_id: 'v1',
      vessel_name: 'OSV Atlantic I',
      conductor: 'João Silva',
      participants_count: 12,
      participants: [],
      duration_minutes: 15,
      notes: 'Enfatizado uso de capacete e luvas',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000).toISOString(),
      topic: 'Procedimentos de emergência em caso de incêndio',
      vessel_id: 'v2',
      vessel_name: 'PSV Oceanic',
      conductor: 'Maria Santos',
      participants_count: 8,
      participants: [],
      duration_minutes: 20,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  // Mock data for trainings
  const [trainings] = useState<SafetyTraining[]>([
    {
      id: '1',
      crew_member_id: 'c1',
      crew_member_name: 'Carlos Oliveira',
      training_type: 'Segurança',
      course_name: 'HUET - Helicopter Underwater Escape Training',
      status: 'expired',
      expiry_date: new Date(Date.now() - 30 * 86400000).toISOString(),
      ai_recommended: true,
      priority: 'critical'
    },
    {
      id: '2',
      crew_member_id: 'c2',
      crew_member_name: 'Ana Rodrigues',
      training_type: 'Segurança',
      course_name: 'BOSIET - Basic Offshore Safety Induction',
      status: 'pending',
      expiry_date: new Date(Date.now() + 15 * 86400000).toISOString(),
      ai_recommended: false,
      priority: 'high'
    },
    {
      id: '3',
      crew_member_id: 'c3',
      crew_member_name: 'Pedro Costa',
      training_type: 'Operacional',
      course_name: 'Operação de Guindastes',
      status: 'completed',
      completion_date: new Date(Date.now() - 60 * 86400000).toISOString(),
      expiry_date: new Date(Date.now() + 305 * 86400000).toISOString(),
      score: 92,
      ai_recommended: false,
      priority: 'low'
    },
    {
      id: '4',
      crew_member_id: 'c1',
      crew_member_name: 'Carlos Oliveira',
      training_type: 'Segurança',
      course_name: 'Combate a Incêndio Avançado',
      status: 'in_progress',
      ai_recommended: true,
      priority: 'medium'
    }
  ]);

  // Mock crew dashboards
  const [crewDashboards] = useState<CrewTrainingDashboard[]>([
    {
      crewMemberId: 'c1',
      crewMemberName: 'Carlos Oliveira',
      role: 'Marinheiro de Convés',
      vessel: 'OSV Atlantic I',
      totalTrainings: 8,
      completedTrainings: 5,
      pendingTrainings: 2,
      expiredCertifications: 1,
      upcomingExpirations: 2,
      overallCompliance: 75,
      aiRecommendations: []
    },
    {
      crewMemberId: 'c2',
      crewMemberName: 'Ana Rodrigues',
      role: 'Oficial de Náutica',
      vessel: 'PSV Oceanic',
      totalTrainings: 10,
      completedTrainings: 9,
      pendingTrainings: 1,
      expiredCertifications: 0,
      upcomingExpirations: 1,
      overallCompliance: 95,
      aiRecommendations: []
    },
    {
      crewMemberId: 'c3',
      crewMemberName: 'Pedro Costa',
      role: 'Chefe de Máquinas',
      vessel: 'AHTS Navigator',
      totalTrainings: 12,
      completedTrainings: 12,
      pendingTrainings: 0,
      expiredCertifications: 0,
      upcomingExpirations: 0,
      overallCompliance: 100,
      aiRecommendations: []
    }
  ]);

  // Settings state
  const [settings, setSettings] = useState<SafetySettings>({
    ltiGoal: 365,
    trirTarget: 0.5,
    ddsRequiredDaily: true,
    autoAlertThresholds: {
      certification_expiry_days: 30,
      training_overdue_days: 7,
      incident_escalation_hours: 24
    },
    notificationPreferences: {
      email: true,
      push: true,
      sms: false
    },
    aiSettings: {
      predictiveAnalysisEnabled: true,
      autoRecommendationsEnabled: true,
      riskAssessmentEnabled: true
    }
  });

  useEffect(() => {
    generatePredictiveInsights();
  }, []);

  const handleSubmitReport = async (incident: Partial<SafetyIncident>) => {
    await createIncident(incident);
  };

  const handleViewDetails = (incident: SafetyIncident) => {
    setSelectedIncident(incident);
    setDetailsDialogOpen(true);
  };

  const handleAnalyzeIncident = async (incident: SafetyIncident) => {
    setSelectedIncident(incident);
    setDetailsDialogOpen(true);
    return analyzeIncident(incident);
  };

  const handleCreateDDS = async (record: Partial<DDSRecord>) => {
    const newRecord: DDSRecord = {
      id: `dds-${Date.now()}`,
      date: record.date || new Date().toISOString(),
      topic: record.topic || '',
      vessel_id: '',
      vessel_name: record.vessel_name || '',
      conductor: record.conductor || '',
      participants_count: record.participants_count || 0,
      participants: record.participants || [],
      duration_minutes: record.duration_minutes || 15,
      notes: record.notes,
      created_at: new Date().toISOString()
    };
    setDdsRecords(prev => [newRecord, ...prev]);
  };

  const handleSaveSettings = async (newSettings: SafetySettings) => {
    setSettings(newSettings);
    // Here you would save to backend
  };

  const filteredIncidents = getFilteredIncidents();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Safety Guardian</h1>
            <p className="text-sm text-muted-foreground">
              Sistema de Gestão de Segurança com IA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">Este Mês</SelectItem>
              <SelectItem value="qtd">Este Trimestre</SelectItem>
              <SelectItem value="ytd">Este Ano</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button 
            className="bg-destructive hover:bg-destructive/90"
            onClick={() => setReportDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Reportar Ocorrência
          </Button>
        </div>
      </div>

      {/* LTI Banner */}
      <LTICounterBanner daysWithoutLTI={metrics.daysWithoutLTI} goal={settings.ltiGoal} />

      {/* KPI Cards */}
      <SafetyKPICards metrics={metrics} loading={loading} />

      {/* AI Alerts */}
      <AIAlertsPanel
        alerts={alerts}
        onMarkAsRead={markAlertAsRead}
        onMarkAllAsRead={markAllAlertsAsRead}
        unreadCount={unreadAlertsCount}
      />

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="incidents" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Ocorrências</span>
          </TabsTrigger>
          <TabsTrigger value="dds" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">DDS</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Treinamentos</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">IA Preditiva</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incidents">
          <IncidentsList
            incidents={filteredIncidents}
            filters={filters}
            onFilterChange={setFilters}
            onViewDetails={handleViewDetails}
            onAnalyze={handleAnalyzeIncident}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="dds">
          <DDSPanel
            records={ddsRecords}
            onCreateDDS={handleCreateDDS}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="training">
          <TrainingPanel
            trainings={trainings}
            crewDashboards={crewDashboards}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="ai">
          <AIPredictivePanel
            insights={predictiveInsights.map(i => ({
              id: i.id,
              type: i.type as 'risk' | 'pattern' | 'recommendation' | 'prediction',
              title: i.title,
              description: i.description,
              confidence: 85,
              impact: i.impact as 'low' | 'medium' | 'high' | 'critical',
              action: i.suggestedAction
            }))}
            onGenerateInsights={async () => { await generatePredictiveInsights(); }}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsPanel
            settings={settings}
            onSave={handleSaveSettings}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <IncidentReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        onSubmit={handleSubmitReport}
      />

      <IncidentDetailsDialog
        incident={selectedIncident}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onAnalyze={handleAnalyzeIncident}
        analysisLoading={analysisState.loading}
      />
    </div>
  );
};
