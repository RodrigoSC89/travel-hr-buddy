import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Calendar
} from 'lucide-react';
import { AnpPracticesManager } from './AnpPracticesManager';
import { RiskAssessmentMatrix } from './RiskAssessmentMatrix';

export const SgsoDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

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

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="p-6 bg-white rounded-2xl shadow-lg">
              <Shield className="h-16 w-16 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Sistema de Gestão de Segurança Operacional (SGSO)
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                Compliance ANP Resolução 43/2007 - 17 Práticas Obrigatórias
              </p>
              <div className="flex gap-3">
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
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-10 w-10 text-red-600" />
              <Badge className="bg-red-600 text-white font-bold">CRÍTICO</Badge>
            </div>
            <h3 className="text-sm font-medium text-red-700 mb-1">Incidentes Abertos</h3>
            <p className="text-3xl font-bold text-red-900">{kpis.incidents.openIncidents}</p>
            <p className="text-xs text-red-600 mt-2">
              {kpis.incidents.critical} críticos, {kpis.incidents.high} altos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-10 w-10 text-orange-600" />
              <Badge className="bg-orange-600 text-white font-bold">RISCOS</Badge>
            </div>
            <h3 className="text-sm font-medium text-orange-700 mb-1">Riscos Ativos</h3>
            <p className="text-3xl font-bold text-orange-900">{kpis.risks.totalRisks}</p>
            <p className="text-xs text-orange-600 mt-2">
              {kpis.risks.critical} críticos, {kpis.risks.high} altos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-10 w-10 text-blue-600" />
              <Badge className="bg-blue-600 text-white font-bold">AUDITORIAS</Badge>
            </div>
            <h3 className="text-sm font-medium text-blue-700 mb-1">Auditorias</h3>
            <p className="text-3xl font-bold text-blue-900">{kpis.audits.completed}</p>
            <p className="text-xs text-blue-600 mt-2">
              {kpis.audits.planned} planejadas, {kpis.audits.overdue} atrasadas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-10 w-10 text-green-600" />
              <Badge className="bg-green-600 text-white font-bold">TREINAMENTO</Badge>
            </div>
            <h3 className="text-sm font-medium text-green-700 mb-1">Compliance Treinamento</h3>
            <p className="text-3xl font-bold text-green-900">{kpis.training.upToDate}%</p>
            <p className="text-xs text-green-600 mt-2">
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
            <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full h-auto gap-2 bg-gray-100 p-2">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:font-bold"
              >
                <Shield className="h-4 w-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger 
                value="practices"
                className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:font-bold"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                17 Práticas ANP
              </TabsTrigger>
              <TabsTrigger 
                value="risks"
                className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:font-bold"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Matriz de Riscos
              </TabsTrigger>
              <TabsTrigger 
                value="incidents"
                className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:font-bold"
              >
                <Bell className="h-4 w-4 mr-2" />
                Incidentes
              </TabsTrigger>
              <TabsTrigger 
                value="audits"
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:font-bold"
              >
                <FileText className="h-4 w-4 mr-2" />
                Auditorias
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
                        { type: 'incident', title: 'Novo incidente registrado', time: '2 horas atrás', severity: 'high' },
                        { type: 'audit', title: 'Auditoria ANP concluída', time: '5 horas atrás', severity: 'info' },
                        { type: 'practice', title: 'Prática 4 atualizada', time: '1 dia atrás', severity: 'warning' },
                        { type: 'risk', title: 'Novo risco identificado', time: '2 dias atrás', severity: 'medium' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className={`p-2 rounded-full ${
                            activity.severity === 'high' ? 'bg-red-100' :
                            activity.severity === 'warning' ? 'bg-yellow-100' :
                            activity.severity === 'info' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Activity className={`h-4 w-4 ${
                              activity.severity === 'high' ? 'text-red-600' :
                              activity.severity === 'warning' ? 'text-yellow-600' :
                              activity.severity === 'info' ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-600">{activity.time}</p>
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
                        { task: 'Auditoria interna Prática 13', due: 'Amanhã', priority: 'high' },
                        { task: 'Revisão matriz de riscos', due: '3 dias', priority: 'medium' },
                        { task: 'Treinamento SGSO tripulação', due: '1 semana', priority: 'medium' },
                        { task: 'Relatório ANP mensal', due: '2 semanas', priority: 'low' }
                      ].map((task, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <Clock className={`h-4 w-4 ${
                              task.priority === 'high' ? 'text-red-600' :
                              task.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                            }`} />
                            <span className="font-semibold text-sm text-gray-900">{task.task}</span>
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

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button className="bg-red-600 hover:bg-red-700 text-white h-auto py-6 flex-col gap-2">
                      <Bell className="h-6 w-6" />
                      <span className="font-semibold">Reportar Incidente</span>
                    </Button>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white h-auto py-6 flex-col gap-2">
                      <AlertTriangle className="h-6 w-6" />
                      <span className="font-semibold">Registrar Risco</span>
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white h-auto py-6 flex-col gap-2">
                      <FileText className="h-6 w-6" />
                      <span className="font-semibold">Nova Auditoria</span>
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white h-auto py-6 flex-col gap-2">
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
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Incidentes</CardTitle>
                  <CardDescription>
                    Registro e investigação de incidentes de segurança
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">Módulo de Incidentes</p>
                    <p className="text-sm">Sistema de registro e investigação de incidentes em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audits">
              <Card>
                <CardHeader>
                  <CardTitle>Planejamento de Auditorias</CardTitle>
                  <CardDescription>
                    Gestão de auditorias internas e externas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">Módulo de Auditorias</p>
                    <p className="text-sm">Sistema de planejamento e execução de auditorias em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SgsoDashboard;
