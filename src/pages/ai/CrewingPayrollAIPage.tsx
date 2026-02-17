/**
 * Crewing & Payroll AI Page
 * AI-powered crew management and payroll processing
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  DollarSign, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Brain,
  Ship,
  TrendingUp
} from 'lucide-react';

export default function CrewingPayrollAIPage() {
  const rotations = [
    { crew: 'Carlos Silva', role: 'Captain', vessel: 'MV Explorer', onboard: '2025-12-01', relief: '2026-02-28', status: 'onboard' },
    { crew: 'Maria Santos', role: 'Chief Engineer', vessel: 'MV Pioneer', onboard: '2026-01-15', relief: '2026-04-15', status: 'onboard' },
    { crew: 'João Oliveira', role: '2nd Officer', vessel: 'MV Guardian', onboard: '2025-11-20', relief: '2026-02-20', status: 'relief_due' },
  ];

  return (
    <>
      <Helmet>
        <title>Crewing & Payroll AI | Nauti One</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Crewing & Payroll AI
            </h1>
            <p className="text-muted-foreground">
              Gestão de tripulação e folha de pagamento com IA
            </p>
          </div>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Planejar Rotação
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tripulantes Ativos</p>
                  <p className="text-3xl font-bold">156</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Folha Mensal</p>
                  <p className="text-3xl font-bold">$485K</p>
                </div>
                <DollarSign className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rotações Pendentes</p>
                  <p className="text-3xl font-bold text-warning">8</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">MLC Compliance</p>
                  <p className="text-3xl font-bold text-success">98%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rotation Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Rotações de Tripulação
            </CardTitle>
            <CardDescription>Próximas trocas programadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rotations.map((rotation) => (
                <div 
                  key={rotation.crew}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      rotation.status === 'onboard' ? 'bg-success/10' : 'bg-warning/10'
                    }`}>
                      {rotation.status === 'onboard' ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{rotation.crew}</p>
                        <Badge variant="outline">{rotation.role}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rotation.vessel} • Embarque: {new Date(rotation.onboard).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      Desembarque: {new Date(rotation.relief).toLocaleDateString('pt-BR')}
                    </p>
                    <Badge variant={rotation.status === 'relief_due' ? 'destructive' : 'secondary'}>
                      {rotation.status === 'relief_due' ? 'Troca Próxima!' : 'A Bordo'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payroll Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumo da Folha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between p-3 rounded-lg bg-muted">
                <span>Salários Base</span>
                <span className="font-bold">$320,000</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted">
                <span>Horas Extras</span>
                <span className="font-bold">$45,000</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted">
                <span>Benefícios</span>
                <span className="font-bold">$85,000</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted">
                <span>Impostos & Encargos</span>
                <span className="font-bold">$35,000</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg border-2 border-primary">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">$485,000</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Insights de IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg border bg-warning/5 border-warning/30">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="font-medium text-sm">Alerta de Rotação</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  3 tripulantes atingem limite MLC de 11 meses nos próximos 30 dias.
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-success/5 border-success/30">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="font-medium text-sm">Otimização Sugerida</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Consolidar rotações pode economizar $12K em custos de viagem.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
