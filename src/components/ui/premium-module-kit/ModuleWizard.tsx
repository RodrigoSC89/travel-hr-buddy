/**
 * Module Wizard - Assistente passo a passo
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, ChevronRight, Check, X,
  type LucideIcon 
} from "lucide-react";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  content: React.ReactNode;
  isValid?: boolean;
  isOptional?: boolean;
}

interface ModuleWizardProps {
  title: string;
  steps: WizardStep[];
  onComplete: () => void;
  onCancel?: () => void;
  initialStep?: number;
  allowSkip?: boolean;
}

export function ModuleWizard({
  title,
  steps,
  onComplete,
  onCancel,
  initialStep = 0,
  allowSkip = false
}: ModuleWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    setCompletedSteps(prev => new Set(prev).add(step.id));
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const canProceed = step.isValid !== false;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Fechar wizard" title="Fechar">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Progress */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Passo {currentStep + 1} de {steps.length}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {steps.map((s, index) => {
            const isActive = index === currentStep;
            const isCompleted = completedSteps.has(s.id);
            const Icon = s.icon;

            return (
              <button
                key={s.id}
                onClick={() => index < currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                  ${isActive 
                    ? "border-primary bg-primary text-primary-foreground" 
                    : isCompleted 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-muted bg-muted text-muted-foreground"
                  }
                  ${index < currentStep ? "cursor-pointer hover:bg-primary/20" : "cursor-default"}
                `}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : Icon ? (
                  <Icon className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Step Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{step.title}</h3>
            {step.isOptional && (
              <Badge variant="outline" className="text-xs">
                Opcional
              </Badge>
            )}
          </div>
          {step.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {step.description}
            </p>
          )}
        </div>

        {/* Step Content */}
        <div className="min-h-[200px]">
          {step.content}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          {allowSkip && step.isOptional && !isLastStep && (
            <Button variant="ghost" onClick={handleSkip}>
              Pular
            </Button>
          )}
          <Button onClick={handleNext} disabled={!canProceed}>
            {isLastStep ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Concluir
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
