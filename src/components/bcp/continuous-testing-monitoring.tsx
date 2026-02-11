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
  RefreshCw
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
      criticalPath: true
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
      criticalPath: true
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
      criticalPath: false
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
      criticalPath: true
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
      criticalPath: false
    }
  ]);

  const [monitoringAlerts] = useState([
    {
      id: "1",
      type: "critical",
      title: "Teste de Segurança Falhou",
      description: "Vulnerabilidades detectadas no último teste de penetração",
      timestamp: "2024-01-11 16:45:00",
      component: "Security Test",
      action_required: true
    },
    {
      id: "2",
      type: "warning",
      title: "Failover com Atraso",
      description: "Tempo de failover excedeu o limite de 30 segundos (45s)",
      timestamp: "2024-01-10 14:32:00",
      component: "Disaster Recovery",
      action_required: false
    },
    {
      id: "3",
      type: "info",
      title: "Backup Concluído com Sucesso",
      description: "Backup completo realizado sem erros",
      timestamp: "2024-01-14 05:15:00",
      component: "Backup System",
      action_required: false
    }
  ]);

  const [systemMetrics] = useState({
    availabilityTarget: 99.9,
    currentAvailability: 99.98,
    mttr: 15,
    mtbf: 720,
    rto: 30,
    rpo: 60
  });

  const getStatusColor = (status: string) => {
    switch (status) {
    case "passed": return "text-success";
    case "warning": return "text-warning";
    case "failed": return "text-destructive";
    default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "passed": return "bg-success/10 text-success border-success/20";
    case "warning": return "bg-warning/10 text-warning border-warning/20";
    case "failed": return "bg-destructive/10 text-destructive border-destructive/20";
    default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
    case "critical": return "border-destructive/30 bg-destructive/5";
    case "warning": return "border-warning/30 bg-warning/5";
    case "info": return "border-primary/30 bg-primary/5";
    default: return "border-border bg-muted/50";
    }
  };

  const getTestIcon = (type: string) => {
    switch (type) {
    case "backup_integrity": return TestTube;
    case "disaster_recovery": return RefreshCw;
    case "data_recovery": return Activity;
    case "security_audit": return Shield;
    case "performance": return BarChart;
    default: return CheckCircle;
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
                <p className="text-2xl font-bold text-success">{systemMetrics.currentAvailability}%</p>
                <p className="text-xs text-muted-foreground">Meta: {systemMetrics.availabilityTarget}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
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
              <Clock className="h-8 w-8 text-primary" />
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
              <Zap className="h-8 w-8 text-warning" />
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
              <Activity className="h-8 w-8 text-accent-foreground" />
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
              {testResults.map((test) => {
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
                            <Badge variant="destructive" className="ml-2">Crítico</Badge>
                          )}
                        </div>
                        <Badge className={getStatusBadge(test.status)}>
                          {test.status === "passed" ? "Passou" : 
                            test.status === "warning" ? "Atenção" : "Falhou"}
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
                        <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-4 h-4 text-destructive" />
                            <span className="font-medium text-destructive">
                              Ação Requerida
                            </span>
                          </div>
                          <p className="text-sm text-destructive/80">
                            Teste falhou na última execução. Revisar logs e implementar correções.
                          </p>
                        </div>
                      )}

                      {test.status === "warning" && (
                        <div className="p-3 bg-warning/5 rounded-lg border border-warning/20">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-warning" />
                            <span className="font-medium text-warning">
                              Atenção
                            </span>
                          </div>
                          <p className="text-sm text-warning/80">
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
                    {monitoringAlerts.map((alert) => (
                      <div key={alert.id} className={`p-3 border rounded-lg ${getAlertColor(alert.type)}`}>
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
                            <Button size="sm" variant="outline">Resolver</Button>
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
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <TestTube className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Teste de Backup Semanal</p>
                          <p className="text-sm text-muted-foreground">Domingo, 03:00</p>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          Agendado
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-warning" />
                        <div>
                          <p className="font-medium">Teste de Segurança</p>
                          <p className="text-sm text-muted-foreground">Quarta, 16:00</p>
                        </div>
                        <Badge className="bg-warning/10 text-warning border-warning/20">
                          Prioritário
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-accent-foreground" />
                        <div>
                          <p className="font-medium">Simulação de Failover</p>
                          <p className="text-sm text-muted-foreground">20/01, 14:30</p>
                        </div>
                        <Badge variant="secondary">Quinzenal</Badge>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendência de Disponibilidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { month: "Outubro", value: 99.95 },
                      { month: "Novembro", value: 99.97 },
                      { month: "Dezembro", value: 99.92 },
                      { month: "Janeiro", value: 99.98 }
                    ].map((item) => (
                      <div key={item.month}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{item.month}</span>
                          <span className="text-sm font-medium">{item.value}%</span>
                        </div>
                        <Progress value={item.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Testes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <span className="font-medium">Testes Aprovados</span>
                      </div>
                      <span className="text-2xl font-bold text-success">3</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-warning" />
                        <span className="font-medium">Com Observações</span>
                      </div>
                      <span className="text-2xl font-bold text-warning">1</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-destructive" />
                        <span className="font-medium">Testes Falhados</span>
                      </div>
                      <span className="text-2xl font-bold text-destructive">1</span>
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
