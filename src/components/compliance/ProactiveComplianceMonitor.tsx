/**
 * PATCH 902 - Proactive Compliance Monitor UI
 * Real-time compliance monitoring dashboard
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  FileText,
  Package,
  TrendingUp,
  AlertCircle,
  Users,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  runProactiveComplianceMonitor,
  type ComplianceMonitorResult,
  type ComplianceAlert,
  type ComplianceGap,
} from '@/lib/compliance/proactive-monitor';
import {
  generateInspectionPackage,
  downloadPackage,
  type InspectionType,
} from '@/lib/compliance/inspection-package-generator';

const severityColors: Record<string, string> = {
  critical: 'bg-destructive/20 text-destructive border-destructive',
  high: 'bg-warning/20 text-warning border-warning',
  medium: 'bg-accent/20 text-accent-foreground border-accent',
  low: 'bg-info/20 text-info border-info',
};

const statusColors: Record<string, string> = {
  compliant: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  non_compliant: 'bg-destructive/20 text-destructive',
};

export const ProactiveComplianceMonitor: React.FC = () => {
  const [result, setResult] = useState<ComplianceMonitorResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setLoading(true);
    try {
      const data = await runProactiveComplianceMonitor();
      setResult(data);
    } catch (error) {
      toast.error('Erro ao carregar dados de conformidade');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePackage = async (type: InspectionType, format: 'pdf' | 'zip') => {
    setGenerating(true);
    try {
      const pkg = await generateInspectionPackage({
        inspectionType: type,
        vesselName: 'Embarcação Principal',
        includeDocuments: true,
        includeLogs: true,
        includeAudits: true,
        includeCertificates: true,
        includeCrewData: true,
        format,
        digitalSignature: {
          name: 'Sistema Nauti One',
          position: 'Geração Automática',
          timestamp: new Date(),
        },
      });
      downloadPackage(pkg);
      toast.success(`Pacote ${type} gerado com sucesso!`);
    } catch (error) {
      toast.error('Erro ao gerar pacote');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitor de Conformidade Proativo</h2>
          <p className="text-muted-foreground">Avaliação em tempo real: ISM, MLC, STCW</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadComplianceData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {result.criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Alertas Críticos Detectados</AlertTitle>
          <AlertDescription>
            {result.criticalAlerts.length} alerta(s) requerem ação imediata
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Score */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Score Geral de Conformidade</h3>
              <p className="text-sm text-muted-foreground">
                Última atualização: {new Date(result.lastUpdated).toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${result.overallScore >= 90 ? 'text-success' : result.overallScore >= 70 ? 'text-warning' : 'text-destructive'}`}>
                {result.overallScore}%
              </div>
              <Badge className={statusColors[result.overallStatus]}>
                {result.overallStatus === 'compliant' ? 'Conforme' : result.overallStatus === 'warning' ? 'Atenção' : 'Não Conforme'}
              </Badge>
            </div>
          </div>
          <Progress value={result.overallScore} className="mt-4 h-3" />
        </CardContent>
      </Card>

      {/* Module Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {result.modules.map((module) => (
          <Card key={module.module}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{module.module}</span>
                </div>
                <Badge className={statusColors[module.status]}>
                  {module.score}%
                </Badge>
              </div>
              <Progress value={module.score} className="h-2 mb-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{module.gaps.length} gaps</span>
                <span>{module.alerts.length} alertas</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Package Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gerador de Pacotes de Inspeção
          </CardTitle>
          <CardDescription>Gere pacotes técnicos com timestamps para inspeções regulatórias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['PSC', 'ISM', 'MLC', 'ISPS'] as InspectionType[]).map((type) => (
              <div key={type} className="space-y-2">
                <h4 className="font-medium text-sm">{type}</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleGeneratePackage(type, 'pdf')} disabled={generating}>
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button size="sm" onClick={() => handleGeneratePackage(type, 'zip')} disabled={generating}>
                    <Download className="h-4 w-4 mr-1" />
                    ZIP
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Alerts and Expirations */}
      <Tabs defaultValue="alerts">
        <TabsList>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas ({result.criticalAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="expirations" className="gap-2">
            <Clock className="h-4 w-4" />
            Vencimentos ({result.upcomingExpirations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {result.criticalAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                  <p>Nenhum alerta crítico</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {result.criticalAlerts.map((alert) => (
                      <div key={alert.id} className={`p-4 border rounded-lg ${severityColors[alert.severity]}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{alert.standard}</Badge>
                              <Badge className={severityColors[alert.severity]}>{alert.severity}</Badge>
                            </div>
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="text-sm mt-1">{alert.description}</p>
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Recomendação:</strong> {alert.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expirations" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {result.upcomingExpirations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                  <p>Nenhum vencimento próximo</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {result.upcomingExpirations.map((gap) => (
                      <div key={gap.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{gap.standard}</Badge>
                              <Badge className={severityColors[gap.severity]}>{gap.daysUntilExpiry} dias</Badge>
                            </div>
                            <h4 className="font-medium">{gap.affectedEntity}</h4>
                            <p className="text-sm text-muted-foreground">{gap.description}</p>
                          </div>
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProactiveComplianceMonitor;
