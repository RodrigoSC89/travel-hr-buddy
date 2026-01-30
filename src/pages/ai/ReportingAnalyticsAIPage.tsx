/**
 * Reporting & Analytics AI Page
 * AI-powered business intelligence and executive dashboards
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  FileText,
  Download,
  Brain,
  Target,
  PieChart,
  Activity
} from 'lucide-react';

export default function ReportingAnalyticsAIPage() {
  const reports = [
    { title: 'Relatório Executivo Mensal', type: 'Executive', generated: '2026-01-30', status: 'ready' },
    { title: 'Análise de Custos Q1', type: 'Financial', generated: '2026-01-28', status: 'ready' },
    { title: 'Performance da Frota', type: 'Operational', generated: '2026-01-25', status: 'ready' },
    { title: 'Compliance Report', type: 'Regulatory', generated: '2026-01-20', status: 'ready' },
  ];

  return (
    <>
      <Helmet>
        <title>Reporting & Analytics AI | Nautilus One</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Reporting & Analytics AI
            </h1>
            <p className="text-muted-foreground">
              Business Intelligence e dashboards executivos com IA
            </p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Relatórios (Mês)</p>
                  <p className="text-3xl font-bold">47</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Insights Gerados</p>
                  <p className="text-3xl font-bold text-emerald-500">156</p>
                </div>
                <Brain className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">KPIs Monitorados</p>
                  <p className="text-3xl font-bold">89</p>
                </div>
                <Target className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dashboards Ativos</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <PieChart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Tendências de Performance</CardTitle>
              <CardDescription>Análise comparativa YoY</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Gráfico de tendências</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium text-sm">Tendência Positiva</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Eficiência operacional aumentou 12% no Q4.
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">Meta Atingida</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Redução de custos operacionais superou target em 8%.
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-amber-500/5 border-amber-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="h-4 w-4 text-amber-500" />
                  <span className="font-medium text-sm">Atenção</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Custos de manutenção 5% acima do orçado.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Recentes</CardTitle>
            <CardDescription>Últimos relatórios gerados automaticamente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.type} • Gerado: {new Date(report.generated).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Pronto</Badge>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
