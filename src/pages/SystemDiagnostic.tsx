/**
 * System Diagnostic Page - PATCH 980
 * Complete system health and readiness dashboard
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, CheckCircle2, AlertTriangle, XCircle, Download,
  Cpu, Database, Wifi, WifiOff, Brain, FileText, RefreshCw,
  Shield, Clock, Zap, HardDrive, BarChart3, Settings2
} from 'lucide-react';
import { systemDiagnostic, DiagnosticReport } from '@/lib/system-diagnostic/diagnostic-engine';
import { moduleIntegrationValidator, IntegrationReport } from '@/lib/system-diagnostic/integration-validator';
import { offlineValidator, OfflineValidationResult } from '@/lib/system-diagnostic/offline-validator';
import { aiIntegrationChecker, AIIntegrationStatus } from '@/lib/system-diagnostic/ai-integration-checker';
import { technicalPackageGenerator } from '@/lib/system-diagnostic/package-generator';
import { documentationGenerator } from '@/lib/system-diagnostic/documentation-generator';
import { toast } from 'sonner';

export default function SystemDiagnostic() {
  const [isRunning, setIsRunning] = useState(false);
  const [diagnostic, setDiagnostic] = useState<DiagnosticReport | null>(null);
  const [integration, setIntegration] = useState<IntegrationReport | null>(null);
  const [offline, setOffline] = useState<OfflineValidationResult | null>(null);
  const [aiStatus, setAIStatus] = useState<AIIntegrationStatus | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const runFullDiagnostic = async () => {
    setIsRunning(true);
    toast.info('Iniciando diagnóstico completo...');
    
    try {
      const [diagResult, intResult, offResult, aiResult] = await Promise.all([
        systemDiagnostic.runDiagnostic(),
        moduleIntegrationValidator.validate(),
        offlineValidator.validate(),
        aiIntegrationChecker.check()
      ]);
      
      setDiagnostic(diagResult);
      setIntegration(intResult);
      setOffline(offResult);
      setAIStatus(aiResult);
      
      toast.success('Diagnóstico concluído!');
    } catch (e) {
      toast.error('Erro no diagnóstico');
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const exportPackage = async () => {
    toast.info('Gerando pacote técnico...');
    try {
      const markdown = await technicalPackageGenerator.exportAsMarkdown();
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pacote-tecnico-${new Date().toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Pacote exportado!');
    } catch (e) {
      toast.error('Erro ao exportar');
    }
  };

  const exportDocumentation = () => {
    const markdown = documentationGenerator.exportAsMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documentacao-sistema-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Documentação exportada!');
  };

  useEffect(() => {
    runFullDiagnostic();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
      case 'pass':
      case 'production-ready':
      case 'excellent':
        return 'bg-green-500';
      case 'partial':
      case 'needs-review':
      case 'good':
        return 'bg-yellow-500';
      case 'incomplete':
      case 'fail':
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
      case 'pass':
      case 'production-ready':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'partial':
      case 'needs-review':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Diagnóstico do Sistema</h1>
          <p className="text-muted-foreground">
            Validação completa e pacote de entrega técnica
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runFullDiagnostic} disabled={isRunning}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
          </Button>
          <Button variant="outline" onClick={exportPackage}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Pacote
          </Button>
          <Button variant="outline" onClick={exportDocumentation}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar Docs
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {diagnostic && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Score Geral</p>
                  <p className="text-3xl font-bold">{diagnostic.overallScore}</p>
                </div>
                <div className={`h-12 w-12 rounded-full ${getStatusColor(diagnostic.systemStatus)} flex items-center justify-center`}>
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
              <Progress value={diagnostic.overallScore} className="mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Módulos Prontos</p>
                  <p className="text-3xl font-bold">
                    {diagnostic.summary.readyModules}/{diagnostic.summary.totalModules}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <Settings2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <Progress 
                value={(diagnostic.summary.readyModules / diagnostic.summary.totalModules) * 100} 
                className="mt-3" 
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cobertura IA</p>
                  <p className="text-3xl font-bold">{diagnostic.summary.aiCoverage}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
              <Progress value={diagnostic.summary.aiCoverage} className="mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Suporte Offline</p>
                  <p className="text-3xl font-bold">{diagnostic.summary.offlineCoverage}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-cyan-500 flex items-center justify-center">
                  <WifiOff className="h-6 w-6 text-white" />
                </div>
              </div>
              <Progress value={diagnostic.summary.offlineCoverage} className="mt-3" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="offline">Offline</TabsTrigger>
          <TabsTrigger value="ai">IA</TabsTrigger>
          <TabsTrigger value="tasks">Pendências</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* System Status */}
          {diagnostic && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(diagnostic.systemStatus)}
                  Status do Sistema
                </CardTitle>
                <CardDescription>
                  {diagnostic.systemStatus === 'production-ready' 
                    ? 'Sistema pronto para produção'
                    : diagnostic.systemStatus === 'needs-review'
                    ? 'Sistema necessita revisão antes do deploy'
                    : 'Sistema incompleto - ações necessárias'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Checklist de Prontidão</h4>
                    <div className="grid gap-2">
                      {diagnostic.readinessChecklist.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                          {item.passed 
                            ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                            : <XCircle className="h-4 w-4 text-red-500" />
                          }
                          <span className={item.passed ? '' : 'text-muted-foreground'}>
                            {item.item}
                          </span>
                          {item.notes && (
                            <span className="text-sm text-muted-foreground ml-auto">
                              {item.notes}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {diagnostic.criticalIssues.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-red-500">Problemas Críticos</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {diagnostic.criticalIssues.map((issue, idx) => (
                          <li key={idx} className="text-red-600">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integration Map */}
          {integration && (
            <Card>
              <CardHeader>
                <CardTitle>Integração entre Módulos</CardTitle>
                <CardDescription>
                  {integration.workingFlows}/{integration.totalFlows} fluxos funcionando
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div className="p-3 rounded bg-green-500/10 border border-green-500/20">
                    <p className="text-2xl font-bold text-green-500">{integration.workingFlows}</p>
                    <p className="text-sm">Funcionando</p>
                  </div>
                  <div className="p-3 rounded bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-2xl font-bold text-yellow-500">{integration.partialFlows}</p>
                    <p className="text-sm">Parcial</p>
                  </div>
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/20">
                    <p className="text-2xl font-bold text-red-500">{integration.brokenFlows}</p>
                    <p className="text-sm">Quebrado</p>
                  </div>
                </div>

                {integration.inconsistencies.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Inconsistências Detectadas</h4>
                    {integration.inconsistencies.map((inc, idx) => (
                      <div key={idx} className="p-2 rounded bg-muted/50 mb-2">
                        <p>{inc.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Módulos: {inc.modules.join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Módulos</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="grid gap-3">
                  {diagnostic?.modules.map((module) => (
                    <div key={module.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(module.status)}
                          <span className="font-semibold">{module.name}</span>
                          <Badge variant="outline">{module.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {module.aiIntegration && (
                            <Badge className="bg-purple-500">IA</Badge>
                          )}
                          {module.offlineSupport && (
                            <Badge className="bg-cyan-500">Offline</Badge>
                          )}
                          <span className="font-bold">{module.completeness}%</span>
                        </div>
                      </div>
                      <Progress value={module.completeness} className="h-2" />
                      
                      {module.features.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-1 text-sm">
                          {module.features.map((f, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              {f.implemented 
                                ? <CheckCircle2 className="h-3 w-3 text-green-500" />
                                : <XCircle className="h-3 w-3 text-red-500" />
                              }
                              <span className={!f.implemented ? 'text-muted-foreground' : ''}>
                                {f.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {module.recommendations.length > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {module.recommendations.map((rec, idx) => (
                            <p key={idx}>💡 {rec}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offline">
          {offline && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(offline.overallStatus)}
                  Validação Offline
                </CardTitle>
                <CardDescription>
                  Capacidade estimada: {offline.estimatedOfflineDuration}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Testes de Validação</h4>
                  <div className="grid gap-2">
                    {offline.tests.map((test, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div className="flex items-center gap-2">
                          {test.status === 'pass' 
                            ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                            : test.status === 'fail'
                            ? <XCircle className="h-4 w-4 text-red-500" />
                            : <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          }
                          <span>{test.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {test.duration.toFixed(0)}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Capacidades</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {offline.capabilities.map((cap, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        {cap.supported 
                          ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                          : <XCircle className="h-4 w-4 text-red-500" />
                        }
                        <div>
                          <p className="text-sm font-medium">{cap.capability}</p>
                          <p className="text-xs text-muted-foreground">{cap.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai">
          {aiStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Integração de IA
                </CardTitle>
                <CardDescription>
                  Cobertura: {aiStatus.overallCoverage}% dos módulos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="grid gap-3">
                    {aiStatus.modules.filter(m => m.hasAI).map((module) => (
                      <div key={module.id} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{module.name}</span>
                          <Badge variant="outline">{module.responseTime}ms</Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          {module.aiFeatures.map((f, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span>{f.feature}</span>
                              {f.workingOffline && (
                                <Badge variant="secondary" className="text-xs">Offline</Badge>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-1">Exemplos de prompts:</p>
                          <div className="flex flex-wrap gap-1">
                            {module.samplePrompts.slice(0, 2).map((p, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {p}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {aiStatus.recommendations.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Recomendações</h4>
                    {aiStatus.recommendations.map((rec, idx) => (
                      <p key={idx} className="text-sm text-muted-foreground">💡 {rec}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tasks">
          {diagnostic && (
            <Card>
              <CardHeader>
                <CardTitle>Tarefas Pendentes</CardTitle>
                <CardDescription>
                  {diagnostic.pendingActions.length} ações identificadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {diagnostic.pendingActions.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border">
                        <Badge 
                          className={
                            action.priority === 'high' ? 'bg-red-500' :
                            action.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }
                        >
                          {action.priority}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">{action.action}</p>
                          <p className="text-sm text-muted-foreground">
                            Módulo: {action.module} | Esforço: {action.effort}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
