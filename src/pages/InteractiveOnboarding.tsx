/**
 * Interactive Onboarding Wizard
 * Go-Live Day 5: Enhanced onboarding with guided tour
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Circle, 
  Ship, 
  Users, 
  FileText, 
  Shield, 
  Settings,
  Play,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Rocket,
  Target,
  Zap,
  BookOpen,
  Video,
  MessageSquare,
  Navigation,
  BarChart3,
  Wrench,
  DollarSign,
  ClipboardCheck
} from 'lucide-react';
import { toast } from 'sonner';

// Module definitions for the tour
const MODULES = [
  {
    id: 'command-center',
    name: 'Central de Comando',
    description: 'Visão 360° de toda a operação em tempo real',
    icon: Navigation,
    route: '/central-comando/visao-geral',
    color: 'from-primary to-info',
    features: ['Dashboard em tempo real', 'KPIs operacionais', 'Alertas críticos'],
    estimatedTime: '2 min',
  },
  {
    id: 'fleet',
    name: 'Gestão de Frota',
    description: 'Monitore todas as embarcações em um só lugar',
    icon: Ship,
    route: '/fleet-manager',
    color: 'from-success to-info',
    features: ['Digital Twin 3D', 'Tracking GPS', 'Sensores IoT'],
    estimatedTime: '5 min',
  },
  {
    id: 'crew',
    name: 'RH Marítimo',
    description: 'Gestão completa de tripulação e documentos',
    icon: Users,
    route: '/crew-management',
    color: 'from-secondary to-accent',
    features: ['Cadastro de tripulantes', 'Certificações', 'Escalas'],
    estimatedTime: '10 min',
  },
  {
    id: 'compliance',
    name: 'PEOTRAM / Compliance',
    description: 'Conformidade com MLC 2006, STCW, ISM',
    icon: Shield,
    route: '/peotram',
    color: 'from-warning to-warning',
    features: ['Auditorias automatizadas', 'Geração de evidências', 'Relatórios'],
    estimatedTime: '8 min',
  },
  {
    id: 'maintenance',
    name: 'Manutenção Inteligente',
    description: 'MMI com IA preditiva para manutenção',
    icon: Wrench,
    route: '/mmi-dashboard',
    color: 'from-destructive to-accent',
    features: ['Manutenção preditiva', 'Ordens de serviço', 'Inventário'],
    estimatedTime: '5 min',
  },
  {
    id: 'finance',
    name: 'Financeiro',
    description: 'Folha de pagamento e controle de custos',
    icon: DollarSign,
    route: '/folha-pagamento',
    color: 'from-success to-success/80',
    features: ['Folha automática', 'Relatórios fiscais', 'Benefícios'],
    estimatedTime: '5 min',
  },
];

// Quick actions for new users
const QUICK_ACTIONS = [
  {
    id: 'add-vessel',
    title: 'Adicionar Embarcação',
    description: 'Cadastre sua primeira embarcação',
    icon: Ship,
    route: '/fleet-manager?action=add',
    priority: 1,
  },
  {
    id: 'add-crew',
    title: 'Cadastrar Tripulantes',
    description: 'Importe ou adicione tripulantes',
    icon: Users,
    route: '/crew-management?action=import',
    priority: 2,
  },
  {
    id: 'start-audit',
    title: 'Iniciar Auditoria',
    description: 'Configure o primeiro PEOTRAM',
    icon: ClipboardCheck,
    route: '/peotram/new-audit',
    priority: 3,
  },
  {
    id: 'ai-assistant',
    title: 'Conhecer a IA',
    description: 'Converse com o assistente Nauti',
    icon: MessageSquare,
    route: '/central-comando/ia',
    priority: 4,
  },
];

export default function InteractiveOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedModules, setVisitedModules] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nauti-interactive-onboarding');
    if (saved) {
      const data = JSON.parse(saved);
      setVisitedModules(data.visitedModules || []);
      setShowWelcome(data.showWelcome !== false);
    }
  }, []);

  // Save progress
  const saveProgress = (modules: string[]) => {
    localStorage.setItem('nauti-interactive-onboarding', JSON.stringify({
      visitedModules: modules,
      showWelcome: false,
      lastVisit: new Date().toISOString(),
    }));
  };

  const handleModuleClick = (moduleId: string, route: string) => {
    if (!visitedModules.includes(moduleId)) {
      const newVisited = [...visitedModules, moduleId];
      setVisitedModules(newVisited);
      saveProgress(newVisited);
      toast.success(`Módulo "${MODULES.find(m => m.id === moduleId)?.name}" explorado!`);
    }
    navigate(route);
  };

  const progress = (visitedModules.length / MODULES.length) * 100;
  const isComplete = visitedModules.length === MODULES.length;

  const nextStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, MODULES.length - 1));
      setIsAnimating(false);
    }, 200);
  };

  const prevStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.max(prev - 1, 0));
      setIsAnimating(false);
    }, 200);
  };

  const startTour = () => {
    setShowWelcome(false);
    saveProgress(visitedModules);
  };

  // Welcome Screen
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-2 border-primary/20 shadow-2xl">
            <CardContent className="pt-12 pb-8 px-8 text-center space-y-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-lg shadow-primary/30"
              >
                <Rocket className="h-12 w-12 text-primary-foreground" />
              </motion.div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Bem-vindo ao Nauti One! 🚢
                </h1>
                <p className="text-xl text-muted-foreground">
                  A plataforma completa de gestão marítima com IA integrada
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Módulos</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">IA Ativa</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Compliance</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Vamos fazer um tour rápido pelos principais módulos?
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={startTour}
                    className="gap-2 px-8"
                  >
                    <Play className="h-5 w-5" />
                    Começar Tour
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/central-comando/visao-geral')}
                  >
                    Pular Tour
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Main Tour Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Tour Interativo
            </h1>
            <p className="text-muted-foreground">
              Explore os módulos do Nauti One
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Progresso</div>
              <div className="text-lg font-bold">{Math.round(progress)}%</div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/central-comando/visao-geral')}
            >
              Ir para Dashboard
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Progress value={progress} className="flex-1 h-3" />
              <Badge variant={isComplete ? 'default' : 'secondary'}>
                {visitedModules.length}/{MODULES.length} módulos
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Module Carousel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`border-2 ${visitedModules.includes(MODULES[currentStep].id) ? 'border-green-500/50' : 'border-primary/20'}`}>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Module Info */}
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${MODULES[currentStep].color} flex items-center justify-center shadow-lg`}>
                          {(() => {
                            const Icon = MODULES[currentStep].icon;
                            return <Icon className="h-8 w-8 text-white" />;
                          })()}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{MODULES[currentStep].name}</h2>
                          <p className="text-muted-foreground">{MODULES[currentStep].description}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Principais Funcionalidades
                        </h3>
                        <ul className="space-y-2">
                          {MODULES[currentStep].features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Zap className="h-4 w-4" />
                          Tempo estimado: {MODULES[currentStep].estimatedTime}
                        </div>
                      </div>

                      <Button
                        size="lg"
                        className="w-full gap-2"
                        onClick={() => handleModuleClick(MODULES[currentStep].id, MODULES[currentStep].route)}
                      >
                        {visitedModules.includes(MODULES[currentStep].id) ? (
                          <>
                            <CheckCircle2 className="h-5 w-5" />
                            Visitar Novamente
                          </>
                        ) : (
                          <>
                            <ArrowRight className="h-5 w-5" />
                            Explorar Módulo
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Right: Module Preview */}
                    <div className="hidden md:flex items-center justify-center">
                      <div className={`w-full aspect-video rounded-xl bg-gradient-to-br ${MODULES[currentStep].color} opacity-20 flex items-center justify-center`}>
                        {(() => {
                          const Icon = MODULES[currentStep].icon;
                          return <Icon className="h-24 w-24 text-primary" />;
                        })()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12">
            <Button
              variant="outline"
              size="icon"
              onClick={prevStep}
              disabled={currentStep === 0 || isAnimating}
              className="rounded-full shadow-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12">
            <Button
              variant="outline"
              size="icon"
              onClick={nextStep}
              disabled={currentStep === MODULES.length - 1 || isAnimating}
              className="rounded-full shadow-lg"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Module Dots */}
        <div className="flex justify-center gap-2">
          {MODULES.map((module, i) => (
            <button
              key={module.id}
              onClick={() => setCurrentStep(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentStep
                  ? 'bg-primary scale-125'
                  : visitedModules.includes(module.id)
                  ? 'bg-green-500'
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Card
                key={action.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(action.route)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Completion Card */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2 border-green-500/50 bg-green-500/5">
              <CardContent className="py-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">🎉 Tour Completo!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Você explorou todos os módulos principais do Nauti One.
                  Agora está pronto para gerenciar sua operação marítima!
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate('/central-comando/visao-geral')}
                  className="gap-2"
                >
                  <Rocket className="h-5 w-5" />
                  Começar a Usar
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
