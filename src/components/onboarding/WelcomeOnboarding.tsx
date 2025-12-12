import { useEffect, useState, useCallback, useMemo } from "react";;
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Ship, 
  Shield, 
  Users, 
  BarChart3, 
  Settings, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Rocket
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao Nautilus One",
    description: "Sistema corporativo completo para gestão marítima com IA avançada, compliance e analytics em tempo real.",
    icon: Ship,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "modules",
    title: "Módulos Inteligentes",
    description: "Acesse MMI, Crew Management, PEOTRAM, ESG e mais de 50 módulos especializados para sua operação.",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "security",
    title: "Segurança & Compliance",
    description: "Políticas RLS, auditoria completa e conformidade com IMCA, IMO e regulamentações marítimas.",
    icon: Shield,
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "analytics",
    title: "Analytics em Tempo Real",
    description: "Dashboards executivos, KPIs, métricas de performance e relatórios automatizados.",
    icon: BarChart3,
    color: "from-orange-500 to-amber-500"
  },
  {
    id: "ready",
    title: "Tudo Pronto!",
    description: "Seu sistema está configurado. Explore os módulos e comece a transformar sua operação.",
    icon: Rocket,
    color: "from-indigo-500 to-blue-500"
  }
];

const STORAGE_KEY = "nautilus_onboarding_completed";

export const WelcomeOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setIsVisible(true);
    } else {
      setIsCompleted(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    });
  });

  const handleSkip = () => {
    handleComplete();
  });

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
    setIsCompleted(true);
  });

  if (isCompleted || !isVisible) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  const Icon = step.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg mx-4"
          >
            <Card className="border-primary/20 shadow-2xl overflow-hidden">
              {/* Header gradient */}
              <div className={`h-2 bg-gradient-to-r ${step.color}`} />
              
              <CardContent className="p-8">
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Passo {currentStep + 1} de {ONBOARDING_STEPS.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>

                {/* Icon */}
                <motion.div
                  key={step.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200 }}
                  className="flex justify-center mb-6"
                >
                  <div className={`p-4 rounded-full bg-gradient-to-br ${step.color}`}>
                    <Icon className="h-12 w-12 text-white" />
                  </div>
                </motion.div>

                {/* Content */}
                <motion.div
                  key={`content-${step.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>

                {/* Step indicators */}
                <div className="flex justify-center gap-2 mb-8">
                  {ONBOARDING_STEPS.map((_, index) => (
                    <button
                      key={index}
                      onClick={handleSetCurrentStep}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentStep 
                          ? "w-6 bg-primary" 
                          : index < currentStep 
                            ? "bg-primary/60" 
                            : "bg-muted"
                      }`}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {currentStep < ONBOARDING_STEPS.length - 1 && (
                    <Button 
                      variant="ghost" 
                      onClick={handleSkip}
                      className="flex-1"
                    >
                      Pular
                    </Button>
                  )}
                  <Button 
                    onClick={handleNext}
                    className={`flex-1 bg-gradient-to-r ${step.color} hover:opacity-90`}
                  >
                    {currentStep === ONBOARDING_STEPS.length - 1 ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Começar
                      </>
                    ) : (
                      <>
                        Próximo
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook para resetar onboarding (útil para testes)
export const useResetOnboarding = memo(() => {
  return () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  });
});

export default WelcomeOnboarding;
