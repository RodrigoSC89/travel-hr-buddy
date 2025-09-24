import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays, 
  Target, 
  TrendingUp, 
  Globe, 
  Zap,
  Shield,
  Users,
  Briefcase,
  MapPin,
  DollarSign
} from 'lucide-react';

interface RoadmapItem {
  id: string;
  quarter: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'core' | 'expansion' | 'monetization' | 'innovation';
  estimatedValue: string;
  dependencies?: string[];
  resources: number;
  status: 'planned' | 'in-progress' | 'completed';
}

export const ProductRoadmap = () => {
  const roadmapItems: RoadmapItem[] = [
    {
      id: '1',
      quarter: 'Q1 2025',
      title: 'API Pública & Marketplace',
      description: 'Lançamento da API RESTful documentada com autenticação OAuth2 e marketplace de extensões.',
      priority: 'high',
      category: 'core',
      estimatedValue: 'R$ 2.5M ARR',
      resources: 8,
      status: 'in-progress'
    },
    {
      id: '2',
      quarter: 'Q1 2025',
      title: 'Mobile App Nativo',
      description: 'Aplicativo iOS/Android com modo offline para operações em alto mar.',
      priority: 'high',
      category: 'expansion',
      estimatedValue: '40% aumento engajamento',
      resources: 12,
      status: 'planned'
    },
    {
      id: '3',
      quarter: 'Q2 2025',
      title: 'BI Avançado & Previsões',
      description: 'Dashboards preditivos com ML para otimização de rotas e recursos.',
      priority: 'high',
      category: 'innovation',
      estimatedValue: '25% redução custos',
      resources: 6,
      status: 'planned'
    },
    {
      id: '4',
      quarter: 'Q2 2025',
      title: 'Segmento Offshore',
      description: 'Módulos especializados para plataformas petrolíferas e energia offshore.',
      priority: 'medium',
      category: 'expansion',
      estimatedValue: 'R$ 5M TAM',
      resources: 10,
      status: 'planned'
    },
    {
      id: '5',
      quarter: 'Q3 2025',
      title: 'White-Label Enterprise',
      description: 'Solução white-label para grandes armadores e operadores portuários.',
      priority: 'high',
      category: 'monetization',
      estimatedValue: 'R$ 10M ARR',
      resources: 15,
      status: 'planned'
    },
    {
      id: '6',
      quarter: 'Q3 2025',
      title: 'Compliance Automático',
      description: 'Integração com IMO, ANTAQ e outras autoridades para compliance automático.',
      priority: 'high',
      category: 'core',
      estimatedValue: '80% redução tempo compliance',
      resources: 8,
      status: 'planned'
    },
    {
      id: '7',
      quarter: 'Q4 2025',
      title: 'Turismo Náutico',
      description: 'Módulos para iates, turismo náutico e embarcações de recreio.',
      priority: 'medium',
      category: 'expansion',
      estimatedValue: 'R$ 3M TAM',
      resources: 6,
      status: 'planned'
    },
    {
      id: '8',
      quarter: 'Q4 2025',
      title: 'IA Copiloto Avançado',
      description: 'Assistente IA com processamento de linguagem natural e automação complexa.',
      priority: 'high',
      category: 'innovation',
      estimatedValue: '50% redução tempo operacional',
      resources: 12,
      status: 'planned'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-danger text-danger-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-info text-info-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return <Shield className="h-4 w-4" />;
      case 'expansion': return <Globe className="h-4 w-4" />;
      case 'monetization': return <DollarSign className="h-4 w-4" />;
      case 'innovation': return <Zap className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'in-progress': return 'bg-warning text-warning-foreground';
      case 'planned': return 'bg-info text-info-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const totalValue = 'R$ 20.5M';
  const totalResources = roadmapItems.reduce((sum, item) => sum + item.resources, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Roadmap Estratégico 2025
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{roadmapItems.length}</div>
              <div className="text-sm text-muted-foreground">Iniciativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{totalValue}</div>
              <div className="text-sm text-muted-foreground">Valor Total Estimado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{totalResources}</div>
              <div className="text-sm text-muted-foreground">Recursos Necessários</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">12</div>
              <div className="text-sm text-muted-foreground">Meses de Execução</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap Timeline */}
      <div className="grid grid-cols-1 gap-6">
        {['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'].map((quarter) => {
          const quarterItems = roadmapItems.filter(item => item.quarter === quarter);
          
          return (
            <Card key={quarter} className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {quarter}
                  </div>
                  <Badge variant="outline">
                    {quarterItems.length} iniciativas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quarterItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover-lift">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(item.category)}
                          <h4 className="font-semibold">{item.title}</h4>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-success" />
                            Valor:
                          </span>
                          <span className="font-medium text-success">
                            {item.estimatedValue}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-info" />
                            Recursos:
                          </span>
                          <span className="font-medium">
                            {item.resources} pessoas
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Monetization Models */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-success" />
            Modelos de Monetização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">SaaS Premium</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Funcionalidades avançadas de IA, BI e automação.
              </p>
              <div className="text-lg font-bold text-success">R$ 2.500/mês</div>
              <div className="text-sm text-muted-foreground">por embarcação</div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">White-Label Enterprise</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Solução customizada para grandes operadores.
              </p>
              <div className="text-lg font-bold text-success">R$ 50.000</div>
              <div className="text-sm text-muted-foreground">setup + R$ 15.000/mês</div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Marketplace de APIs</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Revenue share com desenvolvedores terceiros.
              </p>
              <div className="text-lg font-bold text-success">30%</div>
              <div className="text-sm text-muted-foreground">comissão por transação</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};