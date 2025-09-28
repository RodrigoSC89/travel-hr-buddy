import React, { useState, useEffect } from 'react';
import { EnhancedPeotramDashboard } from './enhanced-peotram-dashboard';
import { PeotramAuditWizard } from './peotram-audit-wizard';
import { PeotramReportsGenerator } from './peotram-reports-generator';
import { PeotramNonConformities } from './peotram-non-conformities';
import { PeotramTemplateManager } from './peotram-template-manager';
import { PeotramAnalyticsPanel } from './peotram-analytics-panel';
import { PeotramComplianceChecker } from './peotram-compliance-checker';
import { PeotramPerformanceIndicators } from './peotram-performance-indicators';
import { PeotramDocumentManager } from './peotram-document-manager';
import { PeotramRiskAssessment } from './peotram-risk-assessment';
import { PeotramTrainingManagement } from './peotram-training-management';
import { PeotramRealtimeMonitoring } from './peotram-realtime-monitoring';
import { PeotramWorkflowManager } from './peotram-workflow-manager';
import { PeotramIntegrationHub } from './peotram-integration-hub';
import { PeotramAdvancedReporting } from './peotram-advanced-reporting';
import { PeotramEmergencyResponse } from './peotram-emergency-response';
import { PeotramEquipmentManager } from './peotram-equipment-manager';
import { PeotramIncidentManager } from './peotram-incident-manager';
import { PeotramCommunicationCenter } from './peotram-communication-center';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrganizationPermissions } from '@/hooks/use-organization-permissions';
import { 
  BarChart3, 
  FileCheck, 
  AlertTriangle, 
  Settings, 
  Plus,
  Download,
  Upload,
  Users,
  Award,
  TrendingUp,
  Clock,
  Target,
  Eye,
  Edit,
  Calendar,
  MapPin,
  Ship,
  Building,
  Star,
  Shield,
  Zap,
  Activity,
  Leaf
} from 'lucide-react';

interface PeotramAudit {
  id: string;
  auditPeriod: string;
  auditType: 'vessel' | 'shore';
  vesselName?: string;
  location?: string;
  status: 'draft' | 'in-progress' | 'completed' | 'approved';
  complianceScore: number;
  auditorName: string;
  completedAt?: string;
  nonConformitiesCount: number;
  createdAt: string;
}

interface NonConformity {
  id: string;
  audit_id: string;
  element_number: string;
  element_name: string;
  non_conformity_type: 'critical' | 'grave' | 'moderate' | 'light';
  description: string;
  corrective_action: string;
  responsible_person: string;
  target_date: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  severity_score: number;
  audit_date: string;
  vessel_name?: string;
  shore_location?: string;
}

interface PeotramTemplate {
  id: string;
  year: number;
  version: string;
  template_data: any;
  is_active: boolean;
  checklist_type: 'vessel' | 'shore';
  created_at: string;
}

