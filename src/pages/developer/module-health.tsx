/**
 * PATCH 84.0 - Module Health Dashboard
 * Interface para visualizar e executar checklist de módulos
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Download, RefreshCw, AlertTriangle, CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import { runModuleHealthCheck, saveReport, type ModuleCheckResult } from '@/ai/module-checker';
import { toast } from 'sonner';

export default function ModuleHealthDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ModuleCheckResult[]>([]);
  const [report, setReport] = useState<string>('');

  const runCheck = async () => {
    setIsRunning(true);
    toast.info('Iniciando checklist de módulos...');

    try {
      const checkResults = await runModuleHealthCheck();
      setResults(checkResults);

      const markdownReport = await saveReport(checkResults);
      setReport(markdownReport);

      toast.success(`Checklist completo! ${checkResults.length} módulos testados.`);
    } catch (error) {
      toast.error('Erro ao executar checklist');
      console.error('[Module Health] Error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nautilus_module_health_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório baixado!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle2 className="h-4 w-4" />;
      case 'partial': return <AlertTriangle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const readyCount = results.filter(r => r.status === 'ready').length;
  const partialCount = results.filter(r => r.status === 'partial').length;
  const failedCount = results.filter(r => r.status === 'failed').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Health Checker</h1>
          <p className="text-muted-foreground">
            PATCH 84.0 - Sistema de checklist automático
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/developer/ai-modules-status">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              AI Modules Status
            </Button>
          </Link>
          <Button onClick={runCheck} disabled={isRunning}>
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Executar Checklist
              </>
            )}
          </Button>
          {report && (
            <Button onClick={downloadReport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Baixar Relatório
            </Button>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Módulos Prontos
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{readyCount}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((readyCount / results.length) * 100)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Parcialmente Funcionais
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partialCount}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((partialCount / results.length) * 100)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Com Falhas
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{failedCount}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((failedCount / results.length) * 100)}% do total
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resultados Detalhados</CardTitle>
              <CardDescription>
                Status de todos os {results.length} módulos testados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.moduleId}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.moduleName}</div>
                        <div className="text-sm text-muted-foreground">
                          {result.moduleId} • {result.category}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">
                        {result.responseTime}ms
                      </div>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {failedCount > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {failedCount} módulo(s) com falha detectada. Verifique o relatório detalhado.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {results.length === 0 && !isRunning && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Play className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum teste executado ainda.<br />
              Clique em "Executar Checklist" para começar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
