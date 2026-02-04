/**
 * Module Onboarding Component
 * Onboarding interativo para módulos do sistema
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle } from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
}

interface ModuleOnboardingProps {
  moduleId: string;
  moduleName: string;
  steps: OnboardingStep[];
  onComplete?: () => void;
  className?: string;
}

export const ModuleOnboarding: React.FC<ModuleOnboardingProps> = ({
  moduleId,
  moduleName,
  steps,
  onComplete,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const storageKey = `onboarding_${moduleId}_completed`;
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      setIsVisible(true);
    }
  }, [moduleId]);

  const handleComplete = () => {
    localStorage.setItem(`onboarding_${moduleId}_completed`, 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const handleNext = () => {
    setCompletedSteps(prev => [...prev, currentStep]);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible || steps.length === 0) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`mb-6 ${className}`}
      >
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Bem-vindo ao {moduleName}
                </Badge>
                <Badge variant="outline">
                  {currentStep + 1} / {steps.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                {step.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-muted-foreground mb-3">{step.description}</p>
                {step.tip && (
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    💡 <strong>Dica:</strong> {step.tip}
                  </div>
                )}
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 my-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'w-8 bg-primary' 
                      : completedSteps.includes(index)
                      ? 'w-2 bg-primary/50'
                      : 'w-2 bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSkip}>
                  Pular Tour
                </Button>
                <Button onClick={handleNext}>
                  {currentStep === steps.length - 1 ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
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
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModuleOnboarding;
