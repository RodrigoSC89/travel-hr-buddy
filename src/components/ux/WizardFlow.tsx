/**
 * WizardFlow - Fluxo guiado passo-a-passo para tarefas complexas
 * Ideal para criação de registros, configurações e processos multi-etapa
 */
import React, { useState, useCallback } from "react";
import { logger } from "@/lib/logger";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  AlertCircle,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  validation?: () => boolean | Promise<boolean>;
  optional?: boolean;
}

interface WizardFlowProps {
  title: string;
  subtitle?: string;
  steps: WizardStep[];
  onComplete: () => void | Promise<void>;
  onCancel?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allowSkipOptional?: boolean;
  showProgressBar?: boolean;
  completeLabel?: string;
}

export function WizardFlow({
  title,
  subtitle,
  steps,
  onComplete,
  onCancel,
  open,
  onOpenChange,
  allowSkipOptional = true,
  showProgressBar = true,
  completeLabel = "Concluir",
}: WizardFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isValidating, setIsValidating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const validateCurrentStep = useCallback(async () => {
    if (!step.validation) return true;

    setIsValidating(true);
    setValidationError(null);

    try {
      const isValid = await step.validation();
      if (!isValid) {
        setValidationError("Por favor, preencha todos os campos obrigatórios.");
        return false;
      }
      return true;
    } catch (error) {
      setValidationError("Erro ao validar. Tente novamente.");
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [step]);

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setCompletedSteps((prev) => new Set(prev).add(currentStep));

    if (isLastStep) {
      setIsCompleting(true);
      try {
        await onComplete();
        handleClose();
      } catch (error) {
        logger.error("Error completing wizard:", error);
      } finally {
        setIsCompleting(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
      setValidationError(null);
    }
  };

  const handleSkip = () => {
    if (step.optional && allowSkipOptional && !isLastStep) {
      setCurrentStep(currentStep + 1);
      setValidationError(null);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setValidationError(null);
    onOpenChange(false);
    onCancel?.();
  };

  const handleStepClick = (index: number) => {
    // Only allow navigation to completed steps or current step
    if (completedSteps.has(index) || index === currentStep) {
      setCurrentStep(index);
      setValidationError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {title}
              </DialogTitle>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-0">
          {/* Step Indicators */}
          <div className="flex items-center justify-between py-4 overflow-x-auto">
            {steps.map((s, index) => {
              const isCompleted = completedSteps.has(index);
              const isCurrent = index === currentStep;
              const isClickable = isCompleted || isCurrent;

              return (
                <React.Fragment key={s.id}>
                  <button
                    onClick={() => handleStepClick(index)}
                    disabled={!isClickable}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors min-w-fit ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                        ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        : "bg-muted text-muted-foreground"
                    } ${isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isCurrent
                          ? "bg-primary-foreground text-primary"
                          : "bg-muted-foreground/20 text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">{s.title}</span>
                    {s.optional && (
                      <Badge variant="outline" className="text-xs">
                        Opcional
                      </Badge>
                    )}
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        completedSteps.has(index) ? "bg-green-500" : "bg-border"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Progress Bar */}
          {showProgressBar && (
            <Progress value={progress} className="h-1 mb-4" />
          )}
        </div>

        {/* Step Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[50vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step.description && (
                <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
              )}
              {step.content}

              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-red-500/10 text-red-600 text-sm"
                >
                  <AlertCircle className="h-4 w-4" />
                  {validationError}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-4 border-t bg-muted/30">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="ghost" onClick={handlePrev} disabled={isFirstStep}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
          </div>

          <div className="flex gap-2">
            {step.optional && allowSkipOptional && !isLastStep && (
              <Button variant="ghost" onClick={handleSkip}>
                Pular
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            <Button onClick={handleNext} disabled={isValidating || isCompleting}>
              {isValidating || isCompleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isCompleting ? "Salvando..." : "Validando..."}
                </>
              ) : isLastStep ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {completeLabel}
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
      </DialogContent>
    </Dialog>
  );
}

/**
 * StepContent - Wrapper para conteúdo de step com layout padronizado
 */
interface StepContentProps {
  children: React.ReactNode;
  className?: string;
}

export function StepContent({ children, className = "" }: StepContentProps) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

/**
 * StepField - Campo de formulário padronizado para wizards
 */
interface StepFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function StepField({ label, required, hint, error, children }: StepFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
