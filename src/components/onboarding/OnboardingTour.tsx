/**
 * Onboarding Tour Component
 * Interactive guided tour for new users
 * UX COMPLETENESS - P2 ITEM
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, ChevronLeft, Check, 
  Sparkles, Ship, Users, FileText, 
  Shield, Brain, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector
  route?: string; // Route to navigate to
  icon?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
}

const DEFAULT_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao NAUTI ONE! 🚢',
    description: 'Este é o seu centro de comando marítimo. Vamos fazer um tour rápido pelas funcionalidades principais.',
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    position: 'center',
  },
  {
    id: 'dashboard',
    title: 'Dashboard Principal',
    description: 'Aqui você tem uma visão geral de toda a operação: embarcações, tripulação, documentos e alertas.',
    route: '/',
    icon: <Ship className="h-6 w-6" />,
    position: 'center',
  },
  {
    id: 'operations',
    title: 'Operations Command',
    description: 'Centro unificado de operações marítimas, viagens, missões e logística.',
    route: '/operations-command',
    icon: <Ship className="h-6 w-6" />,
    position: 'center',
  },
  {
    id: 'people',
    title: 'People Hub',
    description: 'Gestão completa de tripulação: recrutamento, treinamento, bem-estar e compliance.',
    route: '/people-hub',
    icon: <Users className="h-6 w-6" />,
    position: 'center',
  },
  {
    id: 'documents',
    title: 'Document Center',
    description: 'Todos os documentos, templates, checklists e relatórios em um só lugar.',
    route: '/document-center',
    icon: <FileText className="h-6 w-6" />,
    position: 'center',
  },
  {
    id: 'compliance',
    title: 'Compliance Hub',
    description: 'Auditorias, certificações, regulamentos e gestão de riscos.',
    route: '/compliance-hub',
    icon: <Shield className="h-6 w-6" />,
    position: 'center',
  },
  {
    id: 'ai',
    title: 'AI Control Tower',
    description: 'Inteligência artificial para otimização de operações, documentos e análises.',
    route: '/ai-control-tower',
    icon: <Brain className="h-6 w-6" />,
    position: 'center',
  },
  {
    id: 'complete',
    title: 'Pronto para começar! 🎉',
    description: 'Você completou o tour! Explore cada módulo para descobrir todas as funcionalidades.',
    icon: <Check className="h-8 w-8 text-green-500" />,
    position: 'center',
  },
];

interface OnboardingTourProps {
  steps?: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  storageKey?: string;
}

export function OnboardingTour({
  steps = DEFAULT_STEPS,
  onComplete,
  onSkip,
  storageKey = 'nauti-onboarding-complete',
}: OnboardingTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if tour was completed before
  useEffect(() => {
    const isComplete = localStorage.getItem(storageKey);
    if (!isComplete) {
      // Delay to let the app load
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const handleNext = useCallback(() => {
    const nextStep = currentStep + 1;
    
    if (nextStep >= steps.length) {
      handleComplete();
      return;
    }

    setCurrentStep(nextStep);
    
    // Navigate if step has route
    const step = steps[nextStep];
    if (step.route && step.route !== location.pathname) {
      navigate(step.route);
    }
    
    // Execute custom action
    if (step.action) {
      step.action();
    }
  }, [currentStep, steps, location.pathname, navigate]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      const step = steps[prevStep];
      if (step.route && step.route !== location.pathname) {
        navigate(step.route);
      }
    }
  }, [currentStep, steps, location.pathname, navigate]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(storageKey, 'true');
    setIsOpen(false);
    onComplete?.();
  }, [storageKey, onComplete]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(storageKey, 'true');
    setIsOpen(false);
    onSkip?.();
  }, [storageKey, onSkip]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    if (e.key === 'Escape') handleSkip();
    if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
  }, [isOpen, handleSkip, handleNext, handlePrev]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleSkip}
        />

        {/* Tour Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            "relative z-10 w-full max-w-lg mx-4",
            "bg-card rounded-2xl shadow-2xl border overflow-hidden"
          )}
        >
          {/* Progress */}
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Passo {currentStep + 1} de {steps.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleSkip}
                aria-label="Pular tour"
                title="Pular"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Progress value={progress} className="h-1" />
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Icon */}
            <motion.div
              key={step.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="mb-6 flex justify-center"
            >
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                {step.icon || <Sparkles className="h-8 w-8 text-primary" />}
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              key={`title-${step.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-bold mb-3"
            >
              {step.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              key={`desc-${step.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground leading-relaxed"
            >
              {step.description}
            </motion.p>
          </div>

          {/* Actions */}
          <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Pular tour
            </Button>

            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
              )}
              
              <Button onClick={handleNext}>
                {isLastStep ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Começar
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Keyboard hints */}
          <div className="px-4 pb-3 text-center">
            <span className="text-xs text-muted-foreground">
              Use ← → para navegar • ESC para sair
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to trigger tour manually
export function useOnboardingTour(storageKey = 'nauti-onboarding-complete') {
  const [showTour, setShowTour] = useState(false);

  const startTour = useCallback(() => {
    localStorage.removeItem(storageKey);
    setShowTour(true);
  }, [storageKey]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const isTourComplete = useCallback(() => {
    return localStorage.getItem(storageKey) === 'true';
  }, [storageKey]);

  return {
    showTour,
    setShowTour,
    startTour,
    resetTour,
    isTourComplete,
  };
}

export default OnboardingTour;
