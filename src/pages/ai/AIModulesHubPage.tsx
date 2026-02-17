/**
 * Unified AI Modules Dashboard Page
 * Entry point for all 11 AI modules with quick access cards
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation, Shield, Package, Leaf, CheckSquare, FileText, 
  Heart, Users, BarChart3, Smartphone, Brain, Sparkles,
  ArrowRight, TrendingUp
} from 'lucide-react';

const aiModules = [
  {
    id: 'voyage',
    title: 'Voyage & Logistics AI',
    description: 'Otimização de rotas, operações portuárias, cargo tracking e bunker',
    icon: Navigation,
    status: 'active',
    route: '/ai/voyage-logistics',
    metrics: { accuracy: '99.5%', savings: '$45k/mês' },
    color: 'bg-blue-500'
  },
  {
    id: 'compliance',
    title: 'Compliance & Regulatory AI',
    description: 'SOLAS, MARPOL, MLC, ISM, ISPS - compliance automático',
    icon: CheckSquare,
    status: 'active',
    route: '/compliance-hub',
    metrics: { score: '98%', audits: '100% ready' },
    color: 'bg-purple-500'
  },
  {
    id: 'safety',
    title: 'Safety & Incident AI',
    description: 'Predição de incidentes, RCA automático, KPIs de segurança',
    icon: Shield,
    status: 'active',
    route: '/ai/safety-incident',
    metrics: { ltifr: '0.42', reduction: '-25%' },
    color: 'bg-red-500'
  },
  {
    id: 'inventory',
    title: 'Inventory & Spares AI',
    description: 'Previsão de demanda ML, reposição automática, ABC analysis',
    icon: Package,
    status: 'active',
    route: '/ai/inventory-spares',
    metrics: { savings: '$125k/ano', fill: '98.5%' },
    color: 'bg-orange-500'
  },
  {
    id: 'environmental',
    title: 'Environmental AI',
    description: 'Emissões, CII, EEXI, decarbonização, ballast water',
    icon: Leaf,
    status: 'active',
    route: '/esg-emissions',
    metrics: { cii: 'Rating B', reduction: '-15%' },
    color: 'bg-green-500'
  },
  {
    id: 'quality',
    title: 'Quality Management AI',
    description: 'NCR/CAPA automático, auditorias, melhoria contínua',
    icon: CheckSquare,
    status: 'active',
    route: '/quality-dashboard',
    metrics: { closeRate: '95%', effectiveness: '92%' },
    color: 'bg-teal-500'
  },
  {
    id: 'contract',
    title: 'Contract & Legal AI',
    description: 'CLM, análise de cláusulas, obrigações, assistente jurídico',
    icon: FileText,
    status: 'active',
    route: '/vessel-contracts',
    metrics: { contracts: '156', risk: 'Low' },
    color: 'bg-indigo-500'
  },
  {
    id: 'insurance',
    title: 'Insurance & Claims AI',
    description: 'Gestão de apólices, sinistros, verificação de cobertura',
    icon: Heart,
    status: 'active',
    route: '/finance-command',
    metrics: { policies: '24', claims: '3 open' },
    color: 'bg-pink-500'
  },
  {
    id: 'crewing',
    title: 'Crewing & Payroll AI',
    description: 'Rotações, folha de pagamento multi-moeda, MLC compliance',
    icon: Users,
    status: 'active',
    route: '/payroll',
    metrics: { crew: '450', compliance: '100%' },
    color: 'bg-cyan-500'
  },
  {
    id: 'reporting',
    title: 'Reporting & Analytics AI',
    description: 'Dashboards executivos, relatórios custom, insights AI',
    icon: BarChart3,
    status: 'active',
    route: '/analytics-command',
    metrics: { reports: '50+', kpis: '120' },
    color: 'bg-amber-500'
  },
  {
    id: 'mobile',
    title: 'Mobile & Offline AI',
    description: 'Apps offline-first, OCR, voice commands, sync',
    icon: Smartphone,
    status: 'active',
    route: '/settings',
    metrics: { offline: '100%', sync: 'Real-time' },
    color: 'bg-slate-500'
  }
];

export default function AIModulesHubPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>AI Modules Hub | Nauti One</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              AI Modules Hub
            </h1>
            <p className="text-muted-foreground">
              Centro de comando para todos os 11 módulos de inteligência artificial
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              11 Módulos Ativos
            </Badge>
            <Badge variant="default" className="text-lg px-4 py-2 bg-green-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              100% Operacional
            </Badge>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Economia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$750k/ano</div>
              <p className="text-xs text-muted-foreground">Via otimização AI</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Automação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">95%</div>
              <p className="text-xs text-muted-foreground">Processos automatizados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Decisões AI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,450</div>
              <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Precisão Média</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.2%</div>
              <p className="text-xs text-muted-foreground">Todos os módulos</p>
            </CardContent>
          </Card>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card 
                key={module.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(module.route)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${module.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-success border-success">
                      Ativo
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      {Object.entries(module.metrics).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <p className="text-lg font-bold">{value}</p>
                          <p className="text-xs text-muted-foreground capitalize">{key}</p>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Comandos frequentes para todos os módulos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate('/ai/voyage-logistics')}>
                🗺️ Otimizar Rota
              </Button>
              <Button variant="outline" onClick={() => navigate('/compliance-hub')}>
                📋 Verificar Compliance
              </Button>
              <Button variant="outline" onClick={() => navigate('/ai/safety-incident')}>
                🚨 Registrar Incidente
              </Button>
              <Button variant="outline" onClick={() => navigate('/ai/inventory-spares')}>
                📦 Verificar Estoque
              </Button>
              <Button variant="outline" onClick={() => navigate('/analytics-command')}>
                📊 Gerar Relatório
              </Button>
              <Button variant="outline" onClick={() => navigate('/payroll')}>
                💰 Calcular Folha
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
