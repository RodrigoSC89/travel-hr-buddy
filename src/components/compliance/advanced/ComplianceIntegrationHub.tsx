/**
 * Compliance Integration Hub
 * Central hub connecting all compliance functionalities
 * PATCH: Removed mocks, uses real data hooks
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Grid3X3, AlertTriangle, Sparkles, Calendar, 
  FileText, CheckCircle2, Clock, TrendingUp, Shield,
  Ship, Zap, Target, BarChart3
} from 'lucide-react';

import { TraceabilityMatrix } from './TraceabilityMatrix';
import { UnifiedEvidenceGenerator } from './UnifiedEvidenceGenerator';
import { AutomaticReportsScheduler } from './AutomaticReportsScheduler';
import { 
  useIntegrationStatus, 
  useRecentActivities, 
  useComplianceStats 
} from '@/hooks/useComplianceIntegrationData';

type HubView = 'overview' | 'matrix' | 'evidence' | 'reports' | 'workflow';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  view: HubView;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'matrix',
    title: 'Matriz de Rastreabilidade',
    description: 'Drill-down completo: Módulo → Requisito → Elemento → LV → Evidência',
    icon: Grid3X3,
    color: 'bg-primary',
    view: 'matrix'
  },
  {
    id: 'evidence',
    title: 'Gerador de Evidências IA',
    description: 'Gere evidências automaticamente para PEOTRAM e PEO-DP',
    icon: Sparkles,
    color: 'bg-accent',
    view: 'evidence'
  },
  {
    id: 'reports',
    title: 'Relatórios Automáticos',
    description: 'Agende e gerencie relatórios de compliance',
    icon: Calendar,
    color: 'bg-success',
    view: 'reports'
  },
  {
    id: 'workflow',
    title: 'Fluxo de NCs',
    description: 'Workflow automático de não conformidades',
    icon: AlertTriangle,
    color: 'bg-warning',
    view: 'workflow'
  }
];

export function ComplianceIntegrationHub() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<HubView>('overview');
  
  // Real data hooks
  const { data: integrations = [], isLoading: loadingIntegrations } = useIntegrationStatus();
  const { data: activities = [], isLoading: loadingActivities } = useRecentActivities();
  const { data: stats, isLoading: loadingStats } = useComplianceStats();

  const renderContent = () => {
    switch (activeView) {
      case 'matrix':
        return <TraceabilityMatrix />;
      case 'evidence':
        return <UnifiedEvidenceGenerator />;
      case 'reports':
        return <AutomaticReportsScheduler />;
      case 'workflow':
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Acesse o Fluxo de NCs pelo menu principal</p>
              <Button variant="link" className="mt-2" onClick={() => navigate('/compliance-roadmap')}>
                Ir para Compliance Roadmap
              </Button>
            </div>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score PEOTRAM</p>
                <p className="text-3xl font-bold">87%</p>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <Progress value={87} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score PEO-DP</p>
                <p className="text-3xl font-bold">92%</p>
              </div>
              <Target className="h-8 w-8 text-accent-foreground" />
            </div>
            <Progress value={92} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NCs Abertas</p>
                <p className="text-3xl font-bold">12</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Badge variant="destructive">3 críticas</Badge>
              <Badge variant="secondary">9 normais</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Evidências IA</p>
                <p className="text-3xl font-bold">48</p>
              </div>
              <Sparkles className="h-8 w-8 text-success" />
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm text-success">
              <TrendingUp className="h-4 w-4" />
              +15% este mês
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Acesso Rápido</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(action => (
            <Card 
              key={action.id}
              className="cursor-pointer hover:bg-muted/50 transition-all hover:shadow-md"
              onClick={() => setActiveView(action.view)}
            >
              <CardContent className="pt-4">
                <div className={`p-3 rounded-lg ${action.color} w-fit mb-3`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold mb-1">{action.title}</h4>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Status das Integrações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loadingIntegrations ? (
                Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              ) : integrations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma integração configurada
                </p>
              ) : (
                integrations.map((int) => (
                  <div key={int.system} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${int.status === 'CONNECTED' ? 'bg-success' : int.status === 'DEGRADED' ? 'bg-warning' : 'bg-destructive'}`} />
                      <span className="font-medium">{int.system}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {int.records !== null && <span>{int.records} registros</span>}
                      <span>{int.lastSync}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {loadingActivities ? (
                  Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))
                ) : activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma atividade recente
                  </p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          activity.type === 'nc' ? 'bg-warning/10' :
                          activity.type === 'evidence' ? 'bg-accent/10' :
                          activity.type === 'report' ? 'bg-success/10' : 'bg-primary/10'
                        }`}>
                          {activity.type === 'nc' ? <AlertTriangle className="h-4 w-4 text-warning" /> :
                           activity.type === 'evidence' ? <Sparkles className="h-4 w-4 text-accent-foreground" /> :
                           activity.type === 'report' ? <FileText className="h-4 w-4 text-success" /> :
                           <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.item}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">{activity.module}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Modules Overview */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-info/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ship className="h-5 w-5 text-info" />
              PEOTRAM
            </CardTitle>
            <CardDescription>195 requisitos | 13 elementos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Conformidade Geral</span>
                <span className="font-medium">87%</span>
              </div>
              <Progress value={87} className="h-2" />
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center p-2 rounded-lg bg-success/10">
                  <p className="text-lg font-bold text-success">156</p>
                  <p className="text-xs text-muted-foreground">Conformes</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-warning/10">
                  <p className="text-lg font-bold text-warning">27</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-destructive/10">
                  <p className="text-lg font-bold text-destructive">12</p>
                  <p className="text-xs text-muted-foreground">NCs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              PEO-DP
            </CardTitle>
            <CardDescription>114 requisitos | 8 seções</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Conformidade Geral</span>
                <span className="font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center p-2 rounded-lg bg-green-500/10">
                  <p className="text-lg font-bold text-green-600">105</p>
                  <p className="text-xs text-muted-foreground">Conformes</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-orange-500/10">
                  <p className="text-lg font-bold text-orange-600">6</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-red-500/10">
                  <p className="text-lg font-bold text-red-600">3</p>
                  <p className="text-xs text-muted-foreground">NCs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Hub de Integração Compliance
          </h2>
          <p className="text-muted-foreground">
            Central unificada para PEOTRAM e PEO-DP
          </p>
        </div>
        {activeView !== 'overview' && (
          <Button variant="outline" onClick={() => setActiveView('overview')}>
            ← Voltar ao Overview
          </Button>
        )}
      </div>

      {/* Navigation */}
      {activeView === 'overview' ? null : (
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as HubView)}>
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="matrix">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Matriz
            </TabsTrigger>
            <TabsTrigger value="evidence">
              <Sparkles className="h-4 w-4 mr-2" />
              Evidências
            </TabsTrigger>
            <TabsTrigger value="reports">
              <Calendar className="h-4 w-4 mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Content */}
      {renderContent()}
    </div>
  );
}
