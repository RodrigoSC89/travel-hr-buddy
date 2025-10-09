import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Clock,
  TestTube,
  CheckCircle,
  AlertTriangle,
  XCircle,
  PlayCircle,
  BarChart,
  Calendar,
  Shield,
  Zap,
  Eye,
  RefreshCw,
} from "lucide-react";

export const ContinuousTestingMonitoring: React.FC = () => {
  const [testResults] = useState([
    {
      id: "1",
      name: "Teste de Backup Semanal",
      type: "backup_integrity",
      status: "passed",
      lastRun: "2024-01-14 03:00:00",
      duration: "2h 15min",
      nextRun: "2024-01-21 03:00:00",
      frequency: "semanal",
      successRate: 98.5,
      criticalPath: true,
    },
    {
      id: "2",
      name: "Simulação de Failover",
      type: "disaster_recovery",
      status: "warning",
      lastRun: "2024-01-10 14:30:00",
      duration: "45min",
      nextRun: "2024-01-20 14:30:00",
      frequency: "quinzenal",
      successRate: 95.2,
      criticalPath: true,
    },
    {
      id: "3",
      name: "Teste de Recuperação Parcial",
      type: "data_recovery",
      status: "passed",
      lastRun: "2024-01-12 10:15:00",
      duration: "23min",
      nextRun: "2024-01-26 10:15:00",
      frequency: "quinzenal",
      successRate: 99.1,
      criticalPath: false,
    },
    {
      id: "4",
      name: "Teste de Segurança",
      type: "security_audit",
      status: "failed",
      lastRun: "2024-01-11 16:00:00",
      duration: "1h 30min",
      nextRun: "2024-01-18 16:00:00",
      frequency: "semanal",
      successRate: 87.3,
      criticalPath: true,
    },
    {
      id: "5",
      name: "Teste de Carga do Sistema",
      type: "performance",
      status: "passed",
      lastRun: "2024-01-13 20:00:00",
      duration: "3h 45min",
      nextRun: "2024-01-27 20:00:00",
      frequency: "quinzenal",
      successRate: 92.8,
      criticalPath: false,
    },
  ]);

  const [monitoringAlerts] = useState([
    {
      id: "1",
      type: "critical",
      title: "Teste de Segurança Falhou",
      description: "Vulnerabilidades detectadas no último teste de penetração",
      timestamp: "2024-01-11 16:45:00",
      component: "Security Test",
      action_required: true,
    },
    {
      id: "2",
      type: "warning",
      title: "Failover com Atraso",
      description: "Tempo de failover excedeu o limite de 30 segundos (45s)",
      timestamp: "2024-01-10 14:32:00",
      component: "Disaster Recovery",
      action_required: false,
    },
    {
      id: "3",
      type: "info",
      title: "Backup Concluído com Sucesso",
      description: "Backup completo realizado sem erros",
      timestamp: "2024-01-14 05:15:00",
      component: "Backup System",
      action_required: false,
    },
  ]);

  const [systemMetrics] = useState({
    availabilityTarget: 99.9,
    currentAvailability: 99.98,
    mttr: 15, // Mean Time To Recovery in minutes
    mtbf: 720, // Mean Time Between Failures in hours
    rto: 30, // Recovery Time Objective in minutes
    rpo: 60, // Recovery Point Objective in minutes
  });

  const getStatusColor = (status: string) => {
    switch (status) {
    case "passed":
      return "text-green-500";
    case "warning":
      return "text-yellow-500";
    case "failed":
      return "text-red-500";
    default:
      return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "passed":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    case "warning":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
    case "critical":
      return "border-red-200 bg-red-50 dark:bg-red-900/20";
    case "warning":
      return "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20";
    case "info":
      return "border-blue-200 bg-blue-50 dark:bg-blue-900/20";
    default:
      return "border-gray-200 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getTestIcon = (type: string) => {
    switch (type) {
    case "backup_integrity":
      return TestTube;
    case "disaster_recovery":
      return RefreshCw;
    case "data_recovery":
      return Activity;
    case "security_audit":
      return Shield;
    case "performance":
      return BarChart;
    default:
      return CheckCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Testes & Monitoramento Contínuo</h1>
          <Badge variant="secondary">DRP Testing</Badge>
        </div>
        <p className="text-muted-foreground">
          Sistema de testes automatizados e monitoramento proativo para continuidade operacional
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponibilidade</p>
                <p className="text-2xl font-bold text-green-600">
                  {systemMetrics.currentAvailability}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Meta: {systemMetrics.availabilityTarget}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">MTTR</p>
                <p className="text-2xl font-bold">{systemMetrics.mttr}min</p>
                <p className="text-xs text-muted-foreground">Tempo Médio de Recuperação</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">RTO</p>
                <p className="text-2xl font-bold">{systemMetrics.rto}min</p>
                <p className="text-xs text-muted-foreground">Recovery Time Objective</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">RPO</p>
                <p className="text-2xl font-bold">{systemMetrics.rpo}min</p>
                <p className="text-xs text-muted-foreground">Recovery Point Objective</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tests">Testes Automáticos</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="schedule">Cronograma</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="tests">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Suíte de Testes de Continuidade</h3>
              <Button>
                <PlayCircle className="w-4 h-4 mr-2" />
                Executar Teste Manual
              </Button>
            </div>

            <div className="space-y-3">
              {testResults.map(test => {
                const TestIcon = getTestIcon(test.type);
                return (
                  <Card key={test.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <TestIcon className="w-6 h-6 text-primary" />
                          <div>
                            <h4 className="font-semibold text-lg">{test.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Frequência: {test.frequency} • Duração: {test.duration}
                            </p>
                          </div>
                          {test.criticalPath && (
                            <Badge variant="destructive" className="ml-2">
                              Crítico
                            </Badge>
                          )}
                        </div>
                        <Badge className={getStatusBadge(test.status)}>
                          {test.status === "passed"
                            ? "Passou"
                            : test.status === "warning"
                              ? "Atenção"
                              : "Falhou"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Última Execução</p>
                          <p className="text-sm text-muted-foreground">{test.lastRun}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Próxima Execução</p>
                          <p className="text-sm text-muted-foreground">{test.nextRun}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Taxa de Sucesso</p>
                          <div className="flex items-center gap-2">
                            <Progress value={test.successRate} className="flex-1" />
                            <span className="text-sm font-medium">{test.successRate}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Logs
                          </Button>
                          <Button variant="outline" size="sm">
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Executar
                          </Button>
                        </div>
                      </div>

                      {test.status === "failed" && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="font-medium text-red-800 dark:text-red-200">
                              Ação Requerida
                            </span>
                          </div>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            Teste falhou na última execução. Revisar logs e implementar correções.
                          </p>
                        </div>
                      )}

                      {test.status === "warning" && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium text-yellow-800 dark:text-yellow-200">
                              Atenção
                            </span>
                          </div>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Teste passou com observações. Monitorar próximas execuções.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Alertas e Monitoramento Proativo</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>Alertas Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monitoringAlerts.map(alert => (
                      <div
                        key={alert.id}
                        className={`p-3 border rounded-lg ${getAlertColor(alert.type)}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{alert.title}</span>
                          {alert.action_required && (
                            <Badge variant="destructive" className="text-xs">
                              Ação Requerida
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            {alert.component} • {alert.timestamp}
                          </span>
                          {alert.action_required && (
                            <Button size="sm" variant="outline">
                              Resolver
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle>Saúde do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Serviços Principais</span>
                        <span className="text-sm font-medium">100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Performance</span>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Segurança</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Backup</span>
                        <span className="text-sm font-medium">99%</span>
                      </div>
                      <Progress value={99} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cronograma de Testes</h3>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Próximos Testes Agendados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day, index) => (
                      <div key={index} className="text-center p-2 border rounded-lg">
                        <div className="font-medium text-sm">{day}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {index === 0 && "Backup"}
                          {index === 3 && "Segurança"}
                          {index === 6 && "Performance"}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 mt-6">
                    <h4 className="font-medium">Esta Semana</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">Backup Completo</span>
                          <p className="text-sm text-muted-foreground">Domingo, 03:00</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          Agendado
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">Teste de Segurança</span>
                          <p className="text-sm text-muted-foreground">Quarta, 16:00</p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                          Reexecução
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Relatórios de Continuidade</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Automáticos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">Relatório Semanal de DRP</span>
                        <p className="text-sm text-muted-foreground">Enviado toda segunda-feira</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">Dashboard Executivo</span>
                        <p className="text-sm text-muted-foreground">
                          Métricas consolidadas mensais
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">Análise de Tendências</span>
                        <p className="text-sm text-muted-foreground">Relatório trimestral</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">99.98%</div>
                      <div className="text-sm text-muted-foreground">Disponibilidade (30 dias)</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">96.2%</div>
                      <div className="text-sm text-muted-foreground">
                        Taxa de Sucesso dos Testes
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">15min</div>
                      <div className="text-sm text-muted-foreground">MTTR Médio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
