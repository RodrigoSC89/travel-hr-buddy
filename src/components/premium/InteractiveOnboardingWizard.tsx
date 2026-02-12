/**
 * Interactive Onboarding Wizard - Premium Component
 * Guia interativo de onboarding para novos usuários
 */

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Ship, Users, Wrench, FileText, Shield, Activity, 
  DollarSign, Brain, Stethoscope, Recycle, Plane,
  ChevronRight, ChevronLeft, CheckCircle2, Sparkles,
  Play, SkipForward, Award, Rocket, Target, Lightbulb
} from "lucide-react";
import { toast } from "sonner";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  features: string[];
  tip?: string;
}

interface InteractiveOnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao Nautilus One",
    description: "Sua plataforma completa de gestão marítima com inteligência artificial",
    icon: Rocket,
    color: "from-primary to-blue-600",
    features: [
      "Gestão unificada de toda a operação marítima",
      "Inteligência artificial integrada em todos os módulos",
      "Compliance automático com normas internacionais",
      "Acesso offline para operações embarcadas"
    ],
    tip: "Use Ctrl+K para acessar ações rápidas a qualquer momento"
  },
  {
    id: "operations",
    title: "Operations Command",
    description: "Centro de controle operacional da sua frota",
    icon: Ship,
    color: "from-blue-500 to-cyan-500",
    features: [
      "Monitoramento em tempo real de embarcações",
      "Rastreamento AIS e telemetria",
      "Gestão de viagens e escalas",
      "Dashboard de KPIs operacionais"
    ],
    tip: "Clique nas embarcações no mapa para ver detalhes instantâneos"
  },
  {
    id: "people",
    title: "People Hub",
    description: "Gestão completa de tripulação e equipes",
    icon: Users,
    color: "from-green-500 to-emerald-500",
    features: [
      "Cadastro e documentação de tripulantes",
      "Gestão de certificações STCW",
      "Escalas e embarques",
      "Bem-estar e fadiga da tripulação"
    ],
    tip: "O sistema alerta automaticamente sobre certificados vencendo"
  },
  {
    id: "maintenance",
    title: "Manutenção Inteligente",
    description: "Planejamento preditivo e preventivo",
    icon: Wrench,
    color: "from-orange-500 to-amber-500",
    features: [
      "Manutenção preventiva programada",
      "Predição de falhas com IA",
      "Gestão de estoque de peças",
      "Integração com class societies"
    ],
    tip: "A IA analisa padrões para prever falhas antes que aconteçam"
  },
  {
    id: "compliance",
    title: "Compliance & Audits",
    description: "Conformidade regulatória automatizada",
    icon: Shield,
    color: "from-purple-500 to-violet-500",
    features: [
      "ISM, ISPS, MLC 2006, MARPOL",
      "Gestão de certificados e vencimentos",
      "Preparação para auditorias",
      "Findings e ações corretivas"
    ],
    tip: "Receba alertas 90, 60 e 30 dias antes de vencimentos"
  },
  {
    id: "finance",
    title: "Finance Command",
    description: "Controle financeiro integrado",
    icon: DollarSign,
    color: "from-emerald-500 to-teal-500",
    features: [
      "OPEX por embarcação",
      "Aprovações de despesas",
      "Voyage accounting",
      "Análise de custos com IA"
    ],
    tip: "A IA identifica oportunidades de economia automaticamente"
  },
  {
    id: "ai",
    title: "AI Control Tower",
    description: "Inteligência artificial em todo o sistema",
    icon: Brain,
    color: "from-pink-500 to-rose-500",
    features: [
      "Assistente virtual especializado",
      "Análise preditiva de dados",
      "Recomendações automatizadas",
      "Processamento de documentos"
    ],
    tip: "Pergunte ao assistente IA sobre qualquer aspecto da operação"
  },
  {
    id: "complete",
    title: "Pronto para começar!",
    description: "Você está preparado para explorar o Nautilus One",
    icon: Award,
    color: "from-yellow-500 to-orange-500",
    features: [
      "✓ Navegue pelos módulos no menu lateral",
      "✓ Use Ctrl+K para ações rápidas",
      "✓ Clique no ? em cada módulo para ajuda",
      "✓ A IA está disponível 24/7 para auxiliar"
    ],
    tip: "Explore cada módulo - há tutoriais contextuais em cada um"
  }
];

export function InteractiveOnboardingWizard({ 
  open, 
  onOpenChange, 
  onComplete 
}: InteractiveOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("nautilus_onboarding_completed", "true");
    toast.success("Bem-vindo ao Nautilus One! 🚢", {
      description: "Explore os módulos e descubra todas as funcionalidades."
    });
    onComplete?.();
    onOpenChange(false);
  };

  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-muted">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {onboardingSteps.map((s, idx) => (
                <motion.div
                  key={`step-dot-${s.title}`}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentStep 
                      ? "bg-primary" 
                      : completedSteps.has(idx) 
                        ? "bg-primary/50" 
                        : "bg-muted"
                  }`}
                  animate={idx === currentStep ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                />
              ))}
            </div>
            <Badge variant="secondary">
              {currentStep + 1} de {onboardingSteps.length}
            </Badge>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Icon */}
              <div className="flex justify-center">
                <motion.div 
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="h-10 w-10 text-white" />
                </motion.div>
              </div>

              {/* Title & Description */}
              <div className="text-center">
                <h2 className="text-2xl font-bold">{step.title}</h2>
                <p className="text-muted-foreground mt-2">{step.description}</p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {step.features.map((feature, fIdx) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: fIdx * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Tip */}
              {step.tip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20"
                >
                  <Lightbulb className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-primary">Dica Pro</p>
                    <p className="text-sm text-muted-foreground">{step.tip}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Pular Tour
            </Button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              )}
              <Button onClick={handleNext} className="gap-2">
                {isLastStep ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Começar a Usar
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default InteractiveOnboardingWizard;
