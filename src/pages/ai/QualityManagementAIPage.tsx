/**
 * Quality Management AI Page
 * AI-powered quality management and NCR/CAPA tracking
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Brain,
  FileText,
  Target
} from 'lucide-react';

export default function QualityManagementAIPage() {
  const ncrs = [
    { id: 'NCR-2026-001', title: 'Falha no procedimento de segurança', severity: 'major', status: 'open', vessel: 'MV Explorer' },
    { id: 'NCR-2026-002', title: 'Documentação incompleta', severity: 'minor', status: 'in_progress', vessel: 'MV Pioneer' },
    { id: 'NCR-2026-003', title: 'Não conformidade em auditoria', severity: 'major', status: 'closed', vessel: 'MV Guardian' },
  ];

  return (
    <>
      <Helmet>
        <title>Quality Management AI | Nauti One</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ClipboardCheck className="h-8 w-8 text-primary" />
              Quality Management AI
            </h1>
            <p className="text-muted-foreground">
              Gestão de qualidade com IA para NCR, CAPA e auditorias
            </p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Nova NCR
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">NCRs Abertas</p>
                  <p className="text-3xl font-bold text-warning">5</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">CAPAs em Andamento</p>
                  <p className="text-3xl font-bold text-primary">12</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fechadas (Mês)</p>
                  <p className="text-3xl font-bold text-emerald-500">23</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Resolução</p>
                  <p className="text-3xl font-bold">92%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NCR List */}
        <Card>
          <CardHeader>
            <CardTitle>Non-Conformance Reports (NCRs)</CardTitle>
            <CardDescription>Últimas não conformidades registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ncrs.map((ncr) => (
                <div 
                  key={ncr.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      ncr.status === 'closed' ? 'bg-success/10' : 
                      ncr.status === 'in_progress' ? 'bg-primary/10' : 'bg-warning/10'
                    }`}>
                      {ncr.status === 'closed' ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : ncr.status === 'in_progress' ? (
                        <Clock className="h-5 w-5 text-primary" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{ncr.id}</p>
                        <Badge variant={ncr.severity === 'major' ? 'destructive' : 'secondary'}>
                          {ncr.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{ncr.title}</p>
                      <p className="text-xs text-muted-foreground">{ncr.vessel}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Target className="h-4 w-4 mr-1" />
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Análise de Causa Raiz (IA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="text-sm">
                <strong>Padrão detectado:</strong> 60% das NCRs do último trimestre estão relacionadas 
                a falhas de comunicação entre turnos. Recomendação: implementar checklist de handover 
                digital e treinamento adicional para supervisores.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
