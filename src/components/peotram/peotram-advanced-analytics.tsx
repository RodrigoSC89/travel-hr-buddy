import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Bell,
  Download,
  RefreshCw,
  Calendar,
  Users,
  Ship
} from 'lucide-react';
import { toast } from 'sonner';

interface AuditMetrics {
  totalAudits: number;
  completedAudits: number;
  inProgressAudits: number;
  averageComplianceScore: number;
  criticalNonConformities: number;
  pendingActions: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface ComplianceByElement {
  elementNumber: string;
  elementName: string;
  complianceScore: number;
  trend: 'up' | 'down' | 'stable';
  auditCount: number;
}

interface CompanyBenchmark {
  companyId: string;
  companyName: string;
  averageScore: number;
  auditCount: number;
  rank: number;
}

interface Alert {
  id: string;
  type: 'deadline' | 'non_conformity' | 'certification' | 'audit';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  dueDate?: Date;
  createdAt: Date;
  isRead: boolean;
}

export const PeotramAdvancedAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<AuditMetrics>({
    totalAudits: 45,
    completedAudits: 32,
    inProgressAudits: 13,
    averageComplianceScore: 87.5,
    criticalNonConformities: 8,
    pendingActions: 23,
    trend: 'up',
    trendPercentage: 5.2
  });

  const [complianceByElement, setComplianceByElement] = useState<ComplianceByElement[]>([
    { elementNumber: 'ELEM_01', elementName: 'Liderança e Gerenciamento', complianceScore: 92, trend: 'up', auditCount: 45 },
    { elementNumber: 'ELEM_02', elementName: 'Conformidade Legal', complianceScore: 88, trend: 'stable', auditCount: 45 },
    { elementNumber: 'ELEM_03', elementName: 'Gestão de Riscos', complianceScore: 85, trend: 'down', auditCount: 45 },
    { elementNumber: 'ELEM_04', elementName: 'Treinamento', complianceScore: 90, trend: 'up', auditCount: 45 },
    { elementNumber: 'ELEM_05', elementName: 'Operações', complianceScore: 83, trend: 'stable', auditCount: 45 },
  ]);

  const [benchmarks, setBenchmarks] = useState<CompanyBenchmark[]>([
    { companyId: '1', companyName: 'Empresa A', averageScore: 92.3, auditCount: 48, rank: 1 },
    { companyId: '2', companyName: 'Sua Empresa', averageScore: 87.5, auditCount: 45, rank: 2 },
    { companyId: '3', companyName: 'Empresa C', averageScore: 85.1, auditCount: 52, rank: 3 },
    { companyId: '4', companyName: 'Empresa D', averageScore: 82.7, auditCount: 39, rank: 4 },
    { companyId: '5', companyName: 'Empresa E', averageScore: 79.8, auditCount: 41, rank: 5 },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'alert-1',
      type: 'deadline',
      severity: 'high',
      title: 'Prazo de Não Conformidade Crítica',
      description: 'Não conformidade NC_001 vence em 3 dias',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      isRead: false
    },
    {
      id: 'alert-2',
      type: 'certification',
      severity: 'medium',
      title: 'Certificação STCW Vencendo',
      description: '5 tripulantes com certificação vencendo em 30 dias',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      isRead: false
    },
    {
      id: 'alert-3',
      type: 'audit',
      severity: 'medium',
      title: 'Auditoria Programada',
      description: 'Auditoria PEOTRAM agendada para próxima semana',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      isRead: false
    },
    {
      id: 'alert-4',
      type: 'non_conformity',
      severity: 'low',
      title: 'Nova Não Conformidade',
      description: 'Não conformidade menor registrada em ELEM_05',
      createdAt: new Date(),
      isRead: true
    }
  ]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityBadge = (severity: Alert['severity']) => {
    const variants = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return variants[severity];
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const exportAnalytics = () => {
    const data = {
      metrics,
      complianceByElement,
      benchmarks,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peotram-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Analytics Avançado PEOTRAM</CardTitle>
                <CardDescription>
                  KPIs, tendências e benchmarking em tempo real
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button onClick={exportAnalytics}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Compliance Médio
              </CardTitle>
              {getTrendIcon(metrics.trend)}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(metrics.averageComplianceScore)}`}>
              {metrics.averageComplianceScore.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.trend === 'up' ? '+' : metrics.trend === 'down' ? '-' : ''}
              {metrics.trendPercentage}% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Auditorias Concluídas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.completedAudits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              de {metrics.totalAudits} total
            </p>
            <Progress 
              value={(metrics.completedAudits / metrics.totalAudits) * 100} 
              className="h-1 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                NCs Críticas
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {metrics.criticalNonConformities}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requerem ação imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ações Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {metrics.pendingActions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Aguardando conclusão
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed analytics */}
      <Tabs defaultValue="compliance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Compliance por Elemento
          </TabsTrigger>
          <TabsTrigger value="benchmarking" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Benchmarking
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alertas ({alerts.filter(a => !a.isRead).length})
          </TabsTrigger>
        </TabsList>

        {/* Compliance by Element */}
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance por Elemento</CardTitle>
              <CardDescription>
                Desempenho detalhado por elemento do checklist PEOTRAM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceByElement.map((element) => (
                  <div key={element.elementNumber} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{element.elementNumber}</Badge>
                        <span className="font-medium">{element.elementName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {getTrendIcon(element.trend)}
                        <span className={`text-lg font-bold ${getScoreColor(element.complianceScore)}`}>
                          {element.complianceScore}%
                        </span>
                      </div>
                    </div>
                    <Progress value={element.complianceScore} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Baseado em {element.auditCount} auditorias
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benchmarking */}
        <TabsContent value="benchmarking">
          <Card>
            <CardHeader>
              <CardTitle>Benchmarking (Anonimizado)</CardTitle>
              <CardDescription>
                Comparação de performance com outras empresas do setor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {benchmarks.map((company, index) => (
                  <div
                    key={company.companyId}
                    className={`p-4 rounded-lg border ${
                      company.companyName === 'Sua Empresa'
                        ? 'bg-primary/5 border-primary'
                        : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {company.rank}
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {company.companyName}
                            {company.companyName === 'Sua Empresa' && (
                              <Badge className="bg-primary/20 text-primary">Você</Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {company.auditCount} auditorias
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getScoreColor(company.averageScore)}`}>
                          {company.averageScore.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Score médio</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Inteligentes</CardTitle>
              <CardDescription>
                Notificações automáticas de vencimentos e não conformidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border transition-opacity ${
                      alert.isRead ? 'opacity-50' : ''
                    } ${
                      alert.severity === 'high' ? 'border-red-200 bg-red-50/50' :
                      alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50/50' :
                      'border-blue-200 bg-blue-50/50'
                    }`}
                    onClick={() => !alert.isRead && markAlertAsRead(alert.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                          alert.severity === 'high' ? 'text-red-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{alert.title}</p>
                            <Badge className={getSeverityBadge(alert.severity)}>
                              {alert.severity === 'high' ? 'Alta' :
                               alert.severity === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                          {alert.dueDate && (
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Vencimento: {alert.dueDate.toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                      {!alert.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
