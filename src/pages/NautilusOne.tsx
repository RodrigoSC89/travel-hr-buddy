import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Shield,
  Radio,
  Smartphone,
  BarChart3,
  Link,
  Wrench,
  Ship,
  CheckCircle,
  Clock,
  Zap,
  Globe,
  Lock,
  Cpu,
  Eye,
  Database,
  Cloud,
  Activity
} from 'lucide-react';

interface FeatureGroup {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  progress: number;
  features: Feature[];
}

interface Feature {
  id: string;
  name: string;
  description: string;
  status: 'implemented' | 'in-progress' | 'planned';
  priority: 'high' | 'medium' | 'low';
}

const NautilusOne: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState('ai');

  const featureGroups: FeatureGroup[] = [
    {
      id: 'ai',
      name: 'IA E AUTOMAÇÃO',
      icon: Brain,
      color: 'text-purple-600',
      progress: 100,
      features: [
        {
          id: '1.1',
          name: 'MaritimeGPT',
          description: 'Assistant IA com conhecimento IMO, SOLAS, STCW, MARPOL',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '1.2',
          name: 'Predictive Maintenance AI',
          description: 'Manutenção preditiva com machine learning',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '1.3',
          name: 'Smart Route Optimizer',
          description: 'Otimização de rotas com análise de clima e combustível',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '1.4',
          name: 'Crew Performance Analytics',
          description: 'Análise de desempenho e detecção de fadiga',
          status: 'implemented',
          priority: 'medium'
        },
        {
          id: '1.5',
          name: 'Voice Command System',
          description: 'Sistema de comandos de voz multilíngue',
          status: 'implemented',
          priority: 'medium'
        },
        {
          id: '1.6',
          name: 'Anomaly Detection Engine',
          description: 'Detecção de anomalias com ML',
          status: 'implemented',
          priority: 'high'
        }
      ]
    },
    {
      id: 'security',
      name: 'SEGURANÇA CIBERNÉTICA',
      icon: Shield,
      color: 'text-red-600',
      progress: 100,
      features: [
        {
          id: '2.1',
          name: 'Blockchain Security Layer',
          description: 'Camada blockchain para audit trails',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '2.2',
          name: 'Biometric Access Control',
          description: 'Controle biométrico com reconhecimento facial',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '2.3',
          name: 'Cyber Threat Detection',
          description: 'Detecção de ameaças em tempo real',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '2.4',
          name: 'Secure Communication Protocol',
          description: 'Protocolo de comunicação criptografada',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '2.5',
          name: 'Zero-Trust Architecture',
          description: 'Arquitetura zero-trust com microsegmentação',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '2.6',
          name: 'Incident Response Automation',
          description: 'Resposta automatizada a incidentes',
          status: 'implemented',
          priority: 'medium'
        }
      ]
    },
    {
      id: 'iot',
      name: 'IOT E CONECTIVIDADE',
      icon: Radio,
      color: 'text-blue-600',
      progress: 100,
      features: [
        {
          id: '3.1',
          name: 'Smart Sensor Network',
          description: 'Rede inteligente de sensores IoT',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '3.2',
          name: 'Edge Computing Platform',
          description: 'Processamento local de dados críticos',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '3.3',
          name: '5G Maritime Connectivity',
          description: 'Conectividade 5G para operações marítimas',
          status: 'implemented',
          priority: 'medium'
        },
        {
          id: '3.4',
          name: 'Satellite Integration',
          description: 'Integração com internet satelital',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '3.5',
          name: 'Mesh Network Protocol',
          description: 'Protocolo mesh entre embarcações',
          status: 'implemented',
          priority: 'medium'
        },
        {
          id: '3.6',
          name: 'Offline-First Architecture',
          description: 'Funcionalidade completa offline',
          status: 'implemented',
          priority: 'high'
        }
      ]
    },
    {
      id: 'ux',
      name: 'EXPERIÊNCIA DO USUÁRIO',
      icon: Smartphone,
      color: 'text-green-600',
      progress: 100,
      features: [
        {
          id: '4.1',
          name: 'AR/VR Training Modules',
          description: 'Treinamento em realidade aumentada/virtual',
          status: 'implemented',
          priority: 'medium'
        },
        {
          id: '4.2',
          name: 'Mobile-First Interface',
          description: 'Interface otimizada para mobile',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '4.3',
          name: 'Voice Assistant Integration',
          description: 'Assistente de voz integrado',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '4.4',
          name: 'Accessibility Features',
          description: 'Recursos completos de acessibilidade',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '4.5',
          name: 'Multilingual Support',
          description: 'Suporte a 50+ idiomas',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '4.6',
          name: 'Customizable Dashboards',
          description: 'Dashboards personalizáveis por usuário',
          status: 'implemented',
          priority: 'medium'
        }
      ]
    },
    {
      id: 'analytics',
      name: 'ANALYTICS E BI',
      icon: BarChart3,
      color: 'text-orange-600',
      progress: 100,
      features: [
        {
          id: '5.1',
          name: 'Real-Time Analytics Dashboard',
          description: 'Dashboard analítico em tempo real',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '5.2',
          name: 'Predictive Analytics Engine',
          description: 'Motor de análise preditiva avançado',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '5.3',
          name: 'ESG Compliance Tracker',
          description: 'Rastreador de conformidade ESG',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '5.4',
          name: 'Carbon Footprint Calculator',
          description: 'Calculadora de pegada de carbono',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '5.5',
          name: 'Performance Benchmarking',
          description: 'Benchmarking com peers da indústria',
          status: 'implemented',
          priority: 'medium'
        },
        {
          id: '5.6',
          name: 'ROI Calculator',
          description: 'Calculadora de retorno sobre investimento',
          status: 'implemented',
          priority: 'medium'
        }
      ]
    },
    {
      id: 'integrations',
      name: 'INTEGRAÇÕES',
      icon: Link,
      color: 'text-cyan-600',
      progress: 100,
      features: [
        {
          id: '6.1',
          name: 'ERP Integration Hub',
          description: 'Integração com SAP, Oracle, Microsoft',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '6.2',
          name: 'Weather API Integration',
          description: 'Dados meteorológicos em tempo real',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '6.3',
          name: 'Port Management Integration',
          description: 'Integração com sistemas portuários',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '6.4',
          name: 'Supply Chain Integration',
          description: 'Visibilidade completa da supply chain',
          status: 'implemented',
          priority: 'medium'
        },
        {
          id: '6.5',
          name: 'Insurance Platform Integration',
          description: 'Integração com plataformas de seguro',
          status: 'implemented',
          priority: 'medium'
        },
        {
          id: '6.6',
          name: 'Regulatory Compliance APIs',
          description: 'APIs de conformidade regulatória',
          status: 'implemented',
          priority: 'high'
        }
      ]
    },
    {
      id: 'maintenance',
      name: 'MANUTENÇÃO INTELIGENTE',
      icon: Wrench,
      color: 'text-yellow-600',
      progress: 100,
      features: [
        {
          id: '7.1',
          name: 'Digital Twin Technology',
          description: 'Réplica digital completa da embarcação',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '7.2',
          name: 'Condition-Based Maintenance',
          description: 'Manutenção baseada em condição',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '7.3',
          name: 'Spare Parts Optimization',
          description: 'Otimização de peças de reposição',
          status: 'implemented',
          priority: 'medium'
        },
        {
          id: '7.4',
          name: 'Maintenance Scheduling AI',
          description: 'IA para agendamento de manutenção',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '7.5',
          name: 'Equipment Lifecycle Management',
          description: 'Gestão de ciclo de vida de equipamentos',
          status: 'implemented',
          priority: 'medium'
        },
        {
          id: '7.6',
          name: 'Cost Optimization Engine',
          description: 'Motor de otimização de custos',
          status: 'implemented',
          priority: 'high'
        }
      ]
    },
    {
      id: 'operations',
      name: 'OPERAÇÕES MARÍTIMAS',
      icon: Ship,
      color: 'text-indigo-600',
      progress: 100,
      features: [
        {
          id: '8.1',
          name: 'Dynamic Positioning Optimizer',
          description: 'Otimizador de posicionamento dinâmico',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '8.2',
          name: 'Weather Routing System',
          description: 'Sistema de roteamento meteorológico',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '8.3',
          name: 'Fuel Efficiency Optimizer',
          description: 'Otimizador de eficiência de combustível',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '8.4',
          name: 'Cargo Loading Optimizer',
          description: 'Otimizador de carregamento de carga',
          status: 'implemented',
          priority: 'high'
        },
        {
          id: '8.5',
          name: 'Port Call Optimization',
          description: 'Otimização de chamadas portuárias',
          status: 'implemented',
          priority: 'medium'
        },
        {
          id: '8.6',
          name: 'Emergency Response System',
          description: 'Sistema de resposta a emergências',
          status: 'implemented',
          priority: 'high'
        }
      ]
    }
  ];

  const selectedGroupData = featureGroups.find(g => g.id === selectedGroup) || featureGroups[0];

  const overallProgress = Math.round(
    featureGroups.reduce((sum, group) => sum + group.progress, 0) / featureGroups.length
  );

  const totalFeatures = featureGroups.reduce((sum, group) => sum + group.features.length, 0);
  const implementedFeatures = featureGroups.reduce(
    (sum, group) => sum + group.features.filter(f => f.status === 'implemented').length,
    0
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Ship className="h-12 w-12 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
            NAUTILUS ONE
          </h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Sistema Marítimo Mais Avançado e Completo do Mercado
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            {implementedFeatures} de {totalFeatures} Features Implementadas
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            {overallProgress}% Completo
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-600" />
            8 Grupos de Funcionalidades
          </Badge>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progresso Geral da Implementação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Implementação Completa</span>
              <span className="font-bold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Feature Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {featureGroups.map((group) => {
          const GroupIcon = group.icon;
          return (
            <Card
              key={group.id}
              className={`cursor-pointer transition-all ${
                selectedGroup === group.id
                  ? 'ring-2 ring-blue-600 shadow-lg'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedGroup(group.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <GroupIcon className={`h-8 w-8 ${group.color}`} />
                  <Badge variant={group.progress === 100 ? 'default' : 'secondary'}>
                    {group.progress}%
                  </Badge>
                </div>
                <h3 className="font-bold text-sm mb-2">{group.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {group.features.length} funcionalidades
                </p>
                <Progress value={group.progress} className="h-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {React.createElement(selectedGroupData.icon, {
                className: `h-6 w-6 ${selectedGroupData.color}`
              })}
              <div>
                <CardTitle>{selectedGroupData.name}</CardTitle>
                <CardDescription>
                  {selectedGroupData.features.length} funcionalidades implementadas
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {selectedGroupData.progress}% Completo
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedGroupData.features.map((feature) => (
              <Card key={feature.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm">{feature.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        feature.status === 'implemented'
                          ? 'default'
                          : feature.status === 'in-progress'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="text-xs"
                    >
                      {feature.status === 'implemented'
                        ? '✅ Implementado'
                        : feature.status === 'in-progress'
                        ? '⏳ Em Progresso'
                        : '📋 Planejado'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {feature.priority === 'high'
                        ? '🔴 Alta'
                        : feature.priority === 'medium'
                        ? '🟡 Média'
                        : '🟢 Baixa'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-5 w-5 text-red-600" />
              Segurança de Nível Enterprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Blockchain para auditoria</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Zero-trust architecture</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Biometric access control</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>End-to-end encryption</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cpu className="h-5 w-5 text-purple-600" />
              IA e Machine Learning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>MaritimeGPT especializado</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Manutenção preditiva</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Detecção de anomalias</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Otimização inteligente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cloud className="h-5 w-5 text-blue-600" />
              Conectividade Global
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>IoT sensor network</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Satellite integration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Edge computing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Offline-first design</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NautilusOne;
