/**
 * Compliance AI Page
 * AI-powered compliance and regulatory management
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  TrendingUp,
  Brain,
  Clock,
  Target
} from 'lucide-react';

export default function ComplianceAIPage() {
  const complianceModules = [
    { 
      title: 'SOLAS Compliance', 
      status: 'compliant', 
      score: 98, 
      lastAudit: '2026-01-15',
      nextAudit: '2026-07-15'
    },
    { 
      title: 'MARPOL Compliance', 
      status: 'warning', 
      score: 85, 
      lastAudit: '2026-01-10',
      nextAudit: '2026-04-10'
    },
    { 
      title: 'MLC 2006', 
      status: 'compliant', 
      score: 94, 
      lastAudit: '2025-12-20',
      nextAudit: '2026-06-20'
    },
    { 
      title: 'ISM Code', 
      status: 'compliant', 
      score: 96, 
      lastAudit: '2025-11-30',
      nextAudit: '2026-05-30'
    },
  ];

  return (
    <>
      <Helmet>
        <title>Compliance AI | Nautilus One</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Compliance & Regulatory AI
            </h1>
            <p className="text-muted-foreground">
              IA preditiva para compliance marítimo automático
            </p>
          </div>
          <Badge variant="default" className="text-lg px-4 py-2">
            <Brain className="h-4 w-4 mr-2" />
            AI Powered
          </Badge>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Score Geral</p>
                  <p className="text-3xl font-bold text-success">93%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Auditorias Pendentes</p>
                  <p className="text-3xl font-bold text-warning">3</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">NCs Abertas</p>
                  <p className="text-3xl font-bold text-destructive">2</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Documentos Válidos</p>
                  <p className="text-3xl font-bold">156</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Modules */}
        <Card>
          <CardHeader>
            <CardTitle>Módulos de Compliance</CardTitle>
            <CardDescription>Status de conformidade por regulamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceModules.map((module) => (
                <div 
                  key={module.title}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      module.status === 'compliant' ? 'bg-success/10' : 'bg-warning/10'
                    }`}>
                      {module.status === 'compliant' ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{module.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Próxima auditoria: {new Date(module.nextAudit).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">{module.score}%</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Target className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Predictions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Predições de Compliance IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-warning/30 bg-warning/5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="font-medium">Alerta Preditivo</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Certificado MARPOL do navio MV Explorer expira em 45 dias. 
                  Renovação recomendada até 15/03/2026.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-success/30 bg-success/5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="font-medium">Tendência Positiva</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Score de compliance aumentou 8% no último trimestre.
                  Mantendo tendência para atingir 95% até Q2.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
