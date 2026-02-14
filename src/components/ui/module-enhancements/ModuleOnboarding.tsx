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
  moduleId?: string;
  moduleName: string;
  steps: OnboardingStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  className?: string;
}

export const ModuleOnboarding: React.FC<ModuleOnboardingProps> = ({
  moduleId,
  moduleName,
  steps,
  onComplete,
  onSkip,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleComplete = () => {
    if (moduleId) {
      localStorage.setItem(`onboarding_${moduleId}_completed`, 'true');
    }
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

  const handleSkipClick = () => {
    if (onSkip) {
      onSkip();
    } else {
      handleComplete();
    }
  };

  if (steps.length === 0) return null;

  const step = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm ${className}`}
    >
      <Card className="w-full max-w-lg mx-4 bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 shadow-2xl">
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
              onClick={handleSkipClick}
              className="h-8 w-8"
              aria-label="Pular onboarding"
              title="Pular"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col items-center text-center gap-4 py-6">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              {step.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
            {step.tip && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm w-full">
                💡 <strong>Dica:</strong> {step.tip}
              </div>
            )}
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 my-4">
            {steps.map((_, stepIdx) => (
              <div
                key={`step-dot-${stepIdx}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  stepIdx === currentStep 
                    ? 'w-8 bg-primary' 
                    : completedSteps.includes(stepIdx)
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
              <Button variant="outline" onClick={handleSkipClick}>
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
  );
};

export default ModuleOnboarding;
