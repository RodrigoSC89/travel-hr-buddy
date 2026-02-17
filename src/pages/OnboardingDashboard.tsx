/**
 * Onboarding Dashboard Page
 * Checklist guiado para novos clientes
 * Templates por tipo de embarcação
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle2, 
  Circle, 
  Ship, 
  Users, 
  FileText, 
  Shield, 
  Settings,
  Play,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Video,
  BookOpen,
  HelpCircle,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

// Vessel Type Templates
const VESSEL_TEMPLATES = [
  {
    id: 'ahts',
    name: 'AHTS',
    fullName: 'Anchor Handling Tug Supply',
    description: 'Configuração padrão para embarcações AHTS',
    icon: '⚓',
    modules: ['crew', 'maintenance', 'safety', 'logistics', 'compliance'],
    complianceStandards: ['PEOTRAM', 'MLC 2006', 'ISM', 'ISPS'],
  },
  {
    id: 'plsv',
    name: 'PLSV',
    fullName: 'Pipe-Laying Support Vessel',
    description: 'Configuração para PLSVs e instalação submarina',
    icon: '🚢',
    modules: ['crew', 'maintenance', 'safety', 'logistics', 'compliance', 'rov'],
    complianceStandards: ['PEOTRAM', 'PEO-DP', 'MLC 2006', 'ISM'],
  },
  {
    id: 'rov',
    name: 'ROV Support',
    fullName: 'ROV Support Vessel',
    description: 'Para embarcações de suporte ROV',
    icon: '🤖',
    modules: ['crew', 'maintenance', 'safety', 'rov', 'compliance'],
    complianceStandards: ['PEOTRAM', 'MLC 2006', 'ISM'],
  },
  {
    id: 'drillship',
    name: 'Drill Ship',
    fullName: 'Drilling Vessel',
    description: 'Configuração completa para sondas',
    icon: '🛢️',
    modules: ['crew', 'maintenance', 'safety', 'logistics', 'compliance', 'drilling'],
    complianceStandards: ['PEOTRAM', 'PEO-DP', 'MLC 2006', 'ISM', 'MARPOL'],
  },
  {
    id: 'psv',
    name: 'PSV',
    fullName: 'Platform Supply Vessel',
    description: 'Para embarcações de suprimento',
    icon: '📦',
    modules: ['crew', 'maintenance', 'safety', 'logistics'],
    complianceStandards: ['PEOTRAM', 'MLC 2006', 'ISM'],
  },
];

// Onboarding Checklist
const ONBOARDING_STEPS = [
  {
    id: 'company',
    category: 'Configuração Inicial',
    title: 'Dados da Empresa',
    description: 'Configure as informações básicas da sua empresa',
    route: '/settings/organization',
    duration: '5 min',
    required: true,
  },
  {
    id: 'vessel',
    category: 'Configuração Inicial',
    title: 'Cadastrar Embarcação',
    description: 'Adicione sua primeira embarcação ao sistema',
    route: '/fleet-manager',
    duration: '10 min',
    required: true,
  },
  {
    id: 'crew',
    category: 'Tripulação',
    title: 'Cadastrar Tripulantes',
    description: 'Importe ou cadastre sua tripulação',
    route: '/crew-management',
    duration: '15 min',
    required: true,
  },
  {
    id: 'documents',
    category: 'Tripulação',
    title: 'Documentos e Certificados',
    description: 'Upload de documentos e certificações',
    route: '/document-hub',
    duration: '20 min',
    required: false,
  },
  {
    id: 'compliance',
    category: 'Compliance',
    title: 'Configurar Compliance',
    description: 'Ativar padrões PEOTRAM, PEO-DP e MLC',
    route: '/compliance-center',
    duration: '10 min',
    required: true,
  },
  {
    id: 'payroll',
    category: 'RH',
    title: 'Configurar Folha de Pagamento',
    description: 'Configure impostos e benefícios',
    route: '/folha-pagamento',
    duration: '15 min',
    required: false,
  },
  {
    id: 'users',
    category: 'Acesso',
    title: 'Convidar Usuários',
    description: 'Adicione outros usuários ao sistema',
    route: '/admin/users',
    duration: '5 min',
    required: false,
  },
  {
    id: 'mobile',
    category: 'Acesso',
    title: 'Instalar App Mobile',
    description: 'Configure o PWA nos dispositivos da tripulação',
    route: '/install',
    duration: '5 min',
    required: false,
  },
];

const VIDEO_TUTORIALS = [
  {
    id: 'intro',
    title: 'Introdução ao Nauti One',
    duration: '5:00',
    thumbnail: '🎬',
  },
  {
    id: 'crew',
    title: 'Gestão de Tripulação',
    duration: '8:00',
    thumbnail: '👥',
  },
  {
    id: 'compliance',
    title: 'PEOTRAM e Compliance',
    duration: '12:00',
    thumbnail: '✅',
  },
  {
    id: 'ai',
    title: 'Usando a IA do Nauti One',
    duration: '7:00',
    thumbnail: '🤖',
  },
];

export default function OnboardingDashboard() {
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('checklist');

  // Load completed steps from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nauti-onboarding-progress');
    if (saved) {
      setCompletedSteps(JSON.parse(saved));
    }
  }, []);

  // Save progress
  const toggleStep = (stepId: string) => {
    const newCompleted = completedSteps.includes(stepId)
      ? completedSteps.filter(id => id !== stepId)
      : [...completedSteps, stepId];
    
    setCompletedSteps(newCompleted);
    localStorage.setItem('nauti-onboarding-progress', JSON.stringify(newCompleted));
    
    if (!completedSteps.includes(stepId)) {
      toast.success('Etapa concluída!');
    }
  };

  const progress = (completedSteps.length / ONBOARDING_STEPS.length) * 100;
  const requiredSteps = ONBOARDING_STEPS.filter(s => s.required);
  const requiredCompleted = requiredSteps.filter(s => completedSteps.includes(s.id)).length;

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = VESSEL_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      toast.success(`Template ${template.name} aplicado! Módulos: ${template.modules.join(', ')}`);
    }
  };

  const groupedSteps = ONBOARDING_STEPS.reduce((acc, step) => {
    if (!acc[step.category]) {
      acc[step.category] = [];
    }
    acc[step.category].push(step);
    return acc;
  }, {} as Record<string, typeof ONBOARDING_STEPS>);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Bem-vindo ao Nauti One!</span>
          </div>
          <h1 className="text-4xl font-bold">Configuração Inicial</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Complete as etapas abaixo para configurar sua operação marítima. 
            Estimativa: 45-60 minutos para configuração completa.
          </p>
        </div>

        {/* Progress Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Seu Progresso</h3>
                <p className="text-sm text-muted-foreground">
                  {completedSteps.length} de {ONBOARDING_STEPS.length} etapas concluídas
                </p>
              </div>
              <Badge variant={progress === 100 ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                {Math.round(progress)}%
              </Badge>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{requiredCompleted}/{requiredSteps.length} obrigatórias</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>~{(ONBOARDING_STEPS.length - completedSteps.length) * 10} min restantes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="checklist" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Ship className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Tutoriais
            </TabsTrigger>
          </TabsList>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-6">
            {Object.entries(groupedSteps).map(([category, steps]) => (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {category === 'Configuração Inicial' && <Settings className="h-5 w-5" />}
                    {category === 'Tripulação' && <Users className="h-5 w-5" />}
                    {category === 'Compliance' && <Shield className="h-5 w-5" />}
                    {category === 'RH' && <FileText className="h-5 w-5" />}
                    {category === 'Acesso' && <Zap className="h-5 w-5" />}
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {steps.map((step) => {
                    const isCompleted = completedSteps.includes(step.id);
                    return (
                      <div
                        key={step.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          isCompleted ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleStep(step.id)}
                            className="flex-shrink-0"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-6 w-6 text-green-500" />
                            ) : (
                              <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                {step.title}
                              </h4>
                              {step.required && (
                                <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {step.duration}
                          </span>
                          <Button
                            variant={isCompleted ? 'ghost' : 'default'}
                            size="sm"
                            onClick={() => navigate(step.route)}
                          >
                            {isCompleted ? 'Revisar' : 'Iniciar'}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Templates por Tipo de Embarcação</CardTitle>
                <CardDescription>
                  Selecione um template para configurar automaticamente módulos e padrões de compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {VESSEL_TEMPLATES.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => applyTemplate(template.id)}
                    >
                      <CardContent className="pt-6">
                        <div className="text-center space-y-3">
                          <div className="text-4xl">{template.icon}</div>
                          <div>
                            <h3 className="font-bold text-lg">{template.name}</h3>
                            <p className="text-xs text-muted-foreground">{template.fullName}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {template.complianceStandards.map((std) => (
                              <Badge key={std} variant="secondary" className="text-xs">
                                {std}
                              </Badge>
                            ))}
                          </div>
                          {selectedTemplate === template.id && (
                            <Badge className="mt-2">Selecionado ✓</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tutorials Tab */}
          <TabsContent value="tutorials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Vídeos de Treinamento
                </CardTitle>
                <CardDescription>
                  Assista aos tutoriais para dominar o Nauti One rapidamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {VIDEO_TUTORIALS.map((video) => (
                    <Card key={video.id} className="hover:bg-muted/50 cursor-pointer transition-colors">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-3xl">
                          {video.thumbnail}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{video.title}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {video.duration}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Documentação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/docs')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Guia do Usuário
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/docs/api')}>
                  <Zap className="h-4 w-4 mr-2" />
                  Documentação da API
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/docs/compliance')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Guia de Compliance
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-6 text-center">
                <HelpCircle className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Precisa de Ajuda?</h3>
                <p className="text-muted-foreground mb-4">
                  Nossa equipe está pronta para ajudar você a configurar o sistema
                </p>
                <Button onClick={() => window.open('mailto:suporte@nautione.com.br')}>
                  Falar com Suporte
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        {progress < 100 && (
          <Card className="border-dashed">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Próximo Passo</h3>
                  <p className="text-sm text-muted-foreground">
                    {ONBOARDING_STEPS.find(s => !completedSteps.includes(s.id))?.title}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    const nextStep = ONBOARDING_STEPS.find(s => !completedSteps.includes(s.id));
                    if (nextStep) navigate(nextStep.route);
                  }}
                >
                  Continuar Setup
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {progress === 100 && (
          <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CardContent className="py-8 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">🎉 Configuração Concluída!</h2>
              <p className="text-muted-foreground mb-6">
                Seu sistema está pronto para uso. Explore todos os módulos do Nauti One.
              </p>
              <Button size="lg" onClick={() => navigate('/command')}>
                Ir para o Command Center
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
