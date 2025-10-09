import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Ship, Users, BarChart3, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  requiredFor: string[];
}

interface OnboardingData {
  user_type: string;
  company_profile: any;
  preferences: any;
  completed_steps: string[];
}

const WelcomeStep: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
  const [userType, setUserType] = useState('');

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Bem-vindo ao Nautilus One!</h2>
          <p className="text-muted-foreground">
            Vamos configurar sua experiência personalizada em poucos passos
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Label htmlFor="user-type">Qual é sua função principal?</Label>
          <Select value={userType} onValueChange={setUserType}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecione sua função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador / Gestor</SelectItem>
              <SelectItem value="hr">Recursos Humanos</SelectItem>
              <SelectItem value="captain">Comandante / Oficial</SelectItem>
              <SelectItem value="operator">Operador / Técnico</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="mt-6 space-y-3">
            <div className="text-sm font-medium">O que você poderá fazer:</div>
            {userType === 'admin' && (
              <div className="space-y-2">
                <Badge variant="secondary">📊 Dashboards executivos</Badge>
                <Badge variant="secondary">⚙️ Configurações de automação</Badge>
                <Badge variant="secondary">👥 Gestão de usuários</Badge>
              </div>
            )}
            {userType === 'hr' && (
              <div className="space-y-2">
                <Badge variant="secondary">👥 Gestão de tripulação</Badge>
                <Badge variant="secondary">📋 Certificações marítimas</Badge>
                <Badge variant="secondary">📅 Escalas e folha de ponto</Badge>
              </div>
            )}
            {userType === 'captain' && (
              <div className="space-y-2">
                <Badge variant="secondary">🚢 Operações da embarcação</Badge>
                <Badge variant="secondary">✅ Checklists PEOTRAM</Badge>
                <Badge variant="secondary">📡 Comunicação marítima</Badge>
              </div>
            )}
            {userType === 'operator' && (
              <div className="space-y-2">
                <Badge variant="secondary">✅ Checklists operacionais</Badge>
                <Badge variant="secondary">📝 Relatórios de atividade</Badge>
                <Badge variant="secondary">💬 Comunicação em tempo real</Badge>
              </div>
            )}
          </div>

          <Button 
            className="w-full mt-6" 
            onClick={() => onNext({ user_type: userType })}
            disabled={!userType}
          >
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const CompanyProfileStep: React.FC<{ data: any; onNext: (data: any) => void }> = ({ data, onNext }) => {
  const [profile, setProfile] = useState({
    company_type: '',
    fleet_size: '',
    primary_operations: [],
    key_challenges: []
  });

  const operationTypes = [
    'Transporte de carga',
    'Transporte de passageiros', 
    'Operações portuárias',
    'Pesca comercial',
    'Offshore/Petróleo',
    'Turismo náutico',
    'Rebocadores',
    'Embarcações de apoio'
  ];

  const challenges = [
    'Gestão de certificações',
    'Controle de escalas',
    'Compliance marítimo',
    'Otimização de custos',
    'Comunicação da frota',
    'Manutenção preventiva',
    'Relatórios regulatórios',
    'Gestão de tripulação'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Perfil da Empresa</h2>
        <p className="text-muted-foreground">
          Essas informações nos ajudam a personalizar suas automações
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label>Tipo de operação marítima</Label>
          <Select value={profile.company_type} onValueChange={(value) => 
            setProfile(prev => ({ ...prev, company_type: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo principal" />
            </SelectTrigger>
            <SelectContent>
              {operationTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tamanho da frota</Label>
          <Select value={profile.fleet_size} onValueChange={(value) => 
            setProfile(prev => ({ ...prev, fleet_size: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Quantas embarcações?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">1-5 embarcações</SelectItem>
              <SelectItem value="medium">6-20 embarcações</SelectItem>
              <SelectItem value="large">21-50 embarcações</SelectItem>
              <SelectItem value="enterprise">50+ embarcações</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Principais desafios (selecione até 3)</Label>
          <div className="grid grid-cols-2 gap-2">
            {challenges.map(challenge => (
              <Button
                key={challenge}
                variant={profile.key_challenges.includes(challenge) ? "default" : "outline"}
                size="sm"
                className="justify-start"
                onClick={() => {
                  setProfile(prev => ({
                    ...prev,
                    key_challenges: prev.key_challenges.includes(challenge)
                      ? prev.key_challenges.filter(c => c !== challenge)
                      : prev.key_challenges.length < 3 
                        ? [...prev.key_challenges, challenge]
                        : prev.key_challenges
                  }));
                }}
              >
                {challenge}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Button 
        className="w-full" 
        onClick={() => onNext({ company_profile: profile })}
        disabled={!profile.company_type || !profile.fleet_size}
      >
        Continuar
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

const ModuleRecommendationStep: React.FC<{ data: any; onNext: (data: any) => void }> = ({ data, onNext }) => {
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const getRecommendedModules = () => {
    const { user_type, company_profile } = data;
    const modules = [];

    // Módulos baseados no tipo de usuário
    if (user_type === 'admin') {
      modules.push('analytics', 'automation', 'reports');
    }
    if (user_type === 'hr') {
      modules.push('hr_management', 'certificates', 'crew_scheduling');
    }
    if (user_type === 'captain' || user_type === 'operator') {
      modules.push('peotram', 'communication', 'fleet_tracking');
    }

    // Módulos baseados no perfil da empresa
    if (company_profile?.key_challenges?.includes('Gestão de certificações')) {
      modules.push('certificates', 'alerts');
    }
    if (company_profile?.key_challenges?.includes('Controle de escalas')) {
      modules.push('crew_scheduling', 'hr_management');
    }
    if (company_profile?.key_challenges?.includes('Compliance marítimo')) {
      modules.push('peotram', 'documentation');
    }

    return [...new Set(modules)];
  };

  const moduleInfo = {
    analytics: { name: 'Analytics Avançado', icon: BarChart3, description: 'Dashboards e métricas em tempo real' },
    automation: { name: 'Automações IA', icon: Sparkles, description: 'Workflows inteligentes e sugestões automáticas' },
    reports: { name: 'Relatórios Automáticos', icon: Calendar, description: 'Relatórios periódicos por email' },
    hr_management: { name: 'Gestão de RH', icon: Users, description: 'Gestão completa de tripulação' },
    certificates: { name: 'Certificações', icon: CheckCircle, description: 'Controle de certificados marítimos' },
    crew_scheduling: { name: 'Escalas Inteligentes', icon: Calendar, description: 'Geração automática de escalas' },
    peotram: { name: 'PEOTRAM', icon: CheckCircle, description: 'Auditorias e checklists marítimos' },
    communication: { name: 'Comunicação', icon: Ship, description: 'Chat e alertas em tempo real' },
    fleet_tracking: { name: 'Rastreamento', icon: Ship, description: 'Monitoramento de embarcações' },
    alerts: { name: 'Alertas Inteligentes', icon: Sparkles, description: 'Notificações proativas' },
    documentation: { name: 'Documentação', icon: CheckCircle, description: 'Gestão de documentos marítimos' }
  };

  const recommendedModules = getRecommendedModules();

  useEffect(() => {
    setSelectedModules(recommendedModules);
  }, [recommendedModules]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Módulos Recomendados</h2>
        <p className="text-muted-foreground">
          Baseado no seu perfil, recomendamos estes módulos para começar
        </p>
      </div>

      <div className="grid gap-3">
        {Object.entries(moduleInfo).map(([key, module]) => {
          const Icon = module.icon;
          const isRecommended = recommendedModules.includes(key);
          const isSelected = selectedModules.includes(key);
          
          return (
            <Card 
              key={key}
              className={`cursor-pointer transition-colors ${
                isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
              }`}
              onClick={() => {
                setSelectedModules(prev => 
                  prev.includes(key) 
                    ? prev.filter(m => m !== key)
                    : [...prev, key]
                );
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{module.name}</h3>
                      {isRecommended && <Badge variant="secondary" className="text-xs">Recomendado</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                  <CheckCircle className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button 
        className="w-full" 
        onClick={() => onNext({ preferences: { enabled_modules: selectedModules } })}
        disabled={selectedModules.length === 0}
      >
        Finalizar Configuração
        <CheckCircle className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export const SmartOnboardingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    user_type: '',
    company_profile: {},
    preferences: {},
    completed_steps: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo',
      description: 'Vamos conhecer você',
      component: WelcomeStep,
      requiredFor: ['all']
    },
    {
      id: 'company_profile',
      title: 'Perfil da Empresa',
      description: 'Configuração personalizada',
      component: CompanyProfileStep,
      requiredFor: ['admin', 'hr']
    },
    {
      id: 'module_recommendation',
      title: 'Módulos Recomendados',
      description: 'Ative as funcionalidades',
      component: ModuleRecommendationStep,
      requiredFor: ['all']
    }
  ];

  const handleStepComplete = async (stepData: any) => {
    const updatedData = { ...onboardingData, ...stepData };
    setOnboardingData(updatedData);

    const currentStepId = steps[currentStep].id;
    updatedData.completed_steps = [...updatedData.completed_steps, currentStepId];

    // Salvar progresso no banco
    try {
      await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          current_step: currentStep < steps.length - 1 ? steps[currentStep + 1].id : 'completed',
          completed_steps: updatedData.completed_steps,
          user_type: updatedData.user_type,
          company_profile: updatedData.company_profile,
          preferences: updatedData.preferences,
          is_completed: currentStep === steps.length - 1
        });
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Onboarding concluído
      await generateWelcomeAutomations(updatedData);
      toast({
        title: "Configuração concluída! 🎉",
        description: "Seu Nautilus One está pronto. Automações personalizadas foram ativadas.",
      });
    }
  };

  const generateWelcomeAutomations = async (data: OnboardingData) => {
    setIsLoading(true);
    try {
      // Criar automações baseadas no perfil do usuário
      const automations = [];

      if (data.company_profile.key_challenges?.includes('Gestão de certificações')) {
        automations.push({
          name: 'Alerta de Certificados Vencendo',
          description: 'Notificação automática 30 dias antes do vencimento',
          trigger_type: 'schedule',
          trigger_config: { cron: '0 9 * * *' },
          actions: [
            { type: 'check_certificates', days_ahead: 30 },
            { type: 'send_notification', template: 'certificate_expiry' }
          ]
        });
      }

      if (data.user_type === 'admin') {
        automations.push({
          name: 'Relatório Semanal Executivo',
          description: 'Resumo das principais métricas toda segunda-feira',
          trigger_type: 'schedule',
          trigger_config: { cron: '0 8 * * MON' },
          actions: [
            { type: 'generate_report', report_type: 'executive_summary' },
            { type: 'email_report', format: 'pdf' }
          ]
        });
      }

      // Salvar automações no banco
      for (const automation of automations) {
        await supabase.from('automation_workflows').insert({
          ...automation,
          organization_id: (await supabase.auth.getUser()).data.user?.id // Temporário para demo
        });
      }

    } catch (error) {
      console.error('Erro ao criar automações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Configurando automações personalizadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Configuração Inicial</h1>
            <p className="text-muted-foreground">
              Passo {currentStep + 1} de {steps.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{Math.round(progress)}% concluído</div>
          </div>
        </div>
        
        <Progress value={progress} className="w-full" />

        <div className="flex justify-between text-sm">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`text-center ${
                index <= currentStep ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="font-medium">{step.title}</div>
              <div className="text-xs">{step.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step */}
      <CurrentStepComponent 
        data={onboardingData}
        onNext={handleStepComplete}
      />
    </div>
  );
};