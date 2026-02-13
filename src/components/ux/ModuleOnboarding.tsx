/**
 * ModuleOnboarding - Componente de boas-vindas e tour guiado para módulos
 * Oferece experiência premium de primeira visita com dicas contextuais
 */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Target,
  CheckCircle2,
  Play,
  HelpCircle,
} from "lucide-react";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ModuleOnboardingProps {
  moduleKey: string;
  moduleName: string;
  steps: OnboardingStep[];
  onComplete?: () => void;
  showOnFirstVisit?: boolean;
}

export function ModuleOnboarding({
  moduleKey,
  moduleName,
  steps,
  onComplete,
  showOnFirstVisit = true,
}: ModuleOnboardingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const storageKey = `nautilus_onboarding_${moduleKey}`;

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen && showOnFirstVisit) {
      setIsVisible(true);
    }
    setHasSeenOnboarding(!!seen);
  }, [storageKey, showOnFirstVisit]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, "true");
    setIsVisible(false);
    setHasSeenOnboarding(true);
    onComplete?.();
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsVisible(true);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground hover:text-primary"
        onClick={handleRestart}
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Ver Tutorial</span>
      </Button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <Card className="w-full max-w-lg mx-4 shadow-2xl border-primary/20">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{moduleName}</h3>
                  <p className="text-xs text-muted-foreground">
                    Passo {currentStep + 1} de {steps.length}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleComplete}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress */}
            <Progress value={progress} className="h-1 mb-6" />

            {/* Content */}
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2">{step.title}</h4>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>

              {step.tip && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/50 border border-accent">
                  <Lightbulb className="h-4 w-4 text-warning mt-0.5" />
                  <p className="text-sm text-muted-foreground">{step.tip}</p>
                </div>
              )}

              {step.action && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={step.action.onClick}
                >
                  <Play className="h-4 w-4" />
                  {step.action.label}
                </Button>
              )}
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div
                    key={`step-dot-${i}`}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentStep
                        ? "bg-primary"
                        : i < currentStep
                        ? "bg-primary/50"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <Button onClick={handleNext} className="gap-1">
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Concluir
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * QuickActionsBar - Barra de ações rápidas para módulos
 */
interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "success" | "warning" | "danger";
  badge?: string | number;
}

interface QuickActionsBarProps {
  actions: QuickAction[];
  className?: string;
}

export function QuickActionsBar({ actions, className = "" }: QuickActionsBarProps) {
  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case "success":
        return "bg-green-500/10 hover:bg-green-500/20 text-green-600 border-green-500/30";
      case "warning":
        return "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border-amber-500/30";
      case "danger":
        return "bg-red-500/10 hover:bg-red-500/20 text-red-600 border-red-500/30";
      default:
        return "bg-primary/10 hover:bg-primary/20 text-primary border-primary/30";
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {actions.map((action) => (
        <motion.button
          key={action.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${getVariantClasses(
            action.variant
          )}`}
        >
          {action.icon}
          <span className="font-medium text-sm">{action.label}</span>
          {action.badge !== undefined && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {action.badge}
            </Badge>
          )}
        </motion.button>
      ))}
    </div>
  );
}

/**
 * FeatureHighlight - Destaque de funcionalidade nova ou importante
 */
interface FeatureHighlightProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isNew?: boolean;
  onDismiss?: () => void;
}

export function FeatureHighlight({
  title,
  description,
  icon,
  isNew = false,
  onDismiss,
}: FeatureHighlightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20"
    >
      {isNew && (
        <Badge className="absolute -top-2 -right-2 bg-primary">
          <Sparkles className="h-3 w-3 mr-1" />
          Novo
        </Badge>
      )}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        {onDismiss && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