export const EnhancedPeotramManager: React.FC = () => {
  const { hasFeature } = useOrganizationPermissions();
  const [activeView, setActiveView] = useState('dashboard');
  const [managementSubView, setManagementSubView] = useState('non-conformities');

  const renderManagementContent = () => {
    switch (managementSubView) {
      case 'non-conformities':
        return <PeotramNonConformities nonConformities={nonConformities} onUpdate={handleUpdateNonConformity} />;
      case 'reports':
        return <PeotramAdvancedReporting />;
      case 'templates':
        return <PeotramTemplateManager templates={templates} onTemplateUpdate={handleUpdateTemplate} />;
      case 'analytics':
        return <PeotramAnalyticsPanel />;
      case 'compliance':
        return <PeotramComplianceChecker />;
      case 'risk-assessment':
        return <PeotramRiskAssessment />;
      case 'training':
        return <PeotramTrainingManagement />;
      case 'workflows':
        return <PeotramWorkflowManager />;
      case 'integrations':
        return <PeotramIntegrationHub />;
      case 'emergency':
        return <PeotramEmergencyResponse />;
      case 'equipment':
        return <PeotramEquipmentManager />;
      case 'incidents':
        return <PeotramIncidentManager />;
      case 'communication':
        return <PeotramCommunicationCenter />;
      default:
        return <PeotramNonConformities nonConformities={nonConformities} onUpdate={handleUpdateNonConformity} />;
    }
  };
  const [isNewAuditOpen, setIsNewAuditOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<PeotramAudit | null>(null);
  const [audits, setAudits] = useState<PeotramAudit[]>([]);
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [templates, setTemplates] = useState<PeotramTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar permissões
  if (!hasFeature('peotram')) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
          <p className="text-muted-foreground mb-4">
            O módulo PEOTRAM não está disponível no seu plano atual.
          </p>
          <Button variant="outline">
            Solicitar Acesso
          </Button>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carregar dados de demonstração
      setAudits(getDemoAudits());
      setNonConformities(getDemoNonConformities());
      setTemplates(getDemoTemplates());
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoAudits = (): PeotramAudit[] => [
    {
      id: 'AUDIT_001',
      auditPeriod: '2024-Q4',
      auditType: 'vessel',
      vesselName: 'MV Atlantic Explorer',
      status: 'completed',
      complianceScore: 87.5,
      auditorName: 'João Silva',
      completedAt: '2024-12-15',
      nonConformitiesCount: 3,
      createdAt: '2024-12-01'
    },
    {
      id: 'AUDIT_002',
      auditPeriod: '2024-Q4',
      auditType: 'shore',
      location: 'Terminal Santos - SP',
      status: 'in-progress',
      complianceScore: 0,
      auditorName: 'Maria Santos',
      nonConformitiesCount: 0,
      createdAt: '2024-12-10'
    },
    {
      id: 'AUDIT_003',
      auditPeriod: '2024-Q3',
      auditType: 'vessel',
      vesselName: 'OSV Petrobras XXI',
      status: 'completed',
      complianceScore: 92.3,
      auditorName: 'Carlos Eduardo',
      completedAt: '2024-09-28',
      nonConformitiesCount: 1,
      createdAt: '2024-09-15'
    }
  ];

  const getDemoNonConformities = (): NonConformity[] => [
    {
      id: 'NC_001',
      audit_id: 'AUDIT_001',
      element_number: 'ELEMENTO_01',
      element_name: 'Liderança, Gerenciamento e Responsabilidade',
      non_conformity_type: 'moderate',
      description: 'Política de segurança necessita atualização conforme normas vigentes',
      corrective_action: 'Atualizar política conforme normas vigentes e treinar equipe',
      responsible_person: 'Gestor de Segurança',
      target_date: '2024-12-30',
      status: 'in_progress',
      severity_score: 2,
      audit_date: '2024-12-15',
      vessel_name: 'MV Atlantic Explorer'
    },
    {
      id: 'NC_002',
      audit_id: 'AUDIT_001',
      element_number: 'ELEMENTO_02',
      element_name: 'Conformidade Legal',
      non_conformity_type: 'light',
      description: 'Documentação de NR-34 incompleta para alguns tripulantes',
      corrective_action: 'Completar documentação faltante e implementar checklist de verificação',
      responsible_person: 'Departamento de RH',
      target_date: '2025-01-15',
      status: 'open',
      severity_score: 1,
      audit_date: '2024-12-15',
      vessel_name: 'MV Atlantic Explorer'
    }
  ];

  const getDemoTemplates = (): PeotramTemplate[] => [
    {
      id: 'TPL_001',
      year: 2024,
      version: '2.1',
      template_data: { elements: [] },
      is_active: true,
      checklist_type: 'vessel',
      created_at: '2024-01-01'
    },
    {
      id: 'TPL_002',
      year: 2024,
      version: '2.1',
      template_data: { elements: [] },
      is_active: true,
      checklist_type: 'shore',
      created_at: '2024-01-01'
    }
  ];

  const handleSaveAudit = async (auditData: any) => {
    console.log('Salvando auditoria:', auditData);
    // Implementar salvamento na API Supabase
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
    await loadData(); // Recarregar dados
  };

  const handleCompleteAudit = async (auditData: any) => {
    console.log('Finalizando auditoria:', auditData);
    setIsNewAuditOpen(false);
    setSelectedAudit(null);
    // Implementar finalização na API
    await loadData();
  };

  const handleUpdateNonConformity = async (id: string, updates: any) => {
    console.log('Atualizando não conformidade:', id, updates);
    // Implementar atualização na API
    await loadData();
  };

  const handleUpdateTemplate = async (template: any) => {
    console.log('Atualizando template:', template);
    // Implementar atualização na API
    await loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/20 text-success border-success/30';
      case 'in-progress': return 'bg-info/20 text-info border-info/30';
      case 'draft': return 'bg-warning/20 text-warning border-warning/30';
      case 'approved': return 'bg-primary/20 text-primary border-primary/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'in-progress': return 'Em Andamento';
      case 'draft': return 'Rascunho';
      case 'approved': return 'Aprovada';
      default: return status;
    }
  };

  // Se há uma auditoria selecionada, mostrar o wizard
  if (selectedAudit) {
    return (
      <PeotramAuditWizard
        auditId={selectedAudit.id}
        onSave={handleSaveAudit}
        onComplete={handleCompleteAudit}
        onCancel={() => setSelectedAudit(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sistema PEOTRAM</h1>
          <p className="text-muted-foreground">
            Programa de Excelência Operacional no Transporte Aéreo e Marítimo
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isNewAuditOpen} onOpenChange={setIsNewAuditOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Nova Auditoria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Auditoria PEOTRAM</DialogTitle>
              </DialogHeader>
              <PeotramAuditWizard
                onSave={handleSaveAudit}
                onComplete={handleCompleteAudit}
                onCancel={() => setIsNewAuditOpen(false)}
              />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </Button>
          
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="audits" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Auditorias
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Gestão
          </TabsTrigger>
        </TabsList>

        {/* Tabs secundárias para Gestão */}
        {activeView === 'management' && (
          <div className="bg-muted/30 rounded-lg p-1">
            <div className="grid w-full grid-cols-6 gap-1 mb-4">
              <Button
                variant={managementSubView === 'emergency' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManagementSubView('emergency')}
                className="flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Emergências
              </Button>
              <Button
                variant={managementSubView === 'equipment' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManagementSubView('equipment')}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Equipamentos
              </Button>
              <Button
                variant={managementSubView === 'incidents' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManagementSubView('incidents')}
                className="flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Incidentes
              </Button>
              <Button
                variant={managementSubView === 'communication' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManagementSubView('communication')}
                className="flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Comunicação
              </Button>
              <Button
                variant={managementSubView === 'workflows' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManagementSubView('workflows')}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Workflows
              </Button>
              <Button
                variant={managementSubView === 'integrations' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManagementSubView('integrations')}
                className="flex items-center gap-2"
              >
                <Leaf className="w-4 h-4" />
                Integrações
              </Button>
            </div>
            <div className="grid w-full grid-cols-7 gap-1">
              <Button
                variant={managementSubView === 'non-conformities' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManagementSubView('non-conformities')}
                className="flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Não Conformidades
              </Button>
              <Button
                variant={managementSubView === 'reports' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManagementSubView('reports')}
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Relatórios
              </Button>
              <Button
                variant={managementSubView === 'templates' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManagementSubView('templates')}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Templates
              </Button>
              <Button
                variant={managementSubView === 'analytics' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManagementSubView('analytics')}
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
              <Button
                variant={managementSubView === 'compliance' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManagementSubView('compliance')}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Conformidade
              </Button>
              <Button
                variant={managementSubView === 'risk-assessment' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManagementSubView('risk-assessment')}
                className="flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Riscos
              </Button>
              <Button
                variant={managementSubView === 'training' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManagementSubView('training')}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Treinamentos
              </Button>
              <Button
                variant={managementSubView === 'workflows' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManagementSubView('workflows')}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Workflows
              </Button>
              <Button
                variant={managementSubView === 'integrations' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setManagementSubView('integrations')}
                className="flex items-center gap-2"
              >
                <Leaf className="w-4 h-4" />
                Integrações
              </Button>
            </div>
          </div>
        )}

        <TabsContent value="dashboard" className="space-y-0">
          <EnhancedPeotramDashboard />
        </TabsContent>

        <TabsContent value="audits" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Auditorias PEOTRAM</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Filtrar Período
              </Button>
              <Button variant="outline" size="sm">
                <Ship className="w-4 h-4 mr-2" />
                Tipo de Auditoria
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audits.map((audit) => (
              <Card
                key={audit.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-card to-accent/5"
                onClick={() => setSelectedAudit(audit)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{audit.id}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(audit.status)}>
                      {getStatusLabel(audit.status)}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    {audit.auditType === 'vessel' ? (
                      <>
                        <Ship className="w-4 h-4" />
                        {audit.vesselName}
                      </>
                    ) : (
                      <>
                        <Building className="w-4 h-4" />
                        {audit.location}
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Score de Conformidade</span>
                    <span className="text-lg font-bold text-foreground">
                      {audit.status === 'completed' ? `${audit.complianceScore}%` : '-'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {audit.auditorName}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {audit.auditPeriod}
                    </span>
                  </div>

                  {audit.nonConformitiesCount > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-warning/10 rounded-lg border border-warning/20">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <span className="text-sm text-warning font-medium">
                        {audit.nonConformitiesCount} Não Conformidades
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Visualizar relatório
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAudit(audit);
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Card para nova auditoria */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10"
              onClick={() => setIsNewAuditOpen(true)}
            >
              <CardContent className="flex flex-col items-center justify-center h-48 text-primary">
                <Plus className="w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nova Auditoria</h3>
                <p className="text-sm text-center text-primary/80">
                  Iniciar uma nova auditoria PEOTRAM
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="non-conformities">
          <PeotramNonConformities 
            nonConformities={nonConformities}
            onUpdate={(id: string, updates: any) => handleUpdateNonConformity(id, updates)}
          />
        </TabsContent>

        <TabsContent value="reports">
          <PeotramReportsGenerator />
        </TabsContent>

        <TabsContent value="templates">
          <PeotramTemplateManager 
            templates={templates}
            onTemplateUpdate={(template: any) => handleUpdateTemplate(template)}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <PeotramAnalyticsPanel />
        </TabsContent>

        <TabsContent value="compliance">
          <PeotramComplianceChecker />
        </TabsContent>

        <TabsContent value="monitoring">
          <PeotramRealtimeMonitoring />
        </TabsContent>

        <TabsContent value="management">
          {managementSubView === 'non-conformities' && (
            <PeotramNonConformities 
              nonConformities={nonConformities}
              onUpdate={(id: string, updates: any) => handleUpdateNonConformity(id, updates)}
            />
          )}
          {managementSubView === 'reports' && <PeotramReportsGenerator />}
          {managementSubView === 'templates' && (
            <PeotramTemplateManager 
              templates={templates}
              onTemplateUpdate={(template: any) => handleUpdateTemplate(template)}
            />
          )}
          {managementSubView === 'analytics' && <PeotramAnalyticsPanel />}
          {managementSubView === 'compliance' && <PeotramComplianceChecker />}
          {managementSubView === 'risk-assessment' && <PeotramRiskAssessment />}
          {managementSubView === 'training' && <PeotramTrainingManagement />}
          {managementSubView === 'workflows' && <PeotramWorkflowManager />}
          {managementSubView === 'integrations' && <PeotramIntegrationHub />}
        </TabsContent>

        {/* Manter as antigas abas para compatibilidade */}
        <TabsContent value="non-conformities">
          <PeotramNonConformities 
            nonConformities={nonConformities}
            onUpdate={(id: string, updates: any) => handleUpdateNonConformity(id, updates)}
          />
        </TabsContent>

        <TabsContent value="reports">
          <PeotramAdvancedReporting />
        </TabsContent>

        <TabsContent value="templates">
          <PeotramTemplateManager 
            templates={templates}
            onTemplateUpdate={(template: any) => handleUpdateTemplate(template)}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <PeotramAnalyticsPanel />
        </TabsContent>

        <TabsContent value="compliance">
          <PeotramComplianceChecker />
        </TabsContent>

        <TabsContent value="performance">
          <PeotramPerformanceIndicators />
        </TabsContent>

        <TabsContent value="risk-assessment">
          <PeotramRiskAssessment />
        </TabsContent>

        <TabsContent value="training">
          <PeotramTrainingManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};